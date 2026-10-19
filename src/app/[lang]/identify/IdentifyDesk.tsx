"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadIdentifier, identify, speciesNear, type Result } from "./bioclip";
import { useLang, useT } from "@/i18n/LangProvider";
import { lp } from "@/i18n/config";

interface AiCandidate {
  scientific: string;
  common: string;
  rank: string;
  confidence: number;
  why: string;
  lookalikes: string;
  href: string | null;
}
interface AiResult {
  observed: string[];
  candidates: AiCandidate[];
  caution: string | null;
  photo_tips: string | null;
}


const HEIC2ANY = "https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js";

function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => res();
    el.onerror = () => rej(new Error("load failed"));
    document.head.appendChild(el);
  });
}

const isHeic = (f: Blob & { name?: string }) => /hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name ?? "");

/** iPhone photos are often HEIC, which Chrome and Firefox cannot decode: convert those to JPEG in the browser. */
async function toJpegIfNeeded(file: File): Promise<Blob> {
  if (!isHeic(file)) return file;
  await loadScript(HEIC2ANY);
  const heic2any = (window as unknown as { heic2any: (o: { blob: Blob; toType: string; quality: number }) => Promise<Blob | Blob[]> }).heic2any;
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  return Array.isArray(out) ? out[0] : out;
}

async function toBitmap(file: Blob) {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
  } catch {
    // some browsers reject the options object; and HEIC may slip through without a .heic name
    try {
      return await createImageBitmap(file);
    } catch {
      if (!isHeic(file as File)) {
        await loadScript(HEIC2ANY);
        const heic2any = (window as unknown as { heic2any: (o: { blob: Blob; toType: string; quality: number }) => Promise<Blob | Blob[]> }).heic2any;
        const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 }).catch(() => null);
        if (out) return createImageBitmap(Array.isArray(out) ? out[0] : out);
      }
      throw new Error("unreadable");
    }
  }
}

