import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getByInat } from "@/lib/codex";
import { PLATES } from "@/lib/plates";
import { getTaxon, getChildren, photosOf, stripHtml, RANK_LABEL } from "@/lib/inat";
import PhotoPlate from "@/components/PhotoPlate";
import WhereItLives from "@/components/WhereItLives";
import Stacks from "@/components/Stacks";
import FieldNotes from "@/components/FieldNotes";
import Sounds from "@/components/Sounds";
import { Section, Plates, IucnStamp } from "@/components/Sheet";
import { wikiSections } from "@/lib/wikipedia";
import type { Plate } from "@/lib/types";

export const revalidate = 604800;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const t = await getTaxon(Number((await params).id));
  if (!t) return {};
  return { title: `${t.preferred_common_name ?? t.name} (${t.name})`, description: stripHtml(t.wikipedia_summary).slice(0, 200) };
}

function platesFor(names: string[]): Plate[] {
  const terms = names.filter((n) => n && n.length > 3).map((n) => n.toLowerCase());
  if (!terms.length) return [];
  return PLATES.filter((p) => {
    const d = (p.desc + " " + (p.long ?? "")).toLowerCase();
    return terms.some((t) => d.includes(t));
  }).slice(0, 12);
}

export default async function TaxonPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();
  const codex = getByInat(id);
  if (codex) redirect(`/species/${codex.slug}`);
  const t = await getTaxon(id);
  if (!t) notFound();

  const isSpecies = t.rank_level <= 10;
  const name = t.preferred_common_name || t.name;
  const photos = photosOf(t);
  const summary = stripHtml(t.wikipedia_summary);
  const ancestors = (t.ancestors ?? []).filter((a) => a.rank !== "stateofmatter");
  const children = isSpecies ? [] : await getChildren(id, 60);
  const plates = platesFor([t.name, isSpecies ? t.preferred_common_name ?? "" : ""]);
  const wiki = await wikiSections(t.wikipedia_url);
  const aiOn = !!process.env.ANTHROPIC_API_KEY;
  const iucn = t.conservation_status?.authority?.includes("IUCN") ? statusCode(t.conservation_status.status) : undefined;

  return (
    <article className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-8">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 label text-ink-2 border-b border-ink pb-2">
        <span className="text-ink">iNat·{t.id}</span>
        <span>{RANK_LABEL[t.rank] ?? t.rank}</span>
        {t.iconic_taxon_name && <span>{t.iconic_taxon_name}</span>}
        <span>{t.observations_count.toLocaleString()} field observations</span>
        {t.extinct && <span className="text-stamp">Extinct</span>}
        <span className="ml-auto hidden sm:inline">The Nature Library · Open stacks</span>
      </div>

      {ancestors.length > 0 && (
        <ol className="flex flex-wrap items-center gap-y-1 text-sm mt-3 text-ink-2">
          {ancestors.map((a, i) => (
            <li key={a.id} className="flex items-center">
              {i > 0 && <span className="mx-1.5">›</span>}
              <Link href={`/taxon/${a.id}`} className="hover:text-moss">
                {a.rank_level <= 20 ? <i>{a.name}</i> : a.preferred_common_name ? `${a.preferred_common_name}` : a.name}
              </Link>
            </li>
          ))}
        </ol>
      )}

      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-10 lg:gap-16 mt-8">
        <div className="lg:sticky lg:top-24 self-start">
          <PhotoPlate photos={photos} alt={name} />
          {iucn && (
            <div className="mt-6 text-center">
              <IucnStamp code={iucn} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.95] tracking-tight">{name}</h1>
          {t.preferred_common_name && <p className="latin text-2xl mt-2 text-moss">{t.name}</p>}
          {(wiki?.lead || summary) && (
            <div className="mt-8 space-y-4 max-w-[68ch]">
              {(wiki?.lead && wiki.lead.length > summary.length ? wiki.lead : summary).split(/\n\n+/).map((p, i) => (
                <p key={i} className={i === 0 ? "drop-cap text-[1.15rem] leading-[1.65]" : "text-ink-2 leading-relaxed"}>
                  {p}
                </p>
              ))}
            </div>
          )}
          {t.wikipedia_url && (
            <a href={t.wikipedia_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm link-ink text-ink-2">
              Continue reading on Wikipedia
            </a>
          )}

          {isSpecies ? (
            <div className="mt-12">
              {wiki && wiki.sections.length > 0 && (
                <div>
                  <p className="label text-ink-2 border-b rule pb-2">
                    From the article{" "}
                    <a href={wiki.url} className="link-ink" target="_blank" rel="noreferrer">
                      {wiki.title}
                    </a>{" "}
                    on Wikipedia (CC BY-SA), quoted section by section
                  </p>
                  <div className="mt-8">
                  {wiki.sections.map((w, i) => (
                    <Section key={w.key} n={String(i + 1)} title={w.title}>
                      {w.key === "toxicity" ? (
                        <div className="border-l-2 border-stamp pl-5">
                          <WikiText text={w.text} />
                        </div>
                      ) : (
                        <WikiText text={w.text} />
                      )}
                      {w.heading.toLowerCase() !== w.title.toLowerCase() && <p className="label text-ink-2 mt-3 !text-[0.58rem]">Wikipedia: “{w.heading}”</p>}
                    </Section>
                  ))}
                  </div>
                </div>
              )}
              {aiOn && (
                <div className="mt-12">
                  <FieldNotes taxonId={t.id} name={name} />
                </div>
              )}
            </div>
          ) : (
            <div className="mt-12">
              <p className="label text-ink-2 mb-4">
                {children.length} branches of this {RANK_LABEL[t.rank]?.toLowerCase() ?? "group"}, most-observed first
                {t.complete_species_count ? ` · about ${t.complete_species_count.toLocaleString()} known species` : ""}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {children.map((c) => (
                  <Link key={c.id} href={`/taxon/${c.id}`} className="group">
                    <div className="aspect-square bg-paper-3 overflow-hidden border rule">
                      {c.default_photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.default_photo.medium_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      )}
                    </div>
                    <p className="text-sm mt-1.5 leading-tight group-hover:text-moss">{c.preferred_common_name || c.name}</p>
                    <p className="text-xs text-ink-2">
                      <span className="label !text-[0.55rem] mr-1">{c.rank}</span>
                      <i>{c.name}</i>
                    </p>
                  </Link>
                ))}
              </div>
              <Link href={`/wheel?focus=${t.id}`} className="inline-block mt-6 label text-moss hover:text-rust">
                See this branch on the Wheel of Life →
              </Link>
            </div>
          )}
        </div>
      </div>

      {isSpecies && ["Aves", "Amphibia", "Insecta", "Mammalia"].includes(t.iconic_taxon_name ?? "") && (
        <Section n="·" title="Listen">
          <Sounds inatId={t.id} name={name} />
        </Section>
      )}

      <Section n="·" title="Where it lives">
        <WhereItLives name={t.name} />
      </Section>

      {plates.length > 0 && (
        <Section n="·" title="In the old herbals & bestiaries">
          <Plates plates={plates} name={name} />
        </Section>
      )}

      <Section n="·" title="In the stacks">
        <Stacks names={t.preferred_common_name ? [t.name, t.preferred_common_name] : [t.name]} scientific={t.name} />
      </Section>

      <p className="mt-16 text-xs text-ink-2 max-w-[90ch] leading-relaxed">
        This page is assembled live from iNaturalist, GBIF, Wikipedia, the Source Library and the Internet Archive. It is not yet part of the hand-edited
        codex.{" "}
        <a className="link-ink" href={`https://www.inaturalist.org/taxa/${t.id}`} target="_blank" rel="noreferrer">
          iNaturalist taxon {t.id}
        </a>
        .
      </p>
    </article>
  );
}

function statusCode(s: string) {
  const m: Record<string, string> = {
    lc: "LC", nt: "NT", vu: "VU", en: "EN", cr: "CR", ew: "EW", ex: "EX", dd: "DD",
    "least concern": "LC", "near threatened": "NT", vulnerable: "VU", endangered: "EN", "critically endangered": "CR",
  };
  return m[s.toLowerCase()];
}

function WikiText({ text }: { text: string }) {
  return (
    <div className="space-y-3 max-w-[70ch] leading-relaxed">
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
