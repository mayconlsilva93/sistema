/* DROM Booker — abas Dados/Emissão/Contrato, copiar de/para, semelhantes, sugestões e calculadora.
   Gravar (Salvar / Nova / Copiar para) em todos os artistas (APPS.booker no escrita.gs), pela escrita do Apps Script (tools/escrita/escrita.gs) quando booker/w.json tem URL;
   sem URL, salva só neste aparelho. */
(function(){
var TA="Artista Teste",HAS=!!BASE[TA];if(!HAS)BASE[TA]={p:[]};
Object.keys(BASE).forEach(function(a){(BASE[a].p||[]).forEach(function(p){["ev","loc","cid","cont","tel","obs"].forEach(function(k){if(typeof p[k]==="number")p[k]=String(p[k])})})});/* textos numéricos na planilha (ex.: evento "2024") quebravam a lista */
var WRA={"Artista Teste":1,"Ramonstro":1,"Carloto":1,"Sena":1,"Cenoura":1,"Maneira":1,"Amaro":1,"Josu":1,"Cadu Vieira":1,"Brinquinho":1,"Liquinho":1};/* liberados no escrita.gs (APPS.booker) */
function WRT(a){return !!WRA[a]&&!!BASE[a]&&(a!==TA||HAS)}/* artistas com gravação liberada */
var WS={on:false};if(window.DROMW&&window.DROMBKK)DROMW.cfg("w.json",window.DROMBKK).then(function(w){WS=w;try{if(cur)bar()}catch(e){}}).catch(function(){});
/* campo do Booker -> título da coluna na linha 4 da aba PROPOSTAS ("TÍTULO>1" = coluna sem título logo à direita) */
var FM={dt:"DATA DO SHOW",st:"STATUS",loc:"LOCAL",ev:"EVENTO",cid:"CIDADE/UF",cat:"CATEGORIA",hi:"HORÁRIO DO EVENTO",hf:"HORÁRIO DO EVENTO>1",ini:"INÍCIO DO SHOW",dur:"DURAÇÃO",eq:"EQUIPAMENTO",obs:"OBSERVAÇÕES",rid:"RIDER HOSPITALIDADE",hosp:"HOSPEDAGEM",prod:"PRODUÇÃO",cont:"CONTRATANTE",tel:"CONTRATANTE>1",vend:"VENDEDOR",dprop:"DATA PROPOSTA",dapr:"DATA APROVAÇÃO",dsin:"VENCIMENTO SINAL",cach:"CACHÊ BRUTO",desp:"DESPESAS",com:"COMISSÃO",ctr:"CONTRATO",nf:"NOTA FISCAL",hn:"nota:INÍCIO DO SHOW"};/* hn = nota da célula INÍCIO DO SHOW (vários horários) */
var NUMF={cach:1,desp:1,com:1,prod:1};
function sv(k,v){if(v===undefined||v===null)return"";if(NUMF[k]&&typeof v==="string"&&/^[\d.,\s]+$/.test(v.trim())&&v.trim()){var t=v.trim();t=/,/.test(t)?t.replace(/\./g,"").replace(",","."):t;var n=Number(t);if(!isNaN(n))return n}return v}
function sheetH(o){var h={},n=0;Object.keys(o||{}).forEach(function(k){if(FM[k]){h[FM[k]]=sv(k,o[k]);n++}});return n?h:null}
/* ---- identidade do artista de teste ---- */
if(HAS){CODE[TA]=11;var _nome=nome;nome=function(a){return a===TA?TA:_nome(a)};var _cal=calName;calName=function(a){return a===TA?"Artista Teste | DROM (teste)":_cal(a)};
if(ORDER.indexOf(TA)<0)ORDER.push(TA)}
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
function dirty(){var k=ck();return !!k&&WRT(cur.a)&&JSON.stringify(OV[k]||{})!==JSON.stringify(SAVED[k]||{})}
function persist(){return Promise.all([iput("ov",SAVED),iput("new",NEW)])}

/* ---- barra de ações ---- */
var WD=["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
function dowOf(iso){var d=new Date(iso+"T12:00");return isNaN(d)?"":WD[d.getDay()]}
var TI={nw:'<path d="M12 5v14M5 12h14"/>',cf:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>',ct:'<path d="M12 20V9M7.5 13.5 12 9l4.5 4.5M5 4h14"/>',sv:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',ds:'<path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13"/>'};
function tbar(){var t=$("bktb");if(!t)return;if(!t.firstChild){t.innerHTML=[["nw","Nova","Nova"],["cf","Copiar de…","Copiar de…"],["ct","Copiar para…","Copiar para…"],["sv","Salvar","Salvar"],["ds","Descartar alterações","Descartar"]].map(function(b){return'<button type="button" id="tb'+b[0]+'" class="tb tb'+b[0]+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+TI[b[0]]+'</svg><span class="tl">'+b[1]+'</span><span class="ts">'+b[2]+'</span></button>'}).join("");
  $("tbnw").onclick=function(){guard(newProp)};$("tbcf").onclick=function(){if(cur)copyFrom()};$("tbct").onclick=function(){if(cur)guard(copyTo)};$("tbsv").onclick=function(){if(dirty())save()};$("tbds").onclick=function(){if(dirty())discard()}}
 var c=!!cur,w=c&&WRT(cur.a),d=dirty(),S=function(id,on,tt){var b=$(id);b.disabled=!on;b.title=tt;b.setAttribute("aria-label",tt)};
 S("tbnw",1,"Nova proposta");
 S("tbcf",c,c?"Copiar dados de outra proposta para esta":"Copiar de…: escolha uma proposta primeiro");
 S("tbct",c,c?"Copiar esta proposta para uma nova":"Copiar para…: escolha uma proposta primeiro");
 S("tbsv",d,d?"Salvar alterações":!c?"Salvar: escolha uma proposta primeiro":!w?"Somente leitura: disponível quando a gravação for liberada para este artista":"Nada para salvar");
 S("tbds",d,d?"Descartar alterações":"Descartar alterações: nada para descartar");$("tbsv").classList.toggle("dd",d)}
function bar(){tbar();if(!cur)return;var w=WRT(cur.a),d=dirty();
 $("dvbar").innerHTML='<div class="dvb">'+(w?'<span class="dvst '+(d?"dd":"ok")+'">'+(d?"● Alterações não salvas":"✓ Tudo salvo")+'</span><span class="dvdev">'+(WS.on?"grava na planilha de "+esc(cur.a):"gravação desligada: salvo só neste aparelho")+"</span>":'<span class="dvro">Somente leitura · as edições valem só nesta tela; nada é gravado nas planilhas</span>')+"</div>"+'<div id="dsug"></div>';var lv=LIVE[ck()];if(lv)$("dvbar").querySelector(".dvb").insertAdjacentHTML("beforeend",'<span class="dvlv '+lv.s+'">'+esc(lv.m)+"</span>");finRender();sug()}
function saveLocal(k,p,msg){SAVED[k]=CL_(OV[k]);var o=OV[k]||{};NEW.forEach(function(x){if(x.n===p.n)Object.assign(x,o)});return persist().then(function(){toast(msg);bar();renderSum()})}
var BUSY=0;
function save(){var k=ck(),p=cur.p;if(!WS.on)return saveLocal(k,p,"Salvo neste aparelho");if(BUSY)return Promise.resolve(false);
 var o=OV[k]||{},o0=SAVED[k]||{},ch={};Object.keys(FM).forEach(function(f){var a=o[f],b=o0[f];if(a!==undefined&&JSON.stringify(a)!==JSON.stringify(b)&&!(b===undefined&&String(a)===String(p[f]==null?"":p[f])))ch[f]=a});
 var h=sheetH(ch);if(!h)return saveLocal(k,p,"Salvo (nenhum campo da planilha mudou)");
 BUSY=1;toast("Gravando na planilha…");
 var art=cur.a;return WS.send("editar",art,{n:+p.n,h:h}).then(function(r){BUSY=0;if(!r||!r.ok){wErr(r);return false}
  wsPut(k,ch);return saveLocal(k,p,"Gravado na planilha"+(r.r&&r.r.ign&&r.r.ign.length?" (ignorado: "+r.r.ign.join(", ")+")":"")).then(function(){return true})},function(){BUSY=0;wErr(null);return false})}
function wErr(r){modal('<b>Não foi gravado na planilha</b><p>'+esc((r&&r.err)||"Falha de conexão. Tente de novo.")+'</p><div class="dvmb"><button class="pri c">OK</button></div>',function(m){m.querySelector(".c").onclick=function(){m.remove()}})}
/* gravados na planilha: mantidos neste aparelho só até a próxima sincronização (dv.json) trazer os valores */
var WSV={};function upT(k){var m=/(\d\d)\/(\d\d)\/(\d{4}) (\d\d):(\d\d)/.exec((String(k||"").indexOf(TA+"|")===0?window.DROMDVUP:window.DROMUPD)||"");/* teste: dv.json; artistas reais: bk.json */return m?new Date(+m[3],m[2]-1,+m[1],+m[4],+m[5]).getTime():0}
function wsPut(k,ch){var x=WSV[k]||(WSV[k]={t:0,h:{}});x.t=Date.now();Object.assign(x.h,ch);iput("ws",WSV)}
function discard(){var k=ck();if(SAVED[k])OV[k]=CL_(SAVED[k]);else delete OV[k];buildForms();buildOpts();renderSum();renderAll();bar();toast("Alterações descartadas")}
/* bloqueia sair/trocar sem salvar ou descartar */
window.addEventListener("beforeunload",function(e){if(dirty()){e.preventDefault();e.returnValue="";return""}});
function guard(fn){if(!dirty()){fn();return}
 modal('<b>Há alterações não salvas nesta proposta.</b><p>Salve ou descarte antes de continuar.</p><div class="dvmb"><button class="c">Voltar</button><button class="x">Descartar e continuar</button><button class="pri y">Salvar e continuar</button></div>',function(m){
  m.querySelector(".c").onclick=function(){m.remove()};
  m.querySelector(".x").onclick=function(){m.remove();discard();fn()};
  m.querySelector(".y").onclick=function(){m.remove();Promise.resolve(save()).then(function(ok){if(ok!==false)fn()})}})}
function modal(html,init){var m=document.createElement("div");m.className="dvm";m.innerHTML='<div class="dvmc">'+html+"</div>";document.body.appendChild(m);m.addEventListener("click",function(e){if(e.target===m)m.remove()});init&&init(m);return m}
var lastSel="";
$("prop").onchange=function(){var v=$("prop").value;if(dirty()){$("prop").value=lastSel;guard(function(){$("prop").value=v;pick()})}else pick()};
var lastArt="";$("art").onchange=function(){var v=$("art").value;if(dirty()){$("art").value=lastArt;guard(function(){$("art").value=v;lastArt=v;$("q").value="";fillProps()})}else{lastArt=v;$("q").value="";fillProps()}};
var _cr=chooseRes;chooseRes=function(i){guard(function(){_cr(i)})};
var _pick=pick;pick=function(){lastSel=$("prop").value;if(!lastSel){cur=null;noSel();return}_pick();$("app").hidden=false;$("empty").hidden=true;afterPick()};
function afterPick(){bar();simil();calcInit();live()}
document.addEventListener("input",function(e){if(e.target.closest&&e.target.closest("#t-d")&&!e.target.closest("#calcp")&&!e.target.closest("#simp")){setTimeout(bar,0)}},true);
document.addEventListener("change",function(e){if(e.target.closest&&e.target.closest("#forms")){var k=e.target.dataset.k;if(k==="loc"||k==="ev"||k==="cid"||k==="cat")simil()}},true);

/* ---- nova proposta / copiar ---- */
var FCOPY=["hn","ev","loc","cid","end_local","cat","hi","hf","ini","dur","eq","rid","hosp","prod","obs","cont","tel","vend","cach","desp","com"];
function nextN(a){var m=0;BASE[a||TA].p.forEach(function(p){m=Math.max(m,+p.n||0)});return m+1}
function addProp(o,a){a=WRT(a)?a:TA;var p=Object.assign({n:nextN(a),st:"Proposta emitida",dprop:TODAY,vend:"Maycon"},o);p.dow=dowOf(p.dt);
 if(WS.on){var f={};Object.keys(p).forEach(function(k){if(k!=="n"&&p[k]!==null&&p[k]!==undefined&&p[k]!=="")f[k]=p[k]});toast("Criando na planilha…");
  return WS.send("criar",a,{h:sheetH(f)}).then(function(r){if(!r||!r.ok){wErr(r);return Promise.reject(r)}p.n=r.r.n;f.n=p.n;return addLocal(p,f,a)},function(e){if(e&&e.err!==undefined)throw e;wErr(null);throw e})}
 return addLocal(p,null,a)}
function addLocal(p,f,a){a=a||TA;BASE[a].p=BASE[a].p.filter(function(x){return x.n!==p.n});BASE[a].p.push(p);NEW.push(Object.assign(CL_(p),{_a:a}));SAVED[key(a,p.n)]={};OV[key(a,p.n)]={};if(f){var k=key(a,p.n);WSV[k]={t:Date.now(),h:{},nw:CL_(p)};iput("ws",WSV);NEW.pop()}
 return persist().then(function(){$("flt").value="all";if($("art").value&&$("art").value!==a){$("art").value=a;lastArt=a}fillProps(ovk(a,p.n));toast("Proposta #"+p.n+" criada"+(f?" na planilha":""))})}
function newProp(){var d=new Date(Date.now()+30*864e5).toISOString().slice(0,10);
 var a0=cur&&WRT(cur.a)?cur.a:WRT($("art").value)?$("art").value:TA;
 modal('<b>Nova proposta</b><label class="dvl">Artista <select id="nwa">'+wArts().map(function(a){return'<option'+(a===a0?" selected":"")+">"+esc(a)+"</option>"}).join("")+'</select></label><label class="dvl">Data do show <input type="date" id="nwd" value="'+d+'"></label><label class="dvl">Evento <input id="nwe" placeholder="Nome do evento"></label><label class="dvl">Local <input id="nwl" placeholder="Casa / espaço"></label><div class="dvmb"><button class="c">Cancelar</button><button class="pri y">Criar</button></div>',function(m){
  m.querySelector(".c").onclick=function(){m.remove()};
  m.querySelector(".y").onclick=function(){var dt=m.querySelector("#nwd").value;if(!dt){toast("Informe a data");return}var na=m.querySelector("#nwa").value;m.remove();addProp({dt:dt,ev:m.querySelector("#nwe").value.trim()||null,loc:m.querySelector("#nwl").value.trim()||null},na).catch(function(){})}})}
function wArts(){var L=ORDER.filter(function(a){return WRT(a)});Object.keys(BASE).forEach(function(a){if(WRT(a)&&L.indexOf(a)<0)L.push(a)});return L}
function allArts(){return Object.keys(BASE).filter(function(a){return BASE[a]&&BASE[a].p&&BASE[a].p.length})}
function pickList(title,onPick){var all=0;
 var m=modal('<b>'+title+'</b><div class="dvseg"><button data-v="0" class="on">Artista atual</button><button data-v="1">Todos os artistas</button></div><input id="pkq" type="search" placeholder="Buscar evento, local, cidade, contratante…"><div id="pkl" class="dvpl"></div><div class="dvmb"><button class="c">Fechar</button></div>',function(m){m.querySelector(".c").onclick=function(){m.remove()}});
 function draw(){var q=nrm(m.querySelector("#pkq").value).split(/\s+/).filter(Boolean),L=[];(all?allArts():[cur.a]).forEach(function(a){BASE[a].p.forEach(function(p){if(a===cur.a&&p===cur.p)return;var r=R(a,p),s=nrm([a,r.ev,r.loc,r.cid,r.cont,r.cat,r.dt].join(" "));if(q.every(function(t){return s.indexOf(t)>=0}))L.push({a:a,p:p,r:r})})});
  L.sort(function(x,y){return x.r.dt<y.r.dt?1:-1});m.querySelector("#pkl").innerHTML=L.slice(0,80).map(function(x,i){return'<button data-i="'+i+'"><b>'+esc(brs(x.r.dt))+" · "+esc(x.a)+"</b> · "+esc((x.r.ev||x.r.loc||"").trim())+"<small>"+esc([x.r.loc,x.r.cid,x.r.cat,money(x.r.cach),x.r.st].filter(Boolean).join(" · "))+"</small></button>"}).join("")||'<p class="mu">Nada encontrado.</p>';
  m.querySelectorAll("#pkl button").forEach(function(b){b.onclick=function(){var x=L[+b.dataset.i];m.remove();onPick(x)}})}
 m.querySelectorAll(".dvseg button").forEach(function(b){b.onclick=function(){all=+b.dataset.v;m.querySelectorAll(".dvseg button").forEach(function(z){z.classList.toggle("on",z===b)});draw()}});
 m.querySelector("#pkq").oninput=draw;draw()}
function applyFrom(r,src){var k=ck(),o=OV[k]||(OV[k]={}),n=0;FCOPY.forEach(function(f){if(r[f]!==undefined&&r[f]!==null&&r[f]!==""){o[f]=r[f];n++}});
 Object.keys(r).forEach(function(f){if(/^(o_|ct_)/.test(f)){o[f]=r[f];n++}});buildForms();buildOpts();renderSum();renderAll();bar();simil();calcInit();toast(n+" campos copiados de "+src+" — confira e salve")}
function copyFrom(){pickList("Copiar dados de outra proposta",function(x){applyFrom(x.r,(x.a===cur.a?"#"+x.p.n:x.a)+" ("+brs(x.r.dt)+")")})}
function copyTo(){var r=cur_();
 modal('<b>Copiar esta proposta para…</b><label class="dvl">Artista <select id="cta">'+wArts().map(function(a){return'<option'+(a===cur.a?" selected":"")+">"+esc(a)+"</option>"}).join("")+'</select></label><label class="dvl">Nova data <input type="date" id="ctd" value="'+esc(r.dt||"")+'"></label><div class="dvmb"><button class="c">Cancelar</button><button class="pri y">Criar cópia</button></div>',function(m){
  m.querySelector(".c").onclick=function(){m.remove()};
  m.querySelector(".y").onclick=function(){var dt=m.querySelector("#ctd").value;if(!dt){toast("Informe a data");return}var ta=m.querySelector("#cta").value;m.remove();var o={dt:dt};FCOPY.forEach(function(f){if(r[f]!==undefined&&r[f]!==null&&r[f]!=="")o[f]=r[f]});addProp(o,ta).then(function(){var k=ck(),ov=OV[k];Object.keys(r).forEach(function(f){if(/^(o_|ct_)/.test(f))ov[f]=r[f]});SAVED[k]=CL_(ov);persist();buildForms();buildOpts();renderAll()}).catch(function(){})}})}

/* ---- semelhantes ---- */
var SALL=0;
function score(r,q){var s=0;if(r.loc&&q.loc&&nrm(r.loc)===nrm(q.loc))s+=4;if(r.ev&&q.ev&&nrm(r.ev)===nrm(q.ev))s+=4;else if(r.ev&&q.ev){var a=nrm(r.ev).split(/\s+/).filter(function(w){return w.length>3}),b=nrm(q.ev);a.forEach(function(w){if(b.indexOf(w)>=0)s+=.7})}
 if(r.cid&&q.cid&&nrm(r.cid)===nrm(q.cid))s+=1;if(r.cat&&q.cat&&r.cat===q.cat)s+=1.2;if(r.cont&&q.cont&&nrm(r.cont)===nrm(q.cont))s+=2;return s}
function similar(r,all){var L=[];(all?allArts():[cur.a]).forEach(function(a){BASE[a].p.forEach(function(p){if(a===cur.a&&p===cur.p)return;var q=R(a,p),s=score(r,q);if(s>=2)L.push({a:a,p:p,r:q,s:s})})});L.sort(function(x,y){return y.s-x.s||(x.r.dt<y.r.dt?1:-1)});return L}
function simil(){if(!cur)return;var r=cur_(),L=similar(r,SALL).slice(0,8);
 $("simp").innerHTML='<h2>Propostas semelhantes</h2><div class="dvseg"><button data-v="0"'+(SALL?"":' class="on"')+'>Artista atual</button><button data-v="1"'+(SALL?' class="on"':"")+'>Todos</button></div>'+(L.length?L.map(function(x,i){return'<div class="dvsi"><b>'+esc(brs(x.r.dt))+(x.a!==cur.a?" · "+esc(x.a):"")+"</b> "+esc((x.r.ev||x.r.loc||"").trim())+"<small>"+esc([x.r.loc,x.r.cid,money(x.r.cach),x.r.st].filter(Boolean).join(" · "))+'</small><button data-i="'+i+'">Usar como base</button></div>'}).join(""):'<p class="mu">Preencha evento, local ou cidade para ver propostas parecidas.</p>');
 $("simp").querySelectorAll(".dvseg button").forEach(function(b){b.onclick=function(){SALL=+b.dataset.v;simil()}});
 $("simp").querySelectorAll(".dvsi button").forEach(function(b){b.onclick=function(){var x=L[+b.dataset.i];applyFrom(x.r,(x.a===cur.a?"#"+x.p.n:x.a)+" ("+brs(x.r.dt)+")")}});sug()}
/* ---- sugestões de preenchimento ---- */
var FSUG=[["cid","Cidade/UF"],["cat","Categoria"],["end_local","Endereço"],["hi","Início do evento"],["hf","Fim do evento"],["ini","Início do show"],["dur","Duração"],["eq","Equipamento"],["rid","Rider de hospitalidade"],["hosp","Hospedagem"],["prod","Produção"],["cont","Contratante"],["tel","Contato"],["cach","Cachê"]];
function sug(){var box=$("dsug");if(!box||!cur)return;var r=cur_(),L=similar(r,1);document.querySelectorAll(".dvsg").forEach(function(e){e.remove()});
 if(!L.length||!(r.loc||r.ev)){box.innerHTML="";return}var b=L[0],q=b.r,S=[];
 FSUG.forEach(function(f){var v=q[f[0]],cv=r[f[0]];if((cv===undefined||cv===null||cv===""||cv==="a definir")&&v!==undefined&&v!==null&&v!==""&&v!=="a definir")S.push([f[0],f[1],v])});
 S.forEach(function(s){var inp=$("f_"+s[0]);if(!inp)return;var c=document.createElement("button");c.type="button";c.className="dvsg";c.textContent="Sugestão: "+(s[0]==="cach"?money(s[2]):String(s[2]).split("\n")[0].slice(0,40));c.title="Da proposta de "+brs(q.dt)+(b.a!==cur.a?" · "+b.a:"");c.onclick=function(){setVal(s[0],s[0]==="cach"?num(s[2]):String(s[2]));c.remove();buildForms();bar()};inp.parentNode.appendChild(c)});
 box.innerHTML=S.length?'<div class="dvsb">💡 '+S.length+' sugest'+(S.length>1?"ões":"ão")+' com base em '+esc((q.ev||q.loc||"").trim())+" ("+esc(brs(q.dt))+(b.a!==cur.a?" · "+esc(b.a):"")+') <button id="dsa">Aplicar todas</button></div>':"";
 var ba=$("dsa");if(ba)ba.onclick=function(){var k=ck(),o=OV[k]||(OV[k]={});S.forEach(function(s){o[s[0]]=s[2]});buildForms();buildOpts();renderSum();renderAll();bar();toast("Sugestões aplicadas — confira e salve")}}
var _bf=buildForms;buildForms=function(){_bf();setTimeout(sug,0)};

/* ---- calculadora de cachê: a mesma do estudo de cachês (pe2027/estudo), carregada em bkcalc.js ---- */
window.BKINS=function(v){if(!cur)return;setVal("cach",String(v));var f=$("f_cach");if(f)f.value="R$ "+nm2(v);bar();try{renderSum();renderAll()}catch(e){}toast("Cachê R$ "+nm2(v)+" inserido — salve para confirmar")};
function calcInit(){if(window.BKCALC)BKCALC.open(cur_(),cur.a);else $("calcp").innerHTML=""}
function hrs(s){var m=/^(\d+):(\d+)/.exec(s||"");return m?+m[1]+ +m[2]/60:1}

/* ---- seletor: nada selecionado ao abrir; nº completo (prefixo + 4 dígitos + /ano); sem artista = todos os artistas ---- */
listFor=function(a){var open=$("flt").value==="open",L=[];(a?[a]:ORDER.filter(function(x){return BASE[x]&&BASE[x].p})).forEach(function(ar){(BASE[ar].p||[]).forEach(function(p){if(open&&!okOpen(p))return;L.push({a:ar,p:p})})});
 var EK=function(p){var c=[p.mt,p.dprop,p.dapr].map(String).filter(function(d){return/^\d{4}-\d\d-\d\d/.test(d)}).sort();return c.length?c[c.length-1]:String(p.dt||"")};L.sort(function(x,y){var a=EK(x.p),b=EK(y.p);if(a!==b)return a<b?1:-1;if(x.p.dt!==y.p.dt)return String(x.p.dt||"")<String(y.p.dt||"")?1:-1;return(+y.p.n||0)-(+x.p.n||0)});return L};/* última modificação primeiro: mt (BB/ALTERAÇÃO da planilha quando o DROM Sync manda; senão mudança vista pela sincronização) ou a mais recente entre DATA PROPOSTA/DATA APROVAÇÃO; sem nenhuma, a data do show */
fillProps=function(keep){var a=$("art").value,L=listFor(a);
 $("prop").innerHTML='<option value="">'+(L.length?"Selecionar proposta ("+L.length+")":"Nenhuma proposta com esse filtro")+"</option>"+L.map(function(x){var p=x.p;return'<option value="'+esc(ovk(x.a,p.n))+'">'+numero(p,x.a)+" · "+br(p.dt)+(a?"":" · "+esc(x.a))+" · "+esc((p.ev||p.loc||"(sem evento)").trim()).slice(0,50)+(p.cid?" · "+esc(p.cid):"")+" · "+esc(p.st||"")+"</option>"}).join("");
 var sel=keep&&L.some(function(x){return ovk(x.a,x.p.n)===keep})?keep:"";$("prop").value=sel;lastSel=sel;if(sel)pick();else{cur=null;noSel()}};
function noSel(){$("app").hidden=true;$("empty").hidden=false;$("empty").innerHTML='<b>Nenhuma proposta aberta.</b><br>Escolha uma proposta no seletor acima, busque por evento, local, cidade ou nº, ou use <b>Nova</b> para criar uma.';tbar()}

/* ---- financeiro: Lançar custos, Cachê recebido, Comissão paga (mesma ideia e janelas dos apps dos artistas, dev/dev.js EDT) ---- */
var FX=["desp","rec","recpor","drec","scom","liq"];
var CI=[["vei","Veículo próprio"],["val","Veículo alugado"],["ped","Pedágios"],["app","Uber / 99 / Taxi"],["oni","Passagem de ônibus"],["aer","Passagem aérea"],["hos","Hospedagem"],["ali","Alimentação"],["fot","Foto / Vídeo"],["eqm","Equipamento"],["eqp","Equipe"],["out","Outros"]];
var CUD={};iget("cud").then(function(v){CUD=v||{}});
function nm2(v){return Number(v||0).toFixed(2).replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g,".")}
function pv(t){t=String(t||"").replace(/[^\d,]/g,"");if(!t)return 0;return parseFloat(t.replace(/\./g,"").replace(",","."))||0}
function hoje(){var d=new Date();return String(d.getDate()).padStart(2,"0")+"/"+String(d.getMonth()+1).padStart(2,"0")+"/"+d.getFullYear()}
function nh(s){return String(s||"").trim().toUpperCase()}
function cpaid(r){return nh(r.scom)==="PAGO"}
function recv(r){var c=num(r.cach),st=nh(r.rec),t=0,m,re=/R\$\s*([\d.]*\d(?:,\d{1,2})?)/g,dr=String(r.drec||"");if(st==="PAGO")return c;while((m=re.exec(dr)))t+=parseFloat(m[1].replace(/\./g,"").replace(",","."))||0;var pc=/ENTRADA (\d+)%/.exec(st);if(pc&&!/R\$/.test(dr))t+=c*(+pc[1])/100;return Math.min(c||t,t)}
function comV(r){var b=num(r.cach)-num(r.desp),c=num(r.com);return c>0&&c<1?b*c:c>=1?c:0}
function finOK(){return !!cur&&WRT(cur.a)}
function finHTML(){var r=cur_(),c=num(r.cach),rv=recv(r),pg=cpaid(r),w=finOK(),pc=num(r.com);
 var stc=nh(r.rec)==="PAGO"?"ok":rv>0?"pa":"pe";
 return'<div class="fin"><div class="fini"><div><small>Cachê recebido</small><b class="'+stc+'">'+(stc==="ok"?"✓ Pago":rv>0?"R$ "+nm2(rv)+" de R$ "+nm2(c):"Pendente")+'</b></div><div><small>Custos</small><b>'+(num(r.desp)?"R$ "+nm2(r.desp):"—")+'</b></div><div><small>Comissão'+(pc>0&&pc<1?" ("+Math.round(pc*100)+"%)":"")+'</small><b class="'+(pg?"ok":"pe")+'">'+(comV(r)?"R$ "+nm2(comV(r))+" · ":"")+(pg?"✓ Paga":"Pendente")+'</b></div></div>'+
  '<div class="finb"><button type="button" class="fb1" id="fcu"'+(w?"":" disabled")+'>Lançar custos</button><button type="button" class="fb2" id="fca"'+(w?"":" disabled")+'>Cachê recebido</button><button type="button" class="fb3'+(pg?" fdn":"")+'" id="fco"'+(w?"":" disabled")+'>'+(pg?"✓ Comissão paga":"Comissão paga")+"</button></div>"+
  (w?(pg?'<p class="finh">Comissão paga: custos e cachê ficam bloqueados aqui (edite direto na planilha).</p>':""):'<p class="finh">Lançar custos, cachê e comissão: disponível quando a gravação for liberada para este artista.</p>')+"</div>"}
function finBind(){if(!finOK())return;var r=cur_();$("fcu").onclick=function(){custos(cur_())};$("fca").onclick=function(){var x=cur_();if(nh(x.rec)==="PAGO"){okm("Cachê já recebido por completo (Pago).");return}cacheM(x)};$("fco").onclick=function(){comissao(cur_())}}
function sub(r){return brs(r.dt)+" · "+(r.ev||r.loc||"")+" · Proposta "+numero(r,cur.a)}
function emd(h,lock){ecl();var m=document.createElement("div");m.id="emd";if(lock)m.className="lk";m.innerHTML='<div class="md" role="dialog" aria-modal="true">'+h+"</div>";document.body.appendChild(m);m.addEventListener("click",function(e){if(e.target===m)ecl()});var f=m.querySelector("input:not([disabled]),button");if(f&&!("ontouchstart" in window))setTimeout(function(){f.focus()},0);return m}
function ecl(){var m=document.getElementById("emd");if(m)m.remove()}
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&document.getElementById("emd"))ecl()});
function okm(t){var m=emd('<div class="okm"><i>✓</i><p class="tt">'+esc(t)+'</p><div class="bt"><button class="ok">OK</button></div></div>');m.querySelector(".ok").onclick=ecl}
function erro(t){var m=emd('<div class="okm"><i style="background:#c5221f">!</i><p class="tt">Não foi gravado na planilha</p><p class="sb" style="margin-top:8px">'+esc(t)+'</p><div class="bt"><button class="ok">OK</button></div></div>');m.querySelector(".ok").onclick=ecl}
function wait(m){var b=m.querySelectorAll(".bt button");b.forEach(function(x){x.disabled=true});var o=m.querySelector(".ok");if(o)o.textContent="Gravando…"}
/* grava (planilha do Artista Teste via escrita.gs; sem URL em w.json: só neste aparelho) e aplica localmente até a próxima sincronização */
function wfin(op,d,loc,msg,m){var k=ck(),a=cur.a,p=cur.p;
 function apply(){delete loc.recpor;var o=OV[k]||(OV[k]={}),s0=SAVED[k]||(SAVED[k]={});Object.assign(o,loc);Object.assign(s0,loc);wsPut(k,loc);persist();if(cur&&ck()===k){renderSum();bar()}ecl();okm(msg+(WS.on?"":" (só neste aparelho)"))}
 if(!WS.on){apply();return}wait(m);
 WS.send(op,a,Object.assign({n:+p.n},d)).then(function(r){if(r&&r.ok){apply();return}ecl();erro((r&&r.err)||"falha de conexão")},function(){ecl();erro("falha de conexão")})}
