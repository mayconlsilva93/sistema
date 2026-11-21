/* DROM · ESCRITA nas planilhas "Gestão e Propostas" (um único projeto do Apps Script, conta contato@dromentretenimento.com)
   Implantar como "App da Web": Executar como EU, acesso "Qualquer pessoa". Propriedade do script: KEY (ver docs/INTEGRACAO.md).
   Segurança: cada app assina o pedido com HMAC-SHA256 usando a chave do app = HMAC-SHA256("app:"+nome, KEY).
   Cada app só escreve nas planilhas da sua lista (APPS). Pedidos com mais de 15 min, assinatura errada ou app/planilha fora da lista são recusados.
   Colunas sempre pelo TÍTULO da linha 4 (nunca pela posição); linhas pelo Nº. Coluna que falta = recusa com erro.
   Respostas em JSON. O navegador lê a resposta do POST (text/plain, sem preflight); se não conseguir ler, consulta GET ?st=<id>. */

var TAB='PROPOSTAS', HDR=4, DADOS=5, COL_TS=54 /* BB */, TZ='America/Sao_Paulo';
var TESTE='1_FIaPSZjz7rr1QwDvC7jL6qCXu09Wh1ZsgTTdearxGs';   /* ARTISTATESTE - Gestão e Propostas (dados falsos) */

/* app -> artistas (nome -> id da planilha) e operações permitidas. Para liberar um artista real, acrescente-o aqui (ver docs/INTEGRACAO.md). */
var APPS={
  artistateste:{planilhas:{'Artista Teste':TESTE}, ops:['custos','cache'], recebidoPor:'Artista'},
  booker:      {planilhas:{'Artista Teste':TESTE}, ops:['criar','editar','ler','custos','cache','comissao'], recebidoPor:'Artista'}
};
/* planilhas que recebem o carimbo de edição (gatilho onEdit instalado por installTriggers) */
var CARIMBO=[TESTE];

