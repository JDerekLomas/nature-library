"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/LangProvider";

interface Book {
  source: string;
  title: string;
  author?: string;
  year?: string;
  url: string;
  thumb?: string;
  snippet?: string;
  page?: number;
}

/** Books about this organism from the Internet Archive and the Source Library, plus a BHL link. */
export default function Stacks({ names, scientific }: { names: string[]; scientific: string }) {
  const t = useT().widgets;
  const [books, setBooks] = useState<Book[] | null>(null);
  // Fetched from the visitor's browser (both APIs allow cross-origin), so each reader uses their own Source Library quota
  const key = names.join("|");
  useEffect(() => {
    let dead = false;
    const sl = fetch(`https://sourcelibrary.org/api/search?q=${encodeURIComponent(names[0])}&limit=8`)
      .then((r) => (r.ok ? r.json() : { results: [] }))
      .then((j) =>
        (j.results ?? []).slice(0, 6).map(
          (b: { book_id: string; slug?: string; title: string; display_title?: string; author?: string; published?: string; page_number?: number; snippet?: string; snippet_type?: string; thumbnail_blob?: string }): Book => ({
            source: "Source Library",
            title: b.display_title || b.title,
            author: b.author,
            year: b.published,
            page: b.page_number,
            snippet: b.snippet_type === "translation" ? b.snippet : undefined,
            url: `https://sourcelibrary.org/book/${b.slug || b.book_id}${b.page_number ? `?page=${b.page_number}` : ""}`,
            thumb: b.thumbnail_blob,
          })
        )
      )
      .catch(() => [] as Book[]);
    const clause = names.map((n) => `title:("${n}") OR subject:("${n}")`).join(" OR ");
    const ia = fetch(
      `https://archive.org/advancedsearch.php?q=${encodeURIComponent(`(${clause}) AND mediatype:texts`)}&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=year&rows=10&sort[]=downloads+desc&output=json`
    )
      .then((r) => (r.ok ? r.json() : { response: { docs: [] } }))
      .then((j) =>
        (j.response?.docs ?? []).map((d: { identifier: string; title: string; creator?: string | string[]; year?: string }): Book => ({
          source: "Internet Archive",
          title: d.title,
          author: Array.isArray(d.creator) ? d.creator[0] : d.creator,
          year: d.year,
          url: `https://archive.org/details/${d.identifier}`,
          thumb: `https://archive.org/services/img/${d.identifier}`,
        }))
      )
      .catch(() => [] as Book[]);
    Promise.all([sl, ia]).then(([a, b]) => !dead && setBooks([...a, ...b]));
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const quotes = (books || []).filter((b) => b.snippet);
  const shelf = (books || []).filter((b) => !b.snippet);
  return (
    <div>
      {quotes.length > 0 && (
        <div className="mb-10">
          <p className="label text-ink-2 mb-4">{t.oldBooksSay}</p>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
            {quotes.map((b) => (
              <a key={b.url} href={b.url} target="_blank" rel="noreferrer" className="group block border-l-2 border-ochre pl-5">
                <p className="font-display text-[1.2rem] leading-snug text-ink">“{b.snippet!.replace(/^\.+\s*/, "…").replace(/\s*\.+$/, "…")}”</p>
                <p className="mt-2 text-sm text-ink-2 group-hover:text-moss">
                  <i>{b.title}</i>
                  {b.author ? `, ${b.author}` : ""}
                  {b.year ? `, ${b.year}` : ""}
                  {b.page ? `, p. ${b.page}` : ""} →
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
      {books === null ? (
        <p className="label text-ink-2">{t.searchingStacks}</p>
      ) : shelf.length === 0 ? (
        <p className="text-ink-2">{t.noBooks}</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {shelf.map((b) => (
            <li key={b.url} className="border-b rule">
              <a href={b.url} target="_blank" rel="noreferrer" className="flex gap-3 py-3 group">
                {b.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.thumb} alt="" loading="lazy" className="w-11 h-14 object-cover bg-paper-3 shrink-0 border rule" />
                ) : (
                  <span className="w-11 h-14 shrink-0 border border-ink/40 bg-[#e6dcc0] flex items-end justify-center pb-1">
                    <span className="font-mono text-[8px] text-ink-2">SL</span>
                  </span>
                )}
                <span className="min-w-0">
                  <span className="leading-snug group-hover:text-moss line-clamp-2">{b.title}</span>
                  <span className="block label text-ink-2 !text-[0.58rem] mt-1 truncate">
                    {b.source}
                    {b.year ? ` · ${b.year}` : ""}
                    {b.author ? ` · ${b.author}` : ""}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-sm">
        <a className="link-ink" target="_blank" rel="noreferrer" href={`https://www.biodiversitylibrary.org/name/${scientific.replace(/ /g, "_")}`}>
          {t.bhl[0]} <i>{scientific}</i> {t.bhl[1]}
        </a>
      </p>
    </div>
  );
}
