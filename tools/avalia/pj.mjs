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
const out={P,CT,CA,FIN,PC,up:pd.up||"",dia:now.toISOString().slice(0,10)},iv=crypto.randomBytes(12),ci=crypto.createCipheriv("aes-256-gcm",AK,iv);
const enc=Buffer.concat([ci.update(JSON.stringify(out)),ci.final(),ci.getAuthTag()]);
const f="pe2027/avaliaform26/pj.json";let old=null;try{old=JSON.parse(fs.readFileSync(f,"utf8"))}catch(e){}
if(old&&old.h===crypto.createHash("sha256").update(JSON.stringify(out)).digest("hex").slice(0,16)){console.log("sem mudança");process.exit(0)}
fs.writeFileSync(f,JSON.stringify({iv:iv.toString("base64"),ct:enc.toString("base64"),h:crypto.createHash("sha256").update(JSON.stringify(out)).digest("hex").slice(0,16)}));
console.log("pj.json",JSON.stringify(Object.fromEntries(Object.entries(P).map(([k,v])=>[k,Object.values(v).reduce((x,y)=>x+y,0)]))));
