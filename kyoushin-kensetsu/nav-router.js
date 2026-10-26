/* ODASH preview nav router — maps production slugs to local .dc.html files
   so the prototype is navigable. Production hrefs (e.g. /recruit, /form/inquiry)
   are left untouched in the markup; this only intercepts clicks in preview. */
(function () {
  if (window.__odashNavRouter) return;
  window.__odashNavRouter = true;

  var MAP = {
    '/': 'トップページ(ページ遷移可能).dc.html',
    '/recruit': '求職者のみなさまへ.dc.html',
    '/recruit/job': '仕事を知る.dc.html',
    '/recruit/requirements': '募集要項・よくある質問.dc.html',
    '/blog': 'ブログ.dc.html',
    '/information': '協進建設について.dc.html',
    '/form/inquiry': 'お問い合わせ.dc.html',
    '/privacypolicy': 'プライバシーポリシー.dc.html',
    '/sitemap': 'サイトマップ.dc.html'
  };

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.charAt(0) === '#') return;        // in-page anchor — leave default
    if (href.charAt(0) !== '/') return;        // external / relative — leave default

    var clean = href.split('#')[0].split('?')[0];
    if (clean.length > 1) clean = clean.replace(/\/+$/, '');
    if (clean === '') clean = '/';

    var file = MAP[clean];
    if (!file) return;                          // unknown slug — leave default

    e.preventDefault();
    var hash = href.indexOf('#') >= 0 ? href.slice(href.indexOf('#')) : '';
    window.location.href = encodeURI(file) + hash;
  }, true);
})();
