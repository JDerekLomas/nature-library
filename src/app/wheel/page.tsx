import { Suspense } from "react";
import type { Metadata } from "next";
import Wheel from "./Wheel";

export const metadata: Metadata = { title: "Wheel of Life", description: "Walk the tree of life as a wheel, from all living things down to a single species." };

export default function WheelPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">Door II · By kinship</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">The Wheel of Life</h1>
      <p className="mt-4 max-w-[64ch] text-lg text-ink-2 leading-relaxed">
        Linnaeus drew life as a ladder, Darwin as a branching tree. Here it is a wheel: every living thing at the centre, and each ring a step closer to a
        single species.
      </p>
      <div className="double-rule mt-8 pt-8">
        <Suspense fallback={<p className="label">Loading the wheel…</p>}>
          <Wheel />
        </Suspense>
      </div>
    </div>
  );
}
