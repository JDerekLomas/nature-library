import type { Lang } from "@/i18n/config";
// Exhibitions: small selections with an argument to make (after the Source Library's curated exhibitions).
export interface Exhibition {
  slug: string;
  title: string;
  dek: string;
  essay: string[];
  members: string[]; // scientific names
}

export const EXHIBITIONS: Exhibition[] = [
  {
    slug: "the-herbalists-were-right",
    title: "The Herbalists Were Right",
    dek: "Seven plants from the old herbals that became modern drugs.",
    essay: [
      "Most of what the herbals claimed has not survived scrutiny. Some of it has, and spectacularly. Willow bark, prescribed for fevers and aches since Sumer, led to salicylic acid and then aspirin. A Shropshire herbalist's foxglove recipe for dropsy became digoxin, still used for heart failure.",
      "Cinchona bark from the Andes gave quinine. Sweet wormwood, listed for fevers in a 4th-century Chinese handbook, gave artemisinin and a Nobel Prize in 2015. The Madagascar periwinkle and the Pacific yew gave vincristine and paclitaxel, two of the most important cancer drugs ever made.",
    ],
    members: ["Salix alba", "Digitalis purpurea", "Cinchona officinalis", "Artemisia annua", "Catharanthus roseus", "Taxus brevifolia", "Papaver somniferum", "Rauvolfia serpentina", "Ephedra sinica"],
  },
  {
    slug: "the-columbian-exchange",
    title: "The Columbian Exchange",
    dek: "What the Americas gave the world's kitchens after 1492.",
    essay: [
      "Before 1492 there were no chillies in India, no tomatoes in Italy, no potatoes in Ireland, and no chocolate anywhere outside Mesoamerica. Within two centuries these American crops had reshaped the diets, and the populations, of every continent.",
      "The potato alone is credited with a quarter of Europe's population growth between 1700 and 1900. Maize and cassava became staples across Africa. This exhibition gathers the travellers.",
    ],
    members: ["Zea mays", "Solanum tuberosum", "Solanum lycopersicum", "Capsicum annuum", "Theobroma cacao", "Vanilla planifolia", "Manihot esculenta", "Persea americana", "Ananas comosus", "Ipomoea batatas", "Carica papaya", "Anacardium occidentale", "Chenopodium quinoa", "Opuntia ficus-indica", "Passiflora edulis"],
  },
  {
    slug: "spice-routes",
    title: "The Spice Routes",
    dek: "Bark, bud and seed worth more than their weight in silver.",
    essay: [
      "Nutmeg and cloves grew on a few islands in the Moluccas, and for centuries nowhere else. Pepper came from the Malabar coast, cinnamon from Sri Lanka. Arab, Gujarati, Chinese, Venetian, Portuguese and Dutch merchants all built fortunes, and sometimes empires, on carrying them.",
    ],
    members: ["Piper nigrum", "Cinnamomum verum", "Myristica fragrans", "Syzygium aromaticum", "Elettaria cardamomum", "Crocus sativus", "Zingiber officinale", "Curcuma longa", "Vanilla planifolia", "Nigella sativa"],
  },
  {
    slug: "the-old-ones",
    title: "The Old Ones",
    dek: "Lineages and individuals that have outlasted almost everything.",
    essay: [
      "A bristlecone pine in the White Mountains of California germinated before the Great Pyramid was built. Ginkgo leaves are found, almost unchanged, in rocks 200 million years old. The coelacanth was known only as a fossil until a fisherman landed one in 1938.",
    ],
    members: ["Pinus longaeva", "Ginkgo biloba", "Wollemia nobilis", "Welwitschia mirabilis", "Sequoiadendron giganteum", "Latimeria chalumnae", "Limulus polyphemus", "Ornithorhynchus anatinus", "Populus tremuloides", "Armillaria ostoyae", "Nautilus pompilius", "Cycas revoluta"],
  },
  {
    slug: "the-travellers",
    title: "The Travellers",
    dek: "Animals whose lives are measured in hemispheres.",
    essay: [
      "An Arctic tern can fly the equivalent of three round trips to the Moon in its lifetime. A bar-tailed godwit has flown 13,560 km from Alaska to Tasmania without landing. Monarch butterflies reach Mexican forests that no living monarch has ever seen; their great-grandparents left them.",
    ],
    members: ["Sterna paradisaea", "Limosa lapponica", "Danaus plexippus", "Pantala flavescens", "Diomedea exulans", "Salmo salar", "Anguilla anguilla", "Chelonia mydas", "Hirundo rustica", "Balaenoptera musculus", "Schistocerca gregaria", "Selasphorus rufus"],
  },
  {
    slug: "engineers-of-the-earth",
    title: "Engineers of the Earth",
    dek: "Remove one and the landscape changes shape.",
    essay: [
      "Beavers turn streams into wetlands. Termites air-condition the savanna. Elephants keep grassland from turning to forest. Earthworms, Darwin argued in his last book, had ploughed every field in England many times over. Kelp, mangrove and sphagnum moss build entire habitats out of their own bodies.",
    ],
    members: ["Castor canadensis", "Macrotermes michaelseni", "Loxodonta africana", "Lumbricus terrestris", "Macrocystis pyrifera", "Rhizophora mangle", "Sphagnum palustre", "Enhydra lutris", "Canis lupus", "Apis mellifera", "Acropora cervicornis", "Armillaria ostoyae"],
  },
  {
    slug: "the-poison-garden",
    title: "The Poison Garden",
    dek: "Beautiful, common, and able to kill.",
    essay: [
      "Many of the deadliest plants are garden ornamentals or roadside weeds. Oleander lines motorways. Foxglove and monkshood fill cottage borders. Water hemlock, the most toxic plant in North America, looks like wild carrot. Castor seeds contain ricin.",
      "Every entry here names the poisonous part, the toxin, and the plants it is mistaken for, because most poisonings come from mistakes.",
    ],
    members: ["Cicuta maculata", "Conium maculatum", "Aconitum napellus", "Nerium oleander", "Ricinus communis", "Abrus precatorius", "Atropa bella-donna", "Digitalis purpurea", "Taxus baccata", "Hippomane mancinella", "Datura stramonium", "Amanita phalloides", "Amanita ocreata", "Cortinarius rubellus", "Dendrocnide moroides", "Brugmansia suaveolens", "Strychnos nux-vomica"],
  },
  {
    slug: "kingdom-of-fungi",
    title: "The Hidden Kingdom",
    dek: "Neither plant nor animal: the fungi that feed, heal and kill.",
    essay: [
      "Fungi are closer relatives of animals than of plants. They gave us bread, beer, penicillin and the cyclosporine that makes organ transplants possible. A single honey fungus in Oregon covers nearly ten square kilometres and may be several thousand years old.",
    ],
    members: ["Armillaria ostoyae", "Penicillium rubens", "Saccharomyces cerevisiae", "Amanita muscaria", "Hericium erinaceus", "Ophiocordyceps unilateralis", "Mycena chlorophos", "Tuber melanosporum", "Cantharellus cibarius", "Trametes versicolor", "Claviceps purpurea", "Physarum polycephalum"],
  },
];

