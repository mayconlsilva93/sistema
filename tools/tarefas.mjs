// DROM · Tarefas (push). Roda na Action notify.yml a cada 10 min, separado do notify.mjs (falha aqui não afeta as outras notificações).
// Tarefas criadas no Hub ficam no Apps Script (app "tarefas"); "Já enviei" em "tarok". Estado dos envios: tools/tarst.json.
// Lembretes (padrão, editável por tarefa no Hub): push quando a tarefa é criada; push às rem.h (9h) no dia do prazo e nos dias de atraso (até 3);
// de hora em hora nas rem.f (2) horas finais e depois de vencer (8h–22h, até 24 h após o prazo).
// Custos do mês: só se cfg.custos (chave no Hub, desligada por padrão).
// Uso: DROM_PIN=x node tools/tarefas.mjs   (DRY=1 só mostra)
import fs from "fs";import path from "path";import crypto from "crypto";import webpush from "web-push";import {createRequire} from "module";import {pull,hubSend,hubSubs} from "./subpull.mjs";
if(!process.env.DROM_PIN){console.error("Falta DROM_PIN");process.exit(1)}
const URL=process.env.TARURL||fs.readFileSync("tools/suburl.txt","utf8").trim(),H=36e5,now=Date.now(),B=2023,DRY=!!process.env.DRY;
const APPS=fs.readdirSync(".").filter(f=>fs.existsSync(path.join(f,"d.json"))&&fs.existsSync(path.join(f,"vp.json")));
if(!APPS.length)process.exit(0);
const KEYS={};const keyOf=a=>{const s=JSON.parse(fs.readFileSync(path.join(a,"d.json"))).salt;return KEYS[s]||(KEYS[s]=crypto.pbkdf2Sync(process.env.DROM_PIN,Buffer.from(s,"base64"),200000,32,"sha256"))};
const dec=(key,iv,ct)=>{ct=Buffer.from(ct,"base64");const d=crypto.createDecipheriv("aes-256-gcm",key,Buffer.from(iv,"base64"));d.setAuthTag(ct.subarray(-16));return JSON.parse(Buffer.concat([d.update(ct.subarray(0,-16)),d.final()]).toString())};
const key=keyOf(APPS[0]);
async function list(app){try{const r=await fetch(URL+"?app="+app);const l=await r.json(),o=[];for(const x of l){try{o.push(dec(key,x.iv,x.ct))}catch(e){}}return o}catch(e){console.log("tarefas: falha",app,e.message);return null}}
const A=await list("tarefas"),OK=await list("tarok");
if(!A||!OK){console.log("tarefas: Apps Script indisponível");process.exit(0)}
const cur=A.filter(x=>x&&x.ts).sort((a,b)=>b.ts-a.ts)[0]||{T:[],cfg:{}};
const SF="tools/tarst.json";let ST={};try{ST=JSON.parse(fs.readFileSync(SF))}catch(e){}ST.s=ST.s||{};ST.ok=ST.ok||[];
const TN={eq:"Envio de equipe",vc:"Vídeo de chamada",cm:"Custos do mês"},MS=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const p2=n=>String(n).padStart(2,"0"),fdt=t=>{const d=new Date(t);return p2(d.getDate())+"/"+p2(d.getMonth()+1)+(d.getHours()===23&&d.getMinutes()===59?"":" "+p2(d.getHours())+":"+p2(d.getMinutes()))};
const dk=t=>{const d=new Date(t);return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())};
const done=(id,f)=>OK.some(x=>x.id===id&&x.f===f);
/* tarefas por artista */
const J=[];
for(const t of cur.T||[]){if(t.x)continue;for(const f of t.to||[])if(APPS.includes(f))J.push({t,f})}
if(cur.cfg&&cur.cfg.custos){const n=new Date(),m=(n.getFullYear()-B)*12+n.getMonth()+1,pm=m-1;
  if(n.getDate()<=10)for(const f of APPS){try{const S=dec(keyOf(f),JSON.parse(fs.readFileSync(path.join(f,"d.json"))).iv,JSON.parse(fs.readFileSync(path.join(f,"d.json"))).ct).S||[];
    if(S.some(s=>s[19]===pm))J.push({f,t:{id:"cm-"+pm,k:"cm",ev:"",tx:"Shows de "+MS[(pm-1)%12]+" finalizados! Você deve informar os custos até 07/"+p2(n.getMonth()+1)+" dentro do aplicativo ou em seu grupo financeiro.",due:new Date(n.getFullYear(),n.getMonth(),7,23,59).getTime(),rem:{h:9,f:2},cr:new Date(n.getFullYear(),n.getMonth(),1,9).getTime()}})}catch(e){}}}
