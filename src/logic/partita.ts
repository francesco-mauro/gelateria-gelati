// Una partita: tre cuori, i punti, i clienti serviti, la serie di clienti giusti di fila.
// I clienti arrivano da un sacchetto mescolato: tutti gli amici passano una volta prima che qualcuno torni,
// e mai lo stesso due volte di fila.
// Sul bancone ci stanno otto vaschette: se arriva un amico il cui gusto preferito non c'è, una vaschetta cambia gusto
// (quella di un gusto che nessuno dei prossimi clienti preferisce), così ognuno ordina sempre il suo.
import { AMICI, type Amico } from "../data/amici";
import { vaschette } from "../data/gusti";
import { mescola, scegli, type Caso } from "./caso";
import { difficolta } from "./difficolta";
import { creaOrdine, type Gelato, type Ordine } from "./ordine";
import { vota, type Voto } from "./voto";

export const CUORI = 3;

export interface Cliente {
  amico: Amico;
  ordine: Ordine;
  pazienza: number;
  numero: number;
  // la vaschetta che cambia gusto per questo cliente, se serve
  cambio?: { indice: number; da: string; a: string };
}

export class Partita {
  cuori = CUORI;
  punti = 0;
  serviti = 0;
  serie = 0;
  stelle = 0;
  private numero = 0;
  private sacchetto: Amico[] = [];
  private ultimo?: string;
  readonly vaschette: string[];

  constructor(
    private readonly caso: Caso = Math.random,
    private readonly amici: readonly Amico[] = AMICI,
  ) {
    this.vaschette = vaschette(amici.map((a) => a.gusto));
  }

  get finita(): boolean {
    return this.cuori <= 0;
  }

  prossimoCliente(): Cliente {
    if (this.sacchetto.length === 0) {
      this.sacchetto = mescola(this.caso, this.amici);
      if (this.sacchetto.length > 1 && this.sacchetto[0].id === this.ultimo) this.sacchetto.push(this.sacchetto.shift()!);
    }
    const amico = this.sacchetto.shift()!;
    this.ultimo = amico.id;
    const cambio = this.faiPostoA(amico.gusto);
    const d = difficolta(this.numero);
    const ordine = creaOrdine(this.caso, d, this.vaschette, amico.gusto, amico.condimento);
    const c: Cliente = { amico, ordine, pazienza: d.pazienza, numero: this.numero++ };
    if (cambio !== undefined) c.cambio = cambio;
    return c;
  }

  // Mette sul bancone il gusto preferito che manca, al posto di uno che nessuno dei prossimi clienti preferisce
  // (se non c'è, al posto di uno a caso).
  private faiPostoA(preferito?: string): Cliente["cambio"] {
    if (preferito === undefined || this.vaschette.includes(preferito)) return undefined;
    const attesi = new Set(this.sacchetto.map((a) => a.gusto));
    const liberi = this.vaschette.map((_, i) => i).filter((i) => !attesi.has(this.vaschette[i]));
    const indice = scegli(this.caso, liberi.length > 0 ? liberi : this.vaschette.map((_, i) => i));
    const da = this.vaschette[indice];
    this.vaschette[indice] = preferito;
    return { indice, da, a: preferito };
  }

  servi(c: Cliente, g: Gelato, frazioneRimasta: number): Voto {
    const v = vota(c.ordine, g, frazioneRimasta, this.serie);
    if (v.giusto) {
      this.punti += v.punti;
      this.serviti++;
      this.stelle += v.stelle;
      this.serie++;
    } else {
      this.perdiCuore();
    }
    return v;
  }

  // Il cliente se n'è andato senza gelato.
  scaduto(): void {
    this.perdiCuore();
  }

  private perdiCuore(): void {
    this.cuori = Math.max(0, this.cuori - 1);
    this.serie = 0;
  }
}
