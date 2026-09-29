import asyncio, html
from playwright.async_api import async_playwright
F='file:///home/claude/fonts/'
FONTS=f'''@font-face{{font-family:G;font-weight:400;src:url({F}golos-text-cyrillic-400-normal.woff2);unicode-range:U+0400-045F,U+2116}}
@font-face{{font-family:G;font-weight:400;src:url({F}golos-text-latin-400-normal.woff2)}}
@font-face{{font-family:G;font-weight:500;src:url({F}golos-text-cyrillic-500-normal.woff2);unicode-range:U+0400-045F,U+2116}}
@font-face{{font-family:G;font-weight:500;src:url({F}golos-text-latin-500-normal.woff2)}}'''
SITE="https://maksim-kozheikin.github.io"
D={
"en":dict(
 name="Maksim Kozheikin", title="Senior/Lead UX/UI Product Designer",
 summary=["8+ years of experience. I design web services, systems and mobile apps.","I build design teams and set up processes"],
 contacts_h="", links=[("Portfolio",SITE),("Telegram","https://t.me/maksimdesigner"),("LinkedIn","https://www.linkedin.com/in/maksim-kozheikin/")],
 jobs=[
  ("Jul 2024 — Now (2 yrs 3 mos)","Senior Designer","Wildberries — the largest marketplace in Russia. Seller Portal, web and responsive",[
    "Redesigned navigation in the Prices & discounts and Promotions sections so sellers reach pricing and promo tools faster",
    "Redesigned the WB promotions feed, calendar and promotion drawers, so sellers compare offers and join a promotion in fewer steps",
    "Designed the Price index, which shows sellers how attractive their price is to buyers and how it affects visibility in search",
    "Take tasks from discovery to handoff, test hypotheses with prototypes, run demos and make decisions based on analytics and metrics"]),
  ("Jun 2022 — Mar 2024 (1 yr 10 mos)","Lead Designer","Medsi Digital — SmartMed telemedicine app and web services for MEDSI clinics",[
    "Built the design team from scratch, hired and onboarded 5 designers and introduced scrum rituals and a knowledge base, so the team covered all company products",
    "Introduced design reviews and built a design system with front-end developers, which removed friction with development and sped up delivery",
    "Created a single visual concept for the SmartMed app that united separate products into one consistent system",
    "Redesigned the doctor booking flow, which reduced the load on the call center"]),
  ("Feb 2021 — Apr 2022 (1 yr 3 mos)","Senior → Lead Designer","SberPravo — online legal assistance service. Web, iOS and Android",[
    "Led the product redesign from prototype to launch with user research and testing, and the product reached 10,000 orders",
    "Built a design system and a user flow map, mentored a designer and ran design reviews"]),
  ("Feb 2020 — Feb 2021 (1 yr 1 mo)","Senior Designer","VTB Bank — online banking platform for legal entities. Web",[
    "Designed web interfaces and scenarios with analysts and product owners and oversaw implementation by 8 developers",
    "Simplified sign-in and account opening and shipped new features, which grew new users by 15%"]),
  ("Apr 2019 — Mar 2020 (1 yr)","Middle Designer","Loko Bank — mobile banking app for legal entities. iOS and Android",[
    "Redesigned the app and built a design system, and the new version attracted 30,000+ new users",
    "The app rose from 25th to 7th place among banks in the Markswebb ranking"]),
  ("Apr 2017 — Dec 2018 (1 yr 9 mos)","Middle Designer","ZephyrLAB — design studio. Mobile apps, websites, admin panels and landing pages",["Mobile apps, websites, responsive layouts, CRM systems, online stores and landing pages","Grew from references and concepts to complex tasks, from analysis to design review"]),
  ("May 2016 — Mar 2017 (11 mos)","Junior Designer","Freelance. Design studio. Design education",[]),
 ],
 short=[],
 edu_h="Education", edu=["2026. Igor Shtang — Spreadsheets","2020. Gorbunov Bureau — “User Interface and Presentation of Information”","2017. Moscow Digital Academy — “Digital, UX/UI”","2016. Danila Fimushin — “Design:GYM 3.0”","2014. Kursk State University — “Bachelor of Technological Education”"],
 skills_h="Skills", skills="Figma • AI • Research • Prototyping • CJM • JTBD • Design Thinking • GMD • HIG • En B2"),
"ru":dict(
 name="Максим Кожейкин", title="Senior/Lead UX/UI Product Designer",
 summary=["Опыт более 8 лет. Проектирую веб-сервисы, системы и мобильные приложения.","Собираю дизайн-команды и выстраиваю процессы"],
 contacts_h="", links=[("Портфолио",SITE),("Telegram","https://t.me/maksimdesigner"),("LinkedIn","https://www.linkedin.com/in/maksim-kozheikin/")],
 jobs=[
  ("Июль 2024 — Сейчас (2 года 3 месяца)","Senior Designer","Wildberries — крупнейший маркетплейс в России. Портал продавца, веб и адаптив",[
    "Переработал навигацию разделов «Цены и скидки» и «Акции», чтобы селлеры быстрее находили инструменты для цен и промо",
    "Сделал редизайн ленты и календаря акций WB и шторок акций, теперь селлер сравнивает предложения и подключается к акции за меньшее число шагов",
    "Спроектировал Индекс цены, который показывает селлеру, насколько его цена выгодна покупателю и как это влияет на показы в поиске",
    "Веду задачи от discovery до передачи в разработку, проверяю гипотезы прототипами, провожу демо и принимаю решения на основе аналитики и метрик"]),
  ("Июнь 2022 — Март 2024 (1 год 10 месяцев)","Lead Designer","Medsi Digital — телемедицинское приложение SmartMed и веб-сервисы клиник МЕДСИ",[
    "Собрал дизайн-команду с нуля, нанял и онбордил 5 дизайнеров, ввёл скрам-практики и базу знаний, и команда закрыла все продукты компании",
    "Ввёл дизайн-ревью и вместе с фронтендом построил дизайн-систему, что убрало проблемы во взаимодействии с разработкой и ускорило выпуск интерфейсов",
    "Разработал единую визуальную концепцию приложения SmartMed, которая объединила разрозненные продукты в одну систему",
    "Переработал флоу записи к врачу, что снизило нагрузку на колл-центр"]),
  ("Февраль 2021 — Апрель 2022 (1 год 3 месяца)","Senior → Lead Designer","СберПраво — онлайн-сервис юридической помощи. Веб, iOS и Android",[
    "Вёл редизайн продукта от прототипа до запуска с исследованиями и тестированием, продукт получил 10 000 заказов",
    "Создал дизайн-систему и карту пользовательских путей, менторил дизайнера и проводил дизайн-ревью"]),
  ("Февраль 2020 — Февраль 2021 (1 год 1 месяц)","Senior Designer","Банк ВТБ — платформа онлайн-банкинга для юрлиц. Веб",[
    "Проектировал веб-интерфейсы и сценарии вместе с аналитиками и продактами, контролировал реализацию командой из 8 разработчиков",
    "Упростил авторизацию и открытие счёта и запустил новые функции, что увеличило число новых пользователей на 15%"]),
  ("Апрель 2019 — Март 2020 (1 год)","Middle Designer","Локо Банк — мобильное приложение для юрлиц. iOS и Android",[
    "Сделал редизайн приложения и дизайн-систему, новая версия привлекла 30 000+ новых пользователей",
    "Приложение поднялось с 25-го на 7-е место среди банков в рейтинге Markswebb"]),
  ("Апрель 2017 — Декабрь 2018 (1 год 9 месяцев)","Middle Designer","ZephyrLAB — дизайн-студия. Мобильные приложения, сайты, админки и лендинги",["Мобильные приложения, сайты, адаптивы, CRM-системы, интернет-магазины и лендинги","Вырос от референсов и концепций до сложных задач от аналитики до дизайн-ревью"]),
  ("Май 2016 — Март 2017 (11 месяцев)","Junior Designer","Фриланс. Студия дизайна. Дизайнерское образование",[]),
 ],
 short=[],
 edu_h="Образование", edu=["2026. Игорь Штанг — таблицы","2020. Бюро Горбунова — «Пользовательский интерфейс и представление информации»","2017. Moscow Digital Academy — «Digital, UX/UI»","2016. Данила Фимушин — «Design:GYM 3.0»","2014. Курский госуниверситет — «Бакалавр технологического образования»"],
 skills_h="Навыки", skills="Figma • AI • Research • Prototyping • CJM • JTBD • Design Thinking • GMD • HIG • En B2"),
}
def page(d):
    e=html.escape
    jobs=''.join(f'''<section class="job"><div class="jh"><h3>{e(role)}</h3><span class="dt">{e(dt)}</span></div><p class="co">{e(co)}</p>{('<ul>'+''.join(f"<li>{e(b)}</li>" for b in bl)+'</ul>') if bl else ''}</section>''' for dt,role,co,bl in d['jobs'])
    short=''.join(f'<p class="short"><b>{e(dt)}. {e(role)}.</b> {e(co)}</p>' for dt,role,co in d['short'])
    links=''.join(f'<a href="{u}">{e(t)}</a>' for t,u in d['links'])
    return f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{FONTS}
