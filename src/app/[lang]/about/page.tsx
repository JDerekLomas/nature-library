import Link from "next/link";
import type { Metadata } from "next";
import { CODEX } from "@/lib/codex";
import { PLATES } from "@/lib/plates";
import { asLang, lp, LOCALE, type Lang } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return { title: dict(asLang((await params).lang)).rooms.about.title };
}

type Src = readonly [string, string, string];
const SOURCES: Record<Lang, Src[]> = {
  en: [
    ["iNaturalist", "https://www.inaturalist.org", "Taxonomy, common names, field photographs, sound recordings and the species lists in the Atlas. Photographs are by iNaturalist contributors under the Creative Commons licence each one carries; attribution is shown under every plate."],
    ["GBIF, the Global Biodiversity Information Facility", "https://www.gbif.org", "The occurrence density drawn on every globe, record counts and country tallies: museum and herbarium specimens, surveys and citizen science, aggregated from thousands of institutions."],
    ["GBIF Backbone Taxonomy", "https://www.gbif.org/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c", "The Catalogue of All Life: names, lineages, vernacular names, descriptions and specimen images for every catalogued species."],
    ["Source Library", "https://sourcelibrary.org", "Historical illustrations from scanned herbals, bestiaries and natural histories, and translated passages from the books that describe each species. Images CC BY-SA 4.0; originals in the public domain."],
    ["Gerard's Herball (1597), via the Source Library", "https://sourcelibrary.org/book/the-herball-or-generall-historie-of-plantes-gerard", "John Gerard's chapters, quoted in his own spelling beside scans of the pages they were printed on. The Source Library has so far transcribed roughly the first third of the book; more chapters are added as they appear. Transcription CC BY-SA 4.0."],
    ["Wikipedia", "https://www.wikipedia.org", "The lead of each article, and for species outside the codex its Description, Uses, Medicinal, Toxicity, Cultivation and Ecology sections, quoted verbatim. CC BY-SA 4.0."],
    ["Wikimedia Commons & Wikidata", "https://commons.wikimedia.org", "Photographs of seeds and fruit, used only when the file is openly licensed and names the species; images for catalogue-only species via Wikidata."],
    ["BioCLIP (Imageomics Institute)", "https://imageomics.github.io/bioclip/", "The vision model behind the Identification Desk (MIT licence), run in the browser with ONNX Runtime Web; browser-ready conversions by the NaturDex and Trail Bingo projects."],
    ["Open-Meteo (ERA5 reanalysis)", "https://open-meteo.com", "Ten years of daily temperature and rainfall behind the Garden Planner's hardiness zones. Place search: Open-Meteo and Photon (OpenStreetMap); reverse lookup: BigDataCloud."],
    ["Internet Archive", "https://archive.org", "Digitised books shown in “In the stacks”."],
    ["Biodiversity Heritage Library", "https://www.biodiversitylibrary.org", "Linked from every species for the full printed literature naming it."],
    ["Natural Earth / world-atlas", "https://github.com/topojson/world-atlas", "Coastlines on the globes. Public domain."],
  ],
  es: [
    ["iNaturalist", "https://www.inaturalist.org", "Taxonomía, nombres comunes, fotografías de campo, grabaciones de sonido y las listas de especies del Atlas. Las fotografías son de colaboradores de iNaturalist con la licencia Creative Commons de cada una; la atribución aparece bajo cada lámina."],
    ["GBIF, Infraestructura Mundial de Información en Biodiversidad", "https://www.gbif.org", "La densidad de registros dibujada en cada globo, los recuentos y los totales por país: ejemplares de museos y herbarios, censos y ciencia ciudadana, reunidos de miles de instituciones."],
    ["Taxonomía troncal de GBIF", "https://www.gbif.org/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c", "El Catálogo de Toda la Vida: nombres, linajes, nombres vernáculos, descripciones e imágenes de ejemplares de cada especie catalogada."],
    ["Source Library", "https://sourcelibrary.org", "Ilustraciones históricas de herbarios, bestiarios e historias naturales digitalizados, y pasajes traducidos de los libros que describen cada especie. Imágenes CC BY-SA 4.0; originales de dominio público."],
    ["El Herball de Gerard (1597), vía la Source Library", "https://sourcelibrary.org/book/the-herball-or-generall-historie-of-plantes-gerard", "Los capítulos de John Gerard, citados en su ortografía original en inglés junto a las páginas en que se imprimieron. La Source Library ha transcrito hasta ahora aproximadamente el primer tercio del libro; se añaden capítulos a medida que aparecen. Transcripción CC BY-SA 4.0."],
    ["Wikipedia", "https://www.wikipedia.org", "La entradilla de cada artículo (de la Wikipedia en español cuando existe) y, para las especies fuera del códice, sus secciones de descripción, usos, medicina, toxicidad, cultivo y ecología, citadas literalmente. CC BY-SA 4.0."],
    ["Wikimedia Commons y Wikidata", "https://commons.wikimedia.org", "Fotografías de semillas y frutos, usadas solo si el archivo tiene licencia abierta y nombra la especie; imágenes de especies solo catalogadas vía Wikidata."],
    ["BioCLIP (Imageomics Institute)", "https://imageomics.github.io/bioclip/", "El modelo de visión del Mostrador de Identificación (licencia MIT), ejecutado en el navegador con ONNX Runtime Web; conversiones para navegador de los proyectos NaturDex y Trail Bingo."],
    ["Open-Meteo (reanálisis ERA5)", "https://open-meteo.com", "Diez años de temperatura y lluvia diarias detrás de las zonas de rusticidad del Planificador del Jardín. Búsqueda de lugares: Open-Meteo y Photon (OpenStreetMap); búsqueda inversa: BigDataCloud."],
    ["Internet Archive", "https://archive.org", "Libros digitalizados que aparecen en «En los depósitos»."],
    ["Biodiversity Heritage Library", "https://www.biodiversitylibrary.org", "Enlazada desde cada especie para toda la bibliografía impresa que la nombra."],
    ["Natural Earth / world-atlas", "https://github.com/topojson/world-atlas", "Costas de los globos. Dominio público."],
  ],
};

