import type { Lang } from "@/i18n/config";
import type { Shelf } from "./types";

// Shelves group the codex by what a living thing does for, or to, the people who meet it.
export const SHELVES: Shelf[] = [
  { id: "medicinal", numeral: "I", title: "The Medicine Cabinet", blurb: "Plants and fungi that healers in at least one tradition have prescribed, from Unani hakims to the compilers of the Bencao. Each entry says how strong the modern evidence is." },
  { id: "fruit", numeral: "II", title: "The Orchard", blurb: "Everything that bears a fruit people eat, with what the fruit is botanically, when it ripens, and how to raise the tree or vine that carries it." },
  { id: "edible", numeral: "III", title: "The Kitchen Garden", blurb: "Leaves, roots, seeds, flowers and fungi that are safe to eat once properly prepared, and the parts of the same plants that are not." },
  { id: "staple", numeral: "IV", title: "The Granary", blurb: "The handful of crops that feed most of humanity: grains, tubers and pulses, and where each one was first domesticated." },
  { id: "spice", numeral: "V", title: "The Spice Chest", blurb: "Bark, bud, seed and stigma that drove sea routes, wars and empires." },
  { id: "toxic", numeral: "VI", title: "The Poison Garden", blurb: "Plants and fungi that harm. Which part, which toxin, what it does, and the harmless look-alikes it is confused with." },
  { id: "deadly", numeral: "VII", title: "The Locked Case", blurb: "Species that can kill a person. Read, look, and do not touch." },
  { id: "tree", numeral: "VIII", title: "The Grove", blurb: "Trees, including the tallest, the widest, and the oldest single organisms ever found." },
  { id: "ancient", numeral: "IX", title: "The Old Ones", blurb: "Living fossils and individuals of extraordinary age: lineages that watched the dinosaurs come and go." },
  { id: "carnivorous", numeral: "X", title: "The Carnivores of the Green World", blurb: "Plants that trap, drown and digest animals to make up for poor soil." },
  { id: "pollinator", numeral: "XI", title: "The Pollinators", blurb: "Bees, moths, birds and bats that carry pollen, and without whom roughly a third of our food would fail." },
  { id: "pollinator-plant", numeral: "XII", title: "The Nectary", blurb: "Plants worth growing for bees, butterflies and hummingbirds." },
  { id: "psychoactive", numeral: "XIII", title: "The Visionary Shelf", blurb: "Species that change consciousness, read through the rituals and pharmacopoeias that used them. History, not instructions." },
  { id: "marvel", numeral: "XIV", title: "The Cabinet of Wonders", blurb: "Glowing fungi, immortal jellyfish, animals that survive the vacuum of space: the record-holders and the improbable." },
  { id: "keystone", numeral: "XV", title: "The Engineers", blurb: "Keystone species. Remove one and the whole ecosystem around it changes shape." },
  { id: "migrant", numeral: "XVI", title: "The Travellers", blurb: "Animals that cross oceans and hemispheres, some of them every year of their lives." },
  { id: "ocean", numeral: "XVII", title: "The Deep", blurb: "Life of the sea, from kelp forests to the abyss." },
  { id: "endangered", numeral: "XVIII", title: "The Vanishing", blurb: "Species the IUCN lists as Vulnerable, Endangered or Critically Endangered." },
  { id: "sacred", numeral: "XIX", title: "The Sacred Grove", blurb: "Species at the centre of a faith or a culture: the Bodhi tree, the lotus, the raven." },
  { id: "dye-fibre", numeral: "XX", title: "The Weaver's Shelf", blurb: "Sources of cloth, rope, dye, paper and timber." },
  { id: "songbird", numeral: "XXI", title: "The Choir", blurb: "Singers: songbirds above all, and the frogs and insects whose calls fill a night. Each sheet describes the voice, and you can listen to field recordings." },
  { id: "freshwater", numeral: "XXII", title: "The River", blurb: "Life of rivers, lakes and marshes, from the mahseer of the Himalayan torrents to the axolotl of Mexico City's last canals." },
  { id: "venomous", numeral: "XXIII", title: "The Venom Cabinet", blurb: "Animals that bite, sting or poison. What the venom does, and how to keep your distance." },
];

