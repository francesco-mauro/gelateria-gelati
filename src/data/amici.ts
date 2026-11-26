// I clienti sono gli amici di Laura (scelta di Francesco del 25 novembre 2026, 01:30: «tutti e due gli elenchi più me»;
// alle 09:04 i nomi dei gruppi aggiunti alla lista). Laura non c'è: è lei che gioca.
//
// DA COMPLETARE CON FRANCESCO:
// - `gusto`: il gusto preferito che ognuno gli dice in privato. Finché manca (undefined) l'amico ordina gusti a caso.
//   Il nome deve stare in src/data/gusti.ts (se non c'è, una riga lì).
// - `capelli`, `stile`, `pelle`, `occhiali`, `barba`: dal 26 novembre 2026 sera presi dalle foto di Drive (cartelle
//   per persona confermate da Francesco, più le foto di Cristina, Gaia, Francesca e Marco che ha mandato in chat). Ancora segnaposto:
//   Enza e Gilberto. Le magliette restano colori scelti per distinguerli. Si cambia qui, un amico per riga.
import type { Condimento } from "../logic/ordine";

// I gusti dalle risposte su WhatsApp del 26 novembre 2026 («metti i gusti nel gioco», Francesco alle 14:46).
// `gusto` è il primo che hanno detto (cambia la vaschetta, c'è sempre nell'ordine), `altri` gli altri.
// Gaia: «yogurt e caffè di solito», poi «sì caffè decisamente», quindi caffè prima. Paolo: «Cremino Rivareno,
// nocciola e pistacchio». Matteo: «stracciatella alla Nutella» resa con stracciatella. Gilberto: dal vocale Whisper
// capisce «crema e fegna»; Francesco alle 15:37: «il gusto di Gilberto è crema e fragola». Tolti dalla lista il 26 novembre, su richiesta di Francesco: Luca alle 20:49, Cice alle 21:22. Francesco alle 15:08: «il mio gusto è pistacchio e nutella».
// `condimento`: quello che l'amico vuole sempre. Dede: «per me più che il gelato è importante la doppia panna»
// (a Francesco, 26 novembre 2026; lui alle 12:24: «sì, aggiungi la panna per Dede»).
export type Stile = "corti" | "lunghi" | "raccolti" | "ricci" | "caschetto" | "rasati";

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
  maglia: number;
}

const CHIARA = 0xf6d3b8;
const MEDIA = 0xe8b894;
const DORATA = 0xd9a47c;

export const AMICI: readonly Amico[] = [
  { id: "cristina", nome: "Cristina", gusto: "nocciola", capelli: 0x2a1d16, stile: "ricci", pelle: CHIARA, maglia: 0xe0565b },
  { id: "gaia", nome: "Gaia", gusto: "caffe", altri: ["yogurt"], capelli: 0x8a5a36, stile: "lunghi", pelle: CHIARA, maglia: 0x4f9dd9 },
  { id: "dede", nome: "Dede", gusto: "caramello", altri: ["nocciola"], condimento: "panna", capelli: 0x3b2a20, stile: "lunghi", pelle: CHIARA, maglia: 0x9b6bd1 },
  { id: "enza", nome: "Enza", gusto: "menta", altri: ["vaniglia"], capelli: 0x2a1d16, stile: "lunghi", pelle: DORATA, maglia: 0xf2a33a },
  { id: "aurora", nome: "Aurora", gusto: "crema", altri: ["caffe"], capelli: 0x5a1f22, stile: "ricci", pelle: CHIARA, occhiali: true, maglia: 0xe86fa8 },
  { id: "gilberto", nome: "Gilberto", gusto: "crema", altri: ["fragola"], capelli: 0x2b2b2b, stile: "corti", pelle: MEDIA, barba: true, maglia: 0x3c6e9e },
  { id: "matteo", nome: "Matteo", gusto: "tiramisu", altri: ["stracciatella"], capelli: 0x2a1f18, stile: "corti", pelle: CHIARA, occhiali: true, barba: true, maglia: 0x6c8a3a },
  { id: "francesca", nome: "Francesca", gusto: "cocco", altri: ["cioccolato"], capelli: 0x6b4a32, stile: "caschetto", pelle: CHIARA, maglia: 0xd4574f },
  { id: "marco", nome: "Marco", gusto: "cioccolato", altri: ["limone"], capelli: 0x1a1410, stile: "rasati", pelle: CHIARA, occhiali: true, barba: true, maglia: 0x2f8f8f },
  { id: "paolo", nome: "Paolo", gusto: "cremino", altri: ["nocciola", "pistacchio"], capelli: 0x2a1f18, stile: "rasati", pelle: CHIARA, occhiali: true, barba: true, maglia: 0x5b5fc7 },
  { id: "francesco", nome: "Francesco", gusto: "pistacchio", altri: ["nutella"], capelli: 0x2a1f18, stile: "corti", pelle: CHIARA, maglia: 0x1f2a44 },
];
