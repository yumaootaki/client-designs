/* ===================================================================
   共通レイアウト部品（ヘッダー / フッター）
   - 各ページは <div data-include="header"></div> /
     <div data-include="footer"></div> のプレースホルダだけを置く。
   - リンク基準パス(base)はこのスクリプト自身の src から自動算出
     （ページ階層が変わっても個別設定不要）。
   - 現在ページの強調は location から自動判定（aria-current="page"）。
   - ヘッダーの連動JS（メニュー開閉・スクロールでの solid 化）も
     この部品側で完結させる（site.js には依存しない）。
   - 会社の固有情報・ナビ項目は下記 SITE に集約。ここを1か所
     変えれば全ページのヘッダー/フッターに反映される。
=================================================================== */
(function () {
  "use strict";

  var thisScript = document.currentScript ||
    (function () { var s = document.getElementsByTagName("script"); return s[s.length - 1]; })();
  var base = thisScript ? thisScript.src.replace(/assets\/layout\.js(?:\?.*)?$/, "") : "";

  /* ---------- 固有情報（差し替えはここ1か所） ---------- */
  var SITE = {
    name: "株式会社総和",
    copyright: "© 2026 Souwa Express",
    tagline: "千葉県印西市を拠点に、2t・4t冷凍冷蔵車で<br>関東一円の食品ルート配送を行っています。",
    address: "本社 〒270-1337 千葉県印西市草深156-11<br>印西営業所 〒270-1337 千葉県印西市草深十町歩1240-28",
    jobTel: "070-6965-8178",
    jobTelHref: "tel:07069658178",
    /* 要取材：LINE公式アカウントのURL・ID（未確定のため # を仮置き） */
    line: "#",
    form: "recruit/requirements/index.html#apply",
    nav: [
      { label: "求職者のみなさまへ", href: "recruit/index.html" },
      { label: "働く魅力", href: "recruit/appeal/index.html" },
      { label: "先輩紹介", href: "recruit/staff/index.html" },
      { label: "1日の流れ", href: "recruit/day/index.html" },
      { label: "給与・休日", href: "recruit/salary/index.html" },
      { label: "よくある質問", href: "recruit/faq/index.html" },
      { label: "採用情報", href: "recruit/requirements/index.html" },
      { label: "会社概要", href: "information/index.html" }
    ],
    footerMenus: [
      { title: "求人情報", links: [
        { label: "求職者のみなさまへ", href: "recruit/index.html" },
        { label: "経験者ドライバーの方へ", href: "recruit/experienced/index.html" },
        { label: "未経験・ブランクのある方へ", href: "recruit/beginner/index.html" },
        { label: "総和で働く魅力", href: "recruit/appeal/index.html" },
        { label: "先輩ドライバー紹介", href: "recruit/staff/index.html" },
        { label: "1日の流れと車両紹介", href: "recruit/day/index.html" },
        { label: "給与・休日の考え方", href: "recruit/salary/index.html" },
        { label: "よくある質問", href: "recruit/faq/index.html" },
        { label: "採用情報（募集要項）", href: "recruit/requirements/index.html" }
      ] },
      { title: "会社案内", links: [
        { label: "トップ", href: "index.html" },
        { label: "業務案内", href: "work/index.html" },
        { label: "会社概要", href: "information/index.html" },
        { label: "ブログ", href: "blog/index.html" },
        { label: "お問い合わせ", href: "form/inquiry/index.html" }
      ] }
    ],
    privacy: { label: "プライバシーポリシー", href: "privacypolicy/index.html" }
  };
  var ICON = {
    line: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8-6C21.4 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8z"/></svg>',
    tel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    form: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7M9 8h4"/></svg>'
  };
  window.SOUWA_ICON = ICON;

  /* ---------- 現在ページ判定 ---------- */
  function norm(p) { return p.replace(/index\.html$/, "").replace(/\/+$/, ""); }
  var current = norm(location.pathname);
  function isActive(href) {
    try { return norm(new URL(base + href, location.href).pathname) === current; }
    catch (e) { return false; }
  }
  function isActiveTree(item) {
    if (isActive(item.href)) return true;
    if (item.sub) { for (var i = 0; i < item.sub.length; i++) { if (isActive(item.sub[i].href)) return true; } }
    return false;
  }
  function cur(flag) { return flag ? ' aria-current="page"' : ""; }

  /* ---------- HTML生成 ---------- */
  function navItemHTML(item) {
    if (item.sub) {
      var subs = item.sub.map(function (s) {
        return '<a href="' + base + s.href + '"' + cur(isActive(s.href)) + ">" + s.label + "</a>";
      }).join("");
      return '<div class="nav-item has-sub"> <a href="' + base + item.href + '" aria-haspopup="true"' + cur(isActiveTree(item)) +
        '>' + item.label + '<span class="nav-caret" aria-hidden="true"></span></a> <div class="nav-sub"> ' + subs + " </div> </div>";
    }
    return '<a href="' + base + item.href + '"' + cur(isActiveTree(item)) + ">" + item.label + "</a>";
  }

  function headerHTML() {
    return "<header class=\"sh\"> <div class=\"sh__inner\"> <a class=\"sh__logo\" href=\"" + base + "index.html\"><img src=\"" + base + "logo.png\" alt=\"\"><span class=\"sh__logo-txt\"><span class=\"sh__logo-ja\">株式会社総和</span><span class=\"sh__logo-en\">SOUWA EXPRESS</span></span></a> <input type=\"checkbox\" id=\"sh-drawer\" class=\"sh__toggle\" hidden> <label class=\"sh__burger\" for=\"sh-drawer\" aria-label=\"メニュー\"><span></span><span></span><span></span></label> <div class=\"sh__panel\"> <label class=\"sh__close\" for=\"sh-drawer\">閉じる</label> <nav class=\"sh__nav\" aria-label=\"メインナビゲーション\"> <ul> <li class=\"sh__has-sub\"><a href=\"" + base + "recruit/index.html\">求職者のみなさまへ</a><ul class=\"sh__sub\"><li><a href=\"" + base + "recruit/experienced/index.html\">経験者ドライバーの方へ</a></li><li><a href=\"" + base + "recruit/beginner/index.html\">未経験・ブランクのある方へ</a></li></ul></li> <li><a href=\"" + base + "recruit/appeal/index.html\">働く魅力</a></li> <li><a href=\"" + base + "recruit/staff/index.html\">先輩紹介</a></li> <li><a href=\"" + base + "recruit/day/index.html\">1日の流れ</a></li> <li><a href=\"" + base + "recruit/salary/index.html\">給与・休日</a></li> <li><a href=\"" + base + "recruit/faq/index.html\">よくある質問</a></li> <li><a href=\"" + base + "recruit/requirements/index.html\">採用情報</a></li> <li class=\"sh__has-sub\"><a href=\"" + base + "information/index.html\">会社概要</a><ul class=\"sh__sub\"><li><a href=\"" + base + "work/index.html\">業務案内</a></li><li><a href=\"" + base + "blog/index.html\">ブログ</a></li><li><a href=\"" + base + "form/inquiry/index.html\">お問い合わせ</a></li></ul></li> </ul> </nav> <div class=\"sh__actions\"> <a class=\"sh__tel\" href=\"tel:07069658178\"><span class=\"sh__tel-num\">070-6965-8178</span><span class=\"sh__tel-note\">求人ダイヤル（採用担当直通）</span></a> <a class=\"site-btn site-btn--accent sh__cta sh__line\" href=\"#\">LINEで相談</a> </div> </div> <label class=\"sh__scrim\" for=\"sh-drawer\"></label> </div> </header>";
  }

  function footerHTML() {
    return "<footer class=\"sf\"> <div class=\"site-wrap sf__inner sf-a__inner\"> <div class=\"sf__brand\"> <p class=\"sf__logo\">株式会社総和</p> <address class=\"sf__addr\">本社 〒270-1337 千葉県印西市草深156-11<br>印西営業所 〒270-1337 千葉県印西市草深十町歩1240-28<br>求人ダイヤル <a href=\"tel:07069658178\">070-6965-8178</a>（採用担当直通）</address> </div> <nav class=\"sf__nav sf-a__nav\" aria-label=\"フッターメニュー\"> <div class=\"sf-col\"><p class=\"sf-col__ttl\">求人情報</p><ul><li><a href=\"" + base + "recruit/index.html\">求職者のみなさまへ</a></li><li><a href=\"" + base + "recruit/experienced/index.html\">経験者ドライバーの方へ</a></li><li><a href=\"" + base + "recruit/beginner/index.html\">未経験・ブランクのある方へ</a></li><li><a href=\"" + base + "recruit/appeal/index.html\">総和で働く魅力</a></li><li><a href=\"" + base + "recruit/staff/index.html\">先輩ドライバー紹介</a></li></ul></div> <div class=\"sf-col\"><p class=\"sf-col__ttl\">働き方</p><ul><li><a href=\"" + base + "recruit/day/index.html\">1日の流れと車両紹介</a></li><li><a href=\"" + base + "recruit/salary/index.html\">給与・休日の考え方</a></li><li><a href=\"" + base + "recruit/faq/index.html\">よくある質問</a></li><li><a href=\"" + base + "recruit/requirements/index.html\">採用情報（募集要項）</a></li></ul></div> <div class=\"sf-col\"><p class=\"sf-col__ttl\">会社案内</p><ul><li><a href=\"" + base + "index.html\">TOP</a></li><li><a href=\"" + base + "work/index.html\">業務案内</a></li><li><a href=\"" + base + "information/index.html\">会社概要</a></li><li><a href=\"" + base + "blog/index.html\">ブログ</a></li><li><a href=\"" + base + "form/inquiry/index.html\">お問い合わせ</a></li></ul></div> </nav> </div> <div class=\"sf__bottom\"><a href=\"" + base + "privacypolicy/index.html\">プライバシーポリシー</a><p class=\"sf__copy\">© SOUWA EXPRESS</p></div> </footer> <nav class=\"mobile-cta2\" aria-label=\"応募導線\"> <a href=\"#\" class=\"m-line\">LINE</a><a href=\"tel:07069658178\" class=\"m-tel\">電話</a><a href=\"" + base + "recruit/requirements/index.html#apply\" class=\"m-form\">フォーム</a> </nav>";
  }

  /* ---------- ヘッダー連動JS（部品側で完結） ---------- */
  function initHeaderBehavior() {
    var header = document.querySelector(".site-header");
    if (header && !header.dataset.bound) {
      header.dataset.bound = "1";
      var onScroll = function () { header.classList.toggle("solid", window.scrollY > 80); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      var toggle = header.querySelector(".nav-toggle");
      var nav = header.querySelector(".nav");
      if (toggle && nav) {
        var setOpen = function (open) {
          nav.classList.toggle("open", open);
          document.body.classList.toggle("nav-open", open);
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
          toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
          if (open) { var f = nav.querySelector("a"); if (f) f.focus(); }
        };
        toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
        nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); toggle.focus(); }
        });
      }
    }
  }

  /* ---------- マウント ---------- */
  function mount() {
    var h = document.querySelector('[data-include="header"]');
    if (h) h.outerHTML = headerHTML();
    var f = document.querySelector('[data-include="footer"]');
    if (f) f.outerHTML = footerHTML();
    /* ヘッダーはチェックボックス式（CSSのみ）。現在ページを強調 */
    document.querySelectorAll(".sh__nav a").forEach(function (a) { if (norm(new URL(a.href).pathname) === current) a.setAttribute("aria-current", "page"); });
    // 表示直後の自己補正：読み込み順の差による崩れ・トリガー位置ズレを吸収
    var fix = function () {
      if (window.ScrollTrigger && window.ScrollTrigger.refresh) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
      window.dispatchEvent(new Event("resize"));
    };
    setTimeout(fix, 200);
    setTimeout(fix, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
