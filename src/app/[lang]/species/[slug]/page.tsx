import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CODEX, getEntry, relatives, localize } from "@/lib/codex";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import { wikiSummaryIn } from "@/lib/wikipedia";
import PhotoPlate from "@/components/PhotoPlate";
import EBirdCard from "@/components/EBirdCard";
import ShareButton from "@/components/ShareButton";
import FeedbackButton from "@/components/FeedbackButton";
import WhereItLives from "@/components/WhereItLives";
import Stacks from "@/components/Stacks";
import SpecimenCard from "@/components/SpecimenCard";
import { toCard } from "@/lib/cards";
import GrowHere from "@/components/GrowHere";
import GerardPanel from "@/components/GerardPanel";
import { correctionsFor } from "@/lib/corrections";
import { Section, EdibilityScale, IucnStamp, Medicinal, Grow, FruitSeed, Abilities, AnimalFacts, FieldGuide, Plates, ShelfTags } from "@/components/Sheet";
import Sounds from "@/components/Sounds";

export function generateStaticParams() {
  return CODEX.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang: l, slug } = await params;
  const raw = getEntry(slug);
  if (!raw) return {};
  const e = localize(raw, asLang(l));
  return { title: `${e.common} (${e.scientific})`, description: e.summary };
}

export default async function SpeciesPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: l, slug } = await params;
  const lang = asLang(l);
  const raw = getEntry(slug);
  if (!raw) notFound();
  const e = localize(raw, lang);
  const T = dict(lang);
  const t = T.species;
  const L = (p: string) => lp(lang, p);
  const wikiLocal = lang === "en" ? null : await wikiSummaryIn(lang, raw.wiki?.url);
  const wiki = lang === "en" ? raw.wiki : wikiLocal ? { url: wikiLocal.url, extract: wikiLocal.extract } : undefined;
  const isAnimal = e.kingdom === "Animalia";
  const isFungus = e.kingdom === "Fungi";
  const rel = relatives(raw).map((x) => localize(x, lang));
  let n = 0;
  const sec = () => String(++n);

  return (
    <article className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-8">
      {/* accession line */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 label text-ink-2 border-b border-ink pb-2">
        <span className="text-ink">{e.nl}</span>
        <Link href={L("/wheel")} className="hover:text-moss">{T.common.kingdoms[e.kingdom] ?? e.kingdom}</Link>
        {e.family && <span>{e.family}</span>}
        {e.form && <span>{T.sheet.forms[e.form] ?? e.form}</span>}
        {e.observations ? <span>{T.common.observations(e.observations.toLocaleString(LOCALE[lang]))}</span> : null}
        <span className="ml-auto flex items-center gap-4">
          <span className="hidden sm:inline">{t.codex}</span>
          <FeedbackButton variant="pill" />
          <ShareButton name={e.common} scientific={e.scientific} />
        </span>
      </div>

      {(() => {
        // the first thing on the sheet of anything that can kill or poison, above the photograph, on every screen size
        const level = e.edibility === "deadly" || raw.shelves?.includes("deadly") ? "deadly" : e.edibility === "toxic" || raw.shelves?.includes("toxic") ? "toxic" : raw.shelves?.includes("venomous") ? "venomous" : null;
        if (!level) return null;
        const D = T.sheet.danger;
        const [word, line] = D[level];
        return (
          <div role="alert" className="mt-4 border-2 border-stamp bg-stamp/[0.07] px-4 py-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="stamp text-stamp border-stamp shrink-0">{word}</span>
            <span className="text-[0.98rem] leading-snug">{line}</span>
            <span className="text-xs text-ink-2 w-full">{D.emergency}</span>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-10 lg:gap-16 mt-8">
        <div className="lg:sticky lg:top-24 self-start">
          <PhotoPlate photos={e.photos ?? []} alt={e.common} nl={e.nl} />
          <div className="specimen-label mt-8 p-4 text-sm">
            <p className="label text-ink-2 text-center border-b rule pb-2 mb-3">{t.herbarium}</p>
            <dl className="grid grid-cols-[92px_1fr] gap-y-1.5">
              <dt className="label text-ink-2 pt-0.5">{t.name}</dt>
              <dd className="latin">{e.scientific}</dd>
              <dt className="label text-ink-2 pt-0.5">{t.family}</dt>
              <dd>{e.family ?? "—"}</dd>
              {e.nativeRange && (
                <>
                  <dt className="label text-ink-2 pt-0.5">{t.nativeTo}</dt>
                  <dd>{e.nativeRange}</dd>
                </>
              )}
              {e.biomes && (
                <>
                  <dt className="label text-ink-2 pt-0.5">{t.habitat}</dt>
                  <dd>{e.biomes.join(", ")}</dd>
                </>
              )}
            </dl>
            {e.iucn && (
              <div className="mt-4 text-center">
                <IucnStamp code={e.iucn} />
              </div>
            )}
          </div>
          <EBirdCard sci={e.scientific} inat={e.inatId} lang={lang} />
        </div>

        <div className="min-w-0">
          <header>
            <h1 className="font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.95] tracking-tight">{e.common}</h1>
            <p className="latin text-2xl mt-2 text-moss">{e.scientific}</p>
            {e.otherNames && e.otherNames.length > 0 && (
              <p className="mt-4 text-ink-2 leading-relaxed">
                <span className="label mr-2">{t.alsoCalled}</span>
                {e.otherNames.join(" · ")}
              </p>
            )}
            <div className="mt-4">
              <ShelfTags shelves={e.shelves} />
            </div>
            <p className="drop-cap mt-8 text-[1.2rem] leading-[1.65] max-w-[68ch]">{e.summary}</p>
            {lang !== "en" && !e.translated && <p className="mt-6 text-sm border-l-2 border-ochre pl-3 text-ink-2">{t.notTranslated}</p>}
            {wiki?.extract && (
              <p className="mt-5 text-ink-2 leading-relaxed max-w-[68ch]">
                {wiki.extract}{" "}
                <a href={wiki.url} className="link-ink text-sm" target="_blank" rel="noreferrer">
                  Wikipedia
                </a>
              </p>
            )}
          </header>

          <div className="mt-12">
            {e.abilities && e.abilities.length > 0 && (
              <Section n={sec()} title={t.s.abilities}>
                <Abilities items={e.abilities} />
              </Section>
            )}

            {e.animal && (e.animal.fieldMarks?.length || e.animal.whereToSee) && (
              <Section n={sec()} title={t.s.field}>
                <FieldGuide a={e.animal} />
              </Section>
            )}

            {e.animal && (e.animal.voice || ["Bird", "Amphibian", "Insect", "Mammal"].includes(e.form ?? "")) && e.kingdom === "Animalia" && (
              <Section n={sec()} title={t.s.listen}>
                <Sounds inatId={e.inatId} name={e.common} />
              </Section>
            )}

            {e.animal && (
              <Section n={sec()} title={t.s.life}>
                <AnimalFacts a={e.animal} />
              </Section>
            )}

            {!isAnimal && e.edibility && (
              <Section n={sec()} title={t.s.table}>
                <EdibilityScale value={e.edibility} note={e.edibilityNote} parts={e.edibleParts} />
              </Section>
            )}

            {e.medicinal && e.medicinal.uses?.length > 0 && (
              <Section n={sec()} title={t.s.medicine}>
                <Medicinal m={e.medicinal} />
              </Section>
            )}

            {(e.fruit || e.seed) && (
              <Section n={sec()} title={isFungus ? t.s.fungusFruit : e.fruit ? t.s.fruitSeed : t.s.seed}>
                <FruitSeed fruit={e.fruit} seed={e.seed} fungal={isFungus} seedPhotos={e.seedPhotos} fruitPhotos={e.fruitPhotos} />
              </Section>
            )}

            {e.grow && (
              <Section n={sec()} title={isFungus ? t.s.cultivate : t.s.grow}>
                <Grow g={e.grow} />
                {e.kingdom === "Plantae" && e.grow.zones && (
                  <div className="mt-8">
                    <GrowHere zones={e.grow.zones} name={e.common} />
                  </div>
                )}
              </Section>
            )}
          </div>
        </div>
      </div>

      <Section n={sec()} title={t.s.where} id="where">
        <WhereItLives gbifKey={e.gbifKey} name={e.scientific} nativeRange={e.nativeRange} />
      </Section>

      {e.gerard && (
        <Section n={sec()} title={t.s.gerard}>
          <GerardPanel g={e.gerard} name={e.common} />
        </Section>
      )}

      {e.plates && e.plates.length > 0 && (
        <Section n={sec()} title={t.s.plates}>
          <p className="text-ink-2 mb-6 max-w-[70ch]">
            {e.plates.every((p) => p.m === "relative") ? t.platesRelatives(e.kingdom === "Animalia") : t.platesNamed} {t.platesClick}
          </p>
          <Plates plates={e.plates} name={e.common} />
        </Section>
      )}

      <Section n={sec()} title={t.s.stacks}>
        <Stacks names={[e.scientific, e.common]} scientific={e.scientific} />
      </Section>

      {(e.lore || e.funFact) && (
        <Section n={sec()} title={t.s.marginalia}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {e.lore && (
              <blockquote className="font-display text-[1.45rem] leading-snug border-l-2 border-moss pl-6">{e.lore}</blockquote>
            )}
            {e.funFact && (
              <div className="bg-card border rule p-6">
                <p className="label text-rust mb-2">{t.curiosity}</p>
                <p className="text-lg leading-relaxed">{e.funFact}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {e.ancestors && e.ancestors.length > 0 && (
        <Section n={sec()} title={t.s.kinship}>
          <ol className="flex flex-wrap items-center gap-y-2 text-sm">
            {e.ancestors.map((a, i) => (
              <li key={a.id} className="flex items-center">
                {i > 0 && <span className="mx-2 text-ink-2">›</span>}
                <Link href={L(`/taxon/${a.id}`)} className="hover:text-moss">
                  <span className="label text-ink-2 mr-1 !text-[0.55rem]">{a.rank}</span>
                  {a.rank === "genus" || a.rank === "species" ? <i>{a.name}</i> : a.name}
                </Link>
              </li>
            ))}
          </ol>
          {e.inatId && (
            <Link href={L(`/wheel?focus=${e.ancestors.at(-1)?.id ?? ""}`)} className="inline-block mt-4 label text-moss hover:text-rust">
              {t.openBranch}
            </Link>
          )}
          {rel.length > 0 && (
            <div className="mt-10">
              <p className="label text-ink-2 mb-4">{t.neighbours}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                {rel.map((r) => (
                  <SpecimenCard key={r.slug} e={toCard(r)} small />
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      <p className="mt-16 text-xs text-ink-2 max-w-[90ch] leading-relaxed">
        {correctionsFor(e.slug, CODEX) > 0 && (
          <>
            {t.factChecked}{" "}
            <Link href={L(`/about/corrections#${e.slug}`)} className="link-ink">
              {t.corrections(correctionsFor(e.slug, CODEX))}
            </Link>
            .{" "}
          </>
        )}
        {t.credits}
        {e.inatId && (
          <>
            {" "}
            <a className="link-ink" href={`https://www.inaturalist.org/taxa/${e.inatId}`} target="_blank" rel="noreferrer">
              {t.inatTaxon(e.inatId)}
            </a>
            .
          </>
        )}
      </p>
    </article>
  );
}
