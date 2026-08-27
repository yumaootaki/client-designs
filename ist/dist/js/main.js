// 株式会社イスト｜サイト共通 interactions
(() => {
  'use strict';

  // ブラウザのスクロール位置復元を無効化（smooth-scroll と組み合わさると
  // フッターから上へアニメーションしてしまうため）
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- フルスクリーンメニュー開閉（レール／下部バー共通） ---
  const burgers = document.querySelectorAll('.js-burger');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    burgers.forEach((b) => b.setAttribute('aria-expanded', String(open)));
  };
  burgers.forEach((b) =>
    b.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')))
  );
  document.querySelectorAll('.menu a').forEach((a) =>
    a.addEventListener('click', () => setMenu(false))
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // --- ページ上部へ戻る ---
  document.querySelectorAll('.js-top').forEach((t) =>
    t.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }))
  );

  // --- タブ切り替え ---
  document.querySelectorAll('.tabs').forEach((tabs) => {
    const btns = [...tabs.querySelectorAll('.tab-btn')];
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        btns.forEach((b) => {
          const panel = document.getElementById(b.getAttribute('aria-controls'));
          const on = b === btn;
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          if (panel) panel.hidden = !on;
        });
      });
    });
  });

  // --- FAQアコーディオン ---
  document.querySelectorAll('.accordion-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.closest('.accordion-item').classList.toggle('is-open');
    });
  });

  // --- スクロールリビール（data-in でワイプ＋フェード発火） ---
  // 高さがビューポートの数倍あるセクションでも必ず発火するよう、位置判定で行う
  const targets = [...document.querySelectorAll('.sec, .hero, .recruit, .features, .reason')];
  const revealCheck = () => {
    for (let i = targets.length - 1; i >= 0; i--) {
      const el = targets[i];
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.88 && r.bottom > 0) {
        el.setAttribute('data-in', '');
        targets.splice(i, 1);
      }
    }
  };
  window.addEventListener('scroll', revealCheck, { passive: true });
  window.addEventListener('resize', revealCheck);
  revealCheck();

  // --- ヒーロー：写真コラージュの独立パララックス ＋ 巨大英字マーキー ---
  // 各写真は data-speed（上下の速さ・向き）と data-dx（左右のドリフト）で個別に動く
  const heroSec = document.getElementById('hero');
  const photos = [...document.querySelectorAll('.hero-photo')];
  const mqRows = [...document.querySelectorAll('.mq')];
  if (heroSec && !reduceMotion && (photos.length || mqRows.length)) {
    let ticking = false;
    const paint = () => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const limit = heroSec.offsetHeight + vh;
      if (y > limit) return;
      photos.forEach((p) => {
        const sp = parseFloat(p.dataset.speed) || 0;
        const dx = parseFloat(p.dataset.dx) || 0;
        // 浮かび上がり：画面下端から入り始めて 40% 進んだところで定位置
        const base = p.offsetTop - y + (sp * y);
        const prog = Math.min(Math.max((vh - base) / (vh * 0.4), 0), 1);
        const rise = (1 - prog) * 56;
        p.style.opacity = (0.15 + prog * 0.85).toFixed(3);
        p.style.transform = 'translate3d(' + (dx * y * 0.045).toFixed(2) + 'px,' +
          (sp * y + rise).toFixed(2) + 'px,0)';
      });
      mqRows.forEach((r) => {
        const sp = parseFloat(r.dataset.mq) || 0;
        r.style.transform = 'translate3d(' + (sp * y).toFixed(2) + 'px,0,0)';
      });
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    paint();
  } else {
    photos.forEach((p) => p.classList.add('is-static'));
  }

  // --- 選ばれる理由：PCはスクロールジャック（REASON.04 まで送ってから解除）、SPは横スクロール ---
  const rSec = document.getElementById('reason');
  const rTrack = document.getElementById('reasonTrack');
  const rBar = document.getElementById('reasonBar');
  const rCount = document.getElementById('reasonCount');
  if (rSec && rTrack && rBar) {
    const total = rTrack.querySelectorAll('.reason-card').length;
    const pad = (n) => String(n).padStart(2, '0');
    let jack = false;
    let maxX = 0;
    const canJack = () => !reduceMotion && window.innerWidth > 960 && window.innerHeight >= 620;
    const paint = (ratio) => {
      const v = jack
        ? Math.min(1, window.innerWidth / rTrack.scrollWidth)
        : Math.max(rTrack.clientWidth / rTrack.scrollWidth, 1 / total);
      rBar.style.width = (v * 100).toFixed(2) + '%';
      rBar.style.transform = 'translateX(' + (ratio * (100 / v - 100)).toFixed(2) + '%)';
      if (rCount) {
        rCount.textContent = pad(Math.min(total, Math.round(ratio * (total - 1)) + 1)) + ' / ' + pad(total);
      }
    };
    const onMove = () => {
      if (jack) {
        const top = rSec.getBoundingClientRect().top + window.scrollY;
        const ratio = maxX > 0 ? Math.min(Math.max((window.scrollY - top) / maxX, 0), 1) : 0;
        rTrack.style.transform = 'translate3d(' + (-ratio * maxX).toFixed(1) + 'px,0,0)';
        paint(ratio);
      } else {
        const max = rTrack.scrollWidth - rTrack.clientWidth;
        paint(max > 0 ? rTrack.scrollLeft / max : 0);
      }
    };
    const layout = () => {
      jack = canJack();
      rSec.classList.toggle('is-jack', jack);
      if (jack) {
        rTrack.style.transform = 'none';
        maxX = Math.max(0, rTrack.scrollWidth - window.innerWidth + 32);
        rSec.style.height = (window.innerHeight + maxX) + 'px';
      } else {
        rSec.style.height = '';
        rTrack.style.transform = '';
        maxX = 0;
      }
      onMove();
    };
    window.addEventListener('scroll', onMove, { passive: true });
    rTrack.addEventListener('scroll', () => { if (!jack) onMove(); }, { passive: true });
    window.addEventListener('resize', layout);
    layout();

    const rBehavior = reduceMotion ? 'auto' : 'smooth';
    const cardStep = () => {
      const c = rTrack.querySelector('.reason-card');
      return c ? c.getBoundingClientRect().width + 32 : 400;
    };
    const go = (dir) => {
      if (jack) window.scrollBy({ top: dir * cardStep(), behavior: rBehavior });
      else rTrack.scrollBy({ left: dir * Math.min(rTrack.clientWidth * 0.8, 480), behavior: rBehavior });
    };
    const rp = document.getElementById('rPrev');
    const rn = document.getElementById('rNext');
    if (rp) rp.addEventListener('click', () => go(-1));
    if (rn) rn.addEventListener('click', () => go(1));
  }

  // --- 代表挨拶：スクロールに合わせて見出しの文字に色がつく ---
  const msgTitle = document.querySelector('.msg-title');
  const msgBody = document.querySelector('.msg-body');
  if (msgTitle && msgBody) {
    const chars = [];
    [...msgTitle.childNodes].forEach((n) => {
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      [...n.textContent].forEach((c) => {
        if (c === ' ' || c === '\n' || c === '\t') { frag.appendChild(document.createTextNode(c)); return; }
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        frag.appendChild(s);
        chars.push(s);
      });
      msgTitle.replaceChild(frag, n);
    });
    if (reduceMotion) {
      chars.forEach((s) => s.classList.add('is-on'));
    } else {
      const paintMsg = () => {
        const r = msgBody.getBoundingClientRect();
        const vh = window.innerHeight;
        const prog = Math.min(Math.max((vh * 0.82 - r.top) / (vh * 0.55), 0), 1);
        const n = Math.round(prog * chars.length);
        chars.forEach((s, i) => s.classList.toggle('is-on', i < n));
      };
      window.addEventListener('scroll', paintMsg, { passive: true });
      window.addEventListener('resize', paintMsg);
      paintMsg();
    }
  }

  // --- ヘッダーロゴ色切替（ヒーロー上:白 / それ以外:黒） ---
  const hdr = document.querySelector('.hdr');
  const heroEl = document.getElementById('hero');
  if (hdr && heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([e]) => hdr.classList.toggle('is-dark', !e.isIntersecting),
      { threshold: 0 }
    ).observe(heroEl);
  }

  // --- 施工実績スライダー（矢印操作） ---
  const track = document.getElementById('worksTrack');
  const prev = document.getElementById('wPrev');
  const next = document.getElementById('wNext');
  if (track && prev && next) {
    const step = () => Math.min(track.clientWidth * 0.8, 520);
    const behavior = reduceMotion ? 'auto' : 'smooth';
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior }));
  }

  // 施工実績：カテゴリ絞り込み
  const filter = document.getElementById('worksFilter');
  if (filter && track) {
    const cards = [...track.querySelectorAll('.work')];
    filter.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-cat]');
      if (!btn) return;
      const cat = btn.getAttribute('data-cat');
      filter.querySelectorAll('button').forEach((b) =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
      cards.forEach((card) => {
        const tag = (card.querySelector('.work-tag') || {}).textContent || '';
        card.hidden = !(cat === 'all' || tag.trim() === cat);
      });
      track.scrollTo({ left: 0, behavior });
    });
  }
})();

