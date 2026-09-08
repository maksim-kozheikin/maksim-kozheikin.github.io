#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Подключает визуальный редактор к страницам кейсов.

Что делает:
  1. вырезает старую встроенную CRM (панель с полями) из CSS и JS;
  2. добавляет мост window.CRM_HOST и подключает assets/crm-editor.js;
  3. включает вывод s.imgs (ряд картинок) на страницах, где его не было,
     вместе с лайтбоксом — точно теми же стилями, что на medsi;
  4. добавляет поддержку ширины картинки (im.w) и разделителя (s.sep).

Публичный вид страниц не меняется: новые ветки рендера включаются
только при наличии соответствующих данных, которых сейчас нет.
"""
import os, re, shutil, sys

SRC = sys.argv[1]
DST = sys.argv[2]

PAGES = ["case-loko.html", "case-medsi.html", "case-rwb.html",
         "case-sberpravo.html", "case-vtb.html", "case-zephyr.html"]
SIMPLE = ["case-loko.html", "case-rwb.html", "case-vtb.html", "case-zephyr.html"]

CAPS = {
    "case-loko.html":      {},
    "case-rwb.html":       {},
    "case-vtb.html":       {},
    "case-zephyr.html":    {},
    "case-medsi.html":     {"list": True, "tags": True},
    "case-sberpravo.html": {"list": True, "tags": True, "metricBig": True, "figsFull": True,
                            "steps": True, "why": True, "task": True, "blockImg": True, "flow": True},
}


def die(msg):
    raise SystemExit("ОШИБКА: " + msg)


def cut(text, start_marker, end_marker, fname):
    """вырезает кусок от start_marker до (не включая) end_marker"""
    i = text.find(start_marker)
    if i < 0:
        die("%s: не найден маркер %r" % (fname, start_marker))
    j = text.find(end_marker, i)
    if j < 0:
        die("%s: не найден конец %r" % (fname, end_marker))
    return text[:i] + text[j:]


def once(text, old, new, fname, what):
    if text.count(old) != 1:
        die("%s: %s — ожидался один фрагмент, найдено %d" % (fname, what, text.count(old)))
    return text.replace(old, new, 1)


# ---------- донорские куски берём из medsi, чтобы не выдумывать свои ----------
donor = open(os.path.join(SRC, "case-medsi.html"), encoding="utf-8").read()

m = re.search(r"/\* изображения в ряд.*?\n(?=\.chips\{)", donor, re.S)
if not m:
    die("не удалось вырезать стили .figs/.lightbox из medsi")
FIGS_CSS = m.group(0)

m = re.search(r'<div class="lightbox" id="lightbox">.*?\n</div>\n', donor, re.S)
if not m:
    die("не удалось вырезать разметку лайтбокса из medsi")
LIGHTBOX_HTML = m.group(0)

m = re.search(r"/\* лайтбокс с листанием \*/.*?\{passive:true\}\);\n", donor, re.S)
if not m:
    die("не удалось вырезать JS лайтбокса из medsi")
LIGHTBOX_JS = m.group(0)

# вывод картинок — тот же, что на medsi, плюс необязательная ширина
IMGS_RENDER = '''    // реальные изображения — горизонтальный ряд, клик открывает во весь экран
    const imgs = s.imgs
      ? `<div class="figs">${s.imgs.map(im=>
          `<figure class="fig"${im.w?` data-w="${im.w}" style="flex:0 0 ${im.w}%;max-width:${im.w}%"`:""}>
             <button class="fig-btn" data-full="${im.src}" aria-label="Открыть изображение">
               <img src="${im.src}" alt="${im.cap||""}" loading="lazy">
             </button>
             ${im.cap?`<figcaption>${im.cap}</figcaption>`:""}
           </figure>`).join("")}</div>`
      : "";
'''


def host_bootstrap(caps):
    keys = ["list", "metricBig", "figsFull", "steps", "why", "task", "tags", "blockImg", "flow"]
    body = ", ".join("%s:%s" % (k, "true" if caps.get(k) else "false") for k in keys)
    return (
        "/* ===== CRM: мост к визуальному редактору ===== */\n"
        "/* Редактор лежит в assets/crm-editor.js и включается адресом ?crm.\n"
        "   Здесь мы только даём ему доступ к данным и рендеру этой страницы. */\n"
        "window.CRM_HOST = {\n"
        "  id: CURRENT,\n"
        "  get T(){ return T; },\n"
        "  get IMG(){ return IMG; },\n"
        "  get L(){ return L; },\n"
        "  get render(){ return render; },\n"
        "  set render(f){ render = f; },\n"
        "  caps: {" + body + "}\n"
        "};\n"
        "</script>\n"
        "<script src=\"assets/crm-editor.js\" defer></script>\n"
    )


def patch(fname):
    path = os.path.join(DST, fname)
    t = open(path, encoding="utf-8").read()

    # 1. старая CRM: стили и скрипт
    t = cut(t, "/* ===== CRM editor ===== */", "</style>", fname)
    i = t.find("/* ===== CRM ===== */")
    j = t.find("</script>", i)
    if i < 0 or j < 0:
        die("%s: не найден старый блок CRM" % fname)
    t = t[:i] + host_bootstrap(CAPS[fname]) + t[j + len("</script>\n"):]

    # 2. разделитель — переиспользуем .head-sep, который уже есть в проекте
    t = once(t,
             "const subs = (b.subs||[]).map(s=>{",
             "const subs = (b.subs||[]).map(s=>{\n"
             "    if(s.sep) return `<div class=\"sub\"><div class=\"head-sep\"></div></div>`;",
             fname, "начало subs")

    if fname in SIMPLE:
        # 3. стили ряда картинок и лайтбокса
        t = once(t, ".chips{display:flex;flex-wrap:wrap;gap:8px}",
                 FIGS_CSS + ".chips{display:flex;flex-wrap:wrap;gap:8px}", fname, "стили .chips")
        # 4. разметка лайтбокса
        t = once(t, '<script>\nconst CURRENT =', LIGHTBOX_HTML + '\n<script>\nconst CURRENT =',
                 fname, "начало скрипта")
        # 5. вывод картинок в подблоке
        t = once(t, "    const results = s.results ?", IMGS_RENDER + "    const results = s.results ?",
                 fname, "results в subs")
        t = once(t, "${cards}${results}${shots}", "${cards}${results}${imgs}${shots}",
                 fname, "сборка подблока")
        # 6. JS лайтбокса и выравнивание ряда
        t = once(t, '$("#burger").addEventListener', LIGHTBOX_JS + '\n$("#burger").addEventListener',
                 fname, "обработчик бургера")
        t = once(t, "  fixOrphans(document.querySelector(\".sidebar\"));\n  initSpy();",
                 "  fixOrphans(document.querySelector(\".sidebar\"));\n  justifyFigs();\n  initSpy();",
                 fname, "конец render()")
    else:
        # ширина картинки на страницах, где ряд уже есть
        t = once(t, '${s.imgs.map(im=>\n          `<figure class="fig">',
                 '${s.imgs.map(im=>\n          `<figure class="fig"${im.w?` data-w="${im.w}"'
                 ' style="flex:0 0 ${im.w}%;max-width:${im.w}%"`:""}>',
                 fname, "figure в s.imgs")

    # 7. ручная ширина не должна перебиваться автоподгонкой ряда
    t = once(t, 'row.querySelectorAll(".fig").forEach(fig=>{\n      const img=fig.querySelector("img");',
             'row.querySelectorAll(".fig").forEach(fig=>{\n'
             '      if(fig.hasAttribute("data-w")) return;   // ширину задали в редакторе\n'
             '      const img=fig.querySelector("img");',
             fname, "justifyFigs")

    open(path, "w", encoding="utf-8").write(t)
    print("готово:", fname)


if __name__ == "__main__":
    if os.path.exists(DST):
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST)
    for p in PAGES:
        patch(p)
    print("страницы обновлены")
