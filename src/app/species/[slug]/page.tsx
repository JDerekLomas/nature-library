import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CODEX, getEntry, relatives, KINGDOM_LABEL } from "@/lib/codex";
import PhotoPlate from "@/components/PhotoPlate";
import WhereItLives from "@/components/WhereItLives";
import Stacks from "@/components/Stacks";
import SpecimenCard from "@/components/SpecimenCard";
import GrowHere from "@/components/GrowHere";
import GerardPanel from "@/components/GerardPanel";
import { correctionsFor } from "@/lib/corrections";
import { Section, EdibilityScale, IucnStamp, Medicinal, Grow, FruitSeed, Abilities, AnimalFacts, FieldGuide, Plates, ShelfTags } from "@/components/Sheet";
import Sounds from "@/components/Sounds";

export function generateStaticParams() {
  return CODEX.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = getEntry((await params).slug);
  if (!e) return {};
  return { title: `${e.common} (${e.scientific})`, description: e.summary };
}

export default async function SpeciesPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = getEntry((await params).slug);
  if (!e) notFound();
  const isAnimal = e.kingdom === "Animalia";
  const isFungus = e.kingdom === "Fungi";
  const rel = relatives(e);
  let n = 0;
  const sec = () => String(++n);

  return (
    <article className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-8">
      {/* accession line */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 label text-ink-2 border-b border-ink pb-2">
        <span className="text-ink">{e.nl}</span>
        <Link href="/wheel" className="hover:text-moss">{KINGDOM_LABEL[e.kingdom] ?? e.kingdom}</Link>
        {e.family && <span>{e.family}</span>}
        {e.form && <span>{e.form}</span>}
        {e.observations ? <span>{e.observations.toLocaleString()} field observations</span> : null}
        <span className="ml-auto hidden sm:inline">The Nature Library · Codex</span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-10 lg:gap-16 mt-8">
        <div className="lg:sticky lg:top-24 self-start">
          <PhotoPlate photos={e.photos ?? []} alt={e.common} nl={e.nl} />
          <div className="specimen-label mt-8 p-4 text-sm">
            <p className="label text-ink-2 text-center border-b rule pb-2 mb-3">Herbarium of the Nature Library</p>
            <dl className="grid grid-cols-[92px_1fr] gap-y-1.5">
              <dt className="label text-ink-2 pt-0.5">Name</dt>
              <dd className="latin">{e.scientific}</dd>
              <dt className="label text-ink-2 pt-0.5">Family</dt>
              <dd>{e.family ?? "—"}</dd>
              {e.nativeRange && (
                <>
                  <dt className="label text-ink-2 pt-0.5">Native to</dt>
                  <dd>{e.nativeRange}</dd>
                </>
              )}
              {e.biomes && (
                <>
                  <dt className="label text-ink-2 pt-0.5">Habitat</dt>
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
        </div>

        <div className="min-w-0">
          <header>
            <h1 className="font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.95] tracking-tight">{e.common}</h1>
            <p className="latin text-2xl mt-2 text-moss">{e.scientific}</p>
            {e.otherNames && e.otherNames.length > 0 && (
              <p className="mt-4 text-ink-2 leading-relaxed">
                <span className="label mr-2">Also called</span>
                {e.otherNames.join(" · ")}
              </p>
            )}
            <div className="mt-4">
              <ShelfTags shelves={e.shelves} />
            </div>
            <p className="drop-cap mt-8 text-[1.2rem] leading-[1.65] max-w-[68ch]">{e.summary}</p>
            {e.wiki?.extract && (
              <p className="mt-5 text-ink-2 leading-relaxed max-w-[68ch]">
                {e.wiki.extract}{" "}
                <a href={e.wiki.url} className="link-ink text-sm" target="_blank" rel="noreferrer">
                  Wikipedia
                </a>
              </p>
            )}
          </header>

          <div className="mt-12">
            {e.abilities && e.abilities.length > 0 && (
              <Section n={sec()} title="What it can do">
                <Abilities items={e.abilities} />
              </Section>
            )}

            {e.animal && (e.animal.fieldMarks?.length || e.animal.whereToSee) && (
              <Section n={sec()} title="In the field">
                <FieldGuide a={e.animal} />
              </Section>
            )}

            {e.animal && (e.animal.voice || ["Bird", "Amphibian", "Insect", "Mammal"].includes(e.form ?? "")) && e.kingdom === "Animalia" && (
              <Section n={sec()} title="Listen">
                <Sounds inatId={e.inatId} name={e.common} />
              </Section>
            )}

            {e.animal && (
              <Section n={sec()} title="Life & habits">
                <AnimalFacts a={e.animal} />
              </Section>
            )}

            {!isAnimal && e.edibility && (
              <Section n={sec()} title="At the table">
                <EdibilityScale value={e.edibility} note={e.edibilityNote} parts={e.edibleParts} />
              </Section>
            )}

            {e.medicinal && e.medicinal.uses?.length > 0 && (
              <Section n={sec()} title="In the medicine cabinet">
                <Medicinal m={e.medicinal} />
              </Section>
            )}

            {(e.fruit || e.seed) && (
              <Section n={sec()} title={isFungus ? "Fruiting body & spores" : e.fruit ? "Fruit & seed" : "Seed"}>
                <FruitSeed fruit={e.fruit} seed={e.seed} fungal={isFungus} seedPhotos={e.seedPhotos} fruitPhotos={e.fruitPhotos} />
              </Section>
            )}

            {e.grow && (
              <Section n={sec()} title={isFungus ? "How to cultivate it" : "How to grow it"}>
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

      <Section n={sec()} title="Where it lives" id="where">
        <WhereItLives gbifKey={e.gbifKey} name={e.scientific} nativeRange={e.nativeRange} />
      </Section>

      {e.gerard && (
        <Section n={sec()} title="In Gerard's Herball, 1597">
          <GerardPanel g={e.gerard} name={e.common} />
        </Section>
      )}

      {e.plates && e.plates.length > 0 && (
        <Section n={sec()} title="In the old herbals & bestiaries">
          <p className="text-ink-2 mb-6 max-w-[70ch]">
            {e.plates.every((p) => p.m === "relative")
              ? `No plate in the Source Library names this exact species, so these show its closest relatives as the old naturalists drew them: same genus, or the same kind of ${e.kingdom === "Animalia" ? "animal" : "plant"}.`
              : "Woodcuts and engravings matched from the Source Library’s scanned books by name. Plates marked “relative” show a close kin rather than this exact species."}{" "}
            Click a plate to read the page it came from, with translation.
          </p>
          <Plates plates={e.plates} name={e.common} />
        </Section>
      )}

      <Section n={sec()} title="In the stacks">
        <Stacks names={[e.scientific, e.common]} scientific={e.scientific} />
      </Section>

      {(e.lore || e.funFact) && (
        <Section n={sec()} title="Marginalia">
          <div className="grid md:grid-cols-2 gap-10">
            {e.lore && (
              <blockquote className="font-display text-[1.45rem] leading-snug border-l-2 border-moss pl-6">{e.lore}</blockquote>
            )}
            {e.funFact && (
              <div className="bg-card border rule p-6">
                <p className="label text-rust mb-2">Curiosity</p>
                <p className="text-lg leading-relaxed">{e.funFact}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {e.ancestors && e.ancestors.length > 0 && (
        <Section n={sec()} title="Kinship">
          <ol className="flex flex-wrap items-center gap-y-2 text-sm">
            {e.ancestors.map((a, i) => (
              <li key={a.id} className="flex items-center">
                {i > 0 && <span className="mx-2 text-ink-2">›</span>}
                <Link href={`/taxon/${a.id}`} className="hover:text-moss">
                  <span className="label text-ink-2 mr-1 !text-[0.55rem]">{a.rank}</span>
                  {a.rank === "genus" || a.rank === "species" ? <i>{a.name}</i> : a.name}
                </Link>
              </li>
            ))}
          </ol>
          {e.inatId && (
            <Link href={`/wheel?focus=${e.ancestors.at(-1)?.id ?? ""}`} className="inline-block mt-4 label text-moss hover:text-rust">
              Open its branch on the Wheel of Life →
            </Link>
          )}
          {rel.length > 0 && (
            <div className="mt-10">
              <p className="label text-ink-2 mb-4">Neighbours on the shelf</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
                {rel.map((r) => (
                  <SpecimenCard key={r.slug} e={r} small />
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      <p className="mt-16 text-xs text-ink-2 max-w-[90ch] leading-relaxed">
        {correctionsFor(e.slug, CODEX) > 0 && (
          <>
            Fact-checked:{" "}
            <Link href={`/about/corrections#${e.slug}`} className="link-ink">
              {correctionsFor(e.slug, CODEX)} correction{correctionsFor(e.slug, CODEX) > 1 ? "s" : ""} made to this sheet
            </Link>
            .{" "}
          </>
        )}
        Photographs: iNaturalist contributors under the licences shown. Records: GBIF.org. Historical plates: Source Library (CC BY-SA 4.0; originals public
        domain). Summary text: Nature Library editors and Wikipedia (CC BY-SA). Medicinal and edibility notes are historical and educational, not advice.
        {e.inatId && (
          <>
            {" "}
            <a className="link-ink" href={`https://www.inaturalist.org/taxa/${e.inatId}`} target="_blank" rel="noreferrer">
              iNaturalist taxon {e.inatId}
            </a>
            .
          </>
        )}
      </p>
    </article>
  );
}
