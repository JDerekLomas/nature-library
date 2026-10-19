import json,sys,urllib.request,urllib.parse,time,os,threading
from concurrent.futures import ThreadPoolExecutor
UA={"User-Agent":"NatureLibrary/0.1 (https://nature-library.vercel.app)"}
grp=sys.argv[1]
rows=json.load(open(f"col_{grp}.json"))
prog=f"gbif_{grp}.jsonl"
done={}
if os.path.exists(prog):
    for l in open(prog):
        d=json.loads(l); done[d["id"]]=d
lock=threading.Lock(); f=open(prog,"a")
def m(r):
    q={"name":r["sci"],"strict":"true"}
    if grp=="reptiles": q["order"]=r["order"] or "Rhynchocephalia"
    else: q["class"]=r["cls"]
    u="https://api.gbif.org/v1/species/match?"+urllib.parse.urlencode(q)
    for i in range(7):
        try:
            d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60)); break
        except Exception as e:
            time.sleep(min(60,2**i))
    else: return
    key=0
    if d.get("matchType") in ("EXACT","FUZZY") and d.get("rank")=="SPECIES":
        key=d.get("acceptedUsageKey") or d.get("usageKey") or 0
    out={"id":r["id"],"key":key,"mt":d.get("matchType"),"rank":d.get("rank"),"gname":d.get("scientificName"),"status":d.get("status")}
    with lock: f.write(json.dumps(out,ensure_ascii=False)+"\n"); f.flush()
todo=[r for r in rows if r["id"] not in done]
print(grp,"todo",len(todo))
with ThreadPoolExecutor(8) as ex: list(ex.map(m,todo))
print(grp,"finished")
