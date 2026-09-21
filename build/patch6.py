#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Просмотр картинок: приближение, перетаскивание, понятные кнопки.

Что меняется по сравнению с прежним просмотром:
  * окно разделено на три полосы — панель сверху, картинка в середине,
    подпись снизу. Картинка больше не наезжает на кнопки, и на белых
    картинках кнопки остаются видимыми;
  * картинка открывается вписанной целиком, дальше приближается
    колесом, щипком, щелчком или кнопками;
  * перетаскивание считается по свободной области, а не по окну —
    поэтому «лапка» работает;
  * мышь и пальцы обрабатываются одним кодом (pointer events),
    поэтому щипок, перетаскивание и свайп не мешают друг другу.
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


def cut(t, start, end_after, f, what):
    i = t.find(start)
    if i < 0:
        die("%s: не найдено начало %s" % (f, what))
    j = t.find(end_after, i)
    if j < 0:
        die("%s: не найден конец %s" % (f, what))
    return i, j + len(end_after)


# ---------------- разметка ----------------
OLD_MARKUP = '''<div class="lightbox" id="lightbox">
  <button class="lightbox-close" aria-label="Закрыть">✕</button>
  <button class="lightbox-nav prev" aria-label="Предыдущее">‹</button>
  <img src="" alt="">
  <button class="lightbox-nav next" aria-label="Следующее">›</button>
  <div class="lightbox-meta"><span class="cap"></span><span class="count"></span></div>
</div>'''

NEW_MARKUP = '''<div class="lightbox" id="lightbox">
  <div class="lightbox-bar">
    <div class="lightbox-zoom">
      <button class="zoom-out" aria-label="Отдалить">−</button>
      <span class="lvl">100%</span>
      <button class="zoom-in" aria-label="Приблизить">+</button>
      <button class="zoom-fit" aria-label="Вписать в экран">Вписать</button>
    </div>
    <button class="lightbox-close" aria-label="Закрыть">✕</button>
  </div>
  <div class="lightbox-stage">
    <button class="lightbox-nav prev" aria-label="Предыдущее">‹</button>
    <img src="" alt="">
    <button class="lightbox-nav next" aria-label="Следующее">›</button>
  </div>
  <div class="lightbox-meta"><span class="cap"></span><span class="count"></span></div>
</div>'''

# ---------------- стили ----------------
NEW_CSS = '''.lightbox{position:fixed;inset:0;z-index:100;background:rgba(19,19,22,.94);
  display:none;flex-direction:column}
.lightbox.open{display:flex}

/* верхняя полоса: масштаб слева, закрытие справа. Картинка сюда не заходит */
.lightbox-bar{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;
  gap:12px;padding:14px 20px}
.lightbox-close{width:40px;height:40px;border-radius:50%;flex:0 0 auto;
  background:rgba(255,255,255,.14);color:#fff;font-size:1.3rem;line-height:1;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:background .18s}
.lightbox-close:hover{background:rgba(255,255,255,.26)}

.lightbox-zoom{display:flex;align-items:center;gap:2px;
  background:rgba(255,255,255,.14);border-radius:20px;padding:4px;color:#fff}
.lightbox-zoom button{width:32px;height:32px;border-radius:50%;background:none;color:#fff;
  font-size:1.15rem;line-height:1;cursor:pointer;transition:background .18s;
  display:flex;align-items:center;justify-content:center}
.lightbox-zoom button:hover{background:rgba(255,255,255,.24)}
.lightbox-zoom button:disabled{opacity:.35;cursor:default;background:none}
.lightbox-zoom .lvl{min-width:52px;text-align:center;font-size:.8rem;
  color:rgba(255,255,255,.85);font-variant-numeric:tabular-nums}
.lightbox-zoom .zoom-fit{width:auto;padding:0 12px;font-size:.8rem;border-radius:16px}

/* середина: только картинка, всё лишнее обрезается по краям области */
.lightbox-stage{flex:1 1 auto;min-height:0;position:relative;overflow:hidden;
  display:flex;align-items:center;justify-content:center;padding:0 20px;touch-action:none}
.lightbox-stage img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;
  cursor:zoom-in;will-change:transform;user-select:none;-webkit-user-drag:none}
.lightbox.zoomed .lightbox-stage img{border-radius:0;cursor:grab}
.lightbox.zoomed .lightbox-stage.grabbing img{cursor:grabbing}
.lightbox.zoomed .lightbox-nav{display:none!important}

/* листание */
.lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;
  background:rgba(255,255,255,.14);color:#fff;font-size:1.8rem;line-height:1;z-index:2;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:background .18s}
.lightbox-nav:hover{background:rgba(255,255,255,.26)}
.lightbox-nav.prev{left:24px}
.lightbox-nav.next{right:24px}

.lightbox-meta{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:12px;
  padding:14px 20px;color:rgba(255,255,255,.85);font-size:.9rem;min-height:20px}
.lightbox-meta .count{color:rgba(255,255,255,.5);font-variant-numeric:tabular-nums}
@media (max-width:640px){
  .lightbox-bar{padding:10px 12px}
  .lightbox-stage{padding:0 8px}
  .lightbox-nav{width:40px;height:40px;font-size:1.4rem}
  .lightbox-nav.prev{left:8px}
  .lightbox-nav.next{right:8px}
  .lightbox-zoom .zoom-fit{padding:0 10px}
}'''

