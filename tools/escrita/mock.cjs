// DROM · simulador local do escrita.gs (testes sem o Apps Script implantado).
// Uso: KEY=... node tools/escrita/mock.cjs [porta]   ·  GET /_dump mostra a planilha simulada · POST /_reset recarrega
// Roda o escrita.gs de verdade num vm, com SpreadsheetApp/Utilities/Cache/Lock falsos. Responde com CORS liberado (como o googleusercontent).
const fs=require("fs"),vm=require("vm"),http=require("http"),crypto=require("crypto"),path=require("path");
const SRC=fs.readFileSync(path.join(__dirname,"escrita.gs"),"utf8"),PORT=+process.argv[2]||8899;
const HD=["Nº","DATA DO SHOW (classificar)","DIA DA SEMANA","STATUS","LOCAL","EVENTO","CIDADE/UF","CATEGORIA","HORÁRIO DO EVENTO","","INÍCIO DO SHOW","DURAÇÃO","EQUIPAMENTO","OBSERVAÇÕES","RIDER HOSPITALIDADE","HOSPEDAGEM","PRODUÇÃO","CONTRATANTE","","VENDEDOR","DATA PROPOSTA","DATA APROVAÇÃO","VENCIMENTO SINAL","CACHÊ BRUTO","DESPESAS","CACHÊ LÍQUIDO","COMISSÃO","CONTRATO","NOTA FISCAL","CACHÊ RECEBIDO?","RECEBIDO POR","DATA RECEBIMENTO","STATUS            ARTISTA","STATUS COMISSÃO"];
const d=(s)=>{const[a,b,c]=s.split("/");return new Date(+c,b-1,+a,12)};
// planilha do Cadu: colunas extras e títulos diferentes (como a real); demais ids usam HD
const CADU="1s109Zq58asQUZ_dr8rzZNen1Og-ER7AeaP6EzPXdUPU";
const HDC=["Nº","DATA DO SHOW (classificar)","","MÊS","DIA DA SEMANA","STATUS","LOCAL","EVENTO","CIDADE/UF","CATEGORIA","HORÁRIO DO EVENTO","","CHEGADA / SAÍDA NO EVENTO","","INÍCIO DO SET","DURAÇÃO TOTAL","EQUIPAMENTO","OBSERVAÇÕES","RIDER HOSPITALIDADE","HOSPEDAGEM","PRODUÇÃO","CONTRATANTE","","VENDEDOR","DATA PROPOSTA","DATA APROVAÇÃO","VENCIMENTO SINAL","CACHÊ BRUTO","DESPESAS","CACHÊ LÍQUIDO","COMISSÃO","CONTRATO","NOTA FISCAL","CACHÊ RECEBIDO?","RECEBIDO POR","DATA RECEBIMENTO","STATUS            ARTISTA","STATUS COMISSÃO","COMISSÃO R$","PENDENTE ARTISTA","PENDENTE DROM","PAGO ARTISTA","PAGO DROM","MÊS+ANO +REALIZADO"];
const KEYH=h=>(h||"").replace(/\s+/g," ").replace("INÍCIO DO SET","INÍCIO DO SHOW").replace("DURAÇÃO TOTAL","DURAÇÃO");
function fresh(hd){hd=hd||HD;const G={};const set=(r,c,v,f)=>{G[r+","+c]={v,f:f||"",n:""}};
 hd.forEach((h,i)=>set(4,i+1,h));
 const R=[[1,d("11/01/2026"),"=WEEKDAY","Show realizado","Bunker 22","Fantástica Fábrica","Florianópolis/SC","Casa noturna","23:00","5:00","0:00","1:00","XDJ","","Combo","Não","","Bianca Lima","(41) 99393-8711","Maycon",d("01/01/2026"),d("03/01/2026"),"",650,120,"=LIQ",0.2,"Não","Não","Pago","Artista",d("13/01/2026"),"Pago","Pago"],
  [2,d("08/02/2026"),"=WEEKDAY","Show confirmado","Bunker 22","Fantástica Fábrica","Florianópolis/SC","Casa noturna","23:00","5:00","0:00","1:00","XDJ","","Combo","Não","","Bianca Lima","(41) 99393-8711","Maycon",d("02/01/2026"),d("08/01/2026"),"",650,"","=LIQ",0.2,"Não","Não","Pendente","","","Pendente","Pendente"],
  [3,d("17/02/2026"),"=WEEKDAY","Show confirmado","Downtown","Sexta Insana","Blumenau/SC","Casa noturna","23:00","5:00","2:00","2:00","Controladora","","2 consumações","Não","","Letícia Prado","(48) 98241-8387","Maycon",d("12/01/2026"),d("15/01/2026"),"",1050,120,"=LIQ",0.2,"Não","Não","Pendente","","","Pendente","Pendente"]];
 const pos=hd.map((h,i)=>{if(h)return HD.findIndex(x=>x&&KEYH(x)===KEYH(h));const p=hd[i-1];const k=p?HD.findIndex(x=>x&&KEYH(x)===KEYH(p)):-1;return k>=0&&!HD[k+1]?k+1:-1});
 R.forEach((r,i)=>hd.forEach((h,j)=>{const k=pos[j];if(k<0)return;const v=r[k];typeof v==="string"&&v[0]==="="?set(5+i,j+1,"(f)",v):set(5+i,j+1,v)}));return G}
