/* DROM · Avaliação 2026 · recebe as respostas do formulário (dromentretenimento.com/sistema/pe2027/avaliaform26),
   grava numa planilha da conta DROM (sem e-mail). O hub lê tudo com ?r=<READ>.
   Propriedades do script (Configurações do projeto → Propriedades): TOKENS = JSON {login: token}, READ = chave de leitura do hub.
   Implantar como app da Web: Executar como "Eu", acesso "Qualquer pessoa". */
var PASTA="1jZU1c-vJMVTa2ABpDdtZ-6PMnpsjyess" /* Meu Drive/DROM/ADMINISTRATIVO/CADASTRO DE ARTISTAS */,DROM_MAIL="contato@dromentretenimento.com",PRAZO=new Date("2026-11-27T12:00:00-03:00");
function P_(k){return PropertiesService.getScriptProperties().getProperty(k)}
/* textos sem limite: JSON dividido em pedaços de 45 mil caracteres nas últimas colunas da linha (limite do Sheets é 50 mil por célula) */
function ch_(t){t=String(t);var L=[];for(var i=0;i<t.length;i+=45000)L.push(t.slice(i,i+45000));return L.length?L:[""]}
function jn_(row,i){try{return JSON.parse(row.slice(i).join("")||"{}")}catch(e){return{}}}
function put_(sh,at,row){var w=Math.max(row.length,sh.getLastColumn());while(row.length<w)row.push("");if(at>0)sh.getRange(at,1,1,w).setValues([row]);else sh.appendRow(row)}
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function sh_(){var p=PropertiesService.getScriptProperties(),id=p.getProperty("SHEET"),ss;
  if(id){try{ss=SpreadsheetApp.openById(id)}catch(e){ss=null}}
  if(!ss){ss=SpreadsheetApp.create("DROM · Avaliação 2026 (respostas)");p.setProperty("SHEET",ss.getId());
    var a=ss.getSheets()[0];a.setName("Respostas");a.appendRow(["login","nome","e-mail","enviado em","teste","números (json)","respostas (json, continua nas colunas seguintes se for longo)"]);
    try{DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(PASTA))}catch(e){}
    ss.insertSheet("Histórico").appendRow(["login","nome","e-mail","enviado em","teste","respostas (json, continua)"]);ss.insertSheet("Rascunhos").appendRow(["login","nome","salvo em","ts","respostas (json, continua)"])}
  return ss}
function doPost(e){try{var b=JSON.parse(e.postData.contents),T=JSON.parse(P_("TOKENS")||"{}");
  if(b.agenda){if(b.r!==P_("READ"))return out_({ok:false,err:"não autorizado"});PropertiesService.getScriptProperties().setProperty("AGENDA",JSON.stringify(b.agenda));return out_({ok:true})}
  if(b.clear){if(b.r!==P_("READ")||b.clear!=="teste")return out_({ok:false,err:"não autorizado"});var ss0=sh_(),n=0;["Respostas","Rascunhos","Histórico"].forEach(function(nm){var sh=ss0.getSheetByName(nm);if(!sh)return;var v=sh.getDataRange().getValues();for(var i=v.length-1;i>=1;i--)if(v[i][0]==="teste"){sh.deleteRow(i+1);n++}});PropertiesService.getScriptProperties().setProperty("CLR_teste",String(Date.now()));return out_({ok:true,n:n})}
  if(!b.k||!T[b.k]||T[b.k]!==b.t)return out_({ok:false,err:"login inválido"});
  if(b.k!=="teste"&&new Date()>=PRAZO)return out_({ok:false,err:"prazo encerrado em 27/11 às 12h"});
  var lock=LockService.getScriptLock();lock.waitLock(20000);var ss=sh_();
  /* rascunho: salva enquanto o artista preenche, sem e-mail */
  var rd=ss.getSheetByName("Rascunhos")||ss.insertSheet("Rascunhos");if(rd.getLastRow()<1)rd.appendRow(["login","nome","salvo em","ts","respostas (json)"]);
  var dv=rd.getDataRange().getValues(),di=-1;for(var j=1;j<dv.length;j++)if(dv[j][0]===b.k){di=j+1;break}
  var drow=[b.k,b.n,"'"+Utilities.formatDate(new Date(),"America/Sao_Paulo","dd/MM/yyyy HH:mm"),b.ts||0].concat(ch_(JSON.stringify(b.a||{})));
  if(di>0){if((+dv[di-1][3]||0)<=(b.ts||0))put_(rd,di,drow)}else put_(rd,0,drow);
  if(b.draft){lock.releaseLock();return out_({ok:true})}
  var r=ss.getSheetByName("Respostas"),now=Utilities.formatDate(new Date(),"America/Sao_Paulo","dd/MM/yyyy HH:mm"),
      row=[b.k,b.n,b.e||"","'"+now,b.teste?"sim":"",JSON.stringify(b.st||{})].concat(ch_(JSON.stringify(b.a||{}))),
      v=r.getDataRange().getValues(),at=-1;
  for(var i=1;i<v.length;i++)if(v[i][0]===b.k){at=i+1;break}
  put_(r,at,row.slice());
  ss.getSheetByName("Histórico").appendRow(row.slice(0,5).concat(row.slice(6)));tabela_(ss,b,now);lock.releaseLock();
  return out_({ok:true,em:now})}catch(err){return out_({ok:false,err:String(err)})}}
