/* Панель настройки вида. Только для просмотра, на живой сайт не идёт.
   Каждый раздел включается своим тумблером. Цвета выбираются тремя ползунками (оттенок, насыщенность, яркость). */
(function(){
  if(document.getElementById("tn"))return;

  var UI_CSS=`
#tn{position:fixed;right:14px;bottom:14px;z-index:9999;width:300px;max-height:calc(100vh - 28px);overflow:auto;padding:12px 14px;border-radius:14px;background:rgba(20,20,24,.96);color:#fff;font:13px/1.35 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.4)}
#tn *{box-sizing:border-box}
#tn .hd{margin:0;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:700}
#tn .hr{display:flex;align-items:center;gap:8px}
#tn button{padding:5px 9px;border:0;border-radius:8px;cursor:pointer;background:#fff;color:#111;font:inherit}
#tn .hd button{padding:2px 8px}
#tn .sec{margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.15)}
#tn .sh{display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;user-select:none;font-weight:700}
#tn .sec.off .sb{display:none}
#tn .sec.off .sh{opacity:.55}
#tn .row{display:flex;align-items:center;gap:8px;margin-top:6px}
#tn .row>span,#tn .row>label{flex:1}
#tn input[type=text]{width:84px;padding:4px 6px;border-radius:6px;border:1px solid #555;background:#111;color:#fff;font:12px ui-monospace,monospace}
#tn input[type=range]{width:100%;margin:4px 0 0}
#tn .sat{width:34px;height:26px;padding:0;border-radius:6px;border:1px solid #777;cursor:pointer}
#tn .ed{display:none;margin-top:6px;padding:8px;border-radius:8px;background:rgba(255,255,255,.08)}
#tn .ed.open{display:block}
#tn .ed label{display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.7)}
#tn .ed input[type=range]{-webkit-appearance:none;appearance:none;height:12px;border-radius:6px;margin:2px 0 8px;border:1px solid rgba(255,255,255,.25);cursor:pointer}
#tn .ed input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;border:2px solid #222}
#tn .ed input[type=range]::-moz-range-thumb{width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #222}
#tn .hint{margin-top:6px;font-size:11px;color:rgba(255,255,255,.55);line-height:1.35}
#tn .out{margin-top:10px;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,.1);font:12px/1.4 ui-monospace,monospace;white-space:pre-wrap}
#tn.min .body,#tn.off .body{display:none}
#tn.off #tn-min{display:none}
#tn .sw{position:relative;width:34px;height:20px;display:inline-block;flex:none}
#tn .sw input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer;z-index:1}
#tn .sw i{position:absolute;inset:0;background:#666;border-radius:20px;transition:background .15s}
#tn .sw i::after{content:"";position:absolute;left:2px;top:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .15s}
#tn .sw input:checked+i{background:#34c759}
#tn .sw input:checked+i::after{transform:translateX(14px)}`;

  var HTML=`
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="tn-lg" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="2" seed="4" result="t"/><feDisplacementMap id="tn-disp" in="SourceGraphic" in2="t" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
<div id="tn">
  <h4 class="hd"><span>Настройка вида</span><span class="hr"><label class="sw" title="Включить или выключить всю панель"><input type="checkbox" id="tn-en"><i></i></label><button id="tn-min" title="Свернуть">—</button></span></h4>
  <div class="body">
    <div id="tn-secs"></div>
    <div class="out" id="tn-out"></div>
    <div class="row"><button id="tn-copy" style="flex:1">Копировать значения</button><button id="tn-reset">Сбросить всё</button></div>
  </div>
</div>`;

  var st=document.createElement("style");st.id="tn-ui";st.textContent=UI_CSS;document.head.appendChild(st);
  var cs=document.createElement("style");cs.id="tn-css";document.head.appendChild(cs);
  document.body.insertAdjacentHTML("beforeend",HTML);
  if(innerWidth<700){document.getElementById("tn").classList.add("min");document.getElementById("tn-min").textContent="+"}

  var $=function(i){return document.getElementById(i)};
  /* типы. c цвет, r ползунок [мин, макс, шаг, ед.], k галочка. o значение тумблера раздела по умолчанию */
  var SEC=[
   {id:"site",t:"Цвета сайта",o:true,c:[
    {k:"bg",l:"Фон сайта",y:"c",d:"#FDFDFC"},{k:"ink",l:"Цвет шрифта",y:"c",d:"#131316"},
    {k:"ac",l:"Акцентный цвет",y:"c",d:"#131316"},{k:"sel",l:"Серый в переключателях",y:"c",d:"#E6E0DB"}]},
   {id:"pl",t:"Подложка под картинками",o:true,c:[
    {k:"pbg",l:"Фон подложки",y:"c",d:"#E6E0DB"},
    {k:"r",l:"Скругление подложки",y:"r",m:[0,40,1,"px"],d:40},{k:"p",l:"Отступ внутри подложки",y:"r",m:[0,48,1,"px"],d:48}]},
   {id:"sh0",t:"Тень картинок в покое",o:true,c:[
    {k:"sc",l:"Цвет тени",y:"c",d:"#9E7757"},
    {k:"y0",l:"Смещение вниз",y:"r",m:[0,40,.5,"px"],d:7},{k:"b0",l:"Размытие",y:"r",m:[0,60,.5,"px"],d:10.5},{k:"a0",l:"Сила тени",y:"r",m:[0,40,.5,"%"],d:2}]},
   {id:"sh1",t:"Картинки при наведении",o:true,c:[
    {k:"lift",l:"Насколько поднимается",y:"r",m:[0,20,.5,"px"],d:2},{k:"scale",l:"Увеличение",y:"r",m:[0,6,.5,"%"],d:0},
    {k:"y1",l:"Смещение тени вниз",y:"r",m:[0,60,.5,"px"],d:0},{k:"b1",l:"Размытие тени",y:"r",m:[0,80,.5,"px"],d:0},{k:"a1",l:"Сила тени",y:"r",m:[0,60,.5,"%"],d:0},
    {k:"dur",l:"Скорость анимации",y:"r",m:[0,800,10,"мс"],d:250}],
    h:"Цвет тени берётся из раздела «Тень в покое»."},
   {id:"bd",t:"Рамка и углы картинки",o:false,c:[
    {k:"bw",l:"Толщина рамки",y:"r",m:[0,4,.5,"px"],d:1},{k:"bc",l:"Цвет рамки",y:"c",d:"#000000"},
    {k:"ba",l:"Прозрачность рамки",y:"r",m:[0,100,1,"%"],d:10},{k:"ir",l:"Скругление картинки",y:"r",m:[0,32,1,"px"],d:0}]},
   {id:"gl",t:"Стекло (Liquid Glass)",o:false,c:[
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
    h:"Стекло на кнопках и тегах. Оно заметно, только если под ним есть что размывать, поэтому включайте вместе с подсветкой."},
   {id:"bk",t:"Подсветка за стеклом",o:false,c:[
    {k:"k1",l:"Пятно 1",y:"c",d:"#FFB199"},{k:"k2",l:"Пятно 2",y:"c",d:"#9DB7FF"},{k:"k3",l:"Пятно 3",y:"c",d:"#C9A6FF"},
    {k:"ki",l:"Сила пятен",y:"r",m:[0,100,1,"%"],d:60}]},
   {id:"nz",t:"Шум на всей странице",o:false,c:[
    {k:"nn",l:"Сила шума",y:"r",m:[0,40,1,"%"],d:12},{k:"nz",l:"Размер зерна",y:"r",m:[60,400,10,"px"],d:160}]}
  ];
  var DEF={};
  SEC.forEach(function(s){DEF["o_"+s.id]=s.o;s.c.forEach(function(c){DEF[c.k]=c.d})});
  var KEY="tn-v6";
  var EN=true;try{EN=localStorage.getItem("tn-en")!=="0"}catch(e){}
  var S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}; S=Object.assign({},DEF,S||{});

  /* ——— цвет ——— */
  function ok(h){return /^#[0-9a-fA-F]{6}$/.test(h)}
  function rgb(h){return [1,3,5].map(function(i){return parseInt(h.substr(i,2),16)})}
  function mix(a,b,t){var A=rgb(a),B=rgb(b);return "#"+A.map(function(v,i){var x=Math.round(v*t+B[i]*(1-t));return (x<16?"0":"")+x.toString(16)}).join("").toUpperCase()}
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

  /* ——— разметка панели ——— */
  var HSL={};
  var h="";
  SEC.forEach(function(s){
    h+='<div class="sec" data-s="'+s.id+'"><div class="sh"><span>'+s.t+'</span><label class="sw"><input type="checkbox" id="tn-o-'+s.id+'"><i></i></label></div><div class="sb">';
    s.c.forEach(function(c){
      if(c.y==="c"){
        h+='<div class="row"><span>'+c.l+'</span><button class="sat" id="tn-s-'+c.k+'" title="Подобрать цвет"></button><input id="tn-t-'+c.k+'" type="text"></div>'+
           '<div class="ed" id="tn-e-'+c.k+'">'+
           '<label>Оттенок <b id="tn-hv-'+c.k+'-0"></b></label><input id="tn-h-'+c.k+'-0" type="range" min="0" max="360" step="1">'+
           '<label>Насыщенность <b id="tn-hv-'+c.k+'-1"></b></label><input id="tn-h-'+c.k+'-1" type="range" min="0" max="100" step="1">'+
           '<label>Яркость <b id="tn-hv-'+c.k+'-2"></b></label><input id="tn-h-'+c.k+'-2" type="range" min="0" max="100" step="1"></div>';
      } else if(c.y==="k"){
        h+='<div class="row"><input id="tn-c-'+c.k+'" type="checkbox"><label for="tn-c-'+c.k+'">'+c.l+'</label></div>';
      } else {
        h+='<div>'+c.l+': <b id="tn-v-'+c.k+'"></b></div><input id="tn-c-'+c.k+'" type="range" min="'+c.m[0]+'" max="'+c.m[1]+'" step="'+c.m[2]+'">';
      }
    });
    if(s.h)h+='<div class="hint">'+s.h+'</div>';
    h+='</div></div>';
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
        else $("tn-c-"+c.k).value=S[c.k];
      });
    });
  }

  /* ——— CSS страницы ——— */
  var PILLS=[".back",".v4close",".segmented button",".lang button",".duties-more",".v4step",".tag-kind",".side-links a",".chip-btn",".dl-btn",".foot a",".case-link",".toggle",".life-tag"];
  function pills(list,suf){return list.map(function(x){return "html body "+x+(suf||"")}).join(",")}
  function build(){
    var c="";
    if(S.o_site)c+=":root{--bg:"+S.bg+";--ink:"+S.ink+";--accent:"+S.ac+";--sel:"+S.sel+";--muted:"+mix(S.ink,S.bg,.58)+";--faint:"+mix(S.ink,S.bg,.38)+"}";
    var rest=S.o_sh0?"drop-shadow(0 "+S.y0+"px "+S.b0+"px "+rgba(S.sc,S.a0)+")":"none";
    var hov=S.o_sh1?"drop-shadow(0 "+S.y1+"px "+S.b1+"px "+rgba(S.sc,S.a1)+")":rest;
    var lift=S.o_sh1?S.lift:0,scale=S.o_sh1?S.scale:0,t=S.dur+"ms ease",plate=S.o_pl;
    c+=".figs .fig .fig-btn{background:"+(plate?S.pbg:"none")+";padding:"+(plate?S.p:0)+"px;border-radius:"+(plate?S.r:0)+"px;filter:"+(plate?rest:"none")+";transition:transform "+t+",filter "+t+"}";
    c+=".figs .fig .fig-btn img{filter:"+(plate?"none":rest)+";border-radius:"+(S.o_bd?S.ir:0)+"px;transition:filter "+t+"}";
    c+=".figs .fig .fig-btn:hover{transform:translateY(-"+lift+"px) scale("+(1+scale/100)+");filter:"+(plate?hov:"none")+"}";
    c+=".figs .fig .fig-btn:hover img{filter:"+(plate?"none":hov)+"}";
    if(plate)c+="@media(max-width:640px){.figs .fig .fig-btn{padding:"+Math.min(S.p,20)+"px;border-radius:"+Math.min(S.r,24)+"px}}";
    if(S.o_bd&&S.bw>0)c+=plate?".figs .fig .fig-btn{box-shadow:inset 0 0 0 "+S.bw+"px "+rgba(S.bc,S.ba)+"}":".figs .fig .fig-btn img{outline:"+S.bw+"px solid "+rgba(S.bc,S.ba)+";outline-offset:-"+S.bw+"px}";
    if(S.o_bk){
      c+="body::before{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background:"+
        "radial-gradient(42% 36% at 10% 16%,"+rgba(S.k1,S.ki)+",transparent 70%),"+
        "radial-gradient(40% 40% at 90% 30%,"+rgba(S.k2,S.ki)+",transparent 70%),"+
        "radial-gradient(46% 42% at 52% 98%,"+rgba(S.k3,S.ki)+",transparent 70%)}";
      c+="html body .sidebar,html body .topbar{background:transparent}";
    }
    if(S.o_gl){
      var T=PILLS.slice();if(S.gcards)T.push(".card");
      var bf="blur("+S.gb+"px) saturate("+S.gs+"%)";
      var shadow="inset 0 0 0 1px "+rgba("#FFFFFF",S.ge)+",inset 0 1px 1px "+rgba("#FFFFFF",S.gh)+",0 4px 16px "+rgba(S.sc,S.gsh);
      c+=pills(T)+"{-webkit-backdrop-filter:"+bf+";backdrop-filter:"+bf+(S.gr>0?";backdrop-filter:url(#tn-lg) "+bf:"")+";box-shadow:"+shadow+";border-color:transparent}";
      var base=T.map(function(x){return "html body "+x+(x===".card"?"":":not(:hover):not([aria-pressed=\"true\"])")}).join(",");
      c+=base+"{background-color:"+rgba(S.gt,S.ga)+(S.gn>0?";background-image:"+noise(S.gn/100):"")+"}";
      var act=PILLS.map(function(x){return "html body "+x+":hover,html body "+x+"[aria-pressed=\"true\"]"}).join(",");
      c+=act+"{background-color:color-mix(in srgb,"+S.ac+" "+S.gact+"%,transparent);color:#fff}";
      c+="html body .segmented,html body .lang{background:transparent}";
    }
    if(S.o_nz)c+="body::after{content:'';position:fixed;inset:0;z-index:5000;pointer-events:none;background:"+noise(1)+";background-size:"+S.nz+"px;opacity:"+(S.nn/100)+";mix-blend-mode:overlay}";
    return c;
  }
  function outText(){
    var L=[],on=function(id,txt){return S["o_"+id]?txt:"выкл"};
    L.push("Цвета сайта: "+on("site","фон "+S.bg+", шрифт "+S.ink+", акцент "+S.ac+", серый в переключателях "+S.sel));
    L.push("Подложка: "+on("pl","фон "+S.pbg+", скругление "+S.r+" px, отступ "+S.p+" px"));
    L.push("Тень в покое: "+on("sh0",S.sc+", вниз "+S.y0+" px, размытие "+S.b0+" px, сила "+S.a0+"%"));
    L.push("При наведении: "+on("sh1","подъём "+S.lift+" px, увеличение "+S.scale+"%, тень вниз "+S.y1+" px, размытие "+S.b1+" px, сила "+S.a1+"%, скорость "+S.dur+" мс"));
    L.push("Рамка и углы: "+on("bd","рамка "+S.bw+" px, "+S.bc+", прозрачность "+S.ba+"%, скругление картинки "+S.ir+" px"));
    L.push("Стекло: "+on("gl",(S.gcards?"и карточки, ":"")+"оттенок "+S.gt+", плотность "+S.ga+"%, размытие "+S.gb+" px, насыщенность "+S.gs+"%, кромка "+S.ge+"%, блик "+S.gh+"%, тень "+S.gsh+"%, преломление "+S.gr+" px, зерно "+S.gn+"%, плотность акцента "+S.gact+"%"));
    L.push("Подсветка за стеклом: "+on("bk",S.k1+" "+S.k2+" "+S.k3+", сила "+S.ki+"%"));
    L.push("Шум на странице: "+on("nz","сила "+S.nn+"%, зерно "+S.nz+" px"));
    return L.join("\n");
  }
  function apply(){
    $("tn-css").textContent=EN?build():"";
    $("tn-disp").setAttribute("scale",S.gr);
    SEC.forEach(function(s){s.c.forEach(function(c){if(c.y==="r")$("tn-v-"+c.k).textContent=S[c.k]+" "+c.m[3]})});
    $("tn-out").textContent=outText();
    try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  }

  /* ——— события ——— */
  SEC.forEach(function(s){
    var sec=document.querySelector('[data-s="'+s.id+'"]'),sh=sec.querySelector(".sh"),tg=$("tn-o-"+s.id);
    tg.addEventListener("change",function(){S["o_"+s.id]=this.checked;sec.classList.toggle("off",!this.checked);apply()});
    sh.addEventListener("click",function(e){if(e.target.closest(".sw"))return;tg.click()});
    s.c.forEach(function(c){
      var k=c.k;
      if(c.y==="r"){$("tn-c-"+k).addEventListener("input",function(){S[k]=+this.value;apply()})}
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
  $("tn-min").onclick=function(){var p=$("tn");p.classList.toggle("min");this.textContent=p.classList.contains("min")?"+":"—"};
  function applyEn(user){
    var p=$("tn");$("tn-en").checked=EN;
    p.classList.toggle("off",!EN);
    if(EN&&user)p.classList.remove("min");
    $("tn-min").textContent=p.classList.contains("min")?"+":"—";
    apply();
    try{localStorage.setItem("tn-en",EN?"1":"0")}catch(e){}
  }
  $("tn-en").addEventListener("change",function(){EN=this.checked;applyEn(true)});
  sync();applyEn();
})();
