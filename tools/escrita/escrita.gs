/* DROM · ESCRITA nas planilhas "Gestão e Propostas" (um único projeto do Apps Script, conta contato@dromentretenimento.com)
   Implantar como "App da Web": Executar como EU, acesso "Qualquer pessoa". Propriedades do script: KEY (ver docs/INTEGRACAO.md); opcionais AUTO_REALIZADO=1, AUTO_DESCARTE=1 e AUTO_CONTRATO=1 (rotina de hora em hora; ver docs/IMPLANTACAO.md).
   Segurança: cada app assina o pedido com HMAC-SHA256 usando a chave do app = HMAC-SHA256("app:"+nome, KEY).
   Cada app só escreve nas planilhas da sua lista (APPS). Pedidos com mais de 15 min, assinatura errada ou app/planilha fora da lista são recusados.
   Colunas sempre pelo TÍTULO da linha 4 (nunca pela posição); linhas pelo Nº. Coluna que falta = recusa com erro.
   Respostas em JSON. O navegador lê a resposta do POST (text/plain, sem preflight); se não conseguir ler, consulta GET ?st=<id>. */

var TAB='PROPOSTAS', HDR=4, DADOS=5, COL_TS=54 /* BB */, TZ='America/Sao_Paulo';
var TESTE='1_FIaPSZjz7rr1QwDvC7jL6qCXu09Wh1ZsgTTdearxGs';   /* ARTISTATESTE - Gestão e Propostas (dados falsos) */

/* planilhas "Gestão e Propostas" dos artistas (ids = tools/drive/drive.gs CADS; todas do contato@). rp = o que a planilha usa em RECEBIDO POR */
var ARTS={
  'Ramonstro':  {app:'ramonstro003',  id:'1mwK96YV00hJhxkakXmm05kD-9G70gt_MbrsT6-C0aME', rp:'Ramonstro'},
  'Carloto':    {app:'carloto453',    id:'1WFNLEj2kj-DG5AJh1KmXC1HKcmqT9Ng4uTgp_tzKXic', rp:'Carloto'},
  'Sena':       {app:'sena089',       id:'1aQHCJ3x0zQyM3HXH8dixSxzonzqmIncYKpCeZcPIHBA', rp:'Sena'},
  'Cenoura':    {app:'cenoura173',    id:'1nQ-VVeVJ7Wo-p90uaq_cCy8FKBn-tMIilykq6sws8sQ', rp:'Cenoura'},
  'Maneira':    {app:'maneira038',    id:'1Uy_FTxYsXYIXWKChkJR2gK5LcodeOqbmBfqegBwyATU', rp:'Maneira'},
  'Amaro':      {app:'amaro095',      id:'1jHL-RMG7X0cw34VwBt851ghvRaIoLBSZtv6PwCdEask', rp:'Amaro'},
  'Josu':       {app:'josu185',       id:'1nUbvXrtmzbRb5Ud-DlyfWW6atBGaJfzUaRtBG5a23Oo', rp:'Josu'},
  'Cadu Vieira':{app:'caduvieira089', id:'1s109Zq58asQUZ_dr8rzZNen1Og-ER7AeaP6EzPXdUPU', rp:'Cadu'},
  'Brinquinho': {app:'brinquinho131', id:'1BOOFB3GzJh3KdF8-OL9LQklnR94WjSSOpRtcMf-BvIg', rp:'Brinquinho'},
  'Liquinho':   {app:'liquinho000',   id:'1WaHGhR66OIgVLS762ghUWC3XuEShRbRMUpEGCek1zF8', rp:'Liquinho'}
};
/* app -> planilhas (nome -> id) e operações. Cada app de artista só escreve na própria planilha; o Booker em todas + teste. */
var APPS=(function(){
  var A={artistateste:{planilhas:{'Artista Teste':TESTE}, ops:['custos','cache'], recebidoPor:'Artista'}},
      B={planilhas:{'Artista Teste':TESTE}, ops:['criar','editar','ler','notas','custos','cache','comissao'], rp:{'Artista Teste':'Artista'}};
  Object.keys(ARTS).forEach(function(n){var x=ARTS[n];
    A[x.app]={planilhas:{}, ops:['custos','cache'], recebidoPor:x.rp};A[x.app].planilhas[n]=x.id;
    B.planilhas[n]=x.id;B.rp[n]=x.rp});
  A.booker=B;return A})();
