import { Suspense } from "react";
import type { Metadata } from "next";
import Wheel from "./Wheel";
import { asLang } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.wheel;
  return { title: t.title, description: t.metaDesc };
}

export default async function WheelPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = dict(asLang((await params).lang)).rooms.wheel;
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.heading}</h1>
      <p className="mt-4 max-w-[64ch] text-lg text-ink-2 leading-relaxed">{t.intro}</p>
      <div className="double-rule mt-8 pt-8">
        <Suspense fallback={<p className="label">{t.loading}</p>}>
          <Wheel />
        </Suspense>
      </div>
    </div>
  );
}