function mmask(inp,pre){inp.addEventListener("input",function(){var d=inp.value.replace(/\D/g,"");inp.value=d?(pre||"")+nm2(+d/100):""})}
function dpre(d){var o="";for(var i=0;i<d.length&&o.length<8;i++){var c=d[i],t=o+c,n=t.length;
 if(n===1&&c>"3")continue;if(n===2&&(t==="00"||(t[0]==="3"&&c>"1")))continue;if(n===3&&c>"1")continue;if(n===4&&(t.slice(2)==="00"||(t[2]==="1"&&c>"2")))continue;
 if(n===4){var dd=+t.slice(0,2),mm=+t.slice(2);if(dd>[31,29,31,30,31,30,31,31,30,31,30,31][mm-1])continue}if(n===5&&c!=="2")continue;o=t}return o}
function dmask(inp){inp.setAttribute("inputmode","numeric");inp.maxLength=10;inp.addEventListener("input",function(){var d=dpre(inp.value.replace(/\D/g,""));inp.value=d.length>4?d.slice(0,2)+"/"+d.slice(2,4)+"/"+d.slice(4):d.length>2?d.slice(0,2)+"/"+d.slice(2):d;var e=inp.parentNode.querySelector(".er");if(e)e.remove();inp.style.borderColor=""})}
function dok(t){var m=/^(\d\d)\/(\d\d)\/(\d{4})$/.exec(t);if(!m)return false;var x=new Date(+m[3],m[2]-1,+m[1]);if(x.getDate()!=+m[1]||x.getMonth()!=m[2]-1||+m[3]<2020)return false;var h=new Date();h.setHours(23,59,59,999);return x<=h}
function derr(inp){inp.style.borderColor="#c5221f";if(!inp.parentNode.querySelector(".er"))inp.insertAdjacentHTML("afterend",'<p class="er">Digite data válida</p>')}
function custos(r){var L=cpaid(r),k=ck(),sv=CUD[k],det=(sv&&sv.det)||{},tot=num(r.desp),man=!sv&&tot>0;
 var h='<p class="tt">Lançar custos</p><p class="sb">'+esc(sub(r))+(L?"<br>comissão paga · edição bloqueada":"<br>O total vai para DESPESAS e a lista vira a nota da célula")+"</p>"+CI.map(function(c){var x=det[c[0]];return'<div class="ci'+(x?" v":"")+'"><span>'+c[1]+'</span><input data-c="'+c[0]+'" inputmode="decimal" aria-label="'+c[1]+'" placeholder="'+(L?"—":"+ adicionar")+'" value="'+(x?"R$ "+nm2(x):"")+'"'+(L?" disabled":"")+"></div>"}).join("")
  +'<div class="tot"><span>Total</span><input inputmode="decimal" aria-label="Total" value="'+(tot?"R$ "+nm2(tot):"")+'" placeholder="R$ 0,00"'+(L?" disabled":"")+"></div>"+(L?'<div class="bt"><button class="ok">Fechar</button></div>':'<div class="bt"><button class="cn">Cancelar</button><button class="ok">OK</button></div>');
 var m=emd(h,L),ti=m.querySelector(".tot input"),its=m.querySelectorAll(".ci input");
 its.forEach(function(i){mmask(i,"R$ ");i.addEventListener("input",function(){i.parentNode.classList.toggle("v",!!pv(i.value));var t=0;its.forEach(function(x){t+=pv(x.value)});ti.value=t?"R$ "+nm2(t):""})});mmask(ti,"R$ ");
 var cn=m.querySelector(".cn");if(cn)cn.onclick=ecl;m.querySelector(".ok").onclick=function(){if(L)return ecl();var d={},dl={},t=pv(ti.value);its.forEach(function(i){var x=pv(i.value);if(x){d[i.dataset.c]=x;CI.forEach(function(c){if(c[0]===i.dataset.c)dl[c[1]]=x})}});
  CUD[k]={det:d,tot:t};iput("cud",CUD);wfin("custos",{det:dl,tot:t},{desp:t,liq:num(r.cach)-t},"Custos lançados com sucesso",m)}}
