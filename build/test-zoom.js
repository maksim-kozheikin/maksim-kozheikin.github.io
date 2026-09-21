/* Проверка просмотра картинок: приближение, перетаскивание, листание. */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const SITE = "/home/claude/work/v4/out2";
const PAGES = ["case-loko.html", "case-medsi.html", "case-rwb.html",
  "case-sberpravo.html", "case-vtb.html", "case-zephyr.html"];

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ " + name + (extra !== undefined ? "  → " + extra : "")); }
}

const STUB = `<script>
window.IntersectionObserver=function(){return{observe(){},disconnect(){}}};
Element.prototype.scrollIntoView=function(){};
window.scrollTo=function(){};
Element.prototype.setPointerCapture=function(){};
Element.prototype.releasePointerCapture=function(){};
</script>`;

function open(file) {
  const S = fs.readFileSync(SITE + "/assets/site.js", "utf8");
  let h = fs.readFileSync(path.join(SITE, file), "utf8");
  h = h.replace(/<script src="assets\/site\.js"[^>]*><\/script>/, () => "<script>" + S + "</script>");
  h = h.replace(/<script src="assets\/crm-editor\.js"[^>]*><\/script>/, () => "");
  h = h.replace("<head>", () => "<head>" + STUB);
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", e => errors.push(String(e.message).slice(0, 140)));
  const dom = new JSDOM(h, {
    runScripts: "dangerously", url: "https://x.test/" + file,
    pretendToBeVisual: true, virtualConsole: vc
  });
  dom.window.__errors = errors;
  return new Promise(res => {
    if (dom.window.document.readyState === "complete") return res(dom);
    dom.window.addEventListener("load", () => res(dom));
    setTimeout(() => res(dom), 3000);
  });
}

function scaleOf(img) {
  const m = /scale\(([\d.]+)\)/.exec(img.style.transform || "");
  return m ? +m[1] : 1;
}
function panOf(img) {
  const m = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(img.style.transform || "");
  return m ? { x: +m[1], y: +m[2] } : { x: 0, y: 0 };
}

