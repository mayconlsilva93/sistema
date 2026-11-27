/* DROM · Tarefas no app do artista (popup + faixa de lembrete). Tarefas criadas no Hub (Apps Script, app "tarefas", criptografadas com a chave do PIN).
   "Já enviei" vai para o app "tarok". Custos do mês só quando ligado no Hub (cfg.custos). */
(function(){
var URL="https://script.google.com/macros/s/AKfycbzk5iksIZVvdK27taLTcpQbdPebxGjP7ilwNxiQDYwUuTSaMz80Hifmgr-5aazWhI0R/exec";
var K=window.DROMKEY;if(!K||!window.crypto||!crypto.subtle)return;
var F=(location.pathname.match(/([^\/]+)\/(?:index\.html)?$/)||[])[1]||"",B=2023,H=36e5;
var TN={eq:"Envio de equipe",vc:"Vídeo de chamada",ot:"Tarefa",cm:"Custos do mês"},W=["dom","seg","ter","qua","qui","sex","sáb"],MS=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
var b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),b6=u=>btoa(String.fromCharCode.apply(null,u)),p2=n=>String(n).padStart(2,"0");
var esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
var ls={g:k=>{try{return JSON.parse(localStorage.getItem("tar_"+F+"_"+k))}catch(e){return null}},s:(k,v)=>{try{localStorage.setItem("tar_"+F+"_"+k,JSON.stringify(v))}catch(e){}}};
async function dec(x){var t=await crypto.subtle.decrypt({name:"AES-GCM",iv:b64(x.iv)},K,b64(x.ct));return JSON.parse(new TextDecoder().decode(t))}
async function list(app){try{var r=await fetch(URL+"?app="+app+"&t="+Date.now());if(!r.ok)return[];var l=await r.json(),o=[];for(var x of l){try{o.push(await dec(x))}catch(e){}}return o}catch(e){return[]}}
var st=document.createElement("style");st.textContent=
".tpo{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:130;display:flex;justify-content:center;align-items:center;padding:0 18px 90px}"+
".tpo>div{width:100%;max-width:380px;background:#fff;border-radius:18px;overflow:hidden;color:#111;box-shadow:0 10px 40px rgba(0,0,0,.3);font-family:inherit}"+
".tpo .th{background:#0000FF;color:#fff;padding:14px 16px;font-weight:800;font-size:17px}.tpo.rd .th{background:#d50000}"+
".tpo .tb{padding:16px}.tpo h3{margin:0 0 10px;font-size:17px;color:#111;text-transform:none;letter-spacing:0;font-weight:800}.tpo .tz{display:inline-block;background:#eceeff;color:#0000FF;font-weight:800;border-radius:8px;padding:5px 10px;font-size:14px;margin-bottom:10px}.tpo.rd .tz{background:#ffe5e5;color:#d50000}"+
".tpo p{margin:0 0 12px;font-size:15px;line-height:1.45;white-space:pre-line}.tpo .tl{background:#f3f3f3;border-radius:10px;padding:10px 12px;font-size:14px;margin-bottom:12px}.tpo .tl ul{margin:6px 0 0;padding-left:20px}"+
".tpo .tbt{display:flex;gap:8px}.tpo .tbt button{flex:1;border-radius:10px;padding:12px 8px;font-family:inherit;font-weight:700;font-size:15px;cursor:pointer;border:1.5px solid #0000FF}.tpo .t0{background:#fff;color:#0000FF}.tpo .t1{background:#0000FF;color:#fff}"+
".tpo.cf{z-index:131;background:rgba(0,0,0,.25)}"+
".tbr{position:fixed;left:10px;right:10px;bottom:calc(var(--nvh,58px) + env(safe-area-inset-bottom,0px) + 40px);z-index:44;background:#fff;border:2px solid #0000FF;border-radius:14px;display:flex;align-items:center;gap:10px;padding:9px 10px;box-shadow:0 4px 14px rgba(0,0,0,.15);cursor:pointer;max-width:560px;margin:0 auto;color:#111}"+
".tbr i{flex:none;width:28px;height:28px;border-radius:50%;background:#0000FF;color:#fff;font-weight:800;font-size:16px;line-height:28px;font-style:normal;text-align:center}.tbr span{flex:1;font-size:14.5px;font-weight:600}.tbr span b{color:#0000FF}"+
".tbr.rd{border-color:#d50000}.tbr.rd i{background:#d50000}.tbr.rd span b{color:#d50000}.tbr button{border:0;background:none;font-size:20px;color:#555;cursor:pointer;padding:0 4px}";
document.head.appendChild(st);
var day=t=>{var d=new Date(t);return d.getFullYear()*1e4+d.getMonth()*100+d.getDate()},today=()=>day(Date.now());
function pz(t,full){var d=new Date(t),h=d.getHours()===23&&d.getMinutes()===59?"":" às "+p2(d.getHours())+":"+p2(d.getMinutes()),dm=p2(d.getDate())+"/"+p2(d.getMonth()+1);
 if(day(t)===today())return"hoje, "+dm+h;return dm+(full?" ("+W[d.getDay()]+")":"")+h}
var red=x=>day(x.due)<=today();
var T=[],DONE={};
var tn=x=>x.k==="ot"&&x.ti?x.ti:TN[x.k]||"Tarefa",lb=x=>x.k==="cm"?TN.cm:tn(x)+(x.ev?" ("+x.ev+")":"");
/* Custos do mês: criada 2 dias após o último show do mês na agenda ou no dia 1º do mês seguinte (o que vier primeiro); prazo: 5º dia útil do mês seguinte (seg–sex, sem feriados nacionais) */
function eas(y){var a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h-22*l)/451),x=h+l-7*m+114;return new Date(y,Math.floor(x/31)-1,x%31+1)}
function bd5(y,mo){var D=new Date(y,mo,1);y=D.getFullYear();mo=D.getMonth();var gf=eas(y);gf.setDate(gf.getDate()-2);
 var F=["0-1","3-21","4-1","8-7","9-12","10-2","10-15","10-20","11-25",gf.getMonth()+"-"+gf.getDate()],n=0;
 for(var d=1;d<32;d++){var w=new Date(y,mo,d).getDay();if(w&&w<6&&F.indexOf(mo+"-"+d)<0&&++n===5)return new Date(y,mo,d,23,59).getTime()}}
