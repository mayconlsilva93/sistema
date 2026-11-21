#!/usr/bin/env python3
"""DROM · DEV (Action dev.yml): planilha falsa "Gestão e Propostas" do Artista Teste -> app dev (dev/artistateste/d.json)
e Booker (booker/dv.json, artista de teste). Só dados fictícios; não mexe nos artistas reais nem no estado (tools/sync/state.enc).
Planilha: baixada pelo app da Web do Apps Script (tools/drive/drive.gs, parâmetro dev=1) com DRIVE_URL + DRIVE_KEY,
ou um .xlsx local:  python3 tools/dev/devsync.py [arquivo.xlsx]"""
import os,sys,json,base64,hashlib,datetime as D,urllib.request,urllib.parse,collections
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))));sys.path.insert(0,R+'/tools/sync')
import state
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
TA='Artista Teste';PIN=b'123321';W='/tmp/wdev';X=W+'/dev.xlsx'
APP=R+'/dev/artistateste/d.json';BKD=R+'/booker/dv.json';OLD=R+'/booker/dev/dv.json';HF=R+'/tools/dev/hash.txt'
J=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'))
b64=lambda x:base64.b64encode(x).decode();ub=base64.b64decode
state.unpack(W);sys.path.insert(0,W)
if len(sys.argv)>1: open(X,'wb').write(open(sys.argv[1],'rb').read())
else:
    U,K=os.environ.get('DRIVE_URL','').strip(),os.environ.get('DRIVE_KEY','').strip()
    if not U or not K: sys.exit('DRIVE_URL/DRIVE_KEY não configurados')
    r=json.loads(urllib.request.urlopen(urllib.request.Request(U+('&' if '?' in U else '?')+urllib.parse.urlencode({'key':K,'dev':1}),headers={'User-Agent':'Mozilla/5.0 (DROM GitHub Action)'}),timeout=300).read())
    if not r.get('b64'): sys.exit('Apps Script sem a planilha dev (%s): reimplante o drive.gs (nova versão) com o parâmetro dev'%(r.get('err') or 'resposta antiga'))
    open(X,'wb').write(ub(r['b64']))
import openpyxl,sheets_load,convert,drom_data
WB=openpyxl.load_workbook(X,data_only=True);ROWS=list(WB['PROPOSTAS'].iter_rows(values_only=True))
HI=[i for i,r in enumerate(ROWS[:10]) if r and r[0] and str(r[0]).strip().startswith('Nº')][0]
def _load(name,path=None): return [(str(h).strip() if h else '') for h in ROWS[HI]],ROWS[HI+1:]
sheets_load.load=_load;convert.load=_load;drom_data._rows=lambda name:(ROWS,HI)
convert.PFX[TA]='11'
import re as _re;_p0=convert._parc   # só no dev: entradas do app gravadas como "dd/mm/aaaa (R$ x), dd/mm/aaaa (R$ y)" viram uma por linha
convert._parc=lambda x:_p0(dict(x,drec=_re.sub(r',\s*(?=\d{1,2}/\d{1,2}/\d{2,4})','\n',x['drec'])) if isinstance(x.get('drec'),str) else _p0(x))
# ---- app dev: S (shows), OT (outras propostas por mês), BK, CL, PR ----
S=[];O=collections.Counter()
for x in convert.rows(TA):
    if x['status'] in convert.SHOW: S.append(convert.app_row(TA,x))
    elif x['status']: O[((x['date'].year-convert.BASE)*12+x['date'].month,x['status'])]+=1
APPD={'S':S,'OT':[[m,s,c] for (m,s),c in sorted(O.items())],'BK':[],'CL':{},'PR':drom_data._pr(TA)}
# ---- Booker (artista de teste): DROMB("Artista Teste",{p:[linhas], cad, pix, ...}) + calc.js ----
BK=AESGCM(ub(os.environ['DROM_BKK']))
def bdec(p):
    d=json.load(open(p));return json.loads(BK.decrypt(ub(d['iv']),ub(d['ct']),None))
PREV=bdec(BKD) if os.path.exists(BKD) else bdec(OLD)
t=PREV['teste.js'];po=json.loads('['+t[6:].rstrip().rstrip(';')[:-1]+']')[1]   # DROMB("A",{...});
ex=drom_data.extras(X);base={k:v for k,v in po.items() if k!='p'}
for k,v in ex.items():
    if v: base[k]=v
P=drom_data.props(TA);KK=list(drom_data.BK_K)
for x in P:
    for k in x:
        if k not in KK: KK.append(k)
rows=[]
for x in P:
    r=[x.get(k) for k in KK]
    while r and r[-1] is None: r.pop()
    rows.append(r)
BKP={'teste.js':drom_data._ni('DROMB(%s,%s);'%(J(TA),J(dict([('p',rows)]+list(base.items()))))),'calc.js':PREV['calc.js']}
# ---- grava só se mudou ----
h=hashlib.sha1((J(APPD)+J(BKP)).encode()).hexdigest()
if os.path.exists(HF) and open(HF).read().strip()==h and os.path.exists(BKD): print('dev: nada mudou');sys.exit(0)
up=(D.datetime.now(D.timezone.utc)-D.timedelta(hours=3)).strftime('%d/%m/%Y %H:%M')
try: salt=ub(json.load(open(APP))['salt'])
except Exception: salt=os.urandom(16)
key=PBKDF2HMAC(hashes.SHA256(),32,salt,200000).derive(PIN);iv=os.urandom(12)
open(APP,'w').write(json.dumps({'salt':b64(salt),'iv':b64(iv),'ct':b64(AESGCM(key).encrypt(iv,J(APPD).encode(),None)),'up':up}))
iv=os.urandom(12);open(BKD,'w').write(json.dumps({'iv':b64(iv),'ct':b64(BK.encrypt(iv,J(BKP).encode(),None)),'up':up}))
open(HF,'w').write(h+'\n')
print('dev: %d shows, %d outras, %d no Booker'%(len(S),sum(O.values()),len(rows)))