function cacheM(r,pv0,pd0,por0){var L=cpaid(r),c=num(r.cach),rv=recv(r),pd=Math.max(0,c-rv),ch=[],por=por0||"Artista";
 if(rv>0){ch.push(["Restante",pd])}else{ch.push(["Cachê total",c]);ch.push(["Sinal 30%",c*.3]);ch.push(["Sinal 50%",c*.5])}ch.push(["Outro",null]);
 var h='<p class="tt">Cachê recebido</p><p class="sb">'+esc(sub(r))+(L?"<br>comissão paga · edição bloqueada":"")+"</p>"+(rv>0?'<div class="rs"><div><span>Cachê</span><b>R$ '+nm2(c)+'</b></div><div style="color:#0a8a07"><span>✓ recebido</span><b>R$ '+nm2(rv)+'</b></div><div style="color:#c5221f"><span>pendente</span><b>R$ '+nm2(pd)+"</b></div></div>":"")
  +'<p class="lb">Valor recebido</p><div class="vf"><span>R$</span><input inputmode="decimal" aria-label="Valor recebido" value="'+(pv0||nm2(ch[0][1]))+'"'+(L?" disabled":"")+'></div>'+(L?"":'<div class="chs">'+ch.map(function(x,i){return'<span role="button" tabindex="0" data-i="'+i+'"'+(i?"":' class="on"')+">"+x[0]+"</span>"}).join("")+"</div>")
  +'<p class="lb"'+(L?' style="margin-top:14px"':"")+'>Data do recebimento</p><input class="fld dt" aria-label="Data do recebimento" style="text-align:center" value="'+(pd0||hoje())+'"'+(L?" disabled":"")+">"
  
  +(L?'<div class="bt"><button class="ok">Fechar</button></div>':'<div class="bt"><button class="cn">Cancelar</button><button class="ok">OK</button></div>');
 var m=emd(h,L),v=m.querySelector(".vf input"),dt=m.querySelector("input.dt");mmask(v);dmask(dt);
 m.querySelectorAll(".chs:not(.pr) span").forEach(function(s){s.onclick=function(){m.querySelectorAll(".chs:not(.pr) span").forEach(function(x){x.classList.remove("on")});s.classList.add("on");var x=ch[+s.dataset.i][1];if(x===null){v.value="";v.focus()}else v.value=nm2(x)}});
 m.querySelectorAll(".chs.pr span").forEach(function(s){s.onclick=function(){por=s.dataset.p;m.querySelectorAll(".chs.pr span").forEach(function(x){x.classList.toggle("on",x===s)})}});
 m.querySelectorAll(".chs span").forEach(function(s){s.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();s.click()}}});
 var cn=m.querySelector(".cn");if(cn)cn.onclick=ecl;
 m.querySelector(".ok").onclick=function(){if(L)return ecl();var val=pv(v.value),d=dt.value.trim();if(!dok(d)){derr(dt);return}if(!val){v.parentNode.style.borderColor="#c5221f";return}
  var st0=nh(r.rec),XT=st0==="PAGO"||(c>0&&rv>=c-.005),dup=dupMsg(r,val,d,c,rv);if(dup&&!XT){ecl();erro(dup);return}
  var go=function(){var eq=function(a,b){return Math.abs(a-b)<.005},tp=go.ex||rv>0?"outro":eq(val,c)?"total":eq(val,c*.3)?"s30":eq(val,c*.5)?"s50":"outro",loc={recpor:por},fl={v:val,d:d,tipo:tp,acima:go.ac?1:0};if(go.rp)fl.repetido=1;if(go.ex)fl.extra=1;
   if(tp!=="outro"){loc.rec=tp==="total"?"Pago":tp==="s30"?"Entrada 30%":"Entrada 50%";loc.drec=d}
   else{var od=String(r.drec||""),nv=d+" - R$ "+nm2(val)+(go.ex?" (extra)":"");loc.drec=od?od+"\n"+nv:nv;if(st0!=="PAGO"&&rv+val>=c-.01&&c>0)loc.rec="Pago"}
   wfin("cache",fl,loc,go.ex?"Pagamento extra registrado":"Recebimento de cachê registrado",m)};
  var md=m.querySelector(".md"),vv=v.value,ask=function(t,sb,nx){md.innerHTML='<div class="okm"><i style="background:#FF5B1F;font-weight:900">!</i><p class="tt" style="font-size:15px;line-height:1.4">'+t+'</p>'+(sb?'<p class="sb" style="margin:10px 0 0;line-height:1.7">'+sb+"</p>":"")+'<div class="bt"><button class="cn">Corrigir</button><button class="ok">Confirmar</button></div></div>';md.querySelector(".cn").onclick=function(){cacheM(r,vv,d,por)};md.querySelector(".ok").onclick=nx};
  /* confirmações (o escrita.gs aceita com as flags): cachê Pago -> extra=1; recebimento igual -> repetido=1; acima do cachê -> acima=1 + extra=1 */
  var c3=function(){var tt=recv(r)+val;if(!go.ex&&c>0&&tt>c+.01)return ask("O valor excede o cachê registrado (R$ "+nm2(c)+"). Registrar pagamento extra?","Digitado: <b style=\"color:#111\">R$ "+nm2(tt)+"</b><br>No sistema: <b style=\"color:#111\">R$ "+nm2(c)+"</b>",function(){go.ac=1;go.ex=1;go()});go()},
   c2=function(){if(dupRec(r,val,d))return ask("Já existe um recebimento igual ("+d.slice(0,5)+", R$ "+nm2(val)+"). Registrar outro mesmo assim?","",function(){go.rp=1;c3()});c3()};
  if(XT)return ask("Cachê já está como Pago. Registrar pagamento extra?","Valor: <b style=\"color:#111\">R$ "+nm2(val)+"</b> em "+d,function(){go.ex=1;go.ac=1;c2()});c2()}}
