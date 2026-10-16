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
#tn .sw{position:relative;width:34px;height:20px;display:inline-block;flex:none}
#tn .sw input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer;z-index:1}
#tn .sw i{position:absolute;inset:0;background:rgba(255,255,255,.22);border-radius:20px;transition:background .15s}
#tn .sw i::after{content:"";position:absolute;left:2px;top:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s}
#tn .sw input:checked+i{background:#34c759}
#tn .sw input:checked+i::after{transform:translateX(14px)}`;

  var EYE='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF='<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/><path d="M3 3l18 18"/></svg>';

  var HTML=`
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="tn-lg" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="2" seed="4" result="t"/><feDisplacementMap id="tn-disp" in="SourceGraphic" in2="t" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
<div id="tn">
  <div class="hd" id="tn-hd"><b><i class="grip"></i><span id="tn-title">Настройка вида</span></b><span class="hr"><button class="ib act" id="tn-eye" title="Сравнить с оригиналом (глазик)"></button><button class="ib" id="tn-min" title="Свернуть"></button></span></div>
  <div class="body">
    <div class="note">Сейчас показан оригинал сайта без ваших настроек. Нажмите на глазик, чтобы вернуть их.</div>
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
   {id:"site",t:"Цвета сайта",o:true,c:[
    {k:"bg",l:"Фон сайта",y:"c",d:"#FDFDFC"},{k:"sel",l:"Серый в переключателях и кнопках",y:"c",d:"#F3EFEC"},
    {k:"ac",l:"Акцентный цвет",y:"c",d:"#131316"},
    {k:"live",l:"Пульсирующая точка",y:"c",d:"#9E7757"}],
    h:"Акцент красит маркеры, ссылки в тексте и активные пункты. Точка стоит у текущей работы."},
   {id:"tx",t:"Цвета текста",o:true,c:[
    {k:"ink",l:"Основной текст и заголовки",y:"c",d:"#131316"},
    {k:"muted",l:"Серый текст (абзацы, подписи)",y:"c",d:"#46433E"},
    {k:"faint",l:"Бледный текст",y:"c",d:"#000000"},
    {k:"btn",l:"Текст на кнопках и тегах",y:"c",d:"#131316"}],
    h:"Бледный текст это самый тихий серый. Годы и стрелки в списке проектов слева, номера 01–15 под открытым кейсом, мелкие заголовки над блоками (например «Роль», «Команда»), невыбранный En или Ру."},
   {id:"pl",t:"Подложка под картинками",o:true,c:[
    {k:"pbg",l:"Фон подложки",y:"c",d:"#F3EFEC"},
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
   {id:"gl",t:"Стекло (Liquid Glass)",o:true,c:[
    {k:"gcards",l:"И на карточках",y:"k",d:false},
    {k:"gtg",l:"Цвет кнопок (серый)",y:"c",d:"#F3EFEC"},
    {k:"gt",l:"Оттенок стекла у выбранного таба и карточек",y:"c",d:"#FFFFFF"},
    {k:"ga",l:"Плотность заливки",y:"r",m:[0,100,1,"%"],d:90},
    {k:"gb",l:"Размытие того, что под стеклом",y:"r",m:[0,40,1,"px"],d:35},
    {k:"gs",l:"Насыщенность цвета под стеклом",y:"r",m:[100,250,5,"%"],d:205},
    {k:"ge",l:"Светлая кромка",y:"r",m:[0,100,1,"%"],d:64},
    {k:"gh",l:"Блик сверху",y:"r",m:[0,100,1,"%"],d:100},
    {k:"gsh",l:"Тень под стеклом",y:"r",m:[0,30,1,"%"],d:20},
    {k:"gr",l:"Преломление (только Chrome)",y:"r",m:[0,40,1,"px"],d:20},
    {k:"gn",l:"Зерно на стекле",y:"r",m:[0,40,1,"%"],d:10}],
    h:"Меняет только внешний вид кнопок и ссылок, у табов только выбранный и наведённый. Теги без действия остаются обычными серыми, их цвет это «Серый в переключателях». Стекло заметно, если под ним есть что размывать, поэтому включайте вместе с подсветкой."},
   {id:"bk",t:"Подсветка за стеклом",o:false,c:[
    {k:"k1",l:"Пятно 1",y:"c",d:"#FFB199"},{k:"k2",l:"Пятно 2",y:"c",d:"#9DB7FF"},{k:"k3",l:"Пятно 3",y:"c",d:"#C9A6FF"},
    {k:"ki",l:"Сила пятен",y:"r",m:[0,100,1,"%"],d:60}]},
   {id:"nz",t:"Шум на всей странице",o:false,c:[
    {k:"nn",l:"Сила шума",y:"r",m:[0,40,1,"%"],d:12},{k:"nz",l:"Размер зерна",y:"r",m:[60,400,10,"px"],d:160}]}
  ];
  var DEF={};
  SEC.forEach(function(s){DEF["o_"+s.id]=s.o;s.c.forEach(function(c){DEF[c.k]=c.d})});
  var KEY="tn-v9";
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
    if(S.o_site)vars.push("--bg:"+S.bg,"--sel:"+S.sel,"--accent:"+S.ac,"--live:"+S.live);
    if(S.o_tx)vars.push("--ink:"+S.ink,"--muted:"+S.muted,"--faint:"+S.faint);
    if(vars.length)c+=":root:root{"+vars.join(";")+"}";
    if(S.o_tx)c+=pills(BUTTONS.concat(TABS),CALM)+"{color:"+S.btn+"}";
    var rest=S.o_sh0?"drop-shadow(0 "+S.y0+"px "+S.b0+"px "+rgba(S.sc,S.a0)+")":"none";
    var hov=S.o_sh1?"drop-shadow(0 "+S.y1+"px "+S.b1+"px "+rgba(S.sc,S.a1)+")":rest;
    var lift=S.o_sh1?S.lift:0,scale=S.o_sh1?S.scale:0,t=S.dur+"ms ease",plate=S.o_pl;
    /* тень, подъём и увеличение только у самой картинки, подложка стоит на месте */
    c+=".figs .fig .fig-btn{background:"+(plate?S.pbg:"none")+";padding:"+(plate?S.p:0)+"px;border-radius:"+(plate?S.r:0)+"px;filter:none;transform:none;transition:none}";
    c+=".figs .fig .fig-btn:hover{transform:none;filter:none}";
    c+=".figs .fig .fig-btn img{filter:"+rest+";border-radius:"+(S.o_bd?S.ir:0)+"px;transition:transform "+t+",filter "+t+"}";
    c+=".figs .fig .fig-btn:hover img{transform:translateY(-"+lift+"px) scale("+(1+scale/100)+");filter:"+hov+"}";
    if(plate)c+="@media(max-width:640px){.figs .fig .fig-btn{padding:"+Math.min(S.p,20)+"px;border-radius:"+Math.min(S.r,24)+"px}}";
    if(S.o_bd&&S.bw>0)c+=".figs .fig .fig-btn img{outline:"+S.bw+"px solid "+rgba(S.bc,S.ba)+";outline-offset:-"+S.bw+"px}";
    if(S.o_bk){
      c+="body::before{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background:"+
        "radial-gradient(42% 36% at 10% 16%,"+rgba(S.k1,S.ki)+",transparent 70%),"+
        "radial-gradient(40% 40% at 90% 30%,"+rgba(S.k2,S.ki)+",transparent 70%),"+
        "radial-gradient(46% 42% at 52% 98%,"+rgba(S.k3,S.ki)+",transparent 70%)}";
      c+="html body .sidebar,html body .topbar{background:transparent}";
    }
    if(S.o_gl){
      /* Только внешний вид. Стекло получают кнопки и ссылки, у табов только выбранный и наведённый.
         Невыбранный таб остаётся просто текстом. Теги без действия не трогаем, они остаются обычными серыми. */
      var bf="blur("+S.gb+"px) saturate("+S.gs+"%)";
      var shadow="inset 0 0 0 1px "+rgba("#FFFFFF",S.ge)+",inset 0 1px 1px "+rgba("#FFFFFF",S.gh)+",0 4px 16px "+rgba(S.sc,S.gsh);
      var fx="-webkit-backdrop-filter:"+bf+";backdrop-filter:"+bf+(S.gr>0?";backdrop-filter:url(#tn-lg) "+bf:"")+";box-shadow:"+shadow;
      var grain=S.gn>0?";background-image:"+noise(S.gn/100):"";
      var fillGrey="background-color:"+rgba(S.gtg,S.ga)+grain,fillLight="background-color:"+rgba(S.gt,S.ga)+grain;
      var greys=BUTTONS,lights=[".card"];
      var tabOn=pills(TABS,":hover")+","+pills(TABS,'[aria-pressed="true"]');
      var all=greys.concat(S.gcards?lights:[]);
      c+=pills(all)+","+tabOn+"{"+fx+"}";
      /* кнопки серые, как невыбранный таб. Выбранный таб и карточки светлые */
      c+=greys.map(function(x){return "html body "+x+(BUTTONS.indexOf(x)>-1?CALM:"")}).join(",")+"{"+fillGrey+"}";
      c+=tabOn+(S.gcards?",html body .card":"")+"{"+fillLight+"}";
    }
    if(S.o_nz)c+="body::after{content:'';position:fixed;inset:0;z-index:5000;pointer-events:none;background:"+noise(1)+";background-size:"+S.nz+"px;opacity:"+(S.nn/100)+";mix-blend-mode:overlay}";
    return c;
  }
  function outText(){
    var L=[],on=function(id,txt){return S["o_"+id]?txt:"выкл"};
    L.push("Цвета сайта: "+on("site","фон "+S.bg+", серый в переключателях "+S.sel+", акцент "+S.ac));
    L.push("Цвета текста: "+on("tx","основной "+S.ink+", серый "+S.muted+", бледный "+S.faint+", на кнопках "+S.btn));
    L.push("Подложка: "+on("pl","фон "+S.pbg+", скругление "+S.r+" px, отступ "+S.p+" px"));
    L.push("Тень в покое: "+on("sh0",S.sc+", вниз "+S.y0+" px, размытие "+S.b0+" px, сила "+S.a0+"%"));
    L.push("При наведении: "+on("sh1","подъём "+S.lift+" px, увеличение "+S.scale+"%, тень вниз "+S.y1+" px, размытие "+S.b1+" px, сила "+S.a1+"%, скорость "+S.dur+" мс"));
    L.push("Рамка и углы: "+on("bd","рамка "+S.bw+" px, "+S.bc+", прозрачность "+S.ba+"%, скругление картинки "+S.ir+" px"));
    L.push("Стекло: "+on("gl",(S.gcards?"и карточки, ":"")+"оттенок "+S.gt+", плотность "+S.ga+"%, размытие "+S.gb+" px, насыщенность "+S.gs+"%, кромка "+S.ge+"%, блик "+S.gh+"%, тень "+S.gsh+"%, преломление "+S.gr+" px, зерно "+S.gn+"%"));
    L.push("Подсветка за стеклом: "+on("bk",S.k1+" "+S.k2+" "+S.k3+", сила "+S.ki+"%"));
    L.push("Шум на странице: "+on("nz","сила "+S.nn+"%, зерно "+S.nz+" px"));
    return L.join("\n");
  }
  function apply(){
    document.body.appendChild($("tn-css"));
    $("tn-css").textContent=EN?build():"";
    $("tn-disp").setAttribute("scale",S.gr);
    $("tn-out").textContent=outText();
    store(KEY,JSON.stringify(S));
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
    $("tn-title").textContent=EN?"Настройка вида":"Оригинал сайта";
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

  sync();paintEye();paintMin();apply();
  if(pos)place(pos.x,pos.y);
})();
