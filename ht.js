/* DROM Hub · aba Tarefas (3ª posição do menu, ícone de sino): cria tarefas para os artistas e acompanha.
   Estado salvo no Apps Script (app "tarefas", criptografado com a chave dos apps); "Já enviei" dos artistas vem de "tarok".
   Push: tools/tarefas.mjs (Action notify.yml, a cada 10 min). Custos do mês: chave "Ativar" no card Tarefas automáticas (cfg.custos). */
(function(){
var URL="https://script.google.com/macros/s/AKfycbzk5iksIZVvdK27taLTcpQbdPebxGjP7ilwNxiQDYwUuTSaMz80Hifmgr-5aazWhI0R/exec";
var TN={eq:"Envio de equipe",vc:"Vídeo de chamada",ot:"Outra tarefa",cm:"Custos do mês"},B=2023;
var tn=t=>t.k==="ot"&&t.ti?t.ti:TN[t.k]||"Tarefa";
var TX={eq:"Sua equipe será de até 3 pessoas, identificadas pelo nome completo e CPF. Indique em seu grupo artístico a equipe e a placa de carro (caso vá utilizar o estacionamento).",
 vc:"O evento solicitou a gravação de vídeo de chamada. O vídeo deve ter 15s, convidando o público para o evento, citando data e local. Envie o vídeo em seu grupo artístico."};
var REM={p:3,h:9,f:2};
var b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),b6=u=>btoa(String.fromCharCode.apply(null,u)),p2=n=>String(n).padStart(2,"0");
var esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
var $=id=>document.getElementById(id),ST=null,OK=[],SEL=[],BUSY=0;
var st=document.createElement("style");st.textContent=
"#tv{padding:4px 16px 120px;max-width:760px;margin:0 auto}#tv h2{font-size:15px;letter-spacing:.5px;text-transform:uppercase;margin:18px 2px 10px}"+
"#tv .tcd{background:var(--cd);border:1px solid var(--bd);border-radius:16px;padding:14px}#tv .tg{display:grid;grid-template-columns:1fr 1fr;gap:10px}"+
"#tv label{display:block;font-size:13px;color:var(--mu);margin:10px 0 5px}#tv select,#tv input,#tv textarea{width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--bd);border-radius:10px;font-family:inherit;font-size:15px;background:var(--cd);color:var(--tx)}"+
"#tv textarea{min-height:96px;resize:vertical}#tv .tch{display:flex;flex-wrap:wrap;gap:6px}#tv .tch button{border:1.5px solid var(--ac);background:none;color:var(--ac);border-radius:16px;padding:5px 11px;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer}#tv .tch button.on{background:var(--ac);color:var(--acx)}"+
"#tv .trm{font-size:12.5px;line-height:1.35;color:var(--tx)}#tv .trm>div{display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-top:1px solid var(--bd)}#tv .trm>div:first-child{border-top:0}#tv .trm input{width:50px;padding:3px 5px;text-align:center;font-size:13px;flex:none}#tv .trm small{display:block;color:var(--mu);font-size:11.5px;margin-top:1px}"+"#tv .tch button:disabled{opacity:.3;cursor:not-allowed}"+
"#tv .tbn{width:100%;margin-top:14px;background:var(--ac);color:var(--acx);border:0;border-radius:12px;padding:13px;font-family:inherit;font-weight:800;font-size:15px;cursor:pointer}#tv .tbn:disabled{opacity:.5}"+
"#tv .tms{font-size:13px;color:var(--mu);margin:8px 0 0;min-height:1em}#tv .tau{display:flex;align-items:center;gap:10px}#tv .tau div{flex:1}#tv .tau small{display:block;color:var(--mu);font-size:12.5px}"+
"#tv .tsw{position:relative;width:46px;height:26px;border-radius:13px;border:0;background:#c9c9c9;cursor:pointer;flex:none}#tv .tsw::after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .15s}#tv .tsw.on{background:var(--ac)}#tv .tsw.on::after{left:23px}"+
"#tv table{width:100%;border-collapse:collapse;font-size:13px;background:var(--cd);border-radius:14px;overflow:hidden}#tv th{background:#0000FF;color:#fff;text-align:left;padding:8px;font-size:12px}#tv td{padding:8px;border-bottom:1px solid var(--bd);vertical-align:top}"+
"#tv .tt{display:inline-block;border-radius:8px;padding:2px 7px;font-weight:700;font-size:12px}#tv .tt.ok{background:var(--okb);color:var(--ok)}#tv .tt.pd{background:#fff6c8;color:#7a5d00}#tv .tt.rd{background:#ffe5e5;color:#c00}#tv .tt.gy{background:#eee;color:#666}"+
"#tv .tg+.tch,#tv .tch+textarea,#tv .tcd>input,#tv #ttx{margin-top:10px}#tv .trh{font-size:13px;color:var(--mu);margin:12px 0 4px;font-weight:700}#tv select:invalid,#tv select.ph{color:var(--mu)}"+
"#tv .tlk{border:0;background:none;color:var(--ac);font-family:inherit;font-weight:700;font-size:12.5px;cursor:pointer;padding:4px 0}#tv .mu{color:var(--mu)}#tv tr[data-v]{cursor:pointer}#tv tr[data-v]:hover td{background:rgba(0,0,255,.04)}"+
".tvw{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:0 18px}.tvw>div{background:#fff;color:#111;border-radius:18px;width:100%;max-width:440px;max-height:88vh;overflow:auto;box-shadow:0 10px 30px rgba(0,0,0,.3)}.tvw .th{background:#0000FF;color:#fff;font-weight:800;font-size:16px;padding:12px 16px}.tvw .tb{padding:16px}.tvw h3{margin:0 0 10px;font-size:17px}.tvw .tz{display:inline-block;background:#eceeff;color:#0000FF;font-weight:800;border-radius:8px;padding:5px 10px;font-size:14px;margin-bottom:10px}.tvw p{margin:0 0 12px;font-size:15px;line-height:1.45;white-space:pre-line}.tvw small{display:block;color:#777;font-size:12px;margin-bottom:12px}.tvw .tbn{width:100%}";
document.head.appendChild(st);
function H(){return window.DROMHUB?window.DROMHUB():null}
async function dec(K,x){var t=await crypto.subtle.decrypt({name:"AES-GCM",iv:b64(x.iv)},K,b64(x.ct));return JSON.parse(new TextDecoder().decode(t))}
async function list(K,app){var r=await fetch(URL+"?app="+app+"&t="+Date.now());var l=await r.json(),o=[];for(var x of l){try{o.push(await dec(K,x))}catch(e){}}return o}
async function load(){var h=H();var A=await list(h.AK,"tarefas");ST=A.filter(x=>x&&x.ts).sort((a,b)=>b.ts-a.ts)[0]||{ts:0,cfg:{custos:false},T:[]};ST.cfg=ST.cfg||{custos:false};ST.T=ST.T||[];
 OK=(await list(h.AK,"tarok")).filter(x=>x&&x.id)}
async function save(){var h=H();ST.ts=Date.now();var iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv:iv},h.AK,new TextEncoder().encode(JSON.stringify(ST))));
 await fetch(URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain"},body:JSON.stringify({app:"tarefas",iv:b6(iv),ct:b6(ct)})})}
var fdt=t=>{var d=new Date(t);return p2(d.getDate())+"/"+p2(d.getMonth()+1)+(d.getHours()===23&&d.getMinutes()===59?"":" "+p2(d.getHours())+":"+p2(d.getMinutes()))};
var loc=t=>{var d=new Date(t);return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())+"T"+p2(d.getHours())+":"+p2(d.getMinutes())};
function apps(){return H().CFG.apps.filter(a=>!a.old)}
function evs(){var h=H(),now=Date.now(),M={};apps().forEach(a=>{var d=h.DATA[a.f];if(!d)return;d.S.forEach(s=>{var t=h.ini(s);if(t<now)return;var nmv=s[1]||s[2]||"",k=s[19]+"|"+s[0]+"|"+nmv;(M[k]=M[k]||{k:k,t:t,n:nmv,m:s[19],d:s[0],f:[]}).f.push(a.f)})});
 return Object.values(M).filter(e=>!SEL.length||e.f.some(f=>SEL.indexOf(f)>=0)).sort((a,b)=>a.t-b.t)}
