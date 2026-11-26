// Il titolo: la tenda, «Gelateria Gelati» (Gelati è il cognome di Laura), un cono grande che dondola, il record e
// l'invito a toccare. In alto a destra l'altoparlante per togliere il suono. Un tocco apre il bancone.
import * as Phaser from "phaser";
import { cambiaMuto, eMuto, suona } from "../audio/suoni";
import { TESTI } from "../data/testi";
import { disegnaBase, disegnaPallina, disegnaSalsa } from "../disegno/gelato";
import { disegnaMuro, disegnaTenda } from "../disegno/negozio";
import { COLORI, LARGO, altoDi, esa, preparaCamera, scritta } from "../disegno/stile";
import { leggi } from "../logic/memoria";

export function iconaSuono(scene: Phaser.Scene, x: number, y: number): { gestisci(p: Phaser.Input.Pointer): boolean } {
  const g = scene.add.graphics().setDepth(50);
  const disegna = (): void => {
    g.clear();
    g.fillStyle(0xffffff, 0.9);
    g.fillRoundedRect(x - 9, y - 5, 7, 10, 2);
    g.fillTriangle(x - 4, y, x + 5, y - 10, x + 5, y + 10);
    g.lineStyle(2.5, 0xffffff, 0.9);
    if (eMuto()) {
      g.lineBetween(x + 9, y - 6, x + 17, y + 6);
      g.lineBetween(x + 17, y - 6, x + 9, y + 6);
    } else {
      g.beginPath();
      g.arc(x + 7, y, 7, -0.9, 0.9, false);
      g.strokePath();
    }
  };
  disegna();
  return {
    gestisci(p: Phaser.Input.Pointer): boolean {
      if (Math.abs(p.worldX - (x + 4)) > 22 || Math.abs(p.worldY - y) > 20) return false;
      cambiaMuto();
      disegna();
      suona("tocco");
      return true;
    },
  };
}

export class TitoloScene extends Phaser.Scene {
  private partito = false;

  constructor() {
    super("Titolo");
  }

  create(): void {
    this.partito = false;
    preparaCamera(this);
    const H = altoDi(this);
    const g = this.add.graphics();
    g.fillStyle(COLORI.testa, 1);
    g.fillRect(0, 0, LARGO, H);
    disegnaMuro(g, 44, H);
    g.fillStyle(COLORI.testa, 1);
    g.fillRect(0, 0, LARGO, 44);
    disegnaTenda(g, 44, 34);
    g.fillStyle(COLORI.banco, 1);
    g.fillRect(0, H - 120, LARGO, H);
    g.fillStyle(COLORI.bancoBordo, 1);
    g.fillRect(0, H - 124, LARGO, 10);

    const titolo = scritta(this, LARGO / 2, H * 0.2, TESTI.titolo, 44, COLORI.testa, { stroke: "#ffffff", strokeThickness: 8 });
    titolo.setLineSpacing(-6);
    scritta(this, LARGO / 2, H * 0.2 + 72, TESTI.sottotitolo, 18, COLORI.tenda);

    // il cono grande: tre palline (fragola, pistacchio, cioccolato) e la salsa
    const cono = this.add.graphics();
    disegnaBase(cono, "cono", 0, 0, 1.5);
    disegnaPallina(cono, "pistacchio", 0, -14, 1.35);
    disegnaPallina(cono, "fragola", 0, -54, 1.35);
    disegnaPallina(cono, "cioccolato", 0, -94, 1.35);
    disegnaSalsa(cono, COLORI.fragola, 0, -104, 1, 1.35);
    cono.setPosition(LARGO / 2, H * 0.6);
    this.tweens.add({ targets: cono, angle: { from: -4, to: 4 }, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    const record = leggi().record;
    if (record > 0) scritta(this, LARGO / 2, H - 86, `${TESTI.record}: ${record}`, 20, COLORI.scuro);
    const invito = scritta(this, LARGO / 2, H - 46, TESTI.tocca, 22, COLORI.bianco);
    invito.setShadow(0, 2, esa(COLORI.bancoBordo), 0);
    this.tweens.add({ targets: invito, scale: 1.08, duration: 650, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    const suono = iconaSuono(this, LARGO - 34, 22);
    scritta(this, 60, 22, TESTI.dedica, 14, COLORI.bianco);
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (!suono.gestisci(p)) this.parti();
    });
  }

  private parti(): void {
    if (this.partito) return;
    this.partito = true;
    suona("tocco");
    this.cameras.main.fadeOut(250, 91, 58, 74);
    this.time.delayedCall(270, () => this.scene.start("Bancone"));
  }
}
