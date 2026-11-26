// L'ordine di un cliente e il gelato che Laura prepara, e il confronto tra i due.
// Un ordine: la base (cono o coppetta), da una a tre palline (l'ordine delle palline non conta), al massimo un
// condimento. Le due salse si versano tenendo premuto (quanta salsa conta per il voto), la granella vuole tre tocchi.
import { intero, scegli, type Caso } from "./caso";
import type { Difficolta } from "./difficolta";

export type Base = "cono" | "coppetta";
export type Condimento = "salsa-cioccolato" | "salsa-fragola" | "granella";
export const CONDIMENTI: readonly Condimento[] = ["salsa-cioccolato", "salsa-fragola", "granella"];
export const TOCCHI_GRANELLA = 3;
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
}

export function gelatoVuoto(): Gelato {
  return { palline: [], tocchiGranella: 0 };
}

export function creaOrdine(caso: Caso, d: Difficolta, vaschette: readonly string[], preferito?: string): Ordine {
  const base: Base = caso() < d.probCoppetta ? "coppetta" : "cono";
  const quante = intero(caso, d.pallineMin, d.pallineMax);
  const palline: string[] = [];
  if (preferito !== undefined && vaschette.includes(preferito)) palline.push(preferito);
  while (palline.length < quante) palline.push(scegli(caso, vaschette));
  const ordine: Ordine = { base, palline };
  if (caso() < d.probCondimento) ordine.condimento = scegli(caso, CONDIMENTI);
  return ordine;
}

// Le salse: il livello va da 0 a 1 mentre il dito resta premuto. Sotto SALSA_MINIMA non è stata messa.
export const SALSA_MINIMA = 0.2;
export const SALSA_GIUSTA: readonly [number, number] = [0.5, 0.8];

export function qualitaSalsa(livello: number): QualitaSalsa | undefined {
  if (livello < SALSA_MINIMA) return undefined;
  return livello >= SALSA_GIUSTA[0] && livello <= SALSA_GIUSTA[1] ? "perfetta" : "ok";
}

export type Errore = "base" | "palline" | "condimento";

// Cosa non torna tra l'ordine e il gelato servito; una lista vuota vuol dire che è giusto.
export function confronta(ordine: Ordine, g: Gelato): Errore[] {
  const errori: Errore[] = [];
  if (g.base !== ordine.base) errori.push("base");
  const a = ordine.palline.toSorted().join(",");
  const b = g.palline.toSorted().join(",");
  if (a !== b) errori.push("palline");
  const fatto = g.condimento === "granella" && g.tocchiGranella < TOCCHI_GRANELLA ? undefined : g.condimento;
  if (fatto !== ordine.condimento) errori.push("condimento");
  return errori;
}
