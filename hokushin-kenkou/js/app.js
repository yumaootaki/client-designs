/* ============================================================================
   EWリフォーム — 挙動スクリプト（CDN完結 / バニラJS）
   ビュー切替ルーター・イントロ・reveal・カウント・パララックス・縦書き演出。
   prefers-reduced-motion で全モーション低減。
   ============================================================================ */
(function(){
  "use strict";
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function(s,r){ return (r||document).querySelector(s); };
  var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };

  /* ---- ビュー定義（番号・縦書きラベル・ヒーローが暗いか） ---------------- */
  var VIEWS = {
    top:     { no:'01', label:'トップ',        dark:false },
    about:   { no:'02', label:'私たちについて', dark:true  },
    service: { no:'03', label:'メニュー', dark:false },
    works:   { no:'04', label:'施工事例',      dark:true  },
    flow:    { no:'05', label:'ご依頼の流れ', dark:false },
    reasons: { no:'06', label:'選ばれる理由',  dark:true  },
    voice:   { no:'07', label:'お客様の声',    dark:false },
    faq:     { no:'08', label:'よくあるご質問', dark:false },
    recruit: { no:'09', label:'採用情報',      dark:true  },
    contact: { no:'10', label:'お問い合わせ',  dark:false }
  };
  var ORDER = Object.keys(VIEWS);

  /* ============================ 1文字せり上げ ============================== */
  function splitToChars(el){
    if(!el || el.dataset.split) return;
    var t = el.getAttribute('data-text'); if(t===null) t = el.textContent;
    el.textContent='';
    for(var i=0;i<t.length;i++){
      var s=document.createElement('span');
      s.className='ch'; s.textContent=t[i];
      if(t[i]===' '||t[i]==='\u3000') s.classList.add('space');
      el.appendChild(s);
    }
    el.dataset.split='1';
  }
  function revealCatch(el, baseDelay){
    if(!el) return; splitToChars(el);
    $$('.ch', el).forEach(function(s,i){
      s.style.transitionDelay = ((baseDelay||0) + i) * 0.055 + 's';
      requestAnimationFrame(function(){ s.classList.add('in'); });
    });
  }

  /* ============================ カウントアップ ============================ */
  function countUp(el){
    if(el.dataset.done) return; el.dataset.done='1';
    var end=parseInt(el.getAttribute('data-count'),10);
    var start=parseInt(el.getAttribute('data-start')||'0',10);
    var plain=el.hasAttribute('data-plain');
    var fmt=function(v){ return plain?String(v):v.toLocaleString(); };
    if(RM){ el.textContent=fmt(end); return; }
    var dur=1500,t0=performance.now();
    (function step(now){
      var k=Math.min((now-t0)/dur,1), e=1-Math.pow(1-k,3);
      el.textContent=fmt(Math.round(start+(end-start)*e));
      if(k<1) requestAnimationFrame(step);
    })(performance.now());
  }

  /* ============================ reveal IO ================================= */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(en){
      if(!en.isIntersecting) return;
      var el=en.target;
      if(el.classList.contains('reveal'))   el.classList.add('in');
      if(el.classList.contains('reveal-x')) el.classList.add('in');
      if(el.classList.contains('rule-draw'))  el.classList.add('in');
      if(el.classList.contains('rule-draw-y'))el.classList.add('in');
      if(el.classList.contains('catch-blind')) el.classList.add('in');
      if(el.classList.contains('catch-io')){
        $$('.ch', el).forEach(function(s,i){ s.style.transitionDelay=(i*0.055)+'s'; s.classList.add('in'); });
      }
      if(el.hasAttribute('data-count')) countUp(el);
      io.unobserve(el);
    });
  }, { threshold:0.16, rootMargin:'0px 0px -8% 0px' });

  function observeIn(root){
    $$('.reveal, .reveal-x, .rule-draw, .rule-draw-y, [data-count], .catch-io, .catch-blind', root).forEach(function(el){
      if(el.classList.contains('catch-io')) splitToChars(el);
      io.observe(el);
    });
  }

  /* ============================ パララックス ============================== */
  var parallaxEls=[];
  function collectParallax(root){
    parallaxEls = $$('.parallax, .bg-vrun', (root&&root.classList&&root.classList.contains('active'))?document:document)
      .filter(function(el){ return el.offsetParent!==null; });
  }
  function applyParallax(){
    if(RM) return;
    var vh=window.innerHeight;
    parallaxEls.forEach(function(el){
      var r=el.getBoundingClientRect();
      if(r.bottom<-200||r.top>vh+200) return;
      var sp=parseFloat(el.getAttribute('data-speed')||'0.12');
      var center=r.top+r.height/2;
      var d=(center-vh/2);
      el.style.transform='translate3d(0,'+(-d*sp).toFixed(1)+'px,0)';
    });
  }

  /* ============================ ヒーロー（分割エディトリアル） ============
     スクロール連動の clip 演出は廃止。
     ・写真はロード時にブラインド状にせり上がって現れる（clip-path 下→上）。
     ・3枚をタイマーでゆっくりクロスフェード（ken-burns）。 */
  var heroImgs,heroActive=-1,heroTimer=null;
  function setHeroImg(i){
    if(i===heroActive||!heroImgs||!heroImgs.length) return; heroActive=i;
    heroImgs.forEach(function(im,k){ im.classList.toggle('on',k===i); });
  }
  function bindStory(){
    heroImgs=$$('#hero-photo .story-img');
    heroActive=-1;
    if(heroTimer){ clearInterval(heroTimer); heroTimer=null; }
    if(!heroImgs.length) return;
    setHeroImg(0);
    // ブラインドせり上げ（CSS の .reveal-blind → .in で発火）
    var blind=$('#hero-photo .blind');
    if(blind){ blind.classList.remove('in'); requestAnimationFrame(function(){
      requestAnimationFrame(function(){ blind.classList.add('in'); }); }); }
    if(RM) return;
    heroTimer=setInterval(function(){
      if(!heroImgs.length) return;
      setHeroImg((heroActive+1)%heroImgs.length);
    }, 5200);
  }
  function onStory(){ /* スクロール連動演出は廃止（no-op） */ }

  /* ============================ Works sticky ============================== */
  /* 画像は標準HTML img でも参照されるが、JSが src を動的に差し替えるため
     スタンドアロン書き出し時は window.__resources（blob URL）を優先する。
     未定義時（通常表示）は相対パスにフォールバック。 */
  function _res(id, path){ return (window.__resources && window.__resources[id]) || path; }
  var WORKS=[
    {num:'01', title:'築28年、二度目の家。',  meta:'全面リノベ ／ 戸建 ／ 〇〇市（※仮）', bg:_res('workImg0','assets/living-leather-arch.jpg'),  thumb:_res('workImg0','assets/living-leather-arch.jpg')},
    {num:'02', title:'光をいれる、平屋改修。',  meta:'間取り変更 ／ 平屋 ／ 〇〇市（※仮）', bg:_res('workImg1','assets/living-minimal-warm.jpg'),  thumb:_res('workImg1','assets/living-minimal-warm.jpg')},
    {num:'03', title:'海を望む、終の住処へ。',  meta:'水まわり＋断熱 ／ 戸建 ／ 〇〇市（※仮）', bg:_res('workImg2','assets/bedroom-ocean-sunset.jpg'), thumb:_res('workImg2','assets/bedroom-ocean-sunset.jpg')}
  ];
  var wScroll,wNum,wTitle,wMeta,wThumb,wBgs,wOverlay,curIdx,wTexts;
  function bindWorks(){
    wScroll=$('#works-scroll'); if(!wScroll) return;
    wNum=$('#works-num'); wTitle=$('#works-title'); wMeta=$('#works-meta'); wThumb=$('#works-thumb');
    wBgs=$$('.works-bg'); wOverlay=$('#works-overlay'); curIdx=-1; wTexts=[wNum,wTitle,wMeta];
    setWorks(0);
  }
  function fillWorks(w){ wNum.textContent=w.num; wTitle.textContent=w.title; wMeta.textContent=w.meta; }
  function setWorks(i){
    if(i===curIdx) return; var first=(curIdx===-1); curIdx=i; var w=WORKS[i];
    wBgs.forEach(function(b,bi){ b.classList.toggle('on',bi===i); });
    fillWorks(w);
    wThumb.src=w.thumb; wThumb.classList.remove('on');
    requestAnimationFrame(function(){ wThumb.classList.add('on'); });
    if(first||RM) return;
    wTexts.forEach(function(n){ n.classList.remove('swap'); void n.offsetWidth; n.classList.add('swap'); });
  }
  function onWorks(){
    if(!wScroll||wScroll.offsetParent===null) return;
    var rect=wScroll.getBoundingClientRect(), vh=window.innerHeight;
    var total=wScroll.offsetHeight-vh;
    var passed=Math.min(Math.max(-rect.top,0),total);
    var k=total>0?passed/total:0;
    setWorks(Math.min(WORKS.length-1, Math.floor(k*WORKS.length)));
    if(wOverlay&&rect.top<vh&&rect.bottom>0){
      var o=(0.42+0.16*Math.sin(k*Math.PI)).toFixed(3);
      wOverlay.style.background='rgba('+'25,22,18'+','+o+')';
    }
  }

  /* ============================ Flow 進捗ライン =========================== */
  function onFlow(){
    var track=$('#flow-track'); if(!track||track.offsetParent===null) return;
    var prog=$('#flow-progress'); var vh=window.innerHeight;
    var r=track.getBoundingClientRect();
    var k=Math.min(Math.max((vh*0.5-r.top)/(r.height),0),1);
    prog.style.height=(k*100)+'%';
    $$('.flow-step').forEach(function(st){
      var sr=st.getBoundingClientRect();
      if(sr.top<vh*0.62) st.classList.add('active');
    });
  }

  /* ============================ ヘッダー / サイドレール =================== */
  var hdr,sideNum,sideLabel,sideFill,curView='top';
  function setHeaderTone(){
    if(!hdr) return; var meta=VIEWS[curView];
    var heroDark = meta.dark && window.scrollY < window.innerHeight*0.82;
    hdr.classList.toggle('on-dark', heroDark);
    hdr.classList.toggle('on-light', !heroDark);
  }
  function onProg(){
    var h=document.documentElement;
    var k=h.scrollTop/(h.scrollHeight-h.clientHeight||1);
    var sp=$('#scrollprog'); if(sp) sp.style.transform='scaleX('+k+')';
    if(sideFill) sideFill.style.transform='translateY('+(k*233)+'%)';
    setHeaderTone();
  }

  /* ============================ ルーター ================================= */
  function go(name, push){
    if(!VIEWS[name]) name='top';
    var cur=$('.view.active'); var next=$('#view-'+name);
    if(!next) return;
    if(cur) cur.classList.remove('active','entering');
    next.classList.add('active');
    void next.offsetWidth; next.classList.add('entering');
    curView=name;
    window.scrollTo(0,0);

    // ナビ current
    $$('.nav-link').forEach(function(a){ a.classList.toggle('current', a.getAttribute('data-go')===name); });
    // サイドレール
    var meta=VIEWS[name];
    if(sideNum) sideNum.textContent=meta.no;
    if(sideLabel) sideLabel.textContent=meta.label;

    // 当該ビューの演出を初期化
    bindStory(); bindWorks();
    if(name==='top'){
      revealCatch($('#fv-line1'),0); revealCatch($('#fv-line2'),4);
      revealCatch($('#fv-line3'),7); revealCatch($('#fv-line4'),10);
      $$('#view-top .fade-late').forEach(function(el,i){ setTimeout(function(){ el.classList.add('in'); }, 380+i*220); });
      var fc=$('#fv-count'); if(fc){ fc.dataset.done=''; countUp(fc); }
    } else {
      // 各ページ先頭の縦書き大見出し
      var hv=$('.page-hero-vtext', next); if(hv){ hv.dataset.split=''; revealCatch(hv,0); }
    }
    observeIn(next);
    collectParallax();
    requestAnimationFrame(function(){ onScroll(); applyParallax(); });

    if(push!==false){
      if(name==='top') history.pushState({v:name},'','#top');
      else history.pushState({v:name},'','#'+name);
    }
    closeMenu();
  }
  function routeFromHash(){
    var h=(location.hash||'').replace('#',''); go(VIEWS[h]?h:'top', false);
  }

  /* ============================ スクロール束ね ============================ */
  function onScroll(){ onStory(); onWorks(); onFlow(); onProg(); applyParallax(); }

  /* ============================ アコーディオン（max-height制御） ========== */
  function setAccHeight(acc){
    var inner=acc.querySelector('.acc-body > div'); if(!inner) return;
    if(acc.classList.contains('open')){ inner.style.maxHeight=inner.scrollHeight+'px'; }
    else{ inner.style.maxHeight='0px'; }
  }
  // 開いた項目はウィンドウリサイズで高さを再計算
  window.addEventListener('resize', function(){
    $$('.acc.open').forEach(setAccHeight);
  });
  document.addEventListener('click', function(e){
    var h=e.target.closest('.acc-head');
    if(h){ var acc=h.parentElement; acc.classList.toggle('open'); setAccHeight(acc); }
    var g=e.target.closest('[data-go]');
    if(g){ e.preventDefault(); go(g.getAttribute('data-go')); }
  });

  /* ============================ Before/After ============================== */
  function bindBA(){
    $$('.ba-wrap').forEach(function(w){
      if(w.dataset.bound) return; w.dataset.bound='1';
      var after=$('.ba-after',w), handle=$('.ba-handle',w);
      function set(x){
        var r=w.getBoundingClientRect();
        var p=Math.min(Math.max((x-r.left)/r.width,0),1);
        after.style.width=(p*100)+'%'; handle.style.left=(p*100)+'%';
        var aimg=$('img',after); if(aimg) aimg.style.width=r.width+'px';
      }
      function move(ev){ set((ev.touches?ev.touches[0].clientX:ev.clientX)); }
      w.addEventListener('mousemove',move);
      w.addEventListener('touchmove',function(ev){ move(ev); },{passive:true});
      window.addEventListener('resize',function(){
        var r=w.getBoundingClientRect(); var aimg=$('img',after); if(aimg) aimg.style.width=r.width+'px';
      });
      requestAnimationFrame(function(){
        var r=w.getBoundingClientRect(); var aimg=$('img',after); if(aimg) aimg.style.width=r.width+'px';
      });
    });
  }

  /* ============================ モバイルメニュー ========================== */
  var menu,burger,menuOpen=false;
  function openMenu(){ menu.classList.add('open'); menuOpen=true; burger.setAttribute('aria-expanded','true'); }
  function closeMenu(){ if(menu){ menu.classList.remove('open'); menuOpen=false; burger&&burger.setAttribute('aria-expanded','false'); } }

  /* ============================ イントロ ================================= */
  var _booted=false;
  function bootSite(){
    if(_booted) return; _booted=true;
    routeFromHash();
    bindBA();
  }
  function runIntro(){
    var intro=$('#intro');
    if(RM||!intro){ if(intro) intro.style.display='none'; document.body.style.overflow=''; bootSite(); return; }
    document.body.style.overflow='hidden';

    var outer=$('#seal-outer'), inner=$('#seal-inner'),
        ew=$('#intro-ew'), cap=$('#intro-cap'),
        top=$('#intro-top'), bot=$('#intro-bot');

    // 方形シールを stroke-dashoffset で描く
    [outer,inner].forEach(function(r,i){
      if(!r) return;
      var len=r.getTotalLength ? r.getTotalLength() : 416;
      r.style.strokeDasharray=len;
      r.style.strokeDashoffset=len;
      r.style.animation='sealDraw 1.15s var(--ease-deep) '+(i*0.18)+'s forwards';
    });

    // 文字を順に
    setTimeout(function(){ ew && ew.classList.add('in'); }, 540);
    setTimeout(function(){ cap && cap.classList.add('in'); }, 900);

    // 退場：マークが静かに沈み、幕が上下に分かれて開く
    setTimeout(function(){
      var mark=$('#intro-mark');
      if(mark){ mark.style.transition='opacity .7s ease, transform 1s var(--ease-deep)';
        mark.style.opacity='0'; mark.style.transform='translateY(-10px)'; }
    }, 2050);
    setTimeout(function(){
      [top,bot].forEach(function(c){ if(c) c.style.transition='transform 1.05s var(--ease-deep)'; });
      if(top) top.style.transform='translateY(-100%)';
      if(bot) bot.style.transform='translateY(100%)';
      bootSite();
    }, 2350);
    setTimeout(function(){ intro.style.display='none'; document.body.style.overflow=''; }, 3500);

    // 保険
    setTimeout(function(){ if(intro.style.display!=='none'){ intro.style.display='none'; document.body.style.overflow=''; bootSite(); } }, 6500);
  }

  /* ============================ Lenis 慣性（任意） ======================== */
  function initLenis(){
    if(RM||typeof Lenis==='undefined') return;
    try{
      var lenis=new Lenis({ duration:1.15, easing:function(t){ return Math.min(1,1.001-Math.pow(2,-10*t)); } });
      (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
      lenis.on('scroll', onScroll); window.__lenis=lenis;
    }catch(e){}
  }

  /* ============================ 起動 ===================================== */
  function boot(){
    hdr=$('#hdr'); sideNum=$('#rail-num'); sideLabel=$('#rail-label'); sideFill=$('#rail-fill');
    menu=$('#mobilemenu'); burger=$('#burger');
    burger&&burger.addEventListener('click', function(){ menuOpen?closeMenu():openMenu(); });
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', function(){ collectParallax(); onScroll(); });
    window.addEventListener('popstate', routeFromHash);
    runIntro();
    var s=document.createElement('script');
    s.src='https://unpkg.com/lenis@1.1.13/dist/lenis.min.js';
    s.onload=initLenis; s.onerror=function(){}; document.body.appendChild(s);
  }
  // DOMContentLoaded が既に発火済み（=スタンドアロン書き出し時にバンドラが
  // ページ表示後にスクリプトを実行するケース）でも確実に起動する。
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }

  // ルーターを外部からも使えるよう公開
  window.EW = { go:go };
})();
