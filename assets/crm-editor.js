/* ============================================================
   CRM — визуальный редактор страницы

   Открывается адресом  case-*.html?crm
   Публичная страница скрипт не запускает: без ?crm он выходит
   на первой строке и ничего не добавляет в DOM.

   Весь интерфейс собран из того, что уже есть на сайте:
   токены --accent / --line / --surface / --ink / --muted / --sel,
   типографическая шкала --h1…--eyebrow, шрифт --sans,
   радиусы 7 / 10 / 14 / 20px и тень .segmented.
   Новых цветов, шрифтов, размеров и радиусов не заводим.

   Данные — те же, что и раньше: объект T (ru/en) внутри страницы.
   Черновик — localStorage "crm:<id>", формат {IMG,T} не менялся.
   Выгрузка — тот же приём с маркерами CRM_T_S / CRM_T_E.
============================================================ */
(function () {
"use strict";

var H = window.CRM_HOST;
if (!H) return;

var q = new URLSearchParams(location.search);
var mode = q.has("crm") ? (q.get("crm") || "edit") : (location.hash === "#crm" ? "edit" : "");
if (!mode) return;                       /* публичная страница — выходим */
var PREVIEW = mode === "preview";        /* режим устройства: только показ */

/* какие возможности есть у рендера этой страницы */
var CAPS = Object.assign({
  list: false, metricBig: false, figsFull: false, steps: false,
  why: false, task: false, tags: false, blockImg: false, flow: false
}, H.caps || {});

/* ---------- короткие помощники ---------- */
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
var esc = function (s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};
var uid = function (p) { return p + "-" + Math.random().toString(36).slice(2, 7); };
var content = function () { return document.getElementById("content"); };

/* ============================================================
   1. ДАННЫЕ: доступ по пути, зеркальные операции по языкам
   Путь — массив вида ["blocks",2,"subs",0,"note"] внутри T[язык].
============================================================ */
var LANGS = function () { return Object.keys(H.T); };

function ref(path, lang) {
  var o = H.T[lang || H.L];
  for (var i = 0; i < path.length - 1; i++) {
    if (o == null) return null;
    o = o[path[i]];
  }
  return o == null ? null : { o: o, k: path[path.length - 1] };
}
function get(path, lang) { var r = ref(path, lang); return r ? r.o[r.k] : undefined; }
function set(path, val, lang) { var r = ref(path, lang); if (r) r.o[r.k] = val; }

/* массив по пути; если его нет — заводим во всех языках */
function ensureArr(path) {
  LANGS().forEach(function (lg) {
    var r = ref(path, lg);
    if (r && !Array.isArray(r.o[r.k])) r.o[r.k] = [];
  });
  return get(path);
}

/* Структурная правка выполняется во всех языках сразу — иначе ru и en
   разъедутся. Другой язык трогаем только если массив там параллелен
   текущему (та же длина): если данные уже разошлись, правим текущий. */
function arrOp(path, fn) {
  var cur = get(path);
  if (!Array.isArray(cur)) return;
  var len = cur.length;
  LANGS().forEach(function (lg) {
    if (lg === H.L) return;
    var a = get(path, lg);
    if (Array.isArray(a) && a.length === len) fn(a, lg);
  });
  fn(cur, H.L);
}
function itemInsert(path, at, make) { ensureArr(path); arrOp(path, function (a) { a.splice(at, 0, make()); }); }
function itemRemove(path, i) { arrOp(path, function (a) { a.splice(i, 1); }); }
function itemDup(path, i) { arrOp(path, function (a) { a.splice(i + 1, 0, clone(a[i])); }); }
function itemMove(path, from, to) {
  arrOp(path, function (a) {
    if (to < 0 || to >= a.length) return;
    a.splice(to, 0, a.splice(from, 1)[0]);
  });
}
/* перенос подблока между блоками (в том числе в другой блок) */
function subMove(fromB, fromI, toB, toI) {
  var srcLen = (get(["blocks", fromB, "subs"]) || []).length;
  var dstLen = (get(["blocks", toB, "subs"]) || []).length;
  LANGS().forEach(function (lg) {
    var s = get(["blocks", fromB, "subs"], lg);
    var d = get(["blocks", toB, "subs"], lg);
    if (!Array.isArray(s) || !Array.isArray(d)) return;
    if (lg !== H.L && (s.length !== srcLen || d.length !== dstLen)) return;
    var it = s.splice(fromI, 1)[0];
    var at = toI;
    if (s === d && fromI < toI) at--;
    d.splice(at, 0, it);
  });
}

/* ============================================================
   2. СОХРАНЕНИЕ И ИСТОРИЯ
============================================================ */
var LS = "crm:" + H.id, MEDIA_LS = "crm:media";
var saveTimer = null, saveState = "";

function save() {
  try {
    localStorage.setItem(LS, JSON.stringify({ IMG: H.IMG, T: H.T }));
    setSaveState("Сохранено");
  } catch (e) {
    setSaveState("Не сохранилось");
  }
}
function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 500); }
function loadDraft() {
  try {
    var s = localStorage.getItem(LS); if (!s) return false;
    var o = JSON.parse(s);
    if (o.T) Object.keys(o.T).forEach(function (l) { if (H.T[l]) H.T[l] = o.T[l]; });
    if (o.IMG) Object.assign(H.IMG, o.IMG);
    return true;
  } catch (e) { return false; }
}
function snap() { return JSON.stringify({ T: H.T, IMG: H.IMG }); }
function restore(s) {
  var o = JSON.parse(s);
  Object.keys(o.T).forEach(function (l) { H.T[l] = o.T[l]; });
  Object.keys(H.IMG).forEach(function (k) { delete H.IMG[k]; });
  Object.assign(H.IMG, o.IMG);
}

var HIST = {
  undo: [], redo: [], base: null, max: 60,
  init: function () { this.base = snap(); },
  /* фиксируем шаг: всё, что изменилось с прошлой фиксации */
  commit: function () {
    var s = snap();
    if (s === this.base) return;
    this.undo.push(this.base);
    if (this.undo.length > this.max) this.undo.shift();
    this.base = s; this.redo.length = 0;
    save(); paintBar();
  },
  step: function (from, to) {
    if (!from.length) return;
    to.push(this.base);
    var s = from.pop();
    this.base = s;
    restore(s); save();
    rerender(true); paintBar();
  },
  back: function () { commitEditing(); this.step(this.undo, this.redo); },
  fwd: function () { this.step(this.redo, this.undo); }
};

/* ============================================================
   3. РАЗМЕТКА DOM: связываем то, что видно, с данными
   Публичный рендер не трогаем — атрибуты навешиваем после него
   и только в редакторе.
============================================================ */
var PH = {                                   /* подсказки в пустых полях */
  title: "Заголовок", lead: "Описание", ti: "Подзаголовок", note: "Текст",
  cap: "Подпись", l: "Подпись", n: "Число", p: "Текст", h: "Начало пункта",
  date: "Даты", position: "Должность", company: "Компания", desc: "Описание"
};

function markText(el, path, opt) {
  if (!el) return;
  opt = opt || {};
  el.setAttribute("data-crm-t", "1");
  el.setAttribute("data-crm-p", JSON.stringify(path));
  el.setAttribute("data-crm-ph", opt.ph || PH[path[path.length - 1]] || "Текст");
  if (opt.line) el.setAttribute("data-crm-line", "1");
  if (opt.kind) el.setAttribute("data-crm-kind", opt.kind);
}
function markItem(el, arrPath, i, type) {
  if (!el) return;
  el.setAttribute("data-crm-item", type);
  el.setAttribute("data-crm-arr", JSON.stringify(arrPath));
  el.setAttribute("data-crm-i", i);
  /* путь нужен, чтобы вернуть выбор на тот же элемент после перерисовки */
  if (!el.hasAttribute("data-crm-p")) el.setAttribute("data-crm-p", JSON.stringify(arrPath.concat(i)));
}

