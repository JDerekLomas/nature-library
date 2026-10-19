import Link from "next/link";
import type { Metadata } from "next";
import { exhibitionsFor } from "@/lib/exhibitions";
import { CODEX } from "@/lib/codex";
import { asLang, lp } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.exhibitions;
  return { title: t.title, description: t.metaDesc };
}

export default async function ExhibitionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.exhibitions;
  const byName = new Map(CODEX.map((e) => [e.scientific, e]));
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">{t.title}</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.heading}</h1>
      <div className="double-rule mt-8 grid md:grid-cols-2 gap-x-12">
        {exhibitionsFor(lang).map((x, i) => {
          const members = x.members.map((m) => byName.get(m)).filter(Boolean);
          return (
            <Link key={x.slug} href={lp(lang, `/exhibitions/${x.slug}`)} className="group block border-b rule py-8">
              <div className="flex gap-1 h-40">
                {members.slice(0, 5).map((e) => (
                  <div key={e!.slug} className="flex-1 bg-paper-3 overflow-hidden">
                    {e!.photos?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e!.photos[0].medium ?? e!.photos[0].url} alt="" loading="lazy" className="w-full h-full object-cover saturate-[.75] group-hover:saturate-100 transition" />
                    )}
                  </div>
                ))}
              </div>
              <p className="label text-ink-2 mt-5">{t.no(String(i + 1).padStart(2, "0"), members.length)}</p>
              <p className="font-display text-3xl mt-1 group-hover:text-moss">{x.title}</p>
              <p className="text-ink-2 mt-1">{x.dek}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
