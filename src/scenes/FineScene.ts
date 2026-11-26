// La fine della partita: punti, clienti serviti, stelle, il record (e la festa se è nuovo), due bottoni:
// riaprire subito la gelateria o tornare al titolo.
import * as Phaser from "phaser";
import { suona } from "../audio/suoni";
import { TESTI } from "../data/testi";
import { disegnaMuro, disegnaStella, disegnaTenda } from "../disegno/negozio";
import { COLORI, LARGO, altoDi, preparaCamera, scritta } from "../disegno/stile";
import { fineDiPartita, leggi } from "../logic/memoria";

export interface DatiFine {
  punti: number;
  serviti: number;
  stelle: number;
}

declare global {
  interface Window {
    fineProva?: { nuovoRecord: boolean; record: number; apertaAlle: number; schermo(nome: "rigioca" | "titolo"): { x: number; y: number } };
  }
}

export class FineScene extends Phaser.Scene {
  constructor() {
    super("Fine");
  }

  create(d: DatiFine): void {
    preparaCamera(this);
    const H = altoDi(this);
    const nuovo = fineDiPartita(d.punti);
    const record = leggi().record;
    const g = this.add.graphics();
    disegnaMuro(g, 0, H);
    disegnaTenda(g, 0, 34);

    const cx = LARGO / 2;
    const card = this.add.graphics();
    const top = H * 0.17;
    card.fillStyle(0x000000, 0.12);
    card.fillRoundedRect(28, top + 5, LARGO - 52, 330, 18);
    card.fillStyle(0xffffff, 1);
    card.fillRoundedRect(24, top, LARGO - 48, 330, 18);

    scritta(this, cx, top + 40, TESTI.fine.titolo, 32, COLORI.testa);
    scritta(this, cx, top + 92, TESTI.fine.punti, 15, COLORI.scuro).setAlpha(0.7);
    const p = scritta(this, cx, top + 128, "0", 46, COLORI.tenda);
    this.tweens.addCounter({
      from: 0,
      to: d.punti,
      duration: Math.min(1200, 300 + d.punti),
      onUpdate: (t) => p.setText(String(Math.round(t.getValue() ?? 0))),
    });
    scritta(this, cx, top + 182, `${TESTI.fine.serviti}: ${d.serviti}`, 17, COLORI.scuro);
    const sg = this.add.graphics();
    disegnaStella(sg, cx - 40, top + 220, 12, true);
    scritta(this, cx + 8, top + 220, `${TESTI.fine.stelle}: ${d.stelle}`, 17, COLORI.scuro);
    if (nuovo && d.punti > 0) {
      const r = scritta(this, cx, top + 272, TESTI.fine.nuovoRecord, 26, COLORI.verde, { stroke: "#ffffff", strokeThickness: 4 });
      this.tweens.add({ targets: r, scale: 1.12, duration: 420, yoyo: true, repeat: -1, ease: "Sine.inOut" });
      this.time.delayedCall(300, () => suona("record"));
      this.coriandoli();
    } else {
      scritta(this, cx, top + 272, `${TESTI.fine.record}: ${record}`, 18, COLORI.scuro);
      this.time.delayedCall(200, () => suona("fine"));
    }

    const yR = Math.min(H - 110, top + 380);
    const bottone = (y: number, testo: string, colore: number): void => {
      const b = this.add.graphics();
      b.fillStyle(0x000000, 0.15);
      b.fillRoundedRect(cx - 128, y - 22, 256, 50, 25);
      b.fillStyle(colore, 1);
      b.fillRoundedRect(cx - 130, y - 25, 260, 50, 25);
      scritta(this, cx, y, testo, 18, COLORI.bianco);
    };
    bottone(yR, TESTI.fine.rigioca, COLORI.tenda);
    bottone(yR + 64, TESTI.fine.titoloBottone, COLORI.bancoBordo);

    // per i primi 700 ms i tocchi non contano: chi stava ancora toccando il bancone non salta i punti per sbaglio
    let via = false;
    // l'orologio della pagina: quello della scena riparte da zero a ogni apertura e farebbe saltare la pausa
    const pronto = performance.now() + 700;
    this.input.on("pointerdown", (ptr: Phaser.Input.Pointer) => {
      if (via || performance.now() < pronto || Math.abs(ptr.worldX - cx) > 130) return;
      const dove = Math.abs(ptr.worldY - yR) <= 26 ? "Bancone" : Math.abs(ptr.worldY - yR - 64) <= 26 ? "Titolo" : undefined;
      if (dove === undefined) return;
      via = true;
      suona("tocco");
      this.cameras.main.fadeOut(220, 91, 58, 74);
      this.time.delayedCall(240, () => this.scene.start(dove));
    });

    if (/[?&]prova(?:[&=]|$)/.test(window.location.search)) {
      window.fineProva = {
        nuovoRecord: nuovo,
        record,
        apertaAlle: pronto - 700,
        schermo: (nome) => {
          const cam = this.cameras.main;
          const r = this.game.canvas.getBoundingClientRect();
          const wy = nome === "rigioca" ? yR : yR + 64;
          const gx = (cx - cam.worldView.x) * cam.zoom;
          const gy = (wy - cam.worldView.y) * cam.zoom;
          return { x: r.left + (gx * r.width) / this.scale.width, y: r.top + (gy * r.height) / this.scale.height };
        },
      };
      this.events.once("shutdown", () => (window.fineProva = undefined));
    }
    this.cameras.main.fadeIn(250, 91, 58, 74);
  }

  private coriandoli(): void {
    const colori = [COLORI.tenda, COLORI.giallo, COLORI.verde, 0x4f9dd9, 0x9b6bd1];
    for (let i = 0; i < 40; i++) {
      const r = this.add.rectangle(Phaser.Math.Between(10, LARGO - 10), -10, 6, 10, colori[i % colori.length]).setDepth(70);
      this.tweens.add({
        targets: r,
        y: altoDi(this) + 20,
        angle: Phaser.Math.Between(180, 720),
        x: r.x + Phaser.Math.Between(-40, 40),
        delay: Phaser.Math.Between(0, 700),
        duration: Phaser.Math.Between(1400, 2400),
        onComplete: () => r.destroy(),
      });
    }
  }
}
