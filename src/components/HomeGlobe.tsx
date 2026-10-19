"use client";

import { useRouter } from "next/navigation";
import Globe from "./Globe";
import { useLang, useT } from "@/i18n/LangProvider";
import { lp } from "@/i18n/config";

export default function HomeGlobe({ night = false }: { night?: boolean }) {
  const router = useRouter();
  const lang = useLang();
  const t = useT().widgets;
  return (
    <div className="relative">
      <Globe gbif="" palette="green" theme={night ? "night" : "paper"} step={night ? 1 : 2} initial={night ? [20, 0] : [60, 18]} onPick={() => router.push(lp(lang, "/atlas"))} />
      {!night && (
        <p className="label text-ink-2 text-center mt-1 !text-[0.6rem]">{t.homeGlobeCaption}</p>
      )}
    </div>
  );
}