/* Prazo padrão. eq: quarta-feira 22:00 da semana (seg–dom) do evento; se já passou ou não é antes do evento: véspera 22:00; senão agora+2h (hora cheia, limitado ao início do evento).
   vc: criação + 48 h, arredondado para a próxima hora cheia. ot: vazio (definido pelo usuário). */
var up=t=>{var d=new Date(t);if(d.getMinutes()||d.getSeconds()||d.getMilliseconds()){d.setMinutes(60,0,0)}return d.getTime()};
function dflt(k,e,now){now=now||Date.now();if(k==="vc")return loc(up(now+48*36e5));if(k!=="eq"||!e)return"";
 var D=new Date(B,e.m-1,e.d),ev=e.t||new Date(B,e.m-1,e.d,23,59).getTime(),w=new Date(D.getFullYear(),D.getMonth(),D.getDate()-(D.getDay()+6)%7+2,22,0).getTime();
 if(w>now&&w<ev)return loc(w);var v=new Date(D.getFullYear(),D.getMonth(),D.getDate()-1,22,0).getTime();if(v>now&&v<ev)return loc(v);
 return loc(Math.max(now+60e3,Math.min(up(now+2*36e5),ev)))}
window.DROMHTD=dflt;
function draw(){var h=H(),v=$("tv");if(!h||!h.CFG){v.innerHTML="";return}
 if(!h.AK){v.innerHTML='<p class="mu" style="padding:20px">Tarefas: use o DROM Hub do GitHub (dromentretenimento.com/sistema).</p>';return}
 if(!ST){v.innerHTML='<p class="mu" style="padding:20px">Carregando tarefas…</p>';return}
 var E=evs(),k=v.dataset.k||"eq",CE=E.find(x=>x.k===v.dataset.ev)||null;if(CE)SEL=SEL.filter(f=>CE.f.indexOf(f)>=0);
 var o='<h2>Nova tarefa</h2><div class="tcd"><div class="tg"><select id="tk" aria-label="Tipo de tarefa"><option value="eq">Envio de equipe</option><option value="vc">Vídeo de chamada</option><option value="ot">Outra tarefa</option></select>'+
  '<select id="tev" aria-label="Evento da agenda"><option value="">Selecione evento</option>'+E.map((e,i)=>'<option value="'+esc(e.k)+'">'+p2(e.d)+"/"+p2((e.m-1)%12+1)+" · "+esc(e.n)+"</option>").join("")+"</select></div>"+
  (k==="ot"?'<input id="tti" type="text" maxlength="60" placeholder="Título da tarefa (aparece na notificação)" aria-label="Título da tarefa" style="margin-top:10px">':"")+
  '<div class="tch" style="margin-top:10px" aria-label="Para quem"><button type="button" data-f="*">Todos os artistas</button>'+apps().map(a=>'<button type="button" data-f="'+a.f+'" class="'+(SEL.indexOf(a.f)>=0?"on":"")+'"'+(CE&&CE.f.indexOf(a.f)<0?" disabled":"")+'>'+esc(h.nm(a))+"</button>").join("")+"</div>"+(CE?'<p class="tms" style="margin-top:4px">Só os artistas que tocam neste evento podem ser escolhidos.</p>':"")+
  '<textarea id="ttx" placeholder="'+(k==="ot"?"Texto da tarefa: o que o artista deve fazer":"Texto da tarefa (editável)")+'" aria-label="Texto da tarefa"></textarea>'+
  '<input id="tdu" type="text" placeholder="Prazo: escolha data e hora" aria-label="Prazo" style="margin-top:10px"><div><div class="trh">Lembretes</div><div class="trm">'+
'<div><input id="rp" type="number" min="1" max="24" value="'+REM.p+'"><span><b>horas entre popups no dia do prazo</b><small>No dia do prazo, o aviso abre de novo no app a cada tantas horas, até o artista tocar em "Já enviei".</small></span></div>'+
   '<div><input id="rh" type="number" min="0" max="23" value="'+REM.h+'"><span><b>hora do push diário</b><small>No dia do prazo (e nos dias de atraso), o celular recebe um push a partir desta hora.</small></span></div>'+
   '<div><input id="rf" type="number" min="0" max="12" value="'+REM.f+'"><span><b>horas finais com push de hora em hora</b><small>Nas últimas horas antes do prazo, e depois que ele vencer, chega um push a cada hora (das 8h às 22h).</small></span></div>'+
  '</div></div>'+
  '<button class="tbn" id="tgo" type="button">Enviar tarefa</button><p class="tms" id="tms"></p></div>'+
  '<h2>Tarefas automáticas</h2><div class="tcd tau"><div><b>Custos do mês</b><small>Pede os custos dos shows do mês 2 dias depois do último show do mês na agenda, ou no dia 1º do mês seguinte, o que vier primeiro. Prazo: 5º dia útil do mês seguinte (segunda a sexta, sem feriados nacionais). '+(ST.cfg.custos?"Ativada.":"Desativada.")+'</small></div><button type="button" class="tsw'+(ST.cfg.custos?" on":"")+'" id="tcu" aria-label="Ativar Custos do mês"></button></div>'+
  "<h2>Acompanhamento</h2>"+trk();
 v.innerHTML=o;$("tk").value=k;
 var tx=$("ttx"),du=$("tdu"),ev=$("tev"),ti=$("tti");if(v.dataset.du===undefined&&k==="vc")v.dataset.du=dflt(k,CE);tx.value=v.dataset.tx!=null?v.dataset.tx:(TX[k]||"");du.value=v.dataset.du||"";if(du.value)du.type="datetime-local";ev.value=v.dataset.ev||"";ev.classList.toggle("ph",!ev.value);if(ti){ti.value=v.dataset.ti||"";ti.oninput=()=>v.dataset.ti=ti.value}
 du.onfocus=()=>{if(du.type!=="datetime-local"){du.type="datetime-local";try{du.showPicker&&du.showPicker()}catch(e){}}};du.onblur=()=>{if(!du.value)du.type="text"};
 tx.oninput=()=>v.dataset.tx=tx.value;du.oninput=du.onchange=()=>{v.dataset.du=du.value;v.dataset.duu=1};
 $("tk").onchange=()=>{var nk=$("tk").value;if(v.dataset.tx==null||v.dataset.tx===(TX[k]||""))delete v.dataset.tx;v.dataset.k=nk;var e=E.find(x=>x.k===ev.value);if(nk==="ot"){if(!v.dataset.duu)v.dataset.du=""}else{v.dataset.du=dflt(nk,e);delete v.dataset.duu}draw()};
 ev.onchange=()=>{v.dataset.ev=ev.value;var e=E.find(x=>x.k===ev.value);if(e)SEL=e.f.slice();if(k!=="ot"){v.dataset.du=dflt(k,e);delete v.dataset.duu}draw()};
 v.querySelectorAll(".tch button").forEach(b=>b.onclick=()=>{var f=b.dataset.f,P=CE?CE.f:apps().map(a=>a.f);if(f!=="*"&&P.indexOf(f)<0)return;if(f==="*")SEL=SEL.length===P.length?[]:P.slice();else SEL=SEL.indexOf(f)>=0?SEL.filter(x=>x!==f):SEL.concat(f);draw()});
 $("tgo").onclick=send;
 $("tcu").onclick=async()=>{if(BUSY)return;BUSY=1;ST.cfg.custos=!ST.cfg.custos;try{await save()}catch(e){}BUSY=0;draw()};
 v.querySelectorAll("[data-x]").forEach(b=>b.onclick=async e=>{e.stopPropagation();var t=ST.T.find(x=>x.id===b.dataset.x),f=b.dataset.f,h=H(),a=h.CFG.apps.find(x=>x.f===f);if(!t||!confirm("Encerrar a tarefa \""+tn(t)+(t.ev?" · "+t.ev:"")+"\" para "+(a?h.nm(a):f)+"?"))return;t.xf=(t.xf||[]).concat(f);if(t.to.every(g=>t.xf.indexOf(g)>=0||OK.some(x=>x.id===t.id&&x.f===g)))t.x=Date.now();await save();draw()});
 v.querySelectorAll("tr[data-v]").forEach(r=>r.onclick=()=>{var t=ST.T.find(x=>x.id===r.dataset.v);if(!t)return;var m=document.createElement("div");m.className="tvw";
  m.innerHTML='<div role="dialog" aria-modal="true"><div class="th">'+esc(tn(t))+'</div><div class="tb">'+(t.ev?"<h3>"+esc(t.ev)+"</h3>":"")+'<span class="tz">Prazo: '+fdt(t.due)+'</span><p>'+esc(t.tx||"")+'</p><small>Enviada em '+fdt(t.cr)+" para "+esc(r.dataset.n)+'</small><button type="button" class="tbn">Fechar</button></div></div>';
  document.body.appendChild(m);m.onclick=e=>{if(e.target===m||e.target.tagName==="BUTTON")m.remove()}})}
