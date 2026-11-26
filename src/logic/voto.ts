// Il voto di un cliente servito: da zero a tre stelle e i punti.
// Sbagliato: zero stelle, zero punti, un cuore in meno. Giusto: una stella; la seconda se resta almeno il 35% della
// pazienza; la terza se ne resta almeno il 65% e la salsa, quando c'è, è venuta perfetta.
// Punti: 50 per pezzo (base, palline, condimento) più fino a 100 per la fretta, per il moltiplicatore della serie
// (clienti giusti di fila: +10% l'uno, fino a +50%).
import type { Gelato, Ordine } from "./ordine";
import { confronta } from "./ordine";

export interface Voto {
  giusto: boolean;
  stelle: number;
  punti: number;
}

export const SOGLIA_DUE = 0.35;
export const SOGLIA_TRE = 0.65;
export const SERIE_MASSIMA = 5;

export function moltiplicatore(serie: number): number {
  return 1 + Math.min(serie, SERIE_MASSIMA) * 0.1;
}

export function vota(ordine: Ordine, g: Gelato, frazioneRimasta: number, serie: number): Voto {
  if (confronta(ordine, g).length > 0) return { giusto: false, stelle: 0, punti: 0 };
  const f = Math.max(0, Math.min(1, frazioneRimasta));
  const salsaOk = ordine.condimento === undefined || ordine.condimento === "granella" || ordine.condimento === "panna" || g.qualita === "perfetta";
  let stelle = 1;
  if (f >= SOGLIA_DUE) stelle++;
  if (f >= SOGLIA_TRE && salsaOk) stelle++;
  const pezzi = 1 + ordine.palline.length + (ordine.condimento === undefined ? 0 : 1);
  const punti = Math.round((50 * pezzi + 100 * f) * moltiplicatore(serie));
  return { giusto: true, stelle, punti };
}
