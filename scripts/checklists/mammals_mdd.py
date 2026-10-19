# Rebuild the mammal checklist from the Mammal Diversity Database (the list mammalogists use), keeping links to GBIF / COL.
import csv, json, sys, time, urllib.request, urllib.parse, concurrent.futures as cf
mdd, old_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
UA = {"User-Agent": "NatureLibrary/0.1 (https://thenaturelibrary.org)"}
rows = list(csv.DictReader(open(mdd, encoding="utf-8-sig")))
rows.sort(key=lambda r: float(r.get("phylosort") or 0))
old = json.load(open(old_path))
by_name = {s[0]: s for s in old["species"]}
def get(u):
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
        except Exception:
            time.sleep(1.5 * (i + 1))
    return {}
def match(name):
    g = get("https://api.gbif.org/v1/species/match?" + urllib.parse.urlencode({"name": name, "class": "Mammalia", "strict": "true"}))
    key = (g.get("acceptedUsageKey") or g.get("usageKey")) if g.get("matchType") in ("EXACT", "FUZZY") and g.get("rank") == "SPECIES" else 0
    col = ""
    if not key:
        c = get("https://api.checklistbank.org/dataset/3LR/match/nameusage?" + urllib.parse.urlencode({"scientificName": name, "rank": "species"}))
        u = c.get("usage") or {}
        col = (u.get("accepted") or {}).get("id") or u.get("id") or ""
    return name, key or 0, col
names = [r["sciName"].replace("_", " ") for r in rows]
todo = [n for n in names if n not in by_name]
res = {}
with cf.ThreadPoolExecutor(8) as ex:
    for name, key, col in ex.map(match, todo):
        res[name] = (key, col)
species, fams, seen = [], [], set()
cap = lambda s: s[:1].upper() + s[1:].lower() if s else s
for r, n in zip(rows, names):
    fam, order = cap(r["family"]), cap(r["order"])
    yr = r.get("authoritySpeciesYear", "")
    au = r.get("authoritySpeciesAuthor", "")
    author = f"{au}, {yr}" if au and yr else au or yr
    if r.get("authorityParentheses") == "1" and author: author = f"({author})"
    o = by_name.get(n)
    key, col = (o[6], o[5]) if o else res.get(n, (0, ""))
    species.append([n, author, r.get("mainCommonName", ""), fam, order, col, key])
    if fam not in seen:
        seen.add(fam); fams.append([fam, order])
json.dump({"group": "mammals", "source": "Mammal Diversity Database (mammaldiversity.org), " + str(len(rows)) + " species", "fetched": time.strftime("%Y-%m-%d"),
           "families": fams, "species": species}, open(out_path, "w"), ensure_ascii=False, separators=(",", ":"))
gb = sum(1 for s in species if s[6]); co = sum(1 for s in species if not s[6] and s[5])
print(f"MDD species {len(species)} · families {len(fams)} · reused {len(names)-len(todo)} · newly matched {len(todo)} · in GBIF {gb} · only COL {co} · no page source {len(species)-gb-co}")
print("no GBIF, no COL:", [s[0] for s in species if not s[6] and not s[5]][:30])