function dupRec(r,val,d){var o=String(r.drec||"");return o.indexOf(d+" (R$ "+nm2(val)+")")>=0||o.indexOf(d+" - R$ "+nm2(val))>=0}
/* mesmo pagamento duas vezes: o escrita.gs recusa; aqui a checagem antecipada com os dados da tela */
function dupMsg(r,val,d,c,rv){var st=nh(r.rec),eq=function(a,b){return Math.abs(a-b)<.005};
 var tp=rv>0?"outro":eq(val,c)?"total":eq(val,c*.3)?"s30":eq(val,c*.5)?"s50":"outro";
 if((tp==="s30"||tp==="s50")&&/^ENTRADA/.test(st))return"Sinal já registrado ("+r.rec+"). Para outra parcela use Outro.";
 return""}   /* Pago, recebimento igual e acima do cachê: confirmação em cacheM (extra=1 / repetido=1 / acima=1) */
function comissao(r){var pg=cpaid(r),v=comV(r),pc=num(r.com);
 if(pg){var m0=emd('<p class="tt">Comissão paga</p><p class="sb">'+esc(sub(r))+'</p><div class="rs"><div><span>Comissão'+(pc>0&&pc<1?" ("+Math.round(pc*100)+"%)":"")+'</span><b>'+(v?"R$ "+nm2(v):"—")+'</b></div><div style="color:#0a8a07"><span>STATUS COMISSÃO</span><b>✓ Pago</b></div></div><p class="sb">Para desfazer, edite direto na planilha.</p><div class="bt"><button class="ok">Fechar</button></div>',1);m0.querySelector(".ok").onclick=ecl;return}
 var m=emd('<p class="tt">Comissão paga</p><p class="sb">'+esc(sub(r))+'</p><div class="rs"><div><span>Cachê</span><b>R$ '+nm2(r.cach)+'</b></div><div><span>Custos</span><b>R$ '+nm2(r.desp)+'</b></div><div style="color:#0000FF"><span>Comissão'+(pc>0&&pc<1?" ("+Math.round(pc*100)+"%)":"")+'</span><b>'+(v?"R$ "+nm2(v):"—")+'</b></div></div><p class="sb">Marca <b>STATUS COMISSÃO = "Pago"</b> na planilha. Depois disso custos e cachê ficam bloqueados aqui.</p><div class="bt"><button class="cn">Cancelar</button><button class="ok">Confirmar</button></div>');
 m.querySelector(".cn").onclick=ecl;m.querySelector(".ok").onclick=function(){wfin("comissao",{},{scom:"Pago"},"Comissão marcada como paga",m)}}
