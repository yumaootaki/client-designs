/* スクロール表示（フェイルオープン）：非表示タブ・印刷・書き出しでも最終状態で内容が必ず見える */
(function () {
  if (window.__hoshiReveal) return;
  window.__hoshiReveal = true;
  var SEL = '.rv,.rvl,.rvr,.rv-scale,.st';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function all() { document.querySelectorAll(SEL).forEach(function (e) { e.classList.add('show'); }); }
  function check() {
    if (reduce) { all(); return; }
    var h = window.innerHeight || 800;
    document.querySelectorAll(SEL).forEach(function (e) {
      if (!e.classList.contains('show') && e.getBoundingClientRect().top < h * 0.95) e.classList.add('show');
    });
  }
  var pending = false;
  function soon() { if (pending) return; pending = true; setTimeout(function () { pending = false; check(); }, 30); }
  window.addEventListener('scroll', check, { passive: true, capture: true });
  window.addEventListener('resize', soon);
  window.addEventListener('beforeprint', all);
  document.addEventListener('visibilitychange', check);
  function start() {
    check();
    if ('MutationObserver' in window) new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
    setTimeout(all, 2500);
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