function annotate() {
  var root = content(); if (!root || PREVIEW) return;
  var t = H.T[H.L];

  markText(root.querySelector(".exp-eyebrow"), ["date"], { line: 1 });

  var role = root.querySelector(".exp-role");
  if (role) {
    /* «Должность · Компания» — должность лежит голым текстом,
       заворачиваем её в span, чтобы она стала отдельным полем.
       Проверка нужна, чтобы повторный проход не завернул разделитель. */
    var tn = role.querySelector("span[data-crm-t]") ? null :
      [].slice.call(role.childNodes).filter(function (n) {
        return n.nodeType === 3 && n.textContent.trim();
      })[0];
    if (tn) {
      var sp = document.createElement("span");
      sp.textContent = tn.textContent.replace(/\s*·\s*$/, "");
      role.insertBefore(sp, tn);
      tn.textContent = " · ";
      markText(sp, ["position"], { line: 1 });
    }
    markText(role.querySelector(".exp-company"), ["title"], { line: 1, ph: PH.company });
  }
  markText(root.querySelector(".exp-summary"), ["desc"]);

  $$("#duties li", root).forEach(function (li, i) {
    markText(li, ["duties", i]);
    markItem(li, ["duties"], i, "duty");
  });

  $$("#achievements .card.metric", root).forEach(function (c, i) {
    markItem(c, ["achievements"], i, "ach");
    /* число рисуется только когда оно есть — иначе его негде набрать,
       поэтому в редакторе подставляем пустое место под него */
    if (!c.querySelector(".num")) {
      var num = document.createElement("span");
      num.className = "num";
      c.insertBefore(num, c.firstChild);
    }
    markText(c.querySelector(".num"), ["achievements", i, "n"], { line: 1 });
    markText(c.querySelector(".lbl"), ["achievements", i, "l"], { line: 1 });
  });

  $$(":scope > section.block", root).forEach(function (sec, bi) {
    sec.setAttribute("data-crm-block", bi);
    sec.setAttribute("data-crm-p", JSON.stringify(["blocks", bi]));
    markText(sec.querySelector(".block-title"), ["blocks", bi, "title"], { line: 1 });
    markText(sec.querySelector(".block-lead"), ["blocks", bi, "lead"]);
    markText(sec.querySelector(".block-why"), ["blocks", bi, "why"]);
    markText(sec.querySelector(".task p"), ["blocks", bi, "task"]);

    $$(":scope > .chips .chip", sec).forEach(function (c, k) {
      markText(c, ["blocks", bi, "tags", k], { line: 1 });
      markItem(c, ["blocks", bi, "tags"], k, "tag");
    });
    $$(".flowline .fl-step", sec).forEach(function (c, k) {
      markText(c, ["blocks", bi, "flow", k], { line: 1 });
      markItem(c, ["blocks", bi, "flow"], k, "flow");
    });

    var mk = 0, gk = 0;
    $$(":scope > .meta > div", sec).forEach(function (cell) {
      if (cell.querySelector("p.dim")) {
        markText(cell.querySelector("h4"), ["blocks", bi, "meta", mk, 0], { line: 1 });
        markText(cell.querySelector("p.dim"), ["blocks", bi, "meta", mk, 1], { line: 1 });
        markItem(cell, ["blocks", bi, "meta"], mk, "meta");
        mk++;
      } else {
        $$(".goal", cell).forEach(function (g) {
          markText(g, ["blocks", bi, "goals", gk], { line: 1 });
          markItem(g, ["blocks", bi, "goals"], gk, "goal");
          gk++;
        });
      }
    });

    /* картинка в шапке кейса (один figure прямо в секции) */
    var head = $$(":scope > .figs", sec)[0];
    if (head) {
      var f = head.querySelector(".fig");
      if (f) { f.setAttribute("data-crm-img", "block"); f.setAttribute("data-crm-p", JSON.stringify(["blocks", bi, "img"])); }
    }

    $$(":scope > .sub", sec).forEach(function (sub, si) {
      annotateSub(sub, ["blocks", bi, "subs", si], bi, si);
    });
  });
}

function annotateSub(sub, P, bi, si) {
  sub.setAttribute("data-crm-sub", si);
  sub.setAttribute("data-crm-b", bi);
  sub.setAttribute("data-crm-p", JSON.stringify(P));

  [].slice.call(sub.children).forEach(function (el) {
    var cl = el.classList;
    if (cl.contains("sub-title")) markText(el, P.concat("ti"), { line: 1 });
    else if (cl.contains("sub-note")) markText(el, P.concat("note"));
    else if (cl.contains("caption")) markText(el, P.concat("caption"));
    else if (cl.contains("points")) {
      $$(":scope > li", el).forEach(function (li, k) {
        markText(li, P.concat("cards", k), { kind: "point", ph: "Пункт" });
        markItem(li, P.concat("cards"), k, "card");
      });
    } else if (cl.contains("cols")) {
      var first = el.querySelector(".card");
      var metric = first && (first.classList.contains("metric") || first.classList.contains("metric-big"));
      $$(":scope > .card", el).forEach(function (c, k) {
        if (metric) {
          markItem(c, P.concat("results"), k, "result");
          markText(c.querySelector(".num-from"), P.concat("results", k, "from"), { line: 1 });
          markText(c.querySelector(".num-to"), P.concat("results", k, "n"), { line: 1 });
          markText(c.querySelector(".num-suf"), P.concat("results", k, "suf"), { line: 1 });
          if (!c.querySelector(".num-to")) markText(c.querySelector(".num"), P.concat("results", k, "n"), { line: 1 });
          markText(c.querySelector(".lbl"), P.concat("results", k, "l"), { line: 1 });
          markText(c.querySelector(".desc"), P.concat("results", k, "d"), { line: 1 });
        } else {
          markItem(c, P.concat("cards"), k, "card");
          markText(c.querySelector("h3"), P.concat("cards", k, "h"), { line: 1 });
          markText(c.querySelector("p"), P.concat("cards", k, "p"));
        }
      });
    } else if (cl.contains("figs")) {
      $$(":scope > .fig", el).forEach(function (f, k) {
        f.setAttribute("data-crm-img", "sub");
        f.setAttribute("data-crm-p", JSON.stringify(P.concat("imgs", k)));
        markItem(f, P.concat("imgs"), k, "img");
        markText(f.querySelector("figcaption"), P.concat("imgs", k, "cap"), { line: 1 });
      });
    } else if (cl.contains("steps")) {
      $$(":scope > .step", el).forEach(function (st, k) {
        markItem(st, P.concat("steps"), k, "step");
        markText(st.querySelector(".step-text"), P.concat("steps", k, "p"));
        var f = st.querySelector(".fig");
        if (f) { f.setAttribute("data-crm-img", "step"); f.setAttribute("data-crm-p", JSON.stringify(P.concat("steps", k, "img"))); }
      });
    }
  });
}

