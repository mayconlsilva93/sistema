/* DROM · Avaliação 2026 · formulário do artista (login próprio; dados 2026 ao vivo do app dele; projeção = Painel Geral) */
(function(){
var $=i=>document.getElementById(i),b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),es=AVes,Q=AVQ,C=null,AK=null,ST=null,DG="",PG="",PJ={},CT={},A={},TS=0,CUR=0,SENT=null,LG="",U=null,DT=null;
async function derive(p,salt){var k=await crypto.subtle.importKey("raw",new TextEncoder().encode(p),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt:b64(salt),iterations:200000,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["decrypt"])}
async function dec(k,iv,ct){return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:b64(iv)},k,b64(ct))))}
var ls={g:k=>{try{return JSON.parse(localStorage.getItem("av26_"+k))}catch(e){return null}},s:(k,v)=>{try{localStorage.setItem("av26_"+k,JSON.stringify(v))}catch(e){}}};
var g=t=>C&&C.fem?t.replace(/\(a\)/g,"a"):t.replace(/\(a\)/g,""),NF="não faço";
$("usr").value=ls.g("u")||"";
async function url(){if(U!==null)return U;try{U=(await (await fetch("u.json?v="+Date.now(),{cache:"no-store"})).json()).u||""}catch(e){U=""}return U}
$("lkf").onsubmit=async e=>{e.preventDefault();var u=$("usr").value.trim().toLowerCase(),p=$("pin").value.trim();if(!u||!p)return;$("lkm").textContent="Verificando…";
 try{var L=await (await fetch("a.json?v="+Date.now(),{cache:"no-store"})).json(),x=L[u];if(!x)throw 0;C=await dec(await derive(u+"\n"+p,x.salt),x.iv,x.ct)}catch(er){$("lkm").textContent="Login ou código incorretos.";$("pin").value="";return}
 LG=u;ls.s("u",u);AK=await crypto.subtle.importKey("raw",b64(C.ak),"AES-GCM",false,["decrypt"]);
 var lo=ls.g("a_"+u)||{};A=lo.a||lo;TS=lo.ts||0;SENT=ls.g("s_"+u);CUR=0;
 try{await load()}catch(er){$("lkm").textContent="Sem conexão com os dados. Tente de novo.";return}
 try{var W=await url();if(W){var j=await (await fetch(W+"?k="+encodeURIComponent(u)+"&t="+encodeURIComponent(C.t)+"&z="+Date.now())).json();if(j.ok&&j.d&&(j.d.ts||0)>TS){A=j.d.a||{};TS=j.d.ts;ls.s("a_"+u,{a:A,ts:TS})}if(j.ok&&j.em&&!SENT){SENT=j.em;ls.s("s_"+u,SENT)}}}catch(er){}
 $("lk").remove();$("app").hidden=false;$("av").src="av/"+C.f+".png";$("tt").innerHTML=es(C.n)+"<small>Avaliação do ano 2026 · DROM</small>";
 nav();draw();setInterval(()=>{if(!document.hidden)rt()},180000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)rt();else flush()})};
async function load(){var r=await (await fetch("../../"+C.f+"/d.json?t="+Date.now(),{cache:"no-store"})).json(),p=null;try{p=await (await fetch("pj.json?t="+Date.now(),{cache:"no-store"})).json()}catch(e){}
 if(r.iv===DG&&(!p||p.iv===PG))return 0;DG=r.iv;if(p){PG=p.iv;try{var pp=await dec(AK,p.iv,p.ct);PJ=(pp.P||{})[C.f]||{};CT=(pp.CT||{})[C.f]||{}}catch(e){}}
 var d=await dec(AK,r.iv,r.ct);ST=AVST(d,PJ,CT);ST.up=r.up||"";return 1}
async function rt(){try{if(await load())document.querySelectorAll(".dat").forEach(el=>{el.innerHTML=dh()+AVW(el.dataset.d,ST);AVcount(el)})}catch(e){}}
var dh=()=>'<div class="dh"><i></i>Seus números de 2026 · ao vivo'+(ST.up?" · atualizado "+es(ST.up):"")+'</div>';
function filled(id){var v=A[id];return Array.isArray(v)?v.length>0:v!==undefined&&v!==null&&String(v).trim()!==""}
var QA=[];Q.forEach((s,i)=>s.i.forEach(q=>QA.push([i,q])));
function secDone(i){return Q[i].i.every(q=>filled(q.id))}
function nav(){$("nav").innerHTML=Q.map((s,i)=>'<button type="button" data-i="'+i+'" class="'+(i===CUR?"on ":"")+(secDone(i)?"dn":"")+'">'+es(s.s)+'</button>').join("")+'<button type="button" data-i="'+Q.length+'" class="'+(CUR===Q.length?"on":"")+'">Enviar</button>';
 $("nav").querySelectorAll("button").forEach(b=>b.onclick=()=>go(+b.dataset.i));var on=$("nav").querySelector(".on");if(on)on.scrollIntoView({inline:"center",block:"nearest",behavior:"smooth"});
 var ok=QA.filter(x=>filled(x[1].id)).length;$("pg").firstChild.style.width=(ok/QA.length*100)+"%";$("sv").textContent=(SENT?"enviado ✓ · ":"")+ok+"/"+QA.length}
