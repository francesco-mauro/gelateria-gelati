// Il titolo: la tenda, «Gelateria Gelati» (Gelati è il cognome di Laura), un cono grande che dondola, gli amici che
// spuntano da dietro il bancone, il record e l'invito a toccare. In alto a destra l'altoparlante per togliere il
// suono. Un tocco apre il bancone.
import * as Phaser from "phaser";
import { cambiaMuto, eMuto, suona } from "../audio/suoni";
import { TESTI } from "../data/testi";
import { AMICI } from "../data/amici";
import { creaAmico } from "../disegno/amico";
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

    const titolo = scritta(this, LARGO / 2, H * 0.2, TESTI.titolo, 44, COLORI.testa, { stroke: "#ffffff", strokeThickness: 8 });
    titolo.setLineSpacing(-6);
    scritta(this, LARGO / 2, H * 0.2 + 72, TESTI.sottotitolo, 16, COLORI.tenda, { stroke: "#ffffff", strokeThickness: 5 });

    // il cono grande: tre palline (fragola, pistacchio, cioccolato) e la salsa
    const cono = this.add.graphics();
    disegnaBase(cono, "cono", 0, 0, 1.5);
    disegnaPallina(cono, "pistacchio", 0, -14, 1.35);
    disegnaPallina(cono, "fragola", 0, -54, 1.35);
    disegnaPallina(cono, "cioccolato", 0, -94, 1.35);
    disegnaSalsa(cono, COLORI.fragola, 0, -104, 1, 1.35);
    // il cono (alto 256 da -130 a +126) sta tra il sottotitolo e le teste degli amici, rimpicciolito se serve
    const sopra = H * 0.2 + 94;
    const spazio = H - 124 - 66 - sopra;
    const s = Math.min(1, spazio / 256);
    cono.setScale(s);
    cono.setPosition(LARGO / 2, sopra + 130 * s + (spazio - 256 * s) / 2);
    this.tweens.add({ targets: cono, angle: { from: -4, to: 4 }, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.inOut" });

    // gli amici dietro il bancone, a zig zag, contenti, che ondeggiano ognuno col suo tempo
    const passo = (LARGO - 28) / AMICI.length;
    AMICI.forEach((a, i) => {
      const y = H - 124 - 14 - (i % 2 === 0 ? 0 : 9);
      const d = creaAmico(this, a, 14 + passo * (i + 0.5), y);
      d.umore("felice");
      (d.contenitore.list[2] as Phaser.GameObjects.Text | undefined)?.setVisible(false);
      d.contenitore.setScale(0.5).setDepth(i % 2 === 0 ? 2 : 1);
      this.tweens.add({ targets: d.contenitore, y: y - 4, duration: 700 + (i % 3) * 120, delay: i * 90, yoyo: true, repeat: -1, ease: "Sine.inOut" });
    });
    const banco = this.add.graphics().setDepth(3);
    banco.fillStyle(COLORI.banco, 1);
    banco.fillRect(0, H - 120, LARGO, H);
    banco.fillStyle(COLORI.bancoBordo, 1);
    banco.fillRect(0, H - 124, LARGO, 10);

    const record = leggi().record;
    if (record > 0) scritta(this, LARGO / 2, H - 86, `${TESTI.record}: ${record}`, 20, COLORI.scuro).setDepth(4);
    const invito = scritta(this, LARGO / 2, H - 46, TESTI.tocca, 22, COLORI.bianco).setDepth(4);
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