const out={}; // f -> [msg]
for(const {t,f} of J){if(done(t.id,f))continue;const sk=t.id+"|"+f,s=ST.s[sk]=ST.s[sk]||{},r=t.rem||{},ph=r.h==null?9:r.h,fh=r.f==null?2:r.f,hr=new Date().getHours();let why=null;
  if(!s.n){if(now>=(t.cr||0))why="nova"}
  else if(now>=t.due-fh*H&&now<=t.due+24*H&&hr>=8&&hr<=22&&now-(s.h||0)>=55*60e3&&now-(s.n||0)>=55*60e3)why="hora";
  else if(hr>=ph&&dk(now)!==s.d&&now>=new Date(new Date(t.due).setHours(0,0,0,0)).getTime()&&now<=t.due+3*24*H&&now-(s.h||0)>=55*60e3)why="dia";
  if(!why)continue;
  const late=now>t.due,b=(t.ev?t.ev+" · ":"")+(late?"Prazo vencido: ":"Prazo: ")+fdt(t.due)+"\n"+t.tx;
  (out[f]=out[f]||[]).push({t:TN[t.k]||"Pendência",b:b.length>230?b.slice(0,227)+"…":b,tag:"tar-"+t.id,keep:1,f});
  if(why==="nova")s.n=now;else s.h=now;s.d=dk(now)}
/* "Já enviei" → aviso no Hub */
const hubOk=[];for(const x of OK){const k=x.id+"|"+x.f;if(ST.ok.includes(k))continue;ST.ok.push(k);const t=(cur.T||[]).find(y=>y.id===x.id)||(String(x.id).startsWith("cm-")?{k:"cm",ev:""}:null);if(t&&APPS.includes(x.f))hubOk.push({f:x.f,m:{t:(TN[t.k]||"Pendência")+" ✓",b:"Já enviei"+(t.ev?" · "+t.ev:""),tag:"tar-"+x.id}})}
ST.ok=ST.ok.slice(-500);
/* limpa estado de tarefas que não existem mais */
for(const k of Object.keys(ST.s)){const id=k.split("|")[0];if(!J.some(j=>j.t.id===id))delete ST.s[k]}
const n=Object.values(out).reduce((a,l)=>a+l.length,0);
console.log("tarefas: "+J.length+" pendência(s) ativas, "+n+" push, "+hubOk.length+" concluída(s) nova(s)");
if(DRY){console.log(JSON.stringify(out,null,1),JSON.stringify(hubOk));process.exit(0)}
if(n||hubOk.length){
  for(const f of new Set(Object.keys(out).concat(hubOk.map(x=>x.f)))){const k=keyOf(f),P=x=>path.join(f,x);
    const get=x=>fs.existsSync(P(x))?(y=>dec(k,y.iv,y.ct))(JSON.parse(fs.readFileSync(P(x)))):null;
    const vp=get("vp.json");if(!vp)continue;webpush.setVapidDetails("https://instagram.com/dromentretenimento",vp.publicKey,vp.privateKey);
    const subs=get("subs.json")||[];await pull(f,k,subs);
    for(const m of out[f]||[]){for(const sb of subs){try{await webpush.sendNotification(sb,JSON.stringify(m),{TTL:12*3600,urgency:"high"})}catch(e){console.log("erro",e.statusCode||e.message)}}
      await hubSend(webpush,f,k,{t:m.t,b:m.b,tag:m.tag},{TTL:12*3600})}
    for(const x of hubOk.filter(x=>x.f===f))await hubSend(webpush,f,k,x.m,{TTL:12*3600})}}
fs.writeFileSync(SF,JSON.stringify(ST));