function go(i){flush();CUR=Math.max(0,Math.min(Q.length,i));ls.s("c_"+LG,CUR);nav();draw();scrollTo({top:0,behavior:"smooth"})}
/* salva no aparelho na hora e no servidor (rascunho, sem e-mail) alguns segundos depois */
function save(){TS=Date.now();ls.s("a_"+LG,{a:A,ts:TS});nav();clearTimeout(DT);DT=setTimeout(flush,2500);$("sv").textContent="salvando…"}
async function flush(){if(!DT)return;clearTimeout(DT);DT=null;var W=await url();if(!W){nav();return}
 try{var r=await (await fetch(W,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({draft:1,k:LG,t:C.t,n:C.n,a:A,ts:TS,teste:!!C.teste}),keepalive:true})).json();nav();if(r.ok)$("sv").textContent=$("sv").textContent+" · salvo"}catch(e){nav()}}
addEventListener("pagehide",flush);
var FB=[["😞","Nada satisfeito(a)"],["😣","Muito insatisfeito(a)"],["😟","Insatisfeito(a)"],["😕","Bem abaixo do esperado"],["🙁","Abaixo do esperado"],["😐","Neutro"],["🙂","Razoável"],["🙂","Bom"],["😊","Muito bom"],["😄","Ótimo"],["🤩","Perfeito!"]],fb=v=>typeof v==="number"?'<span class="em">'+FB[v][0]+'</span><b>'+v+" · "+g(FB[v][1])+'</b>':'<span style="color:var(--mu);font-size:13px">Toque ou arraste para escolher de 0 a 10</span>',rgc=v=>(v&&v.length)?v.length+(v.length===1?" horário marcado":" horários marcados"):"Toque nos horários que funcionam para você";
var COL=n=>"hsl("+(n*12)+" 85% "+(n<5?52:42)+"%)";
function qh(q){var v=A[q.id],o=(q.d&&ST?(function(){var w=AVW(q.d,ST);return w?'<div class="dat" data-d="'+q.d+'">'+dh()+w+'</div>':""})():"")+'<div class="q'+(filled(q.id)?" ok":"")+'" data-id="'+q.id+'"><p>'+es(g(q.q))+'</p>';
 if(q.t==="n"){var hv=typeof v==="number";o+='<div class="nsl'+(hv?" has":"")+'" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="10" aria-valuenow="'+(hv?v:"")+'" style="--x:'+(hv?v*10:0)+'%;--c:'+(hv?COL(v):"#bbb")+'"><div class="nnum">'+[0,1,2,3,4,5,6,7,8,9,10].map(n=>'<span class="'+(v===n?"on":"")+'">'+n+'</span>').join("")+'</div><div class="ntr"><i></i></div></div><div class="nfb">'+fb(v)+'</div>'}
 else if(q.t==="g"){var D=[...new Set(q.o.map(x=>x.split(" ").slice(0,2).join(" ")))],Hs=[...new Set(q.o.map(x=>x.split(" ")[2]))];o+='<div class="rg"><span></span>'+D.map(d=>'<div class="hd">'+d.split(" ")[0]+'<small>'+d.split(" ")[1]+'</small></div>').join("")+Hs.map(h=>'<div class="hr">'+h+'</div>'+D.map(d=>{var k=d+" "+h;return'<button type="button" data-v="'+k+'" class="'+((v||[]).includes(k)?"on":"")+'" aria-label="'+k+'">✓</button>'}).join("")).join("")+'</div><p class="rgc">'+rgc(v)+'</p>'}
 else if(q.t==="s"||q.t==="m")o+='<div class="op">'+q.o.filter(x=>!(q.id==="b2b"&&x===C.n)).map(x=>'<button type="button" data-v="'+es(x)+'" class="'+((q.t==="m"?(v||[]).includes(x):v===x)?"on":"")+'">'+es(x)+'</button>').join("")+'</div>'+(q.t==="s"?'<input type="text" class="oth" placeholder="outra resposta (opcional)" value="'+es(q.o.includes(v)?"":v||"")+'" style="margin-top:8px">':"");
 else if(q.t==="v")o+='<div class="vr"><span>R$</span><input inputmode="numeric" placeholder="0"'+(v===NF?" disabled":"")+' value="'+(typeof v==="number"?v.toLocaleString("pt-BR"):"")+'"><div class="op"><button type="button" class="nf'+(v===NF?" on":"")+'">'+NF+'</button></div></div>';
 else o+='<textarea rows="3" placeholder="Escreva aqui…">'+es(v||"")+'</textarea>';
 return o+'</div>'}
