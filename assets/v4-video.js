/* Видео на странице. Запускаются, когда видны, и ставятся на паузу, когда уходят с экрана.
   Без звука, поэтому браузеры разрешают автозапуск. Если у человека включено «уменьшить движение», видео не стартует само. */
(function(){
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seen = new WeakSet();
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){
      var v = e.target;
      if(e.isIntersecting){ if(!reduce){ v.preload = "auto"; var p = v.play(); if(p && p.catch) p.catch(function(){}); } }
      else v.pause();
    });
  }, {threshold:.35}) : null;
  function scan(){
    document.querySelectorAll("video[data-autoplay]").forEach(function(v){
      if(seen.has(v)) return; seen.add(v);
      if(io) io.observe(v);
    });
  }
  scan();
  new MutationObserver(scan).observe(document.documentElement, {childList:true, subtree:true});
})();