const GS={};const grid=id=>GS[id]||(GS[id]=fresh(id===CADU?HDC:HD));let G=grid("1_FIaPSZjz7rr1QwDvC7jL6qCXu09Wh1ZsgTTdearxGs"),TRIG=[];
const cell=(r,c)=>G[r+","+c]||(G[r+","+c]={v:"",f:"",n:""});
function lastRow(){let m=0;for(const k in G){const[r]=k.split(",").map(Number);if(G[k].v!==""||G[k].f)m=Math.max(m,r)}return m}
function lastCol(){let m=0;for(const k in G){const[,c]=k.split(",").map(Number);if(G[k].v!==""||G[k].f)m=Math.max(m,c)}return m}
function Range(r,c,nr=1,nc=1){const it=f=>{for(let i=0;i<nr;i++)for(let j=0;j<nc;j++)f(cell(r+i,c+j),i,j)};const grid=g=>Array.from({length:nr},(_,i)=>Array.from({length:nc},(_,j)=>g(cell(r+i,c+j))));
 const o={getValue:()=>cell(r,c).v,getValues:()=>grid(x=>x.v),getFormula:()=>cell(r,c).f,getNotes:()=>grid(x=>x.n),getDisplayValues:()=>grid(x=>x.v instanceof Date?pad(x.v.getDate())+"/"+pad(x.v.getMonth()+1)+"/"+x.v.getFullYear():String(x.v)),getFormulas:()=>grid(x=>x.f),
  setValue:v=>{it(x=>{x.v=v;x.f=""});return o},setValues:V=>{it((x,i,j)=>{x.v=V[i][j];x.f=""});return o},setNote:t=>{it(x=>x.n=t);return o},
  setNumberFormat:()=>o,clearContent:()=>{it(x=>{x.v="";x.f=""});return o},clearNote:()=>{it(x=>x.n="");return o},
  copyTo:dst=>{it((x,i,j)=>{const y=cell(dst._r+i,dst._c+j);y.v=x.v;y.f=x.f;y.n=x.n})},getRow:()=>r,getLastRow:()=>r+nr-1,getColumn:()=>c,getLastColumn:()=>c+nc-1,getSheet:()=>SH,_r:r,_c:c};return o}
