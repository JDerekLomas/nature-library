"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/LangProvider";

/** Share a species page: the phone's own share sheet where there is one, otherwise a small card of ways to send it. */
export default function ShareButton({ name, scientific, className = "" }: { name: string; scientific?: string; className?: string }) {
  const t = useT().widgets.share;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const label = scientific && scientific !== name ? `${name} (${scientific})` : name;

  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", off);
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", off);
    };
  }, [open]);

  const url = () => window.location.href.split("#")[0];
  const text = t.text(label);
  const go = async () => {
    // phones and tablets: the system share sheet (Messages, WhatsApp, AirDrop, Instagram...)
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: label, text, url: url() });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    setOpen((o) => !o);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  const enc = encodeURIComponent;
  const ways = () => [
    ["WhatsApp", `https://wa.me/?text=${enc(`${text} ${url()}`)}`],
    ["Telegram", `https://t.me/share/url?url=${enc(url())}&text=${enc(text)}`],
    ["X", `https://x.com/intent/post?text=${enc(text)}&url=${enc(url())}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${enc(url())}`],
    [t.email, `mailto:?subject=${enc(label)}&body=${enc(`${text}\n\n${url()}`)}`],
  ];

  return (
    <div ref={box} className={`relative inline-block ${className}`}>
      <button
        onClick={go}
        aria-label={t.aria(label)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="group inline-flex items-center gap-2 label text-ink-2 hover:text-moss border border-ink/25 hover:border-moss rounded-full pl-2.5 pr-3 py-1 bg-paper/60 transition-colors"
      >
        {/* an engraved sprig: three leaves on one stem, sent outward */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="6" cy="12" r="2.6" />
          <circle cx="18" cy="5.5" r="2.6" />
          <circle cx="18" cy="18.5" r="2.6" />
          <path d="M8.3 10.8 15.7 6.7M8.3 13.2l7.4 4.1" />
        </svg>
        {t.button}
      </button>
      {open && (
        <div role="dialog" aria-label={t.title} className="absolute right-0 top-full mt-2 z-40 w-[264px] border border-ink bg-[#f6f1e4] text-ink normal-case tracking-normal font-serif text-left shadow-[0_14px_34px_-14px_rgba(27,29,22,0.45)] p-4 fade-up">
          <div className="flex items-baseline justify-between border-b rule pb-2">
            <p className="label text-ink-2">{t.title}</p>
            <button onClick={() => setOpen(false)} aria-label={t.close} className="text-ink-2 hover:text-ink leading-none text-lg -mt-1">
              ×
            </button>
          </div>
          <p className="font-display text-xl leading-tight mt-3">{name}</p>
          {scientific && scientific !== name && <p className="latin text-sm text-moss">{scientific}</p>}
          <button onClick={copy} className="mt-4 w-full flex items-center justify-between border border-ink px-3 py-2 text-sm hover:bg-ink hover:text-paper transition-colors">
            <span>{copied ? t.copied : t.copy}</span>
            <span aria-hidden>{copied ? "✓" : "⧉"}</span>
          </button>
          <ul className="mt-3 grid grid-cols-2 gap-x-3">
            {ways().map(([n, href]) => (
              <li key={n}>
                <a href={href} target="_blank" rel="noreferrer" className="flex justify-between py-1.5 text-[0.92rem] border-b rule hover:text-moss whitespace-nowrap">
                  <span>{n}</span> <span className="text-ink-2">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
