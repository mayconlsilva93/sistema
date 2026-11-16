// DROM · notificações push (GitHub Action). Uso: DROM_PIN=x node tools/notify.mjs maneira
import fs from "fs";import path from "path";import crypto from "crypto";import webpush from "web-push";import {createRequire} from "module";import {pull,hubSend,hubSubs} from "./subpull.mjs";
if(!process.env.DROM_PIN){console.error("Falta o segredo DROM_PIN (Settings → Secrets and variables → Actions).");process.exit(1)}
const require=createRequire(import.meta.url),app=process.argv[2],P=f=>path.join(app,f);
const {dromDiff,dromStart}=require(path.resolve(app,"diff.js"));
const D=JSON.parse(fs.readFileSync(P("d.json"))),salt=Buffer.from(D.salt,"base64");
const key=crypto.pbkdf2Sync(process.env.DROM_PIN,salt,200000,32,"sha256");
const dec=(iv,ct)=>{ct=Buffer.from(ct,"base64");const d=crypto.createDecipheriv("aes-256-gcm",key,Buffer.from(iv,"base64"));d.setAuthTag(ct.subarray(-16));return JSON.parse(Buffer.concat([d.update(ct.subarray(0,-16)),d.final()]).toString())};
const get=f=>fs.existsSync(P(f))?(x=>dec(x.iv,x.ct))(JSON.parse(fs.readFileSync(P(f)))):null;
const put=(f,o)=>{const iv=crypto.randomBytes(12),c=crypto.createCipheriv("aes-256-gcm",key,iv),ct=Buffer.concat([c.update(JSON.stringify(o)),c.final(),c.getAuthTag()]);fs.writeFileSync(P(f),JSON.stringify({iv:iv.toString("base64"),ct:ct.toString("base64")}))};
const B=2023,S=dec(D.iv,D.ct).S,st=get("st.json")||{},subs=get("subs.json")||[],vp=get("vp.json"),now=Date.now(),msgs=[];
const n0=subs.length;await pull(app,key,subs);if(subs.length!==n0)put("subs.json",subs);
if(st.S)dromDiff(st.S,S,B).forEach(x=>msgs.push({t:x.t,b:x.b}));
st.rem=st.rem||{};
const p2=n=>String(n).padStart(2,"0");
for(const s of S){const t=dromStart(s,B);if(!t)continue;const h=(t-now)/36e5,k=s[14];
  /* lembrete de 24 h no celular substituído por "Hoje tem show!" (agenda.mjs, 9h) */
}
/* comissão recebida: junta as comissões marcadas como pagas e envia 10 min depois da última marcação */
const MES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const brl=v=>"R$ "+Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2}).replace("R$ ","");
st.cq=st.cq||[];
if(st.S){const old=new Map(st.S.map(s=>[s[14],s]));for(const s of S){const o=old.get(s[14]);if(s[17]>0&&s[20]===1&&o&&o[20]!==1&&!st.cq.some(q=>q.k===s[14])){st.cq.push({k:s[14],v:s[17],m:s[19],d:s[0]});st.cqt=now}}}
if(st.cq.length&&now-(st.cqt||0)>=6e5){
  const ms=[...new Set(st.cq.map(q=>q.m))].sort((a,b)=>a-b);
  for(const m of ms){const Q=st.cq.filter(q=>q.m===m).sort((a,b)=>a.d-b.d),tot=Q.reduce((x,q)=>x+q.v,0),dt=q=>p2(q.d)+"/"+p2((m-1)%12+1);
    const all=S.filter(s=>s[19]===m&&s[17]>0),full=all.length===Q.length&&all.every(s=>s[20]===1&&Q.some(q=>q.k===s[14]));
    const ref=full?"ao mês de "+MES[(m-1)%12]+" de "+(B+Math.floor((m-1)/12)):Q.length===1?"ao show de "+dt(Q[0]):"a "+Q.length+" shows, realizados entre "+dt(Q[0])+" e "+dt(Q[Q.length-1]);
    msgs.push({keep:1,f:app,t:"Comissão recebida!",b:"Você pagou "+brl(tot)+", referente "+ref+". Muito obrigado!"})}
  st.cq=[];delete st.cqt}
const first=!st.S;st.S=S;
for(const k of Object.keys(st.rem))if(!S.some(s=>k.startsWith(s[14])))delete st.rem[k];
{const o=get("st.json");if(JSON.stringify(o)!==JSON.stringify(st))put("st.json",st)}
console.log((first?"estado inicial; ":"")+msgs.length+" mensagem(ns), "+subs.length+" inscrição(ões)");
const hs=await hubSubs(key);
if(first||!msgs.length||(!subs.length&&!hs.length)||!vp)process.exit(0);
webpush.setVapidDetails("https://instagram.com/dromentretenimento",vp.publicKey,vp.privateKey);
let alive=[];
for(const s of subs){let ok=true;
  for(const m of msgs.slice(0,10)){try{await webpush.sendNotification(s,JSON.stringify(m),{TTL:86400})}catch(e){if(e.statusCode===404||e.statusCode===410){ok=false;break}console.log("erro",e.statusCode||e.message)}}
  if(ok)alive.push(s)}
if(alive.length!==subs.length)put("subs.json",alive);
for(const m of msgs.slice(0,10))await hubSend(webpush,app,key,m);