@page{{size:A4;margin:10mm 15mm 8mm}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:G,sans-serif;color:#131316;font-size:8.8pt;line-height:1.32;-webkit-font-smoothing:antialiased}}
h1{{font-size:22pt;font-weight:500;letter-spacing:-.02em;line-height:1.1}}
.head{{display:flex;justify-content:space-between;gap:24px;margin-top:10px}}
h2{{font-size:12pt;font-weight:500;letter-spacing:-.01em}}
.sum{{color:#6C6C74;margin-top:4px}}
.col70{{max-width:80%}}
.jh{{display:flex;justify-content:space-between;align-items:baseline;gap:16px}}
.jh .dt{{color:#6C6C74;white-space:nowrap;font-size:9pt}}
.contacts{{text-align:right}}
.contacts .ln{{justify-content:flex-end}}
.contacts b{{font-weight:500;display:block;margin-bottom:3px}}
.contacts .mail{{color:#131316}}
.contacts .ln{{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:6px}}
a{{color:#131316;text-decoration:underline;text-decoration-color:#C8C8CE;text-underline-offset:2px}}
.job{{margin-top:15px;break-inside:avoid}}
.job:first-of-type{{margin-top:20px}}
h3{{font-size:10.5pt;font-weight:500}}
.co{{color:#6C6C74;margin-top:1px}}
ul{{list-style:none;margin-top:4px;display:flex;flex-direction:column;gap:2px}}
li{{position:relative;padding-left:12px}}
li::before{{content:"•";position:absolute;left:0;color:#6C6C74}}
.short{{margin-top:7px}}
.short b{{font-weight:500}}
h4{{font-size:10.5pt;font-weight:500;margin-top:10px;margin-bottom:2px}}
.muted p{{margin-top:1px}}
.skills{{white-space:nowrap}}
</style></head><body>
<h1>{e(d['name'])}</h1>
<div class="head"><div><h2>{e(d['title'])}</h2><div class="sum">{'<br>'.join(e(x) for x in d['summary'])}</div></div>
<div class="contacts"><a class="mail" href="mailto:maksim.kozheikin@gmail.com">maksim.kozheikin@gmail.com</a><div class="ln">{links}</div></div></div>
<div class="col70">
{jobs}{short}
<h4>{e(d['edu_h'])}</h4><div class="muted">{''.join(f"<p>{e(x)}</p>" for x in d['edu'])}</div>
<h4>{e(d['skills_h'])}</h4><p class="skills">{e(d['skills'])}</p></div>
</body></html>'''
# ---- структура как у референса: слева годы и длительность, справа компания ✦ описание, должность, текст, «Результаты» ----
META={
"ru":[("2024 — сейчас","2 года 3 месяца","Wildberries","Крупнейший маркетплейс в России","Портал продавца. Веб и адаптив"),
      ("2022 — 2024","1 год 10 месяцев","Medsi Digital","Сервисы для сети клиник МЕДСИ и их пользователей","Веб-сайт, приложение iOS и Android. Кабинет врача. Админка"),
      ("2021 — 2022","1 год 3 месяца","СберПраво","Онлайн-сервис юридической помощи","Веб, iOS и Android. Профиль заказчика, исполнителя и админа"),
      ("2020 — 2021","1 год 1 месяц","Банк ВТБ","Платформа онлайн-банкинга для юридических лиц","Личный кабинет. Веб"),
      ("2019 — 2020","1 год","Локо Банк","Мобильное приложение для юридических лиц","Приложение iOS и Android"),
      ("2017 — 2018","1 год 9 месяцев","ZephyrLAB","Дизайн-студия","Мобильные приложения, сайты, админки и лендинги"),
      ("2016 — 2017","11 месяцев","Фриланс. Дизайн-студия. Ивент-агентство","","")],
"en":[("2024 — Now","2 yrs 3 mos","Wildberries","The largest marketplace in Russia","Seller Portal. Web and responsive"),
      ("2022 — 2024","1 yr 10 mos","Medsi Digital","Services for the MEDSI clinic network and its users","Website, iOS and Android app. Doctor’s workspace. Admin"),
      ("2021 — 2022","1 yr 3 mos","SberPravo","Online legal assistance service","Web, iOS and Android. Client, contractor and admin profiles"),
      ("2020 — 2021","1 yr 1 mo","VTB Bank","Online banking platform for legal entities","Online account. Web"),
      ("2019 — 2020","1 yr","Loko Bank","Mobile app for legal entities","iOS and Android app"),
      ("2017 — 2018","1 yr 9 mos","ZephyrLAB","Design studio","Mobile apps, websites, admin panels and landing pages"),
      ("2016 — 2017","11 mos","Freelance. Design studio. Event agency","","")]}
LBL={"ru":{"res":"Результаты","port":"Портфолио","mail":"Почта","edu":"Образование","sk":"Навыки"},
     "en":{"res":"Results","port":"Portfolio","mail":"Email","edu":"Education","sk":"Skills"}}
CSS2 = """
@font-face{font-family:G;font-weight:600;src:url(@F@golos-text-cyrillic-600-normal.woff2);unicode-range:U+0400-045F,U+2116}
@font-face{font-family:G;font-weight:600;src:url(@F@golos-text-latin-600-normal.woff2)}
@page{size:A4;margin:12mm 14mm 12mm}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:G,sans-serif;color:#131316;font-size:9.2pt;line-height:1.38;-webkit-font-smoothing:antialiased}
h1{font-size:24pt;font-weight:600;letter-spacing:-.02em;line-height:1.1}
.title{font-size:12pt;font-weight:500;margin-top:6px}
.sum{margin-top:8px;font-size:10pt;line-height:1.45;max-width:92%;color:#6C6C74}
.head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
.head .sum{max-width:none}
.ct2{text-align:left;white-space:nowrap}
.ct2 a{color:#131316;text-decoration:underline;text-decoration-color:#C8C8CE;text-underline-offset:2px}
.ct2 .ln{display:flex;justify-content:flex-start;gap:14px;margin-top:4px}
.ct span{display:block;color:#6C6C74;font-size:9.4pt}
.ct a{color:#131316;text-decoration:none}
html,body{height:100%}
body{display:flex;flex-direction:column}
.jobs{flex:1;display:flex;flex-direction:column;justify-content:space-evenly}
.jobs > .row{margin-top:0}
.rest > .row{margin-top:12px}
.jobs + hr{margin-top:0}
hr{border:none;border-top:1px solid #E2E2E6;margin:12px 0 0}
.row{display:grid;grid-template-columns:17% 1fr;gap:0 10px;margin-top:11px;break-inside:avoid}
.l b{display:block;font-weight:600}
.l span{display:block;color:#6C6C74;margin-top:4px}
.co b{font-weight:600}
.co i{font-style:normal;color:#131316;margin:0 6px}
.role{font-weight:500;margin-top:3px}
.about{margin-top:3px;color:#6C6C74}
.lbl{font-weight:500;margin-top:7px}
ul{list-style:none;margin-top:4px;display:flex;flex-direction:column;gap:2px}
li{position:relative;padding-left:12px}
li::before{content:"✦";position:absolute;left:0;top:.05em;color:#F0523C;font-size:.85em}
li{padding-left:14px}
.sec p+p{margin-top:1px}
"""

# ---- без висячих предлогов: короткие слова склеиваются со следующим, тире не начинает строку ----
import re as _re
SHORT_WORDS=["в","во","на","за","к","ко","с","со","о","об","обо","от","ото","по","до","из","изо","у","для","при","про","над","под","без","перед","через","между","около","среди","после",
 "и","а","но","ни","не","же","ли","бы","то","что","как","чтобы","или","либо","если","так",
 "я","мы","он","она","оно","они","их","его","её","мой","моя","моё","наш","эта","это","этот","все","всё",
 "a","an","the","in","on","at","to","of","for","and","or","with","by","from","as","is","are","was","we","i","it","my","our"]
_NB_RE=_re.compile(r"(^|[\s(«\"„—–-])("+"|".join(SHORT_WORDS)+r")[ \t\r\n]+", _re.I)
def nb(t):
    prev=None
    while prev!=t:
        prev=t; t=_NB_RE.sub(lambda m:m.group(1)+m.group(2)+"\u00a0", t)
    return _re.sub(r"\s+([—–])\s", "\u00a0\\1 ", t)

def lcf(t):
    # после тире — со строчной, кроме аббревиатур и имён собственных
    w=t.split(' ')[0]
    return t if (w.isupper() or w[:1].isdigit()) else t[:1].lower()+t[1:]

def page2(d, lg):
    e=html.escape
    rows=[]
    for (dt,role,co,bl),(yrs,dur,name,desc,about) in zip(d['jobs'],META[lg]):
        res = ('<ul>'+''.join("<li>"+e(nb(b))+"</li>" for b in bl)+'</ul>') if bl else ''
        rows.append('<section class="row"><div class="l"><b>'+e(yrs)+'</b><span>'+e(dur)+'</span></div>'
          '<div class="r"><p class="co"><b>'+e(role)+'</b><i>·</i><b>'+e(name)+'</b>'+(('\u00a0— '+e(nb(lcf(desc)))) if desc else '')+'</p>'+res+'</div></section>')
    edu=''.join("<p>"+e(nb(x))+"</p>" for x in d['edu'])
    L=LBL[lg]
    return ('<!DOCTYPE html><html><head><meta charset="utf-8"><style>'+FONTS.replace('{{','{').replace('}}','}')+CSS2.replace('@F@',F)+'</style></head><body>'
      '<h1>'+e(d['name'])+'</h1>'
      '<div class="head"><div><p class="title">'+e(d['title'])+'</p><p class="sum">'+e(' '.join(d['summary']))+'</p></div>'
      '<div class="ct2"><a href="mailto:maksim.kozheikin@gmail.com">maksim.kozheikin@gmail.com</a>'
      '<div class="ln"><a href="'+SITE+'">'+L["port"]+'</a><a href="https://t.me/maksimdesigner">Telegram</a><a href="https://www.linkedin.com/in/maksim-kozheikin/">LinkedIn</a></div>'
      '</div></div><hr><div class="jobs">'+''.join(rows)+'</div><hr><div class="rest">'+
      '<section class="row"><div class="l"><b>'+L["edu"]+'</b></div><div class="r sec">'+edu+'</div></section>'
      '<section class="row"><div class="l"><b>'+L["sk"]+'</b></div><div class="r">'+e(d['skills'])+'</div></section>'
      '</div></body></html>')

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for lg in ('ru','en'):
            pg=await b.new_page(viewport={'width':794,'height':1123})
            await pg.set_content(page2(D[lg], lg)); await pg.evaluate('document.fonts.ready'); await pg.wait_for_timeout(300)
            await pg.pdf(path=f'/home/claude/cv/cv-{lg}.pdf', format='A4', print_background=True, prefer_css_page_size=True)
        await b.close()
asyncio.run(main())
