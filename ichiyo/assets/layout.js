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
    name: "合同会社一葉",
    tel: "0467-39-5577", telHref: "tel:0467395577",
    address: "〒252-1124 神奈川県綾瀬市吉岡229-6",
    hours: "8:00〜17:00（日曜定休）",
    apply: "recruit/index.html#apply",
    visit: "about/visit/index.html"
  };

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
    return "<header class=\"sh\"> <div class=\"sh__inner\"> <a class=\"sh__logo\" href=\"" + base + "index.html\"><img src=\"" + base + "logo.png\" alt=\"合同会社一葉\"><span class=\"sh__logo-txt\"><span class=\"sh__logo-ja\">合同会社一葉</span></span></a> <input type=\"checkbox\" id=\"sh-drawer\" class=\"sh__toggle\" hidden> <label class=\"sh__burger\" for=\"sh-drawer\" aria-label=\"メニュー\"><span></span><span></span><span></span></label> <div class=\"sh__panel\"> <label class=\"sh__close\" for=\"sh-drawer\">閉じる</label> <nav class=\"sh__nav\" aria-label=\"メインナビゲーション\"> <ul> <li class=\"sh__has-sub\"><a href=\"" + base + "about/index.html\">求職者のみなさまへ</a><ul class=\"sh__sub\"><li><a href=\"" + base + "about/growth/index.html\">未経験から職人へ</a></li><li><a href=\"" + base + "about/skill/index.html\">身につく技術・資格</a></li><li><a href=\"" + base + "about/visit/index.html\">見学・相談</a></li></ul></li> <li><a href=\"" + base + "about/message/index.html\">代表メッセージ</a></li> <li><a href=\"" + base + "about/workstyle/index.html\">働き方・待遇</a></li> <li><a href=\"" + base + "blog-ex/instance/index.html\">施工実績</a></li> <li><a href=\"" + base + "about/faq/index.html\">よくある質問</a></li> <li><a href=\"" + base + "recruit/index.html\">採用情報</a></li> <li class=\"sh__has-sub\"><a href=\"" + base + "information/index.html\">会社概要</a><ul class=\"sh__sub\"><li><a href=\"" + base + "work/index.html\">業務案内</a></li><li><a href=\"" + base + "blog/index.html\">ブログ</a></li><li><a href=\"" + base + "form/inquiry/index.html\">お問い合わせ</a></li></ul></li> </ul> </nav> <div class=\"sh__actions\"> <a class=\"sh__tel\" href=\"" + SITE.telHref + "\"><span class=\"sh__tel-num\">" + SITE.tel + "</span><span class=\"sh__tel-note\">" + SITE.hours + "</span></a> <a class=\"site-btn site-btn--accent sh__cta\" href=\"" + base + SITE.apply + "\">応募する</a> </div> </div> <label class=\"sh__scrim\" for=\"sh-drawer\"></label> </div> </header>";
  }

  function footerHTML() {
    return "<footer class=\"sf\"> <div class=\"site-wrap sf__inner sf-a__inner\"> <div class=\"sf__brand\"> <p class=\"sf__logo\">合同会社一葉</p> <address class=\"sf__addr\">" + SITE.address + "<br>TEL <a href=\"" + SITE.telHref + "\">" + SITE.tel + "</a>（" + SITE.hours + "）<br>建設業許可 第88220号</address> </div> <nav class=\"sf__nav sf-a__nav\" aria-label=\"フッターメニュー\"> <div class=\"sf-col\"><p class=\"sf-col__ttl\">求人情報</p><ul><li><a href=\"" + base + "about/index.html\">求職者のみなさまへ</a></li><li><a href=\"" + base + "about/growth/index.html\">未経験から職人へ</a></li><li><a href=\"" + base + "about/skill/index.html\">身につく技術・資格</a></li><li><a href=\"" + base + "about/message/index.html\">代表メッセージ</a></li><li><a href=\"" + base + "about/visit/index.html\">見学・相談</a></li></ul></div> <div class=\"sf-col\"><p class=\"sf-col__ttl\">働き方</p><ul><li><a href=\"" + base + "about/workstyle/index.html\">働き方・待遇</a></li><li><a href=\"" + base + "about/faq/index.html\">よくある質問</a></li><li><a href=\"" + base + "blog-ex/instance/index.html\">施工実績</a></li><li><a href=\"" + base + "recruit/index.html\">採用情報（募集要項）</a></li></ul></div> <div class=\"sf-col\"><p class=\"sf-col__ttl\">会社案内</p><ul><li><a href=\"" + base + "index.html\">TOP</a></li><li><a href=\"" + base + "work/index.html\">業務案内</a></li><li><a href=\"" + base + "information/index.html\">会社概要</a></li><li><a href=\"" + base + "blog/index.html\">ブログ</a></li><li><a href=\"" + base + "form/inquiry/index.html\">お問い合わせ</a></li></ul></div> </nav> </div> <div class=\"sf__bottom\"><a href=\"" + base + "privacypolicy/index.html\">プライバシーポリシー</a><p class=\"sf__copy\">© 合同会社一葉</p></div> </footer> <nav class=\"mobile-cta2\" aria-label=\"応募導線\"> <a href=\"" + base + SITE.apply + "\" class=\"m-apply\">応募する</a><a href=\"" + SITE.telHref + "\" class=\"m-tel\">電話</a><a href=\"" + base + SITE.visit + "\" class=\"m-visit\">見学・相談</a> </nav>";
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
