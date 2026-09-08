#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Второй проход по проекту.

  1. Список проектов уезжает в общий assets/site.js — правка левого меню
     на любой странице меняет его сразу везде.
  2. Подменю кейса собирается из блоков самой страницы, а не из
     отдельного списка: переименовали блок — переименовался пункт меню.
  3. Главная страница получает редактор.
  4. У блоков и секций появляется отступ сверху (b.gap / s.gap).
"""
import os, re, shutil, sys, json

SRC, DST = sys.argv[1], sys.argv[2]

CASES = ["case-loko.html", "case-medsi.html", "case-rwb.html",
         "case-sberpravo.html", "case-vtb.html", "case-zephyr.html"]
PAGES = CASES + ["index.html"]

CAPS = {
    "case-loko.html": {}, "case-rwb.html": {}, "case-vtb.html": {}, "case-zephyr.html": {},
    "case-medsi.html": {"list": True, "tags": True},
    "case-sberpravo.html": {"list": True, "tags": True, "metricBig": True, "figsFull": True,
                            "steps": True, "why": True, "task": True, "blockImg": True, "flow": True},
}


def die(m):
    raise SystemExit("ОШИБКА: " + m)


def once(t, old, new, f, what):
    n = t.count(old)
    if n != 1:
        die("%s: %s — ожидался один фрагмент, найдено %d" % (f, what, n))
    return t.replace(old, new, 1)


def read(f):
    return open(os.path.join(DST, f), encoding="utf-8").read()


def write(f, t):
    open(os.path.join(DST, f), "w", encoding="utf-8").write(t)


# ---------- 1. общий список проектов ----------
def build_site_js():
    t = read("index.html")
    m = re.search(r"const PROJECTS = \[(.*?)\n\];", t, re.S)
    if not m:
        die("index.html: не найден PROJECTS")
    import subprocess
    code = ("const PROJECTS=[" + m.group(1) + "];"
            "process.stdout.write(JSON.stringify(PROJECTS.map(p=>{const q={...p};delete q.sections;return q;}),null,2));")
    out = subprocess.run(["node", "-e", code], capture_output=True, text=True)
    if out.returncode:
        die("не удалось разобрать PROJECTS: " + out.stderr[:300])
    body = out.stdout
    os.makedirs(os.path.join(DST, "assets"), exist_ok=True)
    open(os.path.join(DST, "assets", "site.js"), "w", encoding="utf-8").write(
        "/* ============================================================\n"
        "   Список проектов — общий для всех страниц сайта.\n"
        "   Подключается в index.html и в каждом case-*.html.\n"
        "   Правится в редакторе: откройте любую страницу с ?crm\n"
        "   и щёлкните по названию проекта в левом меню.\n"
        "============================================================ */\n"
        "/*CRM_PROJECTS_S*/const PROJECTS = " + body + ";/*CRM_PROJECTS_E*/\n")
    return body


def drop_projects(f, t):
    """вырезает встроенный PROJECTS вместе с его комментарием"""
    m = re.search(r"const PROJECTS = \[.*?\n\];\n", t, re.S)
    if not m:
        die("%s: не найден блок PROJECTS" % f)
    start = m.start()
    head = t[:start]
    c = re.search(r"/\*[^*]*\*/\s*$", head, re.S)          # комментарий прямо перед списком
    if c and "ПРОЕКТ" in c.group(0).upper():
        start = c.start()
    return t[:start] + t[m.end():]


def add_site_script(f, t):
    """подключает общий список проектов перед основным скриптом страницы"""
    i = t.find("const CURRENT = ")
    if i < 0:
        i = t.find("const STR")
    if i < 0:
        die("%s: не найдено начало данных страницы" % f)
    j = t.rfind("<script>", 0, i)
    if j < 0:
        die("%s: не найден тег script" % f)
    return t[:j] + '<script src="assets/site.js"></script>\n' + t[j:]


# ---------- 2. мост к редактору ----------
def bridge_case(fname, caps):
    keys = ["list", "metricBig", "figsFull", "steps", "why", "task", "tags", "blockImg", "flow"]
    cap = ", ".join("%s:%s" % (k, "true" if caps.get(k) else "false") for k in keys)
    return """/* ===== CRM: мост к визуальному редактору ===== */
