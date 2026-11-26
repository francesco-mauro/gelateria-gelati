// Il caso del gioco: una funzione che dà un numero tra 0 e 1. Nel gioco è Math.random, nelle prove un generatore
// con il seme (mulberry32), così ogni prova rivede la stessa partita.
export type Caso = () => number;

export function casoConSeme(seme: number): Caso {
  let s = seme >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function intero(caso: Caso, min: number, max: number): number {
  return min + Math.floor(caso() * (max - min + 1));
}

export function scegli<T>(caso: Caso, lista: readonly T[]): T {
  if (lista.length === 0) throw new Error("scegli da una lista vuota");
  return lista[Math.floor(caso() * lista.length)];
}

export function mescola<T>(caso: Caso, lista: readonly T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(caso() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