# ---------------- состояние ----------------
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
      lbStage=lb.querySelector(".lightbox-stage"),
      lbCap=lb.querySelector(".cap"), lbCount=lb.querySelector(".count"),
      lbLvl=lb.querySelector(".lightbox-zoom .lvl");
let gallery=[], idx=0;

/* ——— масштаб ———
   z=1 — картинка вписана в свободную область целиком.
   tx/ty — сдвиг, чтобы рассмотреть край приближённой картинки.
   Пределы сдвига считаем по области показа, а не по всему окну:
   сверху и снизу полосы с кнопками, туда картинка заезжать не должна. */
const ZMIN=1, ZMAX=8, ZSTEP=1.4;
let z=1, tx=0, ty=0;

function limits(){
  const w=lbImg.offsetWidth*z, h=lbImg.offsetHeight*z;
  return { mx:Math.max(0,(w-lbStage.clientWidth)/2),
           my:Math.max(0,(h-lbStage.clientHeight)/2) };
}
function clampPan(){
  const l=limits();
  tx=Math.min(l.mx, Math.max(-l.mx, tx));
  ty=Math.min(l.my, Math.max(-l.my, ty));
}
function paintZoom(animate){
  lbImg.style.transition = animate ? "transform .2s ease" : "none";
  lbImg.style.transform  = `translate(${tx}px, ${ty}px) scale(${z})`;
  lb.classList.toggle("zoomed", z>ZMIN);
  if(lbLvl) lbLvl.textContent = Math.round(z*100)+"%";
  const out=lb.querySelector(".zoom-out"), inn=lb.querySelector(".zoom-in");
  if(out) out.disabled = z<=ZMIN+.001;
  if(inn) inn.disabled = z>=ZMAX-.001;
}
/* приближаем так, чтобы точка (cx,cy) осталась под курсором */
function setZoom(next, cx, cy, animate){
  next=Math.min(ZMAX, Math.max(ZMIN, next));
  if(Math.abs(next-z)<.0001) return;
  if(cx!=null){
    const r=lbImg.getBoundingClientRect();
    const k=next/z-1;
    tx-=(cx-(r.left+r.width/2))*k;
    ty-=(cy-(r.top+r.height/2))*k;
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

# ---------------- обработчики ----------------
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
  if(!lb.classList.contains("open")) return;
  if(e.target.closest(".lightbox-nav.prev")){ showImg(idx-1); return; }
  if(e.target.closest(".lightbox-nav.next")){ showImg(idx+1); return; }
  if(e.target.closest(".lightbox-close")){ closeLb(); return; }
  if(e.target.closest(".zoom-in")){  setZoom(z*ZSTEP, null, null, true); return; }
  if(e.target.closest(".zoom-out")){ setZoom(z/ZSTEP, null, null, true); return; }
  if(e.target.closest(".zoom-fit")){ resetZoom(true); return; }
  if(e.target===lbImg){                            // щелчок по картинке приближает
    if(!dragged && z===ZMIN) setZoom(2.5, e.clientX, e.clientY, true);
    return;
  }
  // мимо картинки и мимо кнопок — закрыть
  if(!dragged && !e.target.closest(".lightbox-bar, .lightbox-nav")) closeLb();
});
lbImg.addEventListener("dblclick", e=>{ e.preventDefault(); if(z>ZMIN) resetZoom(true); });

document.addEventListener("keydown", e=>{
  if(!lb.classList.contains("open")) return;
  if(e.key==="Escape") return closeLb();
  if(e.key==="+"||e.key==="="){ e.preventDefault(); return setZoom(z*ZSTEP,null,null,true); }
  if(e.key==="-"||e.key==="_"){ e.preventDefault(); return setZoom(z/ZSTEP,null,null,true); }
  if(e.key==="0"){ e.preventDefault(); return resetZoom(true); }
  if(e.key==="ArrowLeft"||e.key==="ArrowRight"){
    const back=e.key==="ArrowLeft";
    if(z>ZMIN){ e.preventDefault(); tx+=back?60:-60; clampPan(); paintZoom(true); }
    else showImg(back ? idx-1 : idx+1);
  }
  if(z>ZMIN && (e.key==="ArrowUp"||e.key==="ArrowDown")){
    e.preventDefault();
    ty += e.key==="ArrowUp" ? 60 : -60; clampPan(); paintZoom(true);
  }
});