export const shelfById = (id: string) => SHELVES.find((s) => s.id === id);

export const EDIBILITY: Record<string, { label: string; tone: string; step: number }> = {
  edible: { label: "Edible", tone: "#5f7d3c", step: 0 },
  "edible-with-care": { label: "Edible with care", tone: "#9a8a2a", step: 1 },
  "not-edible": { label: "Not eaten", tone: "#77766a", step: 2 },
  toxic: { label: "Toxic", tone: "#b5652a", step: 3 },
  deadly: { label: "Deadly", tone: "#9b2f25", step: 4 },
};

export const IUCN: Record<string, { label: string; color: string }> = {
  NE: { label: "Not evaluated", color: "#77766a" },
  DD: { label: "Data deficient", color: "#77766a" },
  LC: { label: "Least concern", color: "#2e4a32" },
  NT: { label: "Near threatened", color: "#5f7d3c" },
  VU: { label: "Vulnerable", color: "#b5852a" },
  EN: { label: "Endangered", color: "#b5652a" },
  CR: { label: "Critically endangered", color: "#9b2f25" },
  EW: { label: "Extinct in the wild", color: "#5a1d18" },
  EX: { label: "Extinct", color: "#1b1d16" },
};

// GBIF backbone keys used by the Atlas filters
export const ATLAS_LAYERS = [
  { id: "all", label: "All life", gbif: "" , inat: "" },
  { id: "plants", label: "Plants", gbif: "taxonKey=6", inat: "Plantae" },
  { id: "fungi", label: "Fungi", gbif: "taxonKey=5", inat: "Fungi" },
  { id: "birds", label: "Birds", gbif: "taxonKey=212", inat: "Aves" },
  { id: "insects", label: "Insects", gbif: "taxonKey=216", inat: "Insecta" },
  { id: "mammals", label: "Mammals", gbif: "taxonKey=359", inat: "Mammalia" },
  { id: "reptiles", label: "Lizards & snakes", gbif: "taxonKey=11592253", inat: "Reptilia" },
  { id: "amphibians", label: "Amphibians", gbif: "taxonKey=131", inat: "Amphibia" },
  { id: "fish", label: "Ray-finned fish", gbif: "taxonKey=204", inat: "Actinopterygii" },
  { id: "molluscs", label: "Molluscs", gbif: "taxonKey=52", inat: "Mollusca" },
];

// ——— Spanish ———

