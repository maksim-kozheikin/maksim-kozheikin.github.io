/* ============================================================
   v4 — общая левая панель для всех страниц.
   Строка проекта: годы · название + иконка · должность · стрелка.
   Должности и иконки — здесь; названия и годы — из PROJECTS (site.js).
============================================================ */
/* размеры картинок из assets (пересчитываются при сборке) */
/*IMGSIZES_S*/const V4_IMG_SIZES = {"assets/cv-en-1.webp": [1240, 1754], "assets/cv-ru-1.webp": [1240, 1754], "assets/en-medsi-One-visual-style.webp": [8604, 4208], "assets/en-medsi-card.webp": [3544, 4022], "assets/en-medsi-cart.webp": [2884, 4643], "assets/en-medsi-choose.webp": [3423, 3576], "assets/en-medsi-doctorcard.webp": [7268, 3576], "assets/en-medsi-flow.webp": [5924, 5080], "assets/en-medsi-loyalty.webp": [6078, 2946], "assets/en-medsi-main.webp": [3432, 4208], "assets/en-medsi-map.webp": [3729, 4000], "assets/en-medsi-pharmacy.webp": [3432, 4208], "assets/en-medsi-research.webp": [3385, 2064], "assets/en-medsi-status-Appointmentt.webp": [5842, 8524], "assets/en-medsi-team.webp": [2220, 2516], "assets/en-medsi-workspace-schedule.webp": [3388, 3892], "assets/medsi-One-visual-style.webp": [4300, 1794], "assets/medsi-logo.png": [112, 112], "assets/ru-medsi-One-visual-style.webp": [8764, 4208], "assets/ru-medsi-card.webp": [3544, 4166], "assets/ru-medsi-cart.webp": [2884, 4643], "assets/ru-medsi-choose.webp": [3423, 3576], "assets/ru-medsi-doctorcard.webp": [7268, 3576], "assets/ru-medsi-flow.webp": [5925, 5080], "assets/ru-medsi-loyalty.webp": [6078, 2946], "assets/ru-medsi-main.webp": [3432, 4208], "assets/ru-medsi-map.webp": [3729, 4000], "assets/ru-medsi-market.webp": [7052, 7252], "assets/ru-medsi-pharmacy.webp": [3432, 4216], "assets/ru-medsi-research.webp": [3385, 2064], "assets/ru-medsi-status-Appointment.webp": [5842, 8524], "assets/ru-medsi-team.webp": [2220, 2516], "assets/ru-medsi-workspace-create.webp": [3388, 3672], "assets/ru-medsi-workspace-diagnoz.webp": [3388, 6186], "assets/ru-medsi-workspace-emk.webp": [3391, 3943], "assets/ru-medsi-workspace-schedule.webp": [3388, 3892], "assets/en-medsi-appointment.webp": [3452, 6912], "assets/ru-medsi-appointment.webp": [3454, 6912]};/*IMGSIZES_E*/

const V4 = {
  /* имя и текст слева вверху — свои для Work и для Work + Life */
  side:{
    ru:{work:{name:"Максим Кожейкин", lead:"Привет! Я продуктовый дизайнер. Проектирую веб-сервисы, системы и мобильные приложения. Собираю дизайн-команды и выстраиваю процессы. Открыт к сотрудничеству"},
        life:{name:"Максим",          lead:"Приветик! Выкладываю проекты, некое творчество и свой путь. Люблю дизайн во всех его проявлениях, урбанизм, искусство, граффити, горные лыжи и легкоходство"}},
    en:{work:{name:"Maksim Kozheikin", lead:"Hi! I’m a product designer. I design web services, systems and mobile apps. I build design teams and set up their processes. Open to collaboration"},
        life:{name:"Maksim",           lead:"Hey there! Here are my projects, some creative stuff and my own path. I love design in all its forms, urbanism, art, graffiti, skiing and ultralight hiking"}}
  },
  meta:{
    rwb:      {role:"Senior UX/UI Designer",          grad:"linear-gradient(135deg,#7c3aed,#2a5bff)"},
    medsi:    {role:"Lead UX/UI Designer",            grad:"linear-gradient(135deg,#7fd4e8,#c7b6ff 55%,#8fe3a8)", logo:"assets/medsi-logo.png"},
    sberpravo:{role:"Senior → Lead UX/UI Designer",   grad:"linear-gradient(135deg,#2a9d8f,#4fc3dc)"},
    vtb:      {role:"Senior UX/UI Designer",          grad:"linear-gradient(135deg,#1e63c4,#5aa0ff)"},
    loko:     {role:"Middle UX/UI Designer",          grad:"linear-gradient(135deg,#f2b705,#f57c00)"},
    zephyr:   {role:"Junior → Middle UX/UI Designer", grad:"linear-gradient(135deg,#3a3a44,#6b6b78)"}
  }
};

