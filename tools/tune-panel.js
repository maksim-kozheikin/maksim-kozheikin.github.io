/* Панель настройки вида. Только для просмотра, на живой сайт не идёт.
   Двигается за шапку. Глазик показывает сайт без настроек для сравнения. Каждый раздел включается своим тумблером.
   Цвета выбираются тремя ползунками (оттенок, насыщенность, яркость) или вводом кода. */
(function(){
  if(document.getElementById("tn"))return;

  var UI_CSS=`
#tn{position:fixed;right:14px;bottom:14px;z-index:9999;width:316px;max-height:calc(100vh - 28px);display:flex;flex-direction:column;border-radius:16px;background:rgba(24,24,28,.97);color:#f2f2f4;font:12.5px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.45),0 0 0 1px rgba(255,255,255,.08);overflow:hidden}
#tn *{box-sizing:border-box}
#tn .hd{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 10px 10px 14px;cursor:grab;touch-action:none;user-select:none;flex:none}
#tn .hd.drag{cursor:grabbing}
#tn .hd b{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:650;letter-spacing:.01em}
#tn .grip{width:10px;height:14px;opacity:.45;background:radial-gradient(circle,#fff 1.2px,transparent 1.5px) 0 0/5px 5px}
#tn .ib{width:30px;height:30px;padding:0;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:9px;background:rgba(255,255,255,.1);color:#fff;cursor:pointer}
#tn .ib:hover{background:rgba(255,255,255,.2)}
#tn .ib.act{background:#fff;color:#111}
#tn .hr{display:flex;align-items:center;gap:6px}
#tn .body{overflow:auto;padding:0 12px 12px;flex:1 1 auto;min-height:0}
#tn.min .body{display:none}
#tn.cmp .body{opacity:.45}
#tn .note{margin:0 0 8px;padding:6px 9px;border-radius:8px;background:rgba(255,200,60,.14);color:#ffd77a;font-size:11.5px;display:none}
#tn.cmp .note{display:block}
#tn .sec{margin-top:8px;padding:10px 10px 8px;border-radius:12px;background:rgba(255,255,255,.05)}
#tn .sh{display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;user-select:none}
#tn .sh b{font-size:12.5px;font-weight:650}
#tn .sec.off .sh b{opacity:.5}
#tn .sec.off .sb{display:none}
#tn .rs{padding:3px 8px;border:0;border-radius:7px;background:transparent;color:rgba(255,255,255,.6);font:inherit;font-size:11px;cursor:pointer}
#tn .rs:hover{background:rgba(255,255,255,.12);color:#fff}
#tn .sb{padding-top:4px}
#tn .rg{margin-top:8px}
#tn .rl{display:flex;align-items:center;gap:6px}
#tn .rl span{flex:1;color:rgba(255,255,255,.82)}
#tn .rl em{font-style:normal;color:rgba(255,255,255,.45);font-size:11px;min-width:16px}
#tn input.num{width:58px;padding:3px 6px;border:0;border-radius:6px;background:rgba(255,255,255,.1);color:#fff;font:12px ui-monospace,monospace;text-align:right;-moz-appearance:textfield}
#tn input.num::-webkit-outer-spin-button,#tn input.num::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
#tn input[type=range]{-webkit-appearance:none;appearance:none;display:block;width:100%;height:18px;margin:2px 0 0;background:transparent;cursor:pointer}
#tn input[type=range]::-webkit-slider-runnable-track{height:4px;border-radius:2px;background:rgba(255,255,255,.2)}
#tn input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;margin-top:-5px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.5)}
#tn input[type=range]::-moz-range-track{height:4px;border-radius:2px;background:rgba(255,255,255,.2)}
#tn input[type=range]::-moz-range-thumb{width:14px;height:14px;border:0;border-radius:50%;background:#fff}
#tn .cr{display:flex;align-items:center;gap:8px;margin-top:8px}
#tn .cr span{flex:1;color:rgba(255,255,255,.82)}
#tn .sat{width:34px;height:24px;padding:0;border-radius:7px;border:1px solid rgba(255,255,255,.3);cursor:pointer}
#tn input[type=text]{width:78px;padding:4px 6px;border:0;border-radius:6px;background:rgba(255,255,255,.1);color:#fff;font:12px ui-monospace,monospace}
#tn .ed{display:none;margin-top:6px;padding:8px 8px 2px;border-radius:9px;background:rgba(0,0,0,.28)}
#tn .ed.open{display:block}
#tn .ed label{display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.65)}
#tn .ed input[type=range]{height:14px;border-radius:7px;margin:3px 0 8px;border:1px solid rgba(255,255,255,.22)}
#tn .ed input[type=range]::-webkit-slider-runnable-track{height:12px;background:transparent}
#tn .ed input[type=range]::-webkit-slider-thumb{width:16px;height:16px;margin-top:-2px;border:2px solid #222}
#tn .ed input[type=range]::-moz-range-track{height:12px;background:transparent}
#tn .ed input[type=range]::-moz-range-thumb{width:12px;height:12px;border:2px solid #222}
#tn .kr{display:flex;align-items:center;justify-content:space-between;margin-top:8px;color:rgba(255,255,255,.82)}
#tn .hint{margin-top:8px;font-size:11px;color:rgba(255,255,255,.5);line-height:1.35}
#tn .out{margin-top:10px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.07);font:11.5px/1.45 ui-monospace,monospace;white-space:pre-wrap;color:rgba(255,255,255,.8)}
#tn .ft{display:flex;gap:8px;margin-top:10px}
#tn .btn{flex:1;padding:8px 10px;border:0;border-radius:9px;background:#fff;color:#111;font:inherit;font-weight:600;cursor:pointer}
#tn .btn.ghost{flex:none;background:rgba(255,255,255,.12);color:#fff}
#tn-ov{position:fixed;inset:0;z-index:9990;pointer-events:none}
#tn-ov i{position:fixed;border-radius:3px;box-sizing:border-box}
#tn-ov i.hov{outline:1.5px dashed #ff2d78;background:rgba(255,45,120,.10)}
#tn-ov i.hov.me{outline:2px solid #ff2d78;background:rgba(255,45,120,.22)}
#tn-ov i.sel{outline:1.5px dashed #2d7dff;background:rgba(45,125,255,.10)}
#tn-tip{position:fixed;z-index:9995;max-width:300px;padding:8px 10px;border-radius:9px;background:#18181c;color:#fff;font:11.5px/1.4 system-ui,sans-serif;pointer-events:none;box-shadow:0 6px 20px rgba(0,0,0,.35);display:none}
#tn-tip b{font-size:12px}#tn-tip em{font-style:normal;color:rgba(255,255,255,.6)}
body.tn-insp,body.tn-insp *:not(#tn):not(#tn *){cursor:crosshair!important}
#tn .ib.insp-on{background:#ff2d78;color:#fff}
#tn .ic{margin-top:8px;padding:10px;border-radius:12px;background:rgba(255,45,120,.13);box-shadow:inset 0 0 0 1px rgba(255,45,120,.4)}
#tn .ic .ih{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
#tn .ic .ih b{font-size:12.5px;line-height:1.3}
#tn .ic .is{margin-top:4px;color:rgba(255,255,255,.65);font-size:11px;line-height:1.35}
#tn .ic .kr span{font-size:11.5px;padding-right:8px}
#tn .gl{display:flex;align-items:center;gap:8px;width:100%;margin-top:4px;padding:6px 8px;border:0;border-radius:8px;background:rgba(255,255,255,.06);color:#fff;font:inherit;text-align:left;cursor:pointer}
#tn .gl:hover{background:rgba(255,255,255,.14)}
#tn .gl i{flex:none;width:14px;height:14px;border-radius:50%;border:1px solid rgba(255,255,255,.35)}
#tn .gl span{flex:1;min-width:0}
#tn .gl em{font-style:normal;color:rgba(255,255,255,.55);font-size:11px}
#tn .segb{display:flex;flex-wrap:wrap;gap:4px;margin-top:8px}
#tn .segb button{min-width:34px;padding:6px 10px;border:0;border-radius:8px;background:rgba(255,255,255,.12);color:#fff;font:inherit;font-weight:600;cursor:pointer}
#tn .segb button:hover{background:rgba(255,255,255,.22)}
#tn .segb button.on{background:#fff;color:#111}
#tn-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(12px);z-index:9996;max-width:min(92vw,420px);padding:10px 14px;border-radius:12px;background:#18181c;color:#fff;font:13px/1.4 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.35);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}
#tn-toast.on{opacity:1;transform:translateX(-50%) translateY(0)}
#tn select.sel{width:170px;padding:6px 8px;border:0;border-radius:8px;background:rgba(255,255,255,.12);color:#fff;font:inherit;cursor:pointer}
#tn select.sel option{color:#111}
#tn .sw{position:relative;width:34px;height:20px;display:inline-block;flex:none}
#tn .sw input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer;z-index:1}
#tn .sw i{position:absolute;inset:0;background:rgba(255,255,255,.22);border-radius:20px;transition:background .15s}
#tn .sw i::after{content:"";position:absolute;left:2px;top:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s}
#tn .sw input:checked+i{background:#34c759}
#tn .sw input:checked+i::after{transform:translateX(14px)}`;

  var EYE='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>';

  var HTML=`
<div id="tn">
  <div class="hd" id="tn-hd"><b><i class="grip"></i><span id="tn-title">Настройка вида</span></b><span class="hr"><button class="ib" id="tn-insp" title="Инспектор текста. Наведите на текст и увидите, где такой же"></button><button class="ib act" id="tn-eye" title="Сравнить с оригиналом (глазик)"></button><button class="ib" id="tn-min" title="Свернуть"></button></span></div>
  <div class="body" id="tn-body">
    <div class="note">Сейчас показан оригинал сайта без ваших настроек. Нажмите на глазик, чтобы вернуть их.</div>
    <div id="tn-card"></div>
    <div id="tn-secs"></div>
    <div class="out" id="tn-out"></div>
    <div class="ft"><button class="btn" id="tn-copy">Копировать значения</button><button class="btn ghost" id="tn-reset">Сбросить всё</button></div>
  </div>
</div>`;

  var st=document.createElement("style");st.id="tn-ui";st.textContent=UI_CSS;document.head.appendChild(st);
  var cs=document.createElement("style");cs.id="tn-css";document.body.appendChild(cs);
  document.body.insertAdjacentHTML("beforeend",HTML);

  var $=function(i){return document.getElementById(i)};
  var store=function(k,v){try{localStorage.setItem(k,v)}catch(e){}};
  var load=function(k){try{return localStorage.getItem(k)}catch(e){return null}};

  /* типы. c цвет, r ползунок [мин, макс, шаг, ед.], k галочка. o значение тумблера раздела по умолчанию */
  var SEC=[
   {id:"tg",t:"Теги под заголовком",o:true,c:[
    {k:"tgv",l:"Вариант",y:"s",seg:1,d:"0",opts:[["0","Как на сайте (плашки)","Плашки"],["1","Серый текст в одну строку через точку","Серый через точку"],["2","Дата тёмная, остальное серое, через точку","Дата тёмная"],["3","Весь текст тёмный, точки серые","Тёмный"],["4","Мелкие заглавные буквы через точку","Заглавные"],["5","Звёздочки ✦ вместо точек","Звёздочки"],["6","Серый текст между двумя тонкими линиями","Между линиями"]]}],
    h:"Дата, сфера и «Работа» под заголовком страницы. Вместо плашек, которые похожи на кнопки, обычный текст в одну строку."},
   {id:"selrow",t:"Выбранная строка слева",o:true,c:[
    {k:"selv",l:"Вариант",y:"s",seg:1,d:"0",opts:[["0","Как на сайте (подложка и средний текст)","Как на сайте"],["7","Без выделения (как было раньше)","Без выделения"],["1","Жирный текст (600)","Жирный"],["2","Подложка без жирного текста","Подложка"],["3","Средний текст (500)","Средний"],["4","Подложка и средний текст (500)","Подложка + средний"],["5","Черточка в начале строки в цвет подложки","Черточка"],["6","Градиент от начала строки в цвет подложки","Градиент"]]}],
    h:"Как отмечена строка выбранной вкладки в списке слева. Работает на «Жизни» и на страницах кейсов."},
   {id:"site",t:"Цвета сайта",o:true,c:[
    {k:"bg",l:"Фон сайта",y:"c",d:"#FDFCFC"},{k:"surface",l:"Белый (карточки, выбранный таб)",y:"c",d:"#F4EFEC"},
    {k:"sel",l:"Серый в переключателях, кнопках и тегах",y:"c",d:"#F4EFEC"},{k:"tabon",l:"Выбранный таб (Работа, Ру)",y:"c",d:"#FDFCFC"},{k:"line",l:"Линии и границы",y:"c",d:"#DFDBD8"},
    {k:"ac",l:"Акцентный цвет",y:"c",d:"#161413"},
    {k:"live",l:"Пульсирующая точка",y:"c",d:"#916D50"}],
    h:"Акцент красит маркеры, ссылки в тексте и активные пункты. Точка стоит у текущей работы."},
   {id:"bh",t:"Кнопки в покое и при наведении",o:true,c:[
    {k:"bnb",l:"Обычная кнопка. Фон",y:"c",d:"#F4EFEC"},
    {k:"btn",l:"Обычная кнопка. Текст",y:"c",d:"#161413"},
    {k:"bhc",l:"Обычная при наведении. Фон",y:"c",d:"#E5D9D2"},
    {k:"bhf",l:"Обычная при наведении. Текст",y:"c",d:"#161413"},
    {k:"dlb",l:"Чёрная («Скачать CV»). Фон",y:"c",d:"#161413"},
    {k:"dlf",l:"Чёрная. Текст",y:"c",d:"#FFFFFF"},
    {k:"dlbh",l:"Чёрная при наведении. Фон",y:"c",d:"#916D50"},
    {k:"dlfh",l:"Чёрная при наведении. Текст",y:"c",d:"#FDFCFC"}],
    h:"Обычные кнопки — cv, email, tg, linkedin, «Показать ещё», стрелки «↑ Все проекты» и «↓ следующий проект». Текст кнопок общий с текстом тегов."},
   {id:"sep",t:"Черты между блоками",o:true,c:[
    {k:"sepm",l:"Как линии в меню слева",y:"k",d:true},
    {k:"sepc",l:"Цвет черты",y:"c",d:"#161413"},
    {k:"sepw",l:"Толщина черты",y:"r",m:[1,8,1,"px"],d:4},
    {k:"sepr",l:"Скруглённые концы",y:"k",d:true}],
    h:"Черты между большими блоками на странице работы. Сейчас на сайте они тонкие, как линии в меню слева. Выключите переключатель, чтобы задать свой цвет и толщину."},
   {id:"star",t:"Звёздочки ✦ в списках",o:false,c:[
    {k:"star",l:"Цвет звёздочки",y:"c",d:"#916D50"}],
    h:"Пока выключено, звёздочки такого цвета, как на сайте. Включите, чтобы попробовать другой."},
   {id:"tx",t:"Цвета текста",o:true,c:[
    {k:"ink",l:"Основной текст и заголовки",y:"c",d:"#161413"},
    {k:"muted",l:"Серый текст (абзацы, подписи)",y:"c",d:"#6F655D"}],
    h:"Два цвета текста. Основной и серый. Цвет текста кнопок и тегов настраивается в разделе про кнопки. Годы, номера и подписи слева это серый."},
   {id:"fs",t:"Размеры текста",o:false,c:[
    {k:"tdisplay",l:"Display (имя, заголовок)",y:"r",m:[28,72,1,"px"],d:46},
    {k:"ttitle",l:"Title (заголовок раздела)",y:"r",m:[18,40,1,"px"],d:26},
    {k:"tbody",l:"Body (основной текст)",y:"r",m:[14,20,1,"px"],d:16},
    {k:"tsmall",l:"Small (вторичный)",y:"r",m:[11,18,1,"px"],d:14},
    {k:"tcaption",l:"Caption (теги, подписи)",y:"r",m:[10,16,1,"px"],d:14}],
    h:"Меняет размеры везде, где текст использует эти пять размеров. Отдельные стили настраиваются инспектором."},
   {id:"ring",t:"Рамка у кнопок",o:true,c:[
    {k:"ringc",l:"Цвет рамки",y:"c",d:"#FDFCFC"},
    {k:"ringw",l:"Толщина",y:"r",m:[0,4,.5,"px"],d:1.5}],
    h:"Тонкий ободок вокруг кнопок. Он нужен, чтобы кнопка не терялась, когда попадает на подложку под картинкой."},
   {id:"lb",t:"Режим просмотра картинок",o:true,c:[
    {k:"lbbg",l:"Цвет фона",y:"c",d:"#161413"},
    {k:"lbba",l:"Плотность фона",y:"r",m:[50,100,1,"%"],d:94},
    {k:"lbfg",l:"Цвет кнопок и подписей",y:"c",d:"#F4EFEC"}],
    h:"Окно, которое открывается по клику на картинку. Кнопки и подписи используют один цвет с разной прозрачностью."},
   {id:"pl",t:"Подложка под картинками",o:true,c:[
    {k:"pbg",l:"Фон подложки",y:"c",d:"#F4EFEC"},
    {k:"r",l:"Скругление подложки",y:"r",m:[0,40,1,"px"],d:40},{k:"p",l:"Отступ внутри подложки",y:"r",m:[0,48,1,"px"],d:48}]},
   {id:"sh0",t:"Тень картинок в покое",o:true,c:[
    {k:"sc",l:"Цвет тени",y:"c",d:"#916D50"},
    {k:"y0",l:"Смещение вниз",y:"r",m:[0,40,.5,"px"],d:5},{k:"b0",l:"Размытие",y:"r",m:[0,60,.5,"px"],d:10},{k:"a0",l:"Сила тени",y:"r",m:[0,40,.5,"%"],d:10}]},
   {id:"sh1",t:"Картинки при наведении",o:true,c:[
    {k:"lift",l:"Насколько поднимается",y:"r",m:[0,20,.5,"px"],d:1},{k:"scale",l:"Увеличение",y:"r",m:[0,6,.5,"%"],d:0},
    {k:"y1",l:"Смещение тени вниз",y:"r",m:[0,60,.5,"px"],d:10},{k:"b1",l:"Размытие тени",y:"r",m:[0,80,.5,"px"],d:15},{k:"a1",l:"Сила тени",y:"r",m:[0,60,.5,"%"],d:15},
    {k:"dur",l:"Скорость анимации",y:"r",m:[0,800,10,"мс"],d:200}],
    h:"Цвет тени берётся из раздела «Тень в покое»."},
   {id:"bd",t:"Рамка и углы картинки",o:false,c:[
    {k:"bw",l:"Толщина рамки",y:"r",m:[0,4,.5,"px"],d:1},{k:"bc",l:"Цвет рамки",y:"c",d:"#000000"},
    {k:"ba",l:"Прозрачность рамки",y:"r",m:[0,100,1,"%"],d:10},{k:"ir",l:"Скругление картинки",y:"r",m:[0,32,1,"px"],d:0}]},
   {id:"nz",t:"Шум на всей странице",o:false,c:[
    {k:"nn",l:"Сила шума",y:"r",m:[0,40,1,"%"],d:12},{k:"nz",l:"Размер зерна",y:"r",m:[60,400,10,"px"],d:160}]}
  ];
  var DEF={};
  SEC.forEach(function(s){DEF["o_"+s.id]=s.o;s.c.forEach(function(c){DEF[c.k]=c.d})});
  var OVR={};try{OVR=JSON.parse(load("tn-ovr2"))||{}}catch(e){}
  var BUILD="31 окт 10";
  var KEY="tn-v27";
  var EN=load("tn-en")!=="0";
  var S;try{S=JSON.parse(load(KEY))}catch(e){}; S=Object.assign({},DEF,S||{});

  /* ——— цвет ——— */
  function ok(h){return /^#[0-9a-fA-F]{6}$/.test(h)}
  function rgb(h){return [1,3,5].map(function(i){return parseInt(h.substr(i,2),16)})}
  function rgba(h,a){var c=rgb(h);return "rgba("+c[0]+","+c[1]+","+c[2]+","+(a/100)+")"}
  function hex2hsl(h){
    var c=rgb(h).map(function(v){return v/255}),mx=Math.max(c[0],c[1],c[2]),mn=Math.min(c[0],c[1],c[2]),l=(mx+mn)/2,d=mx-mn,hh=0,ss=0;
    if(d){ss=d/(1-Math.abs(2*l-1));
      if(mx===c[0])hh=((c[1]-c[2])/d)%6;else if(mx===c[1])hh=(c[2]-c[0])/d+2;else hh=(c[0]-c[1])/d+4;
      hh*=60;if(hh<0)hh+=360}
    return [Math.round(hh),Math.round(ss*100),Math.round(l*100)];
  }
  function hsl2hex(h,s,l){
    s/=100;l/=100;
    var k=function(n){return (n+h/30)%12},a=s*Math.min(l,1-l);
    var f=function(n){var v=l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));var x=Math.round(v*255);return (x<16?"0":"")+x.toString(16)};
    return ("#"+f(0)+f(8)+f(4)).toUpperCase();
  }
  function noise(a){
    var svg="<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 "+a+" 0'/></filter><rect width='160' height='160' filter='url(#n)'/></svg>";
    return "url(\"data:image/svg+xml,"+encodeURIComponent(svg)+"\")";
  }

  /* ——— разметка разделов ——— */
  var HSL={};
  var h="";
  SEC.forEach(function(s){
    h+='<section class="sec" data-s="'+s.id+'"><div class="sh"><b>'+s.t+'</b><span class="hr"><button class="rs" data-rs="'+s.id+'" title="Вернуть значения этого раздела">Сброс</button><label class="sw"><input type="checkbox" id="tn-o-'+s.id+'"><i></i></label></span></div><div class="sb">';
    s.c.forEach(function(c){
      if(c.y==="c"){
        h+='<div class="cr"><span>'+c.l+'</span><button class="sat" id="tn-s-'+c.k+'" title="Подобрать цвет"></button><input id="tn-t-'+c.k+'" type="text" maxlength="7"></div>'+
           '<div class="ed" id="tn-e-'+c.k+'">'+
           '<label>Оттенок <b id="tn-hv-'+c.k+'-0"></b></label><input id="tn-h-'+c.k+'-0" type="range" min="0" max="360" step="1">'+
           '<label>Насыщенность <b id="tn-hv-'+c.k+'-1"></b></label><input id="tn-h-'+c.k+'-1" type="range" min="0" max="100" step="1">'+
           '<label>Яркость <b id="tn-hv-'+c.k+'-2"></b></label><input id="tn-h-'+c.k+'-2" type="range" min="0" max="100" step="1"></div>';
      } else if(c.y==="k"){
        h+='<div class="kr"><span>'+c.l+'</span><label class="sw"><input type="checkbox" id="tn-c-'+c.k+'"><i></i></label></div>';
      } else if(c.y==="s"&&c.seg){
        h+='<div class="segw"><div class="segb" id="tn-c-'+c.k+'">'+c.opts.map(function(o){return '<button type="button" data-v="'+o[0]+'" title="'+o[1]+'">'+(o[2]||o[0])+'</button>'}).join("")+'</div><div class="hint" id="tn-selname" style="margin-top:6px"></div></div>';
      } else if(c.y==="s"){
        h+='<div class="cr"><span>'+c.l+'</span><select class="sel" id="tn-c-'+c.k+'">'+c.opts.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>'}).join("")+'</select></div>';
      } else {
        h+='<div class="rg"><div class="rl"><span>'+c.l+'</span><input class="num" id="tn-n-'+c.k+'" type="number" min="'+c.m[0]+'" max="'+c.m[1]+'" step="'+c.m[2]+'"><em>'+c.m[3]+'</em></div><input id="tn-c-'+c.k+'" type="range" min="'+c.m[0]+'" max="'+c.m[1]+'" step="'+c.m[2]+'"></div>';
      }
    });
    if(s.h)h+='<div class="hint">'+s.h+'</div>';
    h+='</div></section>';
  });
  $("tn-secs").innerHTML=h;

  function paintEd(k){
    var v=HSL[k];
    $("tn-s-"+k).style.background=S[k];
    $("tn-t-"+k).value=S[k];
    for(var i=0;i<3;i++){$("tn-h-"+k+"-"+i).value=v[i];$("tn-hv-"+k+"-"+i).textContent=v[i]+(i?"%":"°")}
    $("tn-h-"+k+"-0").style.background="linear-gradient(90deg,hsl(0,"+v[1]+"%,"+v[2]+"%),hsl(60,"+v[1]+"%,"+v[2]+"%),hsl(120,"+v[1]+"%,"+v[2]+"%),hsl(180,"+v[1]+"%,"+v[2]+"%),hsl(240,"+v[1]+"%,"+v[2]+"%),hsl(300,"+v[1]+"%,"+v[2]+"%),hsl(360,"+v[1]+"%,"+v[2]+"%))";
    $("tn-h-"+k+"-1").style.background="linear-gradient(90deg,hsl("+v[0]+",0%,"+v[2]+"%),hsl("+v[0]+",100%,"+v[2]+"%))";
    $("tn-h-"+k+"-2").style.background="linear-gradient(90deg,#000,hsl("+v[0]+","+v[1]+"%,50%),#fff)";
  }
  function sync(){
    SEC.forEach(function(s){
      $("tn-o-"+s.id).checked=!!S["o_"+s.id];
      document.querySelector('[data-s="'+s.id+'"]').classList.toggle("off",!S["o_"+s.id]);
      s.c.forEach(function(c){
        if(c.y==="c"){HSL[c.k]=hex2hsl(S[c.k]);paintEd(c.k)}
        else if(c.y==="k")$("tn-c-"+c.k).checked=!!S[c.k];
        else if(c.y==="s"&&c.seg){[].forEach.call($("tn-c-"+c.k).children,function(b){b.classList.toggle("on",b.getAttribute("data-v")===String(S[c.k]))})}
        else if(c.y==="s")$("tn-c-"+c.k).value=S[c.k];
        else{$("tn-c-"+c.k).value=S[c.k];$("tn-n-"+c.k).value=S[c.k]}
      });
    });
  }

  /* ——— CSS страницы ——— */
  /* кнопки и ссылки, табы и подписи без действия. С ними стекло ведёт себя по-разному */
  var BUTTONS=[".back",".v4close",".duties-more",".v4step",".side-links a",".chip-btn",".dl-btn",".foot a",".case-link",".toggle",".life-tag"];
  var TABS=[".segmented button",".lang button"];
  function pills(list,suf){return list.map(function(x){return "html body "+x+(suf||"")}).join(",")}
  var CALM=':not(:hover):not([aria-pressed="true"])';
  function build(){
    var c="";
    var vars=[];
    if(S.o_site)vars.push("--bg:"+S.bg,"--surface:"+S.surface,"--sel:"+S.sel,"--tab-on:"+S.tabon,"--line:"+S.line,"--accent:"+S.ac,"--live:"+S.live);
    if(S.o_tx)vars.push("--ink:"+S.ink,"--muted:"+S.muted,"--faint:"+S.muted);
    if(S.o_fs){
      var cl=function(v){return "clamp("+Math.round(v*.7)+"px,"+(v*.0696).toFixed(2)+"vw,"+v+"px)"};
      vars.push("--t-display:"+cl(S.tdisplay),"--t-title:"+cl(S.ttitle),"--t-body:"+S.tbody+"px","--t-small:"+S.tsmall+"px","--t-caption:"+S.tcaption+"px");
    }
    vars.push("--btn-ring:"+S.ringc,"--btn-ring-w:"+(S.o_ring?S.ringw:0)+"px");
    if(S.o_lb)vars.push("--lb-bg:"+rgba(S.lbbg,S.lbba),"--lb-fg:"+S.lbfg,"--lb-fg-soft:"+rgba(S.lbfg,85),"--lb-fg-dim:"+rgba(S.lbfg,50),"--lb-ctl:"+rgba(S.lbfg,14),"--lb-ctl-hover:"+rgba(S.lbfg,26));
    if(S.o_bh)vars.push("--btn-bg:"+S.bnb,"--btn:"+S.btn,"--btn-hover:"+S.bhc,"--btn-hover-fg:"+S.bhf,"--dl-bg:"+S.dlb,"--dl-fg:"+S.dlf,"--dl-bg-hover:"+S.dlbh,"--dl-fg-hover:"+S.dlfh);
    if(vars.length)c+=":root:root{"+vars.join(";")+"}";
    if(S.o_sep){var sw=S.sepm?1:S.sepw,sc2=S.sepm?"var(--line)":S.sepc,sr=S.sepm?0:(S.sepr?Math.ceil(S.sepw/2):0);c+=":root:root .head-sep,:root:root .block.group::before{height:"+sw+"px;background:"+sc2+";border-radius:"+sr+"px}"}
    if(S.o_star)c+=":root:root .points li::before,:root:root .points.cross li::before,:root:root .points.inline li::before,:root:root .duties li::before{color:"+S.star+"}";

    var rest=S.o_sh0?"drop-shadow(0 "+S.y0+"px "+S.b0+"px "+rgba(S.sc,S.a0)+")":"none";
    var hov=S.o_sh1?"drop-shadow(0 "+S.y1+"px "+S.b1+"px "+rgba(S.sc,S.a1)+")":rest;
    var lift=S.o_sh1?S.lift:0,scale=S.o_sh1?S.scale:0,t=S.dur+"ms ease",plate=S.o_pl;
    /* тень, подъём и увеличение только у самой картинки, подложка стоит на месте */
    c+=".figs .fig .fig-btn{background:"+(plate?S.pbg:"none")+";padding:"+(plate?S.p:0)+"px;border-radius:"+(plate?S.r:0)+"px;filter:none;transform:none;transition:none}";
    c+=".figs .fig .fig-btn:hover{transform:none;filter:none}";
    c+=".figs.figs-plate{background:"+(plate?S.pbg:"none")+";padding:"+(plate?S.p:0)+"px;border-radius:"+(plate?S.r:0)+"px}.figs.figs-plate .fig .fig-btn{background:none;padding:0;border-radius:0}";
    if(plate)c+="@media(max-width:640px){.figs.figs-plate{padding:"+Math.min(S.p,20)+"px;border-radius:"+Math.min(S.r,24)+"px}}";
    c+=".figs .fig .fig-btn img{filter:"+rest+";border-radius:"+(S.o_bd?S.ir:0)+"px;transition:transform "+t+",filter "+t+"}";
    c+=".figs .fig .fig-btn:hover img{transform:translateY(-"+lift+"px) scale("+(1+scale/100)+");filter:"+hov+"}";
    if(plate)c+="@media(max-width:640px){.figs .fig .fig-btn{padding:"+Math.min(S.p,20)+"px;border-radius:"+Math.min(S.r,24)+"px}}";
    if(S.o_bd&&S.bw>0)c+=".figs .fig .fig-btn img{outline:"+S.bw+"px solid "+rgba(S.bc,S.ba)+";outline-offset:-"+S.bw+"px}";
    if(S.o_tg&&S.tgv!=="0"){
      var T='html body .v4chips',G=T+' .tag';
      c+=T+"{gap:0;align-items:center;margin-top:16px}";
      c+=G+"{background:none;box-shadow:none;border-radius:0;padding:0;color:var(--muted);font-size:var(--t-small);line-height:1.4;letter-spacing:0;text-transform:none}";
      c+=G+" .exp-eyebrow{font-size:inherit;letter-spacing:inherit;text-transform:inherit}";
      var sep={"1":"•","2":"•","3":"•","4":"•","5":"✦","6":"•"}[S.tgv]||"•";
      c+=G+" + .tag::before{content:'"+sep+"';margin:0 "+(S.tgv==="5"?"12":"10")+"px;color:"+(S.tgv==="5"?"var(--star,#916D50)":"var(--muted)")+";font-size:"+(S.tgv==="5"?".75em":"1em")+";text-transform:none}";
      if(S.tgv==="2")c+=T+" .tag:first-child{color:var(--ink)}";
      if(S.tgv==="3")c+=G+"{color:var(--ink)}"+G+" + .tag::before{color:var(--faint)}";
      if(S.tgv==="4")c+=G+"{text-transform:uppercase;letter-spacing:.08em;font-size:var(--t-caption)}";
      if(S.tgv==="6")c+=T+"{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:12px 0}";
    }
    if(S.o_selrow&&S.selv!=="0"){
      var CUR='html body .sidebar a.row[aria-current="page"]',W={"1":600,"3":500,"4":500};
      /* сначала снимаем выделение, которое уже есть на сайте. Дальше накладывается выбранный вариант */
      c+=CUR+"{background:none;border-radius:0;margin-inline:0;padding-inline:2px;border-top-color:var(--line);border-bottom-color:var(--line)}";
      c+=CUR+" + a.row{border-top-color:var(--line)}";
      c+='html body .sidebar a.row:has(+ a.row[aria-current="page"]){border-bottom-color:var(--line)}';
      c+=CUR+" .row-ti{font-weight:400}";
      c+=CUR+" .tag-kind,"+CUR+" .tag-ai{box-shadow:none}";
      if(W[S.selv])c+=CUR+" .row-ti{font-weight:"+W[S.selv]+"}";
      var geo=CUR+"{border-radius:10px;border-top-color:transparent;border-bottom-color:transparent;margin-inline:-8px;padding-inline:10px";
      if(S.selv==="2"||S.selv==="4")c+=geo+";background:var(--sel)}";
      if(S.selv==="6")c+=geo+";background:linear-gradient(90deg,var(--sel) 0%,transparent 85%)}";
      if(S.selv==="2"||S.selv==="4"||S.selv==="6"){
        c+=CUR+" + a.row{border-top-color:transparent}";
        c+='html body .sidebar a.row:has(+ a.row[aria-current="page"]){border-bottom-color:transparent}';
        c+=CUR+" .tag-kind,"+CUR+" .tag-ai{box-shadow:0 0 0 1.5px var(--bg)}";
      }
      if(S.selv==="5"){
        c+=CUR+"{position:relative}";
        c+=CUR+"::before{content:'';position:absolute;left:-12px;top:6px;bottom:6px;width:3px;border-radius:2px;background:var(--sel)}";
      }
    }
    Object.keys(OVR).forEach(function(k){
      var o=OVR[k],r=[];
      if(o.color)r.push("color:"+o.color+"!important");
      if(o.fs!=null)r.push("font-size:"+o.fs+"px!important");
      if(o.fw)r.push("font-weight:"+o.fw+"!important");
      if(o.ls!=null)r.push("letter-spacing:"+o.ls+"em!important");
      if(r.length){var a='[data-tnk="'+k+'"]';c+="html body "+a+a+a+a+"{"+r.join(";")+"}"}
    });
    if(S.o_nz)c+="body::after{content:'';position:fixed;inset:0;z-index:5000;pointer-events:none;background:"+noise(1)+";background-size:"+S.nz+"px;opacity:"+(S.nn/100)+";mix-blend-mode:overlay}";
    return c;
  }
  function outText(){
    var L=[],on=function(id,txt){return S["o_"+id]?txt:"выкл"};
    L.push("Цвета сайта: "+on("site","фон "+S.bg+", белый "+S.surface+", серый в переключателях "+S.sel+", выбранный таб "+S.tabon+", линии "+S.line+", акцент "+S.ac+", точка "+S.live));
    L.push("Кнопки: "+on("bh","обычная фон "+S.bnb+", текст "+S.btn+"; при наведении фон "+S.bhc+", текст "+S.bhf+"; чёрная фон "+S.dlb+", текст "+S.dlf+"; при наведении фон "+S.dlbh+", текст "+S.dlfh));
    L.push("Черты между блоками: "+on("sep",S.sepm?"как линии в меню слева, 1 px":S.sepc+", "+S.sepw+" px, "+(S.sepr?"скруглённые":"прямые")));
    L.push("Звёздочки: "+on("star",S.star));
    L.push("Цвета текста: "+on("tx","основной "+S.ink+", серый "+S.muted));
    L.push("Рамка у кнопок: "+on("ring",S.ringc+", "+S.ringw+" px"));
    L.push("Режим просмотра: "+on("lb","фон "+S.lbbg+", плотность "+S.lbba+"%, кнопки и подписи "+S.lbfg));
    L.push("Теги под заголовком: "+on("tg",({"0":"как на сайте, плашки","1":"серый текст через точку","2":"дата тёмная, остальное серое","3":"весь текст тёмный","4":"мелкие заглавные","5":"звёздочки между","6":"между двумя линиями"})[S.tgv]));
    L.push("Выбранная строка слева: "+on("selrow",({"0":"как на сайте, подложка и средний текст","7":"без выделения","1":"жирный текст 600","2":"подложка без жирного текста","3":"средний текст 500","4":"подложка и средний текст 500","5":"черточка в начале строки в цвет подложки","6":"градиент от начала строки в цвет подложки"})[S.selv]));
    L.push("Подложка: "+on("pl","фон "+S.pbg+", скругление "+S.r+" px, отступ "+S.p+" px"));
    L.push("Тень в покое: "+on("sh0",S.sc+", вниз "+S.y0+" px, размытие "+S.b0+" px, сила "+S.a0+"%"));
    L.push("При наведении: "+on("sh1","подъём "+S.lift+" px, увеличение "+S.scale+"%, тень вниз "+S.y1+" px, размытие "+S.b1+" px, сила "+S.a1+"%, скорость "+S.dur+" мс"));
    L.push("Рамка и углы: "+on("bd","рамка "+S.bw+" px, "+S.bc+", прозрачность "+S.ba+"%, скругление картинки "+S.ir+" px"));
    L.push("Шум на странице: "+on("nz","сила "+S.nn+"%, зерно "+S.nz+" px"));
    L.push("Размеры текста: "+on("fs","Display "+S.tdisplay+", Title "+S.ttitle+", Body "+S.tbody+", Small "+S.tsmall+", Caption "+S.tcaption+" px"));
    Object.keys(OVR).forEach(function(k){
      var o=OVR[k],a=[];
      if(o.color)a.push("цвет "+o.color);if(o.fs!=null)a.push("размер "+o.fs+" px");if(o.fw)a.push("вес "+o.fw);if(o.ls!=null)a.push("межбуквенное "+o.ls+" em");
      if(a.length)L.push("Стиль «"+(o.n||k)+"»: "+a.join(", "));
    });
    return L.join("\n");
  }
  function apply(){
    document.body.appendChild($("tn-css"));
    $("tn-css").textContent=EN?build():"";
    $("tn-out").textContent=outText();
    var nmEl=$("tn-selname");
    if(nmEl){var f=SEC.filter(function(x){return x.id==="selrow"})[0].c[0].opts.filter(function(o){return o[0]===String(S.selv)})[0];nmEl.textContent=f?f[1]:""}
    store(KEY,JSON.stringify(S));
    store("tn-ovr2",JSON.stringify(OVR));
  }

  /* ——— события разделов ——— */
  SEC.forEach(function(s){
    var sec=document.querySelector('[data-s="'+s.id+'"]'),sh=sec.querySelector(".sh"),tg=$("tn-o-"+s.id);
    tg.addEventListener("change",function(){S["o_"+s.id]=this.checked;sec.classList.toggle("off",!this.checked);apply()});
    sh.addEventListener("click",function(e){
      if(e.target.closest(".sw"))return;
      if(e.target.closest(".rs")){s.c.forEach(function(c){S[c.k]=DEF[c.k]});S["o_"+s.id]=DEF["o_"+s.id];sync();apply();return}
      tg.click();
    });
    s.c.forEach(function(c){
      var k=c.k;
      if(c.y==="r"){
        var rg=$("tn-c-"+k),nm=$("tn-n-"+k);
        rg.addEventListener("input",function(){S[k]=+this.value;nm.value=S[k];apply()});
        nm.addEventListener("input",function(){
          var v=parseFloat(this.value);if(isNaN(v))return;
          v=Math.min(c.m[1],Math.max(c.m[0],v));S[k]=v;rg.value=v;apply();
        });
      }
      else if(c.y==="k"){$("tn-c-"+k).addEventListener("change",function(){S[k]=this.checked;apply()})}
      else if(c.y==="s"&&c.seg){$("tn-c-"+k).addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;S[k]=b.getAttribute("data-v");[].forEach.call(this.children,function(x){x.classList.toggle("on",x===b)});apply()})}
      else if(c.y==="s"){$("tn-c-"+k).addEventListener("change",function(){S[k]=this.value;apply()})}
      else{
        $("tn-s-"+k).addEventListener("click",function(){$("tn-e-"+k).classList.toggle("open")});
        $("tn-t-"+k).addEventListener("input",function(){
          var v=this.value.trim();if(v[0]!=="#")v="#"+v;
          if(ok(v)){S[k]=v.toUpperCase();HSL[k]=hex2hsl(S[k]);var keep=this.value;paintEd(k);this.value=keep;apply()}
        });
        for(var i=0;i<3;i++)(function(i){
          $("tn-h-"+k+"-"+i).addEventListener("input",function(){
            HSL[k][i]=+this.value;S[k]=hsl2hex(HSL[k][0],HSL[k][1],HSL[k][2]);paintEd(k);apply();
          });
        })(i);
      }
    });
  });
  $("tn-reset").onclick=function(){S=Object.assign({},DEF);sync();apply()};
  $("tn-copy").onclick=function(){try{navigator.clipboard.writeText($("tn-out").textContent)}catch(e){};var b=this;b.textContent="Скопировано";setTimeout(function(){b.textContent="Копировать значения"},1200)};

  /* ——— шапка. Глазик, сворачивание, перетаскивание ——— */
  var P=$("tn");
  function paintEye(){
    $("tn-eye").innerHTML=EN?EYE:EYE_OFF;
    $("tn-eye").classList.toggle("act",EN);
    $("tn-eye").title=EN?"Показать оригинал сайта для сравнения":"Вернуть мои настройки";
    P.classList.toggle("cmp",!EN);
    $("tn-title").textContent=EN?"Настройка вида · сборка "+BUILD:"Оригинал сайта";
  }
  $("tn-eye").onclick=function(){EN=!EN;store("tn-en",EN?"1":"0");paintEye();apply()};
  var MINI=load("tn-min")==="1"||(load("tn-min")===null&&innerWidth<700);
  function paintMin(){P.classList.toggle("min",MINI);$("tn-min").textContent=MINI?"＋":"—";$("tn-min").title=MINI?"Развернуть":"Свернуть"}
  $("tn-min").onclick=function(){MINI=!MINI;store("tn-min",MINI?"1":"0");paintMin();if(pos)place(pos.x,pos.y)};

  var pos=null;try{pos=JSON.parse(load("tn-pos"))}catch(e){}
  function place(x,y){
    var w=P.offsetWidth;
    x=Math.max(0,Math.min(innerWidth-w,x));y=Math.max(0,Math.min(innerHeight-46,y));
    P.style.left=x+"px";P.style.top=y+"px";P.style.right="auto";P.style.bottom="auto";
    P.style.maxHeight=Math.max(140,innerHeight-y-8)+"px";
    pos={x:x,y:y};
  }
  var hd=$("tn-hd"),drag=null;
  hd.addEventListener("pointerdown",function(e){
    if(e.target.closest("button"))return;
    var r=P.getBoundingClientRect();
    drag={dx:e.clientX-r.left,dy:e.clientY-r.top};
    hd.classList.add("drag");
    try{hd.setPointerCapture(e.pointerId)}catch(x){}
    e.preventDefault();
  });
  hd.addEventListener("pointermove",function(e){if(drag)place(e.clientX-drag.dx,e.clientY-drag.dy)});
  function endDrag(){if(!drag)return;drag=null;hd.classList.remove("drag");if(pos)store("tn-pos",JSON.stringify(pos))}
  hd.addEventListener("pointerup",endDrag);hd.addEventListener("pointercancel",endDrag);
  addEventListener("resize",function(){if(pos)place(pos.x,pos.y)});


  /* ——— инспектор текста ———
     Наводите на текст, подсвечиваются все такие же стили. Клик выбирает стиль, его можно настроить.
     Стиль это размер, вес, цвет, межбуквенное расстояние и регистр. Каждый такой набор получает метку data-tnk. */
  var INSP=false,SEL=null,HOV=null,KEYS={},PR=null,SC=false,SS=false,MX=0,MY=0,HSLI=[0,0,0];
  var SZN={display:"Display",title:"Title",body:"Body",small:"Small",caption:"Caption"};
  var SZT={display:"--t-display",title:"--t-title",body:"--t-body",small:"--t-small",caption:"--t-caption"};
  var CLN={ink:"основной",muted:"серый",accent:"акцент",surface:"белый"};
  var CLT={ink:"--ink",muted:"--muted",accent:"--accent",surface:"--surface"};
  var CL2KEY={ink:"ink",muted:"muted",accent:"ac"};
  var SZ2KEY={display:"tdisplay",title:"ttitle",body:"tbody",small:"tsmall",caption:"tcaption"};
  var WN={"300":"тонкий","400":"обычный","500":"средний","600":"полужирный","700":"жирный","800":"очень жирный"};
  var OV=document.createElement("div");OV.id="tn-ov";document.body.appendChild(OV);
  var TIP=document.createElement("div");TIP.id="tn-tip";document.body.appendChild(TIP);
  function h32(t){var x=5381;for(var i=0;i<t.length;i++)x=((x<<5)+x+t.charCodeAt(i))|0;return "k"+(x>>>0).toString(36)}
  function px1(v){return Math.round(parseFloat(v)*10)/10}
  function rgb2hex(c){var m=c.match(/[\d.]+/g)||[0,0,0];return "#"+m.slice(0,3).map(function(x){x=Math.round(+x);return (x<16?"0":"")+x.toString(16)}).join("").toUpperCase()}
  function probes(){
    var out={fs:{},col:{}},d=document.createElement("div");
    d.style.cssText="position:absolute;visibility:hidden;left:-9999px;top:0";document.body.appendChild(d);
    Object.keys(SZT).forEach(function(k){d.style.fontSize="var("+SZT[k]+")";out.fs[k]=parseFloat(getComputedStyle(d).fontSize)});
    Object.keys(CLT).forEach(function(k){d.style.color="var("+CLT[k]+")";out.col[k]=getComputedStyle(d).color});
    d.remove();return out;
  }
  function describe(cs,pr,el){
    var fs=px1(cs.fontSize),fw=cs.fontWeight,col=cs.color,ls=px1(cs.letterSpacing)||0,sr=null,cr=null,k;
    for(k in pr.fs)if(Math.abs(fs-pr.fs[k])<.6){sr=k;break}
    for(k in pr.col)if(pr.col[k]===col){cr=k;break}
    var al=(col.match(/[\d.]+/g)||[]);
    var name=(sr?SZN[sr]:fs+" px")+" · "+(cr?CLN[cr]:rgb2hex(col)+(al.length>3&&+al[3]<1?" (прозрачный)":""))+" · "+(WN[fw]||fw);
    return {fs:fs,fw:+fw,hex:rgb2hex(col),ls:ls,sr:sr,cr:cr,name:name,sample:(el.textContent||"").trim().replace(/\s+/g," ").slice(0,40)};
  }
  /* метки ставим по исходному виду страницы, поэтому на время подсчёта выключаем свои стили */
  function scan(){
    var css=$("tn-css"),prev=css.textContent;css.textContent="";
    PR=probes();
    var els=document.body.getElementsByTagName("*");
    for(var i=0;i<els.length;i++){
      var el=els[i];
      if(el.hasAttribute("data-tnk"))continue;
      var tn=el.tagName;
      if(tn==="SCRIPT"||tn==="STYLE"||tn==="svg"||tn==="path"||tn==="NOSCRIPT"||tn==="TEMPLATE"||tn==="OPTION"||tn==="SELECT"||tn==="INPUT")continue;
      if(el.closest("#tn,#tn-ov,#tn-tip,svg"))continue;
      var own=false;
      for(var c=el.firstChild;c;c=c.nextSibling){if(c.nodeType===3&&c.nodeValue.trim()){own=true;break}}
      if(!own||!el.getClientRects().length)continue;
      var cs=getComputedStyle(el);
      var sig=[px1(cs.fontSize),cs.fontWeight,cs.color,px1(cs.letterSpacing)||0,cs.textTransform].join("|");
      var id=h32(sig);
      el.setAttribute("data-tnk",id);
      if(!KEYS[id])KEYS[id]=describe(cs,PR,el);
    }
    css.textContent=prev;
  }
  var scanT=null;
  function scanSoon(){clearTimeout(scanT);scanT=setTimeout(function(){scan();if(INSP){if(!SEL)renderCard();paint()}},150)}
  new MutationObserver(function(ms){
    for(var i=0;i<ms.length;i++){
      var t=ms[i].target;
      if(t.id==="tn-css"||t.id==="tn-ui")continue;
      if(t.nodeType===1&&(t.closest("#tn,#tn-ov,#tn-tip")))continue;
      var nodes=[].slice.call(ms[i].addedNodes).concat([].slice.call(ms[i].removedNodes));
      if(nodes.length&&nodes.every(function(n){return n.nodeType===1&&(n.id==="tn-css"||n.id==="tn-ov"||n.id==="tn-tip"||n.id==="tn"||n.tagName==="STYLE")}))continue;
      scanSoon();return;
    }
  }).observe(document.body,{childList:true,subtree:true});

  function count(key){var n=0,e=document.querySelectorAll('[data-tnk="'+key+'"]');for(var i=0;i<e.length;i++)if(e[i].getClientRects().length)n++;return n}
  function boxes(key,cls,hovEl){
    var els=document.querySelectorAll('[data-tnk="'+key+'"]'),h="",vis=0;
    for(var i=0;i<els.length;i++){
      var e=els[i];if(!e.getClientRects().length)continue;
      var r=e.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)continue;
      if(++vis>400)break;
      h+='<i class="'+cls+(e===hovEl?" me":"")+'" style="left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px"></i>';
    }
    return h;
  }
  function tokensText(K){
    var a=[];if(K.sr)a.push(SZT[K.sr]);if(K.cr)a.push(CLT[K.cr]);
    return a.length?a.join(", "):"вне токенов";
  }
  function paint(){
    if(!INSP){OV.innerHTML="";TIP.style.display="none";return}
    var h="";
    if(SEL)h+=boxes(SEL,"sel",null);
    if(HOV)h+=boxes(HOV.key,"hov",HOV.el);
    OV.innerHTML=h;
    if(HOV&&KEYS[HOV.key]){
      var K=KEYS[HOV.key],o=OVR[HOV.key];
      TIP.innerHTML="<b>"+K.name+"</b>"+(o?" <em>· изменён</em>":"")+"<br><em>«"+K.sample+"»</em><br>"+K.fs+" px · вес "+K.fw+" · "+K.hex+"<br>токены: "+tokensText(K)+"<br>Таких же мест на странице: <b>"+count(HOV.key)+"</b><br><em>Клик, чтобы настроить</em>";
      TIP.style.display="block";
      var w=TIP.offsetWidth,hh=TIP.offsetHeight,x=MX+14,y=MY+16;
      if(x+w>innerWidth-8)x=MX-w-14;if(y+hh>innerHeight-8)y=MY-hh-14;
      TIP.style.left=Math.max(8,x)+"px";TIP.style.top=Math.max(8,y)+"px";
    }else TIP.style.display="none";
  }
  var rafP=0;function paintSoon(){if(rafP)return;rafP=requestAnimationFrame(function(){rafP=0;paint()})}
  addEventListener("scroll",paintSoon,true);addEventListener("resize",paintSoon);

  document.addEventListener("mousemove",function(e){
    if(!INSP)return;
    MX=e.clientX;MY=e.clientY;
    if(e.target.closest&&e.target.closest("#tn")){HOV=null;paintSoon();return}
    var el=e.target.closest?e.target.closest("[data-tnk]"):null;
    HOV=el?{key:el.getAttribute("data-tnk"),el:el}:null;
    paintSoon();
  },true);
  document.addEventListener("click",function(e){
    if(!INSP)return;
    if(e.target.closest&&e.target.closest("#tn"))return;
    e.preventDefault();e.stopPropagation();
    var el=e.target.closest?e.target.closest("[data-tnk]"):null;
    if(el){selectKey(el.getAttribute("data-tnk"))}
  },true);
  document.addEventListener("keydown",function(e){
    if(!INSP||e.key!=="Escape")return;
    if(SEL){SEL=null;renderCard();paint()}else setInsp(false);
  });

  /* ——— карточка выбранного стиля ——— */
  function effective(k){
    var K=KEYS[k],o=OVR[k]||{},v={hex:o.color||K.hex,fs:o.fs!=null?o.fs:K.fs,fw:o.fw||K.fw,ls:o.ls!=null?o.ls:(K.fs?+(K.ls/K.fs).toFixed(3):0)};
    if(SC&&K.cr&&CL2KEY[K.cr])v.hex=S[CL2KEY[K.cr]];
    if(SS&&K.sr)v.fs=S[SZ2KEY[K.sr]];
    return v;
  }
  function own(k){return OVR[k]||(OVR[k]={n:KEYS[k].name})}
  function selectKey(k){SEL=k;SC=false;SS=false;P.classList.remove("min");$("tn-min").textContent="—";store("tn-min","0");renderCard();paint();$("tn-body").scrollTop=0}
  function renderCard(){
    var box=$("tn-card");
    if(!INSP){box.innerHTML="";return}
    if(!SEL||!KEYS[SEL]){
      var list=Object.keys(KEYS).map(function(k){return {k:k,n:count(k)}}).filter(function(x){return x.n>0}).sort(function(a,b){return b.n-a.n}).slice(0,30);
      box.innerHTML='<div class="ic"><div class="ih"><b>Инспектор текста</b></div><div class="is">Наведите на текст, и я подсвечу такие же. Клик выбирает стиль для настройки. Esc выходит.</div><div class="is" style="margin-top:8px">Все стили на этой странице</div>'+
        list.map(function(x){var K=KEYS[x.k];return '<button class="gl" data-k="'+x.k+'"><i style="background:'+K.hex+'"></i><span>'+K.name+(OVR[x.k]?" ·✎":"")+'</span><em>'+x.n+'</em></button>'}).join("")+'</div>';
      box.querySelectorAll(".gl").forEach(function(b){
        b.addEventListener("click",function(){selectKey(b.getAttribute("data-k"))});
        b.addEventListener("mouseenter",function(){HOV={key:b.getAttribute("data-k"),el:null};paint()});
        b.addEventListener("mouseleave",function(){HOV=null;paint()});
      });
      return;
    }
    var k=SEL,K=KEYS[k],v=effective(k);
    var tokSel=Object.keys(SZT).map(function(t){return '<option value="'+t+'">'+SZN[t]+" · "+Math.round(PR.fs[t]*10)/10+" px</option>"}).join("");
    box.innerHTML='<div class="ic"><div class="ih"><b>'+K.name+'</b><button class="rs" id="ic-x" title="Закрыть">✕</button></div>'+
      '<div class="is">«'+K.sample+'» · мест на странице '+count(k)+' · токены '+tokensText(K)+'</div>'+
      '<div class="cr"><span>Цвет</span><button class="sat" id="ic-sat"></button><input id="ic-hex" type="text" maxlength="7"></div>'+
      '<div class="ed" id="ic-ed"><label>Оттенок <b id="ic-v0"></b></label><input id="ic-h0" type="range" min="0" max="360"><label>Насыщенность <b id="ic-v1"></b></label><input id="ic-h1" type="range" min="0" max="100"><label>Яркость <b id="ic-v2"></b></label><input id="ic-h2" type="range" min="0" max="100"></div>'+
      (K.cr&&CL2KEY[K.cr]?'<div class="kr"><span>Менять везде, где «'+CLN[K.cr]+'» ('+CLT[K.cr]+')</span><label class="sw"><input type="checkbox" id="ic-sc"><i></i></label></div>':'')+
      '<div class="rg"><div class="rl"><span>Размер</span><input class="num" id="ic-fsn" type="number" min="8" max="96" step="0.5"><em>px</em></div><input id="ic-fs" type="range" min="8" max="96" step="0.5"></div>'+
      (K.sr?'<div class="kr"><span>Менять везде, где '+SZN[K.sr]+' ('+SZT[K.sr]+')</span><label class="sw"><input type="checkbox" id="ic-ss"><i></i></label></div>':
            '<div class="cr"><span>Привести к токену</span><select id="ic-snap" style="width:140px;padding:5px 6px;border:0;border-radius:6px;background:rgba(255,255,255,.1);color:#fff;font:inherit"><option value="">выбрать</option>'+tokSel+'</select></div>')+
      '<div class="rg"><div class="rl"><span>Вес</span><input class="num" id="ic-fwn" type="number" min="300" max="800" step="100"></div><input id="ic-fw" type="range" min="300" max="800" step="100"></div>'+
      '<div class="rg"><div class="rl"><span>Межбуквенное расстояние</span><input class="num" id="ic-lsn" type="number" min="-0.08" max="0.3" step="0.005"><em>em</em></div><input id="ic-ls" type="range" min="-0.08" max="0.3" step="0.005"></div>'+
      '<div class="ft"><button class="btn ghost" id="ic-reset" style="flex:1">Сбросить этот стиль</button></div></div>';
    function paintVals(){
      var v=effective(k);
      HSLI=hex2hsl(v.hex);
      $("ic-sat").style.background=v.hex;$("ic-hex").value=v.hex;
      for(var i=0;i<3;i++){$("ic-h"+i).value=HSLI[i];$("ic-v"+i).textContent=HSLI[i]+(i?"%":"°")}
      $("ic-h0").style.background="linear-gradient(90deg,"+[0,60,120,180,240,300,360].map(function(x){return "hsl("+x+","+HSLI[1]+"%,"+HSLI[2]+"%)"}).join(",")+")";
      $("ic-h1").style.background="linear-gradient(90deg,hsl("+HSLI[0]+",0%,"+HSLI[2]+"%),hsl("+HSLI[0]+",100%,"+HSLI[2]+"%))";
      $("ic-h2").style.background="linear-gradient(90deg,#000,hsl("+HSLI[0]+","+HSLI[1]+"%,50%),#fff)";
      $("ic-fs").value=v.fs;$("ic-fsn").value=v.fs;$("ic-fw").value=v.fw;$("ic-fwn").value=v.fw;$("ic-ls").value=v.ls;$("ic-lsn").value=v.ls;
    }
    paintVals();
    function setColor(hex){
      if(SC&&K.cr&&CL2KEY[K.cr]){var pk=CL2KEY[K.cr];if(OVR[k])delete OVR[k].color;S[pk]=hex;S[pk==="ac"?"o_site":"o_tx"]=true;sync();apply()}
      else{own(k).color=hex;apply()}
      paintVals();paint();
    }
    function setFs(val){
      if(SS&&K.sr){if(OVR[k])delete OVR[k].fs;S[SZ2KEY[K.sr]]=val;S.o_fs=true;sync();apply()}else{own(k).fs=val;apply()}
      paintVals();paint();
    }
    $("ic-sat").onclick=function(){$("ic-ed").classList.toggle("open")};
    $("ic-hex").addEventListener("input",function(){var t=this.value.trim();if(t[0]!=="#")t="#"+t;if(ok(t)){var keep=this.value;setColor(t.toUpperCase());this.value=keep}});
    [0,1,2].forEach(function(i){$("ic-h"+i).addEventListener("input",function(){HSLI[i]=+this.value;setColor(hsl2hex(HSLI[0],HSLI[1],HSLI[2]))})});
    $("ic-fs").addEventListener("input",function(){setFs(+this.value)});
    $("ic-fsn").addEventListener("input",function(){var t=parseFloat(this.value);if(!isNaN(t))setFs(Math.min(96,Math.max(8,t)))});
    $("ic-fw").addEventListener("input",function(){own(k).fw=+this.value;apply();$("ic-fwn").value=this.value;paint()});
    $("ic-fwn").addEventListener("input",function(){var t=parseFloat(this.value);if(!isNaN(t)){own(k).fw=Math.min(800,Math.max(300,Math.round(t/100)*100));apply();$("ic-fw").value=OVR[k].fw;paint()}});
    $("ic-ls").addEventListener("input",function(){own(k).ls=+this.value;apply();$("ic-lsn").value=this.value;paint()});
    $("ic-lsn").addEventListener("input",function(){var t=parseFloat(this.value);if(!isNaN(t)){own(k).ls=t;apply();$("ic-ls").value=t;paint()}});
    if($("ic-sc"))$("ic-sc").addEventListener("change",function(){SC=this.checked;paintVals()});
    if($("ic-ss"))$("ic-ss").addEventListener("change",function(){SS=this.checked;paintVals()});
    if($("ic-snap"))$("ic-snap").addEventListener("change",function(){if(this.value){setFs(Math.round(PR.fs[this.value]*10)/10);this.value=""}});
    $("ic-reset").onclick=function(){delete OVR[k];SC=false;SS=false;apply();renderCard();paint()};
    $("ic-x").onclick=function(){SEL=null;renderCard();paint()};
  }
  function setInsp(on){
    INSP=on;document.body.classList.toggle("tn-insp",on);$("tn-insp").classList.toggle("insp-on",on);
    if(on){scan();P.classList.remove("min");$("tn-min").textContent="—";store("tn-min","0")}
    else{SEL=null;HOV=null}
    renderCard();paint();
  }
  $("tn-insp").innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4l6.5 16 2.3-6.7L19.5 11z"/></svg>';
  $("tn-insp").onclick=function(){setInsp(!INSP)};
  setTimeout(scan,500);

  /* ——— превью. Окно просмотра не открывает другие страницы, поэтому ссылки на них перехватываем ———
     Клик по строке в колонке слева переносит выделение на неё, остальные ссылки на страницы показывают подсказку. */
  var TOAST=document.createElement("div");TOAST.id="tn-toast";document.body.appendChild(TOAST);
  var toastT=null;
  function toast(t){TOAST.textContent=t;TOAST.classList.add("on");clearTimeout(toastT);toastT=setTimeout(function(){TOAST.classList.remove("on")},2600)}
  document.addEventListener("click",function(e){
    if(INSP)return;
    if(e.target.closest&&e.target.closest("#tn"))return;
    var a=e.target.closest?e.target.closest("a[href]"):null;
    if(!a)return;
    var href=a.getAttribute("href")||"";
    if(!/^[\w.\-]+\.html([?#].*)?$/.test(href))return;
    e.preventDefault();e.stopPropagation();
    if(a.matches(".sidebar a.row")){
      [].forEach.call(document.querySelectorAll(".sidebar a.row[aria-current]"),function(x){x.removeAttribute("aria-current")});
      a.setAttribute("aria-current","page");
      toast("В превью страница не открывается. Выделение строки переключено, чтобы вы увидели вариант.");
    } else toast("В превью переходы между страницами отключены.");
  },true);
  sync();paintEye();paintMin();apply();
  if(pos)place(pos.x,pos.y);
})();
