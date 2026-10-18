"use client";

import { useRouter } from "next/navigation";
import Globe from "./Globe";

export default function HomeGlobe({ night = false }: { night?: boolean }) {
  const router = useRouter();
  return (
    <div className="relative">
      <Globe gbif="" theme={night ? "night" : "paper"} step={night ? 1 : 2} initial={night ? [20, 0] : [60, 18]} onPick={() => router.push("/atlas")} />
      {!night && (
        <p className="label text-ink-2 text-center mt-1 !text-[0.6rem]">Every dot: a place where life has been recorded · drag to turn · tap to open the Atlas</p>
      )}
    </div>
  );
}
