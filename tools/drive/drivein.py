#!/usr/bin/env python3
"""DROM · (Action drive.yml) contratos PDF assinados e cadastros do Drive -> caixa de entrada (tools/sync/inbox/upd.json), sem o Claude.
Usa o app da Web do Apps Script (tools/drive/drive.gs): DRIVE_URL + DRIVE_KEY. Mesmas regras da antiga tarefa agendada."""
import os,sys,json,re,base64,subprocess,time,urllib.request,urllib.parse
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))));sys.path.insert(0,R+'/tools/sync')
import state
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
URL,KEY=os.environ.get('DRIVE_URL','').strip(),os.environ.get('DRIVE_KEY','').strip()
if not URL or not KEY:print('DRIVE_URL/DRIVE_KEY ainda não configurados');sys.exit(0)
W='/tmp/w';SINCE=R+'/tools/drive/since.txt'
ARTS=['Ramonstro','Carloto','Sena','Cenoura','Maneira','Amaro','Josu','Cadu Vieira','Brinquinho','Liquinho']
PFX={'Ramonstro':'1','Brinquinho':'2','Carloto':'3','Sena':'4','Cenoura':'5','Liquinho':'6','Maneira':'7','Amaro':'8','Josu':'9','Cadu Vieira':'10'}
def get(**q):
    q['key']=KEY;u=URL+('&' if '?' in URL else '?')+urllib.parse.urlencode(q)
    r=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (DROM GitHub Action)'}),timeout=300).read())
    if r.get('err'):sys.exit('Apps Script: '+r['err'])
    return r
def art(folder):
    f=re.sub(r'^DJ\s+','',folder or '');f=re.sub(r'\s*-\s*DROM$','',f).strip()
    return next((a for a in ARTS if a.lower()==f.lower()),None)
state.unpack(W)
since=open(SINCE).read().strip() if os.path.exists(SINCE) else str(int(time.time()*1000)-11*3600*1000)
S=get(scan=1,since=since)
C=json.load(open(W+'/contracts.json'));known={i for m in C.values() for i in m.values()};novos=[]
for x in S['pdfs']:
    if x['id'] in known:continue
    if x['p']=='Contratos com Contratantes':a=art(x['g'])
    elif x['g']=='Contratos com Contratantes':a=art(x['gg'])   # subpasta de ano
    else:continue
    if not a:continue
    m=re.search(r'Contrato\s+(\d{4,6})-\d{4}',x['name'])
    if m:k=m.group(1)
    else:
        m=re.search(r'DROM Entretenimento - Contrato\s+\S+\s+-\s+(.+?)\s*\[assinado\]',x['name'])
        if not m:print('nome não reconhecido:',x['name']);continue
        o=subprocess.run([sys.executable,'-I','lean.py','find',m.group(1)[:40]],cwd=W,capture_output=True,text=True).stdout.split('\n')
        o=[l.split() for l in o if l.startswith(a+' ') or l.startswith(a)]
        if not o:print('proposta não encontrada:',x['name']);continue
        n=o[0][len(a.split())];k=PFX[a]+'%04d'%int(n)
    C.setdefault(a,{})[k]=x['id'];novos.append('%s %s'%(a,k))
json.dump(C,open(W+'/contracts.json','w'),ensure_ascii=False)
pairs=[];cads=[]
for c in S['cads']:
    p=W+'/x_%s.xlsx'%c['id'];open(p,'wb').write(base64.b64decode(get(x=c['id'])['b64']));pairs.append('%s=%s'%(c['a'],p));cads.append(c['a'])
if pairs:print(subprocess.run([sys.executable,'-I','lean.py','extras']+pairs,cwd=W,capture_output=True,text=True).stdout.strip())
if novos or pairs:
    X={k:open(W+'/'+k,encoding='utf8').read() for k in state.IN_F}
    iv=os.urandom(12);os.makedirs(os.path.dirname(state.INBOX),exist_ok=True)
    open(state.INBOX,'w').write(json.dumps({'iv':base64.b64encode(iv).decode(),'ct':base64.b64encode(AESGCM(state.K).encrypt(iv,json.dumps(X,ensure_ascii=False).encode(),None)).decode()}))
open(SINCE,'w').write(str(S['now']))
print('Contratos novos:',', '.join(novos) or '-');print('Cadastros atualizados:',', '.join(cads) or '-')
