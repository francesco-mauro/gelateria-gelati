// I gusti della gelateria: nome sul biglietto, colore della pallina, colore dei puntini (per distinguerli anche a chi
// confonde i colori), tutti in una riga. Un gusto nuovo, quando arrivano le risposte degli amici: una riga qui, poi
// il nome del gusto in src/data/amici.ts. Sul bancone ci stanno al massimo OTTO vaschette (due file da quattro).
export interface Gusto {
  id: string;
  nome: string;
  colore: number;
  puntini: number;
}

export const GUSTI: readonly Gusto[] = [
  { id: "cioccolato", nome: "Cioccolato", colore: 0x6b3e26, puntini: 0x4a2a19 },
  { id: "fragola", nome: "Fragola", colore: 0xf28ba8, puntini: 0xd9466f },
  { id: "pistacchio", nome: "Pistacchio", colore: 0xa8c66c, puntini: 0x6f8f3a },
  { id: "fiordilatte", nome: "Fiordilatte", colore: 0xfbf6ea, puntini: 0xe6dcc4 },
  { id: "nocciola", nome: "Nocciola", colore: 0xc49a6c, puntini: 0x8f6a42 },
  { id: "limone", nome: "Limone", colore: 0xfbe58a, puntini: 0xe8c547 },
  { id: "stracciatella", nome: "Stracciatella", colore: 0xf6f1e4, puntini: 0x3b2417 },
  { id: "caffe", nome: "Caffè", colore: 0xa07855, puntini: 0x6e4f35 },
  // Di scorta: entrano sul bancone solo se un amico li sceglie.
  { id: "cocco", nome: "Cocco", colore: 0xffffff, puntini: 0xd8cfc0 },
  { id: "mango", nome: "Mango", colore: 0xffb347, puntini: 0xe88a1a },
  { id: "menta", nome: "Menta", colore: 0xb6ecd4, puntini: 0x2f2a28 },
  { id: "amarena", nome: "Amarena", colore: 0xf3d9e0, puntini: 0x9c1f3c },
  { id: "puffo", nome: "Puffo", colore: 0x7fb8f0, puntini: 0x3f7fc4 },
  { id: "tiramisu", nome: "Tiramisù", colore: 0xe8d3b0, puntini: 0x7a5a3c },
  { id: "liquirizia", nome: "Liquirizia", colore: 0x3a3a3a, puntini: 0x1a1a1a },
  { id: "crema", nome: "Crema", colore: 0xf9e3a3, puntini: 0xe9c56a },
  { id: "banana", nome: "Banana", colore: 0xf7eeb0, puntini: 0xdcc96a },
  { id: "melone", nome: "Melone", colore: 0xffc59e, puntini: 0xf09a63 },
  { id: "bianco", nome: "Ciocc. bianco", colore: 0xfff3dc, puntini: 0xe2cfa6 },
  { id: "nutella", nome: "Nutella", colore: 0x7a4a2c, puntini: 0xc49a6c },
  { id: "gianduia", nome: "Gianduia", colore: 0x8a5a3a, puntini: 0x5a3a24 },
  { id: "bacio", nome: "Bacio", colore: 0x5e3a26, puntini: 0xc49a6c },
  { id: "kinder", nome: "Kinder", colore: 0xf4ead8, puntini: 0x7a4a2c },
  { id: "bosco", nome: "Frutti bosco", colore: 0xa0457a, puntini: 0x5a1f4a },
  { id: "lampone", nome: "Lampone", colore: 0xe5577a, puntini: 0xa8244a },
  { id: "mirtillo", nome: "Mirtillo", colore: 0x7c6bc4, puntini: 0x3f3080 },
  { id: "pesca", nome: "Pesca", colore: 0xffc8a0, puntini: 0xf08a6a },
  { id: "anguria", nome: "Anguria", colore: 0xf26d6d, puntini: 0x2a1a1a },
  { id: "arancia", nome: "Arancia", colore: 0xffa94d, puntini: 0xe0761a },
  { id: "yogurt", nome: "Yogurt", colore: 0xfdfbf5, puntini: 0xe6e0d2 },
  { id: "zabaione", nome: "Zabaione", colore: 0xf7d774, puntini: 0xd9a92e },
  { id: "malaga", nome: "Malaga", colore: 0xefdcc0, puntini: 0x5a2a3a },
  { id: "caramello", nome: "Caramello", colore: 0xd99a4e, puntini: 0xa86a24 },
  { id: "biscotto", nome: "Biscotto", colore: 0xdcb88a, puntini: 0x7a5233 },
  { id: "cheesecake", nome: "Cheesecake", colore: 0xfaf0dc, puntini: 0xd9466f },
  { id: "ricotta", nome: "Ricotta", colore: 0xfdf8ee, puntini: 0x9a6a8a },
  { id: "mandorla", nome: "Mandorla", colore: 0xf2e2c4, puntini: 0xc4a274 },
  { id: "cannella", nome: "Cannella", colore: 0xc98a52, puntini: 0x8a5228 },
  { id: "fico", nome: "Fico", colore: 0xb06a8a, puntini: 0x5a2a4a },
  { id: "cassata", nome: "Cassata", colore: 0xfbeee0, puntini: 0x4fa36a },
  { id: "vaniglia", nome: "Vaniglia", colore: 0xfbefc6, puntini: 0x3a2a1e },
  { id: "cremino", nome: "Cremino", colore: 0xd9b48a, puntini: 0x5a3a24 },
];

export const MAX_VASCHETTE = 8;

export function gusto(id: string): Gusto {
  const g = GUSTI.find((x) => x.id === id);
  if (g === undefined) throw new Error(`gusto sconosciuto: ${id}`);
  return g;
}

// Le vaschette sul bancone: prima i gusti preferiti degli amici (nell'ordine in cui compaiono), poi i classici fino
// a otto. Se gli amici scelgono più di otto gusti diversi, i preferiti in più restano fuori: lo dice la prova.
export function vaschette(preferiti: readonly (string | undefined)[]): string[] {
  const scelti: string[] = [];
  for (const p of preferiti) if (p !== undefined && !scelti.includes(p)) scelti.push(p);
  for (const g of GUSTI) if (!scelti.includes(g.id)) scelti.push(g.id);
  return scelti.slice(0, MAX_VASCHETTE);
}