/* planilhas que recebem o carimbo de edição na coluna BB (gatilho onEdit instalado por installTriggers): as 10 + teste */
var CARIMBO=Object.keys(ARTS).map(function(n){return ARTS[n].id}).concat([TESTE]);
/* títulos alternativos (a planilha do Cadu tem colunas extras e nomes diferentes; a do Liquinho usa RIDER CAMARIM) */
var ALIAS={'INÍCIO DO SHOW':['INÍCIO DO SET'],'DURAÇÃO':['DURAÇÃO TOTAL'],'RIDER HOSPITALIDADE':['RIDER CAMARIM']};

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
  if(p.op!=='ping'&&A.ops.indexOf(p.op)<0)throw new Error('operação não permitida para '+env.app+': '+p.op);
  var sid=A.planilhas[p.a];if(p.op==='ping'&&sid)return {A:A,p:p,sid:sid,app:env.app};if(!sid)throw new Error('artista não liberado para '+env.app+': '+p.a);
  return {A:A,p:p,sid:sid,app:env.app}}

/* planilha: cabeçalhos da linha 4. "TÍTULO>1" = coluna logo à direita de TÍTULO, só se ela não tiver título (ex.: fim do horário, telefone). */
function Sheet(sid){
  var sh=SpreadsheetApp.openById(sid).getSheetByName(TAB);if(!sh)throw new Error('aba '+TAB+' não encontrada');
  var lc=Math.max(sh.getLastColumn(),COL_TS),H=sh.getRange(HDR,1,1,lc).getValues()[0].map(nh);
  function idx(b){var i=H.indexOf(b);(ALIAS[b]||[]).forEach(function(x){if(i<0)i=H.indexOf(nh(x))});return i}
  function col(t){var m=/^(.*?)>(\d+)$/.exec(t),b=nh(m?m[1]:t),i=idx(b);if(i<0)throw new Error('coluna não encontrada: '+t);
    if(m){var j=i+ +m[2];if(H[j])throw new Error('coluna à direita de '+b+' tem título ('+H[j]+'), esperado vazio');return j+1}return i+1}
  var cN=col('Nº');
  function nums(){var n=sh.getLastRow()-DADOS+1;return n>0?sh.getRange(DADOS,cN,n,1).getValues().map(function(r){return r[0]}):[]}
  function row(n){var L=nums();for(var i=0;i<L.length;i++)if(L[i]!==''&&String(+L[i])===String(+n))return DADOS+i;throw new Error('proposta Nº '+n+' não encontrada')}
  var ts=COL_TS;   /* carimbo sempre na coluna 54 (BB), por posição: a planilha do Cadu não tem título ali */
  function has(t){try{col(t);return true}catch(e){return false}}
  return {sh:sh,H:H,col:col,has:has,row:row,nums:nums,cN:cN,
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
  var sh=S.sh,quem=(A.rp&&A.rp[p.a])||A.recebidoPor||p.a,tipo=p.tipo;   /* o que a planilha usa em RECEBIDO POR */
  dupCache(S,r,p,v);   /* recusa pagamento já registrado (mesmo cachê marcado duas vezes) */
  if(p.extra)tipo='outro';   /* pagamento extra (acima do cachê ou com cachê já Pago): nova linha "(extra)" em DATA RECEBIMENTO, sem mexer nos status */
  if(tipo==='total'||tipo==='s30'||tipo==='s50'){
    var st=tipo==='total'?'Pago':tipo==='s30'?'Entrada 30%':'Entrada 50%';
    sh.getRange(r,cR).setValue(st);sh.getRange(r,cA).setValue(st);sh.getRange(r,cP).setValue(quem);sh.getRange(r,cD).setValue(d)}
  else{ /* outro valor (ou restante): só RECEBIDO POR e DATA RECEBIMENTO, uma parcela por linha "DD/MM/AAAA - R$ 0,00", somando às entradas existentes */
    var old=txt(sh.getRange(r,cD).getValue()).trim(),br=+S.get(r,'CACHÊ BRUTO')||0,st0=nh(S.get(r,'CACHÊ RECEBIDO?')),pc=/ENTRADA (\d+)%/.exec(st0);
    if(old&&!/R\$/.test(old)&&pc)old=old.split(/[\r\n]+/)[0]+' - '+brl(br*(+pc[1])/100);   /* sinal só com data: vira linha com valor */
    else if(old&&!/R\$/.test(old)&&st0==='PAGO'&&br>0)old=old.split(/[\r\n]+/)[0]+' - '+brl(br);   /* Pago só com data: vira linha com o cachê (antes do extra) */
    old=old.replace(/(\d{1,2}\/\d{1,2}\/\d{2,4})\s*\((R\$[^)]*)\)\s*,?\s*/g,'$1 - $2\n').trim();   /* converte o formato antigo do app */
    var ln=parcLine(p.d,v)+(p.extra?' (extra)':''),all=old?old+'\n'+ln:ln;
    sh.getRange(r,cD).setNumberFormat('@').setValue(all);sh.getRange(r,cP).setValue(quem);tipo='parcial';
    var pg=parcSum(all);
    if(br>0&&pg>=br-0.01&&st0!=='PAGO'){sh.getRange(r,cR).setValue('Pago');sh.getRange(r,cA).setValue('Pago');tipo='quitado'}}
  S.stamp(r);return {n:+p.n,tipo:tipo}}

