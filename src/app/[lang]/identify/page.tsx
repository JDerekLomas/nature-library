import type { Metadata } from "next";
import IdentifyDesk from "./IdentifyDesk";
import { asLang } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).identify;
  return { title: t.metaTitle, description: t.metaDesc };
}


export default async function IdentifyPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = dict(asLang((await params).lang)).identify;
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.title}</h1>
      <p className="mt-4 max-w-[62ch] text-lg text-ink-2 leading-relaxed">{t.intro}</p>
      <div className="double-rule mt-8 pt-10">
        <IdentifyDesk ai={!!process.env.ANTHROPIC_API_KEY} />
      </div>
    </div>
  );
}
