/* DROM Booker · DEV (só ARTISTATESTE) — abas Dados/Emissão/Contrato, salvar local, copiar de/para, semelhantes, sugestões e calculadora */
(function(){
var TA="Artista Teste";
if(!BASE[TA]){document.body.insertAdjacentHTML("afterbegin","<p style='padding:20px'>Base de teste não carregada.</p>");return}
/* ---- identidade do artista de teste ---- */
CODE[TA]=11;var _nome=nome;nome=function(a){return a===TA?TA:_nome(a)};var _cal=calName;calName=function(a){return a===TA?"Artista Teste | DROM (dev)":_cal(a)};
ORDER=[TA];
/* ---- contrato: sem linha em branco no fim das caixas de rider ---- */
var _bd=buildDoc;buildDoc=async function(k,r,a){var o=await _bd(k,r,a);if(k==="c"&&o&&o.docXml)try{o.docXml=trimRiders(o.docXml)}catch(e){}return o};
function trimRiders(x){var d=new DOMParser().parseFromString(x,"application/xml");
 Array.prototype.slice.call(d.getElementsByTagNameNS(WNS,"tbl")).forEach(function(t){var tx=ptxt(t);if(!/rider/i.test(tx))return;
  Array.prototype.slice.call(t.getElementsByTagNameNS(WNS,"tc")).forEach(function(c){var ps=Array.prototype.slice.call(c.children).filter(function(e){return e.localName==="p"});
   for(var i=ps.length-1;i>0;i--){if(isBlank(ps[i])&&!ps[i].getElementsByTagNameNS(WNS,"drawing").length)c.removeChild(ps[i]);else break}})});
 return new XMLSerializer().serializeToString(d)}
/* ---- abas: Condições ficam em Dados ---- */
setTab=function(t){tab=t;["d","p","c"].forEach(function(k){$("t-"+k).hidden=k!==t});document.querySelectorAll(".tabs button").forEach(function(b){b.classList.toggle("on",b.dataset.t===t)})};
document.querySelectorAll(".tabs button").forEach(function(b){b.onclick=function(){setTab(b.dataset.t)}});
$("opt").hidden=false;
$("rst").onclick=function(){discard()};

/* ---- armazenamento local (IndexedDB) ---- */
function idb(){return new Promise(function(ok,er){var q=indexedDB.open("drom-bkdev",1);q.onupgradeneeded=function(){q.result.createObjectStore("s")};q.onsuccess=function(){ok(q.result)};q.onerror=function(){er(q.error)}})}
function iget(k){return idb().then(function(d){return new Promise(function(ok){var q=d.transaction("s").objectStore("s").get(k);q.onsuccess=function(){ok(q.result)};q.onerror=function(){ok(null)}})}).catch(function(){return null})}
function iput(k,v){return idb().then(function(d){return new Promise(function(ok){var t=d.transaction("s","readwrite");t.objectStore("s").put(v,k);t.oncomplete=ok;t.onerror=ok})}).catch(function(){})}
var SAVED={},NEW=[],CL_=function(o){return JSON.parse(JSON.stringify(o||{}))};
function ck(){return cur?key(cur.a,cur.p.n):""}
function dirty(){var k=ck();return !!k&&JSON.stringify(OV[k]||{})!==JSON.stringify(SAVED[k]||{})}
function persist(){return Promise.all([iput("ov",SAVED),iput("new",NEW)])}

/* ---- barra de ações ---- */
var WD=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
function dowOf(iso){var d=new Date(iso+"T12:00");return isNaN(d)?"":WD[d.getDay()]}
function bar(){var d=dirty();$("dvbar").innerHTML='<div class="dvb"><button class="pri" id="dsv"'+(d?"":" disabled")+'>💾 Salvar</button><button id="dds"'+(d?"":" disabled")+'>Descartar alterações</button><span class="dvsep"></span><button id="dnw">+ Nova proposta</button><button id="dcf">⤓ Copiar de…</button><button id="dct">⤒ Copiar para…</button><span class="dvst '+(d?"dd":"ok")+'">'+(d?"● Alterações não salvas":"✓ Tudo salvo")+'</span><span class="dvdev">dev: salvo só neste aparelho</span></div><div id="dsug"></div>';
 $("dsv").onclick=save;$("dds").onclick=discard;$("dnw").onclick=function(){guard(newProp)};$("dcf").onclick=copyFrom;$("dct").onclick=function(){guard(copyTo)};sug()}
function save(){var k=ck();SAVED[k]=CL_(OV[k]);var p=cur.p,o=OV[k]||{};NEW.forEach(function(x){if(x.n===p.n)Object.assign(x,o)});persist().then(function(){toast("Salvo neste aparelho");bar();renderSum()})}
function discard(){var k=ck();if(SAVED[k])OV[k]=CL_(SAVED[k]);else delete OV[k];buildForms();buildOpts();renderSum();renderAll();bar();toast("Alterações descartadas")}
/* bloqueia sair/trocar sem salvar ou descartar */
window.addEventListener("beforeunload",function(e){if(dirty()){e.preventDefault();e.returnValue="";return""}});
function guard(fn){if(!dirty()){fn();return}
 modal('<b>Há alterações não salvas nesta proposta.</b><p>Salve ou descarte antes de continuar.</p><div class="dvmb"><button class="c">Voltar</button><button class="x">Descartar e continuar</button><button class="pri y">Salvar e continuar</button></div>',function(m){
  m.querySelector(".c").onclick=function(){m.remove()};
  m.querySelector(".x").onclick=function(){m.remove();discard();fn()};
  m.querySelector(".y").onclick=function(){m.remove();save();fn()}})}
function modal(html,init){var m=document.createElement("div");m.className="dvm";m.innerHTML='<div class="dvmc">'+html+"</div>";document.body.appendChild(m);m.addEventListener("click",function(e){if(e.target===m)m.remove()});init&&init(m);return m}
var lastSel="";
$("prop").onchange=function(){var v=$("prop").value;if(dirty()){$("prop").value=lastSel;guard(function(){$("prop").value=v;pick()})}else pick()};
var lastArt="";$("art").onchange=function(){var v=$("art").value;if(dirty()){$("art").value=lastArt;guard(function(){$("art").value=v;lastArt=v;$("q").value="";fillProps()})}else{lastArt=v;$("q").value="";fillProps()}};
var _cr=chooseRes;chooseRes=function(i){guard(function(){_cr(i)})};
var _pick=pick;pick=function(){_pick();lastSel=$("prop").value;afterPick()};
function afterPick(){bar();simil();calcInit()}
document.addEventListener("input",function(e){if(e.target.closest&&e.target.closest("#t-d")&&!e.target.closest("#calcp")&&!e.target.closest("#simp")){setTimeout(bar,0)}},true);
document.addEventListener("change",function(e){if(e.target.closest&&e.target.closest("#forms")){var k=e.target.dataset.k;if(k==="loc"||k==="ev"||k==="cid"||k==="cat")simil()}},true);

/* ---- nova proposta / copiar ---- */
var FCOPY=["ev","loc","cid","end_local","cat","hi","hf","ini","dur","eq","rid","hosp","prod","obs","cont","tel","vend","cach","desp","com"];
function nextN(){var m=0;BASE[TA].p.forEach(function(p){m=Math.max(m,+p.n||0)});return m+1}
function addProp(o){var p=Object.assign({n:nextN(),st:"Proposta emitida",dprop:TODAY,vend:"Maycon"},o);p.dow=dowOf(p.dt);BASE[TA].p.push(p);NEW.push(CL_(p));SAVED[key(TA,p.n)]={};OV[key(TA,p.n)]={};return persist().then(function(){$("flt").value="all";fillProps(ovk(TA,p.n));toast("Proposta #"+p.n+" criada")})}
function newProp(){var d=new Date(Date.now()+30*864e5).toISOString().slice(0,10);
 modal('<b>Nova proposta</b><label class="dvl">Data do show <input type="date" id="nwd" value="'+d+'"></label><label class="dvl">Evento <input id="nwe" placeholder="Nome do evento"></label><label class="dvl">Local <input id="nwl" placeholder="Casa / espaço"></label><div class="dvmb"><button class="c">Cancelar</button><button class="pri y">Criar</button></div>',function(m){
  m.querySelector(".c").onclick=function(){m.remove()};
  m.querySelector(".y").onclick=function(){var dt=m.querySelector("#nwd").value;if(!dt){toast("Informe a data");return}m.remove();addProp({dt:dt,ev:m.querySelector("#nwe").value.trim()||null,loc:m.querySelector("#nwl").value.trim()||null})}})}
function allArts(){return Object.keys(BASE).filter(function(a){return BASE[a]&&BASE[a].p&&BASE[a].p.length})}
function pickList(title,onPick){var all=0;
 var m=modal('<b>'+title+'</b><div class="dvseg"><button data-v="0" class="on">Artista atual</button><button data-v="1">Todos os artistas</button></div><input id="pkq" type="search" placeholder="Buscar evento, local, cidade, contratante…"><div id="pkl" class="dvpl"></div><div class="dvmb"><button class="c">Fechar</button></div>',function(m){m.querySelector(".c").onclick=function(){m.remove()}});
 function draw(){var q=nrm(m.querySelector("#pkq").value).split(/\s+/).filter(Boolean),L=[];(all?allArts():[TA]).forEach(function(a){BASE[a].p.forEach(function(p){if(a===cur.a&&p===cur.p)return;var r=a===TA?R(a,p):p,s=nrm([a,r.ev,r.loc,r.cid,r.cont,r.cat,r.dt].join(" "));if(q.every(function(t){return s.indexOf(t)>=0}))L.push({a:a,p:p,r:r})})});
  L.sort(function(x,y){return x.r.dt<y.r.dt?1:-1});m.querySelector("#pkl").innerHTML=L.slice(0,80).map(function(x,i){return'<button data-i="'+i+'"><b>'+esc(brs(x.r.dt))+" · "+esc(x.a)+"</b> · "+esc((x.r.ev||x.r.loc||"").trim())+"<small>"+esc([x.r.loc,x.r.cid,x.r.cat,money(x.r.cach),x.r.st].filter(Boolean).join(" · "))+"</small></button>"}).join("")||'<p class="mu">Nada encontrado.</p>';
  m.querySelectorAll("#pkl button").forEach(function(b){b.onclick=function(){var x=L[+b.dataset.i];m.remove();onPick(x)}})}
 m.querySelectorAll(".dvseg button").forEach(function(b){b.onclick=function(){all=+b.dataset.v;m.querySelectorAll(".dvseg button").forEach(function(z){z.classList.toggle("on",z===b)});draw()}});
 m.querySelector("#pkq").oninput=draw;draw()}
function applyFrom(r,src){var k=ck(),o=OV[k]||(OV[k]={}),n=0;FCOPY.forEach(function(f){if(r[f]!==undefined&&r[f]!==null&&r[f]!==""){o[f]=r[f];n++}});
 Object.keys(r).forEach(function(f){if(/^(o_|ct_)/.test(f)){o[f]=r[f];n++}});buildForms();buildOpts();renderSum();renderAll();bar();simil();calcInit();toast(n+" campos copiados de "+src+" — confira e salve")}
function copyFrom(){pickList("Copiar dados de outra proposta",function(x){applyFrom(x.r,(x.a===TA?"#"+x.p.n:x.a)+" ("+brs(x.r.dt)+")")})}
function copyTo(){var r=cur_();
 modal('<b>Copiar esta proposta para…</b><label class="dvl">Artista <select id="cta">'+[TA].concat(allArts().filter(function(a){return a!==TA})).map(function(a){return'<option'+(a!==TA?" disabled":"")+">"+esc(a)+"</option>"}).join("")+'</select></label><p class="note">Na versão dev só é possível criar propostas no Artista Teste.</p><label class="dvl">Nova data <input type="date" id="ctd" value="'+esc(r.dt||"")+'"></label><div class="dvmb"><button class="c">Cancelar</button><button class="pri y">Criar cópia</button></div>',function(m){
  m.querySelector(".c").onclick=function(){m.remove()};
  m.querySelector(".y").onclick=function(){var dt=m.querySelector("#ctd").value;if(!dt){toast("Informe a data");return}m.remove();var o={dt:dt};FCOPY.forEach(function(f){if(r[f]!==undefined&&r[f]!==null&&r[f]!=="")o[f]=r[f]});addProp(o).then(function(){var k=ck(),ov=OV[k];Object.keys(r).forEach(function(f){if(/^(o_|ct_)/.test(f))ov[f]=r[f]});SAVED[k]=CL_(ov);persist();buildForms();buildOpts();renderAll()})}})}

/* ---- semelhantes ---- */
var SALL=0;
function score(r,q){var s=0;if(r.loc&&q.loc&&nrm(r.loc)===nrm(q.loc))s+=4;if(r.ev&&q.ev&&nrm(r.ev)===nrm(q.ev))s+=4;else if(r.ev&&q.ev){var a=nrm(r.ev).split(/\s+/).filter(function(w){return w.length>3}),b=nrm(q.ev);a.forEach(function(w){if(b.indexOf(w)>=0)s+=.7})}
 if(r.cid&&q.cid&&nrm(r.cid)===nrm(q.cid))s+=1;if(r.cat&&q.cat&&r.cat===q.cat)s+=1.2;if(r.cont&&q.cont&&nrm(r.cont)===nrm(q.cont))s+=2;return s}
function similar(r,all){var L=[];(all?allArts():[TA]).forEach(function(a){BASE[a].p.forEach(function(p){if(a===cur.a&&p===cur.p)return;var q=a===TA?R(a,p):p,s=score(r,q);if(s>=2)L.push({a:a,p:p,r:q,s:s})})});L.sort(function(x,y){return y.s-x.s||(x.r.dt<y.r.dt?1:-1)});return L}
function simil(){if(!cur)return;var r=cur_(),L=similar(r,SALL).slice(0,8);
 $("simp").innerHTML='<h2>Propostas semelhantes</h2><div class="dvseg"><button data-v="0"'+(SALL?"":' class="on"')+'>Artista atual</button><button data-v="1"'+(SALL?' class="on"':"")+'>Todos</button></div>'+(L.length?L.map(function(x,i){return'<div class="dvsi"><b>'+esc(brs(x.r.dt))+(x.a!==TA?" · "+esc(x.a):"")+"</b> "+esc((x.r.ev||x.r.loc||"").trim())+"<small>"+esc([x.r.loc,x.r.cid,money(x.r.cach),x.r.st].filter(Boolean).join(" · "))+'</small><button data-i="'+i+'">Usar como base</button></div>'}).join(""):'<p class="mu">Preencha evento, local ou cidade para ver propostas parecidas.</p>');
 $("simp").querySelectorAll(".dvseg button").forEach(function(b){b.onclick=function(){SALL=+b.dataset.v;simil()}});
 $("simp").querySelectorAll(".dvsi button").forEach(function(b){b.onclick=function(){var x=L[+b.dataset.i];applyFrom(x.r,(x.a===TA?"#"+x.p.n:x.a)+" ("+brs(x.r.dt)+")")}});sug()}
/* ---- sugestões de preenchimento ---- */
var FSUG=[["cid","Cidade/UF"],["cat","Categoria"],["end_local","Endereço"],["hi","Início do evento"],["hf","Fim do evento"],["ini","Início do show"],["dur","Duração"],["eq","Equipamento"],["rid","Rider de hospitalidade"],["hosp","Hospedagem"],["prod","Produção"],["cont","Contratante"],["tel","Contato"],["cach","Cachê"]];
function sug(){var box=$("dsug");if(!box||!cur)return;var r=cur_(),L=similar(r,1);document.querySelectorAll(".dvsg").forEach(function(e){e.remove()});
 if(!L.length||!(r.loc||r.ev)){box.innerHTML="";return}var b=L[0],q=b.r,S=[];
 FSUG.forEach(function(f){var v=q[f[0]],cv=r[f[0]];if((cv===undefined||cv===null||cv===""||cv==="a definir")&&v!==undefined&&v!==null&&v!==""&&v!=="a definir")S.push([f[0],f[1],v])});
 S.forEach(function(s){var inp=$("f_"+s[0]);if(!inp)return;var c=document.createElement("button");c.type="button";c.className="dvsg";c.textContent="Sugestão: "+(s[0]==="cach"?money(s[2]):String(s[2]).split("\n")[0].slice(0,40));c.title="Da proposta de "+brs(q.dt)+(b.a!==TA?" · "+b.a:"");c.onclick=function(){setVal(s[0],String(s[2]));inp.value=String(s[2]);c.remove();bar()};inp.parentNode.appendChild(c)});
 box.innerHTML=S.length?'<div class="dvsb">💡 '+S.length+' sugest'+(S.length>1?"ões":"ão")+' com base em '+esc((q.ev||q.loc||"").trim())+" ("+esc(brs(q.dt))+(b.a!==TA?" · "+esc(b.a):"")+') <button id="dsa">Aplicar todas</button></div>':"";
 var ba=$("dsa");if(ba)ba.onclick=function(){var k=ck(),o=OV[k]||(OV[k]={});S.forEach(function(s){o[s[0]]=s[2]});buildForms();buildOpts();renderSum();renderAll();bar();toast("Sugestões aplicadas — confira e salve")}}
var _bf=buildForms;buildForms=function(){_bf();setTimeout(sug,0)};

/* ---- calculadora de cachê (2026 = tabela atual; 2027 = projeção do estudo de cachês) ---- */
var C=window.BKC||{},TY=[["balada","Casa noturna / bar"],["unig","Universitária (grande)"],["unip","Universitária (pequena)"],["particular","Particular / corporativo"],["formatura","Formatura"],["casamento","Casamento"]];
function M(d){return d<1?.95:1+.2*(d-1)}function Mf(d){return d<=1.5?1:M(d)/M(1.5)}
var nz=function(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"")};
function ckm(c){var n=nz(String(c||"").split("/")[0]),x=(C.CITY||[]).filter(function(z){return nz(z[0].split("/")[0])===n})[0];return x?x[1]:null}
function tab26(a,t,km,d,ev){var T26=C.T26,i=C.A.indexOf(a),B=T26.BASE;if(km>1100)return T26.AE[i]*Mf(d);
 if(km>40){var c=T26.CID.reduce(function(p,x){return Math.abs(x[1]-km)<Math.abs(p[1]-km)?x:p}),v=c[2][i]*Mf(d);if(["particular","formatura","casamento"].indexOf(t)>=0){var s=tab26(a,t,0,d,ev),p=tab26(a,"balada",0,d,ev);return s&&p?v+Math.min(Math.max(0,s-p),v*.3):v}return v}
 if(t==="balada")return(d<=1?B.b1:d<=1.5?B.b15:B.b2)[i]*(d>2?M(d)/M(2):1);if(t==="unig")return B.uni[i];if(t==="unip")return B.unip[i];
 if(t==="particular"){if(a==="cadu")return 50*ev+250*Math.max(3,d);return(d<=1?B.p1:d<=2?B.p2:B.p3)[i]}
 var v2=(t==="formatura"?B.form:B.cas)[i];return v2==null?(a==="cadu"?50*ev+250*Math.max(3,d):null):v2*M(d)/M(2)}
function calc27(a,t,km,d,ev,air){var T27=C.T27,T26=C.T26,i=C.A.indexOf(a),gf=km<=40,soc=["particular","formatura","casamento"].indexOf(t)>=0,art;
 if(a==="cadu"&&soc){art=(t==="particular"?400:450)*Math.max(3,d)}
 else if(gf){var b=T27[t]&&T27[t][i];if(b==null)return tab26(a,t,km,d,ev);art=b*(t==="formatura"||t==="casamento"?M(d)/M(2):M(d))}
 else{var f=T27.fora[i]*Mf(d),s=soc&&T27[t][i]!=null?T27[t][i]*(t==="particular"?M(d):M(d)/M(2)):0;art=Math.max(f,s)}
 if(air&&!gf)art=Math.max(art,T26.AE[i]*Mf(d));var f26=air&&!gf?T26.AE[i]*Mf(d):tab26(a,t,km,d,ev);return Math.max(art,f26||0)}
var r50=function(v){return Math.round(v/50)*50},CALO=(function(){try{return localStorage.getItem("bkdev_calc")!=="0"}catch(e){return true}})();
function catT(c){c=nrm(c);return/formatura/.test(c)?"formatura":/casamento/.test(c)?"casamento":/particular|anivers|corporat/.test(c)?"particular":/universit/.test(c)?"unig":"balada"}
function hrs(s){var m=/^(\d+):(\d+)/.exec(s||"");return m?+m[1]+ +m[2]/60:1}
function calcInit(){if(!cur||!C.T26){$("calcp").innerHTML="";return}var r=cur_(),y=String(r.dt||TODAY).slice(0,4)>="2027"?"2027":"2026",km=ckm(r.cid);
 $("calcp").innerHTML='<div class="dvch"><h2 style="margin:0">Calculadora de cachê</h2><button id="cxt">'+(CALO?"Ocultar":"Mostrar")+'</button></div><div id="cxb"'+(CALO?"":" hidden")+'><div class="fg dvcf">'+
  '<label><span>Tabela</span><div class="dvseg" id="cxy"><button data-y="2026"'+(y==="2026"?' class="on"':"")+'>2026</button><button data-y="2027"'+(y==="2027"?' class="on"':"")+'>2027</button></div></label>'+
  '<label><span>Perfil de referência</span><select id="cxa">'+C.A.map(function(a){return'<option value="'+a+'"'+(a==="cenoura"?" selected":"")+">"+C.NM[a]+"</option>"}).join("")+'</select></label>'+
  '<label><span>Tipo de evento</span><select id="cxt2">'+TY.map(function(t){return'<option value="'+t[0]+'"'+(t[0]===catT(r.cat)?" selected":"")+">"+t[1]+"</option>"}).join("")+'</select></label>'+
  '<label><span>Distância de Floripa (km)</span><input id="cxk" type="number" min="0" value="'+(km==null?"":km)+'" placeholder="'+(km==null?"cidade fora da lista":"")+'"></label>'+
  '<label><span>Duração do show (h)</span><input id="cxd" type="number" step="0.5" min="0.5" value="'+hrs(r.dur)+'"></label>'+
  '<label><span>Horas de evento (Cadu)</span><input id="cxe" type="number" step="1" min="0" value="'+(r.hi&&r.hf?Math.max(3,((hrs(r.hf)-hrs(r.hi)+24)%24)||3):3)+'"></label>'+
  '<label><span>Custos extras (transporte, hospedagem)</span><input id="cxx" type="number" step="50" min="0" value="0"></label>'+
  '<label class="dvck"><input type="checkbox" id="cxv"> Viagem aérea</label></div>'+
  '<div class="dvcr" id="cxr"></div><p class="note">Ano escolhido automaticamente pela data da proposta. 2026 = Tabela de Cachês 2026; 2027 = tabela 2027 do estudo de cachês (versão simplificada: sem regras de hierarquia, histórico da casa e transporte automático — some os custos em "Custos extras").</p></div>';
 var Y=y;$("cxt").onclick=function(){CALO=!CALO;try{localStorage.setItem("bkdev_calc",CALO?"1":"0")}catch(e){}$("cxb").hidden=!CALO;this.textContent=CALO?"Ocultar":"Mostrar"};
 $("cxy").querySelectorAll("button").forEach(function(b){b.onclick=function(){Y=b.dataset.y;$("cxy").querySelectorAll("button").forEach(function(z){z.classList.toggle("on",z===b)});run()}});
 ["cxa","cxt2","cxk","cxd","cxe","cxx","cxv"].forEach(function(id){$(id).addEventListener("input",run)});
 function run(){var a=$("cxa").value,t=$("cxt2").value,k=+$("cxk").value||0,d=+$("cxd").value||1,e=+$("cxe").value||3,x=+$("cxx").value||0,air=$("cxv").checked,
  v=Y==="2027"?calc27(a,t,k,d,e,air):tab26(a,t,k,d,e),vv=v==null?null:r50(v)+x;
  $("cxr").innerHTML=vv==null?'<span class="mu">Sem valor de tabela para este perfil e tipo.</span>':'<span>Cachê sugerido ('+Y+'):</span><b>'+money(vv)+'</b><button class="pri" id="cxi">Inserir na proposta</button>'+(Y==="2027"?'<small>2026 seria '+money(r50(tab26(a,t,k,d,e)||0)+x)+"</small>":"");
  var bi=$("cxi");if(bi)bi.onclick=function(){setVal("cach",String(vv));var f=$("f_cach");if(f)f.value=String(vv);bar();toast("Cachê "+money(vv)+" inserido — salve para confirmar")}}
 run()}

/* ---- início ---- */
var css=document.createElement("style");css.textContent='.dvb{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.dvb button[disabled]{opacity:.45;cursor:default}.dvsep{flex:1}.dvst{font-weight:700;font-size:13px}.dvst.dd{color:#c00}.dvst.ok{color:#188038}.dvdev{font-size:11px;background:#FFF602;color:#000;border-radius:6px;padding:2px 8px;font-weight:700}.dvgrid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px;align-items:start}@media(max-width:900px){.dvgrid{grid-template-columns:1fr}}.dvside{position:sticky;top:8px}.dvsi{border-top:1px solid #eee;padding:8px 0;font-size:13px}.dvsi small{display:block;color:#666}.dvsi button{margin-top:4px;font-size:12px;padding:3px 8px}.dvseg{display:inline-flex;border:1px solid #ccc;border-radius:8px;overflow:hidden;margin:4px 0 8px}.dvseg button{border:0;border-radius:0;padding:5px 10px;background:#fff}.dvseg button.on{background:#FF5B1F;color:#fff}.dvm{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px}.dvmc{background:#fff;color:#111;border-radius:14px;padding:18px;width:min(560px,100%);max-height:86vh;overflow:auto;display:flex;flex-direction:column;gap:8px}.dvmb{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:6px}.dvl{display:flex;flex-direction:column;font-size:13px;gap:3px}.dvpl{display:flex;flex-direction:column;gap:4px;max-height:50vh;overflow:auto}.dvpl button{text-align:left;padding:7px 9px;font-size:13px}.dvpl small{display:block;color:#666}#pkq{padding:8px;border-radius:8px;border:1px solid #ccc}.dvsg{display:block;margin-top:3px;font-size:11.5px;padding:2px 8px;border-radius:6px;border:1px dashed #FF5B1F;background:#FFF2EC;color:#a33a00;text-align:left;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}.dvsb{margin-top:8px;font-size:13px;background:#FFF2EC;border:1px solid #FFCDB8;border-radius:8px;padding:6px 10px}.dvsb button{margin-left:8px;font-size:12px;padding:3px 8px}.dvch{display:flex;justify-content:space-between;align-items:center}.dvcr{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px;font-size:15px}.dvcr b{font-size:22px}.dvcr small{color:#666}.dvck{flex-direction:row!important;align-items:center;gap:6px}.dvcf input[type=number],.dvcf select{padding:9px 10px;border:1px solid #d9d9d9;border-radius:9px;width:100%;box-sizing:border-box;font:inherit;background:#fff}';document.head.appendChild(css);
Promise.all([iget("ov"),iget("new")]).then(function(v){SAVED=v[0]||{};NEW=v[1]||[];
 NEW.forEach(function(p){if(!BASE[TA].p.some(function(x){return x.n===p.n}))BASE[TA].p.push(CL_(p))});
 Object.keys(SAVED).forEach(function(k){OV[k]=CL_(SAVED[k])});
 $("art").innerHTML='<option value="">Selecione o artista</option><option value="'+TA+'">'+TA+'</option>';$("art").value="";$("flt").value="all";fillProps();
 document.querySelector(".hd").insertAdjacentHTML("beforeend",'<span class="dvdev" style="margin-left:8px">VERSÃO DEV</span>')})
})();
