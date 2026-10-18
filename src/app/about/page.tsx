import Link from "next/link";
import type { Metadata } from "next";
import { CODEX } from "@/lib/codex";
import { PLATES } from "@/lib/plates";

export const metadata: Metadata = { title: "About & licences" };

const SOURCES = [
  ["iNaturalist", "https://www.inaturalist.org", "Taxonomy, common names, field photographs and the species lists in the Atlas. Photographs are by iNaturalist contributors under the Creative Commons licence each one carries; attribution is shown under every plate."],
  ["GBIF, the Global Biodiversity Information Facility", "https://www.gbif.org", "The occurrence density drawn on every globe, record counts and country tallies: museum and herbarium specimens, surveys and citizen science, aggregated from thousands of institutions."],
  ["Source Library", "https://sourcelibrary.org", "Historical illustrations from scanned herbals, bestiaries and natural histories, and translated passages from the books that describe each species. Images CC BY-SA 4.0; originals in the public domain."],
  ["Gerard's Herball (1597), via the Source Library", "https://sourcelibrary.org/book/the-herball-or-generall-historie-of-plantes-gerard", "John Gerard's chapters, quoted in his own spelling beside scans of the pages they were printed on. The Source Library has so far transcribed roughly the first third of the book; more chapters are added as they appear. Transcription CC BY-SA 4.0."],
  ["Wikipedia", "https://www.wikipedia.org", "The lead of each article, and for species outside the codex its Description, Uses, Medicinal, Toxicity, Cultivation and Ecology sections, quoted verbatim. CC BY-SA 4.0."],
  ["Wikimedia Commons", "https://commons.wikimedia.org", "Photographs of seeds and fruit, used only when the file is openly licensed and names the species."],
  ["Open-Meteo (ERA5 reanalysis)", "https://open-meteo.com", "Ten years of daily temperature and rainfall behind the Garden Planner's hardiness zones. Place search: Open-Meteo geocoding; reverse lookup: BigDataCloud."],
  ["Internet Archive", "https://archive.org", "Digitised books shown in “In the stacks”."],
  ["Biodiversity Heritage Library", "https://www.biodiversitylibrary.org", "Linked from every species for the full printed literature naming it."],
  ["BioCLIP (Imageomics Institute)", "https://imageomics.github.io/bioclip/", "The vision model behind the Identification Desk (MIT licence), run in the browser with ONNX Runtime Web; browser-ready conversions by the NaturDex and Trail Bingo projects."],
  ["GBIF Backbone Taxonomy", "https://www.gbif.org/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c", "The Catalogue of All Life: names, lineages, vernacular names, descriptions and specimen images for every catalogued species."],
  ["Natural Earth / world-atlas", "https://github.com/topojson/world-atlas", "Coastlines on the globes. Public domain."],
] as const;

export default function About() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">About</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-none mt-2">How this library is made</h1>
      <div className="mt-8 space-y-5 text-[1.12rem] leading-[1.7]">
        <p className="drop-cap">
          The Nature Library has two parts. The <b className="font-semibold">codex</b> is {CODEX.length} hand-edited specimen sheets: plants that heal, feed and
          poison; fungi; a birding codex with field marks, songs and look-alikes; fishes, reptiles, amphibians, mammals and invertebrates. Each sheet records what the organism can do, whether and how it is eaten, how healers
          have used it and how strong the modern evidence is, what its fruit and seed look like, and how to grow it.
        </p>
        <p>
          The <b className="font-semibold">open stacks</b> are everything else: any of the more than two million named species can be looked up, and its page is
          assembled live from the sources below, including the relevant sections of its Wikipedia article quoted as written. Where an Anthropic API key is
          configured, a librarian (Claude, an AI model) also reads the whole article and extracts structured field notes, leaving a field blank when the article
          is silent rather than filling it in.
        </p>
        <p>
          The Plate Room holds {PLATES.length.toLocaleString()} historical illustrations matched from the Source Library. The Identification Desk runs
          BioCLIP, an open vision model trained on more than ten million images across the tree of life, inside the visitor&apos;s own browser: the photograph
          never leaves the device. It compares each photo against the 10,000 most-recorded species on iNaturalist, then against up to 10,000 more within
          whichever groups the photo resembles.
        </p>
        <p>
          The Catalogue of All Life opens the GBIF Backbone Taxonomy, millions of names assembled from Catalogue of Life and hundreds of other checklists,
          so every catalogued species has a page here, reachable by walking down the tree or from a country&apos;s complete list of recorded species.
        </p>
        <p>
          The Herball Room presents John Gerard&apos;s <i>Herball</i> of 1597 chapter by chapter. It was the great English herbal of its age rather than the first:
          Dioscorides, the <i>Hortus Sanitatis</i> (1491) and Fuchs (1542) came before it, and Gerard built heavily on Dodoens. The Garden Planner reads ten
          years of your local weather to find your hardiness zone and lists the codex plants that will survive your winters.
        </p>
        <p className="border-l-2 border-stamp pl-5">
          Nothing in this library is medical advice, and no identification, from this site or anywhere else, is a reason to eat a wild plant or fungus.
          Medicinal entries describe historical and traditional use alongside an honest rating of the evidence.
        </p>
      </div>
      <p className="mt-8">
        <Link href="/about/corrections" className="link-ink text-moss">
          Read the corrections log
        </Link>{" "}
        — every statement changed when the codex was fact-checked, with its source.
      </p>
      <h2 className="font-display text-3xl mt-14 border-b-[3px] border-double border-ink pb-2">Sources & licences</h2>
      <dl className="mt-2">
        {SOURCES.map(([name, url, text]) => (
          <div key={name} className="grid sm:grid-cols-[240px_1fr] gap-2 sm:gap-6 py-4 border-b rule">
            <dt>
              <a href={url} className="link-ink" target="_blank" rel="noreferrer">
                {name}
              </a>
            </dt>
            <dd className="text-ink-2 leading-relaxed">{text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
