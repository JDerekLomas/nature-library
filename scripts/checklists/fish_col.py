import sys, json, os, time, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
D=sys.argv[1]
UA="NatureLibrary/0.1 (https://thenaturelibrary.org)"
names=[]
for l in open(D+'/gbif.jsonl'):
    j=json.loads(l)
    if not (j['mt'] in ('EXACT','FUZZY') and j['rank']=='SPECIES' and j['phylum']=='Chordata'): names.append((j['sc'],j['name']))
out=D+'/col.jsonl'; done=set()
if os.path.exists(out):
    for l in open(out): done.add(json.loads(l)['sc'])
todo=[x for x in names if x[0] not in done]; print(len(names),'todo',len(todo),flush=True)
def get(url):
    for a in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':UA}),timeout=30) as r: return json.load(r)
        except Exception: time.sleep(2**a)
def work(x):
    sc,name=x
    j=get('https://api.checklistbank.org/dataset/3LR/match/nameusage?'+urllib.parse.urlencode({'scientificName':name,'rank':'species'}))
    if j is None: return None
    u=j.get('usage') or {}
    cl=[c.get('name') for c in u.get('classification') or []]
    return {'sc':sc,'name':name,'type':j.get('type'),'id':u.get('id'),'status':u.get('status'),'rank':u.get('rank'),'parent':u.get('parentId'),'uname':u.get('name'),'chordata':'Chordata' in cl,'family':next((c.get('name') for c in u.get('classification') or [] if c.get('rank')=='family'),None)}
with open(out,'a') as fo, ThreadPoolExecutor(4) as ex:
    for r in ex.map(work,todo):
        if r: fo.write(json.dumps(r,ensure_ascii=False)+'\n'); fo.flush()
print('done')
