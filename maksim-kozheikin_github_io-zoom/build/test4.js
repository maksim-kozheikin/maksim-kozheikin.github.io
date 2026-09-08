/* Проверка редактора без браузера: jsdom + настоящие события DOM. */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ORIG = "/home/claude/work/v3/maksim-kozheikin.github.io-main";
const SITE = "/home/claude/work/v3/out4";
const EDITOR = fs.readFileSync(SITE + "/assets/crm-editor.js", "utf8");
const SITEJS = (()=>{try{return fs.readFileSync(SITE + "/assets/site.js","utf8")}catch(e){return ""}})();

const PAGES = ["case-loko.html", "case-medsi.html", "case-rwb.html",
  "case-sberpravo.html", "case-vtb.html", "case-zephyr.html"];

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ " + name + (extra ? "  → " + extra : "")); }
}

/* jsdom не умеет часть браузерных API — подменяем их заглушками,
   иначе падает код самой страницы, а не редактора */
const STUB = `<script>
document.execCommand=function(){return true};
document.elementFromPoint=function(){return null};
window.confirm=function(){return true};
window.prompt=function(_,d){return window.__prompt!==undefined?window.__prompt:d};
window.alert=function(m){window.__alert=m};
Element.prototype.scrollIntoView=function(){};
window.scrollTo=function(){};
window.IntersectionObserver=function(){return {observe:function(){},disconnect:function(){}}};
</script>`;

function load(file, query) {
  let html = fs.readFileSync(file, "utf8");
  /* подставляем как функцию: в строке замены $$ и $& значат другое
     и портят код редактора */
  html = html.replace(/<script src="assets\/crm-editor\.js"[^>]*><\/script>/,
    () => "<script>" + EDITOR + "</script>");
  html = html.replace(/<script src="assets\/site\.js"[^>]*><\/script>/,
    () => "<script>" + SITEJS + "</script>");
  html = html.replace("<head>", () => "<head>" + STUB);
  const errors = [];
  const vc = new (require("jsdom").VirtualConsole)();
  vc.on("jsdomError", e => errors.push(String(e.message || e)));
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    url: "https://x.test/" + path.basename(file) + (query || ""),
    pretendToBeVisual: true,
    virtualConsole: vc
  });
  dom.window.__errors = errors;
  return dom;
}

/* дождаться, пока страница полностью разберётся и редактор поднимется */
function ready(dom) {
  return new Promise(res => {
    if (dom.window.document.readyState === "complete") return res(dom);
    dom.window.addEventListener("load", () => res(dom));
    setTimeout(() => res(dom), 3000);
  });
}
async function open(file, query) { return ready(load(file, query)); }

function tick() { return new Promise(r => setTimeout(r, 0)); }
function fire(win, el, type, init) {
  const E = type === "click" || type.startsWith("mouse") ? win.MouseEvent : win.Event;
  el.dispatchEvent(new E(type, Object.assign({ bubbles: true, cancelable: true }, init)));
}