/* Редактор лежит в assets/crm-editor.js и включается адресом ?crm. */
window.CRM_HOST = {
  id: CURRENT,
  file: "%s",
  pageType: "case",
  langs: ["ru","en"],
  roots: { T: T, IMG: IMG, PROJECTS: { list: PROJECTS } },
  dataPath: ["T", "$L"],
  shared: ["PROJECTS"],
  markers: [
    { m:"CRM_T",   decl:"const T",   root:"T" },
    { m:"CRM_IMG", decl:"const IMG", root:"IMG" }
  ],
  get L(){ return L; },
  get render(){ return render; },
  set render(f){ render = f; },
  get renderNav(){ return renderNav; },
  caps: {%s}
};
</script>
<script src="assets/crm-editor.js" defer></script>
""" % (fname, cap)


BRIDGE_HOME = """/* ===== CRM: мост к визуальному редактору ===== */
window.CRM_HOST = {
  id: "home",
  file: "index.html",
  pageType: "home",
  pageName: "Главная",
  langs: ["ru","en"],
  roots: {
    STR: STR,
    EXPERIENCE:        { list: EXPERIENCE },
    EDUCATION:         { list: EDUCATION },
    SKILLS:            SKILLS,
    PERSONAL:          { list: PERSONAL },
    PERSONAL_PROJECTS: { list: PERSONAL_PROJECTS },
    TAGS:              TAGS,
    PROJECTS:          { list: PROJECTS }
  },
  dataPath: [],
  shared: ["PROJECTS"],
  markers: [
    { m:"CRM_STR",  decl:"const STR",               root:"STR" },
    { m:"CRM_EXP",  decl:"const EXPERIENCE",        root:"EXPERIENCE",        key:"list" },
    { m:"CRM_EDU",  decl:"const EDUCATION",         root:"EDUCATION",         key:"list" },
    { m:"CRM_SKL",  decl:"const SKILLS",            root:"SKILLS" },
    { m:"CRM_PP",   decl:"const PERSONAL_PROJECTS", root:"PERSONAL_PROJECTS", key:"list" },
    { m:"CRM_TAGS", decl:"const TAGS",              root:"TAGS" },
    { m:"CRM_PRS",  decl:"const PERSONAL",          root:"PERSONAL",          key:"list" }
  ],
  get L(){ return LANG; },
  get render(){ return renderAll; },
  set render(f){ renderAll = f; },
  caps: {}
};
</script>
<script src="assets/crm-editor.js" defer></script>
"""


def patch_case(f):
    t = read(f)

    t = drop_projects(f, t)
    t = add_site_script(f, t)

    # подменю — из блоков самой страницы
    t = once(t, "    if(!active || !p.sections.length) return row;",
             "    if(!active) return row;\n\n"
             "    /* Подменю собирается из блоков самой страницы: заголовок блока\n"
             "       и пункт меню — одно и то же, править нужно в одном месте.\n"
             "       Страница с единственным блоком обходится без подменю. */\n"
             "    const sections = (d().blocks||[]).filter(b=>b.a)\n"
             "      .map(b=>({a:b.a, group:!!b.group, ti:String(b.title||\"\").replace(/<[^>]+>/g,\"\")}));\n"
             "    if(sections.length < 2) return row;",
             f, "renderNav")
    t = once(t, "...p.sections]", "...sections]", f, "список пунктов меню")

    # отступы у секции и подблока
    if '<section class="block${b.group?" group":""}" id="${b.a}">' in t:
        t = once(t, '<section class="block${b.group?" group":""}" id="${b.a}">',
                 '<section class="block${b.group?" group":""}" id="${b.a}"'
                 '${b.gap!=null?` style="margin-top:${b.gap}px"`:""}>', f, "section")
    else:
        t = once(t, '<section class="block" id="${b.a}">',
                 '<section class="block" id="${b.a}"'
                 '${b.gap!=null?` style="margin-top:${b.gap}px"`:""}>', f, "section")
    t = once(t, 'return `<div class="sub">\n',
             'return `<div class="sub"${s.gap!=null?` style="margin-top:${s.gap}px"`:""}>\n',
             f, "sub")

    # мост
    i = t.find("/* ===== CRM: мост к визуальному редактору ===== */")
    if i < 0:
        die("%s: не найден мост первой версии" % f)
    m = re.search(r'<script src="assets/crm-editor\.js"[^>]*>\s*</script>\s*', t[i:])
    if not m:
        die("%s: не найдено подключение редактора" % f)
    t = t[:i] + bridge_case(f, CAPS[f]) + t[i + m.end():]

    write(f, t)
    print("готово:", f)


HOME_MARK = [
    ("CRM_STR", "const STR = {", "\n};"),
    ("CRM_EXP", "const EXPERIENCE = [", "\n];"),
    ("CRM_EDU", "const EDUCATION = [", "\n];"),
    ("CRM_SKL", "const SKILLS = {", "\n};"),
    ("CRM_PP", "const PERSONAL_PROJECTS = [", "\n];"),
    ("CRM_TAGS", "const TAGS = {", "\n};"),
    ("CRM_PRS", "const PERSONAL = [", "\n];"),
]


def patch_home():
    f = "index.html"
    t = read(f)

    t = drop_projects(f, t)
    t = add_site_script(f, t)

    # маркеры вокруг каждого набора данных — по ним редактор пересобирает файл
    for name, start, end in HOME_MARK:
        i = t.find(start)
        if i < 0:
            die("index.html: не найден %s" % start)
        j = t.find(end, i)
        if j < 0:
            die("index.html: не найден конец %s" % start)
        j += len(end)
        t = t[:i] + "/*%s_S*/" % name + t[i:j] + "/*%s_E*/" % name + t[j:]

    # renderAll должен быть переопределяемым — объявляем через let
    t = once(t, "function renderAll(){", "let renderAll = function(){", f, "renderAll")
    t = once(t, "renderSkills();renderPersonal();renderCV();fixOrphans(document.querySelector(\".main\"));"
                "fixOrphans(document.querySelector(\".sidebar\"));}",
             "renderSkills();renderPersonal();renderCV();fixOrphans(document.querySelector(\".main\"));"
             "fixOrphans(document.querySelector(\".sidebar\"));};", f, "конец renderAll")

    t = once(t, "</script>\n</body>", BRIDGE_HOME + "</body>", f, "конец страницы")
    write(f, t)
    print("готово:", f)


if __name__ == "__main__":
    if os.path.exists(DST):
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST)
    build_site_js()
    for c in CASES:
        patch_case(c)
    patch_home()
    print("assets/site.js создан")
