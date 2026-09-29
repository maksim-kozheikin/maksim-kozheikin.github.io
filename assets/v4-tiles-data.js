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
  "w:medsi-app":[{w:12,h:6,img:"assets/ru-medsi-One-visual-style.webp",fit:"contain"}]
};

/* ============================================================
   ПЛИТКИ ВКЛАДКИ «РАБОТА» — по порядку, как на главной.
   id — ключ для размеров и картинок в V4_TILES (пишется с «w:»,
   например V4_TILES["w:wb-promo"] = [{w:6,h:4,img:"assets/…"}]).
   co — компания (видна при наведении сверху), ti — название плитки,
   href — куда ведёт (кейс и раздел внутри него).
============================================================ */
const V4_WORK_TILES = [
  {id:"wb-promo",    co:"Wildberries", ti:{ru:"Акции WB",en:"WB promotions"},           href:"case-rwb.html#wbpromo"},
  {id:"wb-seller",   co:"Wildberries", ti:{ru:"Акции селлера",en:"Seller promotions"},  href:"case-rwb.html#sellerpromo"},
  {id:"wb-prices",   co:"Wildberries", ti:{ru:"Цены и скидки",en:"Prices and discounts"}, href:"case-rwb.html#prices"},
  {id:"medsi-app",   co:"Medsi",       ti:{ru:"Приложение SmartMed",en:"SmartMed app"},  href:"case-medsi.html#mobile"},
  {id:"medsi-doctor",co:"Medsi",       ti:{ru:"Выбор врача",en:"Choosing a doctor"},     href:"case-medsi.html#doctor"},
  {id:"medsi-pharm", co:"Medsi",       ti:{ru:"Аптека",en:"Pharmacy"},                   href:"case-medsi.html#pharmacy"},
  {id:"medsi-cab",   co:"Medsi",       ti:{ru:"Кабинет врача",en:"Doctor’s workspace"},  href:"case-medsi.html#cabinet"},
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
  {id:"edu-1",       co:{ru:"Обучение",en:"Education"},    ti:{ru:"Обучение",en:"Education"},                href:"life.html?id=education"}
];
