/* DROM · Avaliação 2026 · recebe as respostas do formulário (dromentretenimento.com/sistema/pe2027/avaliaform26),
   grava numa planilha da conta DROM (sem e-mail). O hub lê tudo com ?r=<READ>.
   Propriedades do script (Configurações do projeto → Propriedades): TOKENS = JSON {login: token}, READ = chave de leitura do hub.
   Implantar como app da Web: Executar como "Eu", acesso "Qualquer pessoa". */
var PASTA="1jZU1c-vJMVTa2ABpDdtZ-6PMnpsjyess" /* Meu Drive/DROM/ADMINISTRATIVO/CADASTRO DE ARTISTAS */,DROM_MAIL="contato@dromentretenimento.com",PRAZO=new Date("2026-11-27T12:00:00-03:00");
function P_(k){return PropertiesService.getScriptProperties().getProperty(k)}
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function sh_(){var p=PropertiesService.getScriptProperties(),id=p.getProperty("SHEET"),ss;
  if(id){try{ss=SpreadsheetApp.openById(id)}catch(e){ss=null}}
  if(!ss){ss=SpreadsheetApp.create("DROM · Avaliação 2026 (respostas)");p.setProperty("SHEET",ss.getId());
    var a=ss.getSheets()[0];a.setName("Respostas");a.appendRow(["login","nome","e-mail","enviado em","teste","respostas (json)","números (json)","texto (json)"]);
    try{DriveApp.getFileById(ss.getId()).moveTo(DriveApp.getFolderById(PASTA))}catch(e){}
    ss.insertSheet("Histórico").appendRow(["login","nome","e-mail","enviado em","teste","respostas (json)"]);ss.insertSheet("Rascunhos").appendRow(["login","nome","salvo em","ts","respostas (json)"])}
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
  var drow=[b.k,b.n,Utilities.formatDate(new Date(),"America/Sao_Paulo","dd/MM/yyyy HH:mm"),b.ts||0,JSON.stringify(b.a||{})];
  if(di>0){if((+dv[di-1][3]||0)<=(b.ts||0))rd.getRange(di,1,1,5).setValues([drow])}else rd.appendRow(drow);
  if(b.draft){lock.releaseLock();return out_({ok:true})}
  var r=ss.getSheetByName("Respostas"),now=Utilities.formatDate(new Date(),"America/Sao_Paulo","dd/MM/yyyy HH:mm"),
      row=[b.k,b.n,b.e,now,b.teste?"sim":"",JSON.stringify(b.a||{}),JSON.stringify(b.st||{}),JSON.stringify(b.r||[])],
      v=r.getDataRange().getValues(),at=-1;
  for(var i=1;i<v.length;i++)if(v[i][0]===b.k){at=i+1;break}
  if(at>0)r.getRange(at,1,1,row.length).setValues([row]);else r.appendRow(row);
  ss.getSheetByName("Histórico").appendRow(row.slice(0,6));tabela_(ss,b,now);lock.releaseLock();
  return out_({ok:true,em:now})}catch(err){return out_({ok:false,err:String(err)})}}
/* aba "Tabela": uma linha por artista e uma coluna por pergunta (backup legível) */
function tabela_(ss,b,now){var t=ss.getSheetByName("Tabela")||ss.insertSheet("Tabela",0),H=["Artista","Login","Enviado em"],V=[b.n,b.k,now];
  (b.r||[]).forEach(function(s){s.i.forEach(function(q){H.push(s.s+" · "+q.q);V.push(q.a||"")})});
  t.getRange(1,1,1,H.length).setValues([H]).setFontWeight("bold").setWrap(true);t.setFrozenRows(1);t.setFrozenColumns(1);
  var v=t.getLastRow()>1?t.getRange(2,2,t.getLastRow()-1,1).getValues():[],at=-1;for(var i=0;i<v.length;i++)if(v[i][0]===b.k){at=i+2;break}
  if(at<0)at=t.getLastRow()+1;t.getRange(at,1,1,V.length).setValues([V])}
function esc_(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function doGet(e){var p=e.parameter,ss=sh_(),rd=ss.getSheetByName("Rascunhos"),dv=rd?rd.getDataRange().getValues():[];
  if(p.k){var T=JSON.parse(P_("TOKENS")||"{}");if(!T[p.k]||T[p.k]!==p.t)return out_({ok:false});var o={ok:true,clr:P_("CLR_"+p.k)||""};
    for(var j=1;j<dv.length;j++)if(dv[j][0]===p.k)o.d={ts:+dv[j][3]||0,a:JSON.parse(dv[j][4]||"{}")};
    var sv=ss.getSheetByName("Respostas").getDataRange().getValues();for(var i=1;i<sv.length;i++)if(sv[i][0]===p.k)o.em=sv[i][3];return out_(o)}
  if(!p.r||p.r!==P_("READ"))return out_({ok:false});
  var v=ss.getSheetByName("Respostas").getDataRange().getValues(),L=[],R=[];for(var j=1;j<dv.length;j++)R.push({k:dv[j][0],ts:+dv[j][3]||0,a:JSON.parse(dv[j][4]||"{}")});
  for(var i=1;i<v.length;i++)L.push({k:v[i][0],n:v[i][1],e:v[i][2],em:v[i][3],teste:v[i][4]==="sim",a:JSON.parse(v[i][5]||"{}"),st:JSON.parse(v[i][6]||"{}")});
  return out_({ok:true,L:L,R:R,ag:JSON.parse(P_("AGENDA")||"{}")})}
/* rode uma vez pelo editor para autorizar planilha e e-mail */
function autorizar(){sh_()}
