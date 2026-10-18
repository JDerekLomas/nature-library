"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Hit {
  id: number;
  name: string;
  preferred_common_name?: string;
  rank: string;
  iconic_taxon_name?: string;
  default_photo?: { square_url: string };
}

export default function SearchBox({ autoFocus = false, big = false }: { autoFocus?: boolean; big?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(q)}&per_page=8&locale=en`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((j) => {
          setHits(j.results || []);
          setActive(-1);
          setOpen(true);
        })
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const go = (h?: Hit) => {
    setOpen(false);
    if (h) router.push(`/taxon/${h.id}`);
    else if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div ref={box} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(active >= 0 ? hits[active] : undefined);
        }}
        className={`flex items-center border-b border-ink/60 focus-within:border-moss ${big ? "py-3" : "py-1"}`}
      >
        <svg width={big ? 20 : 15} height={big ? 20 : 15} viewBox="0 0 20 20" className="text-ink-2 shrink-0" aria-hidden>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12.5 12.5L18 18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <input
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(hits.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          placeholder={big ? "Look up any living thing — “neem”, “Quercus”, “axolotl”…" : "Look up any living thing"}
          className={`w-full bg-transparent outline-none px-2 placeholder:text-ink-2/60 ${big ? "text-xl font-display" : "text-sm"}`}
          aria-label="Search species"
        />
      </form>
      {open && hits.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full min-w-[300px] right-0 bg-card border border-ink/70 shadow-[0_18px_40px_-20px_#0006]">
          {hits.map((h, i) => (
            <li key={h.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => go(h)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left border-b rule last:border-0 ${i === active ? "bg-paper-2" : ""}`}
              >
                {h.default_photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.default_photo.square_url} alt="" className="w-9 h-9 object-cover shrink-0 grayscale-[.2]" />
                ) : (
                  <span className="w-9 h-9 bg-paper-3 shrink-0" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm truncate">{h.preferred_common_name || h.name}</span>
                  <span className="block text-xs text-ink-2 truncate">
                    <i className="latin">{h.name}</i> · {h.rank}
                    {h.iconic_taxon_name ? ` · ${h.iconic_taxon_name}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
          <li>
            <button onClick={() => go()} className="w-full text-left px-3 py-2 label text-moss hover:bg-paper-2">
              All results for “{q}” →
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
