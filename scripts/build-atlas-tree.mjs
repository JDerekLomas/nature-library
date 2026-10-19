// Resolves the Atlas tree of life to GBIF backbone keys (for the globe) and iNaturalist taxon ids (for species lists).
// Run: node scripts/build-atlas-tree.mjs → src/lib/atlas-tree.json
import fs from "node:fs";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { "User-Agent": "NatureLibrary/0.1 (https://thenaturelibrary.org)" };

// [id, scientific name, rank, English, Spanish, children]
const T = [
  ["plants", "Plantae", "kingdom", "Plants", "Plantas", [
    ["dicots", "Magnoliopsida", "class", "Flowering plants: dicots", "Plantas con flor: dicotiledóneas", [
      ["daisies", "Asteraceae", "family", "Daisies & sunflowers", "Margaritas y girasoles"],
      ["legumes", "Fabaceae", "family", "Peas, beans & acacias", "Leguminosas"],
      ["roses", "Rosaceae", "family", "Roses, apples & cherries", "Rosas, manzanos y cerezos"],
      ["mints", "Lamiaceae", "family", "Mints, sage & thyme", "Mentas, salvias y tomillos"],
      ["cacti", "Cactaceae", "family", "Cacti", "Cactus"],
      ["oaks", "Fagaceae", "family", "Oaks & beeches", "Robles y hayas"],
      ["nightshades", "Solanaceae", "family", "Nightshades: tomato, potato, chilli", "Solanáceas: tomate, patata, chile"],
    ]],
    ["monocots", "Liliopsida", "class", "Monocots", "Monocotiledóneas", [
      ["grasses", "Poaceae", "family", "Grasses & grains", "Gramíneas y cereales"],
      ["orchids", "Orchidaceae", "family", "Orchids", "Orquídeas"],
      ["palms", "Arecaceae", "family", "Palms", "Palmeras"],
      ["lilies", "Liliaceae", "family", "Lilies & tulips", "Lirios y tulipanes"],
    ]],
    ["conifers", "Pinopsida", "class", "Conifers", "Coníferas"],
    ["cycads", "Cycadopsida", "class", "Cycads", "Cícadas"],
    ["ferns", "Polypodiopsida", "class", "Ferns", "Helechos"],
    ["clubmosses", "Lycopodiopsida", "class", "Clubmosses", "Licopodios"],
    ["mosses", "Bryophyta", "phylum", "Mosses", "Musgos"],
    ["liverworts", "Marchantiophyta", "phylum", "Liverworts", "Hepáticas"],
    ["greenalgae", "Chlorophyta", "phylum", "Green algae", "Algas verdes"],
    ["redalgae", "Rhodophyta", "phylum", "Red seaweeds", "Algas rojas"],
  ]],
  ["fungi", "Fungi", "kingdom", "Fungi", "Hongos", [
    ["mushrooms", "Agaricomycetes", "class", "Mushrooms & brackets", "Setas y yesqueros"],
    ["lichens", "Lecanoromycetes", "class", "Lichens", "Líquenes"],
    ["cupfungi", "Pezizomycetes", "class", "Cup fungi, morels & truffles", "Pezizas, colmenillas y trufas"],
    ["rusts", "Pucciniomycetes", "class", "Rusts", "Royas"],
    ["moulds", "Sordariomycetes", "class", "Flask fungi & moulds", "Pirenomicetos y mohos"],
  ]],
  ["animals", "Animalia", "kingdom", "Animals", "Animales", [
    ["mammals", "Mammalia", "class", "Mammals", "Mamíferos", [
      ["primates", "Primates", "order", "Primates", "Primates"],
      ["carnivores", "Carnivora", "order", "Carnivores", "Carnívoros"],
      ["hoofed", "Artiodactyla", "order", "Deer, cattle & whales", "Ciervos, bóvidos y cetáceos"],
      ["rodents", "Rodentia", "order", "Rodents", "Roedores"],
      ["bats", "Chiroptera", "order", "Bats", "Murciélagos"],
      ["marsupials", "Diprotodontia", "order", "Kangaroos, koalas & wombats", "Canguros, koalas y wómbats"],
    ]],
    ["birds", "Aves", "class", "Birds", "Aves", [
      ["songbirds", "Passeriformes", "order", "Songbirds", "Paseriformes"],
      ["raptors", "Accipitriformes", "order", "Hawks & eagles", "Gavilanes y águilas"],
      ["owls", "Strigiformes", "order", "Owls", "Búhos y lechuzas"],
      ["waterfowl", "Anseriformes", "order", "Ducks, geese & swans", "Patos, gansos y cisnes"],
      ["shorebirds", "Charadriiformes", "order", "Shorebirds & gulls", "Limícolas y gaviotas"],
      ["herons", "Pelecaniformes", "order", "Herons, ibises & pelicans", "Garzas, ibis y pelícanos"],
      ["parrots", "Psittaciformes", "order", "Parrots", "Loros"],
      ["hummers", "Apodiformes", "order", "Swifts & hummingbirds", "Vencejos y colibríes"],
      ["woodpeckers", "Piciformes", "order", "Woodpeckers & toucans", "Pájaros carpinteros y tucanes"],
    ]],
    ["reptiles", "Reptilia", "class", "Reptiles", "Reptiles", [
      ["squamates", "Squamata", "order", "Lizards & snakes", "Lagartos y serpientes"],
      ["turtles", "Testudines", "order", "Turtles & tortoises", "Tortugas"],
      ["crocodiles", "Crocodylia", "order", "Crocodiles & alligators", "Cocodrilos y caimanes"],
    ]],
    ["amphibians", "Amphibia", "class", "Amphibians", "Anfibios", [
      ["frogs", "Anura", "order", "Frogs & toads", "Ranas y sapos"],
      ["salamanders", "Caudata", "order", "Salamanders & newts", "Salamandras y tritones"],
    ]],
    ["fish", "Actinopterygii", "class", "Ray-finned fishes", "Peces de aletas radiadas"],
    ["sharks", "Elasmobranchii", "class", "Sharks & rays", "Tiburones y rayas"],
    ["insects", "Insecta", "class", "Insects", "Insectos", [
      ["beetles", "Coleoptera", "order", "Beetles", "Escarabajos"],
      ["butterflies", "Lepidoptera", "order", "Butterflies & moths", "Mariposas y polillas"],
      ["bees", "Hymenoptera", "order", "Bees, wasps & ants", "Abejas, avispas y hormigas"],
      ["flies", "Diptera", "order", "Flies & mosquitoes", "Moscas y mosquitos"],
      ["dragonflies", "Odonata", "order", "Dragonflies & damselflies", "Libélulas y caballitos del diablo"],
      ["bugs", "Hemiptera", "order", "True bugs & cicadas", "Chinches y cigarras"],
      ["grasshoppers", "Orthoptera", "order", "Grasshoppers & crickets", "Saltamontes y grillos"],
      ["mantises", "Mantodea", "order", "Mantises", "Mantis"],
    ]],
    ["arachnids", "Arachnida", "class", "Spiders, scorpions & mites", "Arañas, escorpiones y ácaros", [
      ["spiders", "Araneae", "order", "Spiders", "Arañas"],
      ["scorpions", "Scorpiones", "order", "Scorpions", "Escorpiones"],
      ["harvestmen", "Opiliones", "order", "Harvestmen", "Opiliones"],
    ]],
    ["crustaceans", "Malacostraca", "class", "Crabs, shrimp & woodlice", "Cangrejos, gambas y cochinillas"],
    ["centipedes", "Chilopoda", "class", "Centipedes", "Ciempiés"],
    ["millipedes", "Diplopoda", "class", "Millipedes", "Milpiés"],
    ["molluscs", "Mollusca", "phylum", "Molluscs", "Moluscos", [
      ["snails", "Gastropoda", "class", "Snails & slugs", "Caracoles y babosas"],
      ["bivalves", "Bivalvia", "class", "Clams, mussels & oysters", "Almejas, mejillones y ostras"],
      ["cephalopods", "Cephalopoda", "class", "Octopus, squid & cuttlefish", "Pulpos, calamares y sepias"],
    ]],
    ["cnidarians", "Cnidaria", "phylum", "Corals, jellyfish & anemones", "Corales, medusas y anémonas"],
    ["echinoderms", "Echinodermata", "phylum", "Starfish & urchins", "Estrellas y erizos de mar"],
    ["worms", "Annelida", "phylum", "Earthworms & leeches", "Lombrices y sanguijuelas"],
    ["sponges", "Porifera", "phylum", "Sponges", "Esponjas"],
  ]],
  ["chromists", "Chromista", "kingdom", "Kelp, diatoms & kin", "Algas pardas, diatomeas y afines", [
    ["kelp", "Phaeophyceae", "class", "Kelp & brown seaweeds", "Algas pardas"],
    ["diatoms", "Bacillariophyceae", "class", "Diatoms", "Diatomeas"],
    ["watermoulds", "Oomycota", "phylum", "Water moulds", "Oomicetos"],
  ]],
  ["protozoa", "Protozoa", "kingdom", "Protozoa & slime moulds", "Protozoos y mixomicetos", [
    ["slimemoulds", "Myxomycetes", "class", "Slime moulds", "Mixomicetos"],
  ]],
  ["bacteria", "Bacteria", "kingdom", "Bacteria", "Bacterias", [
    ["cyanobacteria", "Cyanobacteria", "phylum", "Cyanobacteria", "Cianobacterias"],
  ]],
  ["archaea", "Archaea", "kingdom", "Archaea", "Arqueas"],
  ["viruses", "Viruses", "kingdom", "Viruses", "Virus"],
];