/* repetido=1: mesma data + valor já lançados, confirmado no app (registra outra linha) · extra=1: pagamento além do cachê ou com Pago (linha "(extra)") */
/* duplicidade: total com Pago; sinal com Entrada já marcada; parcial repetida (mesma data + valor) ou acima do cachê bruto (liberado com p.acima=1, após confirmação no app) */
/* parcelas em DATA RECEBIMENTO: uma por linha "dd/mm/aaaa - R$ 0,00" (padrão da planilha); lê também o formato antigo "dd/mm/aaaa (R$ x)" */
function parcSum(s){var pg=0,m,re=/R\$\s*([\d.]*\d(?:,\d{1,2})?)/g;while((m=re.exec(s)))pg+=parseFloat(m[1].replace(/\./g,'').replace(',','.'))||0;return pg}
function parcLine(d,v){return d+' - '+brl(v)}
function dupCache(S,r,p,v){var st=nh(S.get(r,'CACHÊ RECEBIDO?')),br=+S.get(r,'CACHÊ BRUTO')||0,old=txt(S.sh.getRange(r,S.col('DATA RECEBIMENTO')).getValue());
  if(st==='PAGO'&&!p.extra)throw new Error('Cachê já está como "Pago" na planilha: nada a registrar (pagamento extra: confirme no app)');
  if(p.extra)p.tipo='outro';
  if(p.tipo==='total')return;
  if(p.tipo==='s30'||p.tipo==='s50'){if(/^ENTRADA/.test(st))throw new Error('Sinal já registrado na planilha ('+S.get(r,'CACHÊ RECEBIDO?')+'). Para outra parcela use "Outro"');return}
  var nv=parcLine(p.d,v);if(!p.repetido&&(old.indexOf(nv)>=0||old.indexOf(p.d+' ('+brl(v)+')')>=0))throw new Error('Recebimento de '+brl(v)+' em '+p.d+' já está lançado na planilha');
  var pg=parcSum(old),pc=/ENTRADA (\d+)%/.exec(st);if(pc&&!/R\$/.test(old))pg+=br*(+pc[1])/100;
  if(br>0&&pg+v>br+0.01&&!(p.acima||p.extra||p.force))throw new Error('Valor acima do cachê: já recebido '+brl(pg)+' de '+brl(br)+'; restante '+brl(Math.max(0,br-pg)))}

function opComissao(S,p){   /* booker: comissão paga -> STATUS COMISSÃO = "Pago" */
  var r=S.row(p.n),c=S.sh.getRange(r,S.col('STATUS COMISSÃO'));
  if(c.getFormula())throw new Error('STATUS COMISSÃO tem fórmula nesta linha (edite direto na planilha)');
  if(nh(c.getValue())==='PAGO')return {n:+p.n,ja:1};
  c.setValue('Pago');S.stamp(r);return {n:+p.n,scom:'Pago'}}