function cmT(S,mi){var L=S.filter(s=>s[19]===mi);if(!L.length)return null;var M0=new Date(B,mi-1,1),y=M0.getFullYear(),mo=M0.getMonth(),last=Math.max.apply(null,L.map(s=>s[0]));
 var P=L.filter(s=>(+s[17]||0)!==0&&(s[16]===null||s[16]===undefined||s[16]===""));if(!P.length)return null;/*todos os custos digitados: tarefa sai do ar*/var cr=Math.min(new Date(y,mo,last+2,9).getTime(),new Date(y,mo+1,1,9).getTime());return{mi:mi,L:P,cr:cr,due:bd5(y,mo+1),mn:["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"][mo]}}

function custos(cfg){if(!cfg||!cfg.custos)return[];var n=new Date(),now=n.getTime(),m=(n.getFullYear()-B)*12+n.getMonth()+1,S=(window.DROMDATA&&DROMDATA.S)||[],o=[];
 [m-1,m].forEach(mi=>{var c=cmT(S,mi);if(!c||now<c.cr||now>c.due+3*24*H)return;var dd=new Date(c.due);
  o.push({id:"cm-"+mi,mi:mi,k:"cm",ev:"Shows de "+c.mn+" finalizados!",tx:"Você deve informar os custos até "+p2(dd.getDate())+"/"+p2(dd.getMonth()+1)+" dentro do aplicativo ou em seu grupo financeiro.",due:c.due,rem:{p:3},L:c.L})});return o}
/* união dos snapshots (igual ao Hub); ed = edição no Hub: popup, sino e faixa voltam a avisar com o texto/prazo novos */
function mg(A){A=A.filter(x=>x&&x.ts).sort((a,b)=>a.ts-b.ts);var c=A[A.length-1]||{ts:0,cfg:{},T:[]},M={},O=[];A.forEach(s=>(s.T||[]).forEach(t=>{var p=M[t.id];if(!p)O.push(t.id);else if((t.ed||0)<(p.ed||0))return;else if((t.ed||0)===(p.ed||0)){t=Object.assign({},t);var u=(p.xf||[]).concat(t.xf||[]);t.xf=u.filter((f,i)=>u.indexOf(f)===i);if(!t.x&&p.x)t.x=p.x}if(t.xf)t.xf=t.xf.filter(f=>(t.to||[]).indexOf(f)>=0);M[t.id]=t}));return{ts:c.ts,cfg:c.cfg||{},T:O.map(id=>M[id])}}
var sk=x=>x.id+(x.ed?"@"+x.ed:"");
async function load(){var cur=mg(await list("tarefas"));
 var ok=await list("tarok");ok.forEach(x=>{if(x&&(x.f===F||String(x.f).endsWith("/"+F)))DONE[x.id]=x.ts});(ls.g("done")||[]).forEach(id=>DONE[id]=DONE[id]||1);
 T=(cur.T||[]).filter(x=>{if(x.x)return false;x._f=(x.to||[]).find(g=>(g===F||g.endsWith("/"+F))&&!(x.xf||[]).includes(g));return !!x._f}).concat(custos(cur.cfg)).filter(x=>!DONE[x.id]).sort((a,b)=>a.due-b.due);
 bar();bell();auto()}
