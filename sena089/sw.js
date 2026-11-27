/* DROM · Sena — cache offline + notificações push */
var C="drom-sena-v51";
self.addEventListener("install",e=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;
 e.respondWith(fetch(e.request.url.startsWith(self.location.origin)?new Request(e.request,{cache:"no-cache"}):e.request).then(r=>{if(r.ok){var c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
self.addEventListener("push",e=>{var d={};try{d=e.data.json()}catch(x){d={t:"DROM",b:e.data?e.data.text():""}}
 if(d.keep)e.waitUntil(caches.open("drom-push").then(c=>{var k="q"+self.registration.scope;return c.match(k).then(r=>r?r.json():[]).then(L=>{L.push({t:d.t,b:d.b,f:d.f,ts:Date.now()});return c.put(k,new Response(JSON.stringify(L.slice(-30))))})}));
 e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>l.forEach(c=>c.postMessage({drom:"push",t:d.t,b:d.b}))));
 if(d.close){e.waitUntil(self.registration.getNotifications({tag:d.close}).then(l=>l.forEach(n=>n.close())));return}
 e.waitUntil(self.registration.showNotification(d.t||"DROM",{body:d.b||"",icon:"icon-192.png",badge:"badge.png",tag:d.tag||undefined,data:{url:"./"}}).then(()=>self.registration.getNotifications()).then(l=>{l.sort((a,b)=>(a.timestamp||0)-(b.timestamp||0));l.slice(0,Math.max(0,l.length-10)).forEach(n=>n.close())}))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>{for(var c of l){if(c.url.includes(self.registration.scope))return c.focus()}return clients.openWindow("./?n=1")}))});
/* a inscrição foi trocada/expirada pelo navegador: inscreve de novo na hora, já registra no servidor (chave do app guardada no IndexedDB "drom")
   e avisa as janelas abertas (o app reenvia também na próxima abertura). */
var VAPID="BGH4ccixrVQN6Qmct71zljsKsyClz5k-Fk0dfzXhfWtIA7b_AAIwZjuWmCO-u8LVX0HswJ80GifqLCno7Wf04-k",SURL="https://script.google.com/macros/s/AKfycbzk5iksIZVvdK27taLTcpQbdPebxGjP7ilwNxiQDYwUuTSaMz80Hifmgr-5aazWhI0R/exec";
function u8(b){var p="=".repeat((4-b.length%4)%4),r=atob((b+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(r,c=>c.charCodeAt(0))}
function ikey(n){return new Promise(ok=>{try{var r=indexedDB.open("drom",1);r.onupgradeneeded=()=>r.result.createObjectStore("k");r.onsuccess=()=>{try{var q=r.result.transaction("k").objectStore("k").get(n);q.onsuccess=()=>ok(q.result&&q.result.key||null);q.onerror=()=>ok(null)}catch(e){ok(null)}};r.onerror=()=>ok(null)}catch(e){ok(null)}})}
self.addEventListener("pushsubscriptionchange",e=>{e.waitUntil((async()=>{try{
 var o=e.oldSubscription,k=(o&&o.options&&o.options.applicationServerKey)||u8(VAPID),s=e.newSubscription;
 if(!s)s=await self.registration.pushManager.getSubscription()||await self.registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:k});
 var K=await ikey("sena");if(K){var iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv:iv},K,new TextEncoder().encode(JSON.stringify(s)))),b6=u=>btoa(String.fromCharCode.apply(null,u));
  await fetch(SURL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain"},body:JSON.stringify({app:self.registration.scope.split("/").filter(Boolean).pop(),iv:b6(iv),ct:b6(ct)})})}
 (await clients.matchAll({type:"window",includeUncontrolled:true})).forEach(c=>c.postMessage({drom:"subchg"}))}catch(x){}})())});