/* ---------------- utilidades ---------------- */
function out(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function nh(s){return String(s==null?'':s).replace(/\(.*?\)/g,' ').replace(/\s+/g,' ').trim().toUpperCase()}
function hex(b){return b.map(function(x){return ('0'+(x&255).toString(16)).slice(-2)}).join('')}
function bytes(s){return Utilities.newBlob(String(s)).getBytes()}
function appKey(app){var K=PropertiesService.getScriptProperties().getProperty('KEY');if(!K)throw new Error('KEY não configurada nas propriedades do script');
  return Utilities.computeHmacSha256Signature(bytes('app:'+app),bytes(K))}
function same(a,b){if(a.length!==b.length)return false;var r=0;for(var i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0}
function brl(v){var n=Math.round((+v||0)*100)/100,s=n.toFixed(2).split('.');return 'R$ '+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.')+','+s[1]}
function agora(){return Utilities.formatDate(new Date(),TZ,'dd/MM/yyyy HH:mm')}
function dmy(t){var m=/^(\d\d)\/(\d\d)\/(\d{4})$/.exec(String(t||''));if(!m)throw new Error('data inválida: '+t);return new Date(+m[3],m[2]-1,+m[1],12)}
function txt(v){return v instanceof Date?Utilities.formatDate(v,TZ,'dd/MM/yyyy'):String(v==null?'':v).trim()}
function val(v){if(typeof v==='string'){var m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(v);if(m)return new Date(+m[1],m[2]-1,+m[3],12)}return v==null?'':v}

/* verificação: envelope {app, p:"<json>", sig:"<hex>"} */
function verify(env){
  if(!env||!env.app||typeof env.p!=='string'||!env.sig)throw new Error('pedido incompleto');
  var A=APPS[env.app];if(!A)throw new Error('app não autorizado: '+env.app);
  if(!same(hex(Utilities.computeHmacSha256Signature(bytes(env.p),appKey(env.app))),String(env.sig).toLowerCase()))throw new Error('assinatura inválida');
  var p=JSON.parse(env.p);
  if(!p.ts||Math.abs(Date.now()-p.ts)>15*60e3)throw new Error('pedido expirado (confira o relógio do aparelho)');
  if(!p.id||!/^[A-Za-z0-9_-]{8,64}$/.test(p.id))throw new Error('id inválido');
  if(A.ops.indexOf(p.op)<0)throw new Error('operação não permitida para '+env.app+': '+p.op);
  var sid=A.planilhas[p.a];if(!sid)throw new Error('artista não liberado para '+env.app+': '+p.a);
  return {A:A,p:p,sid:sid,app:env.app}}

/* planilha: cabeçalhos da linha 4. "TÍTULO>1" = coluna logo à direita de TÍTULO, só se ela não tiver título (ex.: fim do horário, telefone). */
function Sheet(sid){
  var sh=SpreadsheetApp.openById(sid).getSheetByName(TAB);if(!sh)throw new Error('aba '+TAB+' não encontrada');
  var lc=Math.max(sh.getLastColumn(),COL_TS),H=sh.getRange(HDR,1,1,lc).getValues()[0].map(nh);
  function col(t){var m=/^(.*?)>(\d+)$/.exec(t),b=nh(m?m[1]:t),i=H.indexOf(b);if(i<0)throw new Error('coluna não encontrada: '+t);
    if(m){var j=i+ +m[2];if(H[j])throw new Error('coluna à direita de '+b+' tem título ('+H[j]+'), esperado vazio');return j+1}return i+1}
  var cN=col('Nº');
  function nums(){var n=sh.getLastRow()-DADOS+1;return n>0?sh.getRange(DADOS,cN,n,1).getValues().map(function(r){return r[0]}):[]}
  function row(n){var L=nums();for(var i=0;i<L.length;i++)if(L[i]!==''&&String(+L[i])===String(+n))return DADOS+i;throw new Error('proposta Nº '+n+' não encontrada')}
  var ts=(function(){for(var i=0;i<H.length;i++)if(/ATUALIZ|ÚLTIMA EDI|ULTIMA EDI|TIMESTAMP|CARIMBO|MODIFICA/.test(H[i]))return i+1;return COL_TS})();
  return {sh:sh,H:H,col:col,row:row,nums:nums,cN:cN,
    get:function(r,t){return sh.getRange(r,col(t)).getValue()},
    stamp:function(r){sh.getRange(r,ts).setValue(new Date())}}}

/* ---------------- operações ---------------- */
function opCustos(S,p){
  var r=S.row(p.n),cD=S.col('DESPESAS');
  if(nh(S.get(r,'STATUS COMISSÃO'))==='PAGO')throw new Error('comissão já paga: custos bloqueados no app (edite direto na planilha)');
  var L=[];Object.keys(p.det||{}).forEach(function(k){var v=+p.det[k];if(v>0)L.push(String(k).slice(0,60)+': '+brl(v))});
  L.push('Lançado pelo app em '+agora());
  var c=S.sh.getRange(r,cD);c.setValue(Math.round((+p.tot||0)*100)/100);c.setNote(L.join('\n'));S.stamp(r);
  return {n:+p.n,despesas:+p.tot||0}}

function opCache(S,p,A){
  var r=S.row(p.n),v=+p.v,d=dmy(p.d),cR=S.col('CACHÊ RECEBIDO?'),cA=S.col('STATUS ARTISTA'),cP=S.col('RECEBIDO POR'),cD=S.col('DATA RECEBIMENTO');
  if(!(v>0))throw new Error('valor inválido');
  var sh=S.sh,quem=(p.por==='Artista'||p.por==='DROM')?p.por:(A.recebidoPor||p.a),tipo=p.tipo;   /* booker pode informar quem recebeu (Artista ou DROM) */
  if(tipo==='total'||tipo==='s30'||tipo==='s50'){
    var st=tipo==='total'?'Pago':tipo==='s30'?'Entrada 30%':'Entrada 50%';
    sh.getRange(r,cR).setValue(st);sh.getRange(r,cA).setValue(st);sh.getRange(r,cP).setValue(quem);sh.getRange(r,cD).setValue(d)}
  else{ /* outro valor (ou restante): só RECEBIDO POR e DATA RECEBIMENTO "DD/MM/AAAA (R$ 0,00)", somando às entradas existentes */
    var old=txt(sh.getRange(r,cD).getValue()),nv=p.d+' ('+brl(v)+')';
    sh.getRange(r,cD).setNumberFormat('@').setValue(old?old+', '+nv:nv);sh.getRange(r,cP).setValue(quem);tipo='parcial';
    /* 100% pago: soma parcelas "(R$ x)" + entrada já marcada; se cobrir o cachê bruto, vira Pago */
    var br=+S.get(r,'CACHÊ BRUTO')||0,st0=nh(S.get(r,'CACHÊ RECEBIDO?')),pg=0,m,re=/\(R\$\s*([\d.,]+)\)/g,all=old?old+', '+nv:nv;
    while((m=re.exec(all)))pg+=parseFloat(m[1].replace(/\./g,'').replace(',','.'))||0;
    if(!/\(R\$/.test(old)){var pc=/ENTRADA (\d+)%/.exec(st0);if(pc&&old)pg+=br*(+pc[1])/100}
    if(br>0&&pg>=br-0.01){sh.getRange(r,cR).setValue('Pago');sh.getRange(r,cA).setValue('Pago');tipo='quitado'}}
  S.stamp(r);return {n:+p.n,tipo:tipo}}

function opComissao(S,p){   /* booker: comissão paga -> STATUS COMISSÃO = "Pago" */
  var r=S.row(p.n),c=S.sh.getRange(r,S.col('STATUS COMISSÃO'));
  if(c.getFormula())throw new Error('STATUS COMISSÃO tem fórmula nesta linha (edite direto na planilha)');
  if(nh(c.getValue())==='PAGO')return {n:+p.n,ja:1};
  c.setValue('Pago');S.stamp(r);return {n:+p.n,scom:'Pago'}}

function opEditar(S,p){
  var r=S.row(p.n),h=p.h||{},ks=Object.keys(h);if(!ks.length)throw new Error('nada para gravar');
  var C=ks.map(function(t){if(nh(t)==='Nº')throw new Error('Nº não pode ser alterado');return S.col(t)}),ign=[],n=0;   /* tudo verificado antes de gravar */
  ks.forEach(function(t,i){var c=S.sh.getRange(r,C[i]);if(c.getFormula()){ign.push(t);return}c.setValue(val(h[t]));n++});   /* célula com fórmula nunca é sobrescrita */
  S.stamp(r);return {n:+p.n,campos:n,ign:ign}}

function opCriar(S,p){
  var h=p.h||{},ks=Object.keys(h),C=ks.map(function(t){if(nh(t)==='Nº')throw new Error('Nº é automático');return S.col(t)});
  var L=S.nums(),last=DADOS-1,mx=0;L.forEach(function(x,i){if(x!==''&&!isNaN(+x)){last=DADOS+i;mx=Math.max(mx,+x)}});
  var sh=S.sh,r=last+1,lc=sh.getLastColumn(),n=mx+1;
  if(last>=DADOS){var src=sh.getRange(last,1,1,lc),F=src.getFormulas()[0];
    src.copyTo(sh.getRange(r,1,1,lc));   /* formatação, validações e fórmulas da linha anterior */
    F.forEach(function(f,i){if(!f)sh.getRange(r,i+1).clearContent().clearNote()})}
  sh.getRange(r,S.cN).setValue(n);
  var ign=[];ks.forEach(function(t,i){var c=sh.getRange(r,C[i]);if(c.getFormula()){ign.push(t);return}c.setValue(val(h[t]))});
  S.stamp(r);return {n:n,linha:r,ign:ign}}

function opLer(S){
  var sh=S.sh,n=sh.getLastRow()-DADOS+1,V=n>0?sh.getRange(DADOS,1,n,S.H.length).getValues():[],raw=sh.getRange(HDR,1,1,S.H.length).getValues()[0];
  var T=raw.map(function(t,i){return t?nh(t):(i&&raw[i-1]?nh(raw[i-1])+'>1':'')});
  return {cols:T,rows:V.filter(function(r){return r[S.cN-1]!==''}).map(function(r){return r.map(function(x){return x instanceof Date?Utilities.formatDate(x,TZ,'yyyy-MM-dd'):x})})}}

function run(env){
  var v=verify(env),p=v.p,C=CacheService.getScriptCache(),ck='r:'+p.id,old=C.get(ck);
  if(old)return JSON.parse(old);   /* mesmo id = repetição: devolve o resultado anterior, não grava de novo */
  var res;
  if(p.op==='ler'){res={ok:1,id:p.id,r:opLer(Sheet(v.sid))};return res}
  var lk=LockService.getScriptLock();if(!lk.tryLock(25000))throw new Error('planilha ocupada, tente de novo');
  try{old=C.get(ck);if(old)return JSON.parse(old);
    var S=Sheet(v.sid),r=p.op==='custos'?opCustos(S,p):p.op==='cache'?opCache(S,p,v.A):p.op==='comissao'?opComissao(S,p):p.op==='editar'?opEditar(S,p):opCriar(S,p);
    SpreadsheetApp.flush();res={ok:1,id:p.id,op:p.op,r:r,em:agora()}}
  finally{lk.releaseLock()}
  C.put(ck,JSON.stringify(res),21600);return res}

function doPost(e){var id='';
  try{var env=JSON.parse(e.postData.contents);try{id=JSON.parse(env.p).id||''}catch(x){}return out(run(env))}
  catch(er){var r={ok:0,id:id,err:String(er&&er.message||er)};
    try{if(/^[A-Za-z0-9_-]{8,64}$/.test(id)&&!/assinatura|não autorizado/.test(r.err))CacheService.getScriptCache().put('r:'+id,JSON.stringify(r),21600)}catch(x){}
    return out(r)}}

/* GET ?st=<id>  -> resultado de um pedido já enviado (para o app conferir quando não conseguiu ler a resposta do POST)
   GET ?app=..&p=..&sig=..  -> mesmo envelope assinado do POST (útil para "ler") */
function doGet(e){var q=(e&&e.parameter)||{};
  try{if(q.st){if(!/^[A-Za-z0-9_-]{8,64}$/.test(q.st))return out({ok:0,err:'id'});var c=CacheService.getScriptCache().get('r:'+q.st);return out(c?JSON.parse(c):{ok:0,pend:1,id:q.st})}
    if(q.app)return out(run({app:q.app,p:q.p,sig:q.sig}));
    return out({ok:1,svc:'drom-escrita'})}
  catch(er){return out({ok:0,err:String(er&&er.message||er)})}}

/* ---------------- carimbo de edição (substitui os scripts de carimbo de cada planilha) ---------------- */
function installTriggers(){
  ScriptApp.getProjectTriggers().forEach(function(t){if(t.getHandlerFunction()==='carimbo')ScriptApp.deleteTrigger(t)});
  CARIMBO.forEach(function(id){ScriptApp.newTrigger('carimbo').forSpreadsheet(id).onEdit().create()});
  Logger.log('gatilhos instalados: '+CARIMBO.length)}
function carimbo(e){try{
  var g=e.range,sh=g.getSheet();if(sh.getName()!==TAB)return;
  var r0=Math.max(g.getRow(),DADOS),r1=g.getLastRow();if(r1<r0)return;
  if(g.getColumn()===COL_TS&&g.getLastColumn()===COL_TS)return;   /* edição no próprio BB: ignora */
  var d=new Date(),v=[];for(var r=r0;r<=r1;r++)v.push([d]);sh.getRange(r0,COL_TS,v.length,1).setValues(v)}catch(x){}}

/* rode pelo editor (▶ autorizar) uma vez: pede as permissões de planilha */
function autorizar(){Logger.log(SpreadsheetApp.openById(TESTE).getName())}