/* колесо мыши и трекпад */
lbStage.addEventListener("wheel", e=>{
  if(!lb.classList.contains("open")) return;
  e.preventDefault();
  setZoom(z * (e.deltaY<0 ? 1.16 : 1/1.16), e.clientX, e.clientY, false);
}, {passive:false});

/* Мышь и пальцы — один код. Один указатель тянет картинку (или листает,
   если не приближено), два указателя — щипок. */
const pts=new Map();
let panStart=null, pinchStart=null, dragged=false;

function midOf(){
  const a=[...pts.values()];
  return { x:(a[0].x+a[1].x)/2, y:(a[0].y+a[1].y)/2,
           d:Math.hypot(a[0].x-a[1].x, a[0].y-a[1].y) };
}
lbStage.addEventListener("pointerdown", e=>{
  if(e.target.closest(".lightbox-nav")) return;
  pts.set(e.pointerId, {x:e.clientX, y:e.clientY});
  dragged=false;
  if(pts.size===1){
    panStart={x:e.clientX, y:e.clientY, tx:tx, ty:ty};
    try{ lbStage.setPointerCapture(e.pointerId); }catch(err){}
    if(z>ZMIN) lbStage.classList.add("grabbing");
  } else if(pts.size===2){
    const m=midOf();
    pinchStart={d:m.d, z:z};
    panStart=null;
    lbStage.classList.remove("grabbing");
  }
});
lbStage.addEventListener("pointermove", e=>{
  if(!pts.has(e.pointerId)) return;
  pts.set(e.pointerId, {x:e.clientX, y:e.clientY});

  if(pts.size>=2 && pinchStart){
    const m=midOf();
    setZoom(pinchStart.z * m.d/pinchStart.d, m.x, m.y, false);
    return;
  }
  if(!panStart) return;
  const dx=e.clientX-panStart.x, dy=e.clientY-panStart.y;
  if(Math.abs(dx)+Math.abs(dy)>4) dragged=true;
  if(z>ZMIN){                                      // приближено — двигаем картинку
    tx=panStart.tx+dx; ty=panStart.ty+dy;
    clampPan(); paintZoom(false);
  }
});
function endPointer(e){
  if(!pts.has(e.pointerId)) return;
  const start=panStart;
  pts.delete(e.pointerId);
  if(pts.size<2) pinchStart=null;
  if(pts.size===0){
    lbStage.classList.remove("grabbing");
    panStart=null;
    // не приближено и был заметный горизонтальный жест — листаем
    if(start && z===ZMIN && gallery.length>1){
      const dx=e.clientX-start.x, dy=e.clientY-start.y;
      if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)) showImg(dx>0 ? idx-1 : idx+1);
    }
    setTimeout(()=>{ dragged=false; }, 0);         // чтобы клик после перетаскивания не сработал
  }
}
["pointerup","pointercancel"].forEach(t=>lbStage.addEventListener(t, endPointer));

addEventListener("resize", ()=>{ if(lb.classList.contains("open")){ clampPan(); paintZoom(false); } });'''


def patch(f):
    p = os.path.join(DST, f)
    t = open(p, encoding="utf-8").read()

    t = once(t, OLD_MARKUP, NEW_MARKUP, f, "разметка просмотра")

    i, j = cut(t, ".lightbox{position:fixed;inset:0;z-index:100;",
               ".lightbox-nav.next{right:10px}\n}", f, "стили просмотра")
    t = t[:i] + NEW_CSS + t[j:]

    t = once(t, OLD_HEAD, NEW_HEAD, f, "состояние просмотра")

    # обработчики идут от openLb до меню-бургера. На четырёх страницах
    # этот кусок был обрезан на полуслове — свайп там не работал вовсе.
    i = t.find("function openLb(btn){")
    j = t.find('$("#burger")', i)
    if i < 0 or j < 0:
        die("%s: не найден блок обработчиков просмотра" % f)
    had_swipe = "touchend" in t[i:j]
    t = t[:i] + NEW_TAIL + "\n\n" + t[j:]

    open(p, "w", encoding="utf-8").write(t)
    print("готово:", f, "" if had_swipe else "(листание свайпом было сломано — починено)")


if __name__ == "__main__":
    if os.path.exists(DST):
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST)
    for c in CASES:
        patch(c)
