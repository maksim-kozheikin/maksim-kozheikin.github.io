#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Переносит правки с русских страниц на английские.

  * доводит структуру en до ru (недостающие блоки копируются);
  * подставляет перевод там, где английского не было
    или он совпадал с русским.
"""
import json, os, re, subprocess, sys

DST = sys.argv[1]

# ---- переводы: файл → путь в данных → английский текст ----
TR = {
    "case-loko.html": {
        "date": "April 2019 — March 2020",
        "navOverview": "Responsibilities",
    },
    "case-rwb.html": {
        "date": "July 2024 — present",
        "navOverview": "Responsibilities",
    },
    "case-vtb.html": {
        "date": "February 2020 — February 2021",
        "navOverview": "Responsibilities",
    },
    "case-zephyr.html": {
        "date": "April 2017 — December 2018",
        "navOverview": "Responsibilities",
    },
    "case-medsi.html": {
        "navOverview": "Responsibilities",
        "duties.9": "Built the app’s design concept that pulled separate products into one visual "
                    "system and made the interface consistent.",
        "duties.10": "Created and maintained the design system together with front-end developers, "
                     "which sped up release cycles.",
        "duties.11": "Ran fast, focused UX research and improved the booking flow, which cut the "
                     "number of failed appointments.",
        "duties.12": "Took part in hiring: helped HR write and shape job descriptions from a design "
                     "point of view.",
        "duties.13": "Supported marketing campaigns and their visuals: newsletters, stories, "
                     "landing pages with interactive elements.",
        "duties.14": "Presented results regularly to company leadership and to colleagues from "
                     "other teams.",
    },
    "case-sberpravo.html": {
        "navOverview": "Responsibilities",
        "duties.7": "Took an active part in product planning — defining key user needs and business "
                    "goals, and turning them into design work.",
        "duties.8": "During my time on the product we launched it and reached 10,000 orders, and "
                    "collected a body of user feedback along the way.",
        # переименованные блоки: «Дискавери» — это и есть английское Discovery
        "blocks.1.title": "Discovery",
        "blocks.5.title": "Discovery",
        "blocks.10.title": "Discovery",
        "blocks.1.subs.0.note": "I ran five interviews to understand what was going wrong, and saw "
                                "three recurring problems.",
        "blocks.5.subs.4.note": "<b>Research</b>",
    },
}


def load(path):
    """достаёт IMG и T из файла страницы"""
    src = open(path, encoding="utf-8").read()
    img = re.search(r"/\*CRM_IMG_S\*/const IMG = ([\s\S]*?);/\*CRM_IMG_E\*/", src)
    dat = re.search(r"/\*CRM_T_S\*/const T = ([\s\S]*?);/\*CRM_T_E\*/", src)
    code = ("const IMG=%s; const T=%s; process.stdout.write(JSON.stringify({IMG,T}));"
            % (img.group(1), dat.group(1)))
    tmp = "/tmp/_crm_load.js"
    open(tmp, "w", encoding="utf-8").write(code)
    out = subprocess.run(["node", tmp], capture_output=True, text=True)
    if out.returncode:
        raise SystemExit("не разобрать данные %s: %s" % (path, out.stderr[:300]))
    o = json.loads(out.stdout)
    return src, o["IMG"], o["T"]


def align(ru, en):
    """структуру en подтягиваем к ru: недостающее копируем, лишнее не трогаем"""
    added = 0
    if not isinstance(ru, list) or not isinstance(en, list):
        return 0
    for i, a in enumerate(ru):
        if i >= len(en):
            en.append(json.loads(json.dumps(a)))
            added += 1
            continue
        b = en[i]
        if not isinstance(a, dict) or not isinstance(b, dict):
            continue
        for k in ("subs", "cards", "results", "imgs", "steps"):
            if isinstance(a.get(k), list):
                if not isinstance(b.get(k), list):
                    b[k] = []
                added += align(a[k], b[k])
    return added


def put(root, path, value):
    parts = path.split(".")
    o = root
    for p in parts[:-1]:
        o = o[int(p)] if p.isdigit() else o[p]
    last = parts[-1]
    if last.isdigit():
        i = int(last)
        while len(o) <= i:
            o.append("")
        o[i] = value
    else:
        o[last] = value


def ser(o):
    return json.dumps(o, ensure_ascii=False, indent=2).replace("</", "<\\/")


for name, fixes in TR.items():
    path = os.path.join(DST, name)
    src, IMG, T = load(path)

    n = align(T["ru"]["blocks"], T["en"]["blocks"])
    for p, v in fixes.items():
        put(T["en"], p, v)

    src = re.sub(r"/\*CRM_T_S\*/[\s\S]*?/\*CRM_T_E\*/",
                 lambda m: "/*CRM_T_S*/const T = " + ser(T) + ";/*CRM_T_E*/", src, count=1)
    src = re.sub(r"/\*CRM_IMG_S\*/[\s\S]*?/\*CRM_IMG_E\*/",
                 lambda m: "/*CRM_IMG_S*/const IMG = " + ser(IMG) + ";/*CRM_IMG_E*/", src, count=1)
    open(path, "w", encoding="utf-8").write(src)
    print("%-24s переводов: %2d, выровнено элементов: %d" % (name, len(fixes), n))
