/* Проверка редактора без браузера: jsdom + настоящие события DOM. */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ORIG = "/home/claude/work/maksim-kozheikin.github.io-main";
const SITE = "/home/claude/work/site";
const EDITOR = fs.readFileSync(SITE + "/assets/crm-editor.js", "utf8");

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
window.IntersectionObserver=function(){return {observe:function(){},disconnect:function(){}}};
</script>`;

function load(file, query) {
  let html = fs.readFileSync(file, "utf8");
  html = html.replace('<script src="assets/crm-editor.js" defer></script>',
    "<script>" + EDITOR + "</script>");
  html = html.replace("<head>", "<head>" + STUB);
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

function fire(win, el, type, init) {
  const E = type === "click" || type.startsWith("mouse") ? win.MouseEvent : win.Event;
  el.dispatchEvent(new E(type, Object.assign({ bubbles: true, cancelable: true }, init)));
}

async function main(){
/* ---------- 1. публичная страница не изменилась ---------- */
console.log("\n1. Публичный вид страниц");
for (const p of PAGES) {
  const a = await open(path.join(ORIG, p));
  const b = await open(path.join(SITE, p));
  const ca = a.window.document.getElementById("content").innerHTML;
  const cb = b.window.document.getElementById("content").innerHTML;
  const na = a.window.document.getElementById("projects").innerHTML;
  const nb = b.window.document.getElementById("projects").innerHTML;
  ok(p + " — контент совпадает с исходным", ca === cb);
  ok(p + " — меню совпадает с исходным", na === nb);
  ok(p + " — редактор не вмешался", !b.window.document.querySelector("[data-crm-p], .crm-bar"));
  a.window.close(); b.window.close();
}

/* ---------- 2. редактор поднимается и размечает страницу ---------- */
console.log("\n2. Разметка страницы в режиме ?crm");
const dom = await open(path.join(SITE, "case-sberpravo.html"), "?crm");
const win = dom.window, doc = win.document;
const H = win.CRM_HOST;

ok("панель редактора построена", !!doc.querySelector(".crm-bar"));
ok("на странице нет ошибок", win.__errors.length === 0, win.__errors[0]);
ok("класс редактора включён", doc.documentElement.classList.contains("crm-on"));
ok("размечены секции", doc.querySelectorAll("[data-crm-block]").length === H.T.ru.blocks.length);
ok("размечены подблоки", doc.querySelectorAll("[data-crm-sub]").length > 20);
ok("размечены картинки", doc.querySelectorAll("[data-crm-img]").length > 0);

/* путь ведёт ровно к тому тексту, который виден */
function txt(el) { return el.textContent.replace(/\u00A0/g, " ").trim(); }
function byPath(p) { return doc.querySelector("[data-crm-p='" + JSON.stringify(p) + "']"); }
function get(p, lang) {
  let o = H.T[lang || H.L];
  for (const k of p) o = o[k];
  return o;
}
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
const ruBefore = H.T.ru.blocks.length, enBefore = H.T.en.blocks.length;
act(doc.querySelector("[data-crm-block='2']"), "blk-dup");
ok("секция продублирована в обоих языках",
  H.T.ru.blocks.length === ruBefore + 1 && H.T.en.blocks.length === enBefore + 1,
  H.T.ru.blocks.length + "/" + H.T.en.blocks.length);
ok("у копии свой якорь", H.T.ru.blocks[2].a !== H.T.ru.blocks[3].a);

const titles = H.T.ru.blocks.map(b => b.title);
act(doc.querySelector("[data-crm-block='3']"), "blk-up");
ok("секция поднялась", H.T.ru.blocks[2].title === titles[3] && H.T.ru.blocks[3].title === titles[2]);
ok("en повторил перестановку", H.T.en.blocks[2].a === H.T.ru.blocks[2].a);

act(doc.querySelector("[data-crm-block='3']"), "blk-del");
ok("секция удалена в обоих языках",
  H.T.ru.blocks.length === ruBefore && H.T.en.blocks.length === enBefore);

const subsRu = H.T.ru.blocks[1].subs.length, subsEn = H.T.en.blocks[1].subs.length;
act(doc.querySelector("[data-crm-block='1'] [data-crm-sub='0']"), "sub-dup");
ok("подблок продублирован в обоих языках",
  H.T.ru.blocks[1].subs.length === subsRu + 1 && H.T.en.blocks[1].subs.length === subsEn + 1);
act(doc.querySelector("[data-crm-block='1'] [data-crm-sub='1']"), "sub-del");
ok("подблок удалён в обоих языках",
  H.T.ru.blocks[1].subs.length === subsRu && H.T.en.blocks[1].subs.length === subsEn);

/* добавление блока из набора готовых */
fire(win, doc.querySelector("[data-crm-block='1']"), "mousedown");
fire(win, toolbar("blk-addsub"), "click");
const optSheet = doc.querySelector(".crm-modal");
ok("открылся выбор типа блока", !!optSheet && optSheet.querySelectorAll(".crm-opt").length >= 8);
fire(win, optSheet.querySelector(".crm-opt[data-id='metrics']"), "click");
ok("метрики добавлены в обоих языках",
  H.T.ru.blocks[1].subs.length === subsRu + 1 && H.T.en.blocks[1].subs.length === subsEn + 1);
ok("метрика создана по образцу страницы",
  "from" in H.T.ru.blocks[1].subs[H.T.ru.blocks[1].subs.length - 1].results[0]);
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
const orderRu = H.T.ru.blocks.map(b => b.a);
dragTo(doc.querySelector("[data-crm-block='3']"), 0);
ok("секцию можно перетащить", H.T.ru.blocks.map(b => b.a).join() !== orderRu.join(),
  H.T.ru.blocks.map(b => b.a).join());
ok("перетаскивание повторилось в en",
  H.T.en.blocks.map(b => b.a).join() === H.T.ru.blocks.map(b => b.a).join());

const homeSubs = H.T.ru.blocks[1].subs.length;
const awaySubs = H.T.ru.blocks[2].subs.length;
dragTo(doc.querySelector("[data-crm-block='2'] [data-crm-sub='0']"), 0);
ok("подблок ушёл в другую секцию",
  H.T.ru.blocks[2].subs.length === awaySubs - 1,
  H.T.ru.blocks[1].subs.length + "/" + H.T.ru.blocks[2].subs.length);
ok("перенос между секциями повторился в en",
  H.T.en.blocks[2].subs.length === H.T.ru.blocks[2].subs.length &&
  H.T.en.blocks[1].subs.length === H.T.ru.blocks[1].subs.length);
ok("ничего не потерялось",
  H.T.ru.blocks.reduce((n, b) => n + (b.subs || []).length, 0) ===
  H.T.en.blocks.reduce((n, b) => n + (b.subs || []).length, 0));

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
ok("страница цела после отката", H.T.ru.blocks.length === ruBefore);
let fwd = 0;
while (doc.querySelector(".crm-bar [data-a='redo']").disabled === false && fwd < 40) {
  fire(win, doc.querySelector(".crm-bar [data-a='redo']"), "click"); fwd++;
}
ok("возврат проходит те же шаги", fwd === steps, fwd + " ≠ " + steps);

/* ---------- 7. сохранение и выгрузка ---------- */
console.log("\n7. Сохранение и экспорт");
let stored = null;
try { stored = JSON.parse(win.localStorage.getItem("crm:sberpravo")); } catch (e) { }
ok("черновик лежит в localStorage", stored && stored.T && stored.T.ru, "нет черновика");
ok("формат черновика прежний {IMG,T}", stored && "IMG" in stored && "T" in stored);

const RealBlob = win.Blob;
win.Blob = function (parts, o) { win.__export = String(parts[0]); return new RealBlob(parts, o); };
win.URL.createObjectURL = () => "blob:test";
win.URL.revokeObjectURL = () => { };
win.HTMLAnchorElement.prototype.click = function () { };
fire(win, doc.querySelector(".crm-bar [data-a='export']"), "click");
const out = win.__export || "";
ok("файл собрался", out.length > 10000, "длина " + out.length);
ok("в файле нет разметки редактора", !/<[^>]+data-crm-/.test(out) && !/class="[^"]*crm-(bar|pop|ins)/.test(out));
ok("класс редактора не попал в файл", !/<html[^>]*crm-on/.test(out));
ok("в файле нет старой панели CRM", !/crmPanel|crm-thumb/.test(out));
ok("подключение редактора сохранено", /assets\/crm-editor\.js/.test(out));
ok("данные записаны между маркерами", /\/\*CRM_T_S\*\/const T = \{/.test(out));
const outT = out.match(/\/\*CRM_T_S\*\/const T = ([\s\S]*?);\/\*CRM_T_E\*\//);
let parsed = null;
try { parsed = JSON.parse(outT[1]); } catch (e) { }
ok("данные в файле — валидный JSON", !!parsed);
ok("правки попали в файл", parsed && parsed.ru.blocks.length === H.T.ru.blocks.length);

/* выгруженный файл должен снова открываться и рисовать то же самое */
fs.writeFileSync("/tmp/export.html", out);
const re = await open("/tmp/export.html");
ok("выгруженный файл открывается без ошибок", re.window.__errors.length === 0, re.window.__errors[0]);
ok("и рисует контент без ошибок",
  re.window.document.querySelectorAll("section.block").length === H.T.ru.blocks.length);
ok("выгруженная страница содержит правки",
  /Новый заголовок/.test(re.window.document.getElementById("content").innerHTML) ||
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
sw.CRM_HOST.T.ru.blocks[0].subs.push({ imgs: [{ src: "assets/medsi-main.png", cap: "Подпись" }] });
sw.CRM_HOST.T.en.blocks[0].subs.push({ imgs: [{ src: "assets/medsi-main.png", cap: "Caption" }] });
sw.CRM_HOST.T.ru.blocks[0].subs.push({ sep: true });
sw.CRM_HOST.T.en.blocks[0].subs.push({ sep: true });
sw.CRM_HOST.render();
ok("картинка рисуется на простой странице", sd.querySelectorAll(".figs .fig img").length === 1);
ok("картинка размечена для редактора", !!sd.querySelector("[data-crm-img='sub']"));
ok("разделитель рисуется существующим компонентом", !!sd.querySelector(".sub > .head-sep"));
ok("лайтбокс на месте", !!sd.getElementById("lightbox"));
simple.window.close();

console.log("\n————————————————————————");
console.log("пройдено: " + pass + ", провалено: " + fail);
process.exit(fail ? 1 : 0);

}
main().catch(e=>{console.error(e);process.exit(1)});
