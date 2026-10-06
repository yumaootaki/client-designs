/* preview nav router — maps production slugs to local .dc.html files so the prototype is navigable.
   Production hrefs (e.g. /price, /form/inquiry) stay untouched in markup; this only intercepts clicks in preview. */
(function () {
  if (window.__lilyNavRouter) return;
  window.__lilyNavRouter = true;

  var MAP = {
    '/': 'トップページ(ページ遷移可能).dc.html',
    '/work': '業務案内.dc.html',
    '/price': '料金表.dc.html',
    '/recruit': '各種募集.dc.html',
    '/information': '会社概要.dc.html',
    '/blog': 'ブログ.dc.html',
    '/form/inquiry': 'お問い合わせ.dc.html',
    '/trouble-guide': 'お困りの方へ.dc.html',
    '/difference': '大手との違い.dc.html',
    '/voice': 'お客様の声.dc.html',
    '/blog-ex/instance': '修理実績.dc.html',
    '/faq': 'よくある質問.dc.html',
    '/about': 'Lilyについて.dc.html',
    '/trouble': '対応トラブル一覧.dc.html',
    '/privacypolicy': 'プライバシーポリシー.dc.html',
    '/sitemap': 'サイトマップ.dc.html'
  };

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) !== '/') return;
    var clean = href.split('#')[0].split('?')[0];
    if (clean.length > 1) clean = clean.replace(/\/+$/, '');
    if (clean === '') clean = '/';
    var file = MAP[clean];
    if (!file) return;
    e.preventDefault();
    var hash = href.indexOf('#') >= 0 ? href.slice(href.indexOf('#')) : '';
    window.location.href = encodeURI(file) + hash;
  }, true);
})();
