// Bulk-pulls Source Library natural-history illustrations into data/raw/sl-gallery.json
// Resumable: skips subject/offset pages already fetched. Backs off on 429.
import fs from 'node:fs';
const OUT = new URL('../data/raw/sl-gallery.json', import.meta.url);
const SUBJECTS = ['medicinal plants','mycology','fungi','ornithology','zoology','ichthyology','herbal medicine','herbalism','natural history','botany'];
const db = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT)) : { done: {}, items: {} };
const save = () => fs.writeFileSync(OUT, JSON.stringify(db));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const subject of SUBJECTS) {
  for (let offset = 0; ; offset += 200) {
    const key = `${subject}@${offset}`;
    if (db.done[key] === 'end') break;
    if (db.done[key]) continue;
    const url = `https://sourcelibrary.org/api/gallery?subject=${encodeURIComponent(subject)}&limit=200&offset=${offset}&maxPerBook=1000&minQuality=0.6`;
    let res;
    for (let tries = 0; ; tries++) {
      res = await fetch(url);
      if (res.status !== 429 && res.status < 500) break;
      const wait = Math.min(15 * 60_000, 60_000 * (tries + 1));
      console.log(`${res.status} on ${key}, waiting ${wait / 1000}s`);
      await sleep(wait);
    }
    const j = await res.json();
    for (const it of j.items || []) {
      const id = `${it.pageId}-${it.detectionIndex}`;
      db.items[id] = {
        id, b: it.bookId, p: it.pageNumber, t: it.bookTitle, a: it.author, y: it.year,
        d: it.description, md: it.museumDescription, ty: it.type,
        s: it.metadata?.subjects || [], img: it.extractedUrl, th: it.thumbnailUrl, card: it.cardUrl,
        q: it.galleryQuality, ar: it.aspect, subj: subject,
      };
    }
    db.done[key] = j.hasMore ? 1 : 'end';
    save();
    console.log(key, (j.items || []).length, 'total items', Object.keys(db.items).length);
    if (!j.hasMore) break;
    await sleep(2500);
  }
}
console.log('DONE', Object.keys(db.items).length);