var fcss=document.createElement("style");fcss.textContent=
 /* barra fixa do topo: 5 botões, sempre no mesmo lugar (desabilitar não muda o layout) */
 '.fb #art{order:1}.fb #flt{order:2;flex:0 1 200px}.fb .sq{order:3;flex:1 1 calc(100% - 430px)}.fb #prop{order:4;flex:1 1 220px;min-width:0}.fb .bktb{order:5}'
 +'.bktb{display:grid;grid-template-columns:auto auto auto auto auto;gap:6px;flex:none}.bktb .tb{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 11px;margin:0;border:1px solid var(--bd,#e4e4e0);border-radius:10px;background:#fff;color:#1b1b1b;font:600 13px/1 inherit;white-space:nowrap;cursor:pointer;box-sizing:border-box}'
 +'.bktb .tb svg{width:17px;height:17px;flex:none}.bktb .tb svg *{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.bktb .ts{display:none}'
 +'.bktb .tb:disabled{opacity:.4;cursor:default}.bktb .tb:not(:disabled):hover{border-color:#FF5B1F}.bktb .tbnw:not(:disabled){background:#FF5B1F;border-color:#FF5B1F;color:#0a0a0a}.bktb .tbsv.dd{background:#0000FF;border-color:#0000FF;color:#fff}.bktb .tbsv.dd .tl::after{content:" ●"}.bktb .tbds:not(:disabled){color:#c5221f;border-color:#f0c4c3}'
 +'@media(max-width:760px){.fb{gap:6px!important}.fb #art{flex:1 1 40%}.fb #flt{flex:1 1 40%}.fb #prop{flex:1 1 100%}.fb .bktb{flex:1 1 100%;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px}.fb .sq{order:6;flex:1 1 100%}'
 +'.bktb .tb{flex-direction:column;gap:3px;height:48px;padding:0 2px;font-size:10.5px;border-radius:10px;min-width:0}.bktb .tl{display:none}.bktb .ts{display:block;overflow:hidden;text-overflow:ellipsis;max-width:100%}.bktb .tbsv.dd .ts::after{content:" ●"}.fb select,.fb input{height:38px}}'
 /* financeiro */
 +'.fin{margin-top:10px;border-top:1px solid #eee;padding-top:10px}.fini{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}.fini>div{background:#f6f6f6;border-radius:10px;padding:7px 10px;min-width:0}.fini small{display:block;font-size:11px;color:#666}.fini b{font-size:13.5px;display:block;overflow-wrap:anywhere}.fini b.ok{color:#0a8a07}.fini b.pa{color:#b25b00}.fini b.pe{color:#c5221f}'
 +'.finb{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.finb button{height:40px;border-radius:20px;border:0;color:#fff;font:700 13px/1 inherit;cursor:pointer;padding:0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.finb .fb1{background:#FF5B1F;color:#0a0a0a}.finb .fb2{background:#0a8a07}.finb .fb3{background:#0000FF}.finb .fdn{background:#e6f4e6;color:#0a8a07}.finb button:disabled{background:#e6e6e6!important;color:#999!important;cursor:not-allowed}.finh{font-size:12px;color:#777;margin:8px 0 0;text-align:center}'
 +'@media(max-width:430px){.finb button{font-size:12px;padding:0 4px}.fini b{font-size:12.5px}}'
 /* janelas (iguais às dos apps dos artistas) */
 +'#emd{position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:max(12px,env(safe-area-inset-top,0px)) 20px max(12px,env(safe-area-inset-bottom,0px));font-family:system-ui,-apple-system,sans-serif}#emd *{box-sizing:border-box}#emd .md{background:#fff;color:#111;border-radius:18px;padding:18px 16px 16px;width:100%;max-width:400px;max-height:100%;overflow:auto;overscroll-behavior:contain}#emd .tt{font-weight:800;font-size:16px;text-align:center;margin:0}#emd .sb{color:#777;font-size:12px;text-align:center;margin:3px 0 14px;line-height:1.4}#emd .bt{display:flex;gap:10px;margin-top:16px}#emd .bt button{flex:1;height:44px;border-radius:12px;border:0;color:#fff;font-weight:700;font-size:15px;font-family:inherit;cursor:pointer}#emd .bt button:disabled{opacity:.6}#emd .ok{background:#0a8a07}#emd .cn{background:#c5221f}#emd .lb{font-size:12px;color:#666;text-align:center;margin:0 0 5px}#emd .fld{border:1.5px solid #ddd;border-radius:12px;padding:10px 14px;font-size:16px;width:100%;background:#fff;color:#111;font-family:inherit}#emd .er{color:#c5221f;font-size:12px;text-align:center;margin:6px 0 0;font-weight:600}'
 +'#emd .vf{display:flex;align-items:baseline;gap:8px;border:2px solid #0000FF;border-radius:12px;padding:6px 14px}#emd .vf span{color:#0000FF;font-weight:800}#emd .vf input{flex:1;min-width:0;border:0;outline:0;text-align:right;font-weight:900;font-size:24px;font-family:inherit;color:#0000FF;background:none}#emd .chs{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:8px 0 14px}#emd .chs span{font-size:12px;padding:5px 10px;border-radius:14px;background:#eee;cursor:pointer}#emd .chs span.on{background:#0000FF;color:#fff}#emd .rs{background:#f6f6f6;border-radius:12px;padding:10px 12px;font-size:13px;margin-bottom:14px}#emd .rs div{display:flex;justify-content:space-between}'
 +'#emd .ci{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:6px 10px;margin-bottom:4px;border-radius:10px;background:#f6f6f6;font-size:12.5px;white-space:nowrap}#emd .ci.v{background:#EEF0FF}#emd .ci input{width:110px;border:0;outline:0;background:none;text-align:right;font-weight:800;font-size:13px;font-family:inherit;color:#0000FF}#emd .ci input::placeholder{font-size:10.5px;font-weight:600;color:#aaa}#emd .tot{display:flex;justify-content:space-between;align-items:baseline;margin-top:8px;padding:10px 10px 2px;border-top:2px solid #0000FF;font-weight:800}#emd .tot input{width:150px;border:0;outline:0;background:none;text-align:right;font-weight:800;font-size:18px;font-family:inherit;color:#0000FF}'
 +'#emd.lk .md *{color:#999!important}#emd.lk .bt button{color:#fff!important}#emd.lk .vf{border-color:#ccc}#emd.lk .ci,#emd.lk .rs{background:#f1f1f1}#emd.lk .tot{border-color:#bbb}#emd .okm{text-align:center;padding:6px 0 0}#emd .okm i{display:block;width:56px;height:56px;border-radius:50%;background:#0a8a07;color:#fff;font-weight:400;font-size:30px;line-height:56px;font-style:normal;margin:0 auto 12px}';