/* show confirmado: CACHÊ RECEBIDO?, STATUS ARTISTA e STATUS COMISSÃO vazios viram Pendente; comissão 0 = Pago */
function confPend(S,r,h){var st=Object.keys(h).filter(function(t){return nh(t)==='STATUS'})[0];if(!st||nh(h[st])!=='SHOW CONFIRMADO')return;
  [['CACHÊ RECEBIDO?','Pendente'],['STATUS ARTISTA','Pendente'],['STATUS COMISSÃO',null]].forEach(function(x){if(!S.has(x[0]))return;var c=S.sh.getRange(r,S.col(x[0]));if(c.getFormula()||String(c.getDisplayValue()).trim())return;
    var v=x[1];if(v===null){var cm=S.has('COMISSÃO')?parseFloat(String(S.sh.getRange(r,S.col('COMISSÃO')).getValue()).replace(/[^\d,.-]/g,'').replace(/\.(?=\d{3})/g,'').replace(',','.'))||0:0;v=cm===0?'Pago':'Pendente'}put(c,v)})}
function opEditar(S,p){
  var r=S.row(p.n),h=p.h||{},ks=Object.keys(h);if(!ks.length)throw new Error('nada para gravar');
  ks.forEach(function(t){if(nh(t)==='Nº')throw new Error('Nº não pode ser alterado')});
  var nk=ks.filter(isNota);ks=ks.filter(function(t){return !isNota(t)});
  var ign=ks.filter(function(t){return !S.has(t)});ks=ks.filter(function(t){return S.has(t)});   /* coluna que esta planilha não tem: ignorada e avisada */
  var C=ks.map(function(t){return S.col(t)}),n=0;   /* tudo verificado antes de gravar */
  n+=notas(S,r,h,nk,ign);
  ks.forEach(function(t,i){var c=S.sh.getRange(r,C[i]);if(c.getFormula()){ign.push(t);return}c.setValue(val(h[t]));n++});   /* célula com fórmula nunca é sobrescrita */
  confPend(S,r,h);S.stamp(r);return {n:+p.n,campos:n,ign:ign}}

function opCriar(S,p){
  var h=p.h||{},ks=Object.keys(h);ks.forEach(function(t){if(nh(t)==='Nº')throw new Error('Nº é automático')});
  var nk=ks.filter(isNota);ks=ks.filter(function(t){return !isNota(t)});
  var fal=ks.filter(function(t){return !S.has(t)});ks=ks.filter(function(t){return S.has(t)});var C=ks.map(function(t){return S.col(t)});
  var L=S.nums(),last=DADOS-1,mx=0;L.forEach(function(x,i){if(x!==''&&!isNaN(+x)){last=DADOS+i;mx=Math.max(mx,+x)}});
  var sh=S.sh,r=last+1,lc=sh.getLastColumn(),n=mx+1;
  if(r>sh.getMaxRows())sh.insertRowsAfter(sh.getMaxRows(),Math.max(20,r-sh.getMaxRows()));   /* planilha sem linhas livres: cria mais */
  if(last>=DADOS){var src=sh.getRange(last,1,1,lc),F=src.getFormulas()[0];
    src.copyTo(sh.getRange(r,1,1,lc));   /* formatação, validações e fórmulas da linha anterior */
    F.forEach(function(f,i){if(!f)sh.getRange(r,i+1).clearContent().clearNote()})}
  sh.getRange(r,S.cN).setValue(n);
  var ign=fal.slice();ks.forEach(function(t,i){var c=sh.getRange(r,C[i]);if(c.getFormula()||!put(c,val(h[t])))ign.push(t)});
  notas(S,r,h,nk,ign);SpreadsheetApp.flush();confPend(S,r,h);S.stamp(r);return {n:n,linha:r,ign:ign}}
/* grava respeitando a validação da célula: valor fora da lista de outra planilha (ex.: Copiar para outro artista) fica em branco e volta em ign, em vez de derrubar a criação */
function put(c,v){try{var dv=c.getDataValidation&&c.getDataValidation();
    if(dv&&!dv.getAllowInvalid()&&v!==''&&dv.getCriteriaType()==SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST){var L=dv.getCriteriaValues()[0]||[];if(L.map(String).indexOf(String(v))<0)return false}
    c.setValue(v);return true}catch(e){try{c.clearContent()}catch(x){}return false}}