/* ============================================================
   4. ЧТЕНИЕ ТЕКСТА ОБРАТНО В ДАННЫЕ
   В полях уже хранится HTML (<b>, <br>) — сохраняем так же,
   но чистим мусор редактирования и неразрывные пробелы,
   которые расставляет fixOrphans при рендере.
============================================================ */
var OK_TAGS = { B: 1, I: 1, U: 1, EM: 1, STRONG: 1, BR: 1, A: 1, SPAN: 1, SUP: 1, SUB: 1 };
/* эти теги выбрасываем вместе с содержимым, остальные лишние — разворачиваем */
var DROP_TAGS = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, LINK: 1, META: 1, NOSCRIPT: 1, TEMPLATE: 1, SVG: 1 };
var OK_STYLE = ["font-size", "text-align", "display", "font-weight", "font-style", "text-decoration"];
function safeHref(v) {
  var s = String(v || "").trim();
  return /^(https?:|mailto:|tel:|#|\/|[\w.-]+\.html)/i.test(s) ? s : "";
}

function unwrap(n) {
  var p = n.parentNode;
  while (n.firstChild) p.insertBefore(n.firstChild, n);
  p.removeChild(n);
}
function clean(html) {
  var d = document.createElement("div");
  d.innerHTML = html;
  (function walk(node) {
    [].slice.call(node.childNodes).forEach(function (c) {
      if (c.nodeType === 3) return;
      if (c.nodeType !== 1) { c.remove(); return; }
      if (DROP_TAGS[c.tagName]) { c.remove(); return; }
      walk(c);
      if (!OK_TAGS[c.tagName]) { unwrap(c); return; }
      if (c.tagName === "A") {
        var href = safeHref(c.getAttribute("href"));
        if (!href) { unwrap(c); return; }
        c.setAttribute("href", href);
      }
      var keepStyle = "";
      if (c.hasAttribute("style")) {
        OK_STYLE.forEach(function (p) {
          var v = c.style.getPropertyValue(p);
          if (v) keepStyle += p + ":" + v + ";";
        });
      }
      [].slice.call(c.attributes).forEach(function (a) {
        if (c.tagName === "A" && (a.name === "href" || a.name === "target" || a.name === "rel")) return;
        c.removeAttribute(a.name);
      });
      if (keepStyle) c.setAttribute("style", keepStyle);
      if (c.tagName === "SPAN" && !keepStyle) unwrap(c);
    });
  })(d);
  return d.innerHTML
    .replace(/\u00A0/g, " ").replace(/&nbsp;/g, " ")
    .replace(/^(\s|<br\s*\/?>)+|(\s|<br\s*\/?>)+$/g, "")
    .trim();
}

/* пункт списка хранится парой {h,p} — «жирный зачин — текст» */
function readPoint(html) {
  var m = html.match(/^<b>([\s\S]*?)<\/b>\s*(?:—|&mdash;)?\s*([\s\S]*)$/i);
  if (m) return { h: m[1].trim(), p: m[2].trim() };
  return { h: "", p: html };
}

function readEl(el) {
  var v = clean(el.innerHTML);
  var path = JSON.parse(el.getAttribute("data-crm-p"));
  if (el.getAttribute("data-crm-kind") === "point") {
    var c = get(path) || {};
    var np = readPoint(v);
    if (c.h === np.h && c.p === np.p) return false;
    set(path, Object.assign({}, c, np));
    return true;
  }
  if (get(path) === v) return false;
  set(path, v);
  return true;
}

/* ============================================================
   5. ВЫБОР ЭЛЕМЕНТА И КОНТЕКСТНАЯ ПАНЕЛЬ
============================================================ */
var sel = null;        /* {el, kind:"text"|"item"|"sub"|"block"|"img", path} */
var editing = null;    /* редактируемый contenteditable */
var pop, bar, insBtn, dropLine, viewport;

function pathOf(el) { var a = el && el.getAttribute("data-crm-p"); return a ? JSON.parse(a) : null; }
function findByPath(path) {
  return document.querySelector("[data-crm-p='" + JSON.stringify(path) + "']");
}

function kindOf(el) {
  if (el.hasAttribute("data-crm-t")) return "text";
  if (el.hasAttribute("data-crm-img")) return "img";
  if (el.hasAttribute("data-crm-item")) return "item";
  if (el.hasAttribute("data-crm-sub")) return "sub";
  if (el.hasAttribute("data-crm-block")) return "block";
  return null;
}

function clearSel() {
  commitEditing();
  $$("[data-crm-sel]").forEach(function (e) { e.removeAttribute("data-crm-sel"); });
  sel = null;
  hidePop(); hideHandles();
}

function select(el, opts) {
  if (!el) return;
  if (sel && sel.el === el && !(opts && opts.force)) { showPop(); return; }
  commitEditing();
  $$("[data-crm-sel]").forEach(function (e) { e.removeAttribute("data-crm-sel"); });
  el.setAttribute("data-crm-sel", "1");
  sel = { el: el, kind: kindOf(el), path: pathOf(el) };
  showPop();
  if (sel.kind === "img") showHandles(); else hideHandles();
}
function selectByPath(path) { var el = findByPath(path); if (el) select(el); else clearSel(); }

/* ---------- всплывающая панель ---------- */
function hidePop() { if (pop) pop.style.display = "none"; }
function placePop() {
  if (!pop || !sel || pop.style.display === "none") return;
  var r = sel.el.getBoundingClientRect();
  var w = pop.offsetWidth, h = pop.offsetHeight;
  var top = r.top - h - 10;
  if (top < barH() + 6) top = Math.min(r.bottom + 10, innerHeight - h - 8);
  var left = Math.min(Math.max(8, r.left), innerWidth - w - 8);
  pop.style.top = Math.round(top) + "px";
  pop.style.left = Math.round(left) + "px";
}
function barH() { return 52; }

function btn(label, act, opt) {
  opt = opt || {};
  return "<button data-a=\"" + act + "\"" +
    (opt.title ? " title=\"" + esc(opt.title) + "\"" : "") +
    (opt.on ? " aria-pressed=\"true\"" : "") +
    (opt.drag ? " draggable=\"true\" data-drag=\"1\"" : "") +
    ">" + label + "</button>";
}
var SEPV = "<i class=\"sepv\"></i>";

/* размеры — только те, что есть в шкале сайта */
var SIZES = [
  ["var(--eyebrow)", "Надзаголовок"], ["var(--small)", "Мелкий"], ["var(--text)", "Обычный"],
  ["var(--h3)", "Подзаголовок"], ["var(--h2)", "Заголовок кейса"], ["var(--h1)", "Заголовок раздела"]
];

function popHtml() {
  var k = sel.kind, h = "";
  if (k === "text") {
    h += btn("<b>B</b>", "b", { title: "Жирный" }) + btn("<i>I</i>", "i", { title: "Курсив" }) +
      btn("<u>U</u>", "u", { title: "Подчёркнутый" }) + btn("Ссылка", "link");
    h += SEPV + btn("Размер ▾", "size") + btn("Выравнивание ▾", "align");
    h += SEPV + btn("Убрать формат", "plain");
  } else if (k === "img") {
    h += btn("Заменить", "img-src") + btn("Медиатека", "img-lib") + btn("Подпись", "img-cap");
    h += SEPV + btn("−", "img-narrow", { title: "Уже" }) + btn("+", "img-wide", { title: "Шире" }) +
      btn("Сбросить размер", "img-auto");
    if (CAPS.figsFull) h += btn("Во всю ширину", "img-full", { on: isFull() });
    h += SEPV + btn("←", "it-up") + btn("→", "it-down") + btn("Удалить", "it-del");
  } else if (k === "item") {
    var type = sel.el.getAttribute("data-crm-item");
    h += btn("↑", "it-up") + btn("↓", "it-down") + btn("⧉", "it-dup", { title: "Дублировать" }) +
      btn("Удалить", "it-del");
    if (type === "card" || type === "result" || type === "duty") h += SEPV + btn("+ ещё", "it-add");
  } else if (k === "sub") {
    var s = get(sel.path) || {};
    h += btn("⠿", "drag", { title: "Перетащить", drag: 1 }) + btn("↑", "sub-up") + btn("↓", "sub-down") +
      btn("⧉", "sub-dup", { title: "Дублировать" }) + btn("Удалить", "sub-del");
    h += SEPV + btn("+ Содержимое ▾", "sub-add");
    if (CAPS.list && s.cards) h += btn(s.card ? "Показать списком" : "Показать карточками", "sub-card");
    if (s.cards && !s.card) h += btn("Маркеры", "sub-mark", { on: s.mark === "cross" });
    if (CAPS.list && s.cards && !s.card) h += btn("В строку", "sub-row", { on: !!s.row });
    if (CAPS.figsFull && s.imgs) h += btn("Во всю ширину", "sub-full", { on: !!s.full });
  } else if (k === "block") {
    var b = get(sel.path) || {};
    h += btn("⠿", "drag", { title: "Перетащить", drag: 1 }) + btn("↑", "blk-up") + btn("↓", "blk-down") +
      btn("⧉", "blk-dup", { title: "Дублировать" }) + btn("Удалить", "blk-del");
    h += SEPV + btn("+ Блок", "blk-addsub");
    if (!b.lead) h += btn("+ Лид", "blk-lead");
    h += btn(b.group ? "Это раздел" : "Это кейс", "blk-group", { on: !!b.group }) +
      btn("Якорь", "blk-anchor", { title: "Адрес блока: #" + (b.a || "") });
  }
  /* хлебные крошки — быстрый переход к родителю */
  var up = parentSel();
  if (up) h += SEPV + btn("↑ " + up.label, "up");
  return h;
}
function parentSel() {
  if (!sel) return null;
  var el = sel.el.parentElement;
  while (el && el !== document.body) {
    var k = kindOf(el);
    if (k) return { el: el, label: { item: "Пункт", sub: "Блок", block: "Секция", img: "Картинка", text: "Текст" }[k] };
    el = el.parentElement;
  }
  return null;
}
function showPop() {
  if (!sel || PREVIEW) return;
  pop.innerHTML = popHtml();
  pop.style.display = "flex";
  placePop();
}

/* ============================================================
   6. РЕДАКТИРОВАНИЕ ТЕКСТА НА МЕСТЕ
============================================================ */
function startEdit(el, ev) {
  if (editing === el) return;
  commitEditing();
  editing = el;
  el.setAttribute("contenteditable", "true");
  el.setAttribute("spellcheck", "false");
  editBase = snap();
  if (!ev) {
    var r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
    var s = getSelection(); s.removeAllRanges(); s.addRange(r);
  }
  el.focus();
}
var editBase = null;
function commitEditing() {
  if (!editing) return;
  var el = editing; editing = null;
  el.removeAttribute("contenteditable");
  var changed = false;
  try { changed = readEl(el); } catch (e) { }
  if (changed) {
    /* заголовок кейса меняет и подпись в боковом меню */
    HIST.base = editBase || HIST.base;
    HIST.commit();
    rerender(true);
  }
  editBase = null;
}

function applyStyle(css) {
  var s = getSelection();
  if (!editing) return;
  if (!s.rangeCount || s.isCollapsed || !editing.contains(s.anchorNode)) {
    /* без выделения — применяем ко всему полю */
    var sp = document.createElement("span");
    for (var k in css) sp.style[k] = css[k];
    while (editing.firstChild) sp.appendChild(editing.firstChild);
    editing.appendChild(sp);
  } else {
    var r = s.getRangeAt(0);
    var w = document.createElement("span");
    for (var k2 in css) w.style[k2] = css[k2];
    w.appendChild(r.extractContents());
    r.insertNode(w);
    s.removeAllRanges();
  }
  markDirty();
}
function markDirty() { try { readEl(editing); } catch (e) { } saveSoon(); }

function clearFormat() {
  if (!editing) return;
  editing.textContent = editing.textContent;
  markDirty();
}

/* ============================================================
   7. КАРТИНКИ: замена, медиатека, размер
============================================================ */
function imgData() {                       /* {src,cap,w} независимо от места */
  if (!sel || sel.kind !== "img") return null;
  var v = get(sel.path);
  return typeof v === "string" ? { src: v, plain: true } : (v || {});
}
function setImg(patch) {
  var v = get(sel.path);
  if (typeof v === "string") set(sel.path, patch.src != null ? patch.src : v);
  else set(sel.path, Object.assign({}, v || {}, patch));
  HIST.commit(); rerender(true);
}
function isFull() {
  var sub = sel && sel.el.closest("[data-crm-sub]");
  return sub ? !!(get(pathOf(sub)) || {}).full : false;
}
function curWidth() {
  var d = imgData() || {};
  if (d.w) return +d.w;
  var f = sel.el, row = f.parentElement;
  if (!row) return 100;
  var own = f.getBoundingClientRect().width, all = row.getBoundingClientRect().width;
  if (!all || !isFinite(own / all)) return 100;      /* размеры ещё неизвестны */
  return Math.round(own / all * 100);
}
function setWidth(w) {
  if (!isFinite(w)) return;
  w = Math.max(15, Math.min(100, Math.round(w)));
  setImg({ w: w });
}

var mediaCache = null;
function mediaList() {
  var out = [], seen = {};
  var add = function (s) { if (s && !seen[s]) { seen[s] = 1; out.push(s); } };
  Object.keys(H.IMG || {}).forEach(function (k) { add(H.IMG[k]); });
  LANGS().forEach(function (lg) {
    (H.T[lg].blocks || []).forEach(function (b) {
      add(b.img);
      (b.subs || []).forEach(function (s) {
        (s.imgs || []).forEach(function (im) { add(im.src); });
        (s.steps || []).forEach(function (st) { add(st.img); });
      });
    });
  });
  try { (JSON.parse(localStorage.getItem(MEDIA_LS) || "[]")).forEach(add); } catch (e) { }
  return out;
}
function rememberMedia(src) {
  try {
    var a = JSON.parse(localStorage.getItem(MEDIA_LS) || "[]");
    a = [src].concat(a.filter(function (x) { return x !== src; })).slice(0, 12);
    localStorage.setItem(MEDIA_LS, JSON.stringify(a));
  } catch (e) { }
}

var picker;
function pickFile(cb) {
  if (!picker) {
    picker = document.createElement("input");
    picker.type = "file"; picker.accept = "image/*"; picker.style.display = "none";
    document.body.appendChild(picker);
  }
  picker.onchange = function () {
    var f = picker.files[0]; picker.value = "";
    if (!f) return;
    var r = new FileReader();
    r.onload = function () { rememberMedia(r.result); cb(r.result); };
    r.readAsDataURL(f);
  };
  picker.click();
}

/* ============================================================
   8. МОДАЛЬНОЕ ОКНО (медиатека, выбор блока, справка)
============================================================ */
function sheet(title, html, onClick) {
  var wrap = document.createElement("div");
  wrap.className = "crm-modal";
  wrap.innerHTML = "<div class=\"crm-sheet\"><div class=\"crm-sheet-h\"><b>" + esc(title) +
    "</b><button data-a=\"close\">✕</button></div><div class=\"crm-sheet-b\">" + html + "</div></div>";
  document.body.appendChild(wrap);
  var close = function () { wrap.remove(); };
  wrap.addEventListener("click", function (e) {
    if (e.target === wrap || e.target.closest("[data-a=close]")) return close();
    if (onClick) onClick(e, close);
  });
  return { el: wrap, close: close };
}

function openMedia() {
  var list = mediaList();
  var html = "<div class=\"crm-media\">" + list.map(function (s) {
    return "<button class=\"crm-tile\" data-src=\"" + esc(s) + "\">" +
      "<img src=\"" + esc(s) + "\" alt=\"\" loading=\"lazy\">" +
      "<span>" + esc(s.slice(0, 5) === "data:" ? "загруженное" : s.replace(/^assets\//, "")) + "</span></button>";
  }).join("") + "</div>" +
    "<div class=\"crm-field\"><label>Путь в проекте или адрес картинки</label>" +
    "<input type=\"text\" data-src-input placeholder=\"assets/medsi-main.png\"></div>" +
    "<div class=\"crm-actions\"><button class=\"crm-primary\" data-a=\"upload\">Загрузить файл</button>" +
    "<button data-a=\"use\">Использовать адрес</button></div>" +
    "<p class=\"crm-hint\">Загруженный файл встраивается прямо в страницу. Для готового сайта лучше положить картинку в папку assets и указать путь.</p>";

  var m = sheet("Картинка", html, function (e, close) {
    var tile = e.target.closest(".crm-tile");
    if (tile) { setImg({ src: tile.getAttribute("data-src") }); return close(); }
    if (e.target.closest("[data-a=upload]")) { pickFile(function (src) { setImg({ src: src }); close(); }); return; }
    if (e.target.closest("[data-a=use]")) {
      var v = m.el.querySelector("[data-src-input]").value.trim();
      if (v) { setImg({ src: v }); close(); }
    }
  });
}

/* ============================================================
   9. ЗАГОТОВКИ БЛОКОВ — только из компонентов, которые уже есть
============================================================ */
function metric() { return CAPS.metricBig ? { from: "", n: "0", suf: "", l: "Подпись" } : { n: "0", l: "Подпись", d: "" }; }
var PRESETS = [
  { id: "text", ti: "Текст", hint: "Абзац", make: function () { return { note: "Текст" }; } },
  { id: "head", ti: "Заголовок и текст", hint: "Подзаголовок и абзац", make: function () { return { ti: "Подзаголовок", note: "Текст" }; } },
  {
    id: "points", ti: "Список пунктов", hint: "Маркированный список", need: "list",
    make: function () { return { ti: "", mark: "cross", cards: [{ h: "", p: "Пункт" }, { h: "", p: "Пункт" }] }; }
  },
  {
    id: "cards2", ti: "Две колонки", hint: "Карточки", make: function () {
      return { ti: "", card: true, cards: [{ h: "Заголовок", p: "Описание" }, { h: "Заголовок", p: "Описание" }] };
    }
  },
  {
    id: "cards3", ti: "Три колонки", hint: "Карточки", make: function () {
      return { ti: "", card: true, cards: [{ h: "Заголовок", p: "Описание" }, { h: "Заголовок", p: "Описание" }, { h: "Заголовок", p: "Описание" }] };
    }
  },
  { id: "metrics", ti: "Метрики", hint: "Крупные цифры", make: function () { return { ti: "", results: [metric(), metric()] }; } },
  { id: "image", ti: "Изображение", hint: "Одна картинка", make: function () { return { imgs: [{ src: "", cap: "" }] }; } },
  { id: "textimg", ti: "Текст и изображение", hint: "Абзац и картинка", make: function () { return { ti: "", note: "Текст", imgs: [{ src: "", cap: "" }] }; } },
  { id: "gallery", ti: "Галерея", hint: "Ряд картинок", make: function () { return { imgs: [{ src: "", cap: "" }, { src: "", cap: "" }, { src: "", cap: "" }] }; } },
  { id: "steps", ti: "Шаги", hint: "Текст и картинка на каждый шаг", need: "steps", make: function () { return { ti: "", steps: [{ p: "Шаг", img: "" }] }; } },
  { id: "sep", ti: "Разделитель", hint: "Полоса между частями", make: function () { return { sep: true }; } }
];
var BLOCK_PRESETS = [
  { id: "case", ti: "Кейс", hint: "Заголовок, лид и содержимое", make: function () { return { a: uid("case"), title: "Название кейса", lead: "", subs: [{ ti: "", note: "Текст" }] }; } },
  { id: "group", ti: "Раздел", hint: "Крупная рубрика с номером", make: function () { return { a: uid("sec"), group: true, title: "Название раздела", lead: "", subs: [] }; } }
];

function presetSheet(title, list, cb) {
  var html = "<div class=\"crm-grid\">" + list.filter(function (p) {
    return !p.need || CAPS[p.need];
  }).map(function (p) {
    return "<button class=\"crm-opt\" data-id=\"" + p.id + "\"><b>" + esc(p.ti) + "</b><span>" + esc(p.hint) + "</span></button>";
  }).join("") + "</div>";
  sheet(title, html, function (e, close) {
    var o = e.target.closest(".crm-opt"); if (!o) return;
    var p = list.filter(function (x) { return x.id === o.getAttribute("data-id"); })[0];
    close(); cb(p);
  });
}

/* ============================================================
   10. ВСТАВКА: «+» между блоками
============================================================ */
var insTarget = null;
function updateIns(x, y) {
  if (PREVIEW || draggingNow) return;
  var root = content(); if (!root) return;
  var el = document.elementFromPoint(x, y);
  if (!el) return hideIns();
  if (el.closest(".crm-ins")) return;                       /* курсор на самой кнопке */
  if (!root.contains(el) || el.closest(".crm-pop, .crm-bar")) return hideIns();

  var sub = el.closest("[data-crm-sub]");
  var blk = el.closest("[data-crm-block]");
  var target = sub || blk;
  if (!target) return hideIns();

  var r = target.getBoundingClientRect();
  var edge = (y - r.top < r.height / 2) ? "before" : "after";
  var near = edge === "before" ? Math.abs(y - r.top) : Math.abs(y - r.bottom);
  if (near > 90) return hideIns();

  if (sub) {
    var bi = +sub.getAttribute("data-crm-b"), si = +sub.getAttribute("data-crm-sub");
    insTarget = { kind: "sub", b: bi, at: edge === "before" ? si : si + 1 };
  } else {
    var bj = +blk.getAttribute("data-crm-block");
    insTarget = { kind: "block", at: edge === "before" ? bj : bj + 1 };
  }
  insBtn.style.display = "flex";
  insBtn.style.top = Math.round(edge === "before" ? r.top : r.bottom) + "px";
  insBtn.style.left = Math.round(r.left) + "px";
  insBtn.style.width = Math.round(r.width) + "px";
  insBtn.querySelector("button").textContent =
    insTarget.kind === "sub" ? "+ Добавить блок" : "+ Добавить секцию";
}
function hideIns() { if (insBtn) insBtn.style.display = "none"; insTarget = null; }

function doInsert() {
  var t = insTarget; if (!t) return;
  if (t.kind === "sub") {
    presetSheet("Что добавить", PRESETS, function (p) {
      itemInsert(["blocks", t.b, "subs"], t.at, p.make);
      HIST.commit(); rerender();
      selectByPath(["blocks", t.b, "subs", t.at]);
    });
  } else {
    presetSheet("Что добавить", BLOCK_PRESETS, function (p) {
      itemInsert(["blocks"], t.at, p.make);
      HIST.commit(); rerender();
      selectByPath(["blocks", t.at]);
    });
  }
}

/* ============================================================
   11. ПЕРЕТАСКИВАНИЕ БЛОКОВ И СЕКЦИЙ
============================================================ */
var dragState = null, draggingNow = false;

function onDragStart(e) {
  if (!sel) return;
  dragState = { kind: sel.kind, path: sel.path };
  draggingNow = true;
  hideIns(); hidePop(); hideHandles();
  try {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "crm");
  } catch (err) { }
}
function dropCandidates() {
  if (!dragState) return [];
  if (dragState.kind === "block") {
    return $$("[data-crm-block]").map(function (el) {
      return { el: el, at: +el.getAttribute("data-crm-block") };
    });
  }
  var out = [];
  $$("[data-crm-sub]").forEach(function (el) {
    out.push({ el: el, b: +el.getAttribute("data-crm-b"), at: +el.getAttribute("data-crm-sub") });
  });
  /* пустая секция тоже цель */
  $$("[data-crm-block]").forEach(function (el) {
    if (!el.querySelector("[data-crm-sub]")) out.push({ el: el, b: +el.getAttribute("data-crm-block"), at: 0, empty: true });
  });
  return out;
}
function findDrop(y) {
  var best = null, bestD = 1e9;
  dropCandidates().forEach(function (c) {
    var r = c.el.getBoundingClientRect();
    [["before", r.top], ["after", r.bottom]].forEach(function (p) {
      var d = Math.abs(y - p[1]);
      if (d < bestD) {
        bestD = d;
        best = { c: c, y: p[1], at: c.empty ? 0 : (p[0] === "before" ? c.at : c.at + 1), b: c.b, el: c.el };
      }
    });
  });
  return best;
}
function showDropLine(t) {
  if (!t) return dropLine.style.display = "none";
  var r = t.el.getBoundingClientRect();
  dropLine.style.display = "block";
  dropLine.style.top = Math.round(t.y) + "px";
  dropLine.style.left = Math.round(r.left) + "px";
  dropLine.style.width = Math.round(r.width) + "px";
}
function applyDrop(t) {
  if (!t || !dragState) return;
  if (dragState.kind === "block") {
    var from = dragState.path[1], to = t.at;
    if (to > from) to--;
    if (to === from) return;
    itemMove(["blocks"], from, to);
    HIST.commit(); rerender();
    selectByPath(["blocks", to]);
  } else {
    var fb = dragState.path[1], fi = dragState.path[3], tb = t.b, ti = t.at;
    if (fb === tb) {
      var to2 = ti > fi ? ti - 1 : ti;
      if (to2 === fi) return;
      itemMove(["blocks", fb, "subs"], fi, to2);
      HIST.commit(); rerender();
      selectByPath(["blocks", fb, "subs", to2]);
    } else {
      subMove(fb, fi, tb, ti);
      HIST.commit(); rerender();
      selectByPath(["blocks", tb, "subs", ti]);
    }
  }
}

/* ============================================================
   12. РУЧКИ ИЗМЕНЕНИЯ ШИРИНЫ КАРТИНКИ
============================================================ */
var handles = [];
function hideHandles() { handles.forEach(function (h) { h.style.display = "none"; }); }
function showHandles() {
  if (!sel || sel.kind !== "img" || PREVIEW) return hideHandles();
  var r = sel.el.getBoundingClientRect();
  handles.forEach(function (h, i) {
    h.style.display = "block";
    h.style.top = Math.round(r.top + r.height / 2 - 22) + "px";
    h.style.left = Math.round(i === 0 ? r.left - 5 : r.right - 5) + "px";
  });
}
function startResize(e, side) {
  e.preventDefault();
  var f = sel.el, row = f.parentElement;
  var rowW = row.getBoundingClientRect().width;
  if (!rowW) return;
  var startX = e.clientX, startW = f.getBoundingClientRect().width;
  var live = startW;
  var move = function (ev) {
    var dx = (ev.clientX - startX) * (side === 1 ? 1 : -1);
    live = Math.max(rowW * 0.15, Math.min(rowW, startW + dx));
    f.style.flex = "0 0 " + (live / rowW * 100) + "%";
    f.style.maxWidth = (live / rowW * 100) + "%";
    showHandles();
  };
  var up = function () {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
    setWidth(live / rowW * 100);
  };
  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
}

/* ============================================================
   13. ВЫГРУЗКА ГОТОВОГО ФАЙЛА
============================================================ */
var ORIGINAL = null;
function grabOriginal() {
  try {
    var c = content(), n = document.getElementById("projects");
    var ch = c ? c.innerHTML : "", nh = n ? n.innerHTML : "";
    if (c) c.innerHTML = ""; if (n) n.innerHTML = "";
    ORIGINAL = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
    if (c) c.innerHTML = ch; if (n) n.innerHTML = nh;
  } catch (e) {
    ORIGINAL = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
  }
}
function ser(o) { return JSON.stringify(o, null, 2).replace(/<\//g, "<\\/"); }
function exportFile() {
  try {
    var html = ORIGINAL;
    html = html.replace(/\/\*CRM_IMG_S\*\/[\s\S]*?\/\*CRM_IMG_E\*\//, "/*CRM_IMG_S*/const IMG = " + ser(H.IMG) + ";/*CRM_IMG_E*/");
    html = html.replace(/\/\*CRM_T_S\*\/[\s\S]*?\/\*CRM_T_E\*\//, "/*CRM_T_S*/const T = " + ser(H.T) + ";/*CRM_T_E*/");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = "case-" + H.id + ".html";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  } catch (e) { alert("Файл не собрался: " + e.message); }
}

/* ============================================================
   14. ВЕРХНЯЯ ПАНЕЛЬ
============================================================ */
function setSaveState(s) { saveState = s; var el = $(".crm-state"); if (el) el.textContent = s; }
function paintBar() {
  var u = $("[data-a=undo]"), r = $("[data-a=redo]");
  if (u) u.disabled = !HIST.undo.length;
  if (r) r.disabled = !HIST.redo.length;
}
var device = "desktop";
var DEV = { desktop: 0, tablet: 834, mobile: 390 };

function setDevice(d) {
  device = d;
  $$(".crm-dev button").forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.getAttribute("data-d") === d));
  });
  if (d === "desktop") {
    if (viewport) { viewport.remove(); viewport = null; }
    document.documentElement.classList.remove("crm-viewing");
    return;
  }
  clearSel(); save();
  document.documentElement.classList.add("crm-viewing");
  if (!viewport) {
    viewport = document.createElement("div");
    viewport.className = "crm-view";
    viewport.innerHTML = "<iframe title=\"Просмотр\"></iframe>";
    document.body.appendChild(viewport);
  }
  var f = viewport.querySelector("iframe");
  f.style.width = DEV[d] + "px";
  f.src = location.pathname + "?crm=preview&t=" + Date.now();
}

function buildBar() {
  bar = document.createElement("div");
  bar.className = "crm-bar";
  bar.innerHTML =
    "<b>Редактор</b><span class=\"chip crm-page\">" + esc(document.title.split("—").pop().trim()) + "</span>" +
    "<div class=\"segmented crm-dev\">" +
    "<button data-d=\"desktop\" aria-pressed=\"true\">Десктоп</button>" +
    "<button data-d=\"tablet\">Планшет</button>" +
    "<button data-d=\"mobile\">Телефон</button></div>" +
    "<span class=\"sp\"></span>" +
    "<div class=\"segmented\"><button data-a=\"undo\" title=\"Отменить (Ctrl+Z)\">↶</button>" +
    "<button data-a=\"redo\" title=\"Вернуть (Ctrl+Shift+Z)\">↷</button></div>" +
    "<span class=\"crm-state\"></span>" +
    "<button class=\"crm-primary\" data-a=\"export\">Экспорт HTML</button>" +
    "<button data-a=\"help\">?</button>" +
    "<button data-a=\"reset\">Сброс</button>" +
    "<a class=\"crm-exit\" href=\"" + location.pathname + "\">Выйти</a>";
  document.body.appendChild(bar);

  bar.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var d = b.getAttribute("data-d");
    if (d) return setDevice(d);
    var a = b.getAttribute("data-a");
    if (a === "undo") HIST.back();
    else if (a === "redo") HIST.fwd();
    else if (a === "export") { commitEditing(); exportFile(); }
    else if (a === "help") openHelp();
    else if (a === "reset") {
      if (confirm("Вернуть страницу к последней выгруженной версии? Черновик в браузере будет удалён.")) {
        try { localStorage.removeItem(LS); } catch (err) { }
        location.reload();
      }
    }
  });
  paintBar(); setSaveState("Черновик в браузере");
}

function openHelp() {
  sheet("Как это работает", "<div class=\"crm-help\">" +
    "<p>Страница перед вами — это и есть сайт. Всё, что видно, правится прямо здесь.</p>" +
    "<ul>" +
    "<li><b>Текст</b> — щёлкните и пишите. Панель сверху над текстом даёт жирный, курсив, ссылку, размер и выравнивание. Размеры взяты из шкалы сайта.</li>" +
    "<li><b>Картинка</b> — щёлкните, затем «Заменить» или «Медиатека». Ширину тяните за боковые ручки.</li>" +
    "<li><b>Новый блок</b> — подведите курсор к границе между блоками и нажмите «+».</li>" +
    "<li><b>Перенос</b> — выберите блок и тяните его за ⠿.</li>" +
    "<li><b>Языки</b> — переключатель RU/EN в боковом меню. Текст правится для текущего языка, структура — сразу для обоих.</li>" +
    "<li><b>Отмена</b> — Ctrl+Z, возврат — Ctrl+Shift+Z.</li>" +
    "<li><b>Сохранение</b> — правки живут в браузере. «Экспорт HTML» собирает готовый файл страницы: положите его в проект вместо текущего.</li>" +
    "</ul></div>", null);
}

/* ============================================================
   15. СТИЛИ РЕДАКТОРА (только токены сайта)
============================================================ */
var CSS = "" +
"html.crm-on{--crm-bar:52px}" +
"html.crm-on body{padding-top:var(--crm-bar)}" +
"html.crm-on .sidebar{top:var(--crm-bar);height:calc(100vh - var(--crm-bar))}" +
"html.crm-on .topbar{top:var(--crm-bar)}" +
"html.crm-on .duties{max-height:none}" +
"html.crm-on .duties::after{display:none}" +
"html.crm-on .duties-more{display:none}" +
"html.crm-viewing .shell{display:none}" +

".crm-bar{position:fixed;top:0;left:0;right:0;height:52px;z-index:9000;display:flex;align-items:center;gap:10px;" +
"padding:0 var(--pad);background:var(--surface);border-bottom:1px solid var(--line);" +
"font-family:var(--sans);font-size:var(--small);color:var(--ink)}" +
".crm-bar .sp{margin-left:auto}" +
".crm-bar .crm-page{padding:4px 11px;font-size:var(--eyebrow)}" +
".crm-bar .crm-state{color:var(--faint);font-size:var(--eyebrow)}" +
".crm-bar button{padding:6px 11px;border-radius:7px;font:inherit;font-size:var(--eyebrow);font-weight:500;" +
"color:var(--muted);background:none;border:none;cursor:pointer;white-space:nowrap}" +
".crm-bar .segmented button{border-radius:7px}" +
".crm-bar .segmented button[aria-pressed=true]{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(20,20,25,.06)}" +
".crm-bar button:hover{color:var(--ink)}" +
".crm-bar button:disabled{opacity:.35;cursor:default}" +
".crm-bar .crm-primary{background:var(--accent);color:var(--surface)}" +
".crm-bar .crm-primary:hover{color:var(--surface);opacity:.9}" +
".crm-bar .crm-exit{color:var(--accent);font-size:var(--eyebrow);font-weight:500}" +
"@media (max-width:900px){.crm-bar{gap:6px;overflow-x:auto}" +
".crm-bar .crm-page,.crm-bar .crm-state{display:none}}" +

/* наведение и выбор — только в редакторе */
".crm-on [data-crm-t]:hover,.crm-on [data-crm-img]:hover,.crm-on [data-crm-sub]:hover{" +
"outline:1px dashed color-mix(in srgb,var(--accent) 40%,transparent);outline-offset:4px;border-radius:3px}" +
".crm-on [data-crm-sel]{outline:2px solid var(--accent)!important;outline-offset:4px;border-radius:3px}" +
".crm-on [data-crm-t]{cursor:text}" +
".crm-on [data-crm-t]:focus{outline:2px solid var(--accent);outline-offset:4px}" +
".crm-on [data-crm-t]:empty::before{content:attr(data-crm-ph);color:var(--faint)}" +
".crm-on [data-crm-img]{cursor:pointer}" +
".crm-on .fig figcaption{display:block;color:var(--muted);font-size:var(--small);margin-top:8px}" +
".crm-on .fig-btn{cursor:pointer}" +
".crm-on .shot{cursor:default}" +

/* контекстная панель */
".crm-pop{position:fixed;z-index:9100;display:none;align-items:center;gap:2px;padding:4px;" +
"background:var(--surface);border:1px solid var(--line);border-radius:10px;" +
"box-shadow:0 1px 2px rgba(20,20,25,.06),0 12px 34px rgba(20,20,25,.12);font-family:var(--sans)}" +
".crm-pop button{padding:6px 10px;border-radius:7px;font:inherit;font-size:var(--eyebrow);font-weight:500;" +
"color:var(--muted);background:none;border:none;cursor:pointer;white-space:nowrap}" +
".crm-pop button:hover{background:var(--sel);color:var(--ink)}" +
".crm-pop button[aria-pressed=true]{background:var(--sel);color:var(--ink)}" +
".crm-pop .sepv{width:1px;height:18px;background:var(--line);margin:0 4px;display:inline-block}" +

/* «+» между блоками */
".crm-ins{position:fixed;z-index:9050;display:none;align-items:center;justify-content:center;height:0;pointer-events:none}" +
".crm-ins::before{content:'';position:absolute;left:0;right:0;height:1px;background:var(--accent);opacity:.35}" +
".crm-ins button{pointer-events:auto;position:relative;padding:5px 12px;border-radius:20px;border:1px solid var(--line);" +
"background:var(--surface);color:var(--accent);font:inherit;font-family:var(--sans);font-size:var(--eyebrow);" +
"font-weight:600;cursor:pointer;box-shadow:0 1px 2px rgba(20,20,25,.06)}" +
".crm-drop{position:fixed;z-index:9080;display:none;height:2px;background:var(--accent);border-radius:2px;pointer-events:none}" +
".crm-on .fig img:not([src]),.crm-on .fig img[src='']{width:100%;min-height:180px;background:var(--panel);" +
"border:1px dashed var(--line);border-radius:14px}" +
".crm-handle{position:fixed;z-index:9060;display:none;width:10px;height:44px;border-radius:7px;" +
"background:var(--surface);border:1px solid var(--accent);cursor:ew-resize}" +

/* модальные окна */
".crm-modal{position:fixed;inset:0;z-index:9200;background:rgba(19,19,22,.5);display:flex;" +
"align-items:center;justify-content:center;padding:24px;font-family:var(--sans)}" +
".crm-sheet{background:var(--surface);border:1px solid var(--line);border-radius:14px;width:min(720px,100%);" +
"max-height:82vh;display:flex;flex-direction:column;color:var(--ink)}" +
".crm-sheet-h{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;" +
"border-bottom:1px solid var(--line);font-size:var(--h3)}" +
".crm-sheet-h button{background:none;border:none;font:inherit;color:var(--muted);cursor:pointer}" +
".crm-sheet-b{padding:20px;overflow:auto;font-size:var(--text)}" +
".crm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}" +
".crm-opt{text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:14px;" +
"padding:14px 16px;cursor:pointer;display:flex;flex-direction:column;gap:4px;font:inherit}" +
".crm-opt:hover{border-color:var(--accent)}" +
".crm-opt b{font-size:var(--h3);font-weight:600}" +
".crm-opt span{color:var(--muted);font-size:var(--small)}" +
".crm-media{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-bottom:20px}" +
".crm-tile{border:1px solid var(--line);border-radius:14px;padding:8px;background:var(--surface);cursor:pointer;" +
"display:flex;flex-direction:column;gap:8px;font:inherit}" +
".crm-tile:hover{border-color:var(--accent)}" +
".crm-tile img{width:100%;height:88px;object-fit:contain;background:var(--panel);border-radius:7px}" +
".crm-tile span{font-size:var(--eyebrow);color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
".crm-field label{display:block;font-size:var(--eyebrow);color:var(--faint);margin-bottom:6px}" +
".crm-field input{width:100%;border:1px solid var(--line);border-radius:7px;padding:9px 11px;" +
"font:inherit;font-size:var(--text);color:var(--ink);background:var(--surface)}" +
".crm-field input:focus{outline:none;border-color:var(--accent)}" +
".crm-actions{display:flex;gap:8px;margin-top:14px}" +
".crm-actions button{padding:8px 14px;border-radius:7px;border:1px solid var(--line);background:var(--surface);" +
"font:inherit;font-size:var(--small);color:var(--ink);cursor:pointer}" +
".crm-actions .crm-primary{background:var(--accent);color:var(--surface);border-color:transparent}" +
".crm-hint{color:var(--faint);font-size:var(--small);margin-top:14px;line-height:1.45}" +
".crm-help p{margin-bottom:12px}" +
".crm-help ul{list-style:none;display:flex;flex-direction:column;gap:11px}" +
".crm-help li{position:relative;padding-left:20px;font-size:var(--text)}" +
".crm-help li::before{content:'✦';position:absolute;left:0;top:0;color:var(--accent);font-size:.85rem}" +

/* просмотр в размере устройства */
".crm-view{position:fixed;top:52px;left:0;right:0;bottom:0;z-index:8900;background:var(--panel);" +
"display:flex;justify-content:center;padding:24px;overflow:auto}" +
".crm-view iframe{height:100%;border:1px solid var(--line);border-radius:14px;background:var(--bg);" +
"box-shadow:0 1px 2px rgba(20,20,25,.06)}";

/* ============================================================
   16. СБОРКА И СОБЫТИЯ
============================================================ */
function rerender(keep) {
  var p = keep && sel ? sel.path : null;
  var y = scrollY;
  H.render();
  scrollTo(0, y);
  if (p) selectByPath(p);
  else { sel = null; hidePop(); hideHandles(); }
}

function actOn(a) {
  if (!sel) return;
  var kind = sel.kind;

  /* текст */
  if (a === "b") return document.execCommand("bold"), markDirty();
  if (a === "i") return document.execCommand("italic"), markDirty();
  if (a === "u") return document.execCommand("underline"), markDirty();
  if (a === "plain") return clearFormat();
  if (a === "link") {
    var url = prompt("Адрес ссылки", "https://");
    if (url) { document.execCommand("createLink", false, url); markDirty(); }
    return;
  }
  if (a === "size") {
    return menu(SIZES.map(function (s) { return { id: s[0], ti: s[1] }; }), function (o) {
      applyStyle({ fontSize: o.id });
    });
  }
  if (a === "align") {
    return menu([{ id: "left", ti: "По левому краю" }, { id: "center", ti: "По центру" }, { id: "right", ti: "По правому краю" }],
      function (o) { applyStyle({ display: "block", textAlign: o.id }); });
  }

  /* картинки */
  if (a === "img-src") return pickFile(function (src) { setImg({ src: src }); });
  if (a === "img-lib") return openMedia();
  if (a === "img-cap") {
    var cap = sel.el.querySelector("figcaption");
    if (cap) return startEdit(cap);
    var d = imgData() || {};
    var v = prompt("Подпись к картинке", d.cap || "");
    if (v != null) setImg({ cap: v });
    return;
  }
  if (a === "img-wide") return setWidth(curWidth() + 10);
  if (a === "img-narrow") return setWidth(curWidth() - 10);
  if (a === "img-auto") { var v2 = get(sel.path); if (v2 && typeof v2 === "object") { delete v2.w; HIST.commit(); rerender(true); } return; }
  if (a === "img-full") {
    var sub = sel.el.closest("[data-crm-sub]");
    if (sub) { var sp = pathOf(sub); var s = get(sp); s.full = !s.full; HIST.commit(); rerender(true); }
    return;
  }

  /* элементы списков */
  if (a.slice(0, 3) === "it-") {
    var host = sel.kind === "item" ? sel.el : sel.el.closest("[data-crm-item]");
    if (!host) return;
    var arr = JSON.parse(host.getAttribute("data-crm-arr")), i = +host.getAttribute("data-crm-i");
    if (a === "it-up") itemMove(arr, i, i - 1);
    else if (a === "it-down") itemMove(arr, i, i + 1);
    else if (a === "it-dup") itemDup(arr, i);
    else if (a === "it-del") itemRemove(arr, i);
    else if (a === "it-add") itemInsert(arr, i + 1, function () { return clone(blank(host.getAttribute("data-crm-item"))); });
    HIST.commit(); rerender();
    var last = arr[arr.length - 1];
    var ni = a === "it-up" ? Math.max(0, i - 1) : (a === "it-del" ? -1 : (a === "it-down" ? i + 1 : i + 1));
    if (ni >= 0) selectByPath(arr.concat(ni));
    return;
  }

  /* подблок */
  if (a.slice(0, 4) === "sub-") {
    var P = sel.kind === "sub" ? sel.path : pathOf(sel.el.closest("[data-crm-sub]"));
    if (!P) return;
    var arrP = P.slice(0, -1), idx = P[P.length - 1];
    if (a === "sub-up") { itemMove(arrP, idx, idx - 1); HIST.commit(); rerender(); return selectByPath(arrP.concat(Math.max(0, idx - 1))); }
    if (a === "sub-down") { itemMove(arrP, idx, idx + 1); HIST.commit(); rerender(); return selectByPath(arrP.concat(idx + 1)); }
    if (a === "sub-dup") { itemDup(arrP, idx); HIST.commit(); rerender(); return selectByPath(arrP.concat(idx + 1)); }
    if (a === "sub-del") {
      if (!confirm("Удалить этот блок?")) return;
      itemRemove(arrP, idx); HIST.commit(); rerender(); return clearSel();
    }
    var s2 = get(P);
    if (a === "sub-card") { s2.card = !s2.card; HIST.commit(); return rerender(true); }
    if (a === "sub-mark") { if (s2.mark === "cross") delete s2.mark; else s2.mark = "cross"; HIST.commit(); return rerender(true); }
    if (a === "sub-row") { if (s2.row) delete s2.row; else s2.row = true; HIST.commit(); return rerender(true); }
    if (a === "sub-full") { s2.full = !s2.full; HIST.commit(); return rerender(true); }
    if (a === "sub-add") {
      return menu([
        { id: "card", ti: "Пункт списка" }, { id: "result", ti: "Метрика" },
        { id: "img", ti: "Картинка" }, { id: "note", ti: "Абзац текста" }, { id: "ti", ti: "Подзаголовок" }
      ], function (o) {
        if (o.id === "note" || o.id === "ti") { if (!s2[o.id]) s2[o.id] = o.id === "ti" ? "Подзаголовок" : "Текст"; }
        else {
          var key = { card: "cards", result: "results", img: "imgs" }[o.id];
          ensureArr(P.concat(key));
          itemInsert(P.concat(key), (get(P.concat(key)) || []).length, function () { return blank(o.id); });
        }
        HIST.commit(); rerender(true);
      });
    }
  }

  /* секция */
  if (a.slice(0, 4) === "blk-") {
    var BP = sel.kind === "block" ? sel.path : pathOf(sel.el.closest("[data-crm-block]"));
    if (!BP) return;
    var bi = BP[1];
    if (a === "blk-up") { itemMove(["blocks"], bi, bi - 1); HIST.commit(); rerender(); return selectByPath(["blocks", Math.max(0, bi - 1)]); }
    if (a === "blk-down") { itemMove(["blocks"], bi, bi + 1); HIST.commit(); rerender(); return selectByPath(["blocks", bi + 1]); }
    if (a === "blk-dup") {
      itemDup(["blocks"], bi);
      /* якорь у копии новый, но один и тот же во всех языках —
         иначе ссылки бокового меню разъедутся при переключении RU/EN */
      var anchor = uid("case");
      LANGS().forEach(function (lg) { var b = get(["blocks", bi + 1], lg); if (b) b.a = anchor; });
      HIST.commit(); rerender(); return selectByPath(["blocks", bi + 1]);
    }
    if (a === "blk-del") {
      if (!confirm("Удалить секцию целиком?")) return;
      itemRemove(["blocks"], bi); HIST.commit(); rerender(); return clearSel();
    }
    if (a === "blk-group") {
      LANGS().forEach(function (lg) { var b = get(["blocks", bi], lg); if (b) b.group = !get(["blocks", bi]).group; });
      HIST.commit(); return rerender(true);
    }
    if (a === "blk-addsub") {
      return presetSheet("Что добавить", PRESETS, function (p) {
        var arr = ensureArr(["blocks", bi, "subs"]);
        itemInsert(["blocks", bi, "subs"], arr.length, p.make);
        HIST.commit(); rerender(); selectByPath(["blocks", bi, "subs", arr.length - 1]);
      });
    }
    if (a === "blk-lead") {
      set(["blocks", bi, "lead"], "Описание");
      HIST.commit(); rerender();
      return selectByPath(["blocks", bi, "lead"]);
    }
    if (a === "blk-anchor") {
      var b2 = get(["blocks", bi]);
      var v3 = prompt("Адрес блока для ссылок в меню (#якорь)", b2.a || "");
      if (v3) { LANGS().forEach(function (lg) { var x = get(["blocks", bi], lg); if (x) x.a = v3; }); HIST.commit(); rerender(true); }
      return;
    }
  }

  if (a === "up") { var up = parentSel(); if (up) select(up.el); }
}

function blank(type) {
  if (type === "card") return { h: "", p: "Пункт" };
  if (type === "result") return metric();
  if (type === "img") return { src: "", cap: "" };
  if (type === "step") return { p: "Шаг", img: "" };
  if (type === "duty") return "Текст";
  if (type === "ach") return { n: "", l: "Результат", d: "" };
  if (type === "tag") return "тег";
  if (type === "goal") return "цель";
  if (type === "meta") return ["Заголовок", "значение"];
  return { p: "Текст" };
}

/* маленькое выпадающее меню под панелью */
function menu(items, cb) {
  var m = document.createElement("div");
  m.className = "crm-pop";
  m.style.display = "flex";
  m.style.flexDirection = "column";
  m.style.alignItems = "stretch";
  m.innerHTML = items.map(function (o) {
    return "<button data-id=\"" + esc(o.id) + "\" style=\"text-align:left\">" + esc(o.ti) + "</button>";
  }).join("");
  document.body.appendChild(m);
  var r = pop.getBoundingClientRect();
  m.style.top = Math.round(Math.min(r.bottom + 6, innerHeight - m.offsetHeight - 8)) + "px";
  m.style.left = Math.round(Math.min(r.left, innerWidth - m.offsetWidth - 8)) + "px";
  var off = function (e) {
    if (m.contains(e.target)) {
      var b = e.target.closest("button");
      if (b) cb(items.filter(function (x) { return String(x.id) === b.getAttribute("data-id"); })[0]);
    }
    m.remove();
    document.removeEventListener("mousedown", off, true);
  };
  setTimeout(function () { document.addEventListener("mousedown", off, true); }, 0);
}

/* ---------- события страницы ---------- */
function wire() {
  /* в редакторе ссылки и лайтбокс не срабатывают */
  document.addEventListener("click", function (e) {
    if (PREVIEW) return;
    var inContent = content() && content().contains(e.target);
    if (!inContent) return;
    var a = e.target.closest("a");
    if (a) { e.preventDefault(); }
    if (e.target.closest(".fig-btn")) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  document.addEventListener("mousedown", function (e) {
    if (PREVIEW) return;
    if (e.target.closest(".crm-pop, .crm-bar, .crm-modal, .crm-ins, .crm-handle")) return;
    /* щелчок внутри того же поля — просто ставим курсор */
    if (editing && editing.contains(e.target)) return;

    var root = content();
    if (!root || !root.contains(e.target)) { clearSel(); return; }
    var t = e.target.closest("[data-crm-t]");
    var el = t || e.target.closest("[data-crm-img]") || e.target.closest("[data-crm-item]") ||
      e.target.closest("[data-crm-sub]") || e.target.closest("[data-crm-block]");
    if (!el) { clearSel(); return; }

    /* завершение прошлой правки перерисовывает страницу,
       поэтому элемент ищем заново — по его пути в данных */
    var p = el.getAttribute("data-crm-p");
    commitEditing();
    var fresh = (p && document.querySelector("[data-crm-p='" + p + "']")) || el;
    if (!document.contains(fresh)) return;
    select(fresh, { force: true });
    if (t && fresh.hasAttribute("data-crm-t")) startEdit(fresh, e);
  }, true);

  document.addEventListener("input", function (e) {
    if (editing && e.target === editing) saveSoon();
  });

  document.addEventListener("keydown", function (e) {
    var mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "z") {
      e.preventDefault();
      return e.shiftKey ? HIST.fwd() : HIST.back();
    }
    if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); return HIST.fwd(); }
    if (!editing) return;
    if (e.key === "Escape") { e.preventDefault(); commitEditing(); clearSel(); return; }
    if (e.key === "Enter") {
      if (editing.hasAttribute("data-crm-line")) { e.preventDefault(); commitEditing(); return; }
      e.preventDefault();
      if (!document.execCommand("insertLineBreak")) document.execCommand("insertHTML", false, "<br>");
      saveSoon();
    }
    if (mod && e.key.toLowerCase() === "b") { e.preventDefault(); document.execCommand("bold"); markDirty(); }
    if (mod && e.key.toLowerCase() === "i") { e.preventDefault(); document.execCommand("italic"); markDirty(); }
  }, true);

  /* вставляем как обычный текст — чужое форматирование в данные не попадает */
  document.addEventListener("paste", function (e) {
    if (!editing) return;
    e.preventDefault();
    var txt = (e.clipboardData || window.clipboardData).getData("text/plain");
    document.execCommand("insertText", false, txt);
  }, true);

  var raf = null;
  document.addEventListener("mousemove", function (e) {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      updateIns(e.clientX, e.clientY);
    });
  });

  addEventListener("scroll", function () { placePop(); showHandles(); hideIns(); }, true);
  addEventListener("resize", function () { placePop(); showHandles(); });

  /* панель */
  pop.addEventListener("mousedown", function (e) {
    var b = e.target.closest("button");
    if (b && !b.hasAttribute("data-drag")) e.preventDefault();   /* не терять выделение текста */
  });
  pop.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    actOn(b.getAttribute("data-a"));
  });
  pop.addEventListener("dragstart", function (e) {
    if (e.target.closest("[data-drag]")) onDragStart(e);
  });

  insBtn.addEventListener("click", doInsert);

  document.addEventListener("dragover", function (e) {
    if (!dragState) return;
    e.preventDefault();
    showDropLine(findDrop(e.clientY));
  });
  document.addEventListener("drop", function (e) {
    if (!dragState) return;
    e.preventDefault();
    applyDrop(findDrop(e.clientY));
    dropLine.style.display = "none"; dragState = null; draggingNow = false;
  });
  document.addEventListener("dragend", function () {
    dropLine.style.display = "none"; dragState = null; draggingNow = false;
  });

  handles.forEach(function (h, i) {
    h.addEventListener("mousedown", function (e) { startResize(e, i); });
  });

  /* смена языка: страница перерисуется сама и разметится в обёртке render,
     редактору остаётся снять выбор со старого элемента */
  $$("[data-lang-btn]").forEach(function (b) {
    b.addEventListener("mousedown", function () { commitEditing(); });
    b.addEventListener("click", function () { setTimeout(clearSel, 0); });
  });

  /* уход со страницы не должен съедать последние набранные буквы */
  addEventListener("beforeunload", function () {
    if (editing) { try { readEl(editing); } catch (e) { } }
    clearTimeout(saveTimer);
    save();
  });
}

