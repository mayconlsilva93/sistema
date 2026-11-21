/* DROM Sync — planilha BASECLAUDE → GitHub (apps): confere a cada 1 min e só chama o GitHub se a planilha mudou.
   Projeto Apps Script SEPARADO do "DROM Notificações".
   Propriedades do script (Configurações do projeto → Propriedades do script):
     GH_TOKEN  = token do GitHub (fine-grained, só o repositório "sistema", permissão Actions: Read and write)
     SHEET_KEY = a mesma chave cadastrada no segredo SHEET_KEY do GitHub
   Depois de colar: rode a função "instalar" uma vez (autoriza e cria o gatilho de 1 min) e publique uma NOVA VERSÃO do app da web
   (Implantar → Gerenciar implantações → editar → Versão: Nova versão), porque o doGet mudou (manda também a coluna BB = ALTERAÇÃO). */
var SID = '1mVTNZVm44XGn5j7zB8EY6JorD5TpDRn4BvuOFwi2cq8';
var TABS = ['01-RAMONSTRO','02-BRINQUINHO','03-CARLOTO','04-SENA','05-CENOURA','06-LIQUINHO','07-MANEIRA','08-AMARO','09-JOSU','10-CADU VIEIRA'];
var WF = 'https://api.github.com/repos/mayconlsilva93/sistema/actions/workflows/sheet.yml/dispatches';
function P(k) { return PropertiesService.getScriptProperties().getProperty(k); }

/* GitHub busca aqui as linhas (valores como aparecem na planilha) */
function doGet(e) {
  if (!e || !e.parameter || e.parameter.k !== P('SHEET_KEY')) return out({err: 'chave'});
  var ss = SpreadsheetApp.openById(SID), r = {b2: ss.getSheetByName('CONTROLE').getRange('B2').getDisplayValue(), tabs: {}};
  TABS.forEach(function (t) {
    var sh = ss.getSheetByName(t); if (!sh) return;
    var n = sh.getLastRow(); if (n < 1) return;
    r.tabs[t] = sh.getRange(1, 1, n, 48).getDisplayValues().filter(function (v) { return /^\s*\d+\s*$/.test(v[0]); });
    /* BB (coluna 54, ALTERAÇÃO = carimbo da última edição da linha) por Nº, em "AAAA-MM-DDTHH:MM:SS": o Booker ordena as propostas por ela */
    if (sh.getMaxColumns() >= 54) {
      var A = sh.getRange(1, 1, n, 1).getValues(), BB = sh.getRange(1, 54, n, 1).getValues(), m = {};
      for (var i = 0; i < n; i++) if (/^\s*\d+\s*$/.test(String(A[i][0])) ) {
        var b = BB[i][0], x = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(String(b));
        if (b instanceof Date) m[String(+A[i][0])] = Utilities.formatDate(b, 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ss");
        else if (x) m[String(+A[i][0])] = x[3] + '-' + x[2] + '-' + x[1] + 'T' + ('0' + x[4]).slice(-2) + ':' + x[5] + ':' + (x[6] || '00');
      }
      (r.bb = r.bb || {})[t] = m;
    }
  });
  return out(r);
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* a cada 1 min: se a planilha mudou desde a última vez, chama o GitHub */
function verificar() {
  try { verificarDev(); } catch (x) { console.log('dev: ' + x); }
  var u = String(DriveApp.getFileById(SID).getLastUpdated().getTime()), pr = PropertiesService.getScriptProperties();
  if (pr.getProperty('ULT') === u) return;
  var r = UrlFetchApp.fetch(WF, {method: 'post', muteHttpExceptions: true, contentType: 'application/json',
    headers: {Authorization: 'Bearer ' + P('GH_TOKEN'), Accept: 'application/vnd.github+json'},
    payload: JSON.stringify({ref: 'main'})});
  if (r.getResponseCode() === 204) pr.setProperty('ULT', u); else console.log('GitHub ' + r.getResponseCode() + ': ' + r.getContentText());
}

/* planilha do Artista Teste: quando muda, roda o dev.yml (app de teste e Booker) */
var DEV = '1_FIaPSZjz7rr1QwDvC7jL6qCXu09Wh1ZsgTTdearxGs';
function verificarDev() {
  var u = String(DriveApp.getFileById(DEV).getLastUpdated().getTime()), pr = PropertiesService.getScriptProperties();
  if (pr.getProperty('ULTDEV') === u) return;
  var r = UrlFetchApp.fetch(WF.replace('sheet.yml', 'dev.yml'), {method: 'post', muteHttpExceptions: true, contentType: 'application/json',
    headers: {Authorization: 'Bearer ' + P('GH_TOKEN'), Accept: 'application/vnd.github+json'}, payload: JSON.stringify({ref: 'main'})});
  if (r.getResponseCode() === 204) pr.setProperty('ULTDEV', u); else console.log('GitHub dev ' + r.getResponseCode() + ': ' + r.getContentText());
}

/* rodar uma vez */
function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'verificar') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('verificar').timeBased().everyMinutes(1).create();
  SpreadsheetApp.openById(SID).getName(); DriveApp.getFileById(SID).getName();
  verificar();
}
