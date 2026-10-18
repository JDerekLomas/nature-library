import Link from "next/link";
import type { Metadata } from "next";
import { SHELVES } from "@/lib/shelves";
import { onShelf } from "@/lib/codex";

export const metadata: Metadata = { title: "The Shelves", description: "The codex arranged by what living things do: heal, feed, poison, pollinate, endure." };

export default function ShelvesPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">Door III · By use</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">The Shelves</h1>
      <p className="mt-4 max-w-[62ch] text-lg text-ink-2 leading-relaxed">
        The old herbals arranged plants by their virtues. These shelves do the same for every kingdom: by what a living thing can do for us, or to us.
      </p>
      <ul className="double-rule mt-8">
        {SHELVES.map((s) => {
          const items = onShelf(s.id);
          return (
            <li key={s.id} className="border-b rule">
              <Link href={`/shelves/${s.id}`} className="group grid md:grid-cols-[90px_minmax(0,1fr)_minmax(0,420px)] gap-x-8 gap-y-3 py-7 items-center">
                <span className="font-display text-4xl text-ochre">{s.numeral}</span>
                <span>
                  <span className="block font-display text-3xl leading-tight group-hover:text-moss">{s.title}</span>
                  <span className="block mt-2 text-ink-2 leading-relaxed max-w-[60ch]">{s.blurb}</span>
                  <span className="block mt-2 label text-ink-2">{items.length} volumes</span>
                </span>
                <span className="flex gap-1.5 justify-end">
                  {items.slice(0, 5).map((e) => (
                    <span key={e.slug} className="w-[72px] h-[92px] bg-paper-3 overflow-hidden shrink-0 border rule">
                      {e.photos?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.photos[0].square || e.photos[0].url} alt="" loading="lazy" className="w-full h-full object-cover saturate-[.8] group-hover:saturate-100" />
                      )}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
