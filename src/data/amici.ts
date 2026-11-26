// I clienti sono gli amici di Laura (scelta di Francesco del 25 novembre 2026, 01:30: «tutti e due gli elenchi più me»;
// alle 09:04 i nomi dei gruppi aggiunti alla lista). Laura non c'è: è lei che gioca.
//
// DA COMPLETARE CON FRANCESCO:
// - `gusto`: il gusto preferito che ognuno gli dice in privato. Finché manca (undefined) l'amico ordina gusti a caso.
//   Il nome deve stare in src/data/gusti.ts (se non c'è, una riga lì).
// - `capelli`, `stile`, `pelle`, `occhiali`, `barba`: l'aspetto è un SEGNAPOSTO scelto da Guardiana per distinguerli,
//   non come sono davvero. Si cambia qui, un amico per riga.
import type { Condimento } from "../logic/ordine";

// `condimento`: quello che l'amico vuole sempre. Dede: «per me più che il gelato è importante la doppia panna»
// (a Francesco, 26 novembre 2026; lui alle 12:24: «sì, aggiungi la panna per Dede»).
export type Stile = "corti" | "lunghi" | "raccolti" | "ricci" | "caschetto" | "rasati";

export interface Amico {
  id: string;
  nome: string;
  gusto?: string;
  condimento?: Condimento;
  capelli: number;
  stile: Stile;
  pelle: number;
  occhiali?: boolean;
  barba?: boolean;
  maglia: number;
}

const CHIARA = 0xf6d3b8;
const MEDIA = 0xe8b894;
const DORATA = 0xd9a47c;

export const AMICI: readonly Amico[] = [
  { id: "cristina", nome: "Cristina", capelli: 0x3b2a20, stile: "lunghi", pelle: CHIARA, maglia: 0xe0565b },
  { id: "gaia", nome: "Gaia", capelli: 0x5a3a24, stile: "ricci", pelle: MEDIA, maglia: 0x4f9dd9 },
  { id: "dede", nome: "Dede", condimento: "panna", capelli: 0x1f1a17, stile: "raccolti", pelle: CHIARA, maglia: 0x9b6bd1 },
  { id: "cice", nome: "Cice", capelli: 0xc98a3c, stile: "caschetto", pelle: CHIARA, maglia: 0x46b58a },
  { id: "enza", nome: "Enza", capelli: 0x2a1d16, stile: "lunghi", pelle: DORATA, maglia: 0xf2a33a },
  { id: "aurora", nome: "Aurora", capelli: 0x8a4b2a, stile: "ricci", pelle: CHIARA, maglia: 0xe86fa8 },
  { id: "gilberto", nome: "Gilberto", capelli: 0x2b2b2b, stile: "corti", pelle: MEDIA, barba: true, maglia: 0x3c6e9e },
  { id: "matteo", nome: "Matteo", capelli: 0x4a3222, stile: "corti", pelle: CHIARA, occhiali: true, maglia: 0x6c8a3a },
  { id: "francesca", nome: "Francesca", capelli: 0x6b4630, stile: "caschetto", pelle: MEDIA, occhiali: true, maglia: 0xd4574f },
  { id: "marco", nome: "Marco", capelli: 0x241a14, stile: "rasati", pelle: DORATA, barba: true, maglia: 0x2f8f8f },
  { id: "luca", nome: "Luca", capelli: 0x7a5233, stile: "corti", pelle: CHIARA, maglia: 0xc77d2e },
  { id: "paolo", nome: "Paolo", capelli: 0x3a2a1e, stile: "rasati", pelle: MEDIA, occhiali: true, maglia: 0x5b5fc7 },
  { id: "francesco", nome: "Francesco", capelli: 0x2a1f18, stile: "corti", pelle: CHIARA, barba: true, maglia: 0x1f2a44 },
];
