/* Preview nav router — maps production slugs to local .dc.html files
   so the prototype is navigable. Production hrefs are left untouched in the markup. */
(function () {
  if (window.__odashNavRouter) return;
  window.__odashNavRouter = true;

  var MAP = {
    '/': 'トップページ(ページ遷移可能).dc.html',
    '/for-contractors': '建設会社の方へ.dc.html',
    '/blog-ex/instance': '施工実績.dc.html',
    '/faq': 'よくある質問.dc.html',
    '/company': '会社概要.dc.html',
    '/blog': 'ブログ.dc.html',
    '/form/inquiry': 'お問い合わせ.dc.html',
    '/privacypolicy': 'プライバシーポリシー.dc.html'
  };

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.charAt(0) === '#') return;
    if (href.charAt(0) !== '/') return;
    var clean = href.split('#')[0].split('?')[0];
    if (clean.length > 1) clean = clean.replace(/\/+$/, '');
    if (clean === '') clean = '/';
    var file = MAP[clean];
    if (!file) return;
    e.preventDefault();
    var q = href.indexOf('?') >= 0 ? href.slice(href.indexOf('?')).split('#')[0] : '';
    var hash = href.indexOf('#') >= 0 ? href.slice(href.indexOf('#')) : '';
    window.location.href = encodeURI(file) + q + hash;
  }, true);
})();