/* aba "Tabela": uma linha por artista e uma coluna por pergunta (backup legível) */
function tabela_(ss,b,now){var t=ss.getSheetByName("Tabela")||ss.insertSheet("Tabela",0),H=["Artista","Login","Enviado em"],V=[b.n,b.k,"'"+now];
  (b.r||[]).forEach(function(s){s.i.forEach(function(q){H.push(s.s+" · "+q.q);var a=String(q.a||"");V.push(a.length>49000?a.slice(0,49000)+" … (texto completo na aba Respostas)":a)})});
  t.getRange(1,1,1,H.length).setValues([H]).setFontWeight("bold").setWrap(true);t.setFrozenRows(1);t.setFrozenColumns(1);
  var v=t.getLastRow()>1?t.getRange(2,2,t.getLastRow()-1,1).getValues():[],at=-1;for(var i=0;i<v.length;i++)if(v[i][0]===b.k){at=i+2;break}
  if(at<0)at=t.getLastRow()+1;t.getRange(at,1,1,V.length).setValues([V])}
/* respostas do encerramento 2025 por artista (notas), para comparar no hub */
function y25_(){try{var EM={"carlotodj@gmail.com":"carloto","andrecaio1105@gmail.com":"cenoura","bernardosenasilva@gmail.com":"sena","sophia.sshpp@gmail.com":"maneira","ramon_rotava@hotmail.com":"ramonstro"},
  C={sat:2,ren:3,ind:4,grp:6,cmp:7,app:8,fin:9,qtd:11,cfl:13,cfo:15,c20:17,c30:18,rtc:40,rhs:41,met:45,idv:46,mcm:48,mag:49,msh:50,rsd:52,rsc:53,dsg:62,ags:61},
  v=SpreadsheetApp.openById("1k2K0MTXnvRY5cqne1fc1ZIgiS-gwFroSNar_a0GtsfY").getSheets()[0].getDataRange().getValues(),o={};
  for(var i=1;i<v.length;i++){var k=EM[String(v[i][1]).trim().toLowerCase()];if(!k)continue;o[k]={};for(var id in C){var x=v[i][C[id]];if(x===""||x==null)continue;o[k][id]=(typeof x==="number"||/^\d+([.,]\d+)?$/.test(String(x).trim()))?Number(String(x).replace(",",".")):String(x)}}
  return o}catch(e){return{}}}
function esc_(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function doGet(e){var p=e.parameter,ss=sh_(),rd=ss.getSheetByName("Rascunhos"),dv=rd?rd.getDataRange().getValues():[];
  if(p.k){var T=JSON.parse(P_("TOKENS")||"{}");if(!T[p.k]||T[p.k]!==p.t)return out_({ok:false});var o={ok:true,clr:P_("CLR_"+p.k)||""};
    for(var j=1;j<dv.length;j++)if(dv[j][0]===p.k)o.d={ts:+dv[j][3]||0,a:jn_(dv[j],4)};
    var sv=ss.getSheetByName("Respostas").getDataRange().getValues();for(var i=1;i<sv.length;i++)if(sv[i][0]===p.k)o.em=sv[i][3];return out_(o)}
  if(!p.r||p.r!==P_("READ"))return out_({ok:false});
  var v=ss.getSheetByName("Respostas").getDataRange().getValues(),L=[],R=[];for(var j=1;j<dv.length;j++)R.push({k:dv[j][0],ts:+dv[j][3]||0,a:jn_(dv[j],4)});
  for(var i=1;i<v.length;i++)L.push({k:v[i][0],n:v[i][1],e:v[i][2],em:v[i][3],teste:v[i][4]==="sim",a:jn_(v[i],6),st:(function(){try{return JSON.parse(v[i][5]||"{}")}catch(e){return{}}})()});
  return out_({ok:true,L:L,R:R,ag:JSON.parse(P_("AGENDA")||"{}"),y25:y25_()})}
/* rode uma vez pelo editor para autorizar planilha e e-mail */
function autorizar(){sh_()}