export const getExhibition = (slug: string) => EXHIBITIONS.find((x) => x.slug === slug);

// ——— Spanish ———

const ES: Record<string, { title: string; dek: string; essay: string[] }> = {
  "the-herbalists-were-right": {
    title: "Los herbolarios tenían razón",
    dek: "Siete plantas de los viejos herbarios que se convirtieron en fármacos modernos.",
    essay: [
      "La mayor parte de lo que afirmaban los herbarios no ha resistido el examen. Algo sí, y de forma espectacular. La corteza de sauce, recetada contra fiebres y dolores desde Sumer, condujo al ácido salicílico y después a la aspirina. La receta de dedalera de una herbolaria de Shropshire contra la hidropesía se convirtió en la digoxina, que aún se usa para la insuficiencia cardiaca.",
      "La corteza de quina de los Andes dio la quinina. La artemisa dulce, citada contra las fiebres en un manual chino del siglo IV, dio la artemisinina y un Premio Nobel en 2015. La vinca de Madagascar y el tejo del Pacífico dieron la vincristina y el paclitaxel, dos de los fármacos contra el cáncer más importantes jamás creados.",
    ],
  },
  "the-columbian-exchange": {
    title: "El intercambio colombino",
    dek: "Lo que América dio a las cocinas del mundo después de 1492.",
    essay: [
      "Antes de 1492 no había chiles en la India, ni tomates en Italia, ni patatas en Irlanda, ni chocolate en ninguna parte fuera de Mesoamérica. En dos siglos estos cultivos americanos habían transformado la dieta, y la población, de todos los continentes.",
      "Solo a la patata se le atribuye una cuarta parte del crecimiento de la población europea entre 1700 y 1900. El maíz y la yuca se convirtieron en alimentos básicos en toda África. Esta exposición reúne a los viajeros.",
    ],
  },
  "spice-routes": {
    title: "Las rutas de las especias",
    dek: "Corteza, botón y semilla que valían más que su peso en plata.",
    essay: [
      "La nuez moscada y el clavo crecían en unas pocas islas de las Molucas, y durante siglos en ningún otro lugar. La pimienta venía de la costa de Malabar, la canela de Sri Lanka. Mercaderes árabes, guyaratíes, chinos, venecianos, portugueses y neerlandeses hicieron fortunas, y a veces imperios, transportándolas.",
    ],
  },
  "the-old-ones": {
    title: "Los antiguos",
    dek: "Linajes e individuos que han sobrevivido a casi todo.",
    essay: [
      "Un pino longevo de las White Mountains de California germinó antes de que se construyera la Gran Pirámide. Las hojas de ginkgo aparecen, casi sin cambios, en rocas de 200 millones de años. El celacanto solo se conocía como fósil hasta que un pescador capturó uno en 1938.",
    ],
  },
  "the-travellers": {
    title: "Los viajeros",
    dek: "Animales cuyas vidas se miden en hemisferios.",
    essay: [
      "Un charrán ártico puede volar a lo largo de su vida el equivalente a tres viajes de ida y vuelta a la Luna. Una aguja colipinta ha volado 13.560 km de Alaska a Tasmania sin posarse. Las mariposas monarca llegan a bosques mexicanos que ninguna monarca viva ha visto nunca; sus bisabuelas fueron las que partieron.",
    ],
  },
  "engineers-of-the-earth": {
    title: "Ingenieros de la Tierra",
    dek: "Si se quita uno, el paisaje cambia de forma.",
    essay: [
      "Los castores convierten arroyos en humedales. Las termitas climatizan la sabana. Los elefantes impiden que la pradera se convierta en bosque. Las lombrices, sostuvo Darwin en su último libro, habían arado muchas veces cada campo de Inglaterra. El kelp, el manglar y el musgo esfagno construyen hábitats enteros con su propio cuerpo.",
    ],
  },
  "the-poison-garden": {
    title: "El jardín venenoso",
    dek: "Hermosas, comunes y capaces de matar.",
    essay: [
      "Muchas de las plantas más mortales son ornamentales de jardín o malas hierbas de cuneta. La adelfa bordea las autopistas. La dedalera y el acónito llenan los arriates. La cicuta acuática, la planta más tóxica de Norteamérica, se parece a la zanahoria silvestre. Las semillas de ricino contienen ricina.",
      "Cada ficha nombra la parte venenosa, la toxina y las plantas con que se confunde, porque la mayoría de las intoxicaciones nacen de un error.",
    ],
  },
  "kingdom-of-fungi": {
    title: "El reino oculto",
    dek: "Ni planta ni animal: los hongos que alimentan, curan y matan.",
    essay: [
      "Los hongos están más emparentados con los animales que con las plantas. Nos dieron el pan, la cerveza, la penicilina y la ciclosporina que hace posibles los trasplantes de órganos. Una sola armilaria en Oregón ocupa casi diez kilómetros cuadrados y puede tener varios miles de años.",
    ],
  },
};

export const exhibitionsFor = (lang: Lang): Exhibition[] => (lang === "es" ? EXHIBITIONS.map((x) => ({ ...x, ...(ES[x.slug] ?? {}) })) : EXHIBITIONS);
export const exhibitionIn = (lang: Lang, slug: string) => exhibitionsFor(lang).find((x) => x.slug === slug);
