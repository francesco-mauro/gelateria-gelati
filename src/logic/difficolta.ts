// Quanto è difficile il cliente numero n (0 è il primo): sempre più in fretta e con ordini più lunghi
// (scelta di Francesco del 24 novembre 2026, 18:54: «contro il tempo, un cliente alla volta sempre più in fretta»).
// I numeri sono di Guardiana, da provare sul telefono: una partita media dura due o tre minuti.
export interface Difficolta {
  pazienza: number; // secondi prima che il cliente se ne vada
  pallineMin: number;
  pallineMax: number;
  probCondimento: number;
  probCoppetta: number;
}

export const PAZIENZA_INIZIO = 22;
export const PAZIENZA_MINIMA = 7;
export const CALO = 0.94;

export function difficolta(n: number): Difficolta {
  const pazienza = Math.max(PAZIENZA_MINIMA, PAZIENZA_INIZIO * CALO ** n);
  const pallineMax = n < 2 ? 1 : n < 6 ? 2 : 3;
  const pallineMin = n < 10 ? 1 : 2;
  const probCondimento = n < 2 ? 0 : n < 5 ? 0.35 : 0.65;
  return { pazienza, pallineMin, pallineMax, probCondimento, probCoppetta: n === 0 ? 0 : 0.4 };
}
