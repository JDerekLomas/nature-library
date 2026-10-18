"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadIdentifier, identify, speciesNear, type Result } from "./bioclip";

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

const CAUTION: Record<string, string> = {
  Fungi: "Mushrooms are among the hardest things to identify from a photo, and several deadly species have edible twins. Never eat a wild mushroom on the strength of any app.",
  Plantae: "Never eat or handle an unfamiliar wild plant on the strength of a photo match. Check the sheet for toxic lookalikes.",
  Reptilia: "If this is a snake, keep your distance whatever the identification says.",
  Arachnida: "Some spiders and scorpions are venomous. Do not handle.",
};

async function toBitmap(file: File) {
  return createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
}

export default function IdentifyDesk({ ai }: { ai: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<(Result & { searched: number }) | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Record<number, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
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
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setBitmap(await toBitmap(f));
  };

  const run = async (bmp = bitmap, near = nearby?.ids) => {
    if (!bmp) return;
    setBusy(true);
    setErr(null);
    try {
      setStage("Comparing against the core field guide…");
      const r = await identify(bmp, near, setStage);
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
  const caution = top ? CAUTION[top.iconic] : null;
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
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Your photograph" className="w-full aspect-[4/5] object-cover" />
          ) : (
            <div className="aspect-[4/5] border border-dashed border-ink/50 flex flex-col items-center justify-center text-center px-8">
              <svg width="56" height="56" viewBox="0 0 56 56" className="text-moss" aria-hidden>
                <circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M35 35l14 14" stroke="currentColor" strokeWidth="2" />
                <path d="M24 33c0-8 3-13 9-15-1 8-4 12-9 15zM24 33c0-6-2-10-7-12 0 6 3 10 7 12z" fill="currentColor" opacity=".8" />
              </svg>
              <p className="font-display text-2xl mt-4">Lay your specimen here</p>
              <p className="text-sm text-ink-2 mt-2">Drop a photograph, or tap to take one. Fill the frame with one leaf, flower, cap or animal.</p>
            </div>
          )}
        </div>
        <input ref={input} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => take(e.target.files?.[0])} />

        {loadingModel && (
          <div className="mt-5">
            <p className="label text-ink-2">Fetching the field guide into your browser… {Math.round((progress ?? 0) * 100)}%</p>
            <div className="h-1 bg-paper-3 mt-2">
              <div className="h-full bg-moss transition-all" style={{ width: `${(progress ?? 0) * 100}%` }} />
            </div>
            <p className="text-xs text-ink-2 mt-2">About 87 MB, downloaded once and kept by your browser for next time.</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => (bitmap ? run() : input.current?.click())}
            disabled={busy || loadingModel}
            className="px-6 py-3 bg-ink text-paper font-display text-lg disabled:opacity-40 hover:bg-moss transition-colors"
          >
            {busy ? "Comparing…" : bitmap ? "Identify again" : "Choose a photograph"}
          </button>
          <button onClick={useLocation} disabled={locating} className="px-4 py-3 border border-ink text-sm hover:bg-paper-2 disabled:opacity-50">
            {nearby ? `Using species near ${nearby.place}` : locating ? "Finding what lives near you…" : "Favour species near me"}
          </button>
        </div>
        {nearby && <p className="text-xs text-ink-2 mt-2">{nearby.ids.size.toLocaleString()} species have been recorded within 75 km of you; they are weighted up.</p>}
        {err && <p className="mt-4 text-stamp">{err}</p>}
      </div>

      <div className="min-w-0">
        {!res && !busy && (
          <div className="text-ink-2 leading-relaxed max-w-[56ch]">
            <p className="font-display text-3xl text-ink leading-tight">How the desk works</p>
            <ol className="mt-6 space-y-4">
              <li>
                <span className="font-mono text-rust mr-3">i</span>The desk uses BioCLIP, a vision model trained on more than ten million images across the tree of life, and runs it
                entirely in your browser. Your photograph never leaves your device.
              </li>
              <li>
                <span className="font-mono text-rust mr-3">ii</span>It compares the photo against the 10,000 most-recorded species on iNaturalist, then searches the 10,000 most-recorded
                within whichever groups it looks like (birds, plants, insects, fungi, fish…), up to about 30,000 candidates, each described by its full scientific lineage.
              </li>
              <li>
                <span className="font-mono text-rust mr-3">iii</span>Share your location and it favours species naturalists have actually recorded near you, which corrects most confusions
                between look-alikes from different continents.
              </li>
            </ol>
            <p className="mt-8 text-sm border-l-2 border-stamp pl-4">Never eat, touch or handle something on the strength of a photo identification.</p>
          </div>
        )}
        {busy && (
          <div className="space-y-3">
            <p className="label text-ink-2">{stage ?? "Comparing against the keys…"}</p>
            {[1, 2, 3].map((k) => (
              <div key={k} className="h-24 bg-paper-2 animate-pulse" />
            ))}
          </div>
        )}
        {res && !busy && (
          <div className="fade-up">
            <p className="label text-ink-2">
              Determination · {res.confident ? "confident" : "uncertain"} · {res.searched.toLocaleString()} species compared in {(res.ms / 1000).toFixed(1)} s on your device
            </p>
            {!res.confident && (
              <p className="mt-3 text-ink-2">
                {res.genus ? (
                  <>
                    Most likely a member of the genus <i className="text-ink">{res.genus.name}</i> ({Math.round(res.genus.p * 100)}%), species uncertain.{" "}
                  </>
                ) : (
                  "No single species stands out. "
                )}
                A closer, sharper photo of one leaf, flower or the underside of a cap will help.
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
                      <img src={photos[g.id]} alt={`Reference photo of ${g.common || g.name}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                      <p className="font-display text-2xl leading-none">{g.common ? g.common.charAt(0).toUpperCase() + g.common.slice(1) : g.name}</p>
                      {g.local && <span className="label text-moss !text-[0.56rem]">recorded near you</span>}
                    </div>
                    <p className="latin text-moss mt-1">{g.name}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 w-40 bg-paper-3">
                        <div className="h-full bg-moss" style={{ width: `${Math.max(2, Math.round(g.p * 100))}%` }} />
                      </div>
                      <span className="font-mono text-xs">{g.p < 0.01 ? "<1" : Math.round(g.p * 100)}%</span>
                    </div>
                    <Link href={g.slug ? `/species/${g.slug}` : `/taxon/${g.id}`} className="inline-block mt-3 label text-moss hover:text-rust">
                      {g.slug ? "Open its specimen sheet" : "Open in the library"} — compare the photographs →
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-xs text-ink-2 max-w-[70ch]">
              BioCLIP (Imageomics Institute, MIT licence) compared against species on iNaturalist. In published tests on real field photos it names the right species
              first about two times in three, and within its top five about nine times in ten. It knows only species on its list; rarer ones may come back as a close
              relative.
            </p>
            {ai && (
              <div className="mt-8 border-t rule pt-6">
                <button onClick={askAi} disabled={aiBusy} className="px-4 py-2 border border-ink text-sm hover:bg-paper-2 disabled:opacity-50">
                  {aiBusy ? "The librarian is looking…" : "Ask the librarian for a second opinion"}
                </button>
                {aiRes && (
                  <div className="mt-5 space-y-3 text-sm">
                    {aiRes.observed.length > 0 && <p className="text-ink-2">Seen: {aiRes.observed.join("; ")}.</p>}
                    {aiRes.candidates.slice(0, 3).map((c, i) => (
                      <p key={i}>
                        <b className="font-semibold">{c.common}</b> <i>{c.scientific}</i> · {Math.round(c.confidence * 100)}% — {c.why}{" "}
                        {c.href && (
                          <Link href={c.href} className="link-ink text-moss">
                            open
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