/** A preview drawn from the decoded image, so what you see is exactly what the desk reads. */
function previewOf(bmp: ImageBitmap) {
  const k = Math.min(1, 1000 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

export default function IdentifyDesk({ ai }: { ai: boolean }) {
  const lang = useLang();
  const t = useT().identify;
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [file, setFile] = useState<Blob | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<(Result & { searched: number }) | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Record<number, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [decoding, setDecoding] = useState(false);
  const [nearby, setNearby] = useState<{ ids: Set<number>; place: string } | null>(null);
  const [locating, setLocating] = useState(false);
  const [aiRes, setAiRes] = useState<AiResult | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  // start fetching the model as soon as the desk opens
  useEffect(() => {
    loadIdentifier((f) => setProgress(f)).catch((e) => setErr((e as Error).message));
  }, []);

  const take = async (f?: File | null) => {
    if (!f) return;
    setRes(null);
    setAiRes(null);
    setErr(null);
    setPreview(null);
    setBitmap(null);
    setDecoding(true);
    try {
      const blob = await toJpegIfNeeded(f);
      const bmp = await toBitmap(blob);
      setFile(blob instanceof File ? blob : new File([blob], "photo.jpg", { type: "image/jpeg" }));
      setPreview(previewOf(bmp));
      setBitmap(bmp);
    } catch {
      setErr(t.unreadable);
    } finally {
      setDecoding(false);
    }
  };

  const run = async (bmp = bitmap, near = nearby?.ids) => {
    if (!bmp) return;
    setBusy(true);
    setErr(null);
    try {
      setStage(t.stageCore);
      const r = await identify(bmp, near, (gs) => setStage(t.stageDeeper(gs.map((g) => t.groupNames[g] ?? g).join(` ${t.and} `))));
      setStage(null);
      setRes(r);
      const ids = r.guesses.slice(0, 6).map((g) => g.id);
      fetch(`https://api.inaturalist.org/v1/taxa/${ids.join(",")}`)
        .then((x) => x.json())
        .then((j) => setPhotos(Object.fromEntries((j.results ?? []).map((t: { id: number; default_photo?: { medium_url: string } }) => [t.id, t.default_photo?.medium_url ?? ""]))))
        .catch(() => {});
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // identify automatically once both photo and model are ready
  useEffect(() => {
    if (bitmap && progress === 1 && !res && !busy) run(bitmap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bitmap, progress]);

  const useLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const ids = await speciesNear(p.coords.latitude, p.coords.longitude);
          const n = { ids, place: `${p.coords.latitude.toFixed(1)}°, ${p.coords.longitude.toFixed(1)}°` };
          setNearby(n);
          if (bitmap) run(bitmap, ids);
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  };

  const askAi = async () => {
    if (!file) return;
    setAiBusy(true);
    try {
      const bmp = await toBitmap(file);
      const k = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * k);
      c.height = Math.round(bmp.height * k);
      c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
      const r = await fetch("/api/identify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: c.toDataURL("image/jpeg", 0.86) }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setAiRes(j);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  };

  const top = res?.guesses[0];
  const caution = top ? t.caution[top.iconic] : null;
  const loadingModel = progress !== null && progress < 1;

  return (
    <div className="grid lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] gap-10 lg:gap-14">
      <div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            take(e.dataTransfer.files?.[0]);
          }}
          onClick={() => input.current?.click()}
          className={`mount cursor-pointer ${drag ? "outline outline-2 outline-moss" : ""}`}
        >
          {decoding ? (
            <div className="aspect-[4/5] border border-dashed border-ink/50 flex items-center justify-center text-center px-8">
              <p className="label text-ink-2">{t.decoding}</p>
            </div>
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={t.photoAlt} className="w-full aspect-[4/5] object-cover" />
          ) : (
            <div className="aspect-[4/5] border border-dashed border-ink/50 flex flex-col items-center justify-center text-center px-8">
              <svg width="56" height="56" viewBox="0 0 56 56" className="text-moss" aria-hidden>
                <circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M35 35l14 14" stroke="currentColor" strokeWidth="2" />
                <path d="M24 33c0-8 3-13 9-15-1 8-4 12-9 15zM24 33c0-6-2-10-7-12 0 6 3 10 7 12z" fill="currentColor" opacity=".8" />
              </svg>
              <p className="font-display text-2xl mt-4">{t.layHere}</p>
              <p className="text-sm text-ink-2 mt-2">{t.dropHint}</p>
            </div>
          )}
        </div>
        <input ref={input} type="file" accept="image/*,.heic,.heif" capture="environment" className="hidden" onChange={(e) => take(e.target.files?.[0])} />

        {loadingModel && (
          <div className="mt-5">
            <p className="label text-ink-2">{t.fetching(Math.round((progress ?? 0) * 100))}</p>
            <div className="h-1 bg-paper-3 mt-2">
              <div className="h-full bg-moss transition-all" style={{ width: `${(progress ?? 0) * 100}%` }} />
            </div>
            <p className="text-xs text-ink-2 mt-2">{t.fetchNote}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => (bitmap ? run() : input.current?.click())}
            disabled={busy || loadingModel}
            className="px-6 py-3 bg-ink text-paper font-display text-lg disabled:opacity-40 hover:bg-moss transition-colors"
          >
            {busy ? t.comparing : bitmap ? t.again : t.choose}
          </button>
          <button onClick={useLocation} disabled={locating} className="px-4 py-3 border border-ink text-sm hover:bg-paper-2 disabled:opacity-50">
            {nearby ? t.usingNear(nearby.place) : locating ? t.findingNear : t.favourNear}
          </button>
        </div>
        {nearby && <p className="text-xs text-ink-2 mt-2">{t.nearNote(nearby.ids.size.toLocaleString(lang))}</p>}
        {err && <p className="mt-4 text-stamp">{err}</p>}
      </div>

      <div className="min-w-0">
        {!res && !busy && (
          <div className="text-ink-2 leading-relaxed max-w-[56ch]">
            <p className="font-display text-3xl text-ink leading-tight">{t.howTitle}</p>
            <ol className="mt-6 space-y-4">
              {t.how.map((h, i) => (
                <li key={i}>
                  <span className="font-mono text-rust mr-3">{["i", "ii", "iii"][i]}</span>
                  {h}
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm border-l-2 border-stamp pl-4">{t.never}</p>
          </div>
        )}
        {busy && (
          <div className="space-y-3">
            <p className="label text-ink-2">{stage ?? t.stageDefault}</p>
            {[1, 2, 3].map((k) => (
              <div key={k} className="h-24 bg-paper-2 animate-pulse" />
            ))}
          </div>
        )}
        {res && !busy && (
          <div className="fade-up">
            <p className="label text-ink-2">
              {t.determination(res.confident, res.searched.toLocaleString(lang), (res.ms / 1000).toFixed(1))}
            </p>
            {!res.confident && (
              <p className="mt-3 text-ink-2">
                {res.genus ? (
                  <>
                    {t.genusLikely[0]} <i className="text-ink">{res.genus.name}</i> ({Math.round(res.genus.p * 100)}%), {t.genusLikely[1]}{" "}
                  </>
                ) : (
                  t.noneStandsOut
                )}
                {t.closer}
              </p>
            )}
            {caution && (
              <div className="mt-5 border border-stamp/70 bg-stamp/[0.05] px-4 py-3">
                <span className="label text-stamp mr-2">Caution</span>
                {caution}
              </div>
            )}
            <ol className="mt-6 space-y-5">
              {res.guesses.slice(0, 5).map((g, i) => (
                <li key={g.id} className="grid grid-cols-[96px_1fr] sm:grid-cols-[130px_1fr] gap-5 border-t border-ink pt-5">
                  <div className="aspect-square bg-paper-3 overflow-hidden">
                    {photos[g.id] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photos[g.id]} alt={t.refAlt(g.common || g.name)} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                      <p className="font-display text-2xl leading-none">{g.common ? g.common.charAt(0).toUpperCase() + g.common.slice(1) : g.name}</p>
                      {g.local && <span className="label text-moss !text-[0.56rem]">{t.recordedNear}</span>}
                    </div>
                    <p className="latin text-moss mt-1">{g.name}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 w-40 bg-paper-3">
                        <div className="h-full bg-moss" style={{ width: `${Math.max(2, Math.round(g.p * 100))}%` }} />
                      </div>
                      <span className="font-mono text-xs">{g.p < 0.01 ? "<1" : Math.round(g.p * 100)}%</span>
                    </div>
                    <Link href={lp(lang, g.slug ? `/species/${g.slug}` : `/taxon/${g.id}`)} className="inline-block mt-3 label text-moss hover:text-rust">
                      {g.slug ? t.openSheet : t.openLibrary}
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-xs text-ink-2 max-w-[70ch]">
              {t.footnote}
            </p>
            {ai && (
              <div className="mt-8 border-t rule pt-6">
                <button onClick={askAi} disabled={aiBusy} className="px-4 py-2 border border-ink text-sm hover:bg-paper-2 disabled:opacity-50">
                  {aiBusy ? t.aiLooking : t.aiAsk}
                </button>
                {aiRes && (
                  <div className="mt-5 space-y-3 text-sm">
                    {aiRes.observed.length > 0 && <p className="text-ink-2">{t.aiSeen}: {aiRes.observed.join("; ")}.</p>}
                    {aiRes.candidates.slice(0, 3).map((c, i) => (
                      <p key={i}>
                        <b className="font-semibold">{c.common}</b> <i>{c.scientific}</i> · {Math.round(c.confidence * 100)}% — {c.why}{" "}
                        {c.href && (
                          <Link href={lp(lang, c.href)} className="link-ink text-moss">
                            {t.aiOpen}
                          </Link>
                        )}
                      </p>
                    ))}
                    {aiRes.caution && <p className="text-stamp">{aiRes.caution}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