/* ============================================================
   ТАЙМЛАЙН для режима Work + Life — от новых к старым.
   Коротко и главное: год начала · название · профиль · тип (чипс) · AI.
   project:"id" — строка ведёт на кейс из PROJECTS.
   kind: work / project / edu / art (творчество); без kind — без чипса.
   prof — профиль работы, пишется через «·».
============================================================ */
V4.kinds = {
  work:{ru:"работа",en:"work"}, project:{ru:"проект",en:"project"},
  edu:{ru:"обучение",en:"education"}, art:{ru:"творчество",en:"creative"}
};
V4.timeline = [
  {id:"site", yr:"2026", kind:"project", ai:true, ti:{ru:"Сайт портфолио",en:"Portfolio site"}},
  {id:"assist", yr:"2026", kind:"project", ai:true, ti:{ru:"АссистПРО",en:"AssistPRO"}, prof:"B2B SaaS"},
  {id:"shtang", yr:"2026", kind:"edu", ti:{ru:"Игорь Штанг",en:"Igor Shtang"}, prof:{ru:"таблицы",en:"spreadsheets"}},
  {id:"ceramics", yr:"2025", kind:"art", ti:{ru:"Керамика",en:"Ceramics"}},
  {yr:"2024", kind:"work", project:"rwb", ti:{ru:"Wildberries",en:"Wildberries"}, prof:"E-commerce"},
  {id:"mts", yr:"2024", kind:"project", ti:{ru:"МТС",en:"MTS"}, prof:{ru:"умный дом",en:"smart home"}},
  {yr:"2022", kind:"work", project:"medsi", ti:{ru:"Medsi",en:"Medsi"}, prof:"MedTech"},
  {yr:"2021", kind:"work", project:"sberpravo", ti:{ru:"СберПраво",en:"SberPravo"}, prof:"LegalTech"},
  {id:"birman", yr:"2020", kind:"edu", ti:{ru:"Илья Бирман",en:"Ilya Birman"}, prof:{ru:"интерфейсы",en:"interfaces"}},
  {yr:"2020", kind:"work", project:"vtb", ti:{ru:"ВТБ Банк",en:"VTB Bank"}, prof:"FinTech"},
  {yr:"2019", kind:"work", project:"loko", ti:{ru:"Локо Банк",en:"Loko Bank"}, prof:"FinTech"},
  {yr:"2017", kind:"work", project:"zephyr", ti:{ru:"ZephyrLab",en:"ZephyrLab"}, prof:{ru:"дизайн-студия",en:"design studio"}},
  {id:"mda", yr:"2017", kind:"edu", ti:{ru:"Moscow Digital Academy",en:"Moscow Digital Academy"}, prof:"UX/UI"},
  {id:"freelance", yr:"2016", kind:"work", work:true, ti:{ru:"Фриланс",en:"Freelance"}},
  {id:"gym", yr:"2016", kind:"edu", ti:{ru:"Design:GYM",en:"Design:GYM"}},
  {id:"toys", yr:"2015", kind:"work", ti:{ru:"Магазин игрушек",en:"Toy store"}, prof:{ru:"консультант",en:"sales"}},
  {id:"photo", yr:"2015", kind:"art", ti:{ru:"Фотография",en:"Photography"}},
  {id:"print", yr:"2014", kind:"work", ti:{ru:"Полиграфия",en:"Print design"}, prof:{ru:"первая подработка",en:"first side job"}},
  {id:"waiter", yr:"2014", kind:"work", ti:{ru:"Официант",en:"Waiter"}},
  {id:"camp", yr:"2012", kind:"work", ti:{ru:"Вожатый",en:"Camp counselor"}, prof:{ru:"лагерь",en:"summer camp"}},
  {id:"photoshop", yr:"2012", kind:"art", ti:{ru:"Photoshop",en:"Photoshop"}, prof:{ru:"первые работы",en:"first works"}},
  {id:"build", yr:"2011", kind:"work", ti:{ru:"Стройка",en:"Construction"}, prof:{ru:"разнорабочий",en:"laborer"}},
  {id:"graffiti", yr:"2010", kind:"art", ti:{ru:"Граффити",en:"Graffiti"}},
  {id:"ksu", yr:"2010", kind:"edu", ti:{ru:"Курский госуниверситет",en:"Kursk State University"}, prof:{ru:"бакалавр",en:"bachelor"}},
  {id:"school", yr:"2000", kind:"edu", ti:{ru:"Школа",en:"School"}},
  {id:"born", yr:"1993", ti:{ru:"Родился",en:"Born"}},
  /* сводная страница для плитки на главной, в списках не показывается */
  {id:"education", hidden:true, yr:"2010 — 2026", kind:"edu", ti:{ru:"Обучение",en:"Education"}}
];