/* "nota:TÍTULO" = nota da célula (ex.: vários horários na nota de INÍCIO DO SHOW); texto vazio apaga a nota */
function isNota(t){return /^nota:/i.test(t)}
function notas(S,r,h,nk,ign){var n=0;nk.forEach(function(t){var c=t.slice(5);if(!S.has(c)){ign.push(t);return}S.sh.getRange(r,S.col(c)).setNote(String(h[t]==null?'':h[t]));n++});return n}

function cel(x){return x instanceof Date?Utilities.formatDate(x,TZ,x.getFullYear()<1900?'H:mm':'yyyy-MM-dd'):x}
function opLer(S,p){
  if(p&&p.n){var sh1=S.sh,r=S.row(p.n),L=S.H.length,raw1=sh1.getRange(HDR,1,1,L).getValues()[0],T1=raw1.map(function(t,i){return t?nh(t):(i&&raw1[i-1]?nh(raw1[i-1])+'>1':'')}),g=sh1.getRange(r,1,1,L),N=g.getNotes()[0],o={};
    T1.forEach(function(t,i){if(t&&N[i])o[t]=N[i]});
    return {cols:T1,rows:[g.getValues()[0].map(cel)],disp:[g.getDisplayValues()[0]],notas:o,n:+p.n,em:agora()}}
  var sh=S.sh,n=sh.getLastRow()-DADOS+1,V=n>0?sh.getRange(DADOS,1,n,S.H.length).getValues():[],raw=sh.getRange(HDR,1,1,S.H.length).getValues()[0];
  var T=raw.map(function(t,i){return t?nh(t):(i&&raw[i-1]?nh(raw[i-1])+'>1':'')});
  return {cols:T,rows:V.filter(function(r){return r[S.cN-1]!==''}).map(function(r){return r.map(function(x){return x instanceof Date?Utilities.formatDate(x,TZ,'yyyy-MM-dd'):x})})}}

function opNotas(S,p){   /* só leitura: notas da coluna DESPESAS (detalhe dos custos), que o IMPORTRANGE não leva para a BASECLAUDE. p.n opcional = só uma proposta */
  var sh=S.sh,n=sh.getLastRow()-DADOS+1,o={};if(n<1)return {notas:o};
  var N=sh.getRange(DADOS,S.cN,n,1).getValues(),T=sh.getRange(DADOS,S.col(p.col||'DESPESAS'),n,1).getNotes();
  N.forEach(function(r,i){var x=r[0];if(x===''||!T[i][0])return;if(p.n&&String(+x)!==String(+p.n))return;o[String(+x)]=T[i][0]});
  return {notas:o}}

