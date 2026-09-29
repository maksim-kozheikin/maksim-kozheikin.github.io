# ---- структура как у референса: слева годы и длительность, справа компания ✦ описание, должность, текст, «Результаты» ----
META={
"ru":[("2024 — сейчас","2 года 3 месяца","Wildberries","Крупнейший маркетплейс России","Портал продавца. Проектирую разделы «Цены и скидки», «Индекс цены» и «Календарь акций». Веб и адаптив"),
      ("2022 — 2024","1 год 10 месяцев","Medsi Digital","Цифровые сервисы сети клиник МЕДСИ","Телемедицинское приложение SmartMed и веб-сервисы для пациентов и врачей. Собрал и вёл дизайн-команду"),
      ("2021 — 2022","1 год 3 месяца","СберПраво","Онлайн-сервис юридической помощи Сбера","Сайт, личный кабинет и приложения для iOS и Android. Профиль заказчика, исполнителя и админа"),
      ("2020 — 2021","1 год 1 месяц","Банк ВТБ","Платформа онлайн-банкинга для юрлиц","Веб-интерфейсы интернет-банка для бизнеса"),
      ("2019 — 2020","1 год","Локо Банк","Мобильный банк для юрлиц","Приложение для iOS и Android"),
      ("2017 — 2018","1 год 9 месяцев","ZephyrLAB","Дизайн-студия","Мобильные приложения, сайты, админки и лендинги"),
      ("2016 — 2017","11 месяцев","Фриланс","Дизайн-студии","Дизайнерское образование и первые коммерческие проекты")],
"en":[("2024 — Now","2 yrs 3 mos","Wildberries","The largest marketplace in Russia","Seller Portal. I design Prices & discounts, Price index and the Promotions calendar. Web and responsive"),
      ("2022 — 2024","1 yr 10 mos","Medsi Digital","Digital services of MEDSI clinics","SmartMed telemedicine app and web services for patients and doctors. Built and led the design team"),
      ("2021 — 2022","1 yr 3 mos","SberPravo","Sber’s online legal assistance service","Website, account and iOS and Android apps. Client, contractor and admin profiles"),
      ("2020 — 2021","1 yr 1 mo","VTB Bank","Online banking platform for legal entities","Web interfaces of the business online bank"),
      ("2019 — 2020","1 yr","Loko Bank","Mobile bank for legal entities","iOS and Android app"),
      ("2017 — 2018","1 yr 9 mos","ZephyrLAB","Design studio","Mobile apps, websites, admin panels and landing pages"),
      ("2016 — 2017","11 mos","Freelance","Design studios","Design education and first commercial projects")]}
LBL={"ru":{"res":"Результаты","port":"Портфолио","mail":"Почта","edu":"Образование","sk":"Навыки"},
     "en":{"res":"Results","port":"Portfolio","mail":"Email","edu":"Education","sk":"Skills"}}
CSS2 = """
@font-face{font-family:G;font-weight:600;src:url(%sgolos-text-cyrillic-600-normal.woff2);unicode-range:U+0400-045F,U+2116}
@font-face{font-family:G;font-weight:600;src:url(%sgolos-text-latin-600-normal.woff2)}
@page{size:A4;margin:12mm 14mm 10mm}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:G,sans-serif;color:#131316;font-size:9.4pt;line-height:1.42;-webkit-font-smoothing:antialiased}
h1{font-size:24pt;font-weight:600;letter-spacing:-.02em;line-height:1.1}
.title{font-size:12pt;font-weight:500;margin-top:6px}
.sum{margin-top:8px;font-size:10pt;line-height:1.45;max-width:92%}
.ct{display:flex;gap:26px;margin-top:12px}
.ct span{display:block;color:#6C6C74;font-size:8.4pt}
.ct a{color:#131316;text-decoration:none}
.rows{margin-top:6px}
.row{display:grid;grid-template-columns:24% 1fr;gap:0 16px;margin-top:16px;break-inside:avoid}
.l b{display:block;font-weight:600}
.l span{color:#6C6C74}
.co b{font-weight:600}
.co i{font-style:normal;color:#9A9AA2;margin:0 7px}
.role{font-weight:500;margin-top:3px}
.about{margin-top:5px}
.lbl{font-weight:500;margin-top:7px}
ul{list-style:none;margin-top:3px;display:flex;flex-direction:column;gap:2px}
li{position:relative;padding-left:12px}
li::before{content:"•";position:absolute;left:0;color:#6C6C74}
.sec p+p{margin-top:1px}
"""
def page2(d, lg):
    e=html.escape
    rows=[]
    for (dt,role,co,bl),(yrs,dur,name,desc,about) in zip(d['jobs'],META[lg]):
        res = ('<p class="lbl">'+LBL[lg]["res"]+'</p><ul>'+''.join("<li>"+e(b)+"</li>" for b in bl)+'</ul>') if bl else ''
        rows.append('<section class="row"><div class="l"><b>'+e(yrs)+'</b><span>'+e(dur)+'</span></div>'
          '<div class="r"><p class="co"><b>'+e(name)+'</b><i>✦</i>'+e(desc)+'</p><p class="role">'+e(role)+'</p><p class="about">'+e(about)+'</p>'+res+'</div></section>')
    edu=''.join("<p>"+e(x)+"</p>" for x in d['edu'])
    L=LBL[lg]
    return ('<!DOCTYPE html><html><head><meta charset="utf-8"><style>'+FONTS.replace('{{','{').replace('}}','}')+(CSS2 % (F,F))+'</style></head><body>'
      '<h1>'+e(d['name'])+'</h1><p class="title">'+e(d['title'])+'</p><p class="sum">'+e(' '.join(d['summary']))+'</p>'
      '<div class="ct">'
      '<div><span>'+L["port"]+'</span><a href="'+SITE+'">'+SITE.replace("https://","")+'</a></div>'
      '<div><span>Telegram</span><a href="https://t.me/maksimdesigner">t.me/maksimdesigner</a></div>'
      '<div><span>LinkedIn</span><a href="https://www.linkedin.com/in/maksim-kozheikin/">in/maksim-kozheikin</a></div>'
      '<div><span>'+L["mail"]+'</span><a href="mailto:maksim.kozheikin@gmail.com">maksim.kozheikin@gmail.com</a></div>'
      '</div><div class="rows">'+''.join(rows)+
      '<section class="row"><div class="l"><b>'+L["edu"]+'</b></div><div class="r sec">'+edu+'</div></section>'
      '<section class="row"><div class="l"><b>'+L["sk"]+'</b></div><div class="r">'+e(d['skills'])+'</div></section>'
      '</div></body></html>')