/* иконка: логотип, если есть, иначе первая буква на градиенте компании */
function v4Icon(p, L){
  const m = V4.meta[p.id] || {};
  if(m.logo) return `<span class="row-ico"><img src="${m.logo}" alt=""></span>`;
  const ch = String(p.ti[L]||"").trim().charAt(0).toUpperCase();
  return `<span class="row-ico" style="background:${m.grad||"var(--ink)"}">${ch}</span>`;
}

/* строка левой панели. active — открытый проект, extra — его подменю */
const v4Life = () => document.body.getAttribute("data-mode")==="life";
const v4Txt = (v, L) => v==null ? "" : (typeof v==="string" ? v : (v[L]||v.ru||""));

/* ============================================================
   СТРОКА ЛЕВОЙ ПАНЕЛИ (вариант 22):
   год · название · Профиль … чипсы AI и тип · стрелка.
   Стрелка у каждой строки: с подменю — поворачивается вниз,
   без подменю — смотрит вправо и чуть бледнее.
============================================================ */
const v4Cap = t => t ? t.charAt(0).toUpperCase() + t.slice(1) : t;   // первое слово — с большой буквы

function v4Prof(e, L){
  return e && e.prof ? `<span class="row-prof">· ${v4Cap(v4Txt(e.prof, L))}</span>` : "";
}
function v4Chips(e, L, now){
  if(!e) return "";
  const ai = e.ai ? `<span class="tag tag-ai">AI</span>` : "";
  const kind = e.kind ? `<span class="tag tag-kind${now?" is-live":""}">${v4Cap(v4Txt(V4.kinds[e.kind], L))}${now?'<span class="v4live" aria-hidden="true"></span>':""}</span>` : "";
  return (ai||kind) ? `<span class="row-tags">${kind}${ai}</span>` : "";   // AI — всегда последним
}

