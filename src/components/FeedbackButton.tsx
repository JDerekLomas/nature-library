"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/i18n/LangProvider";

/**
 * Where messages go: the Source Library's feedback inbox, which accepts posts from
 * this site's origin (sourcelibrary src/lib/sister-sites.ts). The Nature Library
 * keeps no database, so a message is read and answered in the same queue as the
 * Source Library's own.
 */
const INBOX = "https://sourcelibrary.org/api/feedback";

/**
 * A note to the librarians, from any page. `variant="pill"` sits beside the share
 * button on a species sheet and asks for corrections; the default is a plain link
 * for the footer.
 */
export default function FeedbackButton({ variant = "link", className = "" }: { variant?: "link" | "pill"; className?: string }) {
  const t = useT().widgets.feedback;
  const copy = variant === "pill" ? t.correction : t.general;
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [path, setPath] = useState("/");
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setPath(window.location.pathname + window.location.search);
    box.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  const send = async () => {
    if (!message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch(INBOX, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), email: email.trim() || null, page: path }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      setMessage("");
      setEmail("");
      setTimeout(() => { setOpen(false); setStatus("idle"); }, 2400);
    } catch {
      setStatus("error");
    }
  };

  const dialog = open
    ? createPortal(
        <div className="fixed inset-0 z-[100] bg-ink/40 flex items-start sm:items-center justify-center p-4 pt-16 sm:pt-4" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={copy.title}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md border border-ink bg-[#f6f1e4] text-ink font-serif shadow-[0_14px_34px_-14px_rgba(27,29,22,0.45)] p-5 fade-up max-h-[85dvh] overflow-y-auto"
          >
            <div className="flex items-baseline justify-between border-b rule pb-2">
              <p className="label text-ink-2">{t.label}</p>
              <button onClick={() => setOpen(false)} aria-label={t.close} className="text-ink-2 hover:text-ink leading-none text-lg -mt-1">
                ×
              </button>
            </div>
            {status === "sent" ? (
              <div className="py-6 text-center">
                <p className="font-display text-2xl leading-tight">{t.thanks}</p>
                <p className="text-sm text-ink-2 mt-1">{t.received}</p>
              </div>
            ) : (
              <>
                <p className="font-display text-2xl leading-tight mt-3">{copy.title}</p>
                <p className="text-sm text-ink-2 mt-1">{copy.intro}</p>
                <textarea
                  ref={box}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={copy.placeholder}
                  rows={5}
                  maxLength={5000}
                  className="mt-4 w-full border border-ink/40 bg-paper/50 px-3 py-2 text-[0.95rem] placeholder:text-ink-2/60 focus:outline-none focus:border-moss resize-y"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.email}
                  autoComplete="email"
                  className="mt-2 w-full border border-ink/40 bg-paper/50 px-3 py-2 text-[0.95rem] placeholder:text-ink-2/60 focus:outline-none focus:border-moss"
                />
                <div className="mt-4 flex flex-col-reverse sm:flex-row sm:items-center gap-3">
                  <p className="label text-ink-2/70 truncate min-w-0 flex-1">{t.from(path)}</p>
                  <button
                    onClick={send}
                    disabled={!message.trim() || status === "sending"}
                    className="border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
                  >
                    {status === "sending" ? t.sending : status === "error" ? t.retry : t.send}
                  </button>
                </div>
                {status === "error" && <p className="text-sm text-stamp mt-2">{t.failed}</p>}
              </>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {variant === "pill" ? (
        <button
          onClick={() => { setStatus("idle"); setOpen(true); }}
          aria-haspopup="dialog"
          className={`inline-flex items-center gap-2 label text-ink-2 hover:text-moss border border-ink/25 hover:border-moss rounded-full pl-2.5 pr-3 py-1 bg-paper/60 transition-colors ${className}`}
        >
          {/* a quill, for a note in the margin */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 4C12 5 7 10 5 19" />
            <path d="M20 4c-1 6-5 10-11 11" />
            <path d="M4 21l1-2" />
          </svg>
          {t.correction.button}
        </button>
      ) : (
        <button onClick={() => { setStatus("idle"); setOpen(true); }} aria-haspopup="dialog" className={`text-left hover:text-moss ${className}`}>
          {t.general.button}
        </button>
      )}
      {dialog}
    </>
  );
}
