#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Четвёртый проход.

  1. Маркер-звёздочка встаёт по центру первой строки пункта.
  2. Medsi: блок «Сервисы, над которыми я работал» опускается под блок
     обязанностей, заголовок переименован.
  3. СберПраво: вводный абзац про платформы уезжает в описание кейса
     (там он выводится без маркера существующим стилем), блоки Lead и
     Senior меняются местами, заголовки переименованы.
  4. Заодно убраны повторы, которые появились в английских
     обязанностях при прошлом переносе правок.
"""
import json, os, re, shutil, subprocess, sys

SRC, DST = sys.argv[1], sys.argv[2]
PAGES = ["case-loko.html", "case-medsi.html", "case-rwb.html",
         "case-sberpravo.html", "case-vtb.html", "case-zephyr.html", "index.html"]


def die(m):
    raise SystemExit("ОШИБКА: " + m)


# ---------- 1. маркер по центру первой строки ----------
# было: своя line-height, из-за неё звёздочка вставала выше середины.
# стало: коробка ростом в одну строку текста и выравнивание по центру.
OLD_MARK = 'color:var(--accent);font-size:.85rem;line-height:1.55'
NEW_MARK = ('color:var(--accent);font-size:.85rem;line-height:1;'
            'display:flex;align-items:center;height:calc(var(--text) * 1.6)')
# у пунктов «в строку» своя высота строки
OLD_INLINE = 'color:var(--accent);font-size:.85rem;line-height:1.55}'
NEW_INLINE = ('color:var(--accent);font-size:.85rem;line-height:1;'
              'display:flex;align-items:center;height:calc(var(--text) * 1.45)}')


def fix_bullets(f, t):
    n = t.count(OLD_MARK)
    if not n:
        die("%s: не найдено правило маркера" % f)
    t = t.replace(OLD_MARK, NEW_MARK)
    # у .points.cross коробка теперь flex, старое значение мешает
    t = t.replace('display:inline-block;transform:rotate(45deg)', 'transform:rotate(45deg)')
    t = t.replace(NEW_MARK + '}\n\n.shot', NEW_MARK + '}\n\n.shot')
    # вернуть правильную высоту строки списку «в строку»
    t = re.sub(r'(\.points\.inline li::before\{[^}]*?)'
               + re.escape('height:calc(var(--text) * 1.6)'),
               lambda m: m.group(1) + 'height:calc(var(--text) * 1.45)', t, flags=re.S)
    print("  %-22s правил маркера: %d" % (f, n))
    return t


# ---------- данные страницы ----------
def load(path):
    src = open(path, encoding="utf-8").read()
    img = re.search(r"/\*CRM_IMG_S\*/const IMG = ([\s\S]*?);/\*CRM_IMG_E\*/", src)
    dat = re.search(r"/\*CRM_T_S\*/const T = ([\s\S]*?);/\*CRM_T_E\*/", src)
    code = ("const IMG=%s; const T=%s; process.stdout.write(JSON.stringify({IMG,T}));"
            % (img.group(1), dat.group(1)))
    tmp = "/tmp/_crm_load4.js"
    open(tmp, "w", encoding="utf-8").write(code)
    out = subprocess.run(["node", tmp], capture_output=True, text=True)
    if out.returncode:
        die("не разобрать данные %s: %s" % (path, out.stderr[:300]))
    o = json.loads(out.stdout)
    return src, o["IMG"], o["T"]


def ser(o):
    return json.dumps(o, ensure_ascii=False, indent=2).replace("</", "<\\/")


def save(path, src, IMG, T):
    src = re.sub(r"/\*CRM_T_S\*/[\s\S]*?/\*CRM_T_E\*/",
                 lambda m: "/*CRM_T_S*/const T = " + ser(T) + ";/*CRM_T_E*/", src, count=1)
    src = re.sub(r"/\*CRM_IMG_S\*/[\s\S]*?/\*CRM_IMG_E\*/",
                 lambda m: "/*CRM_IMG_S*/const IMG = " + ser(IMG) + ";/*CRM_IMG_E*/", src, count=1)
    open(path, "w", encoding="utf-8").write(src)


# ---------- 2. Medsi ----------
def patch_medsi():
    path = os.path.join(DST, "case-medsi.html")
    src, IMG, T = load(path)
    ru, en = T["ru"]["duties"], T["en"]["duties"]

    if len(ru) != 15 or len(en) != 15:
        die("case-medsi.html: неожиданный список обязанностей (%d/%d)" % (len(ru), len(en)))

    T["ru"]["duties"] = [
        "<b>Обязанности и достижения как Lead UX/UI Designer</b>",
        ru[6], ru[7], ru[8], ru[9], ru[10], ru[11], ru[12], ru[13], ru[14],
        "<b>Сервисы, над которыми я работал:</b>",
        ru[1], ru[2], ru[3], ru[4],
    ]
    T["en"]["duties"] = [
        "<b>Responsibilities and achievements as Lead UX/UI Designer</b>",
        en[0], en[1], en[2], en[3], en[4], en[5], en[6], en[7], en[8],
        "<b>Services I worked on:</b>",
        "SmartMed — a website and an iOS/Android app for patients. It covers the pharmacy, "
        "clinic booking, telemedicine, lab tests, a medical record with documents and health "
        "trends, a personal account, loyalty points and more.",
        "Doctor’s workspace — a web service for call-centre staff and for doctors seeing "
        "patients. It covers the schedule, reports, the appointment flow and more.",
        "Quality control — a web service for senior doctors to check how other doctors do "
        "their work. It covers medical control, audit and expert review.",
        "Admin — a web service for managing all the other services.",
    ]
    save(path, src, IMG, T)
    print("  case-medsi.html        обязанностей: %d" % len(T["ru"]["duties"]))


# ---------- 3. СберПраво ----------
def patch_sberpravo():
    path = os.path.join(DST, "case-sberpravo.html")
    src, IMG, T = load(path)
    ru, en = T["ru"]["duties"], T["en"]["duties"]

    if len(ru) != 9 or len(en) != 9:
        die("case-sberpravo.html: неожиданный список обязанностей (%d/%d)" % (len(ru), len(en)))

    # вводный абзац про платформы — это описание кейса, а не пункт списка
    T["ru"]["desc"] = ("СберПраво — онлайн-сервис юридической помощи. Продукт представлен "
                       "на платформах: веб-сайт с адаптивным дизайном и мобильные приложения "
                       "для iOS и Android. В нём несколько ролей: сторона заказчика, сторона "
                       "исполнителя и сторона администратора.")
    T["en"]["desc"] = ("An online legal service where people find a lawyer and solve their "
                       "problem online. It runs on responsive web plus iOS and Android apps, "
                       "and has three roles: client, professional and admin.")

    T["ru"]["duties"] = [
        "<b>Обязанности и достижения как Lead UX/UI Designer</b>",
        ru[6], ru[7], ru[8],
        "<b>Обязанности и достижения как Senior UX/UI Designer</b>",
        ru[2], ru[3], ru[4],
    ]
    T["en"]["duties"] = [
        "<b>Responsibilities and achievements as Lead UX/UI Designer</b>",
        "Research was added to my duties — the results are presented below as cases. "
        "I mentored a designer, distributed tasks and ran reviews of finished work.",
        "Took an active part in product planning — defining key user needs and business goals. "
        "Set up close collaboration between design and development so designs shipped as "
        "intended, and prepared result presentations for the business and the team.",
        "During my time on the product we launched it and reached 10,000 orders. We also "
        "collected user feedback and started fixing the issues it surfaced.",
        "<b>Responsibilities and achievements as Senior UX/UI Designer</b>",
        "Grew the product across all platforms and shaped design solutions together with "
        "the design lead.",
        "Built a design system so the product could scale further.",
        "Created a user flow map: analysts found errors faster, new colleagues understood "
        "the logic of the system, and developers could estimate upcoming work more easily.",
    ]
    save(path, src, IMG, T)
    print("  case-sberpravo.html    обязанностей: %d" % len(T["ru"]["duties"]))


if __name__ == "__main__":
    if os.path.exists(DST):
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST)

    print("маркеры:")
    for p in PAGES:
        path = os.path.join(DST, p)
        t = open(path, encoding="utf-8").read()
        t = fix_bullets(p, t)
        open(path, "w", encoding="utf-8").write(t)

    print("данные:")
    patch_medsi()
    patch_sberpravo()
