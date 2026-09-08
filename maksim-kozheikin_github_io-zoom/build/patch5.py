#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Просмотр картинок: приближение и перетаскивание.

  * колесо мыши — плавный зум к точке под курсором;
  * щипок двумя пальцами — на телефоне;
  * щелчок по картинке приближает, двойной щелчок возвращает;
  * перетаскивание мышью или пальцем двигает приближённую картинку;
  * кнопки − / % / + / «Вписать» и клавиши + − 0;
  * листание и свайп работают только пока не приближено.
"""
import os, re, shutil, sys

SRC, DST = sys.argv[1], sys.argv[2]
CASES = ["case-loko.html", "case-medsi.html", "case-rwb.html",
         "case-sberpravo.html", "case-vtb.html", "case-zephyr.html"]


def die(m):
    raise SystemExit("ОШИБКА: " + m)


def once(t, old, new, f, what):
    n = t.count(old)
    if n != 1:
        die("%s: %s — ожидался один фрагмент, найдено %d" % (f, what, n))
    return t.replace(old, new, 1)


# ---------- разметка: панель масштаба ----------
OLD_MARKUP = '''  <div class="lightbox-meta"><span class="cap"></span><span class="count"></span></div>'''
NEW_MARKUP = '''  <div class="lightbox-zoom">
    <button class="zoom-out" aria-label="Отдалить">−</button>
    <span class="lvl">100%</span>
    <button class="zoom-in" aria-label="Приблизить">+</button>
    <button class="zoom-fit" aria-label="Вписать в экран">Вписать</button>
  </div>
  <div class="lightbox-meta"><span class="cap"></span><span class="count"></span></div>'''

# ---------- стили ----------
OLD_CSS = '''.lightbox img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px}'''
NEW_CSS = '''.lightbox img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;
  cursor:zoom-in;will-change:transform}
.lightbox.zoomed{cursor:default}
.lightbox.zoomed img{border-radius:0;cursor:grab;touch-action:none}
.lightbox.zoomed img.grabbing{cursor:grabbing}
.lightbox.zoomed .lightbox-nav{opacity:.25}

/* панель масштаба */
.lightbox-zoom{position:absolute;top:20px;left:24px;z-index:2;display:flex;align-items:center;gap:2px;
  background:rgba(255,255,255,.12);border-radius:20px;padding:4px;color:#fff}
.lightbox-zoom button{width:32px;height:32px;border-radius:50%;background:none;color:#fff;
  font-size:1.15rem;line-height:1;display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:background .18s}
.lightbox-zoom button:hover{background:rgba(255,255,255,.22)}
.lightbox-zoom button:disabled{opacity:.35;cursor:default;background:none}
.lightbox-zoom .lvl{min-width:52px;text-align:center;font-size:.8rem;
  color:rgba(255,255,255,.85);font-variant-numeric:tabular-nums}
.lightbox-zoom .zoom-fit{width:auto;padding:0 12px;font-size:.8rem;border-radius:16px}'''

OLD_CSS_MEDIA = '''@media (max-width:640px){
  .lightbox-nav{width:40px;height:40px;font-size:1.4rem}
  .lightbox-nav.prev{left:10px}
  .lightbox-nav.next{right:10px}
}'''
NEW_CSS_MEDIA = '''@media (max-width:640px){
  .lightbox-nav{width:40px;height:40px;font-size:1.4rem}
  .lightbox-nav.prev{left:10px}
  .lightbox-nav.next{right:10px}
  .lightbox-zoom{top:auto;bottom:70px;left:50%;transform:translateX(-50%)}
}'''

# ---------- голова: состояние масштаба ----------
OLD_HEAD = '''const lb=$("#lightbox"), lbImg=lb.querySelector("img"),
      lbCap=lb.querySelector(".cap"), lbCount=lb.querySelector(".count");
let gallery=[], idx=0;

function showImg(i){
  if(!gallery.length) return;
  idx=(i+gallery.length)%gallery.length;          // зацикливаем
  const g=gallery[idx];
  lbImg.src=g.src; lbImg.alt=g.cap||"";
  lbCap.textContent=g.cap||"";
  lbCount.textContent=gallery.length>1 ? `${idx+1} / ${gallery.length}` : "";
  lb.querySelectorAll(".lightbox-nav").forEach(b=>b.style.display=gallery.length>1?"flex":"none");
}'''

NEW_HEAD = '''const lb=$("#lightbox"), lbImg=lb.querySelector("img"),
      lbCap=lb.querySelector(".cap"), lbCount=lb.querySelector(".count"),
      lbLvl=lb.querySelector(".lightbox-zoom .lvl");
let gallery=[], idx=0;

/* ——— масштаб ———
   z = 1 — картинка вписана в экран, дальше приближаем до MAX.
   tx/ty — сдвиг, чтобы можно было рассмотреть край увеличенной картинки. */
const ZMIN=1, ZMAX=8, ZSTEP=1.4;
let z=1, tx=0, ty=0;

function paintZoom(animate){
  lbImg.style.transition = animate ? "transform .2s ease" : "none";
  lbImg.style.transform  = `translate(${tx}px, ${ty}px) scale(${z})`;
  lb.classList.toggle("zoomed", z>1);
  if(lbLvl) lbLvl.textContent = Math.round(z*100)+"%";
  const out=lb.querySelector(".zoom-out"), inn=lb.querySelector(".zoom-in");
  if(out) out.disabled = z<=ZMIN+.001;
  if(inn) inn.disabled = z>=ZMAX-.001;
}
/* не даём утащить картинку за пределы экрана */
function clampPan(){
  const w=lbImg.offsetWidth*z, h=lbImg.offsetHeight*z;
  const mx=Math.max(0,(w-innerWidth)/2), my=Math.max(0,(h-innerHeight)/2);
  tx=Math.min(mx, Math.max(-mx, tx));
  ty=Math.min(my, Math.max(-my, ty));
}
/* приближаем так, чтобы точка (cx,cy) осталась на месте */
function setZoom(next, cx, cy, animate){
  next=Math.min(ZMAX, Math.max(ZMIN, next));
  if(Math.abs(next-z)<.0001) return;
  if(cx!=null){
    const r=lbImg.getBoundingClientRect();
    const ox=cx-(r.left+r.width/2), oy=cy-(r.top+r.height/2);
    const k=next/z-1;
    tx-=ox*k; ty-=oy*k;
  }
  z=next;
  if(z===ZMIN){ tx=0; ty=0; }
  clampPan(); paintZoom(animate);
}
function resetZoom(animate){ z=ZMIN; tx=0; ty=0; paintZoom(animate); }

function showImg(i){
  if(!gallery.length) return;
  idx=(i+gallery.length)%gallery.length;          // зацикливаем
  const g=gallery[idx];
  lbImg.src=g.src; lbImg.alt=g.cap||"";
  lbCap.textContent=g.cap||"";
  lbCount.textContent=gallery.length>1 ? `${idx+1} / ${gallery.length}` : "";
  lb.querySelectorAll(".lightbox-nav").forEach(b=>b.style.display=gallery.length>1?"flex":"none");
  resetZoom(false);                                // новая картинка — снова вписана
}'''

# ---------- хвост: открытие, клавиши, мышь, касания ----------
OLD_TAIL_START = "function openLb(btn){"
OLD_TAIL_END = '''lb.addEventListener("touchend",e=>{
  const d=e.changedTouches[0].clientX-tx;
  if(Math.abs(d)>50) showImg(d>0 ? idx-1 : idx+1);
},{passive:true});'''

NEW_TAIL = '''function openLb(btn){
  // собираем всю группу картинок этого ряда
  const row=btn.closest(".figs");
  gallery=[...row.querySelectorAll(".fig-btn")].map(b=>({
    src:b.getAttribute("data-full"),
    cap:b.closest(".fig").querySelector("figcaption")?.textContent||""
  }));
  showImg([...row.querySelectorAll(".fig-btn")].indexOf(btn));
  lb.classList.add("open");
}
function closeLb(){ lb.classList.remove("open"); resetZoom(false); }

document.addEventListener("click", e=>{
  const btn=e.target.closest(".fig-btn");
  if(btn){ openLb(btn); return; }
  if(e.target.closest(".lightbox-nav.prev")){ showImg(idx-1); return; }
  if(e.target.closest(".lightbox-nav.next")){ showImg(idx+1); return; }
  if(e.target.closest(".lightbox-close")){ closeLb(); return; }
  if(e.target.closest(".zoom-in")){  setZoom(z*ZSTEP, null, null, true); return; }
  if(e.target.closest(".zoom-out")){ setZoom(z/ZSTEP, null, null, true); return; }
  if(e.target.closest(".zoom-fit")){ resetZoom(true); return; }
  // щелчок по самой картинке приближает
  if(e.target===lbImg && lb.classList.contains("open")){
    if(!panned && z===ZMIN) setZoom(2.5, e.clientX, e.clientY, true);
    return;
  }
  // клик по фону (не по картинке) — закрыть
  if(e.target===lb) closeLb();
});
lbImg.addEventListener("dblclick", e=>{ e.preventDefault(); if(z>ZMIN) resetZoom(true); });

document.addEventListener("keydown", e=>{
  if(!lb.classList.contains("open")) return;
  if(e.key==="Escape") return closeLb();
  if(e.key==="+"||e.key==="="){ e.preventDefault(); return setZoom(z*ZSTEP,null,null,true); }
  if(e.key==="-"||e.key==="_"){ e.preventDefault(); return setZoom(z/ZSTEP,null,null,true); }
  if(e.key==="0"){ e.preventDefault(); return resetZoom(true); }
  if(e.key==="ArrowLeft"||e.key==="ArrowRight"){
    const back = e.key==="ArrowLeft";
    if(z>ZMIN){                                   // приближено — стрелки двигают картинку
      e.preventDefault();
      tx += back ? 60 : -60; clampPan(); paintZoom(true);
    } else showImg(back ? idx-1 : idx+1);
  }
  if(z>ZMIN && (e.key==="ArrowUp"||e.key==="ArrowDown")){
    e.preventDefault();
    ty += e.key==="ArrowUp" ? 60 : -60; clampPan(); paintZoom(true);
  }
});

/* колесо мыши и трекпад */
lb.addEventListener("wheel", e=>{
  if(!lb.classList.contains("open")) return;
  e.preventDefault();
  setZoom(z * (e.deltaY<0 ? 1.16 : 1/1.16), e.clientX, e.clientY, false);
}, {passive:false});

/* перетаскивание приближённой картинки */
let dragId=null, dsx=0, dsy=0, dtx=0, dty=0, panned=false;
lbImg.addEventListener("pointerdown", e=>{
  if(z<=ZMIN || e.pointerType==="touch") return;   // касания разбираем отдельно
  dragId=e.pointerId; panned=false;
  dsx=e.clientX; dsy=e.clientY; dtx=tx; dty=ty;
  lbImg.setPointerCapture(dragId);
  lbImg.classList.add("grabbing");
});
lbImg.addEventListener("pointermove", e=>{
  if(e.pointerId!==dragId) return;
  tx=dtx+(e.clientX-dsx); ty=dty+(e.clientY-dsy);
  if(Math.abs(e.clientX-dsx)+Math.abs(e.clientY-dsy)>4) panned=true;
  clampPan(); paintZoom(false);
});
["pointerup","pointercancel"].forEach(t=>lbImg.addEventListener(t, e=>{
  if(e.pointerId!==dragId) return;
  dragId=null; lbImg.classList.remove("grabbing");
  setTimeout(()=>{ panned=false; }, 0);            // чтобы клик после перетаскивания не приближал
}));

/* касания: щипок приближает, один палец двигает или листает */
let pinch=null, tsx=0, tsy=0, ttx=0, tty=0, tmoved=false;
const tdist=t=>Math.hypot(t[0].clientX-t[1].clientX, t[0].clientY-t[1].clientY);
lb.addEventListener("touchstart", e=>{
  if(e.touches.length===2){
    pinch={d:tdist(e.touches)};
  } else if(e.touches.length===1){
    tsx=e.touches[0].clientX; tsy=e.touches[0].clientY;
    ttx=tx; tty=ty; tmoved=false;
  }
}, {passive:true});
lb.addEventListener("touchmove", e=>{
  if(pinch && e.touches.length===2){
    e.preventDefault();
    const d=tdist(e.touches);
    const mx=(e.touches[0].clientX+e.touches[1].clientX)/2;
    const my=(e.touches[0].clientY+e.touches[1].clientY)/2;
    setZoom(z*d/pinch.d, mx, my, false);
    pinch.d=d;
  } else if(e.touches.length===1 && z>ZMIN){
    e.preventDefault();                            // двигаем картинку, а не страницу
    tx=ttx+(e.touches[0].clientX-tsx);
    ty=tty+(e.touches[0].clientY-tsy);
    tmoved=true; clampPan(); paintZoom(false);
  }
}, {passive:false});
lb.addEventListener("touchend", e=>{
  if(e.touches.length<2) pinch=null;
  if(z>ZMIN || tmoved) { tmoved=false; return; }   // приближено — не листаем
  const d=e.changedTouches[0].clientX-tsx;
  if(Math.abs(d)>50) showImg(d>0 ? idx-1 : idx+1);
}, {passive:true});

addEventListener("resize", ()=>{ if(lb.classList.contains("open")){ clampPan(); paintZoom(false); } });'''


def patch(f):
    p = os.path.join(DST, f)
    t = open(p, encoding="utf-8").read()

    t = once(t, OLD_MARKUP, NEW_MARKUP, f, "разметка лайтбокса")
    t = once(t, OLD_CSS, NEW_CSS, f, "стиль картинки")
    t = once(t, OLD_CSS_MEDIA, NEW_CSS_MEDIA, f, "медиазапрос")
    t = once(t, OLD_HEAD, NEW_HEAD, f, "состояние лайтбокса")

    # блок обработчиков заканчивается там, где начинается меню-бургер.
    # На четырёх страницах он к тому же обрывался на полуслове: обработчик
    # свайпа был скопирован не полностью, и листание пальцем не работало.
    i = t.find(OLD_TAIL_START)
    j = t.find('$("#burger")', i)
    if i < 0 or j < 0:
        die("%s: не найден блок обработчиков лайтбокса" % f)
    had_swipe = "touchend" in t[i:j]
    t = t[:i] + NEW_TAIL + "\n\n" + t[j:]
    if not had_swipe:
        print("   (на этой странице листание свайпом было сломано — починено)")

    open(p, "w", encoding="utf-8").write(t)
    print("готово:", f)


if __name__ == "__main__":
    if os.path.exists(DST):
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST)
    for c in CASES:
        patch(c)
