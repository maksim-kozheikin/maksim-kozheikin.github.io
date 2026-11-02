/* Shared action icons. External company links retain their existing 12 px SVG. */
const UI_PATHS = {
  arrow:"M12 19V5M6 11l6-6 6 6",
  chevron:"M3.5 1.5 7 5 3.5 8.5",
  download:"M12 3v12M7 10l5 5 5-5M5 20h14",
  close:"m6 6 12 12M18 6 6 18",
  plus:"M5 12h14M12 5v14", minus:"M5 12h14",
  menu:"M4 6h16M4 12h16M4 18h16", check:"m5 12 4 4L19 6"
};
function uiIcon(name){
  const direction={up:0,down:180,left:-90};
  const arrow=Object.prototype.hasOwnProperty.call(direction,name);
  const key=arrow?"arrow":name, small=key==="chevron", size=small?10:18;
  return `<svg class="ui-icon" data-ui-icon="${name}" viewBox="0 0 ${small?10:24} ${small?10:24}" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${small?1.8:2}" stroke-linecap="round" stroke-linejoin="round"${arrow?` style="transform:rotate(${direction[name]}deg)"`:""} aria-hidden="true"><path d="${UI_PATHS[key]}"></path></svg>`;
}
/* The page handlers toggle nav-open; this controller owns close, focus and ARIA. */
(function(){
  function init(){
    const menu=document.getElementById("sidebar"),burger=document.getElementById("burger");
    if(!menu||!burger)return;
    const mobile=matchMedia("(max-width:900px)"),main=document.querySelector(".main"),bar=document.querySelector(".topbar");
    const close=document.createElement("button");close.className="mobile-menu-close";close.innerHTML=uiIcon("close");
    menu.prepend(close);burger.setAttribute("aria-controls","sidebar");
    let wasOpen=false;
    const hide=()=>document.body.classList.remove("nav-open");
    function sync(){
      const en=document.documentElement.lang==="en";
      close.setAttribute("aria-label",en?"Close menu":"Закрыть меню");
      burger.setAttribute("aria-label",en?"Menu":"Меню");
      const open=mobile.matches&&document.body.classList.contains("nav-open");
      burger.setAttribute("aria-expanded",String(open));
      menu.inert=mobile.matches&&!open;
      if(main)main.inert=open;
      if(bar)bar.inert=open;
      if(open&&!wasOpen)close.focus({preventScroll:true});
      if(!open&&wasOpen&&mobile.matches)burger.focus({preventScroll:true});
      wasOpen=open;
    }
    close.addEventListener("click",hide);
    document.addEventListener("keydown",e=>{
      if(!wasOpen)return;
      if(e.key==="Escape"){e.preventDefault();hide();return;}
      if(e.key!=="Tab")return;
      const items=[...menu.querySelectorAll('a[href],button:not([disabled]),input,select,textarea')].filter(el=>el.getClientRects().length&&!el.hidden);
      const first=items[0],last=items[items.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:["class"]});
    new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    mobile.addEventListener("change",()=>{if(!mobile.matches)hide();sync();});
    sync();
  }
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
