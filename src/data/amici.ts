// I clienti: gli amici di Laura più Francesco. Laura non c'è, è lei che gioca.
// `gusto` è il preferito (cambia una vaschetta se manca, c'è sempre nell'ordine), `altri` gli altri gusti che hanno
// detto, `condimento` quello che vogliono sempre (Dede, la doppia panna). I gusti vengono dalle loro risposte e
// l'aspetto dalle loro foto, il 26 novembre 2026; le magliette sono colori scelti per distinguerli.
// Un gusto nuovo va prima in src/data/gusti.ts.
import type { Condimento } from "../logic/ordine";

export type Stile = "corti" | "lunghi" | "raccolti" | "ricci" | "caschetto" | "rasati";
// il cappello che porta nelle foto, per riconoscerlo tra i ragazzi con occhiali e barba
export interface Cappello {
  tipo: "berretto" | "visiera";
  colore: number;
}

export interface Amico {
  id: string;
  nome: string;
  gusto?: string;
  altri?: readonly string[];
  condimento?: Condimento;
  capelli: number;
  stile: Stile;
  pelle: number;
  occhiali?: boolean;
  barba?: boolean;
  cappello?: Cappello;
  maglia: number;
}

const CHIARA = 0xf6d3b8;
const MEDIA = 0xe8b894;

export const AMICI: readonly Amico[] = [
  { id: "cristina", nome: "Cristina", gusto: "nocciola", capelli: 0x2a1d16, stile: "ricci", pelle: CHIARA, maglia: 0xe0565b },
  { id: "gaia", nome: "Gaia", gusto: "caffe", altri: ["yogurt"], capelli: 0x8a5a36, stile: "lunghi", pelle: CHIARA, maglia: 0x4f9dd9 },
  { id: "dede", nome: "Dede", gusto: "caramello", altri: ["nocciola"], condimento: "panna", capelli: 0x3b2a20, stile: "lunghi", pelle: CHIARA, maglia: 0x9b6bd1 },
  { id: "enza", nome: "Enza", gusto: "menta", altri: ["vaniglia"], capelli: 0x3a2418, stile: "lunghi", pelle: MEDIA, maglia: 0xf2a33a },
  { id: "aurora", nome: "Aurora", gusto: "crema", altri: ["caffe"], capelli: 0x5a1f22, stile: "ricci", pelle: CHIARA, occhiali: true, maglia: 0xe86fa8 },
  { id: "gilberto", nome: "Gilberto", gusto: "crema", altri: ["fragola"], capelli: 0x5a3a24, stile: "corti", pelle: CHIARA, occhiali: true, barba: true, cappello: { tipo: "berretto", colore: 0x2e2e33 }, maglia: 0x3c6e9e },
  { id: "matteo", nome: "Matteo", gusto: "tiramisu", altri: ["stracciatella"], capelli: 0x2a1f18, stile: "corti", pelle: CHIARA, occhiali: true, barba: true, maglia: 0x6c8a3a },
  { id: "francesca", nome: "Francesca", gusto: "cocco", altri: ["cioccolato"], capelli: 0x6b4a32, stile: "caschetto", pelle: CHIARA, maglia: 0xd4574f },
  { id: "marco", nome: "Marco", gusto: "cioccolato", altri: ["limone"], capelli: 0x1a1410, stile: "rasati", pelle: CHIARA, occhiali: true, barba: true, maglia: 0x2f8f8f },
  { id: "paolo", nome: "Paolo", gusto: "cremino", altri: ["nocciola", "pistacchio"], capelli: 0x2a1f18, stile: "rasati", pelle: CHIARA, occhiali: true, barba: true, cappello: { tipo: "visiera", colore: 0x4fb3a9 }, maglia: 0x5b5fc7 },
  { id: "francesco", nome: "Francesco", gusto: "pistacchio", altri: ["nutella"], capelli: 0x2a1f18, stile: "corti", pelle: CHIARA, maglia: 0x1f2a44 },
];