export default async function About({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.about;
  const n = CODEX.length;
  const plates = PLATES.length.toLocaleString(LOCALE[lang]);
  const es = lang === "es";
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">{t.kicker}</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-none mt-2">{t.heading}</h1>
      <div className="mt-8 space-y-5 text-[1.12rem] leading-[1.7]">
        {es ? (
          <>
            <p className="drop-cap">
              La Biblioteca de la Naturaleza tiene dos partes. El <b className="font-semibold">códice</b> son {n} fichas de especímenes editadas a mano: plantas que
              curan, alimentan y envenenan; hongos; un códice de aves con rasgos de campo, cantos y parecidos; peces, reptiles, anfibios, mamíferos e invertebrados.
              Cada ficha recoge lo que el organismo puede hacer, si se come y cómo, cómo lo han usado los sanadores y cuán sólida es la evidencia moderna, cómo son su
              fruto y su semilla, y cómo cultivarlo. Todas las fichas están traducidas al español.
            </p>
            <p>
              Los <b className="font-semibold">depósitos abiertos</b> son todo lo demás: cualquiera de los más de dos millones de especies con nombre se puede
              consultar, y su página se compone en directo a partir de las fuentes de abajo, incluidas las secciones pertinentes de su artículo de Wikipedia citadas
              tal cual.
            </p>
            <p>
              La Sala de Láminas reúne {plates} ilustraciones históricas de la Source Library. El Mostrador de Identificación ejecuta BioCLIP, un modelo de visión
              abierto entrenado con más de diez millones de imágenes de todo el árbol de la vida, dentro del propio navegador del visitante: la fotografía nunca sale
              del dispositivo.
            </p>
            <p>
              El Catálogo de Toda la Vida abre la taxonomía troncal de GBIF, millones de nombres reunidos del Catalogue of Life y de cientos de otras listas, de modo
              que cada especie catalogada tiene aquí su página, accesible bajando por el árbol o desde la lista completa de especies registradas en un país.
            </p>
            <p>
              La Sala del Herball presenta el <i>Herball</i> de John Gerard de 1597 capítulo a capítulo, en su inglés original. Fue el gran herbario inglés de su época,
              no el primero: Dioscórides, el <i>Hortus Sanitatis</i> (1491) y Fuchs (1542) lo precedieron, y Gerard se apoyó mucho en Dodoens. El Planificador del
              Jardín lee diez años del clima de tu zona para hallar tu zona de rusticidad y muestra las plantas del códice que sobrevivirán a tus inviernos.
            </p>
            <p className="border-l-2 border-stamp pl-5">
              Nada de esta biblioteca es consejo médico, y ninguna identificación, de este sitio o de cualquier otro, es motivo para comer una planta u hongo silvestre.
              Las fichas medicinales describen el uso histórico y tradicional junto a una valoración honesta de la evidencia.
            </p>
          </>
        ) : (
          <>
            <p className="drop-cap">
              The Nature Library has two parts. The <b className="font-semibold">codex</b> is {n} hand-edited specimen sheets: plants that heal, feed and poison; fungi;
              a birding codex with field marks, songs and look-alikes; fishes, reptiles, amphibians, mammals and invertebrates. Each sheet records what the organism can
              do, whether and how it is eaten, how healers have used it and how strong the modern evidence is, what its fruit and seed look like, and how to grow it.
              Every sheet is also available in Spanish.
            </p>
            <p>
              The <b className="font-semibold">open stacks</b> are everything else: any of the more than two million named species can be looked up, and its page is
              assembled live from the sources below, including the relevant sections of its Wikipedia article quoted as written. Where an Anthropic API key is
              configured, a librarian (Claude, an AI model) also reads the whole article and extracts structured field notes, leaving a field blank when the article is
              silent rather than filling it in.
            </p>
            <p>
              The Plate Room holds {plates} historical illustrations matched from the Source Library. The Identification Desk runs BioCLIP, an open vision model
              trained on more than ten million images across the tree of life, inside the visitor&apos;s own browser: the photograph never leaves the device. It
              compares each photo against the 10,000 most-recorded species on iNaturalist, then against up to 10,000 more within whichever groups the photo resembles.
            </p>
            <p>
              The Catalogue of All Life opens the GBIF Backbone Taxonomy, millions of names assembled from Catalogue of Life and hundreds of other checklists, so every
              catalogued species has a page here, reachable by walking down the tree or from a country&apos;s complete list of recorded species.
            </p>
            <p>
              The Herball Room presents John Gerard&apos;s <i>Herball</i> of 1597 chapter by chapter. It was the great English herbal of its age rather than the first:
              Dioscorides, the <i>Hortus Sanitatis</i> (1491) and Fuchs (1542) came before it, and Gerard built heavily on Dodoens. The Garden Planner reads ten years
              of your local weather to find your hardiness zone and lists the codex plants that will survive your winters.
            </p>
            <p className="border-l-2 border-stamp pl-5">
              Nothing in this library is medical advice, and no identification, from this site or anywhere else, is a reason to eat a wild plant or fungus. Medicinal
              entries describe historical and traditional use alongside an honest rating of the evidence.
            </p>
          </>
        )}
      </div>
      <p className="mt-8">
        <Link href={lp(lang, "/about/corrections")} className="link-ink text-moss">
          {t.corrections}
        </Link>
        {t.correctionsTail}
      </p>
      <h2 className="font-display text-3xl mt-14 border-b-[3px] border-double border-ink pb-2">{t.sources}</h2>
      <dl className="mt-2">
        {SOURCES[lang].map(([name, url, text]) => (
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
