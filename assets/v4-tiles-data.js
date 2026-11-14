/* ============================================================
   НАСТРОЙКИ ПЛИТОК «РАБОТА + ЖИЗНЬ»
   Этот файл удобно править через CRM: откройте главную с ?crm,
   включите «Работа + Жизнь», меняйте размеры кнопками на плитках
   и нажмите «Скачать v4-tiles-data.js» — скачанный файл положите
   в папку assets вместо этого.

   Сетка — 12 колонок, клетки квадратные.
     w — ширина в клетках (12 — на всю ширину), h — высота в клетках.
     Телефон 2×4, портрет 3×4, квадрат 3×3, альбом 4×3, широкая 6×3.
   img — картинка из assets (необязательно). Каждая картинка — отдельная плитка.
   fit — "cover" (заполнить, по умолчанию) или "contain" (вписать целиком).

   Пример — керамика с двумя работами:
     ceramics:[{w:3,h:4,img:"assets/ceramics-1.webp"},{w:3,h:4,img:"assets/ceramics-2.webp"}],
============================================================ */
const V4_TILES = {
  medsi:[{w:12,h:6,img:"assets/ru-medsi-One-visual-style.webp",fit:"contain"}],
  "w:medsi-app":[{w:4,h:5,video:"assets/medsi/diagnostics-loop-restored-time.mp4",poster:"assets/medsi/diagnostics-loop-approved-poster.jpg"}],
  "w:medsi-cab":[{w:8,h:5,video:"assets/medsi/schedule-loop.mp4?v=in-window-notices",videoMobile:"assets/medsi/schedule-loop-720.mp4?v=in-window-notices",poster:"assets/medsi/schedule-loop-poster.png?v=in-window-notices"}],
  "w:medsi-ehr":[{w:12,h:7,video:"assets/medsi/ehr-motion-preview.mp4?v=visit-notes",poster:"assets/medsi/ehr-motion-poster.jpg"}],
  "w:sber-app":[{w:8,h:5,motion:"sber-app"}],
  "w:sber-search":[{w:4,h:5,motion:"sber-search",video:"assets/sber/chat-typing-bubble-loop.mp4",poster:"assets/sber/chat-typing-bubble-poster.png"}],
  "w:sber-video":[{w:12,h:7,video:"assets/sberlegal-demo-720.mp4",poster:"assets/sberlegal-demo-poster.jpg"}]
};

/* ============================================================
   ПЛИТКИ ВКЛАДКИ «РАБОТА» — по порядку, как на главной.
   id — ключ для размеров и картинок в V4_TILES (пишется с «w:»,
   например V4_TILES["w:wb-promo"] = [{w:6,h:4,img:"assets/…"}]).
   co — компания (видна при наведении сверху), ti — название плитки,
   href — куда ведёт (кейс и раздел внутри него).
============================================================ */
const V4_WORK_TILES = [
  {id:"medsi-cab",   co:"Medsi",       ti:{ru:"Расписание",en:"Schedule"},                 href:"case-medsi.html#schedule"},
  {id:"medsi-ehr",   co:"Medsi",       ti:{ru:"Запись о приёме в ЭМК",en:"Visit note in the EHR"}, href:"case-medsi.html#dashboard"},
  {id:"sber-video", co:{ru:"СберПраво",en:"SberPravo"}, ti:{ru:"Как проходит заказ",en:"How an order works"}, href:"case-sberpravo.html#video"},
  {id:"wb-promo",    co:"Wildberries", ti:{ru:"Акции WB",en:"WB promotions"},           href:"case-rwb.html#wbpromo"},
  {id:"wb-seller",   co:"Wildberries", ti:{ru:"Акции селлера",en:"Seller promotions"},  href:"case-rwb.html#sellerpromo"},
  {id:"wb-prices",   co:"Wildberries", ti:{ru:"Цены и скидки",en:"Prices and discounts"}, href:"case-rwb.html#prices"},
  {id:"medsi-app",   co:"Medsi",       ti:{ru:"Запись на диагностику",en:"Booking a diagnostic exam"}, href:"case-medsi.html#flow"},
  {id:"medsi-doctor",co:"Medsi",       ti:{ru:"Выбор врача",en:"Choosing a doctor"},     href:"case-medsi.html#doctor"},
  {id:"medsi-pharm", co:"Medsi",       ti:{ru:"Аптека",en:"Pharmacy"},                   href:"case-medsi.html#pharmacy"},
  {id:"sber-menu",   co:{ru:"СберПраво",en:"SberPravo"},   ti:{ru:"Меню и заказы",en:"Menu and orders"},     href:"case-sberpravo.html#menu"},
  {id:"sber-flow",   co:{ru:"СберПраво",en:"SberPravo"},   ti:{ru:"Путь юзера",en:"User flow"},              href:"case-sberpravo.html#flow"},
  {id:"sber-landing",co:{ru:"СберПраво",en:"SberPravo"},   ti:{ru:"Лендинг",en:"Landing"},                   href:"case-sberpravo.html#landing"},
  {id:"sber-app",    co:{ru:"СберПраво",en:"SberPravo"},   ti:{ru:"Приложение",en:"App"},                    href:"case-sberpravo.html#app"},
  {id:"vtb",         co:{ru:"ВТБ Банк",en:"VTB Bank"},    ti:{ru:"ВТБ Банк",en:"VTB Bank"},                 href:"case-vtb.html"},
  {id:"loko",        co:{ru:"Локо Банк",en:"Loko Bank"},   ti:{ru:"Локо Банк",en:"Loko Bank"},               href:"case-loko.html"},
  {id:"zephyr-1",    co:"ZephyrLab",   ti:{ru:"ZephyrLab",en:"ZephyrLab"},               href:"case-zephyr.html"},
  {id:"zephyr-2",    co:"ZephyrLab",   ti:{ru:"ZephyrLab",en:"ZephyrLab"},               href:"case-zephyr.html"},
  {id:"zephyr-3",    co:"ZephyrLab",   ti:{ru:"ZephyrLab",en:"ZephyrLab"},               href:"case-zephyr.html"},
  {id:"freelance-1", co:{ru:"Фриланс",en:"Freelance"},     ti:{ru:"Фриланс",en:"Freelance"},                 href:"life.html?id=freelance"},
  {id:"edu-1",       co:{ru:"Обучение",en:"Education"},    ti:{ru:"Обучение",en:"Education"},                href:"life.html?id=education"},
  {id:"sber-search", co:{ru:"СберПраво",en:"SberPravo"},   ti:{ru:"Чат с юристом",en:"Chat with a lawyer"},     href:"case-sberpravo.html#flow-design"}
];

/* Lead with the MEDSI demos, followed by the SberPravo tiles. */
const V4_TILES_ORDER = {work:["w:medsi-cab:0","w:medsi-app:0","w:medsi-ehr:0","w:sber-video:0","w:sber-app:0","w:sber-search:0"]};