async function json(u) {
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(u, { headers: UA });
      if (r.ok) return r.json();
      await sleep(r.status === 429 ? 30000 : 2000);
    } catch { await sleep(2000); }
  }
  throw new Error(u);
}
const problems = [];
async function resolve(n, parentPath = []) {
  const [id, sci, rank, en, es, kids] = n;
  const g = await json(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(sci)}&rank=${rank.toUpperCase()}&strict=true`);
  const gbif = g.matchType === "EXACT" && g.canonicalName === sci ? g.usageKey : 0;
  const i = await json(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(sci)}&rank=${rank}&per_page=10&is_active=true`);
  const hit = (i.results ?? []).find((t) => t.name === sci);
  await sleep(1100);
  if (!gbif || !hit) problems.push(`${sci} gbif=${gbif} inat=${hit?.id}`);
  const node = { id, sci, en, es, gbif, inat: hit?.id ?? 0 };
  if (kids) node.children = [];
  for (const k of kids ?? []) node.children.push(await resolve(k, [...parentPath, id]));
  return node;
}
const out = [];
for (const n of T) out.push(await resolve(n));
fs.writeFileSync("src/lib/atlas-tree.json", JSON.stringify(out, null, 1));
console.log(problems.length ? "PROBLEMS:\n" + problems.join("\n") : "all resolved");