const SHELVES_ES: Record<string, { title: string; blurb: string }> = {
  medicinal: { title: "El Botiquín", blurb: "Plantas y hongos que los sanadores de al menos una tradición han recetado, de los hakims unani a los compiladores del Bencao. Cada ficha dice cuán sólida es la evidencia moderna." },
  fruit: { title: "El Huerto de Frutales", blurb: "Todo lo que da un fruto que la gente come: qué es botánicamente, cuándo madura y cómo criar el árbol o la planta que lo lleva." },
  edible: { title: "La Huerta", blurb: "Hojas, raíces, semillas, flores y hongos que se pueden comer con la preparación adecuada, y las partes de esas mismas plantas que no." },
  staple: { title: "El Granero", blurb: "El puñado de cultivos que alimenta a la mayor parte de la humanidad: cereales, tubérculos y legumbres, y dónde se domesticó cada uno." },
  spice: { title: "El Cofre de las Especias", blurb: "Corteza, botón, semilla y estigma que movieron rutas marítimas, guerras e imperios." },
  toxic: { title: "El Jardín Venenoso", blurb: "Plantas y hongos que hacen daño: qué parte, qué toxina, qué efecto, y las especies inofensivas con que se confunden." },
  deadly: { title: "La Vitrina Cerrada", blurb: "Especies que pueden matar a una persona. Lee, mira y no toques." },
  tree: { title: "La Arboleda", blurb: "Árboles, entre ellos los más altos, los más anchos y los organismos individuales más viejos jamás encontrados." },
  ancient: { title: "Los Antiguos", blurb: "Fósiles vivientes e individuos de edad extraordinaria: linajes que vieron llegar y desaparecer a los dinosaurios." },
  carnivorous: { title: "Las Carnívoras del Mundo Verde", blurb: "Plantas que atrapan, ahogan y digieren animales para compensar suelos pobres." },
  pollinator: { title: "Los Polinizadores", blurb: "Abejas, polillas, aves y murciélagos que llevan el polen, y sin los cuales fallaría cerca de un tercio de nuestra comida." },
  "pollinator-plant": { title: "El Nectario", blurb: "Plantas que vale la pena cultivar para abejas, mariposas y colibríes." },
  psychoactive: { title: "El Estante Visionario", blurb: "Especies que alteran la conciencia, leídas a través de los rituales y farmacopeas que las usaron. Historia, no instrucciones." },
  marvel: { title: "El Gabinete de Maravillas", blurb: "Hongos que brillan, medusas inmortales, animales que sobreviven al vacío del espacio: los récords y lo improbable." },
  keystone: { title: "Los Ingenieros", blurb: "Especies clave. Si se quita una, todo el ecosistema a su alrededor cambia de forma." },
  migrant: { title: "Los Viajeros", blurb: "Animales que cruzan océanos y hemisferios, algunos cada año de su vida." },
  ocean: { title: "Las Profundidades", blurb: "La vida del mar, de los bosques de kelp al abismo." },
  endangered: { title: "Los que Desaparecen", blurb: "Especies que la UICN considera Vulnerables, En Peligro o En Peligro Crítico." },
  sacred: { title: "El Bosque Sagrado", blurb: "Especies en el centro de una fe o una cultura: el árbol Bodhi, el loto, el cuervo." },
  "dye-fibre": { title: "El Estante del Tejedor", blurb: "Fuentes de tela, cuerda, tinte, papel y madera." },
  songbird: { title: "El Coro", blurb: "Cantores: sobre todo aves canoras, y las ranas e insectos cuyas voces llenan la noche. Cada ficha describe la voz, y puedes escuchar grabaciones de campo." },
  freshwater: { title: "El Río", blurb: "La vida de ríos, lagos y marismas, del mahseer de los torrentes del Himalaya al ajolote de los últimos canales de Ciudad de México." },
  venomous: { title: "El Gabinete del Veneno", blurb: "Animales que muerden, pican o envenenan. Qué hace el veneno y cómo mantener la distancia." },
};

export function shelvesFor(lang: Lang): Shelf[] {
  return lang === "es" ? SHELVES.map((s) => ({ ...s, ...(SHELVES_ES[s.id] ?? {}) })) : SHELVES;
}
export const shelfIn = (lang: Lang, id: string) => shelvesFor(lang).find((s) => s.id === id);

const EDIBILITY_ES: Record<string, string> = { edible: "Comestible", "edible-with-care": "Comestible con cuidado", "not-edible": "No se come", toxic: "Tóxico", deadly: "Mortal" };
export const edibilityLabel = (lang: Lang, k: string) => (lang === "es" ? EDIBILITY_ES[k] : EDIBILITY[k]?.label) ?? k;

const IUCN_ES: Record<string, string> = {
  NE: "No evaluado", DD: "Datos insuficientes", LC: "Preocupación menor", NT: "Casi amenazado", VU: "Vulnerable", EN: "En peligro",
  CR: "En peligro crítico", EW: "Extinto en estado silvestre", EX: "Extinto",
};
export const iucnLabel = (lang: Lang, k: string) => (lang === "es" ? IUCN_ES[k] : IUCN[k]?.label) ?? k;

const LAYERS_ES: Record<string, string> = {
  all: "Toda la vida", plants: "Plantas", fungi: "Hongos", birds: "Aves", insects: "Insectos", mammals: "Mamíferos", reptiles: "Lagartos y serpientes",
  amphibians: "Anfibios", fish: "Peces óseos", molluscs: "Moluscos",
};
export const layersFor = (lang: Lang) => (lang === "es" ? ATLAS_LAYERS.map((l) => ({ ...l, label: LAYERS_ES[l.id] ?? l.label })) : ATLAS_LAYERS);