function bell(){if(!window.DROMNADD)return;var sn=ls.g("bell")||[],L=T.filter(x=>sn.indexOf(sk(x))<0);if(!L.length)return;L.forEach(x=>sn.push(sk(x)));ls.s("bell",sn.slice(-100));DROMNADD(L.map(x=>({t:lb(x),b:"Prazo: "+pz(x.due)})))}
function auto(){if(document.querySelector(".tpo"))return;var seen=ls.g("seen")||{},now=Date.now();
 var x=T.find(x=>{var s=seen[sk(x)];if(!s)return true;var rp=x.rem&&"p" in x.rem?x.rem.p:3;if(rp===null)return false;/* em branco no Hub = sem popups repetidos */var p=(rp||3)*H;return red(x)&&now-s>=p});if(x)pop(x)}
function bar(){var o=document.querySelector(".tbr");if(o)o.remove();var x=T[0];if(!x||sessionStorage.getItem("tbrx"+F)===sk(x))return;
 var b=document.createElement("div");b.className="tbr"+(red(x)?" rd":"");b.innerHTML="<i>!</i><span>"+esc(lb(x))+". Prazo: <b>"+esc(pz(x.due))+"</b></span><button type=button aria-label=Fechar>✕</button>";
 b.onclick=e=>{if(e.target.tagName==="BUTTON"){sessionStorage.setItem("tbrx"+F,sk(x));b.remove();return}pop(x)};document.body.appendChild(b)}
function pop(x){var seen=ls.g("seen")||{};seen[sk(x)]=Date.now();ls.s("seen",seen);var cm=x.k==="cm",m=document.createElement("div");m.className="tpo"+(red(x)?" rd":"");
 var lst=cm&&x.L?'<div class="tl">Shows do mês: <b>'+x.L.length+"</b><ul>"+x.L.slice(0,8).map(s=>"<li>"+esc(W[new Date(B,s[19]-1,s[0]).getDay()].replace(/^./,c=>c.toUpperCase())+" "+p2(s[0])+"/"+p2((s[19]-1)%12+1)+" · "+(s[1]||s[2]||""))+"</li>").join("")+"</ul></div>":"";
 m.innerHTML='<div role="dialog" aria-modal="true"><div class="th">'+esc(tn(x))+'</div><div class="tb">'+(x.ev?"<h3>"+esc(x.ev)+"</h3>":"")+'<span class="tz">Prazo: '+esc(pz(x.due,1))+"</span><p>"+esc(x.tx||"")+"</p>"+lst+
  '<div class="tbt"><button class="t0" type="button">'+(cm?"Depois":"Lembrar depois")+'</button><button class="t1" type="button">'+(cm?"Informar custos agora":"Já enviei")+"</button></div></div></div>";
 document.body.appendChild(m);m.onclick=e=>{if(e.target===m)m.remove()};m.querySelector(".t0").onclick=()=>m.remove();
 m.querySelector(".t1").onclick=()=>{if(cm){m.remove();try{view="m";MO=x.mi;YR=YF(MO);flt="T";selD=null}catch(e){}var f=document.querySelector('nav button[data-t="a"]');if(f)f.click();else try{tab="a";draw()}catch(e){}return}conf(x,m)}}
function conf(x,pm){var c=document.createElement("div");c.className="tpo cf";c.innerHTML='<div role="dialog" aria-modal="true"><div class="th">Confirmação</div><div class="tb"><p style="font-size:17px;font-weight:600">Confirma o envio das informações solicitadas?</p><div class="tbt"><button class="t0" type="button">Cancelar</button><button class="t1" type="button">Sim, já enviei</button></div></div></div>';
 document.body.appendChild(c);c.querySelector(".t0").onclick=()=>c.remove();
 c.querySelector(".t1").onclick=async()=>{c.remove();pm.remove();DONE[x.id]=Date.now();var d=ls.g("done")||[];d.push(x.id);ls.s("done",d.slice(-100));T=T.filter(y=>y.id!==x.id);bar();
  try{var iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv:iv},K,new TextEncoder().encode(JSON.stringify({id:x.id,f:x._f||F,ts:Date.now()}))));
   await fetch(URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain"},body:JSON.stringify({app:"tarok",iv:b6(iv),ct:b6(ct)})})}catch(e){}}}
window.DROMTAR={reload:load,list:()=>T};
load();document.addEventListener("visibilitychange",()=>{if(!document.hidden)load()});setInterval(()=>{if(!document.hidden)auto()},10*60e3);
})();
