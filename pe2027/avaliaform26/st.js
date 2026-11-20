/* DROM · Avaliação 2026 · números do ano a partir do d.json do app (mesma lógica do app: realizado = início + duração passou) */
(function(){
var B=2023,Y=2026,M0=(Y-B)*12,FLO={"Florianópolis/SC":1,"São José/SC":1,"Palhoça/SC":1,"Biguaçu/SC":1,"Santo Amaro da Imperatriz/SC":1,"Governador Celso Ramos/SC":1,"Antônio Carlos/SC":1};
function seg(s){var o=String(s[12]||""),k=o.search(/hor[áa]rios?\s*:/i);if(k<0)return 0;var R=/(\d{1,2})(?:[:h](\d{2}))?\s*(?:às|as|à|até|a|-|–)\s*(\d{1,2})(?:[:h](\d{2}))?/gi,m,a0=-1,b1=0,p=-1,t=o.slice(k),n=0;while(m=R.exec(t)){var a=+m[1]*60+(+m[2]||0),b=+m[3]*60+(+m[4]||0);if(a>=1440||b>1440)continue;if(p>=0)while(a<p)a+=1440;while(b<=a)b+=1440;if(a0<0)a0=a;b1=b;p=b;n++}return n>=2?b1-a0:0}
function ok(s){var m=/^(\d\d):(\d\d)/.exec(s[4]),e;if(m){var h=+m[1];e=new Date(B,s[19]-1,s[0]+(h<6?1:0),h,+m[2]+(seg(s)||s[5]||0))}else e=new Date(B,s[19]-1,s[0]+1,6,0);return Date.now()>=e.getTime()}
var med=a=>{if(!a.length)return 0;a=a.slice().sort((x,y)=>x-y);var h=Math.floor(a.length/2);return a.length%2?a[h]:(a[h-1]+a[h])/2},avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,sum=a=>a.reduce((x,y)=>x+y,0);
function cnt(a,f){var C={};a.forEach(s=>{var k=f(s);if(k===""||k==null)return;C[k]=(C[k]||0)+1});return Object.entries(C).sort((x,y)=>y[1]-x[1])}
function yr(S,y){var a=(y-B)*12;return S.filter(s=>s[19]>a&&s[19]<=a+12)}
/* projeção simples (nível dos últimos 12 meses × sazonalidade do mês, menos o que já está fechado) — indicativa */
function proj(S){var now=new Date(Date.now()-216e5),cm=(now.getFullYear()-B)*12+now.getMonth()+1,C={},first=1e9;S.forEach(s=>{if(ok(s)){C[s[19]]=(C[s[19]]||0)+1;first=Math.min(first,s[19])}});
 var l=0,n=0;for(var m=cm-12;m<cm;m++){if(m<first)continue;l+=C[m]||0;n++}var lvl=l/Math.max(3,n),ks=Object.keys(C),gm=ks.length?sum(ks.map(k=>C[k]))/ks.length:0,R={};
 var recent=S.some(s=>s[19]>=cm-3&&s[19]<=cm);if(!recent||!lvl)return R;
 for(var mk=cm;mk<=M0+12;mk++){var mo=(mk-1)%12+1,h=[];for(var y=B;y<now.getFullYear();y++){var k=(y-B)*12+mo;if(k>=first)h.push(C[k]||0)}
  var se=h.length&&gm?Math.max(.4,Math.min(1.8,avg(h)/gm)):1,nd=new Date(B,mk,0).getDate(),rem=mk===cm?(nd-now.getDate())/nd:1,e=lvl*se*rem,
  fut=S.filter(s=>s[19]===mk&&!ok(s)).length,x=Math.max(0,Math.round(e-fut));if(x)R[mk]=x}
 return R}
window.AVST=function(D){var S=D.S||[],PR=D.PR||[],OT=D.OT||[],A=yr(S,Y),R=A.filter(ok),F=A.filter(s=>!ok(s)),P=proj(S),mon=[];
 for(var i=1;i<=12;i++){var k=M0+i;mon.push({r:R.filter(s=>s[19]===k).length,f:F.filter(s=>s[19]===k).length,p:P[k]||0,y25:yr(S,2025).filter(s=>s[19]===k-12).length})}
 var pj=sum(mon.map(m=>m.p)),pv={};[2023,2024,2025].forEach(y=>pv[y]=yr(S,y).length);
 var ca=A.filter(s=>s[15]>0),flo=ca.filter(s=>FLO[s[3]]),fora=ca.filter(s=>!FLO[s[3]]),c25=yr(S,2025).filter(s=>s[15]>0),
  liq=ca.map(s=>s[15]-(s[16]||0)),com=sum(A.map(s=>s[17]||0)),base=sum(ca.filter(s=>s[17]>0).map(s=>s[15]-(s[16]||0)));
 var dw=[0,0,0,0,0,0,0];A.forEach(s=>{var d=new Date(B,s[19]-1,s[0]);dw[d.getDay()]++});
 var pr=PR.filter(p=>String(p[6]||"").slice(0,4)==String(Y)||(p[0]>M0&&p[0]<=M0+12)),pst=cnt(pr,p=>p[2]),ot=OT.filter(o=>o[0]>M0&&o[0]<=M0+12),otc={};ot.forEach(o=>otc[o[1]]=(otc[o[1]]||0)+o[2]);
 var desc=(otc["Proposta descartada"]||0)+(otc["Data indisponível"]||0),conv=A.length+desc?A.length/(A.length+desc):0;
 return{Y:Y,mon:mon,n:A.length,r:R.length,f:F.length,p:pj,tot:A.length+pj,pv:pv,
  fat:sum(ca.map(s=>s[15])),liq:sum(liq),com:com,cp:base?com/base:0,cm:avg(ca.map(s=>s[15])),
  flo:{n:flo.length,md:med(flo.map(s=>s[15])),mx:Math.max(0,...flo.map(s=>s[15])),mn:flo.length?Math.min(...flo.map(s=>s[15])):0,m25:med(c25.filter(s=>FLO[s[3]]).map(s=>s[15]))},
  fora:{n:fora.length,md:med(fora.map(s=>s[15])),mx:Math.max(0,...fora.map(s=>s[15])),m25:med(c25.filter(s=>!FLO[s[3]]).map(s=>s[15])),cid:cnt(fora,s=>s[3]),liq:med(fora.map(s=>s[15]-(s[16]||0)))},
  cid:cnt(A,s=>s[3]),cas:cnt(A,s=>s[2]),dw:dw,dur:med(A.filter(s=>s[5]>0).map(s=>s[5])),durs:cnt(A.filter(s=>s[5]>0),s=>s[5]),
  hosp:A.filter(s=>/^sim/i.test(s[8]||"")).length,eq:cnt(A,s=>s[6]),rd:cnt(A,s=>s[7]),
  pago:R.filter(s=>s[18]&&s[15]>0).length,aguard:R.filter(s=>!s[18]&&s[15]>0).length,
  ctr:cnt(A,s=>({S:"com contrato",N:"sem contrato",P:"contrato pendente"})[s[13]]),
  prop:{n:pr.length+sum(Object.values(otc)),st:pst,ot:otc,conv:conv},
  ini:A.filter(s=>/^\d\d:\d\d/.test(s[4])).map(s=>+s[4].slice(0,2)).reduce((C,h)=>(C[h]=(C[h]||0)+1,C),{})}};
window.AVFLO=FLO;
})();