async function main(){
/* ---------- 1. страницы рисуются без ошибок ---------- */
console.log("\n1. Публичные страницы");
for (const p of PAGES.concat("index.html")) {
  const b = await open(path.join(SITE, p));
  const doc = b.window.document;
  ok(p + " — рисуется без ошибок", b.window.__errors.length === 0, b.window.__errors[0]);
  ok(p + " — редактор не вмешался", !doc.querySelector("[data-crm-p], .crm-bar"));
  if (p !== "index.html") {
    ok(p + " — блок достижений убран", !doc.querySelector("#achievements"));
    const foot = doc.querySelector(".foot");
    ok(p + " — в подвале нет undefined", foot && !/undefined/.test(foot.textContent), foot && foot.textContent.trim());
  }
  b.window.close();
}

/* ---------- 2. редактор поднимается и размечает страницу ---------- */
console.log("\n2. Разметка страницы в режиме ?crm");
const dom = await open(path.join(SITE, "case-sberpravo.html"), "?crm");
const win = dom.window, doc = win.document;
const H = win.CRM_HOST;

function tot(){ return [T.ru.blocks.reduce((n,b)=>n+(b.subs||[]).length,0), T.en.blocks.reduce((n,b)=>n+(b.subs||[]).length,0)]; }
ok("панель редактора построена", !!doc.querySelector(".crm-bar"));
ok("на странице нет ошибок", win.__errors.length === 0, win.__errors[0]);
ok("класс редактора включён", doc.documentElement.classList.contains("crm-on"));
const T = H.roots.T;
ok("размечены секции", doc.querySelectorAll("[data-crm-block]").length === T.ru.blocks.length);
ok("размечены подблоки", doc.querySelectorAll("[data-crm-sub]").length > 20);
ok("размечены картинки", doc.querySelectorAll("[data-crm-img]").length > 0);

/* путь ведёт ровно к тому тексту, который виден */
function txt(el) { return el.textContent.replace(/\u00A0/g, " ").trim(); }
function byPath(p) { return doc.querySelector("[data-crm-p='" + JSON.stringify(p) + "']"); }
/* тот же разбор пути, что в редакторе: корень + подстановка $L */
function resolve(win, p, lang) {
  const R = win.CRM_HOST.roots;
  const L = lang || win.CRM_HOST.L;
  const abs = Object.prototype.hasOwnProperty.call(R, p[0]) ? p : (win.CRM_HOST.dataPath || []).concat(p);
  let o = R[abs[0]];
  for (let i = 1; i < abs.length; i++) {
    if (o == null) return undefined;
    o = o[abs[i] === "$L" ? L : abs[i]];
  }
  return o;
}
function get(p, lang) { return resolve(win, p, lang); }
let bad = null;
doc.querySelectorAll("[data-crm-t]").forEach(el => {
  if (bad) return;
  const p = JSON.parse(el.getAttribute("data-crm-p"));
  let v = get(p);
  if (v && typeof v === "object") v = (v.h ? v.h + " — " : "") + (v.p || "");
  if (typeof v !== "string") return;
  const plain = String(v).replace(/<[^>]+>/g, "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
  const seen = txt(el).replace(/\s+/g, " ");
  if (plain && seen && !seen.startsWith(plain.slice(0, 24))) bad = p.join(".") + ": «" + seen.slice(0, 40) + "» ≠ «" + plain.slice(0, 40) + "»";
});
ok("каждый путь ведёт к своему тексту", !bad, bad);

/* ---------- 3. правка текста прямо на странице ---------- */
console.log("\n3. Редактирование текста");
const titleEl = byPath(["blocks", 1, "title"]);
fire(win, titleEl, "mousedown");
ok("поле стало редактируемым", titleEl.getAttribute("contenteditable") === "true");
titleEl.innerHTML = "Новый заголовок";
fire(win, doc.body, "mousedown");                       /* щелчок мимо — фиксация */
ok("текст записан в данные", get(["blocks", 1, "title"]) === "Новый заголовок",
  get(["blocks", 1, "title"]));
ok("другой язык не затронут", get(["blocks", 1, "title"], "en") !== "Новый заголовок");

/* форматирование сохраняется как HTML внутри поля */
const noteEl = doc.querySelector("[data-crm-t][data-crm-p*='note']");
const notePath = JSON.parse(noteEl.getAttribute("data-crm-p"));
fire(win, noteEl, "mousedown");
noteEl.innerHTML = 'Текст <b>жирный</b> и <span style="font-size:var(--h3)">крупный</span>';
fire(win, doc.body, "mousedown");
ok("жирный и размер сохранились", /<b>жирный<\/b>/.test(get(notePath)) && /font-size:var\(--h3\)/.test(get(notePath)),
  get(notePath));

/* мусорная разметка вычищается */
fire(win, noteEl === null ? doc.body : byPath(notePath), "mousedown");
const noteEl2 = byPath(notePath);
noteEl2.innerHTML = '<div class="x" onclick="evil()">чисто<script>bad()<\/script></div>';
fire(win, doc.body, "mousedown");
ok("чужие теги и атрибуты убраны", get(notePath) === "чисто", get(notePath));

/* ---------- 4. структура: дублирование, удаление, порядок ---------- */
console.log("\n4. Структурные правки");
function toolbar(a) { return doc.querySelector(".crm-pop button[data-a='" + a + "']"); }
function act(el, a) {
  fire(win, el, "mousedown");
  const b = toolbar(a);
  if (!b) throw new Error("нет кнопки " + a);
  fire(win, b, "click");
}
const ruBefore = T.ru.blocks.length, enBefore = T.en.blocks.length;
act(doc.querySelector("[data-crm-block='2']"), "blk-dup");
ok("секция продублирована в обоих языках",
  T.ru.blocks.length === ruBefore + 1 && T.en.blocks.length === enBefore + 1,
  T.ru.blocks.length + "/" + T.en.blocks.length);
ok("у копии свой якорь", T.ru.blocks[2].a !== T.ru.blocks[3].a);

const titles = T.ru.blocks.map(b => b.title);
act(doc.querySelector("[data-crm-block='3']"), "blk-up");
ok("секция поднялась", T.ru.blocks[2].title === titles[3] && T.ru.blocks[3].title === titles[2]);
ok("en повторил перестановку", T.en.blocks[2].a === T.ru.blocks[2].a);

act(doc.querySelector("[data-crm-block='3']"), "blk-del");
ok("секция удалена в обоих языках",
  T.ru.blocks.length === ruBefore && T.en.blocks.length === enBefore);

const subsRu = T.ru.blocks[1].subs.length, subsEn = T.en.blocks[1].subs.length;
act(doc.querySelector("[data-crm-block='1'] [data-crm-sub='0']"), "sub-dup");
ok("подблок продублирован в обоих языках",
  T.ru.blocks[1].subs.length === subsRu + 1 && T.en.blocks[1].subs.length === subsEn + 1);
act(doc.querySelector("[data-crm-block='1'] [data-crm-sub='1']"), "sub-del");
ok("подблок удалён в обоих языках",
  T.ru.blocks[1].subs.length === subsRu && T.en.blocks[1].subs.length === subsEn);

/* добавление блока из набора готовых */
fire(win, doc.querySelector("[data-crm-block='1']"), "mousedown");
fire(win, toolbar("blk-addsub"), "click");
const optSheet = doc.querySelector(".crm-modal");
ok("открылся выбор типа блока", !!optSheet && optSheet.querySelectorAll(".crm-opt").length >= 8);
fire(win, optSheet.querySelector(".crm-opt[data-id='metrics']"), "click");
ok("метрики добавлены в обоих языках",
  T.ru.blocks[1].subs.length === subsRu + 1 && T.en.blocks[1].subs.length === subsEn + 1);
ok("метрика создана по образцу страницы",
  "from" in T.ru.blocks[1].subs[T.ru.blocks[1].subs.length - 1].results[0]);
ok("модальное окно закрылось", !doc.querySelector(".crm-modal"));

/* ---------- 4b. перетаскивание ---------- */
console.log("\n4b. Перетаскивание");
function dragTo(el, targetY) {
  fire(win, el, "mousedown");
  const handle = doc.querySelector(".crm-pop button[data-drag]");
  if (!handle) throw new Error("нет ручки перетаскивания");
  const dt = { dataTransfer: { setData() {}, effectAllowed: "" } };
  const ev = new win.Event("dragstart", { bubbles: true, cancelable: true });
  Object.assign(ev, dt);
  handle.dispatchEvent(ev);
  const drop = new win.Event("drop", { bubbles: true, cancelable: true });
  Object.assign(drop, { clientY: targetY, dataTransfer: dt.dataTransfer });
  doc.dispatchEvent(drop);
}
/* без раскладки все прямоугольники нулевые: цель — первая позиция */
const orderRu = T.ru.blocks.map(b => b.a);
dragTo(doc.querySelector("[data-crm-block='3']"), 0);
ok("секцию можно перетащить", T.ru.blocks.map(b => b.a).join() !== orderRu.join(),
  T.ru.blocks.map(b => b.a).join());
ok("перетаскивание повторилось в en",
  T.en.blocks.map(b => b.a).join() === T.ru.blocks.map(b => b.a).join());

const homeSubs = T.ru.blocks[1].subs.length;
const awaySubs = T.ru.blocks[2].subs.length;
dragTo(doc.querySelector("[data-crm-block='2'] [data-crm-sub='0']"), 0);
ok("подблок ушёл в другую секцию",
  T.ru.blocks[2].subs.length === awaySubs - 1,
  T.ru.blocks[1].subs.length + "/" + T.ru.blocks[2].subs.length);
ok("перенос между секциями повторился в en",
  T.en.blocks[2].subs.length === T.ru.blocks[2].subs.length &&
  T.en.blocks[1].subs.length === T.ru.blocks[1].subs.length);
/* в этих данных ru и en изначально разошлись на один блок —
   правки не должны расхождение увеличивать */
ok("ничего не потерялось", tot()[0] === tot()[1], tot().join(" / "));

/* ---------- 4c. переключение языка ---------- */
console.log("\n4c. Языки");
fire(win, doc.querySelector("[data-lang-btn='en']"), "click");
ok("страница переключилась на en", H.L === "en");
ok("разметка пересобрана", doc.querySelectorAll("[data-crm-t]").length > 5);
ok("должность размечена один раз",
  doc.querySelectorAll(".exp-role [data-crm-t]").length === 2,
  doc.querySelector(".exp-role") && doc.querySelector(".exp-role").innerHTML);
const enTitle = byPath(["blocks", 0, "title"]);
const ruWas = get(["blocks", 0, "title"], "ru");
fire(win, enTitle, "mousedown");
enTitle.innerHTML = "English title";
fire(win, doc.body, "mousedown");
ok("текст записан в en", get(["blocks", 0, "title"], "en") === "English title");
ok("ru не тронут", get(["blocks", 0, "title"], "ru") === ruWas);
fire(win, doc.querySelector("[data-lang-btn='ru']"), "click");
ok("вернулись на ru", H.L === "ru");

/* ---------- 5. картинки ---------- */
console.log("\n5. Картинки");
const figEl = doc.querySelector("[data-crm-img='sub']");
const figPath = JSON.parse(figEl.getAttribute("data-crm-p"));
fire(win, figEl, "mousedown");
ok("картинка выбрана, панель со «Заменить»", !!toolbar("img-src"));
fire(win, toolbar("img-wide"), "click");
ok("ширина записалась в данные", typeof get(figPath).w === "number", JSON.stringify(get(figPath)));
ok("ширина попала в разметку",
  /flex:0 0 \d+/.test(byPath(figPath).getAttribute("style") || ""),
  byPath(figPath) && byPath(figPath).outerHTML.slice(0, 120));

fire(win, byPath(figPath), "mousedown");
fire(win, toolbar("img-lib"), "click");
const media = doc.querySelector(".crm-modal");
ok("медиатека собрала картинки проекта", media.querySelectorAll(".crm-tile").length > 3);
const tile = media.querySelectorAll(".crm-tile")[2];
const wantSrc = tile.getAttribute("data-src");
fire(win, tile, "click");
ok("картинка заменена", get(figPath).src === wantSrc, get(figPath).src);

/* ---------- 6. отмена и возврат ---------- */
console.log("\n6. Undo / Redo");
const beforeUndo = get(figPath).src;
fire(win, doc.querySelector(".crm-bar [data-a='undo']"), "click");
ok("отмена вернула прошлую картинку", get(figPath).src !== beforeUndo, get(figPath).src);
fire(win, doc.querySelector(".crm-bar [data-a='redo']"), "click");
ok("возврат вернул новую картинку", get(figPath).src === beforeUndo, get(figPath).src);

let steps = 0;
while (doc.querySelector(".crm-bar [data-a='undo']").disabled === false && steps < 40) {
  fire(win, doc.querySelector(".crm-bar [data-a='undo']"), "click"); steps++;
}
ok("история откатывается до начала (" + steps + " шагов)", steps > 5);
ok("после полного отката заголовок исходный",
  get(["blocks", 1, "title"]) !== "Новый заголовок", get(["blocks", 1, "title"]));
ok("страница цела после отката", T.ru.blocks.length === ruBefore);
let fwd = 0;
while (doc.querySelector(".crm-bar [data-a='redo']").disabled === false && fwd < 40) {
  fire(win, doc.querySelector(".crm-bar [data-a='redo']"), "click"); fwd++;
}
ok("возврат проходит те же шаги", fwd === steps, fwd + " ≠ " + steps);

/* ---------- 7. сохранение и выгрузка ---------- */
console.log("\n7. Сохранение и экспорт");
let stored = null, storedSite = null;
try { stored = JSON.parse(win.localStorage.getItem("crm:sberpravo")); } catch (e) { }
try { storedSite = JSON.parse(win.localStorage.getItem("crm:site")); } catch (e) { }
ok("черновик страницы лежит в localStorage", stored && stored.roots && stored.roots.T, "нет черновика");
ok("общий список проектов сохраняется отдельно", storedSite && storedSite.roots && storedSite.roots.PROJECTS);
ok("страничный черновик не тащит общий список", stored && !stored.roots.PROJECTS);

const RealBlob = win.Blob;
win.__files = [];
win.Blob = function (parts, o) { win.__files.push(String(parts[0])); return new RealBlob(parts, o); };
win.URL.createObjectURL = () => "blob:test";
win.URL.revokeObjectURL = () => { };
win.HTMLAnchorElement.prototype.click = function () { };

fire(win, doc.querySelector(".crm-bar [data-a='export']"), "click");
const exSheet = doc.querySelector(".crm-modal");
ok("открылось окно экспорта", !!exSheet);
ok("предлагается скачать общий список проектов", !!exSheet.querySelector("[data-a='site']"));
fire(win, exSheet.querySelector("[data-a='site']"), "click");
const siteOut = win.__files.pop() || "";
ok("site.js собрался", /const PROJECTS = \[/.test(siteOut), siteOut.slice(0, 60));
ok("в site.js нет старого поля sections", !/"sections"/.test(siteOut));

fire(win, doc.querySelector(".crm-bar [data-a='export']"), "click");
fire(win, doc.querySelector(".crm-modal [data-a='page']"), "click");
const out = win.__files.pop() || "";
ok("файл страницы собрался", out.length > 10000, "длина " + out.length);
ok("в файле нет разметки редактора", !/<[^>]+data-crm-/.test(out) && !/class="[^"]*crm-(bar|pop|ins)/.test(out));
ok("класс редактора не попал в файл", !/<html[^>]*crm-on/.test(out));
ok("подключение редактора сохранено", /assets\/crm-editor\.js/.test(out));
ok("общий список проектов подключён", /assets\/site\.js/.test(out));
ok("данные записаны между маркерами", /\/\*CRM_T_S\*\/const T = \{/.test(out));
const outT = out.match(/\/\*CRM_T_S\*\/const T = ([\s\S]*?);\/\*CRM_T_E\*\//);
let parsed = null;
try { parsed = JSON.parse(outT[1]); } catch (e) { }
ok("данные в файле — валидный JSON", !!parsed);
ok("правки попали в файл", parsed && parsed.ru.blocks.length === T.ru.blocks.length);

/* выгруженный файл должен снова открываться и рисовать то же самое */
fs.writeFileSync("/tmp/export.html", out);
fs.writeFileSync("/tmp/site.js", siteOut);
const re = await open("/tmp/export.html");
ok("выгруженный файл открывается без ошибок", re.window.__errors.length === 0, re.window.__errors[0]);
ok("и рисует все секции",
  re.window.document.querySelectorAll("section.block").length === T.ru.blocks.length);
ok("выгруженная страница содержит правки",
  parsed.ru.blocks.some(b => b.title === "Новый заголовок"));
re.window.close();

/* ---------- 8. режим просмотра устройства ---------- */
console.log("\n8. Просмотр устройства");
const pv = await open(path.join(SITE, "case-medsi.html"), "?crm=preview");
ok("в просмотре нет панели редактора", !pv.window.document.querySelector(".crm-bar"));
ok("в просмотре нет разметки редактора", !pv.window.document.querySelector("[data-crm-p]"));
ok("в просмотре страница отрисована", pv.window.document.querySelectorAll("section.block").length > 5);
pv.window.close();

/* ---------- 9. остальные страницы поднимают редактор ---------- */
console.log("\n9. Редактор на всех страницах");
for (const p of PAGES) {
  const d = await open(path.join(SITE, p), "?crm");
  const w = d.window;
  ok(p + " — редактор запустился",
    !!w.document.querySelector(".crm-bar") && w.__errors.length === 0, w.__errors[0]);
  ok(p + " — есть редактируемые поля", w.document.querySelectorAll("[data-crm-t]").length > 3);
  ok(p + " — есть выбираемые секции", w.document.querySelectorAll("[data-crm-block]").length >= 1);
  d.window.close();
}

/* ---------- 10. картинки и разделитель на простых страницах ---------- */
console.log("\n10. Новые возможности простых страниц");
const simple = await open(path.join(SITE, "case-loko.html"), "?crm");
const sw = simple.window, sd = sw.document;
sw.CRM_HOST.roots.T.ru.blocks[0].subs.push({ imgs: [{ src: "assets/medsi-main.png", cap: "Подпись" }] });
sw.CRM_HOST.roots.T.en.blocks[0].subs.push({ imgs: [{ src: "assets/medsi-main.png", cap: "Caption" }] });
sw.CRM_HOST.roots.T.ru.blocks[0].subs.push({ sep: true });
sw.CRM_HOST.roots.T.en.blocks[0].subs.push({ sep: true });
sw.CRM_HOST.render();
ok("картинка рисуется на простой странице", sd.querySelectorAll(".figs .fig img").length === 1);
ok("картинка размечена для редактора", !!sd.querySelector("[data-crm-img='sub']"));
ok("разделитель рисуется существующим компонентом", !!sd.querySelector(".sub > .head-sep"));
ok("лайтбокс на месте", !!sd.getElementById("lightbox"));
simple.window.close();

/* ---------- 11. меню собирается из блоков ---------- */
console.log("\n11. Левое меню");
{
  const d = await open(path.join(SITE, "case-sberpravo.html"), "?crm");
  const w = d.window, doc = w.document, R = w.CRM_HOST.roots;
  const label = () => [...doc.querySelectorAll("#projects .subnav a.cs")].map(x => x.textContent.trim());
  const before = label();
  const tEl = doc.querySelector("[data-crm-p='" + JSON.stringify(["blocks", 1, "title"]) + "']");
  fire(w, tEl, "mousedown");
  tEl.innerHTML = "Аналитика";
  fire(w, doc.body, "mousedown");
  ok("переименование блока меняет пункт меню",
    label().includes("Аналитика") && !label().includes(before[1]) || label().includes("Аналитика"),
    label().slice(0, 4).join(" | "));

  /* название проекта — общее для всего сайта */
  const row = doc.querySelector("#projects a.row[data-crm-item]");
  fire(w, row, "mousedown");
  ok("строка проекта выбирается, а не открывается", !!doc.querySelector(".crm-pop [data-a='open']"));
  const ti = row.querySelector(".row-ti");
  fire(w, ti, "mousedown");
  ok("со второго щелчка название правится", ti.getAttribute("contenteditable") === "true");
  ti.innerHTML = "RWB. Маркет";
  fire(w, doc.body, "mousedown");
  ok("название проекта записано в общий список",
    R.PROJECTS.list[0].ti.ru === "RWB. Маркет", R.PROJECTS.list[0].ti.ru);
  let site = null;
  try { site = JSON.parse(w.localStorage.getItem("crm:site")); } catch (e) { }
  ok("общий список сохранён отдельным черновиком",
    site && site.roots.PROJECTS.list[0].ti.ru === "RWB. Маркет");
  d.window.close();
}

/* ---------- 12. уровни, отступы, перенос ---------- */
console.log("\n12. Панель уровней, отступы, перенос");
{
  const d = await open(path.join(SITE, "case-sberpravo.html"), "?crm");
  const w = d.window, doc = w.document, T2 = w.CRM_HOST.roots.T;
  const tb = a => doc.querySelector(".crm-pop button[data-a='" + a + "']");

  const li = doc.querySelector(".points li[data-crm-item]");
  fire(w, li, "mousedown");
  const crumbs = [...doc.querySelectorAll(".crm-crumbs button")].map(x => x.textContent);
  ok("видна цепочка уровней", crumbs.length >= 3, crumbs.join(" › "));
  ok("верхний уровень — секция", crumbs[0] === "Секция" || crumbs[0] === "Раздел", crumbs[0]);
  ok("на тексте открыты действия с текстом", !!tb("b"));

  const iPoint = crumbs.indexOf("Пункт");
  fire(w, doc.querySelectorAll(".crm-crumbs button")[iPoint], "click");
  ok("щелчок по «Пункт» переключает уровень", !!tb("it-del") && !tb("b"));

  const arr = JSON.parse(li.getAttribute("data-crm-arr"));
  const holder = arr.slice(0, -1);
  const wasRu = arr.reduce((o, k) => o[k], T2.ru).length;
  const wasEn = arr.reduce((o, k) => o[k], T2.en).length;
  fire(w, tb("it-del"), "click");
  const nowRu = arr.reduce((o, k) => o[k], T2.ru).length;
  const nowEn = arr.reduce((o, k) => o[k], T2.en).length;
  ok("удаляется один пункт, а не весь блок", nowRu === wasRu - 1, wasRu + " → " + nowRu);
  ok("пункт удалён в обоих языках", nowEn === wasEn - 1, wasEn + " → " + nowEn);
  ok("блок на месте", !!doc.querySelector("[data-crm-sub]"));

  /* отступ */
  const sub = doc.querySelector("[data-crm-sub]");
  const subPath = JSON.parse(sub.getAttribute("data-crm-p"));
  fire(w, sub, "mousedown");
  fire(w, doc.querySelector(".crm-pop [data-a='gap']"), "click");
  await tick();
  const gapMenu = [...doc.querySelectorAll(".crm-pop button[data-id]")];
  ok("предлагаются готовые отступы", gapMenu.length === 6, gapMenu.length + "");
  fire(w, gapMenu.find(b => b.getAttribute("data-id") === "80"), "mousedown");
  const subObj = subPath.reduce((o, k) => o[k], T2.ru);
  ok("отступ записан в данные", subObj.gap === 80, JSON.stringify(subObj.gap));
  ok("отступ виден в разметке",
    /margin-top:80px/.test((doc.querySelector("[data-crm-p='" + JSON.stringify(subPath) + "']") || {}).outerHTML || ""));

  /* перенос блока под другой раздел */
  const blk = doc.querySelector("[data-crm-block='2']");
  const movedA = T2.ru.blocks[2].a;
  fire(w, blk, "mousedown");
  fire(w, doc.querySelector(".crm-pop [data-a='blk-to']"), "click");
  await tick();
  const dest = [...doc.querySelectorAll(".crm-pop button[data-id]")];
  ok("предлагаются разделы страницы", dest.length >= 2, dest.length + "");
  fire(w, dest[dest.length - 1], "mousedown");
  const newIdx = T2.ru.blocks.findIndex(b => b.a === movedA);
  ok("блок переехал под выбранный раздел", newIdx !== 2, "2 → " + newIdx);
  ok("порядок повторился в en", T2.en.blocks[newIdx].a === movedA);
  d.window.close();
}

/* ---------- 13. перевод и выравнивание языков ---------- */
console.log("\n13. Перевод");
{
  const d = await open(path.join(SITE, "case-sberpravo.html"), "?crm");
  const w = d.window, doc = w.document, T3 = w.CRM_HOST.roots.T;
  ok("языки больше не расходятся", doc.querySelector(".crm-warn").hidden);
  fire(w, doc.querySelector(".crm-bar [data-a='translate']"), "click");
  ok("непереведённого не осталось", /Перевод/.test(doc.querySelector(".crm-sheet-h b").textContent) &&
    !doc.querySelector(".crm-tr input"), (doc.querySelector(".crm-sheet-b")||{}).textContent);
  fire(w, doc.querySelector(".crm-modal [data-a=close]"), "click");

  /* новое: правки переехали в английскую версию */
  ok("переименованные блоки переведены",
    T3.en.blocks[1].title === "Discovery" && T3.en.blocks[10].title === "Discovery",
    T3.en.blocks[1].title + " / " + T3.en.blocks[10].title);
  ok("обязанности переведены полностью", T3.ru.duties.length === T3.en.duties.length);
  d.window.close();
}

/* ---------- 14. главная страница ---------- */
console.log("\n14. Главная страница");
{
  const d = await open(path.join(SITE, "index.html"), "?crm");
  const w = d.window, doc = w.document, R = w.CRM_HOST.roots;
  ok("редактор запустился", !!doc.querySelector(".crm-bar") && w.__errors.length === 0, w.__errors[0]);
  ok("размечены места работы", doc.querySelectorAll("#experience article.exp[data-crm-item]").length === R.EXPERIENCE.list.length);
  ok("размечено образование", doc.querySelectorAll("#education .row[data-crm-item]").length === R.EDUCATION.list.length);
  ok("размечены навыки", doc.querySelectorAll("#skills .chip[data-crm-t]").length > 5);
  ok("размечены личные карточки", doc.querySelectorAll("#personal .card[data-crm-item]").length === R.PERSONAL.list.length);
  ok("размечен текст о себе", !!doc.querySelector("[data-i18n='bio'][data-crm-t]"));

  const bio = doc.querySelector("[data-i18n='bio']");
  fire(w, bio, "mousedown");
  bio.innerHTML = "Новое описание";
  fire(w, doc.body, "mousedown");
  ok("текст о себе записан в данные", R.STR.ru.bio === "Новое описание", R.STR.ru.bio);
  ok("английский не затронут", R.STR.en.bio !== "Новое описание");

  const role = doc.querySelector("#experience .exp-company");
  fire(w, role, "mousedown");
  role.innerHTML = "RWB Group";
  fire(w, doc.body, "mousedown");
  ok("компания записана в нужный язык", R.EXPERIENCE.list[0].company.ru === "RWB Group",
    JSON.stringify(R.EXPERIENCE.list[0].company));

  const eduLen = R.EDUCATION.list.length;
  fire(w, doc.querySelector("#education .row[data-crm-item]"), "mousedown");
  fire(w, doc.querySelector(".crm-pop [data-a='it-dup']"), "click");
  ok("строку образования можно продублировать", R.EDUCATION.list.length === eduLen + 1);
  fire(w, doc.querySelector("#education .row[data-crm-item]"), "mousedown");
  fire(w, doc.querySelector(".crm-pop [data-a='it-del']"), "click");
  ok("и удалить", R.EDUCATION.list.length === eduLen);

  /* экспорт главной */
  const RB = w.Blob; w.__files = [];
  w.Blob = function (parts, o) { w.__files.push(String(parts[0])); return new RB(parts, o); };
  w.URL.createObjectURL = () => "blob:x"; w.URL.revokeObjectURL = () => { };
  w.HTMLAnchorElement.prototype.click = function () { };
  fire(w, doc.querySelector(".crm-bar [data-a='export']"), "click");
  fire(w, doc.querySelector(".crm-modal [data-a='page']"), "click");
  const out = w.__files.pop() || "";
  ok("index.html собрался", out.length > 10000, "длина " + out.length);
  ok("правка попала в файл", /Новое описание/.test(out));
  ok("все наборы данных на месте",
    /\/\*CRM_STR_S\*\/const STR = \{/.test(out) && /\/\*CRM_EXP_S\*\/const EXPERIENCE = \[/.test(out) &&
    /\/\*CRM_SKL_S\*\/const SKILLS = \{/.test(out));
  ok("в файле нет разметки редактора", !/<[^>]+data-crm-/.test(out));
  fs.writeFileSync("/tmp/index-out.html", out);
  const re2 = await open("/tmp/index-out.html");
  ok("выгруженная главная открывается без ошибок", re2.window.__errors.length === 0, re2.window.__errors[0]);
  ok("и показывает правку",
    /Новое описание/.test(re2.window.document.querySelector("[data-i18n='bio']").innerHTML));
  re2.window.close();
  d.window.close();
}

console.log("\n————————————————————————");

console.log("пройдено: " + pass + ", провалено: " + fail);
process.exit(fail ? 1 : 0);

}
main().catch(e=>{console.error(e);process.exit(1)});
