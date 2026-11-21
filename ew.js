/* DROM · escrita nas planilhas (cliente comum a todos os apps). Ver tools/escrita/escrita.gs e docs/INTEGRACAO.md.
   DROMW.cfg(urlDoW_json, chaveAES) -> Promise<{on, send(op,artista,dados), ler(artista)}>
   on=false quando a URL está vazia (escrita desligada: o app segue só local). */
(function(){
var b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),hx=b=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");
function rid(){var a=new Uint8Array(12);crypto.getRandomValues(a);return Array.from(a).map(x=>"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"[x&63]).join("")}
var sl=ms=>new Promise(ok=>setTimeout(ok,ms));
async function cfg(wurl,aes){
 var W;try{W=await (await fetch(wurl,{cache:"no-store"})).json()}catch(e){return{on:false}}
 if(!W||!W.url)return{on:false};
 var o=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:b64(W.iv)},aes,b64(W.ct))));
 var K=await crypto.subtle.importKey("raw",b64(o.k),{name:"HMAC",hash:"SHA-256"},false,["sign"]),U=W.url;
 async function env(op,a,d,id){var p=JSON.stringify(Object.assign({},d,{op:op,a:a,id:id,ts:Date.now()}));
  return{app:o.app,p:p,sig:hx(await crypto.subtle.sign("HMAC",K,new TextEncoder().encode(p)))}}
 async function st(id){for(var i=0;i<6;i++){await sl(i?4000:1500);try{var r=await (await fetch(U+(U.indexOf("?")<0?"?":"&")+"st="+id,{cache:"no-store"})).json();if(!r.pend)return r}catch(e){}}return{ok:0,err:"sem confirmação do servidor (confira mais tarde)",pend:1,id:id}}
 /* POST text/plain (sem preflight). O Apps Script responde com redirecionamento para googleusercontent, que libera CORS: a resposta é lida direto.
    Se a leitura falhar (rede, CORS), a mesma operação é conferida por GET ?st=id; o servidor ignora repetições do mesmo id. */
 async function send(op,a,d){var id=rid(),e=await env(op,a,d,id);
  try{var r=await fetch(U,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(e),redirect:"follow"});return await r.json()}
  catch(x){return st(id)}}
 return{on:true,a:o.a,url:U,send:send,ler:function(a){return send("ler",a,{})},status:st}}
window.DROMW={cfg:cfg}})();
