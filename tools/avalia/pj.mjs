// DROM · AvaliaForm26 · projeção de shows de 2026 por artista, calculada com o MESMO código do Painel (painel/s4.js, bloco /*PRJ*/ até PJmon)
// Gera pe2027/avaliaform26/pj.json cifrado com a chave dos apps (PIN), para o formulário mostrar exatamente o "Realizados + Projetado" do Painel.
// Uso: DROM_BKK=... DROM_PIN=... node tools/avalia/pj.mjs
import fs from "fs";import vm from "vm";import crypto from "crypto";
const b64=s=>Buffer.from(s,"base64");
const pd=JSON.parse(fs.readFileSync("painel/pd.json","utf8"));
const dk=crypto.createDecipheriv("aes-256-gcm",b64(process.env.DROM_BKK),b64(pd.iv));const ct=b64(pd.ct);dk.setAuthTag(ct.subarray(ct.length-16));
const D=JSON.parse(Buffer.concat([dk.update(ct.subarray(0,ct.length-16)),dk.final()]).toString("utf8"));
const ctx={window:{},console};ctx.window.window=ctx.window;vm.createContext(ctx);vm.runInContext(D["data.js"],ctx);
const DD=ctx.window.DROMDATA;if(!DD||!DD.ALL)throw new Error("DROMDATA sem ALL: "+Object.keys(ctx.window));
const s4=fs.readFileSync("painel/s4.js","utf8"),a=s4.indexOf("/*PRJ"),b=s4.indexOf("function PJleg");if(a<0||b<a)throw new Error("bloco PRJ não encontrado");
const C={Math,Date,Object,Number,JSON,ALL:DD.ALL,OTP:DD.OTP||[],B:2023,NOW:new Date(Date.now()-216e5)};C.YF=m=>2023+Math.floor((m-1)/12);vm.createContext(C);
vm.runInContext(s4.slice(a,b)+";this.PJmon=PJmon;this.PJpc=PJpc;",C);
const AR=["Ramonstro","Carloto","Sena","Cenoura","Maneira","Amaro","Josu","Cadu Vieira","Brinquinho","Liquinho"],
 FD={Ramonstro:"ramonstro003",Carloto:"carloto453",Sena:"sena089",Cenoura:"cenoura173",Maneira:"maneira038",Amaro:"amaro095",Josu:"josu185","Cadu Vieira":"caduvieira089",Brinquinho:"brinquinho131",Liquinho:"liquinho000"};
const now=C.NOW,cmk=(now.getFullYear()-2023)*12+now.getMonth()+1,Y=2026,P={};
const CT={};DD.ALL.forEach(r=>{const f=FD[AR[r[1]]];if(!f||r[14]<=(Y-2023)*12||r[14]>(Y-2023)*12+12)return;const k=r[14]+"|"+r[0]+"|"+r[3];(CT[f]=CT[f]||{})[k]=(CT[f][k]&&CT[f][k]!==r[16])?"?":r[16];CT[f][k+"|"+String(r[2]||"").split(" · ")[0].trim().toLowerCase()]=r[16]});
AR.forEach((n,i)=>{const o={};for(let mk=(Y-2023)*12+1;mk<=(Y-2023)*12+12;mk++){if(mk<cmk)continue;const r=C.PJmon(i,mk);if(r&&r.n)o[mk]=r.n}P[FD[n]]=o});
const salt=JSON.parse(fs.readFileSync("maneira038/d.json","utf8")).salt,AK=crypto.pbkdf2Sync(process.env.DROM_PIN,b64(salt),200000,32,"sha256");
const cai=s4.indexOf("var CA={"),cae=s4.indexOf("},cu0=",cai);if(cai<0||cae<0)throw new Error("mapa CA não encontrado");const CA=JSON.parse(s4.slice(cai+7,cae+1));
/* financeiro 2026 como o Painel: realizados+confirmados + custos pendentes estimados (PJpc) + shows projetados (PJmon) */
const FIN={},PC={},m0=(Y-2023)*12;AR.forEach((n,i)=>{const f=FD[n],L=DD.ALL.filter(r=>r[1]===i&&r[14]>m0&&r[14]<=m0+12);let fat=0,cu=0,com=0,ecu=0,ecom=0,pf=0,pcu=0,pco=0,pn=0;
 L.forEach(r=>{fat+=+r[6]||0;cu+=+r[7]||0;com+=+r[8]||0;const p=C.PJpc(r);if(p&&(p.cu||p.com)){ecu+=p.cu;ecom+=p.com;(PC[f]=PC[f]||{})[r[14]+"|"+r[0]+"|"+r[3]+"|"+String(r[2]||"").split(" · ")[0].trim().toLowerCase()]=Math.round(((+r[8]||0)-p.com)*100)/100}});
 for(let mk=m0+1;mk<=m0+12;mk++){if(mk<cmk)continue;const r=C.PJmon(i,mk);if(r&&r.n){pn+=r.n;pf+=r.fat;pcu+=r.cu;pco+=r.com}}
 const R=x=>Math.round(x*100)/100;FIN[f]={fat:R(fat),cu:R(cu),com:R(com),ecu:R(ecu),ecom:R(ecom),pn,pf:R(pf),pcu:R(pcu),pco:R(pco)}});
