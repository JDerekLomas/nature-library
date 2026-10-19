import json,sys,urllib.request,time,collections
from concurrent.futures import ThreadPoolExecutor
UA={"User-Agent":"NatureLibrary/0.1 (https://nature-library.vercel.app)"}
def get(u):
    for i in range(6):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=120))
        except Exception as e:
            print("retry",u,e,file=sys.stderr); time.sleep(2**i)
    raise SystemExit("fail "+u)
grp,tid=sys.argv[1],sys.argv[2]
base=f"https://api.checklistbank.org/dataset/3LR/nameusage/search?TAXON_ID={tid}&rank=species&status=accepted&sortBy=taxonomic&limit=1000"
tot=get(base+"&offset=0")["total"]
with ThreadPoolExecutor(4) as ex:
    pages=list(ex.map(lambda o:get(base+f"&offset={o}")["result"],range(0,tot,1000)))
rows=[];seen=set();sect=collections.Counter()
for p in pages:
  for r in p:
    u=r["usage"]
    if u["id"] in seen: continue
    seen.add(u["id"])
    cl={c["rank"]:c["name"] for c in r.get("classification",[])}
    en=next((v["name"] for v in r.get("vernacularNames",[]) if v.get("language")=="eng"),"")
    sect[u.get("sectorDatasetKey")]+=1
    rows.append(dict(id=u["id"],sci=u["name"]["scientificName"],auth=u["name"].get("authorship",""),en=en,family=cl.get("family",""),order=cl.get("order",""),cls=cl.get("class",""),extinct=u.get("extinct",False)))
print(grp,"total",tot,"got",len(rows),"sectors",sect,"extinct",sum(r["extinct"] for r in rows))
json.dump(rows,open(f"col_{grp}.json","w"),ensure_ascii=False)
