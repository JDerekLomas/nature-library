import json,csv,re,collections,os
OUT="data/checklists"; os.makedirs(OUT,exist_ok=True)
mdd={r['sciName'].replace('_',' '):r['mainCommonName'] for r in csv.DictReader(open('dl_mdd/mdd.csv',encoding='utf-8'))}
SRC={"mammals":"ITIS 2026-09-22 (COL sector for Mammalia; not MDD)","reptiles":"The Reptile Database 2026-06","amphibians":"ITIS 2026-09-22 (COL sector for Amphibia; not ASW)"}
for g in ["mammals","reptiles","amphibians"]:
    rows=json.load(open(f"col_{g}.json"))
    gb={}
    for l in open(f"gbif_{g}.jsonl"):
        d=json.loads(l); gb[d["id"]]=d
    fams=[];seenf=set();sp=[]
    for r in rows:
        order=r["order"] or ("Rhynchocephalia" if r["sci"].startswith("Sphenodon") else "")
        fam=r["family"] or "Incertae sedis"
        en=r["en"]
        if g=="mammals": en=(mdd.get(re.sub(r" \([^)]*\)","",r["sci"])) if mdd.get(re.sub(r" \([^)]*\)","",r["sci"])) not in (None,"","NA") else None) or en
        if (fam,order) not in seenf: seenf.add((fam,order)); fams.append([fam,order])
        sp.append([re.sub(r" \([^)]*\)","",r["sci"]),r["auth"],en,fam,order,r["id"],gb.get(r["id"],{}).get("key",0)])
    fams.sort(key=lambda f:(f[1],f[0])); sp.sort(key=lambda s:(s[4],s[3],s[0]))
    obj={"group":g,"source":f"Catalogue of Life 2026-10-14 via ChecklistBank (sector: {SRC[g]})","fetched":"2026-10-18","families":fams,"species":sp}
    json.dump(obj,open(f"{OUT}/{g}.json","w",encoding="utf-8"),ensure_ascii=False,separators=(",",":"))
    miss=[s for s in sp if not s[6]]
    yrs=collections.Counter()
    for s in miss:
        y=re.findall(r"(1[5-9]\d\d|20\d\d)",s[1]); yrs[int(y[-1]) if y else None]+=1
    print(f"\n== {g}: {len(sp)} species, {len(fams)} families, en={sum(bool(s[2]) for s in sp)}, unmatched-in-progress={sum(r['id'] not in gb for r in rows)}")
    print(f"matched {len(sp)-len(miss)} ({100*(len(sp)-len(miss))/len(sp):.1f}%), not in GBIF {len(miss)}")
    print("years: 2023",yrs[2023],"2024",yrs[2024],"2025",yrs[2025],"2026",yrs[2026],"<=2022",sum(v for k,v in yrs.items() if k and k<2023),"none",yrs[None])
    print("mt of misses",collections.Counter((gb[s[5]]["mt"],gb[s[5]]["rank"]) for s in miss if s[5] in gb).most_common(6))
    miss.sort(key=lambda s:-(int((re.findall(r"(\d{4})",s[1]) or ['0'])[-1])))
    for s in miss[:25]: print("  ",s[0],"|",s[1],"|",s[3])
