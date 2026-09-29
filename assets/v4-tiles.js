/* ============================================================
   МОЗАИКА ПЛИТОК «РАБОТА + ЖИЗНЬ» — логика.
   Настройки размеров и картинок — в assets/v4-tiles-data.js.
   Правка размеров включается в CRM (?crm или #crm) и по #tiles.
============================================================ */
/* ритм по умолчанию: широкая, четыре вертикальные, широкая с двумя, три высокие */
const TILE_RHYTHM = [[12,5],[3,5],[3,5],[3,5],[3,5],[6,4],[3,4],[3,4],[4,6],[4,6],[4,6]];
const TILE_PRESETS = [
  {k:"phone", t:"Телефон 2×4",   w:2,  h:4, ic:[4,8]},
  {k:"port",  t:"Портрет 3×4",   w:3,  h:4, ic:[6,8]},
  {k:"sq",    t:"Квадрат 3×3",   w:3,  h:3, ic:[7,7]},
  {k:"land",  t:"Альбом 4×3",    w:4,  h:3, ic:[9,7]},
  {k:"wide",  t:"Широкая 6×3",   w:6,  h:3, ic:[12,6]},
  {k:"full",  t:"Во всю ширину", w:12, h:5, ic:[14,6]}
];
const V4_TILES_LS = "v4tiles2";
const v4TilesEdit = () => !!window.__V4CRM || /[?&#](crm|tiles)\b/.test(location.search + location.hash) || document.documentElement.classList.contains("crm-on");
function v4TilesLocal(){ try{ return JSON.parse(localStorage.getItem(V4_TILES_LS)||"{}"); }catch(e){ return {}; } }
function v4TilesSave(o){ try{ localStorage.setItem(V4_TILES_LS, JSON.stringify(o)); }catch(e){} }

function v4MosaicList(mode){
  const local = v4TilesEdit() ? v4TilesLocal() : {};
  const conf = (typeof V4_TILES!=="undefined") ? V4_TILES : {};
  const out = []; let r = 0;
  const push = (id, item, e) => {
    (conf[id] || [null]).forEach((c, n)=>{
      const rh = TILE_RHYTHM[r++ % TILE_RHYTHM.length];
      const base = c || {w:rh[0], h:rh[1]};
      const key = `${id}:${n}`, loc = local[key] || {};
      out.push({key, id, n, e, item, w:loc.w||base.w, h:loc.h||base.h, img:base.img||"", fit:base.fit||"cover"});
    });
  };
  if(mode==="work") (typeof V4_WORK_TILES!=="undefined" ? V4_WORK_TILES : []).forEach(t=>push("w:"+t.id, t, null));
  else V4.timeline.filter(e=>!e.hidden).forEach(e=>push(e.id || e.project, null, e));
  /* порядок: перетаскивание в CRM → V4_TILES_ORDER → как в списке */
  const ord = (local.__order && local.__order[mode]) || (typeof V4_TILES_ORDER!=="undefined" && V4_TILES_ORDER[mode]) || null;
  if(ord){ const pos = k => { const i = ord.indexOf(k); return i<0 ? 1e6 : i; };
    out.forEach((t,i)=>t._i=i); out.sort((x,y)=>(pos(x.key)-pos(y.key)) || (x._i-y._i)); }
  return out;
}

function v4Mosaic(L, mode){
  const edit = v4TilesEdit();
  const ico = ([w,h]) => `<svg viewBox="0 0 16 10" width="16" height="10"><rect x="${(16-w)/2}" y="${(10-h)/2}" width="${w}" height="${h}" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;
  return v4MosaicList(mode).map(t=>{
    const e = t.e, it = t.item;
    const p = e && e.project ? PROJECTS.find(x=>x.id===e.project) : null;
    const href = it ? it.href : (p ? p.href : `life.html?id=${e.id}`);
    const top = it ? v4Txt(it.co, L) : e.yr;
    const name = it ? v4Txt(it.ti, L) : v4Txt(e.ti, L);
    const img = t.img ? `<span class="m-img${t.fit==="contain"?" m-contain":""}"><img src="${t.img}" alt="" loading="lazy"></span>` : "";
    const ed = edit ? `<span class="m-lbl">${t.w}×${t.h}</span><span class="m-rs" title="Потяните, чтобы изменить размер"></span>` : "";
    return `<a class="m-tile${t.img?"":" m-empty"}" href="${href}"${edit?' draggable="true"':''} style="--w:${t.w};--h:${t.h};--wm:${Math.min(t.w,6)}" data-key="${t.key}">
      ${img}
      <span class="row-yr">${top}</span>
      <span class="row-ti">${name}</span>
      <span class="row-arr">›</span>${ed}
    </a>`;
  }).join("");
}

const V4_TILES_HEADER = "/* ============================================================\n   НАСТРОЙКИ ПЛИТОК «РАБОТА + ЖИЗНЬ»\n   Этот файл удобно править через CRM: откройте главную с ?crm,\n   включите «Работа + Жизнь», меняйте размеры кнопками на плитках\n   и нажмите «Скачать v4-tiles-data.js» — скачанный файл положите\n   в папку assets вместо этого.\n\n   Сетка — 12 колонок, клетки квадратные.\n     w — ширина в клетках (12 — на всю ширину), h — высота в клетках.\n     Телефон 2×4, портрет 3×4, квадрат 3×3, альбом 4×3, широкая 6×3.\n   img — картинка из assets (необязательно). Каждая картинка — отдельная плитка.\n   fit — \"cover\" (заполнить, по умолчанию) или \"contain\" (вписать целиком).\n\n   Пример — керамика с двумя работами:\n     ceramics:[{w:3,h:4,img:\"assets/ceramics-1.webp\"},{w:3,h:4,img:\"assets/ceramics-2.webp\"}],\n============================================================ */\n";
function v4TilesFile(){
  const res = {};
  const ORD = {work:v4MosaicList("work").map(t=>t.key), life:v4MosaicList("life").map(t=>t.key)};
  [...v4MosaicList("life"), ...v4MosaicList("work")].forEach(t=>{
    const c = {w:t.w, h:t.h}; if(t.img){ c.img=t.img; if(t.fit!=="cover") c.fit=t.fit; }
    (res[t.id] = res[t.id] || [])[t.n] = c;
  });
  const body = Object.entries(res).map(([k,v])=>`  ${/^[a-z_]\w*$/i.test(k)?k:JSON.stringify(k)}:[${v.map(c=>"{"+Object.entries(c).map(([a,b])=>a+":"+JSON.stringify(b)).join(",")+"}").join(",")}]`).join(",\n");
  return V4_TILES_HEADER + `const V4_TILES = {\n${body}\n};\n` + "\n/* порядок плиток (меняется перетаскиванием в CRM) */\nconst V4_TILES_ORDER = " + JSON.stringify(ORD) + ";\n" + (typeof V4_WORK_TILES!=="undefined" ? "\nconst V4_WORK_TILES = " + JSON.stringify(V4_WORK_TILES, null, 2) + ";\n" : "");
}

/* ============================================================
   ПРАВКА ПЛИТОК В CRM
   • перетащите плитку — поменяется порядок;
   • потяните за уголок справа внизу — изменится размер (по клеткам сетки);
   • нажмите на плитку — внизу появятся заготовки форм и точная подстройка.
============================================================ */
let V4_SEL = null;
function v4TilesBindEditor(box, rerender){
  if(!v4TilesEdit()) return;
  const mode = () => box.dataset.mode || "work";
  const tiles = () => [...box.querySelectorAll(".m-tile")];
  const save = (fn) => { const loc = v4TilesLocal(); fn(loc); v4TilesSave(loc); };
  const setSize = (key, w, h) => save(loc=>{ loc[key] = {w, h}; });
  const cell = () => { const cs = getComputedStyle(box); const gap = parseFloat(cs.columnGap)||12; const cols = cs.gridTemplateColumns.split(" ").length || 12;
    return {gap, c:(box.clientWidth - gap*(cols-1))/cols, cols}; };

  /* выделение и панель */
  const mark = () => { tiles().forEach(t=>t.classList.toggle("m-sel", t.dataset.key===V4_SEL)); v4TilesBar(box, rerender); };
  mark();
  if(box.__v4ed) return;
  box.__v4ed = true;

  box.addEventListener("click", ev=>{
    const t = ev.target.closest(".m-tile"); if(!t) return;
    ev.preventDefault();
    V4_SEL = t.dataset.key; mark();
  }, true);

  /* перетаскивание — порядок */
  let dragKey = null;
  box.addEventListener("dragstart", ev=>{
    const t = ev.target.closest(".m-tile"); if(!t) return;
    dragKey = t.dataset.key; t.classList.add("m-dragging");
    ev.dataTransfer.effectAllowed = "move"; try{ ev.dataTransfer.setData("text/plain", dragKey); }catch(e){}
  });
  box.addEventListener("dragend", ()=>{ dragKey = null; tiles().forEach(t=>t.classList.remove("m-dragging","m-before","m-after")); });
  box.addEventListener("dragover", ev=>{
    if(!dragKey) return;
    const t = ev.target.closest(".m-tile"); if(!t || t.dataset.key===dragKey) return;
    ev.preventDefault();
    const r = t.getBoundingClientRect(), after = ev.clientX > r.left + r.width/2;
    tiles().forEach(x=>x.classList.remove("m-before","m-after"));
    t.classList.add(after ? "m-after" : "m-before");
  });
  box.addEventListener("drop", ev=>{
    if(!dragKey) return;
    const t = ev.target.closest(".m-tile"); if(!t) return;
    ev.preventDefault();
    const keys = tiles().map(x=>x.dataset.key).filter(k=>k!==dragKey);
    const r = t.getBoundingClientRect(), after = ev.clientX > r.left + r.width/2;
    let i = keys.indexOf(t.dataset.key); if(after) i++;
    keys.splice(i, 0, dragKey);
    save(loc=>{ loc.__order = loc.__order || {}; loc.__order[mode()] = keys; });
    V4_SEL = dragKey; dragKey = null; rerender();
  });

  /* уголок — размер */
  box.addEventListener("pointerdown", ev=>{
    const h = ev.target.closest(".m-rs"); if(!h) return;
    ev.preventDefault(); ev.stopPropagation();
    const t = h.closest(".m-tile"), key = t.dataset.key, r = t.getBoundingClientRect(), g = cell();
    const x0 = ev.clientX, y0 = ev.clientY; let w = +t.style.getPropertyValue("--w"), hh = +t.style.getPropertyValue("--h");
    t.setAttribute("draggable","false"); V4_SEL = key; mark();
    const move = e=>{
      w  = Math.max(1, Math.min(g.cols, Math.round((r.width  + (e.clientX-x0) + g.gap)/(g.c+g.gap))));
      hh = Math.max(1, Math.min(16,     Math.round((r.height + (e.clientY-y0) + g.gap)/(g.c+g.gap))));
      t.style.setProperty("--w", w); t.style.setProperty("--h", hh);
      const l = t.querySelector(".m-lbl"); if(l) l.textContent = `${w}×${hh}`;
    };
    const up = ()=>{ removeEventListener("pointermove", move); removeEventListener("pointerup", up);
      setSize(key, w, hh); rerender(); };
    addEventListener("pointermove", move); addEventListener("pointerup", up);
  });
}

/* нижняя панель: выбранная плитка, заготовки форм, выгрузка */
function v4TilesBar(box, rerender){
  let bar = document.getElementById("m-bar");
  if(!bar){ bar = document.createElement("div"); bar.id = "m-bar"; document.body.appendChild(bar); }
  const ico = ([w,h]) => `<svg viewBox="0 0 16 10" width="16" height="10"><rect x="${(16-w)/2}" y="${(10-h)/2}" width="${w}" height="${h}" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;
  const t = V4_SEL && box.querySelector(`.m-tile[data-key="${CSS.escape(V4_SEL)}"]`);
  const w = t ? +t.style.getPropertyValue("--w") : 0, h = t ? +t.style.getPropertyValue("--h") : 0;
  const name = t ? (t.querySelector(".row-ti")||{}).textContent : "";
  bar.innerHTML = `<b>Плитки</b>
    <span class="m-hint">${t ? `${name} · ${w}×${h}` : "Перетаскивайте плитки, тяните за уголок, нажмите — чтобы выбрать"}</span>
    ${t ? TILE_PRESETS.map(p=>`<button class="m-ic${p.w===w&&p.h===h?" on":""}" data-p="${p.k}" title="${p.t}">${ico(p.ic)}</button>`).join("")
      + `<button data-d="w-" title="Уже">W−</button><button data-d="w+" title="Шире">W+</button><button data-d="h-" title="Ниже">H−</button><button data-d="h+" title="Выше">H+</button>` : ""}
    <span class="m-sp"></span>
    <button data-a="dl">Скачать v4-tiles-data.js</button><button data-a="show">Код</button><button data-a="reset">Сбросить</button>`;
  bar.onclick = ev=>{
    const b = ev.target.closest("button"); if(!b) return;
    if(b.dataset.a==="reset"){ v4TilesSave({}); V4_SEL=null; rerender(); return; }
    if(b.dataset.a){ const txt = v4TilesFile();
      if(b.dataset.a==="dl"){ try{ const u = URL.createObjectURL(new Blob([txt],{type:"text/javascript"})); const l = document.createElement("a");
          l.href=u; l.download="v4-tiles-data.js"; document.body.appendChild(l); l.click(); l.remove(); setTimeout(()=>URL.revokeObjectURL(u),1000); }catch(e){} return; }
      let m = document.getElementById("m-out"); if(!m){ m = document.createElement("div"); m.id="m-out"; document.body.appendChild(m); }
      m.innerHTML = `<p>Содержимое assets/v4-tiles-data.js — скопируйте в файл или пришлите мне</p><textarea readonly></textarea><button>Закрыть</button>`;
      m.querySelector("textarea").value = txt; m.querySelector("button").onclick = ()=>m.remove(); return; }
    if(!t) return;
    let nw = w, nh = h; const p = TILE_PRESETS.find(x=>x.k===b.dataset.p); if(p){ nw=p.w; nh=p.h; }
    if(b.dataset.d==="w-") nw=Math.max(1,w-1); if(b.dataset.d==="w+") nw=Math.min(12,w+1);
    if(b.dataset.d==="h-") nh=Math.max(1,h-1); if(b.dataset.d==="h+") nh=Math.min(16,h+1);
    const loc = v4TilesLocal(); loc[V4_SEL] = {w:nw, h:nh}; v4TilesSave(loc); rerender();
  };
}
