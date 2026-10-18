"use client";

import { useEffect, useState } from "react";
import { Section, EdibilityScale, Medicinal, Grow, Abilities, AnimalFacts } from "./Sheet";

interface Notes {
  abilities: string[];
  edibility: string | null;
  edible_parts: string[];
  edibility_note: string | null;
  medicinal: { tradition: string; use: string }[];
  medicinal_evidence: "strong" | "moderate" | "traditional" | null;
  cautions: string | null;
  fruit: string | null;
  seed: string | null;
  grow: { zones: string | null; climate: string | null; sun: string | null; water: string | null; soil: string | null; propagation: string | null; steps: string[] } | null;
  animal: { diet: string | null; habitat: string | null; lifespan: string | null; size: string | null; behaviour: string | null } | null;
  lore: string | null;
  source: { title: string; url: string };
}

const u = <T,>(v: T | null) => v ?? undefined;

export default function FieldNotes({ taxonId, name }: { taxonId: number; name: string }) {
  const [notes, setNotes] = useState<Notes | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/notes?taxon=${taxonId}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "failed");
        setNotes(j);
      })
      .catch((e) => setErr(e.message));
  }, [taxonId]);

  if (err)
    return err === "no-article" || err === "no-key" ? null : (
      <p className="text-sm text-ink-2 border-l-2 border-ochre pl-4">The librarian could not prepare field notes for this species just now.</p>
    );
  if (!notes)
    return (
      <div className="border border-dashed border-ink/40 p-6">
        <p className="label text-ink-2">The librarian is reading the article on {name}…</p>
        <div className="mt-4 space-y-2">
          {[80, 92, 64].map((w) => (
            <div key={w} className="h-3 bg-paper-3 animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );

  let n = 0;
  const s = () => String(++n);
  const g = notes.grow;
  return (
    <div>
      <p className="label text-ink-2 border-b rule pb-2">
        Field notes, extracted by the librarian from{" "}
        <a href={notes.source.url} className="link-ink" target="_blank" rel="noreferrer">
          Wikipedia: {notes.source.title}
        </a>
        . Blank where the article is silent.
      </p>
      <div className="mt-8">
        {notes.abilities.length > 0 && (
          <Section n={s()} title="What it can do">
            <Abilities items={notes.abilities} />
          </Section>
        )}
        {notes.animal && Object.values(notes.animal).some(Boolean) && (
          <Section n={s()} title="Life & habits">
            <AnimalFacts
              a={{ diet: u(notes.animal.diet), habitat: u(notes.animal.habitat), lifespan: u(notes.animal.lifespan), size: u(notes.animal.size), behaviour: u(notes.animal.behaviour) }}
            />
          </Section>
        )}
        {notes.edibility && (
          <Section n={s()} title="At the table">
            <EdibilityScale value={notes.edibility} note={u(notes.edibility_note)} parts={notes.edible_parts} />
          </Section>
        )}
        {notes.medicinal.length > 0 && (
          <Section n={s()} title="In the medicine cabinet">
            <Medicinal m={{ uses: notes.medicinal, evidence: u(notes.medicinal_evidence), cautions: u(notes.cautions) }} />
          </Section>
        )}
        {(notes.fruit || notes.seed) && (
          <Section n={s()} title="Fruit & seed">
            <div className="grid md:grid-cols-2 gap-6">
              {notes.fruit && (
                <div className="specimen-label p-5">
                  <p className="label text-ink-2">Fruit</p>
                  <p className="mt-2 leading-relaxed">{notes.fruit}</p>
                </div>
              )}
              {notes.seed && (
                <div className="specimen-label p-5">
                  <p className="label text-ink-2">Seed</p>
                  <p className="mt-2 leading-relaxed">{notes.seed}</p>
                </div>
              )}
            </div>
          </Section>
        )}
        {g && (g.steps.length > 0 || g.sun || g.soil) && (
          <Section n={s()} title="How to grow it">
            <Grow
              g={{ zones: u(g.zones), climates: g.climate ? [g.climate] : undefined, sun: u(g.sun), water: u(g.water), soil: u(g.soil), propagation: u(g.propagation), steps: g.steps }}
            />
          </Section>
        )}
        {notes.lore && (
          <Section n={s()} title="Marginalia">
            <blockquote className="font-display text-[1.4rem] leading-snug border-l-2 border-moss pl-6">{notes.lore}</blockquote>
          </Section>
        )}
      </div>
    </div>
  );
}
