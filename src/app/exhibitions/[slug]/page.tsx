import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EXHIBITIONS, getExhibition } from "@/lib/exhibitions";
import { CODEX } from "@/lib/codex";
import SpecimenCard from "@/components/SpecimenCard";

export function generateStaticParams() {
  return EXHIBITIONS.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const x = getExhibition((await params).slug);
  return x ? { title: x.title, description: x.dek } : {};
}

export default async function ExhibitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const x = getExhibition((await params).slug);
  if (!x) notFound();
  const byName = new Map(CODEX.map((e) => [e.scientific, e]));
  const members = x.members.map((m) => byName.get(m)).filter((e): e is NonNullable<typeof e> => !!e);
  const missing = x.members.filter((m) => !byName.has(m));
  const hero = members.find((m) => m.plates?.length)?.plates?.[0];

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <Link href="/exhibitions" className="label text-ink-2 hover:text-moss">← Exhibitions</Link>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-12 mt-6">
        <div>
          <h1 className="font-display text-[clamp(2.8rem,6vw,5.2rem)] leading-[0.95]">{x.title}</h1>
          <p className="mt-4 text-xl text-moss font-display italic">{x.dek}</p>
          <div className="mt-8 space-y-5 text-[1.15rem] leading-[1.7] max-w-[66ch]">
            {x.essay.map((p, i) => (
              <p key={i} className={i === 0 ? "drop-cap" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>
        {hero && (
          <figure className="self-start">
            <div className="bg-[#efe6cf] p-5 border rule">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.img} alt="" className="w-full mix-blend-multiply" />
            </div>
            <figcaption className="mt-2 text-xs text-ink-2">
              <i>{hero.title}</i>, {hero.author !== "Unknown" ? `${hero.author}, ` : ""}
              {hero.year}. Source Library.
            </figcaption>
          </figure>
        )}
      </div>
      <div className="double-rule mt-12 pt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
        {members.map((e) => (
          <SpecimenCard key={e.slug} e={e} />
        ))}
      </div>
      {missing.length > 0 && (
        <p className="mt-10 text-sm text-ink-2">
          Also in this story, from the open stacks:{" "}
          {missing.map((m, i) => (
            <span key={m}>
              {i > 0 && ", "}
              <Link href={`/search?q=${encodeURIComponent(m)}`} className="link-ink italic">
                {m}
              </Link>
            </span>
          ))}
          .
        </p>
      )}
    </div>
  );
}
