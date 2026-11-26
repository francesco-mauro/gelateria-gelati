// L'avvio: il canvas è largo 720 pixel (il mondo 360 unità, ingrandito due volte per avere disegni nitidi) e alto
// quanto serve per riempire il telefono in verticale, tra 640 e 800 unità. Su uno schermo orizzontale resta in verticale,
// al centro.
import * as Phaser from "phaser";
import { sblocca } from "./audio/suoni";
import { BanconeScene } from "./scenes/BanconeScene";
import { FineScene } from "./scenes/FineScene";
import { TitoloScene } from "./scenes/TitoloScene";
import { LARGO } from "./disegno/stile";

const PIXEL = 720;
const proporzione = Math.min(800 / LARGO, Math.max(640 / LARGO, window.innerHeight / Math.max(1, window.innerWidth)));

window.addEventListener("pointerdown", sblocca, { capture: true });
window.addEventListener("touchend", sblocca, { capture: true });

export const gioco = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "gioco",
  width: PIXEL,
  height: Math.round(PIXEL * proporzione),
  backgroundColor: "#5b3a4a",
  antialias: true,
  audio: { noAudio: true }, // l'audio è nostro (src/audio)
  // tre puntatori: il mouse più due dita, così una mano che tiene il telefono non blocca il dito che gioca
  input: { activePointers: 3 },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [TitoloScene, BanconeScene, FineScene],
});

declare global {
  interface Window {
    // Solo con ?prova: serve alle prove nel browser (tests/e2e).
    giocoProva?: Phaser.Game;
  }
}
if (/[?&]prova(?:[&=]|$)/.test(window.location.search)) window.giocoProva = gioco;

// Il gioco anche senza rete (public/sw.js), solo nella versione pubblicata: in sviluppo darebbe file vecchi.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  });
}
