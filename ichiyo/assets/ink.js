/* スクロール連動の文字色変化：[data-ink] 内の文字を1字ずつ、スクロール量に合わせて点灯 */
(function(){
  var els=[].slice.call(document.querySelectorAll('[data-ink]'));if(!els.length)return;
  var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  els.forEach(function(el){
    var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),nodes=[],n;while(n=w.nextNode())nodes.push(n);
    nodes.forEach(function(t){if(!t.nodeValue.trim())return;var f=document.createDocumentFragment();t.nodeValue.split('').forEach(function(ch){var s=document.createElement('span');s.className='ink-ch';s.textContent=ch;f.appendChild(s);});t.parentNode.replaceChild(f,t);});
    el.classList.add('ink-ready');el._ch=[].slice.call(el.querySelectorAll('.ink-ch'));
    if(reduce)el._ch.forEach(function(s){s.classList.add('on');});
  });
  if(reduce)return;
  var tick=false;
  function upd(){tick=false;var vh=innerHeight;els.forEach(function(el){var r=el.getBoundingClientRect();
    /* 要素上端が画面の88%に来たら点灯開始、38%に来たら全点灯 */
    var p=(vh*0.88-r.top)/(vh*0.5+r.height*0.5);p=Math.max(0,Math.min(1,p));var k=Math.round(p*el._ch.length);
    el._ch.forEach(function(s,i){s.classList.toggle('on',i<k);});});}
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true});addEventListener('resize',upd);upd();
})();
