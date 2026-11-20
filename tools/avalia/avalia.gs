/* DROM · Avaliação 2026 · recebe as respostas do formulário (dromentretenimento.com/sistema/pe2027/avaliaform26),
   grava numa planilha da conta DROM e manda cópia por e-mail ao artista e à DROM. O hub lê tudo com ?r=<READ>.
   Propriedades do script (Configurações do projeto → Propriedades): TOKENS = JSON {login: token}, READ = chave de leitura do hub.
   Implantar como app da Web: Executar como "Eu", acesso "Qualquer pessoa". */
var DROM_MAIL="contato@dromentretenimento.com";
function P_(k){return PropertiesService.getScriptProperties().getProperty(k)}
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function sh_(){var p=PropertiesService.getScriptProperties(),id=p.getProperty("SHEET"),ss;
  if(id){try{ss=SpreadsheetApp.openById(id)}catch(e){ss=null}}
  if(!ss){ss=SpreadsheetApp.create("DROM · Avaliação 2026 (respostas)");p.setProperty("SHEET",ss.getId());
    var a=ss.getSheets()[0];a.setName("Respostas");a.appendRow(["login","nome","e-mail","enviado em","teste","respostas (json)","números (json)","texto (json)"]);
    ss.insertSheet("Histórico").appendRow(["login","nome","e-mail","enviado em","teste","respostas (json)"])}
  return ss}
function doPost(e){try{var b=JSON.parse(e.postData.contents),T=JSON.parse(P_("TOKENS")||"{}");
  if(!b.k||!T[b.k]||T[b.k]!==b.t)return out_({ok:false,err:"login inválido"});
  var lock=LockService.getScriptLock();lock.waitLock(20000);
  var ss=sh_(),r=ss.getSheetByName("Respostas"),now=Utilities.formatDate(new Date(),"America/Sao_Paulo","dd/MM/yyyy HH:mm"),
      row=[b.k,b.n,b.e,now,b.teste?"sim":"",JSON.stringify(b.a||{}),JSON.stringify(b.st||{}),JSON.stringify(b.r||[])],
      v=r.getDataRange().getValues(),at=-1;
  for(var i=1;i<v.length;i++)if(v[i][0]===b.k){at=i+1;break}
  if(at>0)r.getRange(at,1,1,row.length).setValues([row]);else r.appendRow(row);
  ss.getSheetByName("Histórico").appendRow(row.slice(0,6));lock.releaseLock();
  mail_(b,now);return out_({ok:true,em:now})}catch(err){return out_({ok:false,err:String(err)})}}
function mail_(b,now){var h='<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#151515">'+
  '<div style="background:#0000FF;color:#fff;padding:18px 20px;border-radius:14px"><b style="font-size:20px">DROM · Avaliação 2026</b><br>'+esc_(b.n)+' · enviado em '+now+'</div>';
  if(b.st)h+='<p style="margin:16px 0 4px"><b>Seus números de 2026</b>: '+b.st.r+' realizados · '+b.st.f+' a realizar · '+b.st.p+' projetados · total '+b.st.tot+'</p>';
  (b.r||[]).forEach(function(s){h+='<h3 style="margin:22px 0 6px;color:#0000FF">'+esc_(s.s)+'</h3>';s.i.forEach(function(q){h+='<p style="margin:8px 0 0;color:#6b6b6b;font-size:13px">'+esc_(q.q)+'</p><p style="margin:2px 0 0;font-weight:bold;white-space:pre-wrap">'+(esc_(q.a)||'<span style="color:#d93025;font-weight:normal">sem resposta</span>')+'</p>'})});
  h+='<p style="margin-top:26px;color:#6b6b6b;font-size:12px">DROM Entretenimento · dromentretenimento.com</p></div>';
  var sub=(b.teste?"[TESTE] ":"")+"DROM · Avaliação 2026 · "+b.n;
  try{MailApp.sendEmail({to:b.e,subject:sub,htmlBody:h,name:"DROM Entretenimento",replyTo:DROM_MAIL})}catch(e){}
  MailApp.sendEmail({to:DROM_MAIL,subject:sub,htmlBody:h,name:"DROM Entretenimento",replyTo:b.e})}
function esc_(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function doGet(e){if(!e.parameter.r||e.parameter.r!==P_("READ"))return out_({ok:false});
  var v=sh_().getSheetByName("Respostas").getDataRange().getValues(),L=[];
  for(var i=1;i<v.length;i++)L.push({k:v[i][0],n:v[i][1],e:v[i][2],em:v[i][3],teste:v[i][4]==="sim",a:JSON.parse(v[i][5]||"{}"),st:JSON.parse(v[i][6]||"{}")});
  return out_({ok:true,L:L})}
/* rode uma vez pelo editor para autorizar planilha e e-mail */
function autorizar(){sh_();MailApp.getRemainingDailyQuota()}
