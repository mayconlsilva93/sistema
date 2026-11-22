/* DROM · Avaliação 2026 · números do ano a partir do d.json do app (realizado = início + duração passou) + dados do Painel (pj.json: projeção, categorias, casas unificadas, financeiro projetado) */
(function(){
var B=2023,Y=2026,M0=(Y-B)*12,FLO=window.AVFLO={"Florianópolis/SC":1,"São José/SC":1,"Palhoça/SC":1,"Biguaçu/SC":1,"Santo Amaro da Imperatriz/SC":1,"Governador Celso Ramos/SC":1,"Antônio Carlos/SC":1};
function seg(s){var o=String(s[12]||""),k=o.search(/hor[áa]rios?\s*:/i);if(k<0)return 0;var R=/(\d{1,2})(?:[:h](\d{2}))?\s*(?:às|as|à|até|a|-|–)\s*(\d{1,2})(?:[:h](\d{2}))?/gi,m,a0=-1,b1=0,p=-1,t=o.slice(k),n=0;while(m=R.exec(t)){var a=+m[1]*60+(+m[2]||0),b=+m[3]*60+(+m[4]||0);if(a>=1440||b>1440)continue;if(p>=0)while(a<p)a+=1440;while(b<=a)b+=1440;if(a0<0)a0=a;b1=b;p=b;n++}return n>=2?b1-a0:0}
function ok(s){var m=/^(\d\d):(\d\d)/.exec(s[4]),e;if(m){var h=+m[1];e=new Date(B,s[19]-1,s[0]+(h<6?1:0),h,+m[2]+(seg(s)||s[5]||0))}else e=new Date(B,s[19]-1,s[0]+1,6,0);return Date.now()>=e.getTime()}
var med=a=>{if(!a.length)return 0;a=a.slice().sort((x,y)=>x-y);var h=Math.floor(a.length/2);return a.length%2?a[h]:(a[h-1]+a[h])/2},avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,sum=a=>a.reduce((x,y)=>x+y,0);
function grp(a,f){var C={};a.forEach(s=>{var k=f(s);if(k===""||k==null)return;(C[k]=C[k]||[]).push(s)});return Object.entries(C).map(x=>[x[0],x[1].length,avg(x[1].map(s=>s[15])),x[1]]).sort((x,y)=>y[1]-x[1]||y[2]-x[2])}
function yr(S,y){var a=(y-B)*12;return S.filter(s=>s[19]>a&&s[19]<=a+12)}
function rev(s){var m=(s[19]-1)%12+1;return(m===12&&s[0]===31)||(m===1&&s[0]===1)||/r[eé]v[eé]ill?on|virada/i.test(s[1]||"")}
/* grupos do Painel Geral (CGR) */
var CGR=[["Eventos Públicos",[["Casas noturnas","N"],["Bares","B"],["Outdoor","O"],["Label DROM","L"]]],["Eventos Universitários",[["Grande Florianópolis","U1"],["Outras cidades","U2"]]],["Eventos Sociais e Corporativos",[["Formaturas","F"],["Aniversários","A"],["Casamentos","W"],["Particular","P"],["Corporativos","C"]]]];
window.AVST=function(D,X){X=X||{};var P=X.P||{},CT=X.CT||{},CA=X.CA||{},FIN=X.FIN||null,PC=X.PC||{},hasCT=Object.keys(CT).length>0,
 ky=s=>s[19]+"|"+s[0]+"|"+String(s[3]).replace(/\/SC$/,""),kl=s=>ky(s)+"|"+String(s[2]||"").trim().toLowerCase(),
 cat0=s=>CT[kl(s)]||CT[ky(s)]||"",
 /* formaturas e pré-eventos de formatura contam como social mesmo em casa noturna; HH (happy hour universitário) conta como universitário */
 cat=s=>{var c=cat0(s),n=String(s[1]||"");if(/formatura|pr[ée][- ]?(cl[ií]nico|internato|evento)|meio m[ée]dico|\b\d+ dias\b|ciclo b[áa]sico/i.test(n))return/^[FAWPC]$/.test(c)?c:"F";if(/\bhh\b|hh dos|hh especial/i.test(n)&&!/^[NBOU]$/.test(c))return"U";return c},cs=s=>CA[s[3]+"|"+s[2]]||s[2],sub=s=>{var c=cat(s);return c==="U"?(FLO[s[3]]?"U1":"U2"):c};
 var S=D.S||[],A=yr(S,Y),R=A.filter(ok),F=A.filter(s=>!ok(s)),mon=[];
 for(var i=1;i<=12;i++){var k=M0+i;mon.push({r:R.filter(s=>s[19]===k).length,f:F.filter(s=>s[19]===k).length,p:P[k]||0,y25:yr(S,2025).filter(s=>s[19]===k-12).length})}
 var pj=sum(mon.map(m=>m.p)),pv={};[2023,2024,2025].forEach(y=>pv[y]=yr(S,y).length);
 /* eventos públicos e universitários (sem eventos DROM, labels e réveillon) */
 var ca=A.filter(s=>s[15]>0),pub=ca.filter(s=>!/drom/i.test(s[1]||"")&&!rev(s)&&(!hasCT||/^[NBOU]$/.test(cat(s)))),flo=pub.filter(s=>FLO[s[3]]),fora=pub.filter(s=>!FLO[s[3]]),
  soc=ca.filter(s=>/^[FAWPC]$/.test(cat(s))).sort((a,b)=>a[19]-b[19]||a[0]-b[0]),pu25=yr(S,2025).filter(s=>s[15]>0&&!/drom/i.test(s[1]||"")&&!rev(s));
 var kq=L=>({n:L.length,md:med(L.map(s=>s[15])),av:avg(L.map(s=>s[15])),mx:L.length?Math.max(...L.map(s=>s[15])):0,mn:L.length?Math.min(...L.map(s=>s[15])):0});
 /* histórico de cachês: grupos e subgrupos do Painel, % do total financeiro (realizados + confirmados) */
 var tot=sum(A.map(s=>+s[15]||0)),hist=CGR.map(g=>{var subs=g[1].map(x=>{var L=A.filter(s=>sub(s)===x[1]);return{n:x[0],c:L.length,v:sum(L.map(s=>+s[15]||0)),m:avg(L.map(s=>+s[15]||0))}}).filter(x=>x.c);var L=A.filter(s=>g[1].some(x=>sub(s)===x[1]));return{n:g[0],c:L.length,v:sum(L.map(s=>+s[15]||0)),m:avg(L.map(s=>+s[15]||0)),subs:subs}}).filter(g=>g.c),
  semc=A.filter(s=>!CGR.some(g=>g[1].some(x=>sub(s)===x[1])));
 if(semc.length)hist.push({n:"Sem categoria",c:semc.length,v:sum(semc.map(s=>+s[15]||0)),m:avg(semc.map(s=>+s[15]||0)),subs:[]});
 /* 30%: comissão ≥ 29% do líquido de custos; a realizar com comissão projetada pelo Painel (custos pendentes estimados) */
 var c30=A.filter(s=>s[17]>0&&s[15]-(s[16]||0)>0&&s[17]/(s[15]-(s[16]||0))>=.29).sort((a,b)=>a[19]-b[19]||a[0]-b[0]).map(s=>({s:s,r:ok(s),c:PC[kl(s)]!=null?PC[kl(s)]:s[17],pj:PC[kl(s)]!=null}));
 /* duração em faixas */
 var DB=[["até 45 min",0,50],["1 hora",51,75],["1h30",76,105],["2 horas",106,135],["mais de 2 horas",136,1e9]],du=A.filter(s=>s[5]>0);
 var dup=(function(){var C={};A.forEach(s=>{var k=s[19]+"|"+s[0];C[k]=(C[k]||0)+1});var v=Object.values(C);return{d:v.length,m:v.filter(x=>x>1).length,mx:Math.max(0,...v)}})();
 return{Y:Y,mon:mon,n:A.length,r:R.length,f:F.length,p:pj,tot:A.length+pj,pv:pv,hasCT:hasCT,
  fat:sum(ca.map(s=>s[15])),com:sum(A.map(s=>s[17]||0)),cus:sum(ca.map(s=>s[16]||0)),
  fin:FIN?{fat:FIN.fat+FIN.pf,cu:FIN.cu+FIN.ecu+FIN.pcu,com:FIN.com-FIN.ecom+FIN.pco,pn:FIN.pn,ecu:FIN.ecu,pf:FIN.pf}:null,
  flo:Object.assign(kq(flo),{m25:med(pu25.filter(s=>FLO[s[3]]).map(s=>s[15])),loc:grp(flo,cs)}),
  fora:Object.assign(kq(fora),{m25:med(pu25.filter(s=>!FLO[s[3]]).map(s=>s[15])),cid:grp(fora,s=>s[3])}),
  soc:Object.assign(kq(soc),{L:soc}),
  hist:hist,htot:tot,
  c30:{L:c30,nr:c30.filter(x=>x.r).length,nf:c30.filter(x=>!x.r).length},
  dur:{md:med(du.map(s=>s[5])),av:avg(du.map(s=>s[5])),b:DB.map(b=>[b[0],du.filter(s=>s[5]>=b[1]&&s[5]<=b[2]).length]).filter(x=>x[1])},
  dup:dup,cas:grp(A,cs),cid:grp(A,s=>s[3])}};
window.AVok=ok;
})();
