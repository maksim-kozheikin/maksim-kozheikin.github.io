#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Третий проход.

  1. Маркер в списках «Проблемы» — та же звёздочка, повёрнутая на 45°.
  2. Видимая часть обязанностей вдвое выше, «Посмотреть ещё» — ниже.
  3. Блок с тремя достижениями убран со всех страниц кейсов.
  4. В подвале «Следующий проект» берётся из общего списка проектов
     (раньше на пяти страницах из шести там было «undefined: undefined»).
  5. В СберПраво разделы подписаны словом «Кейс».
"""
import os, re, shutil, sys

SRC, DST = sys.argv[1], sys.argv[2]
CASES = ["case-loko.html", "case-medsi.html", "case-rwb.html",
         "case-sberpravo.html", "case-vtb.html", "case-zephyr.html"]


def die(m):
    raise SystemExit("ОШИБКА: " + m)


def once(t, old, new, f, what):
    n = t.count(old)
    if n != 1:
        die("%s: %s — ожидался один фрагмент, найдено %d" % (f, what, n))
    return t.replace(old, new, 1)


ACHIEVEMENTS = '''    <div class="achievements" id="achievements" style="scroll-margin-top:20px">
      <div class="cols">${t.achievements.map(a=>
        `<div class="card metric">${a.n?`<span class="num">${a.n}</span> `:""}<span class="lbl">${a.l}</span></div>`).join("")}</div>
    </div>

'''

FOOT_OLD = '''      <a href="${t.nextHref}">${t.next}: ${t.nextName} →</a>'''
FOOT_NEW = '''      ${(()=>{
        /* следующий проект берём из общего списка — руками дублировать нечего */
        const i = PROJECTS.findIndex(p=>p.id===CURRENT), n = PROJECTS[i+1];
        if(!n) return "";
        const label = t.next || (L==="ru" ? "Следующий проект" : "Next project");
        return `<a href="${n.href}">${label}: ${n.ti[L]} →</a>`;
      })()}'''


def patch(f):
    t = open(os.path.join(DST, f), encoding="utf-8").read()

    # 1. маркер «Проблем» — звёздочка под 45°, получается крестик.
    #    Списками с маркерами пользуются только medsi и sberpravo.
    old_mark = ('.points.cross li::before{content:"";top:.62em;width:5px;height:5px;'
                'border-radius:50%;background:var(--accent)}')
    if old_mark in t:
        t = once(t, old_mark,
                 '.points.cross li::before{content:"✦";top:0;width:auto;height:auto;border-radius:0;'
                 'background:none;color:var(--accent);font-size:.85rem;line-height:1.55;'
                 'display:inline-block;transform:rotate(45deg)}',
                 f, "маркер .points.cross")

    # 2. видимая часть обязанностей вдвое выше
    t = once(t, ".duties{position:relative;overflow:hidden;max-height:170px;",
             ".duties{position:relative;overflow:hidden;max-height:340px;", f, "высота .duties")

    # 3. три достижения убираем
    t = once(t, ACHIEVEMENTS, "", f, "блок достижений")

    # 4. следующий проект — из общего списка
    t = once(t, FOOT_OLD, FOOT_NEW, f, "ссылка на следующий проект")

    # 5. в СберПраво разделы — это кейсы
    if f == "case-sberpravo.html":
        t = once(t, '`${L==="ru"?"Раздел":"Chapter"} ${String(g).padStart(2,"0")}`',
                 '`${L==="ru"?"Кейс":"Case"} ${String(g).padStart(2,"0")}`', f, "подпись раздела")

    open(os.path.join(DST, f), "w", encoding="utf-8").write(t)
    print("готово:", f)


if __name__ == "__main__":
    if os.path.exists(DST):
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST)
    for c in CASES:
        patch(c)
