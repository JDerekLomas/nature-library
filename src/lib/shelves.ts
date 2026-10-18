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
