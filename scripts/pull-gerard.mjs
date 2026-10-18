// Fetches the transcribed pages of Gerard's Herball (1597) from the Source Library and splits them into chapters.
// Resumable: pages are cached in data/raw/gerard/pages.json. The anonymous API allows ~500 pages a day.
// Output: data/raw/gerard/chapters.json — [{ title, chap, book, page, printed, sections: {description, place, time, names, temperature, vertues} }]
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIR = path.join(ROOT, "data/raw/gerard");
fs.mkdirSync(DIR, { recursive: true });
const PAGES = path.join(DIR, "pages.json");
const BOOK = "6957ebcc57a4c14a9879ab9c";
const pages = fs.existsSync(PAGES) ? JSON.parse(fs.readFileSync(PAGES, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LAST = Number(process.argv[2] || 520);

for (let from = 1; from <= LAST; from += 20) {
  const to = Math.min(LAST, from + 19);
  const need = [];
  for (let p = from; p <= to; p++) if (pages[p] === undefined) need.push(p);
  if (!need.length) continue;
  const r = await fetch(`https://sourcelibrary.org/api/books/${BOOK}/text?content=ocr&from=${need[0]}&to=${need.at(-1)}&format=json`);
  if (r.status === 429) {
    console.log("daily page budget reached; run again tomorrow");
    break;
  }
  const j = await r.json().catch(() => null);
  if (!j) break;
  const got = new Map((j.pages || []).map((p) => [p.page_number, p.ocr]));
  for (const p of need) pages[p] = got.has(p) ? got.get(p) ?? "" : got.size ? "" : undefined;
  fs.writeFileSync(PAGES, JSON.stringify(pages));
  console.log(`pages ${need[0]}–${need.at(-1)}: ${got.size}`);
  if (!got.size && from > 500) break; // end of the transcribed run
  await sleep(1500);
}

// ---------- parse into chapters ----------
const clean = (t) =>
  t
    .replace(/[​-‍⁠﻿]/g, "")
    .replace(/ſ/g, "s")
    .replace(/<(page-num|sig|header)>[\s\S]*?<\/\1>/g, "")
    .replace(/\$\\ast\$/g, "*")
    .replace(/[⁕⁂]/g, "*")
    // keep section headers the transcriber put in the margin; drop other marginalia
    .replace(/<margin>\s*(\**\s*The\s+[a-z ]+\.\**)\s*<\/margin>/gi, "\n$1\n")
    .replace(/<margin>[\s\S]*?<\/margin>/g, "")
    .replace(/<\/?[a-z-]+>/g, "")
    .replace(/\\\*/g, "*");

const SECTION = /^[\s*\\]*The\s+(?:(?:nature|temperature)\s+and\s+)?(kindes|kinds|description|place|time|names|temperature|nature|vertues|virtues|danger)(?:\s+and\s+(?:the\s+)?times?)?\.?[\s*]*$/i;
const CHAPTER = /^[\s*\\#]*(Of\s+.{2,120}?)\.?\s*Chap\.?\s*(\d+)\.?\s*$/i;
const BOOKHDR = /THE\s+(FIRST|SECOND|THIRD)\s+BOOKE/i;

const chapters = [];
let cur = null;
let sec = "intro";
let book = "FIRST";
const nums = Object.keys(pages).map(Number).sort((a, b) => a - b);
for (const n of nums) {
  const raw = pages[n] || "";
  if (!raw) continue;
  const hb = raw.match(BOOKHDR);
  if (hb) book = hb[1].toUpperCase();
  const printed = raw.match(/<page-num>(\d+)<\/page-num>/)?.[1];
  const text = clean(raw).replace(/\s\*\s*(The\s+(?:kindes|description|place(?:\s+and\s+times?)?|time|names|temperature|nature and vertues|temperature and vertues|vertues|danger)\.)\s+/g, "\n$1\n");
  for (const line of text.split("\n")) {
    const ch = line.match(CHAPTER);
    if (ch) {
      cur = { title: ch[1].replace(/\s+/g, " ").trim(), chap: Number(ch[2]), book, page: n, printed: printed ? Number(printed) : null, sections: {} };
      chapters.push(cur);
      sec = "intro";
      continue;
    }
    const s = line.match(SECTION);
    if (s && cur) {
      sec = s[1].toLowerCase().replace("virtues", "vertues").replace("kinds", "kindes").replace("nature", "temperature");
      continue;
    }
    if (cur && line.trim()) cur.sections[sec] = ((cur.sections[sec] || "") + " " + line.trim()).trim();
  }
}
for (const c of chapters) for (const k of Object.keys(c.sections)) c.sections[k] = c.sections[k].replace(/\s+/g, " ").replace(/- (?=[a-z])/g, "").trim();
fs.writeFileSync(path.join(DIR, "chapters.json"), JSON.stringify(chapters));
const withV = chapters.filter((c) => c.sections.vertues).length;
console.log(`${Object.values(pages).filter(Boolean).length} transcribed pages → ${chapters.length} chapters (${withV} with "The vertues")`);
