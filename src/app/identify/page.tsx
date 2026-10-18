import type { Metadata } from "next";
import IdentifyDesk from "./IdentifyDesk";

export const metadata: Metadata = { title: "Identify", description: "Photograph a plant, animal or fungus and the library will suggest what it is." };

export const dynamic = "force-dynamic";

export default function IdentifyPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">Door V · By sight</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">The Identification Desk</h1>
      <p className="mt-4 max-w-[62ch] text-lg text-ink-2 leading-relaxed">
        Bring a photograph of a plant, animal or fungus. The desk runs a tree-of-life vision model in your own browser and tells you what it might be, and what else it could be.
      </p>
      <div className="double-rule mt-8 pt-10">
        <IdentifyDesk ai={!!process.env.ANTHROPIC_API_KEY} />
      </div>
    </div>
  );
}
