#!/usr/bin/env python3
"""DROM · sincronização planilha → apps (GitHub Action, a cada 10 min via Apps Script).
Busca todas as linhas das abas de artista (valores exibidos) no web app 'DROM Sync' do Apps Script, roda o lean.py apply
com o estado do repo, criptografa os dados dos apps que mudaram (ghpush) e regrava o estado. DRY=1: só mostra o que mudaria."""
import os,sys,json,subprocess,urllib.request,urllib.parse,re
R=os.getcwd();W='/tmp/w';E=dict(os.environ)
def sh(*a,**k): print('$',' '.join(a[0]) if isinstance(a[0],list) else a[0]);return subprocess.run(*a,check=True,**k)
sh(['python3','tools/sync/state.py','unpack',W])
if E.get('DRY')!='1': sh(['python3','tools/sync/state.py','merge',W])
u=E['SHEET_URL']+('&' if '?' in E['SHEET_URL'] else '?')+urllib.parse.urlencode({'k':E['SHEET_KEY']})
X=json.load(urllib.request.urlopen(u,timeout=300))
if X.get('err'): sys.exit('web app: '+X['err'])
rows=[{'tab':t,'v':[str(c).replace('\r\n','\n').replace('\r','\n') for c in v]} for t,L in X['tabs'].items() for v in L if v and re.match(r'^\s*\d+\s*$',str(v[0]))]
json.dump(rows,open(W+'/rows.json','w',encoding='utf8'),ensure_ascii=False);print(len(rows),'linhas')
# BB (ALTERAÇÃO, coluna 54) por Nº, se o DROM Sync mandar (campo "bb"): o Booker ordena o seletor por ela (drom_data._mt)
TN={'01-RAMONSTRO':'Ramonstro','02-BRINQUINHO':'Brinquinho','03-CARLOTO':'Carloto','04-SENA':'Sena','05-CENOURA':'Cenoura','06-LIQUINHO':'Liquinho','07-MANEIRA':'Maneira','08-AMARO':'Amaro','09-JOSU':'Josu','10-CADU VIEIRA':'Cadu Vieira'}
BBJ={TN[t]:{str(int(n)):v for n,v in (D or {}).items() if re.match(r'^\d{4}-\d\d-\d\dT\d\d:\d\d',str(v))} for t,D in (X.get('bb') or {}).items() if t in TN}
if X.get('bb'): json.dump(BBJ,open(W+'/bb.json','w',encoding='utf8'))
print('BB:',sum(len(v) for v in BBJ.values()) or 'sem coluna BB (DROM Sync antigo)')
b2=X.get('b2') or '-'
if not re.match(r'^\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2}$',b2): b2='-'
# notas de DESPESAS (detalhe dos custos lançados pelo app): o IMPORTRANGE não leva notas; vêm do DROM Escrita (op notas, assinatura do Booker).
# Artista que falhar mantém as notas da rodada anterior (notas.json no estado). O convert.py põe o detalhe no campo 26 do show.
try:
    sys.path.insert(0,R+'/tools/escrita');import notas as _nt
    NJ=W+'/notas.json';_old=json.load(open(NJ,encoding='utf8')) if os.path.exists(NJ) else {}
    _old.update(_nt.fetch(list(TN.values())));json.dump(_old,open(NJ,'w',encoding='utf8'),ensure_ascii=False,sort_keys=True)
except Exception as e: print('notas: ignoradas (%s)'%e)
sh(['python3','-I','lean.py','mark'],cwd=W)
sh(['python3','-I','lean.py','apply',b2,'rows.json'],cwd=W,env=dict(E,DROM_NODEFER='1',DROM_GEO='0' if E.get('DRY')=='1' else '1',DROM_DIFF='1' if E.get('DRY')=='1' else '0'),stdout=subprocess.DEVNULL)
gh=json.load(open(W+'/gh.json'));print('mudaram:',', '.join(sorted(gh)) or 'nada')
rep=open(W+'/report.txt',encoding='utf8').read();print(rep)
if E.get('GITHUB_STEP_SUMMARY'): open(E['GITHUB_STEP_SUMMARY'],'a').write('```\n'+rep+'\nGitHub: '+(', '.join(sorted(gh)) or 'nada')+'\n```\n')
if E.get('DRY')=='1': sys.exit(0)
if gh: sh(['python3','tools/ghpush.py',W+'/gh.json'])
sh(['python3','-I','lean.py','fin','-'],cwd=W,stdout=subprocess.DEVNULL)
sh(['python3','tools/sync/state.py','pack',W])

import datetime as _D
json.dump({'t':(_D.datetime.now(_D.timezone.utc)-_D.timedelta(hours=3)).strftime('%d/%m/%Y %H:%M')},open('chk.json','w'))   # hora da última conferência (público, sem dados)
