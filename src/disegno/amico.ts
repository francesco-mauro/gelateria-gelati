// Un amico dietro il bancone: spalle con la maglia, testa tonda, capelli secondo lo stile, occhi e bocca che cambiano
// con l'umore. Forme molto semplici (scelta di Francesco del 24 novembre 2026, 18:49: «molto, molto semplici»).
// Il centro del contenitore è il centro della testa.
import * as Phaser from "phaser";
import type { Amico } from "../data/amici";
import { COLORI, scritta } from "./stile";

export type Umore = "felice" | "normale" | "impaziente" | "triste";
export const R_TESTA = 32;

function capelliDietro(g: Phaser.GameObjects.Graphics, a: Amico): void {
  const r = R_TESTA;
  g.fillStyle(a.capelli, 1);
  if (a.stile === "lunghi") g.fillRoundedRect(-r - 6, -r * 0.6, r * 2 + 12, r * 2.4, 18);
  if (a.stile === "caschetto") g.fillRoundedRect(-r - 5, -r * 0.7, r * 2 + 10, r * 1.65, 14);
  if (a.stile === "ricci") for (let i = 0; i < 9; i++) {
    const ang = Math.PI * (0.85 + (i / 8) * 1.3);
    g.fillCircle(Math.cos(ang) * r * 1.02, Math.sin(ang) * r * 0.95, r * 0.42);
  }
  if (a.stile === "raccolti") g.fillCircle(0, -r * 1.12, r * 0.42);
}

function capelliDavanti(g: Phaser.GameObjects.Graphics, a: Amico): void {
  const r = R_TESTA;
  g.fillStyle(a.capelli, 1);
  if (a.stile === "rasati") {
    g.slice(0, -2, r + 1, Math.PI * 1.08, Math.PI * 1.92, false);
    g.fillPath();
    return;
  }
  // la calotta in alto, con la frangia
  g.slice(0, 0, r + 3, Math.PI, 0, false);
  g.fillPath();
  if (a.stile === "corti") g.fillEllipse(r * 0.25, -r * 0.42, r * 1.3, r * 0.5);
  else if (a.stile === "ricci") for (let i = 0; i < 5; i++) g.fillCircle(-r * 0.6 + i * r * 0.3, -r * 0.55, r * 0.26);
  else g.fillEllipse(-r * 0.15, -r * 0.45, r * 1.7, r * 0.55);
}

// Berretto di lana con il risvolto e la toppa (Gilberto), o cappellino con la visiera (Paolo).
function cappello(g: Phaser.GameObjects.Graphics, a: Amico): void {
  if (a.cappello === undefined) return;
  const r = R_TESTA;
  const { tipo, colore } = a.cappello;
  const scuro = Phaser.Display.Color.ValueToColor(colore).darken(18).color;
  g.fillStyle(colore, 1);
  if (tipo === "berretto") {
    g.slice(0, -r * 0.46, r * 1.06, Math.PI, 0, false);
    g.fillPath();
    g.fillEllipse(0, -r * 1.32, r * 1.5, r * 0.6);
    g.fillStyle(scuro, 1);
    g.fillRoundedRect(-r * 1.1, -r * 0.66, r * 2.2, r * 0.32, 7);
    g.fillStyle(0xb07a45, 1);
    g.fillRoundedRect(-r * 0.16, -r * 0.62, r * 0.32, r * 0.24, 3);
    return;
  }
  g.slice(0, -r * 0.36, r * 1.02, Math.PI, 0, false);
  g.fillPath();
  g.fillStyle(scuro, 1);
  g.fillEllipse(0, -r * 0.36, r * 2.5, r * 0.34);
  g.fillCircle(0, -r * 1.36, r * 0.1);
}