// --- プレビュー環境専用：内部絶対パスのリンクを実ファイルへ補正 ---
// （本番サーバー <例: ist-build.ltd> では /serve/ を含まないため一切作動しない）
(() => {
  'use strict';
  const i = location.pathname.indexOf('/serve/');
  if (i === -1) return;
  const base = location.origin + location.pathname.slice(0, i + 7); // 末尾は .../serve/
  const resolve = (href) => {
    let hash = '';
    const hi = href.indexOf('#');
    if (hi !== -1) { hash = href.slice(hi); href = href.slice(0, hi); }
    if (href === '/' || href === '') return base + 'index.html' + hash;
    let p = href.replace(/^\/+/, '').replace(/\/+$/, '');
    if (!/\.[a-z0-9]+$/i.test(p)) p += '/index.html';
    return base + p + hash;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href[0] !== '/' || href[1] === '/') return; // 内部絶対パスのみ
    e.preventDefault();
    window.location.href = resolve(href);
  }, true);
})();

// --- スプラッシュ（トップのみ・共通ヘッダー注入後に実行） ---
(() => {
  'use strict';
  const el = document.getElementById('splash');
  if (!el) return;
  if (sessionStorage.getItem('splash_seen')) { el.remove(); return; }
  sessionStorage.setItem('splash_seen', '1');
  setTimeout(() => {
    el.classList.add('is-out');
    let removed = false;
    const done = () => { if (!removed) { removed = true; el.remove(); } };
    el.addEventListener('transitionend', done, { once: true });
    setTimeout(done, 900);
  }, 2400);
})();
