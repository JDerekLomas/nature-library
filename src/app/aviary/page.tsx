import Link from "next/link";
import type { Metadata } from "next";
import { CODEX } from "@/lib/codex";
import SpecimenCard from "@/components/SpecimenCard";
import BirdsNear from "./BirdsNear";

export const metadata: Metadata = {
  title: "The Aviary",
  description: "A birding room: field marks, songs and look-alikes for the world's birds, and what is singing near you this month.",
};

const ORDER_NAMES: Record<string, string> = {
  Passeriformes: "Perching birds & songbirds",
  Accipitriformes: "Hawks, eagles & vultures",
  Falconiformes: "Falcons",
  Strigiformes: "Owls",
  Anseriformes: "Ducks, geese & swans",
  Galliformes: "Pheasants, grouse & fowl",
  Columbiformes: "Pigeons & doves",
  Psittaciformes: "Parrots",
  Piciformes: "Woodpeckers, toucans & barbets",
  Coraciiformes: "Kingfishers, rollers & bee-eaters",
  Bucerotiformes: "Hornbills & hoopoes",
  Apodiformes: "Swifts & hummingbirds",
  Caprimulgiformes: "Nightjars",
  Cuculiformes: "Cuckoos",
  Charadriiformes: "Shorebirds, gulls & auks",
  Gruiformes: "Cranes & rails",
  Pelecaniformes: "Pelicans, herons & ibises",
  Ciconiiformes: "Storks",
  Suliformes: "Gannets, cormorants & frigatebirds",
  Procellariiformes: "Albatrosses & petrels",
  Sphenisciformes: "Penguins",
  Phoenicopteriformes: "Flamingos",
  Gaviiformes: "Loons",
  Struthioniformes: "Ostriches",
  Casuariiformes: "Cassowaries & emu",
  Apterygiformes: "Kiwi",
  Otidiformes: "Bustards",
  Trogoniformes: "Trogons & quetzals",
  Opisthocomiformes: "Hoatzin",
  Musophagiformes: "Turacos",
  Cariamiformes: "Seriemas",
  Podicipediformes: "Grebes",
};

export default async function Aviary({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const { r } = await searchParams;
  const birds = CODEX.filter((e) => e.form === "Bird" || e.ancestors?.some((a) => a.name === "Aves"));
  const regions = [...new Set(birds.flatMap((b) => b.regions ?? []))].sort();
  const shown = r ? birds.filter((b) => b.regions?.includes(r)) : birds;
  const orderOf = (b: (typeof birds)[number]) => b.animal?.order ?? b.ancestors?.find((a) => a.rank === "order")?.name ?? "Other";
  const orders = [...new Set(shown.map(orderOf))].sort((a, b) => (a === "Passeriformes" ? -1 : b === "Passeriformes" ? 1 : a.localeCompare(b)));
  const codexIds = Object.fromEntries(CODEX.filter((e) => e.inatId).map((e) => [e.inatId!, e.slug]));

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">The Bestiary · birds</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">The Aviary</h1>
      <p className="mt-4 max-w-[66ch] text-lg text-ink-2 leading-relaxed">
        A birding room. Every sheet has the field marks that clinch an identification, the song written out and recorded, the look-alikes and how to separate
        them, and where and when to go. {birds.length} birds have full sheets; the rest of the world&apos;s eleven thousand are in{" "}
        <Link href="/taxon/3" className="link-ink">
          the open stacks
        </Link>
        .
      </p>

      <div className="mt-8">
        <BirdsNear codex={codexIds} />
      </div>

      <div className="double-rule mt-12 pt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/aviary" className={!r ? "text-moss underline underline-offset-4" : "hover:text-moss"}>
          Every region
        </Link>
        {regions.map((x) => (
          <Link key={x} href={`/aviary?r=${encodeURIComponent(x)}`} className={r === x ? "text-moss underline underline-offset-4" : "hover:text-moss"}>
            {x}
          </Link>
        ))}
      </div>

      {orders.map((o) => {
        const list = shown.filter((b) => orderOf(b) === o).sort((a, b) => a.common.localeCompare(b.common));
        return (
          <section key={o} className="mt-12">
            <div className="flex items-baseline justify-between border-b border-ink pb-2">
              <h2 className="font-display text-3xl">
                {ORDER_NAMES[o] ?? o} <span className="latin text-lg text-ink-2">{o}</span>
              </h2>
              <span className="label text-ink-2">{list.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 mt-5">
              {list.map((b) => (
                <SpecimenCard key={b.slug} e={b} />
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-16 text-sm text-ink-2">
        Browse every bird family on Earth in the{" "}
        <Link href="/gbif/212?stay=1" className="link-ink">
          Catalogue of All Life
        </Link>
        , or every bird ever recorded in your country from{" "}
        <Link href="/catalogue" className="link-ink">
          the country lists
        </Link>
        . Recordings: iNaturalist contributors, openly licensed.
      </p>
    </div>
  );
}
