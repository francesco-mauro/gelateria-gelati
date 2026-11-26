// L'ordine di un cliente e il gelato che Laura prepara, e il confronto tra i due.
// Un ordine: la base (cono o coppetta), da una a tre palline (l'ordine delle palline non conta), al massimo un
// condimento. Le due salse si versano tenendo premuto (quanta salsa conta per il voto), la granella vuole tre tocchi.
// La panna (doppia: due tocchi) non esce mai a caso: la ordina solo chi ce l'ha nella sua riga di amici.ts (Dede).
import { intero, scegli, type Caso } from "./caso";
import type { Difficolta } from "./difficolta";

export type Base = "cono" | "coppetta";
export type Condimento = "salsa-cioccolato" | "salsa-fragola" | "granella" | "panna";
// quelli che escono a caso negli ordini
export const CONDIMENTI: readonly Condimento[] = ["salsa-cioccolato", "salsa-fragola", "granella"];
export const TOCCHI_GRANELLA = 3;
export const TOCCHI_PANNA = 2;
export const MAX_PALLINE = 3;

export interface Ordine {
  base: Base;
  palline: string[];
  condimento?: Condimento;
}

export type QualitaSalsa = "perfetta" | "ok";

export interface Gelato {
  base?: Base;
  palline: string[];
  condimento?: Condimento;
  // Le salse: quanto bene è venuta. La granella: i tocchi fatti (ne servono TOCCHI_GRANELLA).
  qualita?: QualitaSalsa;
  tocchiGranella: number;
  // La panna: i tocchi fatti (ne servono TOCCHI_PANNA).
  tocchiPanna?: number;
}

export function gelatoVuoto(): Gelato {
  return { palline: [], tocchiGranella: 0, tocchiPanna: 0 };
}

// `altri`: gli altri gusti che l'amico ha detto; entrano nell'ordine se ci sono più palline e sono già sul bancone.
export function creaOrdine(
  caso: Caso,
  d: Difficolta,
  vaschette: readonly string[],
  preferito?: string,
  condimentoFisso?: Condimento,
  altri: readonly string[] = [],
): Ordine {
  const base: Base = caso() < d.probCoppetta ? "coppetta" : "cono";
  const quante = intero(caso, d.pallineMin, d.pallineMax);
  const palline: string[] = [];
  if (preferito !== undefined && vaschette.includes(preferito)) palline.push(preferito);
  for (const a of altri) if (palline.length < quante && vaschette.includes(a) && !palline.includes(a)) palline.push(a);
  while (palline.length < quante) palline.push(scegli(caso, vaschette));
  const ordine: Ordine = { base, palline };
  if (condimentoFisso !== undefined) ordine.condimento = condimentoFisso;
  else if (caso() < d.probCondimento) ordine.condimento = scegli(caso, CONDIMENTI);
  return ordine;
}

// Le salse: il livello va da 0 a 1 mentre il dito resta premuto. Sotto SALSA_MINIMA non è stata messa.
export const SALSA_MINIMA = 0.2;
export const SALSA_GIUSTA: readonly [number, number] = [0.5, 0.8];

export function qualitaSalsa(livello: number): QualitaSalsa | undefined {
  if (livello < SALSA_MINIMA) return undefined;
  return livello >= SALSA_GIUSTA[0] && livello <= SALSA_GIUSTA[1] ? "perfetta" : "ok";
}

// Il condimento che conta: granella e panna a metà (tocchi che mancano) non valgono ancora.
export function condimentoFatto(g: Gelato): Condimento | undefined {
  if (g.condimento === "granella" && g.tocchiGranella < TOCCHI_GRANELLA) return undefined;
  if (g.condimento === "panna" && (g.tocchiPanna ?? 0) < TOCCHI_PANNA) return undefined;
  return g.condimento;
}

export type Errore = "base" | "palline" | "condimento";

// Cosa non torna tra l'ordine e il gelato servito; una lista vuota vuol dire che è giusto.
export function confronta(ordine: Ordine, g: Gelato): Errore[] {
  const errori: Errore[] = [];
  if (g.base !== ordine.base) errori.push("base");
  // sort su una copia, non toSorted: toSorted manca su Safari prima della 16 (iPhone con iOS 15)
  // oxlint-disable-next-line unicorn/no-array-sort
  const a = [...ordine.palline].sort().join(",");
  // oxlint-disable-next-line unicorn/no-array-sort
  const b = [...g.palline].sort().join(",");
  if (a !== b) errori.push("palline");
  // anche un condimento a metà che il cliente non ha chiesto è un errore: la granella sopra si vede
  if (g.condimento !== ordine.condimento || condimentoFatto(g) !== ordine.condimento) errori.push("condimento");
  return errori;
}
