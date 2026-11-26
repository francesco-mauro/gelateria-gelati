// Il bancone: qui si gioca.
// In alto i cuori, i punti e la serie; sotto, l'amico dietro il bancone con il suo biglietto (l'ordine e la barra della
// pazienza); sotto ancora il piano di lavoro: a sinistra cono, coppetta e cestino, al centro il gelato, a destra le due
// salse e la granella, in basso le otto vaschette.
// I gesti (scelta di Francesco del 24 novembre 2026, 18:43: ordini e gesti insieme):
//   - un tocco sul cono o sulla coppetta mette la base;
//   - si trascina una pallina dalla vaschetta fino al gelato;
//   - si tiene premuta una salsa e si lascia quando la barra è nel verde; la granella vuole tre tocchi;
//   - si spinge il gelato verso l'alto, verso il cliente, per servirlo.
// Il tempo di ogni cliente scorre in update() con il delta del gioco: quando la scheda va in secondo piano Phaser
// ferma il ciclo e il tempo si ferma con lui.
import * as Phaser from "phaser";
import { suona, vibra } from "../audio/suoni";
import { gusto } from "../data/gusti";
import { TESTI } from "../data/testi";
import { creaAmico, R_TESTA, type AmicoDisegnato } from "../disegno/amico";
import { centroPallina, coloreCondimento, disegnaBase, disegnaGelato, disegnaPallina } from "../disegno/gelato";
import {
  disegnaBottiglia,
  disegnaCestino,
  disegnaCuore,
  disegnaGranellaBarattolo,
  disegnaMuro,
  disegnaStella,
  disegnaTenda,
  disegnaVaschetta,
} from "../disegno/negozio";
import { COLORI, LARGO, altoDi, esa, preparaCamera, scritta } from "../disegno/stile";
import { scegli } from "../logic/caso";
import { aggiungiServito, leggi } from "../logic/memoria";
import {
  MAX_PALLINE,
  SALSA_GIUSTA,
  TOCCHI_GRANELLA,
  confronta,
  gelatoVuoto,
  qualitaSalsa,
  type Base,
  type Condimento,
  type Gelato,
} from "../logic/ordine";
import { Partita, type Cliente } from "../logic/partita";
import type { Voto } from "../logic/voto";

export type Fase = "arrivo" | "attesa" | "via" | "fine";
type Salsa = "salsa-cioccolato" | "salsa-fragola";

interface Zona {
  nome: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Quanti clienti servire in tutto (su questo telefono) prima di togliere gli aiuti.
export const SERVITI_CON_AIUTO = 3;
// Secondi per riempire la barra della salsa tenendo premuto.
export const SECONDI_SALSA = 1.6;
const SPINTA = 45; // unità verso l'alto per servire

export interface StatoProva {
  fase: Fase;
  cuori: number;
  punti: number;
  serviti: number;
  tempo: number;
  pazienza: number;
  amico?: string;
  ordine?: Cliente["ordine"];
  gelato: Gelato;
  livelloSalsa?: number;
  ultimoVoto?: Voto;
  vaschette: string[];
  aiuto: string;
}

declare global {
  interface Window {
    banconeProva?: {
      stato(): StatoProva;
      schermo(nome: string): { x: number; y: number };
    };
  }
}

export class BanconeScene extends Phaser.Scene {
  private partita!: Partita;
  private cliente?: Cliente;
  private gel: Gelato = gelatoVuoto();
  private fase: Fase = "arrivo";
  private tempo = 0;
  private ultimoVoto?: Voto;
  private conAiuti = true;

  private H = 640;
  private yBanco = 270;
  private xGel = LARGO / 2;
  private yAtt = 375;
  private xCliente = 95;
  private yColonna = [0, 0, 0];
  private passoColonna = 70;

  private zone: Zona[] = [];
  private amico?: AmicoDisegnato;
  private biglietto?: Phaser.GameObjects.Container;
  private righeBiglietto: { testo: Phaser.GameObjects.Text; spunta: Phaser.GameObjects.Graphics; fatta: () => boolean }[] = [];
  private barraPazienza!: Phaser.GameObjects.Graphics;
  private larghezzaBarra = 0;
  private posBarra = { x: 0, y: 0 };
  private gelatoC!: Phaser.GameObjects.Container;
  private gelatoG!: Phaser.GameObjects.Graphics;
  private testa!: Phaser.GameObjects.Graphics;
  private testoPunti!: Phaser.GameObjects.Text;
  private testoSerie!: Phaser.GameObjects.Text;
  private testoAiuto!: Phaser.GameObjects.Text;
  private evidenzia!: Phaser.GameObjects.Graphics;
  private bottiglie = new Map<string, Phaser.GameObjects.Graphics>();
  private vaschetteDisegnate: { g: Phaser.GameObjects.Graphics; testo: Phaser.GameObjects.Text; zona: Zona }[] = [];

