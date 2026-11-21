#!/usr/bin/env python3
"""DROM · escrita nas planilhas: chave e configuração dos apps.
  DROM_BKK=... python3 tools/escrita/chave.py nova        -> gera a KEY (32 bytes base64url) e grava cifrada em tools/escrita/key.enc.json (só se ainda não existir)
  DROM_BKK=... python3 tools/escrita/chave.py mostrar     -> mostra a KEY (para colar nas Propriedades do script)
  DROM_BKK=... python3 tools/escrita/chave.py url [URL]   -> grava dev/artistateste/w.json e booker/w.json (URL vazia = escrita desligada)
A KEY nunca vai em texto puro para o repositório. Cada app recebe só a SUA chave derivada (HMAC-SHA256("app:"+nome, KEY)), cifrada:
  booker/w.json com DROM_BKK (aberta pelo login do Hub) · dev/artistateste/w.json com a chave do PIN do app (mesmo salt do d.json)."""
import os,sys,json,base64,hmac,hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))));KF=R+'/tools/escrita/key.enc.json'
b64=lambda x:base64.b64encode(x).decode();ub=base64.b64decode
BK=AESGCM(ub(os.environ['DROM_BKK']))
def enc(aes,o):iv=os.urandom(12);return {'iv':b64(iv),'ct':b64(aes.encrypt(iv,json.dumps(o).encode(),None))}
def key():d=json.load(open(KF));return json.loads(BK.decrypt(ub(d['iv']),ub(d['ct']),None))['KEY']
def appkey(app):return hmac.new(key().encode(),('app:'+app).encode(),hashlib.sha256).digest()
APPS={'artistateste':(R+'/dev/artistateste/w.json',R+'/dev/artistateste/d.json',b'123321')}
cmd=sys.argv[1] if len(sys.argv)>1 else ''
if cmd=='nova':
    if os.path.exists(KF):sys.exit('já existe '+KF+' (apague para gerar outra; aí atualize a KEY no Apps Script e rode "url" de novo)')
    k=base64.urlsafe_b64encode(os.urandom(32)).decode().rstrip('=');json.dump(enc(BK,{'KEY':k}),open(KF,'w'));print('KEY gerada e cifrada em',KF)
elif cmd=='mostrar':print(key())
elif cmd=='url':
    U=(sys.argv[2] if len(sys.argv)>2 else '').strip()
    for a,(wf,df,pin) in APPS.items():
        salt=ub(json.load(open(df))['salt']);k=PBKDF2HMAC(hashes.SHA256(),32,salt,200000).derive(pin)
        o=enc(AESGCM(k),{'k':b64(appkey(a)),'app':a,'a':'Artista Teste'});o['url']=U;json.dump(o,open(wf,'w'));print(wf)
    o=enc(BK,{'k':b64(appkey('booker')),'app':'booker'});o['url']=U;json.dump(o,open(R+'/booker/w.json','w'));print(R+'/booker/w.json')
else:print(__doc__)
