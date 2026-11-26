// Lo sfondo della gelateria: il muro a righe, la tenda a festoni, e le piccole figure del bancone
// (bottiglie delle salse, barattolo della granella, cestino, vaschette, cuori, stelle).
import * as Phaser from "phaser";
import { gusto } from "../data/gusti";
import { COLORI, LARGO } from "./stile";

export function disegnaMuro(g: Phaser.GameObjects.Graphics, daY: number, aY: number): void {
  g.fillStyle(COLORI.muro, 1);
  g.fillRect(0, daY, LARGO, aY - daY);
  g.fillStyle(COLORI.muroRighe, 1);
  for (let x = 12; x < LARGO; x += 36) g.fillRect(x, daY, 14, aY - daY);
}

export function disegnaTenda(g: Phaser.GameObjects.Graphics, y: number, alta = 26): void {
  const n = 9;
  const w = LARGO / n;
  for (let i = 0; i < n; i++) {
    g.fillStyle(i % 2 === 0 ? COLORI.tenda : COLORI.tendaChiara, 1);
    g.fillRect(i * w, y, w + 1, alta);
    g.slice(i * w + w / 2, y + alta, w / 2, 0, Math.PI, false);
    g.fillPath();
  }
}

export function disegnaBottiglia(g: Phaser.GameObjects.Graphics, colore: number, x: number, y: number): void {
  g.fillStyle(colore, 1);
  g.fillRoundedRect(x - 15, y - 18, 30, 42, 9);
  g.fillStyle(0xffffff, 0.85);
  g.fillRoundedRect(x - 11, y - 4, 22, 14, 4);
  g.fillStyle(colore, 1);
  g.fillCircle(x, y + 3, 4);
  g.fillStyle(0xfafafa, 1);
  g.fillRoundedRect(x - 8, y - 28, 16, 12, 4);
  g.fillTriangle(x - 4, y - 28, x + 4, y - 28, x, y - 38);
}

export function disegnaGranellaBarattolo(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0xd7eef7, 1);
  g.fillRoundedRect(x - 16, y - 16, 32, 40, 8);
  const c = [0xf94144, 0xf9c74f, 0x90be6d, 0x577590, 0xf8961e];
  for (let i = 0; i < 14; i++) {
    g.fillStyle(c[i % c.length], 1);
    g.fillRoundedRect(x - 11 + ((i * 7) % 20), y - 6 + ((i * 11) % 24), 5, 2.5, 1);
  }
  g.fillStyle(0xb0b8bf, 1);
  g.fillRoundedRect(x - 17, y - 26, 34, 12, 5);
  g.fillStyle(0x7d868e, 1);
  for (let i = -1; i <= 1; i++) g.fillCircle(x + i * 8, y - 20, 1.8);
}

// La bomboletta della panna, stessa misura del barattolo della granella.
export function disegnaBomboletta(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0xe9f1f7, 1);
  g.fillRoundedRect(x - 14, y - 16, 28, 40, 7);
  g.fillStyle(0x7fb7e0, 1);
  g.fillRect(x - 14, y - 2, 28, 10);
  g.fillStyle(0xffffff, 1);
  g.fillCircle(x - 4, y + 3, 3);
  g.fillCircle(x + 3, y + 2, 2.5);
  g.fillStyle(0xb0b8bf, 1);
  g.fillRoundedRect(x - 9, y - 22, 18, 8, 3);
  g.fillStyle(0xe0565b, 1);
  g.fillRoundedRect(x - 4, y - 34, 8, 13, 3);
}

export function disegnaCestino(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
  g.fillStyle(0x9aa5ad, 1);
  g.fillPoints(
    [new Phaser.Math.Vector2(x - 17, y - 14), new Phaser.Math.Vector2(x + 17, y - 14), new Phaser.Math.Vector2(x + 13, y + 22), new Phaser.Math.Vector2(x - 13, y + 22)],
    true,
  );
  g.fillStyle(0x7d868e, 1);
  g.fillRoundedRect(x - 20, y - 20, 40, 7, 3);
  g.fillRoundedRect(x - 6, y - 25, 12, 6, 2);
  g.lineStyle(2, 0x7d868e, 1);
  for (let i = -1; i <= 1; i++) g.lineBetween(x + i * 7, y - 9, x + i * 6, y + 17);
}

export function disegnaVaschetta(g: Phaser.GameObjects.Graphics, idGusto: string, x: number, y: number): void {
  const gu = gusto(idGusto);
  g.fillStyle(0x000000, 0.08);
  g.fillRoundedRect(x - 38, y - 20, 78, 46, 9);
  g.fillStyle(0xdfe7ea, 1);
  g.fillRoundedRect(x - 39, y - 21, 78, 42, 9);
  g.fillStyle(gu.colore, 1);
  g.fillRoundedRect(x - 33, y - 15, 66, 30, 7);
  g.fillEllipse(x - 8, y - 15, 44, 18);
  g.fillEllipse(x + 14, y - 13, 30, 14);
  g.fillStyle(gu.puntini, 1);
  for (let i = 0; i < 6; i++) g.fillCircle(x - 24 + i * 9.5, y - 4 + ((i * 7) % 13), 2.2);
  g.fillStyle(0xffffff, 0.35);
  g.fillEllipse(x - 16, y - 16, 16, 6);
}

export function disegnaCuore(g: Phaser.GameObjects.Graphics, x: number, y: number, pieno: boolean, s = 1): void {
  g.fillStyle(pieno ? COLORI.rosso : 0xffffff, pieno ? 1 : 0.3);
  g.fillCircle(x - 5 * s, y - 2 * s, 5.5 * s);
  g.fillCircle(x + 5 * s, y - 2 * s, 5.5 * s);
  g.fillTriangle(x - 10.4 * s, y, x + 10.4 * s, y, x, y + 11 * s);
}

export function puntiStella(x: number, y: number, r: number): Phaser.Math.Vector2[] {
  const p: Phaser.Math.Vector2[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    p.push(new Phaser.Math.Vector2(x + Math.cos(a) * rr, y + Math.sin(a) * rr));
  }
  return p;
}

export function disegnaStella(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, piena: boolean): void {
  g.fillStyle(piena ? COLORI.giallo : 0xd9d2cc, 1);
  g.fillPoints(puntiStella(x, y, r), true);
  g.lineStyle(2, piena ? 0xd99a1c : 0xb9b0a8, 1);
  g.strokePoints(puntiStella(x, y, r), true);
}