async function main() {
  /* ---------- 1. страницы живы ---------- */
  console.log("\n1. Страницы");
  for (const p of PAGES.concat("index.html")) {
    const d = await open(p);
    ok(p + " — без ошибок", d.window.__errors.length === 0, d.window.__errors[0]);
    d.window.close();
  }

  /* ---------- 2. панель масштаба есть везде ---------- */
  console.log("\n2. Панель масштаба");
  for (const p of PAGES) {
    const d = await open(p);
    const doc = d.window.document;
    ok(p + " — кнопки на месте",
      !!doc.querySelector(".lightbox-zoom .zoom-in") &&
      !!doc.querySelector(".lightbox-zoom .zoom-out") &&
      !!doc.querySelector(".lightbox-zoom .zoom-fit"));
    d.window.close();
  }

  /* ---------- 3. поведение ---------- */
  console.log("\n3. Приближение");
  const d = await open("case-medsi.html");
  const w = d.window, doc = w.document;
  const img = doc.querySelector("#lightbox img");
  const lb = doc.getElementById("lightbox");
  const click = el => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true, cancelable: true }));
  const key = k => doc.dispatchEvent(new w.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));

  /* картинке нужен реальный размер — в jsdom его нет */
  const stage = doc.querySelector(".lightbox-stage");
  Object.defineProperty(img, "offsetWidth", { get: () => 1000, configurable: true });
  Object.defineProperty(img, "offsetHeight", { get: () => 600, configurable: true });
  Object.defineProperty(stage, "clientWidth", { get: () => 1024, configurable: true });
  Object.defineProperty(stage, "clientHeight", { get: () => 620, configurable: true });
  img.getBoundingClientRect = () => ({ left: 100, top: 90, width: 1000, height: 600, right: 1100, bottom: 690 });

  /* сейчас в каждом ряду по одной картинке, поэтому для проверки
     листания собираем ряд из двух — так же, как получится у человека,
     если он добавит в блок вторую картинку */
  const row = doc.querySelector(".figs");
  const copy = row.querySelector(".fig").cloneNode(true);
  copy.querySelector(".fig-btn").setAttribute("data-full", "assets/second.webp");
  row.appendChild(copy);
  ok("в ряду две картинки", row.querySelectorAll(".fig-btn").length === 2);
  click(row.querySelector(".fig-btn"));
  ok("просмотр открылся", lb.classList.contains("open"));
  ok("начальный масштаб 100%", scaleOf(img) === 1, doc.querySelector(".lvl").textContent);
  ok("кнопка «отдалить» выключена", doc.querySelector(".zoom-out").disabled);

  click(doc.querySelector(".zoom-in"));
  ok("кнопка «+» приближает", scaleOf(img) > 1, scaleOf(img));
  ok("подпись показывает проценты", doc.querySelector(".lvl").textContent === "140%",
    doc.querySelector(".lvl").textContent);
  ok("появился класс zoomed", lb.classList.contains("zoomed"));
  ok("кнопка «отдалить» включилась", !doc.querySelector(".zoom-out").disabled);

  click(doc.querySelector(".zoom-out"));
  ok("кнопка «−» возвращает к 100%", scaleOf(img) === 1, scaleOf(img));
  ok("класс zoomed снят", !lb.classList.contains("zoomed"));

  /* колесо */
  const wheel = (dy, x, y) => stage.dispatchEvent(new w.WheelEvent("wheel",
    { deltaY: dy, clientX: x, clientY: y, bubbles: true, cancelable: true }));
  wheel(-100, 600, 350);
  ok("колесо приближает", scaleOf(img) > 1, scaleOf(img));
  const zAfterWheel = scaleOf(img);
  wheel(100, 600, 350);
  ok("колесо в обратную сторону отдаляет", scaleOf(img) < zAfterWheel);

  /* приближение к точке под курсором */
  const resetBtn = doc.querySelector(".zoom-fit");
  click(resetBtn);
  wheel(-100, 200, 100);            // курсор в левом верхнем углу картинки
  const pan = panOf(img);
  ok("картинка сдвигается к точке под курсором", pan.x !== 0 || pan.y !== 0,
    JSON.stringify(pan));

  click(resetBtn);
  ok("«Вписать» возвращает 100% и сдвиг", scaleOf(img) === 1 && panOf(img).x === 0);

  /* щелчок по картинке */
  img.dispatchEvent(new w.MouseEvent("click", { bubbles: true, cancelable: true, clientX: 600, clientY: 350 }));
  ok("щелчок по картинке приближает", scaleOf(img) === 2.5, scaleOf(img));
  img.dispatchEvent(new w.MouseEvent("dblclick", { bubbles: true, cancelable: true }));
  ok("двойной щелчок возвращает к 100%", scaleOf(img) === 1);

  /* клавиши */
  key("+"); ok("клавиша + приближает", scaleOf(img) > 1, scaleOf(img));
  key("0"); ok("клавиша 0 вписывает", scaleOf(img) === 1);
  key("+");
  const before = panOf(img).x;
  key("ArrowRight");
  ok("стрелка двигает приближённую картинку", panOf(img).x !== before,
    before + " → " + panOf(img).x);
  const srcBefore = img.getAttribute("src");
  key("0"); key("ArrowRight");
  ok("на 100% стрелка листает", img.getAttribute("src") !== srcBefore,
    srcBefore + " → " + img.getAttribute("src"));

  /* смена картинки сбрасывает масштаб */
  key("+"); key("+");
  ok("масштаб больше 100%", scaleOf(img) > 1);
  key("0");
  key("ArrowRight");
  ok("новая картинка открывается вписанной", scaleOf(img) === 1);

  /* перетаскивание */
  key("+"); key("+");
  const pos0 = panOf(img);
  const pd = (type, x, y) => img.dispatchEvent(new w.MouseEvent(type,
    { bubbles: true, cancelable: true, clientX: x, clientY: y }));
  /* pointer-события в jsdom эмулируем через MouseEvent с нужными полями */
  const pe = (type, x, y, id) => {
    const ev = new w.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
    Object.defineProperty(ev, "pointerId", { value: id === undefined ? 1 : id });
    Object.defineProperty(ev, "pointerType", { value: "mouse" });
    Object.defineProperty(ev, "target", { value: stage });
    stage.dispatchEvent(ev);
  };
  pe("pointerdown", 500, 300);
  pe("pointermove", 560, 340);
  pe("pointerup", 560, 340);
  const pos1 = panOf(img);
  ok("перетаскивание двигает картинку", pos1.x !== pos0.x || pos1.y !== pos0.y,
    JSON.stringify(pos0) + " → " + JSON.stringify(pos1));

  /* границы */
  key("0"); key("+");
  for (let i = 0; i < 20; i++) { pe("pointerdown", 500, 300); pe("pointermove", 5000, 5000); pe("pointerup", 5000, 5000); }
  const far = panOf(img);
  const maxX = (1000 * scaleOf(img) - 1024) / 2;
  ok("картинку нельзя утащить за край", far.x <= Math.max(0, maxX) + 1,
    far.x + " при пределе " + Math.round(Math.max(0, maxX)));

  /* закрытие сбрасывает масштаб */
  click(doc.querySelector(".lightbox-close"));
  ok("просмотр закрылся", !lb.classList.contains("open"));
  ok("масштаб сброшен", scaleOf(img) === 1);

  /* свайп на телефоне */
  console.log("\n4. Касания");
  click(row.querySelector(".fig-btn"));
  const n0 = img.getAttribute("src");
  pe("pointerdown", 300, 300); pe("pointermove", 200, 300); pe("pointerup", 100, 300);
  ok("свайп листает картинки", img.getAttribute("src") !== n0,
    n0 + " → " + img.getAttribute("src"));

  /* щипок двумя пальцами */
  pe("pointerdown", 300, 300, 1);
  pe("pointerdown", 500, 300, 2);
  pe("pointermove", 250, 300, 1);
  pe("pointermove", 650, 300, 2);
  ok("щипок приближает", scaleOf(img) > 1, scaleOf(img));
  pe("pointerup", 250, 300, 1); pe("pointerup", 650, 300, 2);

  const n1 = img.getAttribute("src");
  pe("pointerdown", 300, 300); pe("pointermove", 200, 300); pe("pointerup", 100, 300);
  ok("приближённую картинку свайп не листает", img.getAttribute("src") === n1);
  ok("зато она подвинулась", panOf(img).x !== 0, JSON.stringify(panOf(img)));

  d.window.close();

  console.log("\n————————————————————————");
  console.log("пройдено: " + pass + ", провалено: " + fail);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