function run(env){
  var v=verify(env),p=v.p,C=CacheService.getScriptCache(),ck='r:'+p.id,old=C.get(ck);
  if(old)return JSON.parse(old);   /* mesmo id = repetição: devolve o resultado anterior, não grava de novo */
  var res;
  if(p.op==='ler'){res={ok:1,id:p.id,r:opLer(Sheet(v.sid),p)};return res}
  if(p.op==='notas'){res={ok:1,id:p.id,r:opNotas(Sheet(v.sid),p)};return res}
  if(p.op==='ping'){return {ok:1,id:p.id,r:{app:v.app,a:p.a,ops:v.A.ops}}}   /* só confere assinatura e autorização; não lê nem grava */
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

/* ---------------- gatilhos: carimbo de edição (onEdit) + rotina de hora em hora ---------------- */
function installTriggers(){
  ScriptApp.getProjectTriggers().forEach(function(t){var h=t.getHandlerFunction();if(h==='carimbo'||h==='rotina')ScriptApp.deleteTrigger(t)});
  CARIMBO.forEach(function(id){ScriptApp.newTrigger('carimbo').forSpreadsheet(id).onEdit().create()});
  ScriptApp.newTrigger('rotina').timeBased().everyHours(1).create();
  Logger.log('gatilhos instalados: '+CARIMBO.length+' de carimbo (esperado 11) + 1 de rotina (de hora em hora)');
  Logger.log('AUTO_REALIZADO='+(prop('AUTO_REALIZADO')||'(vazio = desligado)')+' · AUTO_DESCARTE='+(prop('AUTO_DESCARTE')||'(vazio = desligado)')+' · AUTO_CONTRATO='+(prop('AUTO_CONTRATO')||'(vazio = desligado)'))}
function prop(k){return PropertiesService.getScriptProperties().getProperty(k)}

/* rotina (de hora em hora). Cada parte só roda se a propriedade do script estiver = 1:
   AUTO_REALIZADO=1 -> "Show confirmado" vira "Show realizado" quando início + duração já passou
   AUTO_CONTRATO=1  -> PDF "[assinado]" em "Contratos com Contratantes" marca CONTRATO = "Sim" na proposta */
function rotina(){var L=[];
  if(prop('AUTO_REALIZADO')==='1')try{L.push('realizados: '+autoRealizado(new Date()))}catch(e){L.push('realizados: erro '+e)}
  if(prop('AUTO_DESCARTE')==='1')try{L.push('descartadas: '+resumoDesc(autoDescarte(new Date(),true)))}catch(e){L.push('descartadas: erro '+e)}
  if(prop('AUTO_CONTRATO')==='1')try{L.push('contratos: '+autoContrato())}catch(e){L.push('contratos: erro '+e)}
  Logger.log(L.join(' · ')||'rotina: nada ligado (AUTO_REALIZADO / AUTO_CONTRATO)');return L}

/* hora "HH:MM" (texto, Date de célula de hora ou fração do dia) -> minutos; null se não for hora (ex.: "a definir") */
function minutos(v){if(v instanceof Date)return +Utilities.formatDate(v,TZ,'H')*60+ +Utilities.formatDate(v,TZ,'m');
  if(typeof v==='number')return v>=0&&v<2?Math.round(v*1440):null;var m=/^\s*(\d{1,2})\s*(?::|h)\s*(\d{2})?/i.exec(String(v||''));return m?+m[1]*60+ +(m[2]||0):null}
/* "Horários: 23:00 às 00:00 e 01:30 à 02:30" nas OBSERVAÇÕES -> [[ini,fim],...] em minutos desde a 00:00 do 1º horário (fim sempre depois do início) */
function horarios(obs){var m=/hor[áa]rios?\s*:\s*([^\n]+)/i.exec(String(obs||''));if(!m)return null;var L=[],re=/(\d{1,2})[:h](\d{2})\s*(?:às|as|à|a|-|–|até)\s*(\d{1,2})[:h](\d{2})/gi,x,b=null;
  while((x=re.exec(m[1]))){var i=+x[1]*60+ +x[2],f=+x[3]*60+ +x[4];if(b===null)b=i;while(i<b)i+=1440;while(f<=i)f+=1440;L.push([i,f]);b=f}return L.length?L:null}
/* fim do show (regras DROM, iguais ao Painel): início 00:00–05:59 = madrugada do dia seguinte; fim = início + duração (ou fim do último horário);
   sem horário de início ("a definir"/vazio) = considera realizado às 06:00 do dia seguinte */
function fimShow(dt,ini,dur,obs){if(!(dt instanceof Date))return null;var d=new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()),g=horarios(obs),a=g?g[0][0]%1440:minutos(ini);
  if(a===null)return new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,6,0);
  var ext=g?g[g.length-1][1]-g[0][0]:(minutos(dur)||60);
  return new Date(d.getFullYear(),d.getMonth(),d.getDate()+(a<360?1:0),0,a+ext)}
function autoRealizado(now){var tot=0;
  CARIMBO.forEach(function(id){try{var S=Sheet(id),sh=S.sh,n=sh.getLastRow()-DADOS+1;if(n<1)return;
    var cS=S.col('STATUS'),cD=S.col('DATA DO SHOW'),cI=S.col('INÍCIO DO SHOW'),cU=S.col('DURAÇÃO'),cO=S.has('OBSERVAÇÕES')?S.col('OBSERVAÇÕES'):0,lc=Math.max(cS,cD,cI,cU,cO);
    var V=sh.getRange(DADOS,1,n,lc).getValues(),F=sh.getRange(DADOS,cS,n,1).getFormulas(),NI=sh.getRange(DADOS,cI,n,1).getNotes();
    V.forEach(function(r,i){if(nh(r[cS-1])!=='SHOW CONFIRMADO'||F[i][0])return;var e=fimShow(r[cD-1],r[cI-1],r[cU-1],(NI[i][0]||'')+'\n'+(cO?r[cO-1]:''));
      if(e&&now>=e){sh.getRange(DADOS+i,cS).setValue('Show realizado');S.stamp(DADOS+i);tot++}})}catch(e){Logger.log(id+': '+e)}});
  return tot}