document.head.appendChild(fcss);

/* ---- início ---- */
var css=document.createElement("style");css.textContent='.dvb{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.dvb button[disabled]{opacity:.45;cursor:default}.dvsep{flex:1}.dvst{font-weight:700;font-size:13px}.dvst.dd{color:#c00}.dvst.ok{color:#188038}.dvro{font-size:12px;color:#666}.dvdev{font-size:11px;background:#FFF602;color:#000;border-radius:6px;padding:2px 8px;font-weight:700}.dvgrid{display:grid;grid-template-columns:minmax(0,1fr) 400px;gap:14px;align-items:start}@media(max-width:900px){.dvgrid{grid-template-columns:1fr}}.dvside{min-width:0}.dvside .dvcf{grid-template-columns:1fr 1fr!important}.dvside .dvcf label{min-width:0}.dvsi{border-top:1px solid #eee;padding:8px 0;font-size:13px}.dvsi small{display:block;color:#666}.dvsi button{margin-top:4px;font-size:12px;padding:3px 8px}.dvseg{display:inline-flex;border:1px solid #ccc;border-radius:8px;overflow:hidden;margin:4px 0 8px}.dvseg button{border:0;border-radius:0;padding:5px 10px;background:#fff}.dvseg button.on{background:#FF5B1F;color:#fff}.dvm{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px}.dvmc{background:#fff;color:#111;border-radius:14px;padding:18px;width:min(560px,100%);max-height:86vh;overflow:auto;display:flex;flex-direction:column;gap:8px}.dvmb{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:6px}.dvl{display:flex;flex-direction:column;font-size:13px;gap:3px}.dvpl{display:flex;flex-direction:column;gap:4px;max-height:50vh;overflow:auto}.dvpl button{text-align:left;padding:7px 9px;font-size:13px}.dvpl small{display:block;color:#666}#pkq{padding:8px;border-radius:8px;border:1px solid #ccc}.dvsg{display:block;margin-top:3px;font-size:11.5px;padding:2px 8px;border-radius:6px;border:1px dashed #FF5B1F;background:#FFF2EC;color:#a33a00;text-align:left;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}.dvsb{margin-top:8px;font-size:13px;background:#FFF2EC;border:1px solid #FFCDB8;border-radius:8px;padding:6px 10px}.dvsb button{margin-left:8px;font-size:12px;padding:3px 8px}.dvch{display:flex;justify-content:space-between;align-items:center}.dvcr{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px;font-size:15px}.dvcr b{font-size:22px}.dvcr small{color:#666}.dvck{flex-direction:row!important;align-items:center;gap:6px}.dvcf input[type=number],.dvcf select{padding:9px 10px;border:1px solid #d9d9d9;border-radius:9px;width:100%;box-sizing:border-box;font:inherit;background:#fff}';document.head.appendChild(css);
Promise.all([iget("ov"),iget("new"),iget("ws")]).then(function(v){SAVED=v[0]||{};NEW=v[1]||[];WSV=v[2]||{};
 var wch=0;Object.keys(WSV).forEach(function(k){var x=WSV[k],ut=upT(k);if(ut&&ut>x.t+60e3){delete WSV[k];wch=1;if(SAVED[k])Object.keys(FM).concat(FX).forEach(function(f){delete SAVED[k][f]});return}
  var xa=String(k).split("|")[0];if(x.nw&&BASE[xa]&&!BASE[xa].p.some(function(y){return y.n===x.nw.n}))BASE[xa].p.push(CL_(x.nw));SAVED[k]=Object.assign(SAVED[k]||{},x.h)});if(wch){iput("ws",WSV);iput("ov",SAVED)}
 NEW.forEach(function(p){var na=BASE[p._a]?p._a:TA,q=CL_(p);delete q._a;if(!BASE[na].p.some(function(x){return x.n===p.n}))BASE[na].p.push(q)});
 Object.keys(SAVED).forEach(function(k){OV[k]=CL_(SAVED[k])});
 var arts=ORDER.filter(function(a){return BASE[a]&&BASE[a].p&&BASE[a].p.length});$("art").innerHTML='<option value="">Todos os artistas</option>'+arts.map(function(a){return'<option value="'+esc(a)+'">'+esc(a)+"</option>"}).join("");$("art").value="";fillProps()})

/* ===== formatos DROM, listas da planilha, vários horários, show confirmado, financeiro na lateral ===== */
brs=br;/* datas sempre DD/MM/AAAA */
STOK["Em negociação"]="wr";
/* listas de validação reais (aba _AUXILIAR das planilhas "Gestão e Propostas") */
var VL={st:["Proposta emitida","Proposta descartada","Em negociação","Show confirmado","Show realizado","Show cancelado","Data reservada","Remarcar","Data indisponível"],
 cat:["Casa noturna","Bar","Universitário","Formatura","Aniversário","Casamento","Corporativo","Particular","Label","Outdoor"],
 eq:["LEVAR","CONFIRMAR","2CDJ+Mixer","XDJ","Controladora"],hosp:["Contratante","Artista","Não"],
 ctr:["Sim","Não","Pendente"],nf:["Sim","Não","Pendente"],rec:["Pago","Pendente","Entrada 30%","Entrada 50%"]};
var DTF=["dt","dprop","dapr","dsin"],MNY=["cach","desp"],RO={dow:"automático pela data",liq:"cachê bruto − despesas",rec:"use o botão Cachê recebido",recpor:"use o botão Cachê recebido",drec:"use o botão Cachê recebido"};
var HLP={st:"Ao mudar para Show confirmado, a aprovação, o sinal e o contrato são preenchidos",hi:"HH:MM · madrugada (00:00–05:59) conta como a noite da data do show",ini:"HH:MM ou a definir",dur:"H:MM (ex.: 1:30)",prod:"pessoas além do artista",com:"% sobre o cachê líquido",tel:"telefone do contratante",dsin:"automático: aprovação + prazo da 1ª parcela"};
function isoL(d){return d.getFullYear()+"-"+pad(d.getMonth()+1,2)+"-"+pad(d.getDate(),2)}
function hojeIso(){return isoL(new Date())}
function brD(s){return String(s||"").replace(/\b(\d{4})-(\d\d)-(\d\d)\b/g,"$3/$2/$1")}
var _gv=getVal;getVal=function(r,k){var v=_gv(r,k);if((k==="_comr"||k==="liq")&&v!=="")return"R$ "+nm2(num(v));if(k==="drec")return brD(v);return v};
/* horas */
function hN(v){v=String(v||"").trim();if(!v||/defin/i.test(v))return v?"a definir":"";var m=/^(\d{1,2})\s*(?:[:hH.]\s*(\d{1,2})?)?\s*(?:min)?$/.exec(v);if(!m||+m[1]>24||+(m[2]||0)>59)return null;return(+m[1]%24)+":"+pad(+(m[2]||0),2)}
function dN(v){v=String(v||"").trim();if(!v)return"";var m=/^(\d{1,2})\s*[:hH]\s*(\d{1,2})?\s*(?:min)?$/.exec(v);if(m)return(+m[1])+":"+pad(+(m[2]||0),2);
 m=/^(\d+)\s*min$/i.exec(v);if(m)return Math.floor(m[1]/60)+":"+pad(m[1]%60,2);m=/^(\d+(?:[.,]\d+)?)$/.exec(v);if(m){var t=Math.round(parseFloat(m[1].replace(",","."))*60);return Math.floor(t/60)+":"+pad(t%60,2)}return null}
function hm(x){x=((x%1440)+1440)%1440;return pad(Math.floor(x/60),2)+":"+pad(x%60,2)}
function parseH(t){var L=[],re=/(\d{1,2})(?:\s*[:h]\s*(\d{2})?|h)\s*(?:às|as|à|a|-|–|até)\s*(\d{1,2})(?:\s*[:h]\s*(\d{2})?|h)?/gi,x,b=null;
 while((x=re.exec(String(t||"")))){var i=+x[1]*60+ +(x[2]||0),f=+x[3]*60+ +(x[4]||0);if(b===null)b=i;while(i<b)i+=1440;while(f<=i)f+=1440;L.push([i,f]);b=f}return L}
function fmtSegs(g){return g.map(function(x){var e=hm(x[1]);return hm(x[0])+" "+asH(e)+" "+e}).join(" e ")}
function sumDur(g){var t=0;g.forEach(function(x){t+=x[1]-x[0]});return Math.floor(t/60)+":"+pad(t%60,2)}
var HRE=/^[ \t]*hor[áa]rios?\s*:[^\n]*\n?/im;
function segsOf(r){var m=/hor[áa]rios?\s*:\s*([^\n]+)/i.exec(String(r.hn||""))||/hor[áa]rios?\s*:\s*([^\n]+)/i.exec(String(r.obs||""));if(!m)return null;var g=parseH(m[1]);return g.length>=2?g:null}
var _ic=iniC;iniC=function(r){var g=segsOf(r);return g?fmtSegs(g):_ic(r)};
var _cx=ctxOf;ctxOf=function(r,a){var X=_cx(r,a),g=segsOf(r);if(g){X.ini=X.iniC=fmtSegs(g);X.dur=durFmt(sumDur(g))+" no total ("+g.length+" entradas)"}return X};
var _wp=waProposta;waProposta=function(r,a){var t=_wp(r,a);return segsOf(r)?t.replace(/^Horário de início da apresentação: /m,"Horários da apresentação: "):t};
var _wa=waArtista;waArtista=function(r,a){var t=_wa(r,a),g=segsOf(r);return g?t.replace(/^Horário de início: .*$/m,"Horários: "+fmtSegs(g)).replace(/^Duração: .*$/m,"Duração: "+durFmt(sumDur(g))+" no total"):t};
/* show confirmado: o que muda junto */
function onSt(v){if(v!=="Show confirmado")return;var r=cur_(),a=cur.a,ch=[];
 if(!r.dapr){setVal("dapr",hojeIso());ch.push("Data de aprovação: "+br(hojeIso()))}
 r=cur_();var sp=splitPct(opt(r,a,"pag"));if(!r.dsin&&sp&&r.dapr){var d=new Date(r.dapr+"T12:00");d.setDate(d.getDate()+(+opt(r,a,"dias")||7));setVal("dsin",isoL(d));ch.push("Vencimento do sinal ("+sp+"%): "+br(isoL(d)))}
 if(!r.ctr||r.ctr==="Não"){setVal("ctr","Pendente");ch.push("Contrato: Pendente")}
 buildForms();renderSum();bar();
 modal('<b>Show confirmado</b><p>'+(ch.length?"Preenchido junto:<br>• "+ch.map(esc).join("<br>• "):"Aprovação, sinal e contrato já estavam preenchidos.")+'</p><p class="note">Ao salvar, a planilha é atualizada; na próxima sincronização o show aparece como confirmado no app do artista, no Painel e na agenda. Próximos passos: aba <b>Contrato</b> (gerar e enviar), <b>Cachê recebido</b> quando o sinal entrar.</p><div class="dvmb"><button class="pri c">OK</button></div>',function(m){m.querySelector(".c").onclick=function(){m.remove()}})}
