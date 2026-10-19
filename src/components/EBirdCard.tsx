import { ebirdFor } from "@/lib/birds";
import { dict } from "@/i18n/dict";
import type { Lang } from "@/i18n/config";

/** For birds: the way out to eBird's live sightings, maps and recordings. */
export default function EBirdCard({ sci, inat, lang }: { sci: string; inat?: number; lang: Lang }) {
  const b = ebirdFor(sci, inat, lang);
  if (!b) return null;
  const t = dict(lang).rooms.checklist;
  return (
    <a href={`https://ebird.org/species/${b.code}`} target="_blank" rel="noreferrer" className="group block border border-ink bg-card p-5 mt-6 hover:bg-paper-2">
      <p className="label text-ink-2">{t.onEbird} ↗</p>
      <p className="font-display text-2xl mt-1 group-hover:text-moss">{b.name}</p>
      <p className="text-sm text-ink-2 mt-1 leading-snug">{t.ebirdBlurb}</p>
    </a>
  );
}