/* AUTO_DESCARTE: passado o dia do evento, STATUS "Proposta emitida", "Em negociação" ou "Data reservada" passa a "Proposta descartada".
   Fim do dia = 06:00 do dia seguinte à DATA DO SHOW (regra da madrugada: show 00:00–05:59 é a noite da data), ou o fim do show, se for depois.
   Qualquer outro STATUS (Show confirmado/realizado/cancelado, já descartada, vazio...) e STATUS com fórmula: não mexe.
   grava=false: só simula (testeRotina). Retorna {tot, por:{artista:n}, L:[linhas]} */
var SIM_DESC=['PROPOSTA EMITIDA','EM NEGOCIAÇÃO','DATA RESERVADA'];
function nomeArt(id){for(var a in ARTS)if(ARTS[a].id===id)return a;return id===TESTE?'Artista Teste':id}
function autoDescarte(now,grava){var R={tot:0,por:{},L:[]};
  CARIMBO.forEach(function(id){var an=nomeArt(id);try{var S=Sheet(id),sh=S.sh,n=sh.getLastRow()-DADOS+1;if(n<1)return;
    var cS=S.col('STATUS'),cD=S.col('DATA DO SHOW'),cI=S.col('INÍCIO DO SHOW'),cU=S.col('DURAÇÃO'),cO=S.has('OBSERVAÇÕES')?S.col('OBSERVAÇÕES'):0,cL=S.has('LOCAL')?S.col('LOCAL'):0,lc=Math.max(cS,cD,cI,cU,cO,cL,S.cN);
    var V=sh.getRange(DADOS,1,n,lc).getValues(),F=sh.getRange(DADOS,cS,n,1).getFormulas();
    V.forEach(function(r,i){var st0=nh(r[cS-1]);if(SIM_DESC.indexOf(st0)<0||F[i][0]||!(r[cD-1] instanceof Date))return;
      var d=r[cD-1],e=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,6,0),f=fimShow(r[cD-1],r[cI-1],r[cU-1],cO?r[cO-1]:'');if(f&&f>e)e=f;
      if(now<e)return;R.tot++;R.por[an]=(R.por[an]||0)+1;
      R.L.push(an+' · Nº '+r[S.cN-1]+' · '+r[cS-1]+' · '+Utilities.formatDate(d,TZ,'dd/MM/yyyy')+' · '+(cL?String(r[cL-1]||'-'):'-'));
      if(grava){sh.getRange(DADOS+i,cS).setValue('Proposta descartada');S.stamp(DADOS+i)}})}catch(e){Logger.log(an+': '+e)}});
  return R}
function resumoDesc(R){var k=Object.keys(R.por);return R.tot+(k.length?' ('+k.map(function(a){return a+': '+R.por[a]}).join(', ')+')':'')}
/* contratos assinados: "DROM Entretenimento - Contrato 50028-2026 [assinado].pdf" em .../<artista>/Contratos com Contratantes[/ano]/
   nº do contrato = prefixo do artista + Nº com 4 dígitos (Booker: numero()). Só marca se CONTRATO estiver vazio, "Não" ou "Pendente". */
