/* Панель настройки вида. Только для просмотра, на живой сайт не идёт. */
(function(){
  if(document.getElementById("tn"))return;
  var st=document.createElement("style");st.id="tn-css";document.head.appendChild(st);
  document.body.insertAdjacentHTML("beforeend","<style>\n#tn{position:fixed;right:14px;bottom:14px;z-index:9999;width:292px;max-height:calc(100vh - 28px);overflow:auto;padding:12px 14px;border-radius:14px;background:rgba(20,20,24,.95);color:#fff;font:13px/1.35 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.4)}\n#tn h4{margin:0;font-size:13px;display:flex;justify-content:space-between;align-items:center}\n#tn .hd button{padding:2px 8px}\n#tn .sec{margin:10px 0 0;padding-top:8px;border-top:1px solid rgba(255,255,255,.15)}\n#tn .row{display:flex;align-items:center;gap:8px;margin-top:6px}\n#tn .row>span{flex:1}\n#tn input[type=color]{width:34px;height:26px;padding:0;border:1px solid #666;border-radius:6px;background:none;cursor:pointer}\n#tn input[type=text]{width:78px;padding:4px 6px;border-radius:6px;border:1px solid #555;background:#111;color:#fff;font:12px ui-monospace,monospace}\n#tn input[type=range]{width:100%;margin:4px 0 0}\n#tn button{padding:5px 9px;border:0;border-radius:8px;cursor:pointer;background:#fff;color:#111;font:inherit}\n#tn .out{margin-top:10px;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,.1);font:12px/1.4 ui-monospace,monospace;white-space:pre-wrap}\n#tn.min .body{display:none}\n</style>\n<svg width=\"0\" height=\"0\" style=\"position:absolute\" aria-hidden=\"true\"><filter id=\"tn-lg\" x=\"0\" y=\"0\" width=\"100%\" height=\"100%\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.03 0.05\" numOctaves=\"2\" seed=\"4\" result=\"t\"/><feDisplacementMap id=\"tn-disp\" in=\"SourceGraphic\" in2=\"t\" scale=\"0\" xChannelSelector=\"R\" yChannelSelector=\"G\"/></filter></svg>\n<style>\n#tn .sec{margin:8px 0 0;padding-top:6px;border-top:1px solid rgba(255,255,255,.15)}\n#tn .sh{display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;user-select:none}\n#tn .sh .st{font-weight:700;flex:1;display:flex;align-items:center;gap:6px}\n#tn .sh .st i{font-style:normal;display:inline-block;width:10px;transition:transform .15s;opacity:.7}\n#tn .sec.closed .sh .st i{transform:rotate(-90deg)}\n#tn .sh .rs{padding:2px 8px;font-size:11px;background:rgba(255,255,255,.14);color:#fff}\n#tn .sb{padding-bottom:4px}\n#tn .sec.closed .sb{display:none}\n#tn .sb .row label{flex:1}\n#tn .hint{margin-top:6px;font-size:11px;color:rgba(255,255,255,.55);line-height:1.35}\n</style>\n<div id=\"tn\">\n  <h4 class=\"hd\"><span>Настройка вида</span><button id=\"tn-min\" title=\"Свернуть\">—</button></h4>\n  <div class=\"body\">\n    <div id=\"tn-secs\"></div>\n    <div class=\"out\" id=\"tn-out\"></div>\n    <div class=\"row\"><button id=\"tn-copy\" style=\"flex:1\">Копировать значения</button><button id=\"tn-reset\">Сбросить всё</button></div>\n  </div>\n</div>\n");
  if(innerWidth<700){var t=document.getElementById("tn");t.classList.add("min");document.getElementById("tn-min").textContent="+"}
})();
(function(){
  var $=function(i){return document.getElementById(i)};
  /* типы: c — цвет, r — ползунок [мин, макс, шаг, ед.], k — галочка */
  var SEC=[
   {id:"site",t:"Сайт",open:1,c:[
    {k:"bg",l:"Фон сайта",y:"c",d:"#FDFDFC"},{k:"ink",l:"Цвет шрифта",y:"c",d:"#131316"},{k:"ac",l:"Акцентный цвет",y:"c",d:"#131316"},{k:"sel",l:"Серый в переключателях",y:"c",d:"#E6E0DB"}]},
   {id:"pl",t:"Подложка под картинками",c:[
    {k:"pon",l:"Показывать подложку",y:"k",d:true},{k:"pbg",l:"Фон подложки",y:"c",d:"#E6E0DB"},
    {k:"r",l:"Скругление подложки",y:"r",m:[0,40,1,"px"],d:40},{k:"p",l:"Отступ внутри подложки",y:"r",m:[0,48,1,"px"],d:48}]},
   {id:"sh0",t:"Тень картинок в покое",c:[
    {k:"sc",l:"Цвет тени",y:"c",d:"#9E7757"},
    {k:"y0",l:"Смещение вниз",y:"r",m:[0,40,.5,"px"],d:7},{k:"b0",l:"Размытие",y:"r",m:[0,60,.5,"px"],d:10.5},{k:"a0",l:"Сила тени",y:"r",m:[0,40,.5,"%"],d:2}]},
   {id:"sh1",t:"Картинки при наведении",c:[
    {k:"lift",l:"Насколько поднимается",y:"r",m:[0,20,.5,"px"],d:2},{k:"scale",l:"Увеличение",y:"r",m:[0,6,.5,"%"],d:0},
    {k:"y1",l:"Смещение вниз",y:"r",m:[0,60,.5,"px"],d:0},{k:"b1",l:"Размытие",y:"r",m:[0,80,.5,"px"],d:0},{k:"a1",l:"Сила тени",y:"r",m:[0,60,.5,"%"],d:0},
    {k:"dur",l:"Скорость анимации",y:"r",m:[0,800,10,"мс"],d:250}]},
   {id:"bd",t:"Рамка и углы картинки",c:[
    {k:"bw",l:"Толщина рамки",y:"r",m:[0,4,.5,"px"],d:0},{k:"bc",l:"Цвет рамки",y:"c",d:"#000000"},
    {k:"ba",l:"Прозрачность рамки",y:"r",m:[0,100,1,"%"],d:10},{k:"ir",l:"Скругление картинки",y:"r",m:[0,32,1,"px"],d:0}]},
   {id:"gl",t:"Стекло (Liquid Glass)",c:[
    {k:"gon",l:"Включить стекло на кнопках и тегах",y:"k",d:false},
    {k:"gcards",l:"И на карточках",y:"k",d:false},
    {k:"gt",l:"Оттенок стекла",y:"c",d:"#FFFFFF"},
    {k:"ga",l:"Плотность заливки",y:"r",m:[0,100,1,"%"],d:35},
    {k:"gb",l:"Размытие того, что под стеклом",y:"r",m:[0,40,1,"px"],d:16},
    {k:"gs",l:"Насыщенность цвета под стеклом",y:"r",m:[100,250,5,"%"],d:160},
    {k:"ge",l:"Светлая кромка",y:"r",m:[0,100,1,"%"],d:60},
    {k:"gh",l:"Блик сверху",y:"r",m:[0,100,1,"%"],d:70},
    {k:"gsh",l:"Тень под стеклом",y:"r",m:[0,30,1,"%"],d:10},
    {k:"gr",l:"Преломление (только Chrome)",y:"r",m:[0,40,1,"px"],d:0},
    {k:"gn",l:"Зерно на стекле",y:"r",m:[0,40,1,"%"],d:0},
    {k:"gact",l:"Плотность акцента у активной кнопки",y:"r",m:[20,100,1,"%"],d:100}],
    h:"Стекло видно, только если под ним есть что размывать. Включите «Подсветку за стеклом» ниже."},
   {id:"bk",t:"Подсветка за стеклом",c:[
    {k:"bon",l:"Включить цветные пятна на фоне",y:"k",d:false},
    {k:"k1",l:"Пятно 1",y:"c",d:"#FFB199"},{k:"k2",l:"Пятно 2",y:"c",d:"#9DB7FF"},{k:"k3",l:"Пятно 3",y:"c",d:"#C9A6FF"},
    {k:"ki",l:"Сила пятен",y:"r",m:[0,100,1,"%"],d:60}]},
   {id:"nz",t:"Шум на всей странице",c:[
    {k:"non",l:"Включить шум",y:"k",d:false},
    {k:"nn",l:"Сила шума",y:"r",m:[0,40,1,"%"],d:12},{k:"nz",l:"Размер зерна",y:"r",m:[60,400,10,"px"],d:160}]}
  ];
  var DEF={};SEC.forEach(function(s){s.c.forEach(function(c){DEF[c.k]=c.d})});
  var KEY="tn-v5",OK="tn-open";
  var S,OPEN={};
  try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}; S=Object.assign({},DEF,S||{});
  try{OPEN=JSON.parse(localStorage.getItem(OK))||{}}catch(e){}
  function ok(h){return /^#[0-9a-fA-F]{6}$/.test(h)}
  function rgb(h){return [1,3,5].map(function(i){return parseInt(h.substr(i,2),16)})}
  function mix(a,b,t){var A=rgb(a),B=rgb(b);return "#"+A.map(function(v,i){var x=Math.round(v*t+B[i]*(1-t));return (x<16?"0":"")+x.toString(16)}).join("")}
  function rgba(h,a){var c=rgb(h);return "rgba("+c[0]+","+c[1]+","+c[2]+","+(a/100)+")"}
  function noise(a){
    var svg="<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 "+a+" 0'/></filter><rect width='160' height='160' filter='url(#n)'/></svg>";
    return "url(\"data:image/svg+xml,"+encodeURIComponent(svg)+"\")";
  }
  /* строим панель */
  var host=$("tn-secs"),h="";
  SEC.forEach(function(s){
    h+='<div class="sec'+((OPEN[s.id]!==undefined?OPEN[s.id]:s.open)?'':' closed')+'" data-s="'+s.id+'"><div class="sh"><span class="st"><i>▾</i>'+s.t+'</span><button class="rs" data-rs="'+s.id+'" title="Вернуть значения этого раздела">Сброс</button></div><div class="sb">';
    s.c.forEach(function(c){
      if(c.y==="c") h+='<div class="row"><span>'+c.l+'</span><input id="tn-c-'+c.k+'" type="color"><input id="tn-t-'+c.k+'" type="text"></div>';
      else if(c.y==="k") h+='<div class="row"><input id="tn-c-'+c.k+'" type="checkbox"><label for="tn-c-'+c.k+'">'+c.l+'</label></div>';
      else h+='<div>'+c.l+': <b id="tn-v-'+c.k+'"></b></div><input id="tn-c-'+c.k+'" type="range" min="'+c.m[0]+'" max="'+c.m[1]+'" step="'+c.m[2]+'">';
    });
    if(s.h) h+='<div class="hint">'+s.h+'</div>';
    h+='</div></div>';
  });
  host.innerHTML=h;
  function sync(){SEC.forEach(function(s){s.c.forEach(function(c){
    var e=$("tn-c-"+c.k);
    if(c.y==="c"){e.value=S[c.k].toLowerCase();$("tn-t-"+c.k).value=S[c.k]}
    else if(c.y==="k") e.checked=!!S[c.k]; else e.value=S[c.k];
  })})}
  function pills(list,suf){return list.map(function(x){return "html body "+x+(suf||"")}).join(",")}
  var PILLS=[".back",".v4close",".segmented button",".lang button",".duties-more",".v4step",".tag-kind",".side-links a",".chip-btn",".dl-btn",".foot a",".case-link",".toggle",".life-tag"];
  function build(){
    var c=":root{--bg:"+S.bg+";--ink:"+S.ink+";--accent:"+S.ac+";--sel:"+S.sel+";--muted:"+mix(S.ink,S.bg,.58)+";--faint:"+mix(S.ink,S.bg,.38)+"}";
    var sh0="drop-shadow(0 "+S.y0+"px "+S.b0+"px "+rgba(S.sc,S.a0)+")",sh1="drop-shadow(0 "+S.y1+"px "+S.b1+"px "+rgba(S.sc,S.a1)+")";
    var t=S.dur+"ms ease",im=".figs .fig .fig-btn img";
    var tg=S.pon?".figs .fig .fig-btn":im,tgH=S.pon?".figs .fig .fig-btn:hover":".figs .fig .fig-btn:hover img";
    c+=".figs .fig .fig-btn{transition:transform "+t+",filter "+t+(S.pon?";background:"+S.pbg+";padding:"+S.p+"px;border-radius:"+S.r+"px":"")+"}";
    c+=im+"{transition:filter "+t+";filter:none;border-radius:"+S.ir+"px}";
    c+=tg+"{filter:"+sh0+"}";
    c+=".figs .fig .fig-btn:hover{transform:translateY(-"+S.lift+"px) scale("+(1+S.scale/100)+")}";
    c+=tgH+"{filter:"+sh1+"}";
    if(S.pon) c+="@media(max-width:640px){.figs .fig .fig-btn{padding:"+Math.min(S.p,20)+"px;border-radius:"+Math.min(S.r,24)+"px}}";
    if(S.bw>0) c+=(S.pon?".figs .fig .fig-btn{box-shadow:inset 0 0 0 "+S.bw+"px "+rgba(S.bc,S.ba)+"}":im+"{outline:"+S.bw+"px solid "+rgba(S.bc,S.ba)+";outline-offset:-"+S.bw+"px}");
    if(S.bon){
      c+="body::before{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background:"+
        "radial-gradient(42% 36% at 10% 16%,"+rgba(S.k1,S.ki)+",transparent 70%),"+
        "radial-gradient(40% 40% at 90% 30%,"+rgba(S.k2,S.ki)+",transparent 70%),"+
        "radial-gradient(46% 42% at 52% 98%,"+rgba(S.k3,S.ki)+",transparent 70%)}";
      c+="html body .sidebar,html body .topbar{background:transparent}";
    }
    if(S.gon||S.gcards){
      var T=PILLS.slice();if(!S.gon)T=[];if(S.gcards)T.push(".card");
      var bf="blur("+S.gb+"px) saturate("+S.gs+"%)";
      var shadow="inset 0 0 0 1px "+rgba("#FFFFFF",S.ge)+",inset 0 1px 1px "+rgba("#FFFFFF",S.gh)+",0 4px 16px "+rgba(S.sc,S.gsh);
      c+=pills(T)+"{-webkit-backdrop-filter:"+bf+";backdrop-filter:"+bf+(S.gr>0?";backdrop-filter:url(#tn-lg) "+bf:"")+";box-shadow:"+shadow+";border-color:transparent}";
      var rest=T.map(function(x){return "html body "+x+(x===".card"?"":":not(:hover):not([aria-pressed=\"true\"])")}).join(",");
      c+=rest+"{background-color:"+rgba(S.gt,S.ga)+(S.gn>0?";background-image:"+noise(S.gn/100):"")+"}";
      if(S.gon){
        var act=PILLS.map(function(x){return "html body "+x+":hover,html body "+x+"[aria-pressed=\"true\"]"}).join(",");
        c+=act+"{background-color:color-mix(in srgb,"+S.ac+" "+S.gact+"%,transparent);color:#fff}";
        c+="html body .segmented,html body .lang{background:transparent}";
      }
    }
    if(S.non) c+="body::after{content:'';position:fixed;inset:0;z-index:5000;pointer-events:none;background:"+noise(1)+";background-size:"+S.nz+"px;opacity:"+(S.nn/100)+";mix-blend-mode:overlay}";
    return c;
  }
  function outText(){
    var L=[];
    L.push("Фон сайта: "+S.bg,"Цвет шрифта: "+S.ink,"Акцентный цвет: "+S.ac,"Серый в переключателях: "+S.sel,"Плашки: "+(S.pon?"да, фон "+S.pbg+", скругление "+S.r+" px, отступ "+S.p+" px":"нет"));
    L.push("Тень в покое: "+S.sc+", вниз "+S.y0+" px, размытие "+S.b0+" px, сила "+S.a0+"%");
    L.push("При наведении: подъём "+S.lift+" px, увеличение "+S.scale+"%, тень вниз "+S.y1+" px, размытие "+S.b1+" px, сила "+S.a1+"%, скорость "+S.dur+" мс");
    L.push("Рамка: "+(S.bw>0?S.bw+" px, "+S.bc+", прозрачность "+S.ba+"%":"нет"));
    L.push("Скругление картинки: "+S.ir+" px");
    L.push("Стекло: "+(S.gon||S.gcards?"да"+(S.gcards?" (и карточки)":"")+", оттенок "+S.gt+", плотность "+S.ga+"%, размытие "+S.gb+" px, насыщенность "+S.gs+"%, кромка "+S.ge+"%, блик "+S.gh+"%, тень "+S.gsh+"%, преломление "+S.gr+" px, зерно "+S.gn+"%, плотность акцента "+S.gact+"%":"нет"));
    L.push("Подсветка за стеклом: "+(S.bon?"да, "+S.k1+" "+S.k2+" "+S.k3+", сила "+S.ki+"%":"нет"));
    L.push("Шум на странице: "+(S.non?"да, сила "+S.nn+"%, зерно "+S.nz+" px":"нет"));
    return L.join("\n");
  }
  function apply(){
    $("tn-css").textContent=build();
    $("tn-disp").setAttribute("scale",S.gr);
    SEC.forEach(function(s){s.c.forEach(function(c){if(c.y==="r")$("tn-v-"+c.k).textContent=S[c.k]+" "+c.m[3]})});
    $("tn-out").textContent=outText();
    try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  }
  SEC.forEach(function(s){s.c.forEach(function(c){
    var e=$("tn-c-"+c.k);
    if(c.y==="r") e.addEventListener("input",function(){S[c.k]=+this.value;apply()});
    else if(c.y==="k") e.addEventListener("change",function(){S[c.k]=this.checked;apply()});
    else {
      e.addEventListener("input",function(){S[c.k]=this.value.toUpperCase();$("tn-t-"+c.k).value=S[c.k];apply()});
      $("tn-t-"+c.k).addEventListener("input",function(){var v=this.value.trim();if(v[0]!=="#")v="#"+v;if(ok(v)){S[c.k]=v.toUpperCase();e.value=v.toLowerCase();apply()}});
    }
  })});
  host.addEventListener("click",function(e){
    var r=e.target.closest("[data-rs]");
    if(r){var s=SEC.filter(function(x){return x.id===r.getAttribute("data-rs")})[0];s.c.forEach(function(c){S[c.k]=DEF[c.k]});sync();apply();return}
    var sh=e.target.closest(".sh");
    if(sh){var sec=sh.parentNode;sec.classList.toggle("closed");OPEN[sec.getAttribute("data-s")]=!sec.classList.contains("closed");try{localStorage.setItem(OK,JSON.stringify(OPEN))}catch(x){}}
  });
  $("tn-reset").onclick=function(){S=Object.assign({},DEF);sync();apply()};
  $("tn-copy").onclick=function(){try{navigator.clipboard.writeText($("tn-out").textContent)}catch(e){};var b=this;b.textContent="Скопировано";setTimeout(function(){b.textContent="Копировать значения"},1200)};
  $("tn-min").onclick=function(){var p=$("tn");p.classList.toggle("min");this.textContent=p.classList.contains("min")?"+":"—"};
  sync();apply();
})();
