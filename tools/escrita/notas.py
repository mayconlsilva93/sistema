#!/usr/bin/env python3
"""DROM · notas da coluna DESPESAS (detalhe dos custos lançados pelo app) direto das planilhas "Gestão e Propostas".
O IMPORTRANGE/BASECLAUDE e o .xlsx não levam as notas: a Action pede ao DROM Escrita (op "notas", só leitura) assinando
como o Booker (chave derivada da KEY cifrada em tools/escrita/key.enc.json, aberta com DROM_BKK). Não muda o escrita.gs.
  fetch(['Ramonstro',...]) -> {artista: {"27": "Item: R$ 50,00\\n...", ...}}  (artista que falhou fica de fora)
  parse(texto) -> [["Item", 50.0], ...]  (linha sem valor -> [texto, None]; "Lançado pelo app em…" ignorada)"""
import os,re,json,time,hmac,hashlib,base64,urllib.request,urllib.parse
from concurrent.futures import ThreadPoolExecutor
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def _key():
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    d=json.load(open(R+'/tools/escrita/key.enc.json'));bk=AESGCM(base64.b64decode(os.environ['DROM_BKK']))
    K=json.loads(bk.decrypt(base64.b64decode(d['iv']),base64.b64decode(d['ct']),None))['KEY']
    return hmac.new(K.encode(),b'app:booker',hashlib.sha256).digest()
def _one(U,k,a):
    p=json.dumps({'id':'nt'+os.urandom(8).hex(),'ts':int(time.time()*1000),'op':'notas','a':a})
    q=urllib.parse.urlencode({'app':'booker','p':p,'sig':hmac.new(k,p.encode(),hashlib.sha256).hexdigest()})
    r=json.loads(urllib.request.urlopen(urllib.request.Request(U+('&' if '?' in U else '?')+q,headers={'User-Agent':'Mozilla/5.0 (DROM GitHub Action)'}),timeout=90).read())
    if not r.get('ok'): raise RuntimeError(r.get('err') or 'resposta sem ok')
    return {str(int(n)):str(t) for n,t in (r['r'].get('notas') or {}).items() if str(t).strip()}
def fetch(names):
    try: U=(json.load(open(R+'/booker/w.json')).get('url') or '').strip();k=_key()
    except Exception as e: print('notas: sem chave/URL (%s)'%e);return {}
    if not U: print('notas: escrita desligada (booker/w.json sem url)');return {}
    out={}
    def go(a):
        for t in range(2):
            try: return a,_one(U,k,a)
            except Exception as e: err=e;time.sleep(2)
        print('notas: %s falhou (%s)'%(a,err));return a,None
    with ThreadPoolExecutor(5) as ex:
        for a,v in ex.map(go,names):
            if v is not None: out[a]=v
    print('notas:',', '.join('%s %d'%(a,len(v)) for a,v in out.items()) or 'nenhuma')
    return out
def parse(t):
    L=[]
    for ln in re.split(r'[\r\n]+',str(t or '')):
        ln=ln.strip()
        if not ln or re.match(r'(?i)^lan[çc]ado pelo app',ln): continue
        m=re.match(r'^(.*?)\s*[:\-–]\s*R\$\s*([\d.]+(?:,\d{1,2})?)\s*$',ln)
        if m: L.append([m.group(1).strip(),round(float(m.group(2).replace('.','').replace(',','.')),2)])
        else: L.append([ln,None])
    return L