/* ============================================================
   17. СТАРТ
============================================================ */
function boot() {
  loadDraft();

  /* оборачиваем рендер страницы: сначала обычный, потом разметка */
  var orig = H.render;
  H.render = function () {
    orig.apply(null, arguments);
    try { annotate(); } catch (e) { console.error("CRM annotate:", e); }
  };

  if (PREVIEW) { H.render(); return; }   /* просмотр устройства: только данные */

  /* снимок исходного файла делаем до того, как редактор что-то добавил,
     иначе его разметка попадёт в экспорт */
  grabOriginal();

  document.documentElement.classList.add("crm-on");
  var st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);

  pop = document.createElement("div"); pop.className = "crm-pop";
  insBtn = document.createElement("div"); insBtn.className = "crm-ins"; insBtn.innerHTML = "<button type=\"button\">+ Добавить блок</button>";
  dropLine = document.createElement("div"); dropLine.className = "crm-drop";
  [pop, insBtn, dropLine].forEach(function (n) { document.body.appendChild(n); });
  handles = [0, 1].map(function () {
    var h = document.createElement("div"); h.className = "crm-handle";
    document.body.appendChild(h); return h;
  });

  buildBar();
  try { document.execCommand("styleWithCSS", false, false); } catch (e) { }

  H.render();
  HIST.init();
  wire();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();

})();
