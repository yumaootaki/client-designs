// 共通部品ローダー（ヘッダー／フッターを全ページで共有）
// ・自身の <script src> の深さから BASE（../ の数）を自動判定
// ・splash / .hdr is-dark / rail ラベル / 現在ページ強調を URL から自動制御（ページ個別設定は不要）
// ・注入完了後に main.js を動的ロード（イベント結線を確実にするため）
(function () {
  'use strict';
  var SLOGAN = '職人らしさで、塗り替える。';
  var SHORT = '月岡塗装店';

  // --- BASE（階層プレフィックス）を自身の src から求める ---
  var me = document.currentScript;
  if (!me) {
    var ss = document.getElementsByTagName('script');
    for (var i = ss.length - 1; i >= 0; i--) {
      if (/js\/include\.js(\?|$)/.test(ss[i].getAttribute('src') || '')) { me = ss[i]; break; }
    }
  }
  var src = (me && me.getAttribute('src')) || 'js/include.js';
  var BASE = src.slice(0, src.indexOf('js/include.js')); // '' | '../' | '../../'
  var DEPTH = (BASE.match(/\.\.\//g) || []).length;

  // --- サイトのルートを自身の階層から算出（サブディレクトリ配信・GitHub Pages 対応） ---
  function siteRoot() {
    var seg = location.pathname.split('/');
    var last = seg[seg.length - 1];
    if (last === '' || /\.html?$/.test(last)) seg.pop();
    for (var i = 0; i < DEPTH; i++) seg.pop();
    var r = seg.join('/');
    return r.charAt(r.length - 1) === '/' ? r.slice(0, -1) : r;
  }
  var ROOT = siteRoot();

  // --- 任意のパスを「サイト直下からのルート」に正規化（/work など） ---
  function routeOf(pathname) {
    var p = pathname;
    if (ROOT && p.indexOf(ROOT) === 0) p = p.slice(ROOT.length);
    p = p.replace(/index\.html$/, '').replace(/\/+$/, '');
    return p === '' ? '/' : p;
  }
  var R = routeOf(location.pathname);
  var isHome = (R === '/');

  function applyTpl(t) { return t.replace(/\{\{BASE\}\}/g, BASE); }
  function get(url) { return fetch(url).then(function (r) { return r.text(); }); }

  function markCurrent(scope) {
    scope.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!href || /^(https?:|tel:|mailto:|#)/.test(href)) return;
      var target = routeOf(a.pathname);
      if (target === R || (target !== '/' && R.indexOf(target + '/') === 0)) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  var hMount = document.getElementById('site-header');
  var fMount = document.getElementById('site-footer');
  var jobs = [];

  if (hMount) {
    jobs.push(get(BASE + 'partials/header.html').then(function (t) {
      hMount.innerHTML = applyTpl(t);
      var sp = hMount.querySelector('#splash');
      if (sp && !isHome) sp.remove();
      var hdr = hMount.querySelector('.hdr');
      if (hdr && !isHome) hdr.classList.add('is-dark');
      var rail = hMount.querySelector('.rail-section');
      if (rail) {
        if (isHome) { rail.textContent = SLOGAN; }
        else {
          var t2 = document.querySelector('.page-hdr-title') || document.querySelector('.lower-hdr-title');
          rail.textContent = t2 ? t2.textContent.trim() : SHORT;
        }
      }
      markCurrent(hMount);
    }));
  }
  if (fMount) {
    jobs.push(get(BASE + 'partials/footer.html').then(function (t) {
      fMount.innerHTML = applyTpl(t);
      markCurrent(fMount);
    }));
  }

  function loadMain() {
    var s = document.createElement('script');
    s.src = BASE + 'js/main.js?v=5';
    document.body.appendChild(s);
  }
  Promise.all(jobs).then(loadMain).catch(function (e) { console.error('[include] ', e); loadMain(); });
})();