  // i gesti in corso
  private trascinata?: { gusto: string; g: Phaser.GameObjects.Graphics; da: { x: number; y: number }; mosso: number; dito: number };
  private versando?: { tipo: Salsa; livello: number; barra: Phaser.GameObjects.Graphics; dito: number };
  private spinta?: { y0: number; dito: number };

  constructor() {
    super("Bancone");
  }

  create(): void {
    preparaCamera(this);
    this.H = altoDi(this);
    // il bancone al 40% dell'altezza; le colonne di sinistra e di destra si dividono lo spazio tra il piano e le
    // vaschette, il gelato sta a metà
    this.yBanco = Math.round(this.H * 0.4);
    const sopra = this.yBanco + 26;
    const sotto = this.H - 138;
    this.passoColonna = (sotto - sopra) / 3;
    this.yColonna = [0, 1, 2].map((i) => sopra + this.passoColonna * (i + 0.5));
    this.yAtt = Math.round(sopra + (sotto - sopra) * 0.42);
    this.partita = new Partita();
    this.gel = gelatoVuoto();
    this.cliente = undefined;
    this.ultimoVoto = undefined;
    this.trascinata = undefined;
    this.versando = undefined;
    this.spinta = undefined;
    this.zone = [];
    this.bottiglie.clear();
    this.conAiuti = leggi().servitiTotali < SERVITI_CON_AIUTO;

    this.disegnaSfondo();
    this.disegnaAttrezzi();
    this.testa = this.add.graphics().setDepth(40);
    this.testoPunti = scritta(this, LARGO / 2, 22, "0", 22, COLORI.bianco).setDepth(41);
    this.testoSerie = scritta(this, LARGO - 70, 22, "", 14, COLORI.giallo).setDepth(41);
    this.aggiornaTesta();

    this.gelatoG = this.add.graphics();
    this.gelatoC = this.add.container(this.xGel, this.yAtt, [this.gelatoG]).setDepth(20);
    this.zone.push({ nome: "gelato", x: this.xGel, y: this.yAtt - 15, w: 120, h: 190 });
    this.ridisegnaGelato();

    this.evidenzia = this.add.graphics().setDepth(30);
    this.tweens.add({ targets: this.evidenzia, alpha: { from: 1, to: 0.25 }, duration: 520, yoyo: true, repeat: -1 });
    this.testoAiuto = scritta(this, LARGO / 2, this.yBanco + 12, "", 13, COLORI.scuro).setDepth(31);

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => this.giu(p));
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => this.muovi(p));
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => this.su(p));
    this.input.on("pointerupoutside", (p: Phaser.Input.Pointer) => this.su(p));

    this.cameras.main.fadeIn(200, 91, 58, 74);
    this.time.delayedCall(250, () => this.prossimo());

    if (/[?&]prova(?:[&=]|$)/.test(window.location.search)) {
      window.banconeProva = { stato: () => this.statoProva(), schermo: (n) => this.schermo(n) };
      this.events.once("shutdown", () => (window.banconeProva = undefined));
    }
  }

  // ---------- disegno fisso ----------

  private disegnaSfondo(): void {
    const g = this.add.graphics().setDepth(-10);
    disegnaMuro(g, 44, this.yBanco);
    disegnaTenda(g, 44, 22);
    // il bancone copre il corpo dell'amico
    const b = this.add.graphics().setDepth(10);
    b.fillStyle(COLORI.banco, 1);
    b.fillRect(0, this.yBanco, LARGO, 24);
    b.fillStyle(COLORI.bancoBordo, 1);
    b.fillRect(0, this.yBanco + 22, LARGO, 4);
    b.fillStyle(COLORI.lavoro, 1);
    b.fillRect(0, this.yBanco + 26, LARGO, this.H - this.yBanco - 26);
    b.fillStyle(0xf8d9c2, 1);
    b.fillRect(0, this.H - 142, LARGO, 142);
  }

  private disegnaAttrezzi(): void {
    const g = this.add.graphics().setDepth(12);
    const [y1, y2, y3] = this.yColonna;
    const hz = this.passoColonna - 4;
    // a sinistra: cono, coppetta, cestino (icona sopra, nome sotto)
    const xs = 46;
    disegnaBase(g, "cono", xs, y1 - 26, 0.5);
    scritta(this, xs, y1 + 25, TESTI.cono, 12).setDepth(12);
    disegnaBase(g, "coppetta", xs, y2 - 14, 0.62);
    scritta(this, xs, y2 + 25, TESTI.coppetta, 12).setDepth(12);
    disegnaCestino(g, xs, y3 - 6);
    scritta(this, xs, y3 + 25, TESTI.butta, 12).setDepth(12);
    this.zone.push({ nome: "cono", x: xs, y: y1, w: 84, h: hz });
    this.zone.push({ nome: "coppetta", x: xs, y: y2, w: 84, h: hz });
    this.zone.push({ nome: "cestino", x: xs, y: y3, w: 84, h: hz });

    // a destra: le salse e la granella
    const xd = LARGO - 46;
    const condimenti: Condimento[] = ["salsa-cioccolato", "salsa-fragola", "granella"];
    condimenti.forEach((c, i) => {
      const y = this.yColonna[i];
      const bg = this.add.graphics().setDepth(12);
      if (c === "granella") disegnaGranellaBarattolo(bg, 0, 0);
      else disegnaBottiglia(bg, coloreCondimento(c), 0, 0);
      bg.setPosition(xd, y - 8);
      this.bottiglie.set(c, bg);
      scritta(this, xd, y + 25, TESTI.bottiglie[c], 12).setDepth(12);
      this.zone.push({ nome: c, x: xd, y, w: 84, h: hz });
    });

    // in basso: le vaschette, due file da quattro
    // ognuna con la sua grafica e la sua zona, perché può cambiare gusto quando arriva un amico che lo preferisce
    this.vaschetteDisegnate = this.partita.vaschette.map((id, i) => {
      const x = 45 + (i % 4) * 90;
      const y = this.H - 112 + Math.floor(i / 4) * 66;
      const vg = this.add.graphics().setDepth(12).setPosition(x, y);
      disegnaVaschetta(vg, id, 0, 0);
      const testo = scritta(this, x, y + 30, gusto(id).nome, 12).setDepth(12);
      const zona: Zona = { nome: `vaschetta:${id}`, x, y: y + 4, w: 88, h: 64 };
      this.zone.push(zona);
      return { g: vg, testo, zona };
    });
  }

  // Una vaschetta cambia gusto: si chiude, cambia e si riapre, con un luccichio.
  private cambiaVaschetta(c: NonNullable<Cliente["cambio"]>): void {
    const v = this.vaschetteDisegnate[c.indice];
    v.zona.nome = `vaschetta:${c.a}`;
    this.tweens.add({
      targets: [v.g, v.testo],
      scaleY: 0,
      duration: 140,
      ease: "Quad.in",
      onComplete: () => {
        v.g.clear();
        disegnaVaschetta(v.g, c.a, 0, 0);
        v.testo.setText(gusto(c.a).nome);
        this.tweens.add({ targets: [v.g, v.testo], scaleY: 1, duration: 220, ease: "Back.out" });
        const luce = this.add.graphics().setDepth(13);
        luce.fillStyle(0xffffff, 0.8);
        luce.fillCircle(v.zona.x + 26, v.zona.y - 22, 4);
        luce.fillCircle(v.zona.x - 28, v.zona.y - 14, 3);
        this.tweens.add({ targets: luce, alpha: 0, y: -10, duration: 600, onComplete: () => luce.destroy() });
      },
    });
  }

  private aggiornaTesta(): void {
    const g = this.testa;
    g.clear();
    g.fillStyle(COLORI.testa, 1);
    g.fillRect(0, 0, LARGO, 44);
    for (let i = 0; i < 3; i++) disegnaCuore(g, 22 + i * 26, 20, i < this.partita.cuori);
    this.testoPunti.setText(String(this.partita.punti));
    this.testoSerie.setText(this.partita.serie >= 1 ? `serie ×${(1 + Math.min(this.partita.serie, 5) * 0.1).toFixed(1)}` : "");
  }

  // ---------- clienti ----------

  private prossimo(): void {
    if (this.partita.finita) {
      this.chiudi();
      return;
    }
    // gli aiuti si ricontrollano a ogni cliente: spariscono appena il telefono conta tre clienti serviti
    this.conAiuti = leggi().servitiTotali < SERVITI_CON_AIUTO;
    const c = this.partita.prossimoCliente();
    this.cliente = c;
    this.tempo = c.pazienza;
    this.fase = "arrivo";
    if (c.cambio !== undefined) this.cambiaVaschetta(c.cambio);
    this.amico?.contenitore.destroy();
    const yTesta = this.yBanco - 78;
    this.amico = creaAmico(this, c.amico, LARGO + 60, yTesta);
    this.amico.contenitore.setDepth(5);
    this.tweens.add({
      targets: this.amico.contenitore,
      x: this.xCliente,
      duration: 420,
      ease: "Back.out",
      onComplete: () => {
        this.fase = "attesa";
        this.mostraBiglietto(c);
        this.aggiornaAiuto();
      },
    });
  }

  private mostraBiglietto(c: Cliente): void {
    this.biglietto?.destroy();
    this.righeBiglietto = [];
    const x0 = 178;
    const w = LARGO - x0 - 10;
    const righe = 1 + c.ordine.palline.length + (c.ordine.condimento === undefined ? 0 : 1);
    const passo = 25;
    const alto = 34 + righe * passo + 22;
    const yTop = Math.max(52, this.yBanco - alto - 6);
    const parti: Phaser.GameObjects.GameObject[] = [];
    const fondo = this.add.graphics();
    fondo.fillStyle(0x000000, 0.12);
    fondo.fillRoundedRect(3, 4, w, alto, 12);
    fondo.fillStyle(0xffffff, 1);
    fondo.fillRoundedRect(0, 0, w, alto, 12);
    fondo.fillStyle(COLORI.tenda, 1);
    fondo.fillRoundedRect(0, 0, w, 26, { tl: 12, tr: 12, bl: 0, br: 0 });
    parti.push(fondo);
    parti.push(scritta(this, w / 2, 13, TESTI.ordineDi(c.amico.nome), 13, COLORI.bianco));

    const icone = this.add.graphics();
    parti.push(icone);
    let y = 34 + passo / 2;
    const riga = (testo: string, fatta: () => boolean, icona: (yy: number) => void): void => {
      icona(y);
      const t = scritta(this, 40, y, testo, 13, COLORI.scuro).setOrigin(0, 0.5);
      const sp = this.add.graphics();
      parti.push(t, sp);
      this.righeBiglietto.push({ testo: t, spunta: sp, fatta });
      sp.setPosition(w - 16, y);
      y += passo;
    };
    const base = c.ordine.base;
    riga(base === "cono" ? TESTI.cono : TESTI.coppetta, () => this.gel.base === base, (yy) =>
      disegnaBase(icone, base, 20, yy - 8, base === "cono" ? 0.22 : 0.28),
    );
    // le palline: la k-esima pallina di un gusto è spuntata se nel gelato ce ne sono almeno k
    const contate = new Map<string, number>();
    for (const p of c.ordine.palline) {
      const k = (contate.get(p) ?? 0) + 1;
      contate.set(p, k);
      riga(gusto(p).nome, () => this.gel.palline.filter((x) => x === p).length >= k, (yy) => {
        const s = 0.36;
        disegnaPallina(icone, p, 20, yy, s);
      });
    }
    const cond = c.ordine.condimento;
    if (cond !== undefined) {
      riga(TESTI.condimenti[cond], () => this.gel.condimento === cond && (cond !== "granella" || this.gel.tocchiGranella >= TOCCHI_GRANELLA), (yy) => {
        icone.fillStyle(coloreCondimento(cond), 1);
        if (cond === "granella") {
          for (let i = 0; i < 6; i++) {
            icone.fillStyle([0xf94144, 0xf9c74f, 0x90be6d, 0x577590, 0xf8961e, 0xb5838d][i], 1);
            icone.fillRoundedRect(12 + (i % 3) * 6, yy - 5 + Math.floor(i / 3) * 7, 5, 2.5, 1);
          }
        } else {
          icone.fillCircle(20, yy, 8);
          icone.fillTriangle(14, yy + 2, 26, yy + 2, 20, yy + 12);
        }
      });
    }
    this.barraPazienza = this.add.graphics();
    parti.push(this.barraPazienza);
    this.larghezzaBarra = w - 24;
    this.posBarra = { x: 12, y: alto - 16 };
    this.biglietto = this.add.container(x0, yTop, parti).setDepth(8);
    this.biglietto.setScale(0.2).setAlpha(0);
    this.tweens.add({ targets: this.biglietto, scale: 1, alpha: 1, duration: 220, ease: "Back.out" });
    this.aggiornaSpunte();
    this.disegnaPazienza();
  }

  private aggiornaSpunte(): void {
    for (const r of this.righeBiglietto) {
      const ok = r.fatta();
      r.spunta.clear();
      r.testo.setAlpha(ok ? 0.45 : 1);
      if (ok) {
        r.spunta.lineStyle(3.5, COLORI.verde, 1);
        r.spunta.beginPath();
        r.spunta.moveTo(-7, 0);
        r.spunta.lineTo(-2, 5);
        r.spunta.lineTo(7, -6);
        r.spunta.strokePath();
      }
    }
  }

  private disegnaPazienza(): void {
    if (this.cliente === undefined || this.barraPazienza === undefined) return;
    const f = Math.max(0, this.tempo / this.cliente.pazienza);
    const g = this.barraPazienza;
    g.clear();
    g.fillStyle(0xeeeeee, 1);
    g.fillRoundedRect(this.posBarra.x, this.posBarra.y, this.larghezzaBarra, 8, 4);
    g.fillStyle(f > 0.5 ? COLORI.verde : f > 0.25 ? COLORI.giallo : COLORI.rosso, 1);
    if (f > 0.02) g.fillRoundedRect(this.posBarra.x, this.posBarra.y, this.larghezzaBarra * f, 8, 4);
    this.amico?.umore(f > 0.5 ? "normale" : f > 0.22 ? "impaziente" : "triste");
  }

  // ---------- il tempo ----------

  update(_t: number, delta: number): void {
    const dt = Math.min(delta, 100) / 1000;
    if (this.versando !== undefined) {
      this.versando.livello = Math.min(1, this.versando.livello + dt / SECONDI_SALSA);
      this.disegnaVersata();
      if (this.versando.livello >= 1) this.fermaSalsa();
    }
    if (this.fase !== "attesa" || this.cliente === undefined) return;
    this.tempo -= dt;
    this.disegnaPazienza();
    if (this.tempo <= 0) this.scaduto();
  }

  // ---------- i gesti ----------

  private zonaIn(x: number, y: number): string | undefined {
    for (const z of this.zone) if (Math.abs(x - z.x) <= z.w / 2 && Math.abs(y - z.y) <= z.h / 2) return z.nome;
    return undefined;
  }

  private giu(p: Phaser.Input.Pointer): void {
    if (this.fase === "fine" || this.trascinata !== undefined || this.versando !== undefined || this.spinta !== undefined) return;
    const z = this.zonaIn(p.worldX, p.worldY);
    if (z === undefined) return;
    if (z === "cono" || z === "coppetta") return this.mettiBase(z);
    if (z === "cestino") return this.butta();
    if (z.startsWith("vaschetta:")) return this.prendiPallina(z.slice("vaschetta:".length), p);
    if (z === "salsa-cioccolato" || z === "salsa-fragola") return this.iniziaSalsa(z, p.id);
    if (z === "granella") return this.granella();
    if (z === "gelato" && this.gel.base !== undefined && this.fase === "attesa") this.spinta = { y0: p.worldY, dito: p.id };
  }

  // Ogni gesto appartiene al dito che l'ha cominciato: gli altri dita (un pollice che si alza, la mano che tiene il
  // telefono) non lo muovono e non lo chiudono.
  private ditoDelGesto(): number | undefined {
    return this.trascinata?.dito ?? this.versando?.dito ?? this.spinta?.dito;
  }

  private muovi(p: Phaser.Input.Pointer): void {
    if (p.id !== this.ditoDelGesto()) return;
    if (this.trascinata !== undefined) {
      const t = this.trascinata;
      t.mosso = Math.max(t.mosso, Math.hypot(p.worldX - t.da.x, p.worldY - t.da.y));
      t.g.setPosition(p.worldX, p.worldY - 18);
    }
    if (this.spinta !== undefined) {
      const su = Math.max(0, this.spinta.y0 - p.worldY);
      this.gelatoC.y = this.yAtt - Math.min(su, 40) * 0.5;
      if (su >= SPINTA) {
        this.spinta = undefined;
        this.servi();
      }
    }
  }

  private su(p: Phaser.Input.Pointer): void {
    if (p.id !== this.ditoDelGesto()) return;
    if (this.trascinata !== undefined) this.lasciaPallina(p);
    if (this.versando !== undefined) this.fermaSalsa();
    if (this.spinta !== undefined) {
      this.spinta = undefined;
      this.tweens.add({ targets: this.gelatoC, y: this.yAtt, duration: 120 });
    }
  }

  private avviso(testo: string, x = LARGO / 2, y = this.yAtt - 60): void {
    const t = scritta(this, x, y, testo, 15, COLORI.bianco, { backgroundColor: esa(COLORI.testa), padding: { x: 8, y: 5 } }).setDepth(60);
    this.tweens.add({ targets: t, y: y - 18, alpha: 0, delay: 900, duration: 350, onComplete: () => t.destroy() });
  }

  private mettiBase(b: Base): void {
    if (this.fase === "via") return;
    if (this.gel.base === b) return;
    if (this.gel.palline.length > 0 || this.gel.condimento !== undefined) {
      this.avviso(TESTI.avvisi.cambiaBase);
      return;
    }
    this.gel.base = b;
    suona("tocco");
    vibra(10);
    this.gelatoC.setScale(0.85);
    this.tweens.add({ targets: this.gelatoC, scale: 1, duration: 160, ease: "Back.out" });
    this.cambiato();
  }

  private butta(): void {
    if (this.fase === "via" || this.gel.base === undefined) return;
    suona("via");
    const vecchio = this.add.graphics().setDepth(19);
    disegnaGelato(vecchio, this.gel, 0, 0);
    vecchio.setPosition(this.xGel, this.yAtt);
    this.tweens.add({ targets: vecchio, x: 46, y: this.yColonna[2], scale: 0.2, alpha: 0.3, duration: 260, onComplete: () => vecchio.destroy() });
    this.gel = gelatoVuoto();
    this.cambiato();
  }

  private prendiPallina(id: string, p: Phaser.Input.Pointer): void {
    if (this.fase === "via") return;
    if (this.gel.base === undefined) return this.avviso(TESTI.avvisi.primaBase);
    if (this.gel.condimento !== undefined) return this.avviso(TESTI.avvisi.dopoCondimento);
    if (this.gel.palline.length >= MAX_PALLINE) return this.avviso(TESTI.avvisi.tantePalline);
    const g = this.add.graphics().setDepth(45);
    disegnaPallina(g, id, 0, 0);
    g.setPosition(p.worldX, p.worldY - 18);
    this.trascinata = { gusto: id, g, da: { x: p.worldX, y: p.worldY }, mosso: 0, dito: p.id };
    suona("tocco");
  }

  private lasciaPallina(p: Phaser.Input.Pointer): void {
    const t = this.trascinata!;
    this.trascinata = undefined;
    const meta = { x: this.xGel, y: this.yAtt + centroPallina(this.gel.palline.length) };
    const vicina = Math.hypot(p.worldX - meta.x, p.worldY - 18 - meta.y) < 70 || this.zonaIn(p.worldX, p.worldY) === "gelato";
    if (vicina && this.fase !== "via" && this.gel.palline.length < MAX_PALLINE && this.gel.condimento === undefined && this.gel.base !== undefined) {
      t.g.destroy();
      this.gel.palline.push(t.gusto);
      suona("plop");
      vibra(15);
      this.cambiato();
      return;
    }
    if (t.mosso < 12) this.avviso(TESTI.avvisi.trascina);
    this.tweens.add({ targets: t.g, x: t.da.x, y: t.da.y, scale: 0.3, alpha: 0, duration: 200, onComplete: () => t.g.destroy() });
  }

  private iniziaSalsa(tipo: Salsa, dito: number): void {
    if (this.fase === "via") return;
    if (this.gel.base === undefined || this.gel.palline.length === 0) return this.avviso(TESTI.avvisi.primaPalline);
    if (this.gel.condimento !== undefined) return this.avviso(TESTI.avvisi.giaCondito);
    const barra = this.add.graphics().setDepth(46);
    this.versando = { tipo, livello: 0, barra, dito };
    const b = this.bottiglie.get(tipo);
    if (b !== undefined) {
      this.tweens.killTweensOf(b);
      this.tweens.add({ targets: b, x: this.xGel + 34, y: this.yAtt + centroPallina(this.gel.palline.length - 1) - 58, angle: -150, duration: 140 });
    }
    suona("salsa");
    this.disegnaVersata();
  }

  // La barra accanto al gelato: si riempie dal basso, la fascia verde è il punto giusto.
  private disegnaVersata(): void {
    const v = this.versando;
    if (v === undefined) return;
    const x = this.xGel + 70;
    const alto = 120;
    const y = this.yAtt - 80;
    const g = v.barra;
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(x - 9, y - 4, 18, alto + 8, 8);
    g.fillStyle(0xcff3dc, 1);
    g.fillRect(x - 6, y + alto * (1 - SALSA_GIUSTA[1]), 12, alto * (SALSA_GIUSTA[1] - SALSA_GIUSTA[0]));
    g.fillStyle(coloreCondimento(v.tipo), 1);
    g.fillRect(x - 6, y + alto * (1 - v.livello), 12, alto * v.livello);
    g.lineStyle(2, COLORI.verde, 1);
    g.strokeRect(x - 6, y + alto * (1 - SALSA_GIUSTA[1]), 12, alto * (SALSA_GIUSTA[1] - SALSA_GIUSTA[0]));
    disegnaGelato(this.gelatoG, this.gel, 0, 0, { colore: coloreCondimento(v.tipo), quanto: v.livello });
  }

  private fermaSalsa(): void {
    const v = this.versando;
    if (v === undefined) return;
    this.versando = undefined;
    v.barra.destroy();
    const b = this.bottiglie.get(v.tipo);
    if (b !== undefined) {
      const y = this.yColonna[v.tipo === "salsa-cioccolato" ? 0 : 1] - 8;
      this.tweens.killTweensOf(b);
      this.tweens.add({ targets: b, x: LARGO - 46, y, angle: 0, duration: 160 });
    }
    const q = qualitaSalsa(v.livello);
    if (q === undefined || this.fase === "via") {
      if (this.fase !== "via") this.avviso(TESTI.avvisi.poca);
      this.ridisegnaGelato();
      return;
    }
    this.gel.condimento = v.tipo;
    this.gel.qualita = q;
    this.avviso(TESTI.salsa[q], this.xGel, this.yAtt - 130);
    vibra(12);
    this.cambiato();
  }

  private granella(): void {
    if (this.fase === "via") return;
    if (this.gel.base === undefined || this.gel.palline.length === 0) return this.avviso(TESTI.avvisi.primaPalline);
    if (this.gel.condimento !== undefined && this.gel.condimento !== "granella") return this.avviso(TESTI.avvisi.giaCondito);
    if (this.gel.tocchiGranella >= TOCCHI_GRANELLA) return;
    this.gel.condimento = "granella";
    this.gel.tocchiGranella++;
    const b = this.bottiglie.get("granella");
    if (b !== undefined) {
      this.tweens.killTweensOf(b);
      b.angle = 0;
      this.tweens.add({ targets: b, angle: { from: -25, to: 25 }, duration: 70, yoyo: true, repeat: 1, onComplete: () => (b.angle = 0) });
    }
    suona("granella");
    vibra(8);
    this.cambiato();
  }

  private cambiato(): void {
    this.ridisegnaGelato();
    this.aggiornaSpunte();
    this.aggiornaAiuto();
  }

  private ridisegnaGelato(): void {
    disegnaGelato(this.gelatoG, this.gel, 0, 0);
  }

  // ---------- aiuti per le prime partite ----------

  private aiutoAttuale(): string {
    const c = this.cliente;
    if (!this.conAiuti || c === undefined || this.fase !== "attesa") return "";
    const o = c.ordine;
    const g = this.gel;
    const cond = o.condimento;
    const pieno = g.palline.length > 0 || g.condimento !== undefined;
    if (g.base === undefined || (g.base !== o.base && !pieno)) return "base";
    // quello che non si aggiusta più: base sbagliata sotto le palline, un gusto di troppo, il condimento sbagliato,
    // palline che mancano sotto un condimento già messo. Allora si butta.
    const troppo = g.palline.some((p) => g.palline.filter((x) => x === p).length > o.palline.filter((x) => x === p).length);
    const mancano = o.palline.length > g.palline.length;
    if (g.base !== o.base || troppo || (g.condimento !== undefined && g.condimento !== cond) || (mancano && g.condimento !== undefined))
      return "butta";
    if (mancano) return "pallina";
    if (cond !== undefined && g.condimento === undefined) return cond === "granella" ? "granella" : "salsa";
    if (cond === "granella" && this.gel.tocchiGranella < TOCCHI_GRANELLA) return "granella";
    return "servi";
  }

  private aggiornaAiuto(): void {
    const a = this.aiutoAttuale();
    this.testoAiuto.setText(a === "" ? "" : TESTI.aiuti[a as keyof typeof TESTI.aiuti]);
    const g = this.evidenzia;
    g.clear();
    if (a === "" || this.cliente === undefined) return;
    g.lineStyle(3, COLORI.tenda, 1);
    const cerchia = (nome: string): void => {
      const z = this.zone.find((x) => x.nome === nome);
      if (z !== undefined) g.strokeRoundedRect(z.x - z.w / 2 + 2, z.y - z.h / 2 + 2, z.w - 4, z.h - 4, 12);
    };
    const o = this.cliente.ordine;
    if (a === "base") cerchia(o.base);
    else if (a === "pallina") {
      const resta = [...o.palline];
      for (const p of this.gel.palline) {
        const i = resta.indexOf(p);
        if (i >= 0) resta.splice(i, 1);
      }
      if (resta.length > 0) cerchia(`vaschetta:${resta[0]}`);
    } else if (a === "salsa" || a === "granella") cerchia(o.condimento!);
    else if (a === "servi") cerchia("gelato");
    else if (a === "butta") cerchia("cestino");
  }

  // ---------- servire, scadere, chiudere ----------

  private servi(): void {
    const c = this.cliente;
    if (c === undefined || this.fase !== "attesa") return;
    this.fase = "via";
    const frazione = this.tempo / c.pazienza;
    const errori = confronta(c.ordine, this.gel);
    const v = this.partita.servi(c, this.gel, frazione);
    this.ultimoVoto = v;
    if (v.giusto) aggiungiServito();
    this.aggiornaAiuto();
    this.tweens.add({
      targets: this.gelatoC,
      x: this.xCliente + 30,
      y: this.yBanco - 30,
      scale: 0.55,
      duration: 260,
      ease: "Quad.out",
      onComplete: () => {
        this.gelatoC.setAlpha(0);
        this.reazione(v, errori[0]);
      },
    });
  }

  private reazione(v: Voto, errore?: "base" | "palline" | "condimento"): void {
    const a = this.amico;
    if (v.giusto) {
      suona(v.stelle === 3 ? "tre" : "giusto");
      vibra(v.stelle === 3 ? 40 : 20);
      a?.umore("felice");
      this.fumetto(v.stelle === 3 ? scegli(Math.random, TESTI.velocissima) : scegli(Math.random, TESTI.grazie));
      this.stelle(v.stelle);
      const t = scritta(this, this.xCliente, this.yBanco - 150, `+${v.punti}`, 22, COLORI.verde, { stroke: "#ffffff", strokeThickness: 5 }).setDepth(55);
      this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, delay: 500, duration: 500, onComplete: () => t.destroy() });
    } else {
      suona("sbagliato");
      vibra(80);
      a?.umore("triste");
      this.fumetto(TESTI.sbagliati[errore ?? "palline"]);
      this.cameras.main.shake(180, 0.006);
    }
    this.aggiornaTesta();
    this.time.delayedCall(1050, () => this.congeda());
  }

  private scaduto(): void {
    if (this.fase !== "attesa") return;
    this.fase = "via";
    this.partita.scaduto();
    this.ultimoVoto = { giusto: false, stelle: 0, punti: 0 };
    this.annullaGesti();
    suona("sbagliato");
    vibra(80);
    this.amico?.umore("triste");
    this.fumetto(scegli(Math.random, TESTI.scaduto));
    this.aggiornaTesta();
    this.aggiornaAiuto();
    this.time.delayedCall(1050, () => this.congeda());
  }

  private annullaGesti(): void {
    if (this.trascinata !== undefined) {
      this.trascinata.g.destroy();
      this.trascinata = undefined;
    }
    if (this.versando !== undefined) this.fermaSalsa();
    this.spinta = undefined;
  }

  private fumetto(testo: string): void {
    const x = Math.max(110, this.xCliente + 40);
    const y = this.yBanco - 170;
    const t = scritta(this, x, y, testo, 15, COLORI.scuro, {
      backgroundColor: "#ffffff",
      padding: { x: 10, y: 7 },
      wordWrap: { width: 190 },
    }).setDepth(56);
    t.setScale(0.3);
    this.tweens.add({ targets: t, scale: 1, duration: 180, ease: "Back.out" });
    this.time.delayedCall(1000, () => this.tweens.add({ targets: t, alpha: 0, duration: 200, onComplete: () => t.destroy() }));
  }

  private stelle(n: number): void {
    const g = this.add.graphics().setDepth(55);
    for (let i = 0; i < 3; i++) disegnaStella(g, this.xCliente - 34 + i * 34, this.yBanco - 78 - R_TESTA - 22, 13, i < n);
    g.setAlpha(0);
    this.tweens.add({ targets: g, alpha: 1, duration: 150 });
    this.time.delayedCall(950, () => this.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: () => g.destroy() }));
  }

  private congeda(): void {
    this.biglietto?.destroy();
    this.biglietto = undefined;
    this.righeBiglietto = [];
    const a = this.amico;
    if (a !== undefined) {
      this.tweens.add({ targets: a.contenitore, x: -80, duration: 380, ease: "Quad.in", onComplete: () => a.contenitore.destroy() });
      this.amico = undefined;
    }
    this.gel = gelatoVuoto();
    this.gelatoC.setPosition(this.xGel, this.yAtt).setScale(1).setAlpha(1);
    this.ridisegnaGelato();
    this.time.delayedCall(420, () => this.prossimo());
  }

  private chiudi(): void {
    this.fase = "fine";
    this.time.delayedCall(200, () => {
      this.cameras.main.fadeOut(300, 91, 58, 74);
      this.time.delayedCall(320, () =>
        this.scene.start("Fine", { punti: this.partita.punti, serviti: this.partita.serviti, stelle: this.partita.stelle }),
      );
    });
  }

  // ---------- per le prove ----------

  private statoProva(): StatoProva {
    return {
      fase: this.fase,
      cuori: this.partita.cuori,
      punti: this.partita.punti,
      serviti: this.partita.serviti,
      tempo: this.tempo,
      pazienza: this.cliente?.pazienza ?? 0,
      amico: this.cliente?.amico.id,
      ordine: this.cliente?.ordine,
      gelato: { ...this.gel, palline: [...this.gel.palline] },
      livelloSalsa: this.versando?.livello,
      ultimoVoto: this.ultimoVoto,
      vaschette: [...this.partita.vaschette],
      aiuto: this.aiutoAttuale(),
    };
  }

  // Dove sta una cosa sullo schermo, in pixel CSS della pagina (per i tocchi di Playwright).
  private schermo(nome: string): { x: number; y: number } {
    let wx: number;
    let wy: number;
    if (nome === "attacco") {
      wx = this.xGel;
      wy = this.yAtt + centroPallina(this.gel.palline.length) + 18;
    } else {
      const z = this.zone.find((q) => q.nome === nome);
      if (z === undefined) throw new Error(`zona sconosciuta: ${nome}`);
      wx = z.x;
      wy = nome === "gelato" ? this.yAtt + 30 : z.y;
    }
    const cam = this.cameras.main;
    const r = this.game.canvas.getBoundingClientRect();
    const gx = (wx - cam.worldView.x) * cam.zoom;
    const gy = (wy - cam.worldView.y) * cam.zoom;
    return { x: r.left + (gx * r.width) / this.scale.width, y: r.top + (gy * r.height) / this.scale.height };
  }
}