function v4Row(p, L, active){
  const t = V4.timeline.find(x=>x.project===p.id);   // короткое название и год начала — в обоих режимах
  const e = v4Life() ? t : null;                        // чипсы — только в Work + Life
  const title = t ? v4Txt(t.ti, L) : p.ti[L];
  /* повторный клик по открытой строке сворачивает её и ведёт на главную */
  /* текущая работа: в Work — кружок у стрелки, в Work + Life — кружок в чипсе «Работа» */
  const now = p.id==="rwb";
  return `<a class="row v4row" href="${active ? "index.html" : p.href}"${active?' aria-current="page"':''}>
    <span class="row-yr">${t ? t.yr : p.yr}</span>
    <span class="row-main"><span class="row-ti" title="${title}">${title}</span>${v4Prof(t, L)}</span>
    ${v4Chips(e, L, now)}
    ${e ? "" : `<span class="v4enddot">${now ? '<span class="v4live" aria-hidden="true"></span>' : ""}</span>`}
    <span class="row-arr" aria-hidden="true"><svg viewBox="0 0 10 10" width="10" height="10"><path d="M3.5 1.5 7 5 3.5 8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a>`;
}

/* строка таймлайна без кейса — ведёт на свою страницу life.html?id=… */
function v4LifeHref(e){ return `life.html?id=${e.id}`; }
function v4LifeRow(e, L, active){
  const title = v4Txt(e.ti, L);
  return `<a class="row v4row v4life" href="${active ? "index.html" : v4LifeHref(e)}"${active?' aria-current="page"':''}>
    <span class="row-yr">${e.yr}</span>
    <span class="row-main"><span class="row-ti" title="${title}">${title}</span>${v4Prof(e, L)}</span>
    ${v4Life() ? v4Chips(e, L) : '<span class="v4enddot"></span>'}
    <span class="row-arr" aria-hidden="true"><svg viewBox="0 0 10 10" width="10" height="10"><path d="M3.5 1.5 7 5 3.5 8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a>`;
}

/* список левой панели: Work — только проекты, Work + Life — весь таймлайн.
   projectRow(p) — как страница рисует строку проекта (с подменю на кейсе) */
function v4List(L, projectRow, currentLife){
  /* Work: проекты с кейсами + работы без кейса, отмеченные work:true (фриланс) */
  if(!v4Life()) return V4.timeline.filter(e=>e.project || e.work).map(e=>{
    if(e.project){ const p = PROJECTS.find(x=>x.id===e.project); return p ? projectRow(p) : ""; }
    return v4LifeRow(e, L, e.id===currentLife);
  }).join("");
  return V4.timeline.filter(e=>!e.hidden).map(e=>{
    if(e.project){ const p = PROJECTS.find(x=>x.id===e.project); return p ? projectRow(p) : ""; }
    return v4LifeRow(e, L, e.id===currentLife);
  }).join("");
}

/* имя и текст слева вверху: меняются вместе с режимом Work / Work + Life */
function v4Side(L){
  const set = (V4.side[L] || V4.side.ru)[v4Life() ? "life" : "work"];
  document.querySelectorAll('[data-v4="name"]').forEach(el=>el.textContent=set.name);
  /* все четыре текста (ru/en × Work/Work + Life) лежат друг на друге:
     блок всегда высотой с самый длинный из них и не меньше трёх строк —
     при смене режима или языка список ниже не прыгает */
  const cur = (L==="en"?"en":"ru") + (v4Life() ? "life" : "work");
  document.querySelectorAll('[data-v4="lead"]').forEach(el=>{
    el.innerHTML = ["ru","en"].flatMap(lg=>["work","life"].map(m=>{
      const on = lg+m===cur;
      return `<span class="v4l${on?" on":""}" lang="${lg}"${on?"":' aria-hidden="true"'}>${V4.side[lg][m].lead}</span>`;
    })).join("");
  });
  const top = document.querySelector(".sidebar .side-top");
  if(top && typeof fixOrphans === "function") fixOrphans(top);
}


