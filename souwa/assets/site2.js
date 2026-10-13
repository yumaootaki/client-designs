
(function () {
  'use strict';
  var R = document.documentElement;

  /* --- 安全装置2: ここは同期。幕が描かれる前にクラスを付ける（後出しだと一瞬出てしまう） --- */
  R.classList.add('js-load');

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ============================================================
     ① ローディング幕（トップのみ）
        state: loading → transition → completed（completed で display:none）
        window.SOUWA_LOADER で演出と時間を差し替えられる
          dwell   … 最低表示時間(ms)  out … 'wipe'|'fade'|'blur'|'scale'|'slide'
          session … true で同一セッション2回目以降スキップ
        確認: ?debug=loading で必ず再生
     ============================================================ */
  window.SOUWA_LOADER = window.SOUWA_LOADER || { dwell: 2400, out: 'wipe', session: false };

  function initLoader() {
    var CONF = window.SOUWA_LOADER;
    var el = document.getElementById('site-loader');
    var isTop = true; /* 幕はTOPにだけ置く運用。置いたページでは常に再生 */
    var debug = location.search.indexOf('debug=loading') > -1 || location.search.indexOf('load=1') > -1;

    function fireHero() {
      // ヒーローの登場は幕が開いたときだけ（裏で終わらせない）
      var items = [].slice.call(document.querySelectorAll('[data-hero]'));
      items.forEach(function (n, i) { n.style.setProperty('--hd', (i * 0.12) + 's'); });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          R.classList.add('is-hero-in');
          document.dispatchEvent(new CustomEvent('souwa:loaded'));
        });
      });
    }
    // 幕が無いページ（下層）／トップ以外は、幕を待たずにヒーローを出す
    if (!el || (!isTop && !debug)) { fireHero(); return; }

    function finish() {
      if (el.dataset.state === 'completed') return;
      el.dataset.state = 'completed';
      el.style.display = 'none';
      R.classList.remove('is-loading');
    }
    function out() {
      if (el.dataset.state !== 'loading') return;
      el.dataset.state = 'transition';
      R.classList.remove('is-loading');
      fireHero();
      setTimeout(finish, reduce ? 0 : 1000);
    }

    el.dataset.out = CONF.out || 'wipe';

    var skip = false;
    try { skip = !debug && CONF.session && sessionStorage.getItem('souwa-loaded'); } catch (e) {}
    if (reduce || skip) { finish(); fireHero(); return; }

    R.classList.add('is-loading');
    try { sessionStorage.setItem('souwa-loaded', '1'); } catch (e) {}

    var dwell = Math.max(2000, Math.min(8000, CONF.dwell | 0));
    var t0 = Date.now(), ready = false;
    function tryOut() { if (ready) setTimeout(out, Math.max(0, dwell - (Date.now() - t0))); }
    if (document.readyState === 'complete') { ready = true; tryOut(); }
    else addEventListener('load', function () { ready = true; tryOut(); });
    setTimeout(function () { ready = true; tryOut(); }, dwell + 4000); // 保険（load が来なくても必ず開ける）
  }

  /* ============================================================
     ② 表示アニメーション
        画面に入った時点で1回だけ再生。同じセクション内は 70ms ずつ遅らせる。
        通り過ぎた要素（一気にスクロールされた場合）はアニメーションなしで即表示。
     ============================================================ */
  function initReveal() {
    R.classList.add('js-rv');
    document.querySelectorAll('[data-ph]').forEach(function (f) {
      if (!f.hasAttribute('data-reveal') && !f.classList.contains('site-hz__media')) f.setAttribute('data-reveal', 'wipe');
    });
    var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;
    items.forEach(function (el) {
      var sec = el.closest('section,footer,.site-hz') || document.body;
      if (sec.__n == null) sec.__n = 0;
      // 下線は本文より遅く、間隔も広く（上から順に流れて見えるように）
      if (el.classList.contains('ult')) { el.style.setProperty('--d', '0.22s'); return; }
      if (el.classList.contains('ul')) { if (sec.__u == null) sec.__u = 0; el.style.setProperty('--d', (0.1 + sec.__u++ * 0.22) + 's'); return; }
      el.style.setProperty('--d', (Math.min(sec.__n++, 6) * 0.07) + 's');
    });
    var q = false;
    function check() {
      q = false;
      var vh = innerHeight;
      items = items.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0) { el.style.animation = 'none'; el.classList.add('is-in'); return false; }
        if (r.top < vh * 0.88) { el.classList.add('is-in'); return false; }
        return true;
      });
      if (!items.length) { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); }
    }
    function onScroll() { if (!q) { q = true; requestAnimationFrame(check); } }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    // 幕の裏で再生し終わるのを防ぐ（幕が開いてから判定を始める）
    if (R.classList.contains('is-loading')) document.addEventListener('souwa:loaded', check, { once: true });
    else check();
  }

  /* ============================================================
     ③ 配置写真のパララックス
        枠は動かさず、枠の内側の写真面だけを動かす。
        ★動きの強さは AMP（枠の高さに対する割合）。0 にすれば止まる。
     ============================================================ */
  function initParallax() {
    if (reduce) return;
    var AMP = 0.075;
    var sel = [
      '.site-split:not(.site-split--band) .site-split__media.ph-set',
      '.site-duo__fig.ph-set',
      '.site-panel__media.ph-set',
      '.site-blog__thumb.ph-set',
      '.site-hist__fig.ph-set'
    ].join(',');
    var targets = [].slice.call(document.querySelectorAll(sel))
      // ★動かせる層（.plx__i）を**元から持っている枠だけ**を対象にする（2026-09-17 修正）
      //   受領デザインには2種類の枠がある:
      //     ① <div class="…__media ph-set"><span class="plx__i"><img class="baked-img"> … 動かせる
      //     ② <div class="…__media ph-set"><span class="imgslot"><img class="baked-img">  … 焼き込み版・動かさない
      //   旧版は②にも .plx を付け、空の .plx__i を作っていた。すると site.css の
      //     `.plx > *:not(.plx__i){ position: relative; z-index: 1; }`  （詳細度 0,2,0）
      //   が `.imgslot{ position: absolute; inset: 0; }`（0,1,0）に競り勝って .imgslot が
      //   **relative かつ中身が絶対配置＝高さ0** になり、写真が 0×0 で消えていた。
      //   実測（/recruit・2026-09-17）: rec-evening.webp / rec-daysoff.webp が 0×0。
      //   納品物の全ページで該当は13箇所（05b・06〜12）。
      //   ②は動かす層が無い＝そもそもパララックスできないので、触らないのが正しい。
      .filter(function (box) { return !!box.querySelector(':scope > .plx__i'); })
      .map(function (box) {
        box.classList.add('plx');
        // 絶対配置の枠（またぎ写真・重ね写真）の position は絶対に奪わない
        if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
        return { box: box, inner: box.querySelector(':scope > .plx__i') };
      });
    if (!targets.length) return;
    var q = false;
    function frame() {
      q = false;
      var vh = innerHeight;
      targets.forEach(function (t) {
        var r = t.box.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        // 枠が画面を通過する進度 -1〜1 を、写真面の移動量に変える
        var prog = ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2);
        prog = Math.max(-1, Math.min(1, prog)); // 面の余白（9%）を超えないように留める
        t.inner.style.transform = 'translate3d(0,' + (prog * r.height * AMP).toFixed(2) + 'px,0)';
      });
    }
    function onScroll() { if (!q) { q = true; requestAnimationFrame(frame); } }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    frame();
  }

  onReady(function () {
    try { initLoader(); } catch (e) {}
    try { initReveal(); } catch (e) {}
    try { initParallax(); } catch (e) {}
  });
})();




/* 安全装置：何があっても5秒で幕を外す */
(function(){var t=function(){var el=document.getElementById('site-loader');if(el&&el.dataset.state!=='completed'){el.dataset.state='completed';el.style.display='none';document.documentElement.classList.remove('is-loading');document.documentElement.classList.add('is-hero-in');}};window.addEventListener('load',function(){setTimeout(t,5000);});setTimeout(t,8000);})();