const SH={getName:()=>"PROPOSTAS",getLastRow:lastRow,getLastColumn:lastCol,getRange:(r,c,nr,nc)=>Range(r,c,nr,nc)};
const IDS=["1_FIaPSZjz7rr1QwDvC7jL6qCXu09Wh1ZsgTTdearxGs","1mwK96YV00hJhxkakXmm05kD-9G70gt_MbrsT6-C0aME","1WFNLEj2kj-DG5AJh1KmXC1HKcmqT9Ng4uTgp_tzKXic","1aQHCJ3x0zQyM3HXH8dixSxzonzqmIncYKpCeZcPIHBA","1nQ-VVeVJ7Wo-p90uaq_cCy8FKBn-tMIilykq6sws8sQ","1Uy_FTxYsXYIXWKChkJR2gK5LcodeOqbmBfqegBwyATU","1jHL-RMG7X0cw34VwBt851ghvRaIoLBSZtv6PwCdEask","1nUbvXrtmzbRb5Ud-DlyfWW6atBGaJfzUaRtBG5a23Oo",CADU,"1BOOFB3GzJh3KdF8-OL9LQklnR94WjSSOpRtcMf-BvIg","1WaHGhR66OIgVLS762ghUWC3XuEShRbRMUpEGCek1zF8"];
let CUR="";
const CACHE={},hm=(v,k)=>Array.from(crypto.createHmac("sha256",Buffer.from(k.map?k.map(x=>x&255):k)).update(Buffer.from(v.map(x=>x&255))).digest()).map(x=>x>127?x-256:x);
const pad=n=>String(n).padStart(2,"0");
const ctx={JSON,Math,Date,String,Number,Object,Array,isNaN,RegExp,Error,
 ContentService:{MimeType:{JSON:"json"},createTextOutput:t=>({setMimeType:()=>({_t:t})})},
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==="KEY"?process.env.KEY:(process.env[k]||null),setProperty:(k,v)=>{process.env[k]=v}})},
 Utilities:{newBlob:s=>({getBytes:()=>Array.from(Buffer.from(s,"utf8")).map(x=>x>127?x-256:x)}),computeHmacSha256Signature:hm,
  formatDate:(dt,tz,f)=>f.replace("dd",pad(dt.getDate())).replace("MM",pad(dt.getMonth()+1)).replace("yyyy",dt.getFullYear()).replace("HH",pad(dt.getHours())).replace("mm",pad(dt.getMinutes()))},
 CacheService:{getScriptCache:()=>({get:k=>CACHE[k]||null,put:(k,v)=>{CACHE[k]=v}})},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
 SpreadsheetApp:{openById:id=>{if(!IDS.includes(id))throw new Error("sem acesso");G=grid(id);CUR=id;return{getSheetByName:n=>n==="PROPOSTAS"?SH:null,getActiveSheet:()=>SH,getName:()=>"planilha "+id.slice(0,6)}},flush:()=>{}},
 ScriptApp:{getProjectTriggers:()=>TRIG,deleteTrigger:t=>{TRIG=TRIG.filter(x=>x!==t)},newTrigger:h=>({forSpreadsheet:id=>({onEdit:()=>({create:()=>TRIG.push({h,id,getHandlerFunction:()=>h})})}),timeBased:()=>({everyHours:n=>({create:()=>TRIG.push({h,every:n,getHandlerFunction:()=>h})})})})},
 Logger:{log:x=>console.log("[gs]",x)}};
vm.createContext(ctx);vm.runInContext(SRC,ctx);
function dump(id){if(id)G=grid(id);const hd=id===CADU?HDC:HD;const L=lastRow(),out=[];for(let r=4;r<=L;r++){const o={};hd.forEach((h,i)=>{const x=cell(r,i+1);o[(h||hd[i-1]+">1").replace(/\s+/g," ")]=x.v instanceof Date?x.v.toISOString().slice(0,10):x.v;if(x.n)o["nota:"+h]=x.n});const t=cell(r,54).v;o.BB=t instanceof Date?t.toISOString():t;out.push(o)}return out}
ctx.__test={dump,G:()=>G,cell,TRIG:()=>TRIG,grid,SH,CADU,IDS};module.exports=ctx;
if(require.main===module)http.createServer((q,s)=>{let b="";q.on("data",c=>b+=c);q.on("end",()=>{const H={"Access-Control-Allow-Origin":"*","Content-Type":"application/json"};
  if(q.method==="OPTIONS"){s.writeHead(405,H);return s.end()}   // o Apps Script não responde preflight: o cliente não pode precisar dele
  const u=new URL(q.url,"http://x");if(u.pathname==="/_dump"){s.writeHead(200,H);return s.end(JSON.stringify(dump(u.searchParams.get("id")||IDS[0]),null,1))}
  if(u.pathname==="/_reset"){for(const k in GS)delete GS[k];G=grid(IDS[0]);for(const k in CACHE)delete CACHE[k];s.writeHead(200,H);return s.end("{}")}
  if(q.method==="POST"&&!/^text\/plain/.test(q.headers["content-type"]||"")){s.writeHead(400,H);return s.end('{"err":"content-type"}')}
  const r=q.method==="POST"?ctx.doPost({postData:{contents:b}}):ctx.doGet({parameter:Object.fromEntries(u.searchParams)});s.writeHead(200,H);s.end(r._t)})}).listen(PORT,()=>console.log("mock escrita em http://localhost:"+PORT));