/* ============================================================
   Навигация внутри кейса — по вертикали, как список слева:
   сверху — проект выше по списку (у первого — все проекты),
   снизу — следующий проект.
============================================================ */
/* короткое название проекта из таймлайна */
function v4Short(p, L){ const t = V4.timeline.find(x=>x.project===p.id); return t ? v4Txt(t.ti, L) : p.ti[L]; }
function v4Near(id){
  const i = PROJECTS.findIndex(p=>p.id===id);
  return {prev:PROJECTS[i-1], next:PROJECTS[i+1]};
}
function v4Up(id, L){
  const {prev} = v4Near(id);
  const label = prev ? v4Short(prev, L) : (L==="ru" ? "Все проекты" : "All projects");
  return `<a class="v4step v4up" href="${prev ? prev.href : "index.html"}"><span class="ar">↑</span>${label}</a>`;
}
function v4Down(id, L){
  const {next} = v4Near(id);
  if(next) return `<a class="v4step v4down" href="${next.href}"><span class="ar">↓</span>${v4Short(next, L)}</a>`;
  return `<a class="v4step v4down" href="index.html"><span class="ar">↑</span>${L==="ru"?"Все проекты":"All projects"}</a>`;
}

/* шапка кейса: «Профиль · » перед описанием компании */
function v4ProfText(id, L){
  const t = V4.timeline.find(x=>x.project===id);
  return t && t.prof ? `<span class="exp-prof">${v4Cap(v4Txt(t.prof, L))}</span> · ` : "";
}

/* ============================================================
   Ссылки после описания компании: сайт и Википедия
============================================================ */
V4.links = {
  rwb:      {site:"https://seller.wildberries.ru/about-portal/ru/en", wiki:"https://en.wikipedia.org/wiki/Wildberries"},
  medsi:    {site:"https://apps.apple.com/ru/app/storemed-%D0%B7%D0%B4%D0%BE%D1%80%D0%BE%D0%B2%D1%8C%D0%B5-%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD/id6736902949", wiki:"https://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D0%B4%D1%81%D0%B8"},
  sberpravo:{site:"https://sberpravo.ru", wiki:"https://en.wikipedia.org/wiki/Sberbank"},
  vtb:      {site:"https://demo.db.vtb.ru/dashboard/history/semitransactions", wiki:"https://en.wikipedia.org/wiki/VTB_Bank"},
  loko:     {site:"https://www.lockobank.ru/apps/", wiki:"https://ru.wikipedia.org/wiki/%D0%9B%D0%BE%D0%BA%D0%BE-%D0%B1%D0%B0%D0%BD%D0%BA"},
  zephyr:   {site:"https://www.zephyrlab.ru/"}
};
/* значки 12–13px — размером с заглавные буквы текста; W — с засечками, как у Википедии */
const V4_ICON_SITE = `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const V4_ICON_WIKI = `<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M1.6 4.2 4.7 12.3 7.9 5.6l3.3 6.7 3.1-8.1" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round"/><path d="M.6 4.2h2.4M6.6 4.2h2.6M12.9 4.2h2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;

function v4IdByHref(href){ const m = String(href||"").match(/case-([\w-]+)\.html/); return m ? m[1] : ""; }
function v4Links(id, L){
  const k = V4.links[id] || (V4.pages && V4.pages[id] && V4.pages[id].links); if(!k) return "";
  const tSite = L==="ru" ? "Сайт" : "Website", tWiki = L==="ru" ? "Википедия" : "Wikipedia";
  const site = k.site ? `<a class="v4link" href="${k.site}" target="_blank" rel="noopener" data-tip="${tSite}" aria-label="${tSite}">${V4_ICON_SITE}</a>` : "";
  const wiki = k.wiki ? `<a class="v4link" href="${k.wiki}" target="_blank" rel="noopener" data-tip="${tWiki}" aria-label="${tWiki}">${V4_ICON_WIKI}</a>` : "";
  return `<span class="v4links">${site}${wiki}</span>`;
}

/* описание + значки: последнее слово и значки не разрываются,
   чтобы значки не оставались одни на новой строке.
   В режиме редактора (?crm / #crm) текст описания остаётся чистым — редактор правит его как есть. */
const v4Crm = () => !!window.__V4CRM || /[?&]crm/.test(location.search) || location.hash === "#crm";
function v4Summary(text, links){
  if(!links || v4Crm()) return `<span class="exp-summary">${text}</span>${links||""}`;
  const i = text.lastIndexOf(" ");
  if(i<0) return `<span class="v4glue"><span class="exp-summary">${text}</span>${links}</span>`;
  return `<span class="exp-summary">${text.slice(0,i+1)}<span class="v4glue">${text.slice(i+1)}${links}</span></span>`;
}