export function disegnaFaccia(g: Phaser.GameObjects.Graphics, a: Amico, umore: Umore): void {
  g.clear();
  const r = R_TESTA;
  // occhi
  g.fillStyle(COLORI.scuro, 1);
  if (umore === "felice") {
    g.lineStyle(3, COLORI.scuro, 1);
    g.beginPath();
    g.arc(-r * 0.36, r * 0.02, 5, Math.PI * 1.1, Math.PI * 1.9, false);
    g.strokePath();
    g.beginPath();
    g.arc(r * 0.36, r * 0.02, 5, Math.PI * 1.1, Math.PI * 1.9, false);
    g.strokePath();
  } else {
    g.fillCircle(-r * 0.36, 0, 4);
    g.fillCircle(r * 0.36, 0, 4);
  }
  if (umore === "impaziente" || umore === "triste") {
    g.lineStyle(2.5, COLORI.scuro, 1);
    const su = umore === "triste" ? 1 : -1;
    g.lineBetween(-r * 0.5, -r * 0.22 + su * 2, -r * 0.2, -r * 0.22 - su * 2);
    g.lineBetween(r * 0.5, -r * 0.22 + su * 2, r * 0.2, -r * 0.22 - su * 2);
  }
  // guance
  g.fillStyle(0xf28b8b, umore === "felice" ? 0.55 : 0.3);
  g.fillCircle(-r * 0.58, r * 0.3, 6);
  g.fillCircle(r * 0.58, r * 0.3, 6);
  // bocca
  g.lineStyle(3, COLORI.scuro, 1);
  g.beginPath();
  if (umore === "felice") {
    g.fillStyle(0x9c3b4a, 1);
    g.slice(0, r * 0.32, 10, 0, Math.PI, false);
    g.fillPath();
  } else if (umore === "normale") {
    g.arc(0, r * 0.22, 9, Math.PI * 0.2, Math.PI * 0.8, false);
    g.strokePath();
  } else if (umore === "impaziente") {
    g.lineBetween(-8, r * 0.45, 8, r * 0.45);
  } else {
    g.arc(0, r * 0.62, 9, Math.PI * 1.2, Math.PI * 1.8, false);
    g.strokePath();
  }
  if (a.occhiali === true) {
    g.lineStyle(2.5, COLORI.scuro, 1);
    g.strokeCircle(-r * 0.36, 0, 9);
    g.strokeCircle(r * 0.36, 0, 9);
    g.lineBetween(-r * 0.36 + 9, 0, r * 0.36 - 9, 0);
  }
}

export interface AmicoDisegnato {
  contenitore: Phaser.GameObjects.Container;
  umore(u: Umore): void;
}

export function creaAmico(scene: Phaser.Scene, a: Amico, x: number, y: number): AmicoDisegnato {
  const r = R_TESTA;
  const corpo = scene.add.graphics();
  // spalle e maglia
  corpo.fillStyle(a.maglia, 1);
  corpo.fillRoundedRect(-r * 1.45, r * 0.95, r * 2.9, r * 2.2, 26);
  corpo.fillStyle(a.pelle, 1);
  corpo.fillRoundedRect(-r * 0.32, r * 0.7, r * 0.64, r * 0.5, 6);
  capelliDietro(corpo, a);
  corpo.fillStyle(a.pelle, 1);
  corpo.fillCircle(0, 0, r);
  // orecchie
  corpo.fillCircle(-r * 0.98, r * 0.08, r * 0.2);
  corpo.fillCircle(r * 0.98, r * 0.08, r * 0.2);
  if (a.barba === true) {
    corpo.fillStyle(a.capelli, 0.85);
    corpo.slice(0, r * 0.05, r * 0.98, 0.05, Math.PI - 0.05, false);
    corpo.fillPath();
    corpo.fillStyle(a.pelle, 1);
    corpo.fillEllipse(0, r * 0.42, r * 0.8, r * 0.36);
  }
  capelliDavanti(corpo, a);
  cappello(corpo, a);
  const faccia = scene.add.graphics();
  disegnaFaccia(faccia, a, "normale");
  const nome = scritta(scene, 0, r * 1.75, a.nome, 15, COLORI.bianco, { stroke: "#4a2c3a", strokeThickness: 5 });
  const c = scene.add.container(x, y, [corpo, faccia, nome]);
  let attuale: Umore = "normale";
  return {
    contenitore: c,
    umore(u: Umore): void {
      if (u === attuale) return;
      attuale = u;
      disegnaFaccia(faccia, a, u);
    },
  };
}
