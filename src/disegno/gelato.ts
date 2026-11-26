// Il gelato disegnato: cono o coppetta, palline una sopra l'altra, salsa che cola, granella.
// Tutto su una Graphics: si ridisegna da capo a ogni cambio (pochi pezzi, costa niente).
import * as Phaser from "phaser";
import { gusto } from "../data/gusti";
import type { Base, Condimento, Gelato } from "../logic/ordine";
import { COLORI } from "./stile";

export const RAGGIO_PALLINA = 25;
export const PASSO_PALLINA = 30;

// Dove sta la prossima pallina, rispetto all'attacco (il bordo alto del cono o della coppetta).
export function centroPallina(i: number): number {
  return -RAGGIO_PALLINA * 0.55 - i * PASSO_PALLINA;
}

export function disegnaBase(g: Phaser.GameObjects.Graphics, base: Base, x: number, y: number, s = 1): void {
  if (base === "cono") {
    g.fillStyle(COLORI.cono, 1);
    g.fillTriangle(x - 28 * s, y, x + 28 * s, y, x, y + 84 * s);
    // la cialda: righe incrociate da un lato all'altro del triangolo, così non escono mai dai bordi
    g.lineStyle(2 * s, COLORI.conoRighe, 1);
    const sx = (t: number): [number, number] => [x - 28 * s * (1 - t), y + 84 * s * t];
    const dx = (t: number): [number, number] => [x + 28 * s * (1 - t), y + 84 * s * t];
    for (let t = -0.2; t < 0.8; t += 0.2) {
      const [ax, ay] = sx(Math.max(0, t));
      const [bx, by] = dx(Math.min(1, t + 0.35));
      const [cx, cy] = dx(Math.max(0, t));
      const [ex, ey] = sx(Math.min(1, t + 0.35));
      g.lineBetween(ax, ay, bx, by);
      g.lineBetween(cx, cy, ex, ey);
    }
    g.fillStyle(COLORI.conoRighe, 1);
    g.fillRoundedRect(x - 30 * s, y - 4 * s, 60 * s, 9 * s, 4 * s);
  } else {
    g.fillStyle(COLORI.coppetta, 1);
    g.fillPoints(
      [
        new Phaser.Math.Vector2(x - 34 * s, y),
        new Phaser.Math.Vector2(x + 34 * s, y),
        new Phaser.Math.Vector2(x + 22 * s, y + 44 * s),
        new Phaser.Math.Vector2(x - 22 * s, y + 44 * s),
      ],
      true,
    );
    g.fillStyle(COLORI.coppettaRighe, 1);
    for (let i = -2; i <= 2; i++) g.fillRect(x + i * 12 * s - 2 * s, y + 4 * s, 4 * s, 36 * s);
    g.fillStyle(COLORI.coppettaRighe, 1);
    g.fillRoundedRect(x - 36 * s, y - 4 * s, 72 * s, 9 * s, 4 * s);
  }
}

export function disegnaPallina(g: Phaser.GameObjects.Graphics, idGusto: string, x: number, y: number, s = 1): void {
  const gu = gusto(idGusto);
  const r = RAGGIO_PALLINA * s;
  g.fillStyle(0x000000, 0.08);
  g.fillCircle(x + 2 * s, y + 3 * s, r);
  g.fillStyle(gu.colore, 1);
  g.fillCircle(x, y, r);
  // il bordo ondulato in basso, come una pallina fatta con lo sporzionatore
  for (let i = -2; i <= 2; i++) g.fillCircle(x + i * r * 0.42, y + r * 0.72, r * 0.32);
  g.fillStyle(gu.puntini, 1);
  const punti: [number, number][] = [
    [-0.45, -0.2],
    [0.3, -0.45],
    [0.5, 0.15],
    [-0.1, 0.25],
    [-0.55, 0.35],
  ];
  for (const [dx, dy] of punti) g.fillCircle(x + dx * r, y + dy * r, r * 0.09);
  g.fillStyle(0xffffff, 0.45);
  g.fillEllipse(x - r * 0.35, y - r * 0.45, r * 0.5, r * 0.28);
  g.lineStyle(1.5 * s, gu.puntini, 0.6);
  g.strokeCircle(x, y, r);
}

export function coloreCondimento(c: Condimento): number {
  return c === "salsa-cioccolato" ? COLORI.cioccolato : c === "salsa-fragola" ? COLORI.fragola : COLORI.bianco;
}

// La salsa sopra la pallina più alta: una calotta e qualche goccia; `quanto` da 0 a 1 la fa crescere.
export function disegnaSalsa(g: Phaser.GameObjects.Graphics, colore: number, x: number, yCima: number, quanto: number, s = 1): void {
  if (quanto <= 0) return;
  const r = RAGGIO_PALLINA * s;
  g.fillStyle(colore, 1);
  g.slice(x, yCima, r + 1, Math.PI, 0, false);
  g.fillPath();
  const gocce: [number, number][] = [
    [-0.7, 0.55],
    [-0.25, 0.85],
    [0.2, 0.5],
    [0.62, 0.9],
  ];
  for (const [dx, lung] of gocce) {
    const l = r * lung * Math.min(1, quanto * 1.3);
    g.fillRoundedRect(x + dx * r - 4 * s, yCima - 2, 8 * s, l + 2, 4 * s);
    g.fillCircle(x + dx * r, yCima + l, 5 * s);
  }
}

const COLORI_GRANELLA = [0xf94144, 0xf9c74f, 0x90be6d, 0x577590, 0xf8961e, 0xb5838d];

export function disegnaGranella(g: Phaser.GameObjects.Graphics, x: number, yCima: number, tocchi: number): void {
  const r = RAGGIO_PALLINA;
  for (let i = 0; i < tocchi * 7; i++) {
    // posizioni fisse (niente caso): la granella non salta da un disegno all'altro
    const a = Math.PI + ((i * 47) % 180) * (Math.PI / 180);
    const d = r * (0.35 + ((i * 29) % 60) / 100);
    g.fillStyle(COLORI_GRANELLA[i % COLORI_GRANELLA.length], 1);
    g.fillRoundedRect(x + Math.cos(a) * d - 3, yCima + Math.sin(a) * d * 0.9 + r * 0.25 - 1.5, 6, 3, 1.5);
  }
}

// Il gelato intero: attacco in (x, y).
export function disegnaGelato(
  g: Phaser.GameObjects.Graphics,
  gel: Gelato,
  x: number,
  y: number,
  salsaInCorso?: { colore: number; quanto: number },
): void {
  g.clear();
  if (gel.base === undefined) {
    g.lineStyle(2, COLORI.scuro, 0.25);
    g.strokeCircle(x, y + 30, 34);
    return;
  }
  disegnaBase(g, gel.base, x, y);
  gel.palline.forEach((p, i) => disegnaPallina(g, p, x, y + centroPallina(i)));
  const cima = gel.palline.length === 0 ? y : y + centroPallina(gel.palline.length - 1);
  if (gel.condimento === "granella") disegnaGranella(g, x, cima - RAGGIO_PALLINA * 0.6, gel.tocchiGranella);
  else if (gel.condimento !== undefined) disegnaSalsa(g, coloreCondimento(gel.condimento), x, cima - RAGGIO_PALLINA * 0.3, 1);
  else if (salsaInCorso !== undefined) disegnaSalsa(g, salsaInCorso.colore, x, cima - RAGGIO_PALLINA * 0.3, salsaInCorso.quanto);
}