function lbl(i,t){var s=document.createElement("small");s.className="fhl";s.textContent=t;i.parentNode.appendChild(s);return s}
function enh(){var r=cur_();if(!r)return;
 Object.keys(VL).forEach(function(k){var i=$("f_"+k);if(!i)return;var v=_gv(r,k),L=VL[k].slice(),fora=v&&L.indexOf(v)<0;if(fora)L.unshift(v);
  var se=document.createElement("select");se.id=i.id;se.dataset.k=k;se.innerHTML='<option value="">—</option>'+L.map(function(o){return"<option"+(o===v?" selected":"")+">"+esc(o)+"</option>"}).join("");
  i.replaceWith(se);if(fora)lbl(se,"Valor fora da lista da planilha").style.color="#c5221f";
  if(RO[k]){se.disabled=true;return}se.addEventListener("change",function(){setVal(k,se.value);if(k==="st")onSt(se.value);bar()})});
 DTF.forEach(function(k){var i=$("f_"+k);if(!i)return;var t=document.createElement("input");t.type="text";t.id=i.id;t.dataset.k=k;t.placeholder="DD/MM/AAAA";t.value=br(_gv(r,k));i.replaceWith(t);dmask(t);
  t.addEventListener("input",function(){var v=t.value;if(!v){setVal(k,"");if(k==="dt")setDow("");return}var m=/^(\d\d)\/(\d\d)\/(\d{4})$/.exec(v);if(!m)return;var x=new Date(+m[3],m[2]-1,+m[1]);if(x.getDate()!==+m[1]){derr(t);return}setVal(k,m[3]+"-"+m[2]+"-"+m[1]);if(k==="dt")setDow(m[3]+"-"+m[2]+"-"+m[1])})});
 MNY.forEach(function(k){var i=$("f_"+k);if(!i)return;var n=i.cloneNode(false),v=_gv(r,k);n.value=v===""?"":"R$ "+nm2(num(v));n.inputMode="decimal";n.placeholder="R$ 0,00";i.replaceWith(n);mmask(n,"R$ ");n.addEventListener("input",function(){setVal(k,n.value?pv(n.value):"")})});
 Object.keys(RO).forEach(function(k){var i=$("f_"+k);if(i&&i.tagName==="INPUT"){i.readOnly=true;i.classList.add("ro");i.value=getVal(r,k)}if(i)lbl(i,RO[k])});
 ["hi","hf","ini"].forEach(function(k){tm(k,hN,"HH:MM")});tm("dur",dN,"H:MM");
 var p=$("f_prod");if(p){p.inputMode="numeric"}
 var c=$("f_cid");if(c)c.addEventListener("change",function(){var v=fmtCidUF(c.value);if(v!==c.value){c.value=v;setVal("cid",v);bar()}});
 var te=$("f_tel");if(te)te.addEventListener("change",function(){var v=fmtTel(te.value);if(v!==te.value){te.value=v;setVal("tel",v);bar()}});
 Object.keys(HLP).forEach(function(k){var i=$("f_"+k);if(i&&!RO[k])lbl(i,HLP[k])});
 hrsUI(r)}
function setObs(v){setVal("obs",v);var o=$("f_obs");if(o)o.value=v}
function setDow(iso){var d=iso?dowOf(iso):"";setVal("dow",d);var e=$("f_dow");if(e)e.value=d}
function tm(k,fn,ph){var i=$("f_"+k);if(!i)return;i.placeholder=ph;i.addEventListener("change",function(){var v=fn(i.value),e=i.parentNode.querySelector(".er");if(e)e.remove();i.style.borderColor="";
 if(v===null){i.style.borderColor="#c5221f";i.insertAdjacentHTML("afterend",'<p class="er">Use o formato '+ph+'</p>');return}if(v!==i.value){i.value=v;setVal(k,v);bar()}})}
var _bo=buildOpts;buildOpts=function(){_bo();$("optg").querySelectorAll('input[type=date]').forEach(function(i){var k=i.dataset.o,t=document.createElement("input");t.type="text";t.id=i.id;t.placeholder="DD/MM/AAAA";t.value=br(i.value);i.replaceWith(t);dmask(t);
 t.addEventListener("input",function(){var o=OV[ck()]||(OV[ck()]={}),v=t.value,m=/^(\d\d)\/(\d\d)\/(\d{4})$/.exec(v);if(v&&!m)return;o["o_"+k]=m?m[3]+"-"+m[2]+"-"+m[1]:"";renderAll()})})};
var _bf2=buildForms;buildForms=function(){_bf2();try{enh()}catch(e){console.error(e)}};
/* financeiro na lateral, só para show confirmado/realizado */
function finRender(){var sd=document.querySelector(".dvside");if(!sd)return;var box=$("finp");if(!box){box=document.createElement("div");box.className="p";box.id="finp";sd.insertBefore(box,sd.firstChild)}
 var r=cur_(),ok=!!r&&/^Show (confirmado|realizado)$/.test(r.st||"");box.hidden=!ok;if(!ok){box.innerHTML="";return}var c=num(r.cach),rv=recv(r),pg=cpaid(r),w=finOK(),pc=num(r.com),stc=nh(r.rec)==="PAGO"?"ok":rv>0?"pa":"pe",D=w?"":" disabled";
 function it(l,v,cl,id,bc,bt){return'<div class="fit"><div class="fil"><small>'+l+'</small><b class="'+cl+'">'+v+'</b></div><button type="button" class="'+bc+'" id="'+id+'"'+D+'>'+bt+"</button></div>"}
 box.innerHTML="<h2>Financeiro</h2><div class=\"fin\">"+it("Custos",num(r.desp)?"R$ "+nm2(r.desp):"—","","fcu","fb1","Lançar custos")
  +it("Cachê recebido",stc==="ok"?"✓ Pago":rv>0?"R$ "+nm2(rv)+" de R$ "+nm2(c):"Pendente",stc,"fca","fb2","Cachê recebido")
  +it("Comissão"+(pc>0&&pc<1?" ("+Math.round(pc*100)+"%)":""),(comV(r)?"R$ "+nm2(comV(r))+" · ":"")+(pg?"✓ Paga":"Pendente"),pg?"ok":"pe","fco","fb3"+(pg?" fdn":""),pg?"✓ Comissão paga":"Comissão paga")
  +(w?(pg?'<p class="finh">Comissão paga: custos e cachê ficam bloqueados aqui (edite direto na planilha).</p>':""):'<p class="finh">Disponível quando a gravação for liberada para este artista.</p>')+"</div>";finBind()}
/* detalhe dos custos: a nota da célula DESPESAS não vem na sincronização (IMPORTRANGE não copia notas); lida na hora pelo escrita.gs (op "notas") */
function parseNota(t){var d={},n=0;String(t||"").split("\n").forEach(function(l){var m=/^(.+?):\s*R\$\s*([\d.,]+)\s*$/.exec(l.trim());if(!m)return;CI.forEach(function(c){if(c[1]===m[1].trim()){d[c[0]]=pv(m[2]);n++}})});return n?d:null}
var _cu=custos;custos=function(r){var k=ck();if(CUD[k]||!WS.on||!num(r.desp)){_cu(r);return}toast("Lendo o detalhe dos custos na planilha…");var a=cur.a,n=+cur.p.n;
 WS.send("notas",a,{n:n}).then(function(x){var t=x&&x.ok&&x.r&&x.r.notas&&x.r.notas[String(n)],d=parseNota(t);if(d){CUD[k]={det:d,tot:num(r.desp)};iput("cud",CUD)}if(ck()===k)_cu(cur_())},function(){if(ck()===k)_cu(cur_())})};
var css2=document.createElement("style");css2.textContent='#finp .fin{border:0;margin:0;padding:0}#finp .fit{margin-bottom:12px}#finp .fil{display:flex;justify-content:space-between;align-items:baseline;gap:8px;background:#f6f6f6;border-radius:10px;padding:7px 10px;margin-bottom:6px}#finp .fil small{font-size:12px;color:#666}#finp .fil b{font-size:14px;text-align:right}#finp .fil b.ok{color:#0a8a07}#finp .fil b.pa{color:#b25b00}#finp .fil b.pe{color:#c5221f}#finp .fit button{display:block;width:100%;height:42px;border-radius:21px;border:0;color:#fff;font:700 14px/1 inherit;cursor:pointer}#finp .fb1{background:#FF5B1F;color:#0a0a0a!important}#finp .fb2{background:#0a8a07}#finp .fb3{background:#0000FF}#finp .fdn{background:#e6f4e6;color:#0a8a07!important}#finp .fit button:disabled{background:#e6e6e6!important;color:#999!important;cursor:not-allowed}#finp h2{margin-top:0}'
 +'.fhl{display:block;font-size:11px;color:#888;margin-top:3px;line-height:1.3}#forms input.ro,#forms select:disabled{background:#f3f3f1;color:#555}#forms select{padding:9px 10px;border:1px solid #d9d9d9;border-radius:9px;width:100%;box-sizing:border-box;font:inherit;background:#fff;color:inherit}#forms .er{color:#c5221f;font-size:12px;margin:3px 0 0;font-weight:600}';document.head.appendChild(css2);