var PFX={'1':'Ramonstro','2':'Brinquinho','3':'Carloto','4':'Sena','5':'Cenoura','6':'Liquinho','7':'Maneira','8':'Amaro','9':'Josu','10':'Cadu Vieira'};
function autoContrato(){var since=new Date(Date.now()-3*864e5),tot=0,P=PropertiesService.getScriptProperties(),feito=JSON.parse(P.getProperty('CONTRATOS_FEITOS')||'{}');
  var it=DriveApp.searchFiles("title contains 'assinado' and mimeType = 'application/pdf' and modifiedDate > '"+since.toISOString()+"' and trashed = false");
  while(it.hasNext()){var f=it.next(),id=f.getId();if(feito[id])continue;
    var m=/Contrato\s+(\d{5,6})-(\d{4})/.exec(f.getName());if(!m)continue;
    var k=m[1],pf=k.length===6?k.slice(0,2):k.slice(0,1),a=PFX[pf],n=+k.slice(pf.length);if(!a||!ARTS[a])continue;
    var p1=f.getParents(),pa=p1.hasNext()?p1.next():null,ok=false,x=pa;for(var j=0;j<3&&x;j++){var nmx=x.getName();if(nmx.toLowerCase().indexOf(a.toLowerCase())>=0&&j>0){ok=true;break}var px=x.getParents();x=px.hasNext()?px.next():null}
    if(!ok||!pa||!/Contratos com Contratantes|^\d{4}$/.test(pa.getName()))continue;   /* só PDFs dentro da pasta do próprio artista */
    try{var S=Sheet(ARTS[a].id),r=S.row(n),c=S.sh.getRange(r,S.col('CONTRATO'));
      if(!c.getFormula()&&/^(|N[ÃA]O|PENDENTE)$/.test(nh(c.getValue()))){c.setValue('Sim');c.setNote('Contrato assinado no Drive: '+f.getName()+' ('+agora()+')');S.stamp(r);tot++}
      feito[id]=1}catch(e){Logger.log(f.getName()+': '+e)}}
  var ks=Object.keys(feito);if(ks.length>500)ks.slice(0,ks.length-500).forEach(function(z){delete feito[z]});P.setProperty('CONTRATOS_FEITOS',JSON.stringify(feito));
  return tot}
/* teste manual pelo editor: mostra o que a rotina FARIA agora com os realizados, sem gravar nada */
function testeRotina(){CARIMBO.forEach(function(id){try{var S=Sheet(id),sh=S.sh,n=sh.getLastRow()-DADOS+1;if(n<1)return;
  var cS=S.col('STATUS'),cD=S.col('DATA DO SHOW'),cI=S.col('INÍCIO DO SHOW'),cU=S.col('DURAÇÃO'),cO=S.has('OBSERVAÇÕES')?S.col('OBSERVAÇÕES'):0,lc=Math.max(cS,cD,cI,cU,cO),V=sh.getRange(DADOS,1,n,lc).getValues();
  V.forEach(function(r,i){if(nh(r[cS-1])!=='SHOW CONFIRMADO')return;var e=fimShow(r[cD-1],r[cI-1],r[cU-1],cO?r[cO-1]:'');
    Logger.log(SpreadsheetApp.openById(id).getName()+' · Nº '+r[S.cN-1]+' · fim '+(e?Utilities.formatDate(e,TZ,'dd/MM/yyyy HH:mm'):'?')+(e&&new Date()>=e?' -> viraria Show realizado':''))})}catch(e){Logger.log(id+': '+e)}});
  var R=autoDescarte(new Date(),false);
  Logger.log('AUTO_DESCARTE (simulação, nada gravado; STATUS Proposta emitida / Em negociação / Data reservada com data passada): '+R.tot+' proposta(s) virariam Proposta descartada');
  Object.keys(R.por).forEach(function(a){Logger.log('  '+a+': '+R.por[a])});
  R.L.slice(0,30).forEach(function(x){Logger.log('  '+x)});if(R.L.length>30)Logger.log('  ... e mais '+(R.L.length-30))}
function carimbo(e){try{   /* mesmo comportamento dos scripts antigos de cada planilha: aba ativa, linha >= 5, coluna 54 (BB); edição no próprio BB é ignorada */
  var aba=e.source.getActiveSheet(),g=e.range;
  var r0=Math.max(g.getRow(),DADOS),r1=g.getLastRow();if(r1<r0)return;
  if(g.getColumn()===COL_TS&&g.getLastColumn()===COL_TS)return;
  var d=new Date(),v=[];for(var r=r0;r<=r1;r++)v.push([d]);aba.getRange(r0,COL_TS,v.length,1).setValues(v)}catch(x){}}

/* rode pelo editor (▶ autorizar) uma vez: pede as permissões de planilha */
function autorizar(){CARIMBO.forEach(function(id){Logger.log(SpreadsheetApp.openById(id).getName())});Logger.log('Drive: '+DriveApp.getRootFolder().getName())}