function draw(){var m=$("mn");$("pv").disabled=CUR===0;var nx=$("nx");
 if(CUR===Q.length){nx.textContent=SENT?"Reenviar respostas":"Enviar respostas";nx.className="snd";m.innerHTML=review();var ei=$("eml");if(ei)ei.oninput=()=>ls.s("e_"+LG,ei.value.trim());return}
 nx.textContent=CUR===Q.length-1?"Revisar e enviar ▶":"Próximo ▶";nx.className="";var s=Q[CUR];
 m.innerHTML='<section class="sec"><p class="sh">'+(CUR+1)+" de "+Q.length+'</p><h2>'+es(s.s)+'</h2>'+(s.h?'<p class="sh">'+es(s.h)+'</p>':"")+s.i.map(qh).join("")+'</section>';AVcount(m);
 m.querySelectorAll(".q").forEach(el=>{var id=el.dataset.id,q=s.i.find(x=>x.id===id),mark=()=>el.classList.toggle("ok",filled(id));
  var sc=el.querySelector(".nsl");if(sc){var set=n=>{if(A[id]===n)return;A[id]=n;sc.classList.add("has");sc.style.setProperty("--x",n*10+"%");sc.style.setProperty("--c",COL(n));sc.setAttribute("aria-valuenow",n);sc.querySelectorAll(".nnum span").forEach((s,k)=>s.classList.toggle("on",k===n));var f=el.querySelector(".nfb");f.innerHTML=fb(n);f.classList.remove("go");void f.offsetWidth;f.classList.add("go");try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}mark();save()},
   at=e=>{var r=sc.querySelector(".ntr").getBoundingClientRect();set(Math.max(0,Math.min(10,Math.round((e.clientX-r.left)/r.width*10))))};
   /* só muda com toque (sem arrastar) ou arrastando a bolinha; passar o dedo para rolar não altera */
   var P0=null;sc.addEventListener("pointerdown",e=>{if(e.target.closest(".ntr i")&&sc.classList.contains("has")){sc.setPointerCapture(e.pointerId);sc.classList.add("drag");P0=null}else P0={x:e.clientX,y:e.clientY,t:Date.now()}});
   sc.addEventListener("pointermove",e=>{if(sc.classList.contains("drag"))at(e);else if(P0&&Math.hypot(e.clientX-P0.x,e.clientY-P0.y)>8)P0=null});
   sc.addEventListener("pointerup",e=>{if(sc.classList.contains("drag"))sc.classList.remove("drag");else if(P0&&Date.now()-P0.t<600&&Math.hypot(e.clientX-P0.x,e.clientY-P0.y)<=8)at(e);P0=null});
   sc.addEventListener("pointercancel",()=>{sc.classList.remove("drag");P0=null});
   sc.addEventListener("keydown",e=>{var v=typeof A[id]==="number"?A[id]:5;if(e.key==="ArrowRight"||e.key==="ArrowUp"){set(Math.min(10,v+1));e.preventDefault()}if(e.key==="ArrowLeft"||e.key==="ArrowDown"){set(Math.max(0,v-1));e.preventDefault()}})}


  el.querySelectorAll(".rg button").forEach(b=>b.onclick=()=>{var L=A[id]||[],k=b.dataset.v;L=L.includes(k)?L.filter(x=>x!==k):L.concat(k);A[id]=L;b.classList.toggle("on");el.querySelector(".rgc").textContent=rgc(L);try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}mark();save()});
  el.querySelectorAll(".op button:not(.nf)").forEach(b=>b.onclick=()=>{var x=b.dataset.v;if(q.t==="m"){var L=A[id]||[];if(x==="Nenhum")L=L.includes(x)?[]:[x];else{L=L.filter(y=>y!=="Nenhum");L=L.includes(x)?L.filter(y=>y!==x):L.concat(x)}A[id]=L;el.querySelectorAll(".op button").forEach(y=>y.classList.toggle("on",L.includes(y.dataset.v)))}else{A[id]=x;el.querySelectorAll(".op button").forEach(y=>y.classList.toggle("on",y===b));var oi=el.querySelector(".oth");if(oi)oi.value=""}mark();save()});
  var oi=el.querySelector(".oth");if(oi)oi.oninput=()=>{if(oi.value.trim()){A[id]=oi.value.trim();el.querySelectorAll(".op button").forEach(y=>y.classList.remove("on"))}else delete A[id];mark();save()};
  var ta=el.querySelector("textarea");if(ta)ta.oninput=()=>{A[id]=ta.value;mark();save()};
  var vi=el.querySelector(".vr input"),nf=el.querySelector(".nf");if(vi){vi.oninput=()=>{var n=+vi.value.replace(/\D/g,"");if(n){A[id]=n;vi.value=n.toLocaleString("pt-BR")}else{delete A[id];vi.value=""}mark();save()};
   nf.onclick=()=>{if(A[id]===NF){delete A[id];vi.disabled=false;nf.classList.remove("on");vi.focus()}else{A[id]=NF;vi.value="";vi.disabled=true;nf.classList.add("on")}mark();save()}}})}
