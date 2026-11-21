/* DROM · Avaliação 2026 · recebe as respostas do formulário (dromentretenimento.com/sistema/pe2027/avaliaform26),
   grava numa planilha da conta DROM e manda cópia por e-mail ao artista e à DROM. O hub lê tudo com ?r=<READ>.
   Propriedades do script (Configurações do projeto → Propriedades): TOKENS = JSON {login: token}, READ = chave de leitura do hub.
   Implantar como app da Web: Executar como "Eu", acesso "Qualquer pessoa". */
var DROM_MAIL="contato@dromentretenimento.com",PRAZO=new Date("2026-11-27T12:00:00-03:00");
function P_(k){return PropertiesService.getScriptProperties().getProperty(k)}
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function sh_(){var p=PropertiesService.getScriptProperties(),id=p.getProperty("SHEET"),ss;
  if(id){try{ss=SpreadsheetApp.openById(id)}catch(e){ss=null}}
  if(!ss){ss=SpreadsheetApp.create("DROM · Avaliação 2026 (respostas)");p.setProperty("SHEET",ss.getId());
    var a=ss.getSheets()[0];a.setName("Respostas");a.appendRow(["login","nome","e-mail","enviado em","teste","respostas (json)","números (json)","texto (json)"]);
    ss.insertSheet("Histórico").appendRow(["login","nome","e-mail","enviado em","teste","respostas (json)"]);ss.insertSheet("Rascunhos").appendRow(["login","nome","salvo em","ts","respostas (json)"])}
  return ss}
function doPost(e){try{var b=JSON.parse(e.postData.contents),T=JSON.parse(P_("TOKENS")||"{}");
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
  ss.getSheetByName("Histórico").appendRow(row.slice(0,6));lock.releaseLock();
  mail_(b,now);return out_({ok:true,em:now})}catch(err){return out_({ok:false,err:String(err)})}}
function mail_(b,now){var h='<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#151515">'+
  '<div style="background:#0000FF;color:#fff;padding:18px 20px;border-radius:14px"><b style="font-size:20px">'+esc_(b.n)+'</b><br>Avaliação Anual 2026 · DROM<br><span style="font-size:13px">Versão enviada em '+now+'</span></div>';
  if(b.st)h+='<p style="margin:16px 0 4px"><b>Seus shows em 2026</b>: '+b.st.r+' realizados · '+b.st.f+' a realizar · '+b.st.p+' projetados · total '+b.st.tot+'</p>';
  (b.r||[]).forEach(function(s){h+='<h3 style="margin:22px 0 6px;color:#0000FF">'+esc_(s.s)+'</h3>';s.i.forEach(function(q){h+='<p style="margin:8px 0 0;color:#6b6b6b;font-size:13px">'+esc_(q.q)+'</p><p style="margin:2px 0 0;font-weight:bold;white-space:pre-wrap">'+(esc_(q.a)||'<span style="color:#999;font-weight:normal">sem resposta</span>')+'</p>'})});
  h+='<p style="margin-top:26px;color:#6b6b6b;font-size:12px">DROM Entretenimento · dromentretenimento.com</p></div>';
  var nome="DROM - Avaliação Anual 2026 - "+b.n+" - "+now.replace(/[\/:]/g,"-")+".pdf",pdf=Utilities.newBlob('<html><head><meta charset="utf-8"><title>'+esc_(nome)+'</title><meta name="author" content="DROM Entretenimento"></head><body>'+h+'</body></html>',"text/html","a.html").getAs("application/pdf").setName(nome);
  var corpo='<div style="font-family:Arial,sans-serif;color:#151515"><p>Olá, '+esc_(b.n)+'!</p><p>Recebemos suas respostas da <b>Avaliação Anual 2026 · DROM</b> (versão enviada em '+now+'). A cópia completa está no PDF anexo.</p><p><b>Esta é a versão mais recente: caso tenha recebido e-mails anteriores desta avaliação, desconsidere-os.</b></p><p>Você pode ajustar e reenviar até sexta-feira, 27/11, às 12h.</p><p>Obrigado!<br>DROM Entretenimento</p></div>';
  var sub=(b.teste?"[TESTE] ":"")+"DROM · Avaliação Anual 2026 · "+b.n+" · versão de "+now;
  try{MailApp.sendEmail({to:b.e,subject:sub,htmlBody:corpo,attachments:[pdf],name:"DROM Entretenimento",replyTo:DROM_MAIL})}catch(e){}
  MailApp.sendEmail({to:DROM_MAIL,subject:sub,htmlBody:corpo.replace("Olá, "+esc_(b.n)+"!","Cópia DROM · "+esc_(b.n)+" ("+esc_(b.e)+")"),attachments:[pdf],name:"DROM Entretenimento",replyTo:b.e})}
function esc_(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function doGet(e){var p=e.parameter,ss=sh_(),rd=ss.getSheetByName("Rascunhos"),dv=rd?rd.getDataRange().getValues():[];
  if(p.k){var T=JSON.parse(P_("TOKENS")||"{}");if(!T[p.k]||T[p.k]!==p.t)return out_({ok:false});var o={ok:true,clr:P_("CLR_"+p.k)||""};
    for(var j=1;j<dv.length;j++)if(dv[j][0]===p.k)o.d={ts:+dv[j][3]||0,a:JSON.parse(dv[j][4]||"{}")};
    var sv=ss.getSheetByName("Respostas").getDataRange().getValues();for(var i=1;i<sv.length;i++)if(sv[i][0]===p.k)o.em=sv[i][3];return out_(o)}
  if(!p.r||p.r!==P_("READ"))return out_({ok:false});
  var v=ss.getSheetByName("Respostas").getDataRange().getValues(),L=[],R=[];for(var j=1;j<dv.length;j++)R.push({k:dv[j][0],ts:+dv[j][3]||0,a:JSON.parse(dv[j][4]||"{}")});
  for(var i=1;i<v.length;i++)L.push({k:v[i][0],n:v[i][1],e:v[i][2],em:v[i][3],teste:v[i][4]==="sim",a:JSON.parse(v[i][5]||"{}"),st:JSON.parse(v[i][6]||"{}")});
  return out_({ok:true,L:L,R:R})}
/* rode uma vez pelo editor para autorizar planilha e e-mail */
function autorizar(){sh_();MailApp.getRemainingDailyQuota()}
