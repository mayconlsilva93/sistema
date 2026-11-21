/* DROM Hub · aba Tarefas (3ª posição do menu, ícone de sino): cria tarefas para os artistas e acompanha.
   Estado salvo no Apps Script (app "tarefas", criptografado com a chave dos apps); "Já enviei" dos artistas vem de "tarok".
   Push: tools/tarefas.mjs (Action notify.yml, a cada 10 min). Custos do mês: chave "Ativar" no card Tarefas automáticas (cfg.custos). */
(function(){
var URL="https://script.google.com/macros/s/AKfycbzk5iksIZVvdK27taLTcpQbdPebxGjP7ilwNxiQDYwUuTSaMz80Hifmgr-5aazWhI0R/exec";
var TN={eq:"Envio de equipe",vc:"Vídeo de chamada",cm:"Custos do mês"},B=2023;
var TX={eq:"Sua equipe será de até 3 pessoas, identificadas pelo nome completo e CPF. Indique em seu grupo artístico a equipe e a placa de carro, caso vá utilizar o estacionamento.",
 vc:"O evento solicitou a gravação de vídeo de chamada. Envie o vídeo em seu grupo artístico."};
var REM={p:3,h:9,f:2};
var b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),b6=u=>btoa(String.fromCharCode.apply(null,u)),p2=n=>String(n).padStart(2,"0");
var esc=t=>String(t==null?"":t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
var $=id=>document.getElementById(id),ST=null,OK=[],SEL=[],BUSY=0;
var st=document.createElement("style");st.textContent=
"#tv{padding:4px 16px 120px;max-width:760px;margin:0 auto}#tv h2{font-size:15px;letter-spacing:.5px;text-transform:uppercase;margin:18px 2px 10px}"+
"#tv .tcd{background:var(--cd);border:1px solid var(--bd);border-radius:16px;padding:14px}#tv .tg{display:grid;grid-template-columns:1fr 1fr;gap:10px}"+
"#tv label{display:block;font-size:13px;color:var(--mu);margin:10px 0 5px}#tv select,#tv input,#tv textarea{width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--bd);border-radius:10px;font-family:inherit;font-size:15px;background:var(--cd);color:var(--tx)}"+
"#tv textarea{min-height:96px;resize:vertical}#tv .tch{display:flex;flex-wrap:wrap;gap:6px}#tv .tch button{border:1.5px solid var(--ac);background:none;color:var(--ac);border-radius:16px;padding:5px 11px;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer}#tv .tch button.on{background:var(--ac);color:var(--acx)}"+
"#tv .trm{font-size:14px;line-height:2;color:var(--tx)}#tv .trm input{width:52px;padding:4px 6px;text-align:center;display:inline-block}"+
"#tv .tbn{width:100%;margin-top:14px;background:var(--ac);color:var(--acx);border:0;border-radius:12px;padding:13px;font-family:inherit;font-weight:800;font-size:15px;cursor:pointer}#tv .tbn:disabled{opacity:.5}"+
"#tv .tms{font-size:13px;color:var(--mu);margin:8px 0 0;min-height:1em}#tv .tau{display:flex;align-items:center;gap:10px}#tv .tau div{flex:1}#tv .tau small{display:block;color:var(--mu);font-size:12.5px}"+
"#tv .tsw{position:relative;width:46px;height:26px;border-radius:13px;border:0;background:#c9c9c9;cursor:pointer;flex:none}#tv .tsw::after{content:'';position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .15s}#tv .tsw.on{background:var(--ac)}#tv .tsw.on::after{left:23px}"+
"#tv table{width:100%;border-collapse:collapse;font-size:13px;background:var(--cd);border-radius:14px;overflow:hidden}#tv th{background:#0000FF;color:#fff;text-align:left;padding:8px;font-size:12px}#tv td{padding:8px;border-bottom:1px solid var(--bd);vertical-align:top}"+
"#tv .tt{display:inline-block;border-radius:8px;padding:2px 7px;font-weight:700;font-size:12px}#tv .tt.ok{background:var(--okb);color:var(--ok)}#tv .tt.pd{background:#fff6c8;color:#7a5d00}#tv .tt.rd{background:#ffe5e5;color:#c00}#tv .tt.gy{background:#eee;color:#666}"+
"#tv .tlk{border:0;background:none;color:var(--ac);font-family:inherit;font-weight:700;font-size:12.5px;cursor:pointer;padding:4px 0}#tv .mu{color:var(--mu)}";
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
function dflt(k,e){if(!e)return"";var d=new Date(B,e.m-1,e.d,k==="vc"?12:18,0);var ev=d.getTime();d.setDate(d.getDate()-(k==="vc"?3:2));if(d.getTime()<Date.now()+3*36e5)d=new Date(Math.max(ev,Date.now()+3*36e5));d.setSeconds(0,0);return loc(d.getTime())}
function draw(){var h=H(),v=$("tv");if(!h||!h.CFG){v.innerHTML="";return}
 if(!h.AK){v.innerHTML='<p class="mu" style="padding:20px">Tarefas: use o DROM Hub do GitHub (dromentretenimento.com/sistema).</p>';return}
 if(!ST){v.innerHTML='<p class="mu" style="padding:20px">Carregando tarefas…</p>';return}
 var E=evs(),k=v.dataset.k||"eq";
 var o='<h2>Nova tarefa</h2><div class="tcd"><div class="tg"><div><label>Tipo</label><select id="tk"><option value="eq">Envio de equipe</option><option value="vc">Vídeo de chamada</option></select></div>'+
  '<div><label>Evento (da agenda)</label><select id="tev"><option value="">—</option>'+E.map((e,i)=>'<option value="'+esc(e.k)+'">'+p2(e.d)+"/"+p2((e.m-1)%12+1)+" · "+esc(e.n)+"</option>").join("")+"</select></div></div>"+
  '<label>Para quem</label><div class="tch"><button type="button" data-f="*">Todos</button>'+apps().map(a=>'<button type="button" data-f="'+a.f+'" class="'+(SEL.indexOf(a.f)>=0?"on":"")+'">'+esc(h.nm(a))+"</button>").join("")+"</div>"+
  '<label>Texto (já vem do modelo do tipo, editável)</label><textarea id="ttx"></textarea>'+
  '<label>Prazo</label><input id="tdu" type="datetime-local"><div><label>Lembretes (padrão, editável)</label><div class="trm">Popup a cada <input id="rp" type="number" min="1" max="24" value="'+REM.p+'"> h no dia · push às <input id="rh" type="number" min="0" max="23" value="'+REM.h+'"> h · de hora em hora nas <input id="rf" type="number" min="0" max="12" value="'+REM.f+'"> h finais e depois de vencer</div></div>'+
  '<button class="tbn" id="tgo" type="button">Enviar tarefa</button><p class="tms" id="tms"></p></div>'+
  '<h2>Tarefas automáticas</h2><div class="tcd tau"><div><b>Custos do mês</b><small>No dia 1º, pede os custos dos shows do mês anterior (prazo dia 7). '+(ST.cfg.custos?"Ativada.":"Desativada.")+'</small></div><button type="button" class="tsw'+(ST.cfg.custos?" on":"")+'" id="tcu" aria-label="Ativar Custos do mês"></button></div>'+
  "<h2>Acompanhamento</h2>"+trk();
 v.innerHTML=o;$("tk").value=k;
 var tx=$("ttx"),du=$("tdu"),ev=$("tev");tx.value=v.dataset.tx||TX[k];du.value=v.dataset.du||"";ev.value=v.dataset.ev||"";
 tx.oninput=()=>v.dataset.tx=tx.value;du.oninput=()=>v.dataset.du=du.value;
 $("tk").onchange=()=>{var nk=$("tk").value;if(!v.dataset.tx||v.dataset.tx===TX[k])delete v.dataset.tx;v.dataset.k=nk;var e=E.find(x=>x.k===ev.value);if(e)v.dataset.du=dflt(nk,e);draw()};
 ev.onchange=()=>{v.dataset.ev=ev.value;var e=E.find(x=>x.k===ev.value);if(e){SEL=e.f.slice();v.dataset.du=dflt(k,e)}draw()};
 v.querySelectorAll(".tch button").forEach(b=>b.onclick=()=>{var f=b.dataset.f;if(f==="*")SEL=SEL.length===apps().length?[]:apps().map(a=>a.f);else SEL=SEL.indexOf(f)>=0?SEL.filter(x=>x!==f):SEL.concat(f);draw()});
 $("tgo").onclick=send;
 $("tcu").onclick=async()=>{if(BUSY)return;BUSY=1;ST.cfg.custos=!ST.cfg.custos;try{await save()}catch(e){}BUSY=0;draw()};
 v.querySelectorAll("[data-x]").forEach(b=>b.onclick=async()=>{var t=ST.T.find(x=>x.id===b.dataset.x);if(!t||!confirm("Encerrar a tarefa \""+TN[t.k]+(t.ev?" · "+t.ev:"")+"\" para todos?"))return;t.x=Date.now();await save();draw()})}
function trk(){var h=H(),now=Date.now(),R=[];ST.T.slice().sort((a,b)=>(!!a.x-!!b.x)||a.due-b.due).forEach(t=>(t.to||[]).forEach(f=>{var a=h.CFG.apps.find(x=>x.f===f),ok=OK.filter(x=>x.id===t.id&&x.f===f).sort((p,q)=>p.ts-q.ts)[0];
  var sit=ok?'<span class="tt ok">Já enviei '+fdt(ok.ts)+"</span>":t.x?'<span class="tt gy">encerrada</span>':t.due<now?'<span class="tt rd">atrasada</span>':'<span class="tt pd">pendente</span>';
  R.push("<tr><td><b>"+esc(TN[t.k])+"</b>"+(t.ev?" · "+esc(t.ev):"")+"<br>"+esc(a?h.nm(a):f)+'</td><td>'+fdt(t.due)+'</td><td>'+fdt(t.cr)+"</td><td>"+sit+(!t.x&&!ok&&f===t.to.find(g=>!OK.some(x=>x.id===t.id&&x.f===g))?'<br><button class="tlk" data-x="'+t.id+'">Encerrar</button>':"")+"</td></tr>")}));
 return R.length?"<table><tr><th>Tarefa · artista</th><th>Prazo</th><th>Enviada</th><th>Situação</th></tr>"+R.join("")+"</table>":'<p class="mu">Nenhuma tarefa enviada ainda.</p>'}
async function send(){var v=$("tv"),m=$("tms"),k=$("tk").value,tx=$("ttx").value.trim(),du=$("tdu").value,e=evs().find(x=>x.k===$("tev").value);
 if(!SEL.length){m.textContent="Escolha para quem.";return}if(!tx){m.textContent="Escreva o texto.";return}if(!du){m.textContent="Escolha o prazo.";return}
 var t=new Date(du).getTime(),n=x=>Math.max(0,parseInt($(x).value,10)||0);if(!(t>Date.now())){m.textContent="O prazo precisa ser no futuro.";return}
 $("tgo").disabled=true;m.textContent="Enviando…";
 try{await load();ST.T.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),k:k,ev:e?e.n:"",tx:tx,due:t,to:SEL.slice(),rem:{p:n("rp")||3,h:n("rh"),f:n("rf")},cr:Date.now()});await save();
  SEL=[];delete v.dataset.tx;delete v.dataset.du;delete v.dataset.ev;draw();$("tms").textContent="✓ Tarefa enviada. O push chega aos artistas em até 10 minutos."}
 catch(er){m.textContent="Não foi possível enviar: "+(er.message||er);$("tgo").disabled=false}}
window.DROMHT=async function(){var h=H();if(!h||!h.AK){draw();return}draw();try{await load()}catch(e){ST=ST||{ts:0,cfg:{custos:false},T:[]}}draw()};
})();
