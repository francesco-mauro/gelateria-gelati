// Colori, carattere e misure comuni. Il mondo è largo 360 unità; l'altezza segue il telefono (tra 640 e 800),
// la camera ingrandisce per avere disegni e scritte nitidi anche sugli schermi densi.
import * as Phaser from "phaser";

export const LARGO = 360;

export const COLORI = {
  muro: 0xfff3e6,
  muroRighe: 0xfde6d2,
  tenda: 0xf27a9b,
  tendaChiara: 0xfff7f9,
  banco: 0x8fd3c7,
  bancoBordo: 0x5fb3a5,
  lavoro: 0xfde8d7,
  testa: 0x5b3a4a,
  scuro: 0x4a2c3a,
  bianco: 0xffffff,
  cono: 0xe3a961,
  conoRighe: 0xc98a45,
  coppetta: 0xf4b6c2,
  coppettaRighe: 0xe88ea2,
  verde: 0x5cc98b,
  giallo: 0xf6c445,
  rosso: 0xe8505b,
  ombra: 0x000000,
  cioccolato: 0x5a3420,
  fragola: 0xe2445f,
};

export const esa = (c: number): string => `#${c.toString(16).padStart(6, "0")}`;

export const FONT = '"Trebuchet MS", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Quanto ingrandire: la scena è larga LARGO, il canvas di più. Le scritte prendono la stessa risoluzione.
export function zoomDi(scene: Phaser.Scene): number {
  return scene.scale.width / LARGO;
}

export function altoDi(scene: Phaser.Scene): number {
  return scene.scale.height / zoomDi(scene);
}

export function preparaCamera(scene: Phaser.Scene): void {
  const z = zoomDi(scene);
  const cam = scene.cameras.main;
  cam.setZoom(z);
  cam.centerOn(LARGO / 2, altoDi(scene) / 2);
}

export function scritta(
  scene: Phaser.Scene,
  x: number,
  y: number,
  testo: string,
  dim: number,
  colore: number = COLORI.scuro,
  extra: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, testo, {
    fontFamily: FONT,
    fontSize: `${dim}px`,
    fontStyle: "bold",
    color: esa(colore),
    align: "center",
    ...extra,
  });
  t.setResolution(Math.min(4, zoomDi(scene) * (window.devicePixelRatio > 1 ? 1.5 : 1)));
  t.setOrigin(0.5);
  return t;
}
