/* DROM · atualização ao vivo dos apps de artista (sem recarregar a página) */
(function(){
if(window.DROMRT)return;window.DROMRT=1;
var b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),last=null,busy=0;
function keyOf(el){var c=(el.className||"").split(" ").filter(x=>x&&x!=="open")[0];return el.tagName+(c?"."+c:"")}
function saveUI(){var a=[];document.querySelectorAll("#app .open,#app details[open]").forEach(el=>{var k=keyOf(el),l=[...document.querySelectorAll("#app "+k.replace(/^(\w+)/,"$1"))];a.push([k,l.indexOf(el),el.tagName==="DETAILS"])});return{a:a,y:scrollY}}
function loadUI(u){u.a.forEach(x=>{var el=document.querySelectorAll("#app "+x[0])[x[1]];if(!el)return;if(x[2])el.open=true;else el.classList.add("open")});scrollTo(0,u.y)}
function put(dst,src){if(Array.isArray(dst)&&Array.isArray(src))dst.splice(0,dst.length,...src)}
async function chk(){if(busy||!window.DROMKEY||!window.DROMDATA)return;busy=1;
 try{var r=await fetch("d.json?t="+Date.now(),{cache:"no-store"});if(!r.ok)return;var D=await r.json(),sig=D.iv+"|"+(D.up||"");
  if(last===null){last=sig;if((D.up||"")===(window.DROMUPD||""))return}
  if(sig===last)return;last=sig;
  var t=await crypto.subtle.decrypt({name:"AES-GCM",iv:b64(D.iv)},window.DROMKEY,b64(D.ct)),N=JSON.parse(new TextDecoder().decode(t)),DD=window.DROMDATA;
  var df=[];try{df=dromDiff(JSON.parse(JSON.stringify(DD.S||[])),N.S||[],2023)}catch(e){}
  var u=saveUI();["S","OT","CL","BK"].forEach(k=>{if(N[k]){if(Array.isArray(DD[k]))put(DD[k],N[k]);else DD[k]=N[k]}});
  Object.keys(N).forEach(k=>{if(!Array.isArray(N[k]))DD[k]=N[k]});
  window.DROMUPD=D.up||"";
  try{DM=S.map(s=>s[19]).concat(BK.map(z=>z[0]),OT.map(o=>o[0]));LO=Math.min.apply(null,DM);HI=Math.max.apply(null,DM);fms()}catch(e){}
  try{draw()}catch(e){}loadUI(u);
  var p=document.getElementById("dupd");if(p)p.textContent="Dados atualizados em "+window.DROMUPD;
  if(window.DROMNADD)window.DROMNADD(df)}
 catch(e){}finally{busy=0}}
window.DROMCHKNOW=chk;
document.addEventListener("visibilitychange",()=>{if(!document.hidden)chk()});
addEventListener("focus",chk);
setInterval(()=>{if(!document.hidden)chk()},180000);
if("serviceWorker" in navigator)navigator.serviceWorker.addEventListener("message",e=>{if(e.data&&e.data.drom==="push"){chk();setTimeout(chk,40000);setTimeout(chk,120000)}});
setTimeout(chk,1500);
})();
