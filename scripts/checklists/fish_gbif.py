import sys, json, os, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
import pandas as pd
D=sys.argv[1]
UA="NatureLibrary/0.1 (https://thenaturelibrary.org)"
CMAP={'Teleostei':'Actinopterygii','Chondrostei':'Actinopterygii','Holostei':'Actinopterygii','Cladistii':'Actinopterygii','Dipneusti':'Sarcopterygii','Coelacanthi':'Sarcopterygii'}
s=pd.read_parquet(D+'/dl/species.parquet',columns=['SpecCode','Genus','Species','FamCode'])
f=pd.read_parquet(D+'/dl/families.parquet',columns=['FamCode','Class'])
s=s.merge(f,on='FamCode',how='left'); s=s[s.FamCode!=0]
out=D+'/gbif.jsonl'; done=set()
if os.path.exists(out):
    for l in open(out): done.add(json.loads(l)['sc'])
todo=[r for r in s.itertuples() if r.SpecCode not in done]
print(len(s),'todo',len(todo),flush=True)
def get(url):
    for a in range(6):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':UA})
            with urllib.request.urlopen(req,timeout=30) as r: return json.load(r)
        except Exception as e:
            time.sleep(2**a)
    return None
def work(r):
    name=f"{r.Genus} {r.Species}"
    q=urllib.parse.urlencode({'name':name,'class':CMAP.get(r.Class,r.Class),'kingdom':'Animalia','phylum':'Chordata','strict':'true'})
    j=get('https://api.gbif.org/v1/species/match?'+q)
    if j is None: return None
    return {'sc':int(r.SpecCode),'name':name,'mt':j.get('matchType'),'rank':j.get('rank'),'status':j.get('status'),'key':j.get('usageKey'),'acc':j.get('acceptedUsageKey'),'phylum':j.get('phylum'),'family':j.get('family'),'canon':j.get('canonicalName'),'conf':j.get('confidence')}
n=0
with open(out,'a') as fo, ThreadPoolExecutor(8) as ex:
    for res in ex.map(work,todo):
        if res is None: continue
        fo.write(json.dumps(res,ensure_ascii=False)+'\n'); n+=1
        if n%1000==0: fo.flush(); print(n,flush=True)
print('done',n)