function fa(q){var v=A[q.id];if(!filled(q.id))return"";if(q.t==="v")return v===NF?NF:AVfr(v);if(Array.isArray(v))return v.join(", ");return String(v)}
function miss(){return[...new Set(QA.filter(x=>!filled(x[1].id)).map(x=>x[0]))]}
function review(){var M=miss(),n=QA.filter(x=>!filled(x[1].id)).length;
 return(SENT?'<div class="fim"><div class="big">✅</div><h2>Respostas enviadas</h2><p>Enviado em '+es(SENT)+'. Você pode ajustar e reenviar; vale a última versão.</p></div>':'<section class="sec"><h2>Revisar e enviar</h2><p class="sh">Suas respostas já estão salvas. Confira e, quando quiser, envie: você e a DROM recebem uma cópia por e-mail.</p></section>')+
 (n?'<p class="err">Ainda '+(n===1?"falta 1 resposta":"faltam "+n+" respostas")+' (todas são obrigatórias): '+M.map(i=>'<a href="#" data-i="'+i+'" class="gom">'+es(Q[i].s)+'</a>').join(", ")+'</p>':"")+
 '<div class="em"><label for="eml">Seu e-mail para receber a cópia</label><input id="eml" type="email" value="'+es(ls.g("e_"+LG)||"")+'" placeholder="seu@email.com"></div>'+
 Q.map(s=>'<div class="rv"><h3>'+es(s.s)+'</h3><dl>'+s.i.map(q=>'<dt>'+es(g(q.q))+'</dt><dd class="'+(filled(q.id)?"":"vz")+'">'+(es(fa(q))||"sem resposta")+'</dd>').join("")+'</dl></div>').join("")+'<p id="msg"></p>'}
document.addEventListener("click",e=>{var a=e.target.closest(".gom");if(a){e.preventDefault();go(+a.dataset.i)}});
$("pv").onclick=()=>go(CUR-1);
$("nx").onclick=async()=>{if(CUR<Q.length)return go(CUR+1);var em=($("eml").value||"").trim(),msg=$("msg"),nx=$("nx");
 var M=miss();if(M.length){msg.className="err";msg.textContent="Responda todas as perguntas antes de enviar.";go(M[0]);setTimeout(()=>{var q=document.querySelector(".q:not(.ok)");if(q)q.scrollIntoView({behavior:"smooth",block:"center"})},350);return}
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){msg.className="err";msg.textContent="Informe um e-mail válido para receber a cópia.";$("eml").focus();return}
 var W=await url();if(!W){msg.className="err";msg.textContent="O envio ainda não foi ativado pela DROM. Suas respostas estão salvas neste aparelho.";return}
 nx.disabled=true;nx.textContent="Enviando…";
 var R=Q.map(s=>({s:s.s,i:s.i.map(q=>({q:g(q.q),a:fa(q)}))})),K={r:ST.r,f:ST.f,p:ST.p,tot:ST.tot,fat:ST.fat,com:ST.com,flo:ST.flo.md,fora:ST.fora.md};
 try{var r=await fetch(W,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({k:LG,t:C.t,n:C.n,e:em,a:A,ts:TS,r:R,st:K,teste:!!C.teste})}),j=await r.json();if(!j.ok)throw new Error(j.err||"falha");
  SENT=j.em||new Date().toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});ls.s("s_"+LG,SENT);nav();draw();scrollTo({top:0,behavior:"smooth"})}
 catch(er){msg.className="err";msg.textContent="Não foi possível enviar agora ("+es(er.message||"rede")+"). Suas respostas continuam salvas; tente de novo."}
 nx.disabled=false;if(!SENT)nx.textContent="Enviar respostas"};
})();
