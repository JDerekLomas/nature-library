import sys, json, os
import pandas as pd
D=sys.argv[1]; OUT=sys.argv[2]
s=pd.read_parquet(D+'/dl/species.parquet'); f=pd.read_parquet(D+'/dl/families.parquet'); st=pd.read_parquet(D+'/dl/stocks.parquet',columns=['StockCode','SpecCode','Level','EnvTemp'])
s=s[s.FamCode!=0].copy(); s.loc[s.FamCode==813,'FamCode']=518  # placeholder family 813 -> Alestidae
st['pri']=(st.Level.fillna('').str.lower()!='species in general').astype(int)
st=st.sort_values(['SpecCode','pri','StockCode']).drop_duplicates('SpecCode')
clim=dict(zip(st.SpecCode,st.EnvTemp))
OK={'tropical','subtropical','temperate','boreal','polar','deep-water'}
ZONE={'reef-associated':'reef'}
fam=f.set_index('FamCode')
g={}; 
for l in open(D+'/gbif.jsonl'):
    j=json.loads(l)
    if j['mt'] in ('EXACT','FUZZY') and j['rank']=='SPECIES' and (j['phylum']=='Chordata' or (j['phylum'] is None and j['mt']=='EXACT')): g[j['sc']]=j['acc'] or j['key']
c={}
if os.path.exists(D+'/col.jsonl'):
    for l in open(D+'/col.jsonl'):
        j=json.loads(l)
        if j['id'] and j['rank']=='species' and j['chordata']:
            if j['status'] in ('accepted','provisionally accepted'): c[j['sc']]=j['id']
            elif j['status'] and 'synonym' in j['status'] and j['parent']: c[j['sc']]=j['parent']
def txt(x): return '' if x is None or (isinstance(x,float) and x!=x) else str(x).strip()
rows=[]; used=set()
for r in s.itertuples():
    F=fam.loc[r.FamCode]; used.add(r.FamCode)
    hab=('F' if r.Fresh else '')+('B' if r.Brack else '')+('M' if r.Saltwater else '')
    cl=txt(clim.get(r.SpecCode)); cl=cl if cl in OK else ''
    dp=txt(r.DemersPelag); z=ZONE.get(dp,dp if dp!='unknown' else '')
    rows.append([f"{r.Genus} {r.Species}",txt(r.Author),txt(r.FBname),F.Family,hab,cl,z,int(g.get(r.SpecCode,0) or 0),c.get(r.SpecCode,'') if r.SpecCode not in g else '',int(r.SpecCode),F.Class,F.Order])
rows.sort(key=lambda x:(x[10],x[11],x[3],x[0]))
fams=sorted({(fam.loc[k].Family,fam.loc[k].Order,fam.loc[k].Class,txt(fam.loc[k].CommonName)) for k in used},key=lambda x:(x[2],x[1],x[0]))
o={'source':'FishBase v25.04 (fishbase.org), via cboettig/fishbase','fetched':'2026-10-18','families':[list(x) for x in fams],'fishes':[x[:10] for x in rows]}
os.makedirs(os.path.dirname(OUT),exist_ok=True)
with open(OUT,'w',encoding='utf-8') as fo: json.dump(o,fo,ensure_ascii=False,separators=(',',':'))
print(len(rows),len(fams),os.path.getsize(OUT))