const CK={};AR.forEach((n,i)=>{const L=DD.ALL.filter(r=>r[1]===i&&r[14]>m0&&r[14]<=m0+12);CK[FD[n]]={n:L.length,fat:Math.round(L.reduce((a,r)=>a+(+r[6]||0),0)),com:Math.round(L.reduce((a,r)=>a+(+r[8]||0),0)),cu:Math.round(L.reduce((a,r)=>a+(+r[7]||0),0))}});console.log("CK",JSON.stringify(CK));
/* ===== saída: tudo determinístico (só muda quando o conteúdo muda) =====
   pj.json   → só o hub (chave do Painel, DROM_BKK)
   adm.json  → só o hub (chave do Painel): chave dos apps, códigos, tokens, chave de leitura
   a.json    → config de cada artista, cifrada com login+código dele (sem a chave dos apps)
   data/<login>.json → shows e números SÓ daquele artista, cifrados com a chave própria dele */
const BK=b64(process.env.DROM_BKK),hm=m=>crypto.createHmac("sha256",BK).update(m).digest(),sha=t=>crypto.createHash("sha256").update(t).digest();
const ABC="abcdefghjkmnpqrstuvwxyz23456789",code=k=>k==="teste"?"123321":[...hm("av26c:"+k)].slice(0,6).map(x=>ABC[x%31]).join(""),tok=k=>hm("av26t:"+k).toString("base64url").slice(0,24),RK=hm("av26r").toString("base64url").slice(0,32);
function enc(key,obj,tag){const t=JSON.stringify(obj),iv=sha(tag+"|"+t).subarray(0,12),c=crypto.createCipheriv("aes-256-gcm",key,iv);return{iv:iv.toString("base64"),ct:Buffer.concat([c.update(t),c.final(),c.getAuthTag()]).toString("base64")}}
function decf(key,f){const j=JSON.parse(fs.readFileSync(f,"utf8")),c=b64(j.ct),d=crypto.createDecipheriv("aes-256-gcm",key,b64(j.iv));d.setAuthTag(c.subarray(c.length-16));return{o:JSON.parse(Buffer.concat([d.update(c.subarray(0,c.length-16)),d.final()]).toString("utf8")),up:j.up||""}}
const DIR="pe2027/avaliaform26/";fs.mkdirSync(DIR+"data",{recursive:true});
const ART=[["amaro","amaro095","Amaro"],["caduvieira","caduvieira089","Cadu Vieira"],["carloto","carloto453","Carloto"],["cenoura","cenoura173","Cenoura"],["josu","josu185","Josu"],["maneira","maneira038","Maneira"],["ramonstro","ramonstro003","Ramonstro"],["sena","sena089","Sena"],["teste","sena089","Artista Teste"]];
const AJ={},L=[],TOK={};
ART.forEach(([k,f,n])=>{const Kd=hm("av26k:"+k),dj=decf(AK,f+"/d.json");
 fs.writeFileSync(DIR+"data/"+k+".json",JSON.stringify(enc(Kd,{S:dj.o.S||[],up:dj.up,X:{P:P[f]||{},CT:CT[f]||{},CA,FIN:FIN[f]||null,PC:PC[f]||{}}},"d"+k)));
 const salt=hm("salt:"+k).subarray(0,16),key=crypto.pbkdf2Sync(k+"\n"+code(k),salt,200000,32,"sha256");
 AJ[k]=Object.assign({salt:salt.toString("base64")},enc(key,{f,n,K:Kd.toString("base64"),t:tok(k),fem:k==="maneira",teste:k==="teste"},"a"+k));
 TOK[k]=tok(k);L.push({k,f,n,c:code(k),teste:k==="teste"})});
fs.writeFileSync(DIR+"a.json",JSON.stringify(AJ));
fs.writeFileSync(DIR+"adm.json",JSON.stringify(enc(BK,{ak:AK.toString("base64"),rk:RK,L,tok:TOK},"adm")));
fs.writeFileSync(DIR+"pj.json",JSON.stringify(enc(BK,{P,CT,CA,FIN,PC,up:pd.up||""},"pj")));
console.log("ok",ART.length,"artistas");
