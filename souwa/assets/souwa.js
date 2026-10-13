/* 総和：タブ切り替え（1日の流れ・車両）。動きはこれとFAQ開閉のみ */
(function(){
  document.querySelectorAll('[data-tabs]').forEach(function(root){
    var btns=[].slice.call(root.querySelectorAll('[role="tab"]'));
    function sel(b,focus){btns.forEach(function(x){var on=x===b;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;var p=document.getElementById(x.getAttribute('aria-controls'));if(p)p.hidden=!on;});if(focus)b.focus();}
    btns.forEach(function(b,i){b.addEventListener('click',function(){sel(b)});b.addEventListener('keydown',function(e){var n=null;if(e.key==='ArrowRight')n=btns[(i+1)%btns.length];if(e.key==='ArrowLeft')n=btns[(i-1+btns.length)%btns.length];if(n){e.preventDefault();sel(n,true);}});});
  });
})();
