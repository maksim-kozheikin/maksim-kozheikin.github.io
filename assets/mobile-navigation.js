/* Approved mobile bottom controls and content-sized navigation sheet. */
(()=>{
const mobile=matchMedia('(max-width:900px)');
function sessionStorageGet(key){try{return sessionStorage.getItem(key)}catch{return null}}
function positionKey(){return 'portfolio-mobile-scroll:'+location.pathname.replace(/\/$/,'/index.html')+location.search+location.hash}
let teardown;
function sync(){teardown?.();teardown=mobile.matches?setup():null}
function setup(){
const sidebar=document.querySelector('.sidebar'),mode=sidebar?.querySelector('.segmented');
if(!sidebar||!mode)return ()=>{};
const controller=new AbortController(),signal=controller.signal,restore=[];
function park(node){if(!node)return;const marker=document.createComment('mobile navigation placement');node.before(marker);restore.push(()=>{marker.replaceWith(node)})}
[sidebar,mode,sidebar.querySelector('.lang'),sidebar.querySelector('.side-bottom'),sidebar.querySelector('.side-top')].forEach(park);
document.body.classList.add('mobile-bottom-nav');
document.body.dataset.navInput='pointer';
document.addEventListener('pointerdown',e=>{
 document.body.dataset.navInput='pointer';
 if(e.pointerType!=='touch')return;
 const tile=e.target.closest('.m-tile');
 if(tile){clearTouch();touchTile=tile;touchPoint={x:e.clientX,y:e.clientY};tile.classList.add('is-touched')}
},{capture:true,passive:true,signal});
document.addEventListener('keydown',e=>{if(!e.metaKey&&!e.ctrlKey&&!e.altKey)document.body.dataset.navInput='keyboard'},{capture:true,signal});
let touchTile,touchPoint;
function clearTouch(){touchTile?.classList.remove('is-touched');touchTile=null;touchPoint=null}
document.addEventListener('pointermove',e=>{if(touchPoint&&Math.hypot(e.clientX-touchPoint.x,e.clientY-touchPoint.y)>10)clearTouch()},{passive:true,signal});
document.addEventListener('pointercancel',clearTouch,{signal});
document.addEventListener('pointerup',()=>requestAnimationFrame(clearTouch),{signal});

const arrival=sessionStorageGet('portfolio-mobile-arrival')==='home';
try{sessionStorage.removeItem('portfolio-mobile-arrival')}catch{}

const isHome=(location.pathname.endsWith('/')||location.pathname.endsWith('/index.html'))&&!location.hash.startsWith('#cv');
const isCV=!isHome&&(location.pathname.endsWith('/')||location.pathname.endsWith('/index.html'))&&location.hash.startsWith('#cv');
const download=isCV?document.getElementById('cv-dl'):null;if(download){park(download);download.classList.add('fixed-download')}
const dock=document.createElement('nav');dock.className='fixed-dock';dock.setAttribute('aria-label','Основная навигация');
const back=document.createElement('div');back.className='side-links fixed-back';back.innerHTML='<a class="v4close" href="index.html" aria-label="На главную">'+uiIcon('home')+'</a>';
const trigger=document.createElement('button');trigger.className='v4close fixed-menu-toggle';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls','mobile-menu');
trigger.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path class="menu-top" d="M4 6h16"/><path class="menu-mid" d="M4 12h16"/><path class="menu-bottom" d="M4 18h16"/></svg>';
const leftControl=document.createElement('div');leftControl.className='fixed-left';
const leftSurface=document.createElement('span');leftSurface.className='fixed-left-surface';leftSurface.setAttribute('aria-hidden','true');
leftControl.append(leftSurface,back,mode);dock.append(leftControl,trigger);if(download)dock.append(download);document.body.append(dock);
leftControl.dataset.tabs=String(isHome&&!arrival);
function setLeftTabs(show){
 leftControl.dataset.tabs=String(show);mode.inert=!show;back.inert=show;
 leftSurface.style.clipPath=show?'inset(0 0 0 0 round 22px)':'inset(0 calc(100% - 44px) 0 0 round 22px)';
}
setLeftTabs(isHome&&!arrival);
const sheet=document.createElement('dialog');sheet.id='mobile-menu';sheet.className='fixed-sheet';sheet.setAttribute('aria-label','Меню сайта');
sheet.innerHTML='<div class="fixed-handle" aria-hidden="true"><span></span></div><div class="fixed-scroll"></div><footer class="fixed-dock"></footer>';
const dimmer=document.createElement('div');dimmer.className='fixed-dimmer';dimmer.setAttribute('aria-hidden','true');document.body.append(dimmer,sheet);sheet.querySelector('.fixed-scroll').append(sidebar);
const footer=sheet.querySelector('footer');
function addProgressiveBlur(parent){
 const edge=document.createElement('div');edge.className='fixed-edge';edge.setAttribute('aria-hidden','true');
 edge.innerHTML='<span></span><span></span><span></span>';parent.prepend(edge);
}
addProgressiveBlur(dock);addProgressiveBlur(footer);
const lang=sidebar.querySelector('.lang'),sideBottom=sidebar.querySelector('.side-bottom');
if(lang&&sideBottom)sideBottom.append(lang);
if(sideBottom)sidebar.prepend(sideBottom);
const intro=sidebar.querySelector('.side-top'),home=document.getElementById('home');
if(intro){if(home){intro.classList.add('fixed-intro');home.prepend(intro)}else intro.remove()}


function syncLanguage(){
const english=sidebar.querySelector('[data-lang-btn="en"]')?.getAttribute('aria-pressed')==='true';
trigger.setAttribute('aria-label',english?(sheet.open?'Close menu':'Open menu'):(sheet.open?'Закрыть меню':'Открыть меню'));
sheet.setAttribute('aria-label',english?'Site menu':'Меню сайта');
dock.setAttribute('aria-label',english?'Main navigation':'Основная навигация');
back.querySelector('a').setAttribute('aria-label',english?'Home':'На главную');setLeftTabs(leftControl.dataset.tabs==='true');
}
const languageObserver=new MutationObserver(syncLanguage);languageObserver.observe(sidebar,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
syncLanguage();

function morph(open){
const paths=[...trigger.querySelectorAll('path')];
const closed=['translateY(0px) rotate(0deg)','scaleX(1)','translateY(0px) rotate(0deg)'];
const opened=['translateY(6px) rotate(45deg)','scaleX(0)','translateY(-6px) rotate(-45deg)'];
const from=open?closed:opened,to=open?opened:closed;
paths.forEach((p,i)=>{p.getAnimations().forEach(a=>a.cancel());p.style.transform=to[i];if(!matchMedia('(prefers-reduced-motion:reduce)').matches)p.animate([{transform:from[i]},{transform:to[i]}],{duration:320,easing:'cubic-bezier(.4,0,.2,1)'})});
}
let sheetAnimation,closing=false;
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const collapsedClip='inset(calc(100% - 88px - env(safe-area-inset-bottom, 0px)) 0 0 0 round 22px 24px 0 0)';
const expandedClip='inset(0 0 0 0 round 22px 24px 0 0)';
function open(){
sidebar.querySelectorAll('.subnav').forEach(sub=>{const row=sub.previousElementSibling;if(row?.matches('.v4row'))row.setAttribute('aria-expanded',String(!sub.hidden))});
closing=false;sheetAnimation?.cancel();dock.classList.remove('is-compact');footer.append(leftControl,trigger);sheet.showModal();getComputedStyle(leftSurface).clipPath;setLeftTabs(true);dimmer.classList.add('is-open');document.body.style.overflow='hidden';trigger.setAttribute('aria-expanded','true');morph(true);syncLanguage();trigger.focus({preventScroll:true});
if(!reduced())sheetAnimation=sheet.animate([{clipPath:collapsedClip,backgroundColor:'transparent'},{clipPath:expandedClip,backgroundColor:getComputedStyle(sheet).backgroundColor}],{duration:380,easing:'cubic-bezier(.32,.72,0,1)',fill:'both'});
}
function close(onClosed){
if(closing||!sheet.open)return;
closing=true;
dimmer.classList.remove('is-open');
const startClip=getComputedStyle(sheet).clipPath;
sheetAnimation?.cancel();morph(false);setLeftTabs(isHome);
const finish=()=>{dock.append(leftControl,trigger);sheet.close();sheetAnimation?.cancel();document.body.style.overflow='';trigger.setAttribute('aria-expanded','false');closing=false;syncLanguage();trigger.focus({preventScroll:true});if(typeof onClosed==='function')onClosed();previousY=scrollY;travel=0;dock.classList.remove('is-compact')};
if(reduced()){finish();return}
sheetAnimation=sheet.animate([{clipPath:startClip==='none'?expandedClip:startClip,backgroundColor:getComputedStyle(sheet).backgroundColor},{clipPath:collapsedClip,backgroundColor:'transparent'}],{duration:300,easing:'cubic-bezier(.32,.72,0,1)',fill:'both'});
sheetAnimation.onfinish=finish;
}
trigger.onclick=()=>sheet.open?close():open();
sheet.addEventListener('cancel',e=>{e.preventDefault();close()});
sheet.addEventListener('click',e=>{if(e.target===sheet&&e.clientY<sheet.getBoundingClientRect().top)close()});
function route(r){
const url=new URL(r,location.href);
savePosition();
if(!isHome&&(url.pathname.endsWith('/index.html')||url.pathname.endsWith('/'))&&!url.hash){try{sessionStorage.setItem('portfolio-mobile-arrival','home')}catch{}}
location.assign(url.href);
}

document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.hasAttribute('download')||a.target==='_blank')return;const raw=a.getAttribute('href');
if(sheet.contains(a)&&a.matches('.v4row[aria-current="page"]')){
const sub=a.nextElementSibling;
if(sub?.classList.contains('subnav')){e.preventDefault();e.stopImmediatePropagation();toggleSection(a,sub);return}
}
if(raw.startsWith('#')&&raw!=='#cv'&&raw!=='#'&&sheet.contains(a)){const el=document.getElementById(raw.slice(1));if(el){e.preventDefault();e.stopImmediatePropagation();close(()=>{scrollTo({top:scrollY+el.getBoundingClientRect().top-20,behavior:'instant'});el.tabIndex=-1;el.focus({preventScroll:true})})}return}
const u=new URL(a.href);if(u.origin===location.origin&&(/(index|case-[\w-]+|life)\.html$/.test(u.pathname)||raw==='#cv'||raw==='#')){e.preventDefault();e.stopImmediatePropagation();route(raw==='#cv'?'index.html#cv':raw==='#'?'index.html':u.href)}
},{capture:true,signal});
const sectionAnimations=new WeakMap();
function toggleSection(row,sub){
const expanding=row.getAttribute('aria-expanded')==='false'||sub.hidden;
const from=sub.hidden?0:sub.getBoundingClientRect().height;
sectionAnimations.get(sub)?.cancel();sub.hidden=false;sub.style.overflow='hidden';
const target=expanding?sub.scrollHeight:0;
row.setAttribute('aria-expanded',String(expanding));
if(reduced()){sub.hidden=!expanding;sub.style.overflow='';return}
const animation=sub.animate([{height:from+'px',opacity:expanding?.4:1},{height:target+'px',opacity:expanding?1:0}],{duration:360,easing:'cubic-bezier(.4,0,.2,1)'});
sectionAnimations.set(sub,animation);
animation.onfinish=()=>{sub.hidden=!expanding;sub.style.overflow='';sectionAnimations.delete(sub)};
}
if(isHome&&arrival){requestAnimationFrame(()=>{if(!signal.aborted)setLeftTabs(true)})}
let previousY=scrollY,travel=0,direction=0,scheduled=false;
addEventListener('scroll',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{
const delta=scrollY-previousY;previousY=scrollY;
if(scrollY<60){dock.classList.remove('is-compact');travel=0}
else if(!sheet.open&&Math.abs(delta)>1){const next=Math.sign(delta);if(next!==direction){direction=next;travel=0}travel+=Math.abs(delta);if(travel>(direction>0?72:24)){dock.classList.toggle('is-compact',direction>0);travel=0}}
scheduled=false;
})},{passive:true,signal});
dock.addEventListener('focusin',()=>dock.classList.remove('is-compact'));
function savePosition(){try{sessionStorage.setItem(positionKey(),String(scrollY))}catch{}}
addEventListener('pagehide',savePosition,{signal});
if(isHome&&!location.hash){const y=Number(sessionStorageGet(positionKey()))||0;if(y)requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!signal.aborted){scrollTo(0,y);previousY=scrollY;travel=0}}))}
return ()=>{
clearTouch();delete document.body.dataset.navInput;savePosition();controller.abort();languageObserver.disconnect();sheetAnimation?.cancel();
[...sheet.getAnimations({subtree:true}),...dock.getAnimations({subtree:true})].filter(a=>!('animationName' in a)&&!('transitionProperty' in a)).forEach(a=>a.cancel());
if(sheet.open)sheet.close();
sidebar.querySelectorAll('.subnav').forEach(el=>{el.hidden=false;el.style.overflow=''});
sidebar.querySelectorAll('[aria-expanded]').forEach(el=>el.removeAttribute('aria-expanded'));
mode.inert=false;intro?.classList.remove('fixed-intro');download?.classList.remove('fixed-download');
restore.reverse().forEach(fn=>fn());
sheet.remove();dimmer.remove();dock.remove();document.body.style.overflow='';document.body.classList.remove('mobile-bottom-nav','nav-open');
};


}
mobile.addEventListener('change',sync);
sync();
})();