function trk(){var h=H(),now=Date.now(),R=[];ST.T.slice().sort((a,b)=>(!!a.x-!!b.x)||a.due-b.due).forEach(t=>(t.to||[]).forEach(f=>{var a=h.CFG.apps.find(x=>x.f===f),ok=OK.filter(x=>x.id===t.id&&x.f===f).sort((p,q)=>p.ts-q.ts)[0];
  var xx=t.x||(t.xf||[]).indexOf(f)>=0,sit=ok?'<span class="tt ok">Enviado '+fdt(ok.ts)+"</span>":xx?'<span class="tt gy">encerrada</span>':t.due<now?'<span class="tt rd">atrasada</span>':'<span class="tt pd">pendente</span>';
  R.push('<tr data-v="'+t.id+'" data-n="'+esc(a?h.nm(a):f)+'" title="Ver texto completo"><td><b>'+esc(tn(t))+"</b>"+(t.ev?" · "+esc(t.ev):"")+"<br>"+esc(a?h.nm(a):f)+'</td><td>'+fdt(t.due)+'</td><td>'+fdt(t.cr)+"</td><td>"+sit+(!xx&&!ok?'<br><button class="tlk" data-x="'+t.id+'" data-f="'+esc(f)+'">Encerrar</button>':"")+"</td></tr>")}));
 return R.length?"<table><tr><th>Tarefa · artista</th><th>Prazo</th><th>Enviada</th><th>Situação</th></tr>"+R.join("")+"</table>":'<p class="mu">Nenhuma tarefa enviada ainda.</p>'}