/* ============================================================
   ШАПКА ПРОЕКТА (v4.22):
   «Компания · Должность» (должность серая, та же жирность)
   описание компании со значками ссылок
   чипсы: период · сфера · тип · AI (AI всегда последним)
============================================================ */
function v4Title(company, role){
  return `<span class="exp-company">${company}</span>${role ? `<span class="exp-pos"> · <span class="exp-pos-t">${role}</span></span>` : ""}`;
}
function v4HeadChips(e, L, dateHtml, kindText){
  const c = [];
  /* текущая работа (в дате «Настоящее время» / «Now») — мигающий кружок в конце чипса */
  const live = !!(e && e.project==="rwb") && /настоящее время|сейчас|present|now/i.test(String(dateHtml||""));   /* кружок — только у Wildberries */
  if(dateHtml) c.push(`<span class="tag tag-kind${live?" is-live":""}"><span class="exp-eyebrow">${dateHtml}</span>${live?'<span class="v4live" aria-hidden="true"></span>':""}</span>`);
  if(e && e.prof) c.push(`<span class="tag tag-kind">${v4Cap(v4Txt(e.prof, L))}</span>`);
  const k = kindText || (e && e.kind ? v4Cap(v4Txt(V4.kinds[e.kind], L)) : "");
  if(k) c.push(`<span class="tag tag-kind">${k}</span>`);
  if(e && e.ai) c.push(`<span class="tag tag-ai">AI</span>`);
  return c.length ? `<div class="v4chips">${c.join("")}</div>` : "";
}
const v4Entry = id => V4.timeline.find(x=>x.project===id || x.id===id);

/* первый пункт обязанностей, который дублирует заголовок раздела, — прячем (индексы для редактора не сдвигаются) */
function v4SameText(a, b){
  const clean = x => String(x||"").replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim().toLowerCase();
  return !!b && clean(a) === clean(b);
}