;/*RF+NAV*/(function(){var hd=document.querySelector(".hd");if(hd&&!document.getElementById("bkrf")){var r=document.createElement("button");r.type="button";r.id="bkrf";r.className="bklo bkrf";r.title="Atualizar";r.setAttribute("aria-label","Atualizar");
 r.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-14.2 5M4 12a8 8 0 0 1 14.2-5"/><path d="M18.5 3v4.2h-4.2M5.5 21v-4.2h4.2"/></svg>';
 r.onclick=function(){guard(function(){location.reload()})};hd.appendChild(r)}
 var nv=document.getElementById("bknav");if(!nv)return;/* rodapé estático no index.html (igual aos apps); aqui só liga as abas */
 function sync(){var on=document.querySelector(".tabs button.on"),off=!!$("app").hidden;nv.querySelectorAll("button").forEach(function(b){b.disabled=off;b.classList.toggle("on",!off&&!!on&&b.dataset.t===on.dataset.t)})}
 nv.onclick=function(e){var b=e.target.closest("button");if(!b||b.disabled)return;var t=document.querySelector('.tabs button[data-t="'+b.dataset.t+'"]');if(t)t.click();sync();document.body.scrollTo(0,0);scrollTo(0,0)};
 new MutationObserver(sync).observe(document.getElementById("bkw"),{attributes:true,subtree:true,attributeFilter:["class","hidden"]});sync()})();
/* ===== vários horários: uma linha por entrada (início + fim ou duração); 1ª linha = INÍCIO DO SHOW, DURAÇÃO = total;
   2+ linhas: lista vai para a nota da célula INÍCIO DO SHOW e também para a linha "Horários:" das OBSERVAÇÕES (os apps e o Painel leem as observações) ===== */
function mi(t){var m=/^(\d{1,2}):(\d{2})$/.exec(String(t||""));return m?+m[1]*60+ +m[2]:null}
function dm(t){return t==null?"":Math.floor(t/60)+":"+pad(t%60,2)}
function hrsUI(r){var di=$("f_ini"),dd=$("f_dur");if(!di||!dd||$("hrsw"))return;var L0=di.closest("label"),L1=dd.closest("label");
 var g=segsOf(r),rows=g?g.map(function(x){return[hm(x[0]),hm(x[1]),dm(x[1]-x[0])]}):[(function(){var i=hN(r.ini),d=dN(r.dur),a=mi(i),b=mi(d);return[i||"",a!=null&&b!=null?hm(a+b):"",d||""]})()];
 var w=document.createElement("div");w.className="wf hrsw";w.id="hrsw";L0.parentNode.insertBefore(w,L0);L0.hidden=true;L1.hidden=true;
 function draw(){w.innerHTML='<span class="hrt">Horário do show'+(rows.length>1?" ("+rows.length+" entradas)":"")+'</span>'+rows.map(function(x,i){return'<div class="hrr" data-i="'+i+'"><label><small>Início</small><input data-c="0" value="'+esc(x[0])+'" placeholder="HH:MM"></label><label><small>Fim</small><input data-c="1" value="'+esc(x[1])+'" placeholder="HH:MM"></label><label><small>Duração</small><input data-c="2" value="'+esc(x[2])+'" placeholder="H:MM"></label><button type="button" class="hrx" title="Remover horário" aria-label="Remover horário"'+(rows.length<2?" disabled":"")+'>×</button></div>'}).join("")+'<div class="hrb"><button type="button" class="hra">+ Adicionar horário</button><small class="fhl">'+(rows.length>1?"Início do show = 1º horário; Duração = soma ("+tot()+"). Os horários ficam na nota de INÍCIO DO SHOW e na linha Horários: das observações.":"HH:MM · madrugada (00:00–05:59) conta como a noite da data do show")+'</small></div>';
  w.querySelectorAll(".hrr input").forEach(function(inp){inp.addEventListener("change",function(){var i=+inp.closest(".hrr").dataset.i,c=+inp.dataset.c,x=rows[i],v=c===2?dN(inp.value):hN(inp.value);
   if(v===null){inp.style.borderColor="#c5221f";toast(c===2?"Duração: use H:MM":"Use HH:MM");return}x[c]=v;var a=mi(x[0]);
   var du=function(t){var e=/^(\d+):(\d\d)$/.exec(t||"");return e?+e[1]*60+ +e[2]:null};
   if(a!=null){if(c===2){if(du(x[2])!=null)x[1]=hm(a+du(x[2]))}else if(mi(x[1])!=null)x[2]=dm(((mi(x[1])-a)%1440+1440)%1440||1440);else if(du(x[2])!=null)x[1]=hm(a+du(x[2]))}
   commit();draw()})});
  w.querySelectorAll(".hrx").forEach(function(b){b.onclick=function(){rows.splice(+b.closest(".hrr").dataset.i,1);commit();draw()}});
  w.querySelector(".hra").onclick=function(){var l=rows[rows.length-1],f=mi(l[1]);rows.push([f!=null?hm(f+60):"","",""]);draw();var q=w.querySelectorAll(".hrr");q[q.length-1].querySelector("input").focus()}}
 function segs(){var ok=rows.filter(function(x){return mi(x[0])!=null&&mi(x[1])!=null});return ok.length?parseH(ok.map(function(x){return x[0]+" às "+x[1]}).join(" e ")):[]}
 function tot(){var g=segs();return g.length?sumDur(g):""}
 function commit(){var g=segs(),o=String(cur_().obs||""),x=rows[0];
  if(rows.length>1&&g.length>=2){var tx=fmtSegs(g),s0=hm(g[0][0]).replace(/^0(\d)/,"$1");setVal("ini",s0);setVal("dur",sumDur(g));setVal("hn","Horários: "+tx);setObs(HRE.test(o)?o.replace(HRE,"Horários: "+tx+"\n").trim():(o?o+"\n":"")+"Horários: "+tx)}
  else{setVal("ini",String(x[0]||"").replace(/^0(\d)/,"$1"));setVal("dur",x[2]||"");if(cur_().hn)setVal("hn","");var o2=o.replace(HRE,"").trim();if(o2!==o)setObs(o2)}
  var r2=cur_();di.value=r2.ini||"";dd.value=r2.dur||"";bar();try{renderSum();renderAll()}catch(e){}}
 draw()}
/* ===== dados ao vivo: ao abrir uma proposta, lê a linha na planilha (escrita "ler") e mostra por cima do sincronizado ===== */
var LIVE={},LT=Object.assign({},FM,{rec:"CACHÊ RECEBIDO?",recpor:"RECEBIDO POR",drec:"DATA RECEBIMENTO",scom:"STATUS COMISSÃO",liq:"CACHÊ LÍQUIDO"});delete LT.hn;
var LAL={"INÍCIO DO SHOW":["INÍCIO DO SET"],"DURAÇÃO":["DURAÇÃO TOTAL"],"RIDER HOSPITALIDADE":["RIDER CAMARIM"]},LTM={hi:1,hf:1,ini:1,dur:1};
function nhc(t){return String(t==null?"":t).replace(/\(.*?\)/g," ").replace(/\s+/g," ").trim().toUpperCase()}
function lidx(T,t){var m=/^(.*?)>(\d+)$/.exec(t),b=nhc(m?m[1]:t),c=[b].concat((LAL[b]||[]).map(nhc));for(var j=0;j<c.length;j++){var i=T.indexOf(m?c[j]+">1":c[j]);if(i>=0)return i}return -1}
function live(){if(!cur||!WS.on||!WS.send)return;var k=ck(),a=cur.a,p=cur.p,n=+p.n,t0=Date.now();LIVE[k]={s:"ld",m:"lendo a planilha…"};bar();
 WS.send("ler",a,{n:n}).then(function(x){if(!x||!x.ok||!x.r)throw x;var r=x.r,T=r.cols,row=null,disp=null;
  if(r.n){row=r.rows[0];disp=r.disp&&r.disp[0]}else{var iN=T.indexOf("Nº");(r.rows||[]).forEach(function(z){if(String(+z[iN])===String(n))row=z})}
  if(!row)throw{err:"proposta não encontrada na planilha"};
  var o=OV[k]||{},sv0=SAVED[k]||{},ch=0;
  Object.keys(LT).forEach(function(f){var i=lidx(T,LT[f]);if(i<0)return;var v=LTM[f]&&disp?disp[i]:row[i];if(LTM[f]&&/^1899-/.test(String(v)))return;if(v===""||v===undefined)v=null;
   if(f in o&&JSON.stringify(o[f])!==JSON.stringify(sv0[f]))return;/* editado e não salvo: mantém o da tela */
   var old=p[f]==null?null:p[f];if(String(old)!==String(v)){if(v===null)delete p[f];else p[f]=v;ch++}if(f in o){delete o[f];delete sv0[f]}if(WSV[k])delete WSV[k].h[f]});
  var N=r.notas||{},hn=N["INÍCIO DO SHOW"]||N["INÍCIO DO SET"]||"";if(r.notas&&!("hn" in o&&o.hn!==sv0.hn)){if((p.hn||"")!==hn){if(hn)p.hn=hn;else delete p.hn;ch++}delete o.hn;delete sv0.hn}
  var nd=N["DESPESAS"];if(nd){var d=parseNota(nd);if(d){CUD[k]={det:d,tot:num(p.desp)};iput("cud",CUD)}}
  iput("ws",WSV);iput("ov",SAVED);var h=new Date();LIVE[k]={s:"ok",m:"✓ conferido na planilha às "+pad(h.getHours(),2)+":"+pad(h.getMinutes(),2)+(ch?" ("+ch+" campo"+(ch>1?"s":"")+" atualizado"+(ch>1?"s":"")+")":"")};
  if(ck()===k){if(ch){buildForms();buildOpts();renderSum();renderAll();simil();calcInit()}bar()}},
 function(e){LIVE[k]={s:"er",m:"não consegui ler a planilha agora; mostrando a última sincronização"+(e&&e.err?" ("+e.err+")":"")};if(ck()===k)bar()})}
var css3=document.createElement("style");css3.textContent='.dvlv{font-size:11px;border-radius:6px;padding:2px 8px;font-weight:600;background:#eef0ff;color:#0000b3}.dvlv.ok{background:#e6f4ea;color:#0a6b2a}.dvlv.er{background:#fce8e6;color:#b3261e}'
 +'.hrsw{display:block}.hrt{display:block;font-size:12px;color:var(--mu);margin-bottom:4px}.hrr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) 36px;gap:6px;align-items:end;margin-bottom:6px}.hrr label{display:block;min-width:0}.hrr small{display:block;font-size:11px;color:#888;margin-bottom:1px}.hrr input{width:100%}.hrx{height:34px;padding:0;font-size:18px;line-height:1;color:#c5221f}.hrx:disabled{color:#bbb;cursor:default}.hrb{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.hra{border:1px dashed #FF5B1F!important;color:#a33a00;background:#FFF2EC!important;font-weight:600}';document.head.appendChild(css3);
})();
