/* DROM · Drive → GitHub (contratos PDF assinados e cadastros "Gestão e Propostas")
   Projeto do Apps Script próprio. Configuração: Propriedades do script → KEY = (mesmo valor do segredo DRIVE_KEY no GitHub).
   Implantar como "App da Web": executar como VOCÊ, acesso "Qualquer pessoa". A URL vai no segredo DRIVE_URL do GitHub.
   Só leitura no Drive. Sem a chave certa não devolve nada. */
var CADS={
 '1mwK96YV00hJhxkakXmm05kD-9G70gt_MbrsT6-C0aME':'Ramonstro','1WFNLEj2kj-DG5AJh1KmXC1HKcmqT9Ng4uTgp_tzKXic':'Carloto',
 '1aQHCJ3x0zQyM3HXH8dixSxzonzqmIncYKpCeZcPIHBA':'Sena','1nQ-VVeVJ7Wo-p90uaq_cCy8FKBn-tMIilykq6sws8sQ':'Cenoura',
 '1Uy_FTxYsXYIXWKChkJR2gK5LcodeOqbmBfqegBwyATU':'Maneira','1jHL-RMG7X0cw34VwBt851ghvRaIoLBSZtv6PwCdEask':'Amaro',
 '1nUbvXrtmzbRb5Ud-DlyfWW6atBGaJfzUaRtBG5a23Oo':'Josu','1s109Zq58asQUZ_dr8rzZNen1Og-ER7AeaP6EzPXdUPU':'Cadu Vieira',
 '1BOOFB3GzJh3KdF8-OL9LQklnR94WjSSOpRtcMf-BvIg':'Brinquinho','1WaHGhR66OIgVLS762ghUWC3XuEShRbRMUpEGCek1zF8':'Liquinho'};
var DEV='1_FIaPSZjz7rr1QwDvC7jL6qCXu09Wh1ZsgTTdearxGs';   /* planilha FALSA do Artista Teste (só para o app dev e o Booker dev; não entra no scan dos cadastros) */
function out(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function nm(it){return it.hasNext()?it.next():null}
function doGet(e){
  var p=(e&&e.parameter)||{},key=PropertiesService.getScriptProperties().getProperty('KEY');
  if(!key||p.key!==key)return out({err:'chave'});
  if(p.scan){
    var since=new Date(+p.since||Date.now()-11*3600e3),r={pdfs:[],cads:[],now:Date.now()};
    var it=DriveApp.searchFiles("title contains 'assinado' and mimeType = 'application/pdf' and modifiedDate > '"+since.toISOString()+"' and trashed = false");
    while(it.hasNext()){var f=it.next(),a=nm(f.getParents()),b=a&&nm(a.getParents()),c=b&&nm(b.getParents());
      r.pdfs.push({id:f.getId(),name:f.getName(),p:a?a.getName():'',g:b?b.getName():'',gg:c?c.getName():''})}
    Object.keys(CADS).forEach(function(id){try{if(DriveApp.getFileById(id).getLastUpdated()>since)r.cads.push({id:id,a:CADS[id]})}catch(x){}});
    return out(r)}
  if(p.dev){
    var d=UrlFetchApp.fetch('https://docs.google.com/spreadsheets/d/'+DEV+'/export?format=xlsx',{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()}}).getBlob().getBytes();
    return out({b64:Utilities.base64Encode(d)})}
  if(p.x){
    if(!CADS[p.x])return out({err:'id'});
    var b=UrlFetchApp.fetch('https://docs.google.com/spreadsheets/d/'+p.x+'/export?format=xlsx',{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()}}).getBlob().getBytes();
    return out({b64:Utilities.base64Encode(b)})}
  return out({ok:1})}
/* rode uma vez pelo editor (▶ teste) para autorizar o acesso ao Drive */
function teste(){Logger.log(doGet({parameter:{key:PropertiesService.getScriptProperties().getProperty('KEY'),scan:1,since:String(Date.now()-7*864e5)}}).getContent())}
