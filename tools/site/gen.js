// Gera ../src/agenda.json e ../src/stats.json a partir do data.js do Painel Geral.
// Regras = mesmas da agenda semanal (weeks.js + exceções do agenda.py). Janela: hoje -> último dia do mês seguinte.
// Uso: node agenda.js [AAAA-MM-DD]
const _a=process.argv.slice(2);global.window={};require(require('path').resolve(_a[0]||'./data.js'));const ALL=window.DROMDATA.ALL;
const AR=["Ramonstro","Carloto","Sena","Cenoura","Maneira","Amaro","Josu","Cadu Vieira","Brinquinho","Liquinho"];
const SLUG=["ramonstro","carloto","sena","cenoura","maneira","amaro","josu","cadu-vieira",null,null]; // só casting atual
const PRIV={P:"Evento particular",W:"Casamento",A:"Aniversário"};
const today=_a[2]?new Date(_a[2]+"T12:00:00"):new Date(new Date().toLocaleString('en-US',{timeZone:'America/Sao_Paulo'}));const OUT=_a[1]||require('path').join(__dirname,'../src');
const Y=today.getFullYear(),M=today.getMonth()+1,D0=today.getDate();
const idx=(y,m)=>(y-2023)*12+m;const I0=idx(Y,M),I1=I0+1;
const nz=x=>String(x||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
const key=x=>nz(x).replace(/[^a-z0-9]+/g," ").trim();
const clean=e=>e.replace(/\s*\(label própria\)/i,"").replace(/\s*\(OMITIR NA AGENDA\)/i,"").trim();
const tk=s=>{const m=/^(\d\d):(\d\d)/.exec(s[4]);return m?(+m[1]<6?+m[1]+24:+m[1])*60+ +m[2]:9999};
function priv(x){const n=nz(x);if(/baile de formatura/.test(n))return"";if(/jantar.*formatura/.test(n))return"Jantar de Formatura";if(/casamento|bodas/.test(n))return"Casamento";
 if(/aniversario|\b15 anos\b/.test(n))return/\b15 anos\b/.test(n)?"Aniversário 15 Anos":"Aniversário";if(/\bformatura\b/.test(n))return"Formatura";return""}
function parts(s){let ev=s[21]||"",c=s[2]||"",loc=ev?(c!==ev?c.slice(0,c.length-ev.length-3):""):c;const pv=priv(c+" "+ev);if(pv){ev=pv;loc=""}
 if(!ev&&!loc)loc="Local não informado";let ci=s[3]||"";if(ci&&ci.indexOf("/")<0&&ci!=="Cidade não informada")ci+="/SC";return{ev,loc,ci}}
const yr=r=>2023+Math.floor((r[14]-1)/12);
const COM={},REV={};ALL.forEach(r=>{const k=yr(r)+'|'+r[1];COM[k]=(COM[k]||0)+(+r[8]||0);REV[k]=(REV[k]||0)+(+r[6]||0)});
const cm=L=>Math.max(...L.map(s=>COM[yr(s)+'|'+s[1]]||0)),RV=L=>Math.max(...L.map(s=>REV[yr(s)+'|'+s[1]]||0));
const KM={"Florianópolis":0,"São José":12,"Palhoça":20,"Biguaçu":25,"Santo Amaro da Imperatriz":35,"Antônio Carlos":35,"Águas Mornas":45,"Governador Celso Ramos":45,"São João Batista":55,"Rancho Queimado":70,"Itapema":70,"Camboriú":75,"Balneário Camboriú":80,"Imbituba":90,"Itajaí":90,"Brusque":95,"Balneário Piçarras":100,"Laguna":115,"Gaspar":115,"Luiz Alves":130,"Capivari de Baixo":130,"Indaial":135,"Blumenau":140,"Tubarão":125,"Braço do Norte":150,"São Ludgero":160,"Urubici":170,"Joinville":180,"Presidente Getúlio":185,"Rio do Sul":190,"Criciúma":190,"Meleiro":205,"Içara":200,"Forquilhinha":205,"Siderópolis":210,"Nova Veneza":215,"Lages":220,"São Joaquim":220,"Araranguá":230,"Curitibanos":270,"Mafra":280,"Papanduva":280,"Monte Castelo":290,"Curitiba/PR":300,"Porto União":380,"União da Vitória/PR":385,"Joaçaba":390,"Concórdia":480,"Chapecó":560,"Guarapuava/PR":560,"Caxias do Sul/RS":570,"Pato Branco/PR":640,"Pelotas/RS":640,"Erechim/RS":650,"São Miguel do Oeste":690,"Itapiranga":690,"São José do Cedro":740,"Dionísio Cerqueira":770,"Barracão/PR":770,"Maringá/PR":840,"Santa Maria/RS":850,"Itaara/RS":860,"Astorga/PR":890,"Cianorte/PR":900,"Paranavaí/PR":970,"São Luiz Gonzaga/RS":1000,"Campo Grande/MS":1400};
const KMF=60;// distâncias: as cidades fora de SC pesam como longe (mesma regra do motion)
function orderT(rows){const days={};rows.forEach(s=>(days[s[14]*100+s[0]]??=[]).push(s));
 return Object.keys(days).map(Number).sort((a,b)=>a-b).flatMap(k=>{const G={};
  days[k].forEach(s=>{const q=parts(s);(G[key(q.loc!=="Local não informado"?q.loc:q.ev)+"|"+key(s[3])]??=[]).push(s)});
  return Object.values(G).map(L=>{let km=KM[L[0][3]];if(km===undefined)km=(L[0][3]||"").indexOf("/")>0?500:KMF;
   const ag=L.some(s=>/drom/i.test(s[21]||"")||s[18]==="DROM"),pv=L.some(s=>"PWA".indexOf(s[16])>-1||/\bprivate\b|particular/i.test(s[21]||"")),
   big=L.some(s=>s[16]==="L"||/music park|life club|atoa na joa|label propria/.test(key(s[17]+" "+s[21])));
   return{L,tier:ag?0:pv?4:km>=40?1:big?2:3,n:new Set(L.map(s=>s[1])).size,km,c:cm(L),rv:RV(L),t:Math.min(...L.map(tk))}})
  .sort((a,b)=>a.tier-b.tier||(a.tier>=2?b.c-a.c:0)||b.n-a.n||(a.tier===1?b.km-a.km:0)||b.rv-a.rv||a.t-b.t).flatMap(x=>x.L)})}
// exceções combinadas na agenda semanal
const REP={"ANGRA BAR & RESTAURANTE":"ANGRA BAR","IBIZA UFSC":"IBIZA FLORIPA","FESTA DE FIM DO CICLO BÁSICO MEDICINA UPB - LUSCH GARDEN":"FIM DO CICLO BÁSICO MED UPB",
 "CERVEJADA BULLS MEDICINA JOAÇABA - VELVET MUSIC BAR":"CERVEJADA BULLS MEDICINA - VELVET MUSIC BAR","PRÉ EVENTO DIREITO UFPR - EUPHORIA (POOL PARTY) - ECO HOTEL OCEANOMARE":"PRÉ EVENTO DIREITO UFPR"};
const up=x=>x.toUpperCase().replace(/'/g,"’");
function fix(e){e=(REP[e]||e).replace("VEGAS BAR UNIVERSITÁRIO","VEGAS BAR");e=e.replace(/\s+-\s+RUA .*$/,"").replace(/\s*\(2º ANDAR\)/,"");if(e.startsWith("CORPORATIVO"))e="EVENTO CORPORATIVO";return e}
const rows=ALL.filter(s=>SLUG[s[1]]&&((s[14]===I0&&s[0]>=D0)||s[14]===I1)).filter(s=>!/OMITIR NA AGENDA/i.test(s[2])).sort((a,b)=>a[14]-b[14]||a[0]-b[0]||tk(a)-tk(b));
const days=[];
orderT(rows).forEach(s=>{const k=s[14]*100+s[0];let Dd=days.find(x=>x.k===k);if(!Dd)days.push(Dd={k,s,g:[]});
 const q=parts(s),gr=/grêmio do hu/i.test(s[17]||s[2]),pv=PRIV[s[16]]||(/\bprivate\b|particular/i.test(s[21]||"")?"Evento particular":null);let ev;
 if(/d.trip/i.test(s[21]||''))ev=up(clean(s[21]));else if(pv)ev=up(pv);else if(gr)ev=up(clean(q.ev||"Grêmio do HU"))+" UFSC";
 else ev=[clean(q.ev),q.loc].filter(x=>x&&x!=="Local não informado").map(up).join(" - ");
 ev=fix(ev);let ci=q.ci;if(/d.trip/i.test(s[21]||'')&&(!ci||ci==="Cidade não informada"))ci="Florianópolis/SC";
 let G=Dd.g.find(x=>x.key===ev+"|"+ci);if(!G)Dd.g.push(G={key:ev+"|"+ci,ev,ci,a:[],gr,pv:!!pv});
 if(!G.a.includes(s[1]))G.a.push(s[1])});
const iso=s=>{const y=yr(s),m=(s[14]-1)%12+1;return`${y}-${String(m).padStart(2,"0")}-${String(s[0]).padStart(2,"0")}`};
const out=days.map(Dd=>{const y=yr(Dd.s);Dd.g.forEach(x=>x.a.sort((p,q)=>(REV[y+'|'+q]||0)-(REV[y+'|'+p]||0)));
 const g=Dd.g.filter(x=>!x.gr&&!x.pv).concat(Dd.g.filter(x=>x.gr&&!x.pv),Dd.g.filter(x=>x.pv));
 return{d:iso(Dd.s),shows:g.map(x=>({a:x.a.map(i=>SLUG[i]),ev:x.ev,ci:x.ci.toUpperCase(),priv:x.pv}))}});
const fs=require('fs'),path=require('path');
const CO=JSON.parse(fs.readFileSync(path.join(__dirname,'coords.json')));
const geo=c=>{if(!c)return null;let [n,u]=c.split('/');u=u||'SC';return CO[nz(n).trim()+'/'+u]||null};
// agenda pública
const agenda={gerado:today.toISOString().slice(0,10),dias:out.map(d=>({d:d.d,shows:d.shows.map(s=>({...s,g:geo(cap(s.ci))}))}))};
function cap(ci){const [n,u]=ci.split('/');return n.toLowerCase().replace(/(^|\s)(\S)/g,(m,a,b)=>a+b.toUpperCase())+'/'+(u||'SC')}
// próximas edições das labels
const lab=ALL.filter(r=>(r[14]>I0||(r[14]===I0&&r[0]>=D0))&&/desordem|boiler/i.test((r[2]||'')+' '+(r[21]||''))).sort((a,b)=>a[14]-b[14]||a[0]-b[0]);
const prox={};lab.forEach(r=>{const k=/boiler/i.test((r[2]||'')+(r[21]||''))?'boiler':'desordem';if(prox[k])return;const q=parts(r);prox[k]={d:iso(r),ev:clean(r[21]||q.ev||''),local:q.loc||(r[17]||''),ci:q.ci}});
// números: só shows realizados (até ontem)
const done=ALL.filter(r=>r[14]<I0||(r[14]===I0&&r[0]<D0));
const cit=[...new Set(done.map(r=>r[3]).filter(c=>c&&c!=="Cidade não informada"))].sort();
const uf=new Set(cit.map(c=>c.includes("/")?c.split("/")[1]:"SC"));
const pts=cit.map(c=>{const g=geo(c.includes('/')?c:c+'/SC');return g?{n:c.includes('/')?c.replace('/',' · '):c+' · SC',g}:null}).filter(Boolean);
const per={};done.forEach(r=>{const s=SLUG[r[1]];if(s){(per[s]??=new Set()).add(r[3])}});for(const k in per)per[k]=per[k].size;
// pizza: últimos 12 meses
const ini=I0-12;const y12=done.filter(r=>r[14]>ini||(r[14]===ini&&r[0]>=D0));
const cat={pub:0,uni:0,soc:0};y12.forEach(r=>{const t=r[16];if(t==='U')cat.uni++;else if('PFCAW'.includes(t))cat.soc++;else cat.pub++});
const tot=y12.length;
const stats={gerado:agenda.gerado,shows:done.length,cidades:cit.length,estados:uf.size,pontos:pts,semCoord:cit.filter(c=>!geo(c.includes('/')?c:c+'/SC')),artistas:per,pizza:{pub:+(cat.pub/tot*100).toFixed(1),uni:+(cat.uni/tot*100).toFixed(1),soc:+(cat.soc/tot*100).toFixed(1),n:tot},prox};
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,'agenda.json'),JSON.stringify(agenda));
fs.writeFileSync(path.join(OUT,'stats.json'),JSON.stringify(stats));
console.log('agenda',out.length,'dias',out.reduce((a,d)=>a+d.shows.length,0),'| realizados',done.length,'cidades',cit.length,'UF',[...uf],'sem coord',stats.semCoord,'pizza',stats.pizza,'prox',prox);
