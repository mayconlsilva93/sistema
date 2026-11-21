/* DROM Booker · calculadora de cachê = a do Estudo de cachês 2027 (pe2027/estudo/e.json, mesma chave do Booker).
   O código do estudo roda num iframe (mesma origem) sem alterações nas regras; aqui só: preenchimento pela proposta,
   chave 2026 (Tabela de Cachês 2026) / 2027 (estudo) e o botão "Inserir na proposta". */
(function(){
var MAP={"Ramonstro":"ramonstro","Cenoura":"cenoura","Sena":"sena","Maneira":"maneira","Carloto":"carloto","Amaro":"amaro","Josu":"josu","Cadu Vieira":"cadu","Brinquinho":"brinquinho","Liquinho":"liquinho"};
var P=null,FR=null,RDY=null,LAST=null,$=function(i){return document.getElementById(i)};
function b64(s){return Uint8Array.from(atob(s),function(c){return c.charCodeAt(0)})}
function load(){if(!P)P=fetch("../pe2027/estudo/e.json",{cache:"no-store"}).then(function(r){return r.json()}).then(function(j){return crypto.subtle.decrypt({name:"AES-GCM",iv:b64(j.iv)},window.DROMBKK,b64(j.ct))}).then(function(b){var t=new TextDecoder().decode(b),
  css=t.slice(t.indexOf("<style>")+7,t.indexOf("</style>")),js=t.slice(t.indexOf("<script>")+8,t.lastIndexOf("</script>")),cut=js.indexOf("/* ===== TABELA 2027");if(cut<0)throw new Error("estudo mudou de formato");return{css:css,js:js.slice(0,cut)}});return P}
var BR=String.raw`
var BKY='2027',BKRS=[];
const _calc=calc;
calc=function(a,o){const r=_calc(a,o);if(BKY!=='2026'||EXD[a])return r;
 const i=A.indexOf(a),gf=o.km<=40,air=o.air&&!gf,t=air?T26.AE[i]*Mf(o.d):tab26(a,o.t,o.km,o.d,o.ev);
 if(t==null)return Object.assign({},r,{nt:['Sem valor na Tabela 2026 para este perfil e tipo: mostrando 2027'].concat(r.nt)});
 const ideal=r50(t)+r.hot+r.ex,min=r.tip?Math.min(ideal,r.tip):ideal,cust=r.cust,cm=COM(a,ideal,ideal-cust,o.t,o.d,o.cl),nt=['Tabela de Cachês 2026'+(gf?'':' (valor de tabela; deslocamento incluso)')];
 if(r.hot)nt.push('Hotel pago pelo artista somado ('+R(r.hot)+')');if(r.ex)nt.push('Custo de equipe somado ('+R(r.ex)+')');if(cm.n)nt.push(cm.n);
 return Object.assign({},r,{ideal,min,max:ideal,t26:t,disc:0,art:ideal-(r.tr+r.food+r.hot+r.eq+r.ex),liq0:ideal-cust,com:cm.v,crt:cm.r,liq:ideal-cust-cm.v,nt})};
GFN=function(a){if(!(a in _G))_G[a]=_calc(a,{t:'balada',km:0,d:1,ev:0,ppl:1,ex:0,hc:true,eq:false,n:1}).liq;return _G[a]};
const _seq=seq;seq=function(rs,L,o,card){BKRS=rs.map(([a,r])=>[a,r.ideal]);return _seq(rs,L,o,card)};
const _run=run;run=function(){_run();bkAfter()};
function bkAfter(){const b=document.getElementById('bkins');if(!b)return;b.innerHTML=BKRS.map(([a,v])=>'<button class="bki" data-v="'+v+'">Inserir '+R(v)+' na proposta'+(BKRS.length>1?' · '+D[a].nm:'')+'</button>').join('');
 b.querySelectorAll('button').forEach(x=>x.onclick=()=>parent.BKINS&&parent.BKINS(+x.dataset.v));document.querySelectorAll('#bkyr button').forEach(x=>x.classList.toggle('on',x.dataset.y==BKY))}
window.BKSET=function(x){BKY=x.y;calcUI();const v=document.getElementById('v-calculadora');
 v.insertAdjacentHTML('afterbegin','<div class="bkh"><div class="seg" id="bkyr"><button data-y="2026">Tabela 2026</button><button data-y="2027">2027 (estudo)</button></div><span class="mu">'+(x.yh||'')+'</span></div><div id="bkins"></div>');
 v.querySelectorAll('#bkyr button').forEach(b=>b.onclick=()=>{BKY=b.dataset.y;run()});
 CS=new Set([x.k]);upCh();EXPM='auto';OPEN.clear();setTR('');AVM=false;DVU=false;
 const cl=$('#cl0'),cc=$('#cc'),vk=x.loc?vkey(x.loc):'';
 if(x.cid){const c=cfind(x.cid);cc.value=c?c[0]:x.cid;cc.dispatchEvent(new Event('input'));if(!c)buscaKm()}
 if(vk){cl.value=vk;cl.dispatchEvent(new Event('input'))}else if(x.loc)cl.value=x.loc;
 if(x.t&&!(x.t=='unig'&&$('#ct').value=='unip')){$('#ct').value=x.t;setT()}
 if(x.d)$('#cd').value=x.d;$('#cdt').value=x.dt||'';
 if(x.ppl!=null){$('#cp').value=x.ppl;CPM=true}else CPM=false;
 if(x.hs!=null){HS=x.hs;HP=x.hp||'c';HSM=true}else HSM=false;
 setEQ();if(x.eq!=null){EQ=x.eq;EQS='pela proposta'}run()};
new ResizeObserver(()=>parent.BKH&&parent.BKH(document.documentElement.scrollHeight)).observe(document.body);
`;
var XCSS="body{background:transparent;font-size:14px}main{padding:0 0 4px;max-width:none}.cg{grid-template-columns:1fr!important}.fm2{position:static!important;max-height:none!important;overflow:visible!important}"
 +":root{--ac:#E2480E;--acs:#FFEBE3}.bkh{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 8px}#bkins{display:flex;flex-direction:column;gap:6px;margin:0 0 10px}#bkins:empty{display:none}.bki{height:40px;border-radius:20px;border:0;background:#FF5B1F;color:#0a0a0a;font:700 14px/1 inherit;cursor:pointer}";
function frame(){if(RDY)return RDY;RDY=load().then(function(x){return new Promise(function(ok){FR=document.createElement("iframe");FR.id="bkcf";FR.title="Calculadora de cachê";FR.style.cssText="width:100%;border:0;display:block;height:600px";
  FR.onload=function(){ok(FR)};FR.srcdoc='<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+x.css+XCSS+'</style></head><body class="ap"><main><section class="view on" id="v-calculadora"></section></main><script>'+x.js+"\n"+BR+"<\/script></body></html>";$("cxb").appendChild(FR)})});return RDY}
window.BKH=function(h){if(FR)FR.style.height=Math.max(200,h)+"px"};
function nrm(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()}
function tipo(c){c=nrm(c);return/formatura/.test(c)?"formatura":/casamento/.test(c)?"casamento":/particular|anivers|corporat/.test(c)?"particular":/universit/.test(c)?"unig":c?"balada":null}
function hrs(s){var m=/^(\d+):(\d+)/.exec(s||"");return m?+m[1]+ +m[2]/60:null}
function shell(){var c=$("calcp");if($("cxb"))return;var on=true;try{on=localStorage.getItem("bkdev_calc")!=="0"}catch(e){}
 c.innerHTML='<div class="dvch"><h2 style="margin:0">Calculadora de cachê</h2><button id="cxt" type="button">'+(on?"Ocultar":"Mostrar")+'</button></div><div id="cxb"'+(on?"":" hidden")+'><p class="mu" id="cxm" style="font-size:12px">Carregando a calculadora do estudo…</p></div>';
 $("cxt").onclick=function(){var h=!$("cxb").hidden;$("cxb").hidden=h;this.textContent=h?"Mostrar":"Ocultar";try{localStorage.setItem("bkdev_calc",h?"0":"1")}catch(e){}}}
window.BKCALC={open:function(r,a){if(!r)return;shell();var dp=String(r.dprop||""),yr=/^\d{4}-/.test(dp)?dp.slice(0,4):String(new Date().getFullYear()),
  pr=parseInt(r.prod,10),hp=nrm(r.hosp),eq=nrm(r.eq);
  var x={k:MAP[a]||"cenoura",y:yr>="2027"?"2027":"2026",yh:"ano pela data da proposta ("+(/^\d{4}-/.test(dp)?dp.slice(8,10)+"/"+dp.slice(5,7)+"/"+dp.slice(0,4):"hoje")+")"+(MAP[a]?"":" · perfil de referência: Cenoura"),
   loc:r.loc||"",cid:r.cid||"",t:tipo(r.cat),d:hrs(r.dur),dt:/^\d{4}-\d\d-\d\d$/.test(r.dt||"")?r.dt:"",ppl:isNaN(pr)?null:pr,
   hs:hp==="contratante"||hp==="artista"?true:hp==="nao"?false:null,hp:hp==="artista"?"a":"c",eq:eq==="levar"?true:/cdj|xdj|controladora/.test(eq)?false:null};
  LAST=x;frame().then(function(f){var m=$("cxm");if(m)m.remove();if(LAST===x)f.contentWindow.BKSET(x)}).catch(function(e){var m=$("cxm");if(m)m.textContent="Não consegui abrir a calculadora do estudo ("+(e&&e.message||e)+")."})}};
})();