/* ============================================================
   Левая панель не прыгает при переходах между страницами.
   Перед уходом запоминаем, где на экране стояла нажатая строка
   (и прокрутку панели); на новой странице ставим открытую строку
   ровно туда же — панель выглядит неподвижной.
============================================================ */
const V4_SIDE_KEY = "v4side";
document.addEventListener("click", e=>{
  const a = e.target.closest && e.target.closest(".sidebar a[href]");
  if(!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  const sb = document.getElementById("sidebar"); if(!sb) return;
  const row = a.closest("a.row");
  try{ sessionStorage.setItem(V4_SIDE_KEY, JSON.stringify({
    st: sb.scrollTop, y: row ? row.getBoundingClientRect().top : null
  })); }catch(_){}
}, true);
function v4RestoreSide(){
  let st=null; try{ st = JSON.parse(sessionStorage.getItem(V4_SIDE_KEY)||"null"); sessionStorage.removeItem(V4_SIDE_KEY); }catch(_){}
  const sb = document.getElementById("sidebar"); if(!sb || !st) return;
  const cur = sb.querySelector('a.row[aria-current="page"]');
  if(cur && st.y!=null) sb.scrollTop += cur.getBoundingClientRect().top - st.y;
  else sb.scrollTop = st.st || 0;
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", v4RestoreSide); else v4RestoreSide();

/* общий заголовок «Обязанности и достижения» не ставим, если первый пункт уже
   подзаголовок вида «Обязанности и достижения как Senior…» (СберПраво) */
function v4NeedSec(t){
  const first = String((t.duties||[])[0]||"");
  const clean = x => String(x||"").replace(/<[^>]+>/g,"").replace(/\s+/g," ").trim().toLowerCase();
  const head = clean(t.navOverview || "обязанности и достижения");
  return !( /^<b>/.test(first) && clean(first).startsWith(head) && clean(first) !== head );
}



/* ============================================================
   Переход к разделу кейса.
   Заголовок раздела встаёт на уровень имени слева («Максим Кожейкин»).
   Чтобы страница не сдвигалась, пока подгружаются картинки выше
   раздела, у каждой картинки заранее проставлены размеры
   (V4_IMG_SIZES) — браузер сразу оставляет под неё место.
============================================================ */
function v4SizeImgs(root){
  (root||document).querySelectorAll(".main img").forEach(im=>{
    if(im.hasAttribute("width") && im.hasAttribute("height")) return;
    const sz = V4_IMG_SIZES[im.getAttribute("src")]; if(!sz) return;
    im.setAttribute("width", sz[0]); im.setAttribute("height", sz[1]);
  });
}
(function(){
  const run = ()=>{ v4SizeImgs(); const m=document.querySelector(".main"); if(!m) return;
    new MutationObserver(()=>v4SizeImgs(m)).observe(m,{childList:true,subtree:true}); };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
(function(){
  /* на какой высоте стоит имя слева — туда ставим заголовок раздела */
  function alignY(){
    if(innerWidth<=900){ const tb=document.querySelector(".topbar"); return (tb ? tb.getBoundingClientRect().height : 0) + 16; }
    const n=document.querySelector(".side-name"), sb=document.getElementById("sidebar");
    return n ? n.getBoundingClientRect().top + (sb ? sb.scrollTop : 0) : 104;
  }
  function targetOf(el){ return el.querySelector(".block-title, .v4-sec, .exp-role") || el; }
  let hold=null;
  const stop=()=>{ if(hold){ clearTimeout(hold.t); hold.ro.disconnect(); hold=null; } };
  function goTo(id, smooth){
    const el=document.getElementById(id); if(!el) return;
    stop(); v4SizeImgs();
    const t=targetOf(el), y=()=>scrollY + t.getBoundingClientRect().top - alignY();
    window.scrollTo({top:y(), behavior: smooth ? "smooth" : "auto"});
    /* подстраховка: если что-то всё же сдвинулось, после прокрутки выравниваем без анимации */
    const ro=new ResizeObserver(()=>{ if(hold && !hold.moving){ const d=t.getBoundingClientRect().top-alignY(); if(Math.abs(d)>2) window.scrollBy(0,d); } });
    hold={ro, moving:!!smooth, t:setTimeout(stop,3000)}; ro.observe(document.body);
    if(smooth){ let last=-1,n=0; const w=()=>{ if(!hold) return; if(scrollY===last){ if(++n>4){ hold.moving=false; const d=t.getBoundingClientRect().top-alignY(); if(Math.abs(d)>2) window.scrollBy(0,d); return; } } else { n=0; last=scrollY; } requestAnimationFrame(w); }; requestAnimationFrame(w); }
  }
  ["wheel","touchstart","keydown"].forEach(t=>addEventListener(t, stop, {passive:true}));
  document.addEventListener("click", e=>{
    const a=e.target.closest && e.target.closest('a[href^="#"]'); if(!a) return;
    const id=decodeURIComponent(a.getAttribute("href").slice(1)); if(!id || !document.getElementById(id)) return;
    e.preventDefault(); try{ history.replaceState(null,"","#"+id); }catch(_){}
    goTo(id, true);
  });
  window.v4GoTo=goTo;
  addEventListener("load", ()=>{ const h=decodeURIComponent(location.hash.slice(1)); if(h && document.getElementById(h)) goTo(h,false); });
})();

/* ============================================================
   Картинка не нашлась (файла ещё нет в assets) — вместо значка
   «битой» картинки показываем серую плашку с подписью.
============================================================ */
document.addEventListener("error", e=>{
  const im = e.target;
  if(!im || im.tagName!=="IMG" || !im.closest(".main") || im.dataset.v4miss) return;
  im.dataset.v4miss = "1";
  const ph = document.createElement("div");
  ph.className = "v4-miss";
  ph.textContent = im.getAttribute("alt") || (document.documentElement.lang==="en" ? "Screen" : "Макет");
  im.replaceWith(ph);
}, true);