async function send(){var v=$("tv"),m=$("tms"),k=$("tk").value,tx=$("ttx").value.trim(),du=$("tdu").value,e=evs().find(x=>x.k===$("tev").value);
 if(e)SEL=SEL.filter(f=>e.f.indexOf(f)>=0);if(!SEL.length){m.textContent="Escolha para quem.";return}var ti=k==="ot"?($("tti").value||"").trim():"";if(k==="ot"&&!ti){m.textContent="Escreva o título da tarefa.";return}if(!tx){m.textContent="Escreva o texto.";return}if(!du){m.textContent="Escolha o prazo.";return}
 var t=new Date(du).getTime(),n=x=>{var s=String($(x).value||"").trim();return s===""?null:Math.max(0,parseInt(s,10)||0)}/* em branco = lembrete desligado (null) */;if(!(t>Date.now())){m.textContent="O prazo precisa ser no futuro.";return}
 $("tgo").disabled=true;m.textContent="Enviando…";
 try{await load();ST.T.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),k:k,ti:ti||undefined,ev:e?e.n:"",tx:tx,due:t,to:SEL.slice(),rem:{p:n("rp"),h:n("rh"),f:n("rf")},cr:Date.now()});await save();
  SEL=[];["tx","du","duu","ev","ti"].forEach(x=>delete v.dataset[x]);draw();$("tms").textContent="✓ Tarefa enviada. O push chega aos artistas em até 10 minutos."}
 catch(er){m.textContent="Não foi possível enviar: "+(er.message||er);$("tgo").disabled=false}}
window.DROMHT=async function(){var h=H();if(!h||!h.AK){draw();return}draw();try{await load()}catch(e){ST=ST||{ts:0,cfg:{custos:false},T:[]}}draw()};
})();
