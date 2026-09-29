/* ============================================================
   СТРАНИЦЫ ТАЙМЛАЙНА (life.html?id=…) — всё, что не кейс.
   Предзаполнено тем, что известно; остальное — «Заполнить».
   Поля:
     when   — даты в шапке (если не указано — год из таймлайна)
     role   — вместо типа в заголовке (необязательно)
     desc   — что это, одной фразой (без точки в конце)
     links  — {site, wiki} — значки после описания
     parts  — разделы: {h, list:[…]} | {h, text} | {h, paras:[…]} | {h, ph:"что заполнить"} | {h, shots:N} | {h, links:[…]}
============================================================ */
/* содержимое страниц — в life.html (между маркерами CRM_LIFE), чтобы его правил визуальный редактор */
V4.pages = V4.pages || {};


/* соседи по таймлайну — для кнопок ↑ и ↓ */
function v4TlHref(e){
  if(e.project){ const p = PROJECTS.find(x=>x.id===e.project); return p ? p.href : "index.html"; }
  return v4LifeHref(e);
}
function v4TlUp(id, L){
  const i = V4.timeline.findIndex(e=>e.id===id), prev = V4.timeline[i].hidden ? null : V4.timeline[i-1];
  const label = prev ? v4Txt(prev.ti, L) : (L==="ru" ? "Все проекты" : "All projects");
  return `<a class="v4step v4up" href="${prev ? v4TlHref(prev) : "index.html"}"><span class="ar">↑</span>${label}</a>`;
}
function v4TlDown(id, L){
  const i = V4.timeline.findIndex(e=>e.id===id), nx = V4.timeline[i+1], next = (V4.timeline[i].hidden || (nx && nx.hidden)) ? null : nx;
  if(next) return `<a class="v4step v4down" href="${v4TlHref(next)}"><span class="ar">↓</span>${v4Txt(next.ti, L)}</a>`;
  return `<a class="v4step v4down" href="index.html"><span class="ar">↑</span>${L==="ru"?"Все проекты":"All projects"}</a>`;
}
