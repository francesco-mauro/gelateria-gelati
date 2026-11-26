// Le regole del gioco senza grafica: ordini, confronto, salsa, voto, difficoltà, partita, memoria.
import { describe, expect, it } from "vitest";
import { AMICI } from "../../src/data/amici";
import { GUSTI, MAX_VASCHETTE, gusto, vaschette } from "../../src/data/gusti";
import { casoConSeme, mescola } from "../../src/logic/caso";
import { PAZIENZA_INIZIO, PAZIENZA_MINIMA, difficolta } from "../../src/logic/difficolta";
import { aggiungiServito, fineDiPartita, impostaMuto, leggi, type Archivio } from "../../src/logic/memoria";
import { confronta, creaOrdine, gelatoVuoto, qualitaSalsa, type Gelato, type Ordine } from "../../src/logic/ordine";
import { CUORI, Partita } from "../../src/logic/partita";
import { moltiplicatore, vota } from "../../src/logic/voto";
import { leggiRisposte, scriviGusti, trovaGusto } from "../../src/data/riconosci";
import { readFileSync } from "node:fs";

const giusto = (o: Ordine, extra: Partial<Gelato> = {}): Gelato => ({
  base: o.base,
  palline: [...o.palline],
  condimento: o.condimento,
  tocchiGranella: o.condimento === "granella" ? 3 : 0,
  tocchiPanna: o.condimento === "panna" ? 2 : 0,
  qualita: o.condimento?.startsWith("salsa") ? "perfetta" : undefined,
  ...extra,
});

class Finto implements Archivio {
  dati = new Map<string, string>();
  getItem(k: string): string | null {
    return this.dati.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.dati.set(k, v);
  }
}

describe("gusti e vaschette", () => {
  it("ogni amico con un gusto ha un gusto che esiste", () => {
    const scelti = AMICI.flatMap((a) => (a.gusto === undefined ? [] : [a.gusto]));
    expect(() => scelti.forEach((id) => gusto(id))).not.toThrow();
  });
  it("i nomi dei gusti non si ripetono", () => {
    expect(new Set(GUSTI.map((g) => g.id)).size).toBe(GUSTI.length);
  });
  it("prima i preferiti, poi i classici, mai più di otto", () => {
    const v = vaschette(["mango", undefined, "fragola", "mango"]);
    expect(v.slice(0, 2)).toEqual(["mango", "fragola"]);
    expect(v).toHaveLength(MAX_VASCHETTE);
    expect(new Set(v).size).toBe(v.length);
  });
  it("senza preferiti ci sono gli otto classici", () => {
    expect(vaschette([])).toEqual(GUSTI.slice(0, 8).map((g) => g.id));
  });
});

describe("ordine e confronto", () => {
  it("il primo cliente vuole un cono con una pallina e niente condimento", () => {
    const caso = casoConSeme(1);
    for (let i = 0; i < 50; i++) {
      const o = creaOrdine(caso, difficolta(0), vaschette([]));
      expect(o.base).toBe("cono");
      expect(o.palline).toHaveLength(1);
      expect(o.condimento).toBeUndefined();
    }
  });
  it("il gusto preferito c'è sempre nell'ordine, se è sul bancone", () => {
    const caso = casoConSeme(2);
    const v = vaschette(["menta"]);
    for (let n = 0; n < 30; n++) expect(creaOrdine(caso, difficolta(n), v, "menta").palline).toContain("menta");
  });
  it("gli altri gusti dell'amico entrano se ci sono più palline e sono sul bancone", () => {
    const caso = casoConSeme(4);
    const v = vaschette(["menta", "vaniglia"]);
    for (let n = 0; n < 40; n++) {
      const o = creaOrdine(caso, difficolta(n), v, "menta", undefined, ["vaniglia", "mango"]);
      expect(o.palline[0]).toBe("menta");
      expect(o.palline.length === 1 || o.palline[1] === "vaniglia").toBe(true);
      expect(o.palline).not.toContain("mango");
    }
  });
  it("gli altri gusti degli amici esistono tutti", () => {
    const altri = AMICI.flatMap((a) => a.altri ?? []);
    expect(altri.length).toBeGreaterThan(0);
    expect(() => altri.forEach((id) => gusto(id))).not.toThrow();
  });
  it("le palline restano tra minimo e massimo e vengono dal bancone", () => {
    const caso = casoConSeme(3);
    const v = vaschette([]);
    for (let n = 0; n < 40; n++) {
      const d = difficolta(n);
      const o = creaOrdine(caso, d, v);
      expect(o.palline.length).toBeGreaterThanOrEqual(d.pallineMin);
      expect(o.palline.length).toBeLessThanOrEqual(d.pallineMax);
      for (const p of o.palline) expect(v).toContain(p);
    }
  });
  it("giusto quando tutto torna, l'ordine delle palline non conta", () => {
    const o: Ordine = { base: "coppetta", palline: ["fragola", "limone"], condimento: "salsa-cioccolato" };
    expect(confronta(o, giusto(o, { palline: ["limone", "fragola"] }))).toEqual([]);
  });
  it("dice cosa è sbagliato", () => {
    const o: Ordine = { base: "cono", palline: ["fragola"] };
    expect(confronta(o, { ...gelatoVuoto(), base: "coppetta", palline: ["limone"], condimento: "granella", tocchiGranella: 3 })).toEqual([
      "base",
      "palline",
      "condimento",
    ]);
  });
  it("la granella vale solo con tre tocchi", () => {
    const o: Ordine = { base: "cono", palline: ["fragola"], condimento: "granella" };
    expect(confronta(o, giusto(o, { tocchiGranella: 2 }))).toEqual(["condimento"]);
    expect(confronta(o, giusto(o, { tocchiGranella: 3 }))).toEqual([]);
  });
  it("la granella toccata per sbaglio su un gelato senza condimento è un errore", () => {
    const o: Ordine = { base: "cono", palline: ["fragola"] };
    expect(confronta(o, giusto(o, { condimento: "granella", tocchiGranella: 1 }))).toEqual(["condimento"]);
    expect(confronta(o, giusto(o))).toEqual([]);
  });
  it("la panna vale solo con due tocchi", () => {
    const o: Ordine = { base: "coppetta", palline: ["nocciola"], condimento: "panna" };
    expect(confronta(o, giusto(o, { tocchiPanna: 1 }))).toEqual(["condimento"]);
    expect(confronta(o, giusto(o, { tocchiPanna: 2 }))).toEqual([]);
  });
  it("Dede ordina sempre la doppia panna, nessun altro la ordina mai", () => {
    const p = new Partita(casoConSeme(21));
    for (let i = 0; i < 60; i++) {
      const c = p.prossimoCliente();
      expect(c.ordine.condimento === "panna").toBe(c.amico.id === "dede");
    }
  });
  it("la doppia panna conta per la terza stella come la granella", () => {
    const o: Ordine = { base: "cono", palline: ["nocciola"], condimento: "panna" };
    expect(vota(o, giusto(o), 0.9, 0).stelle).toBe(3);
  });
  it("una pallina in più è un errore", () => {
    const o: Ordine = { base: "cono", palline: ["fragola"] };
    expect(confronta(o, giusto(o, { palline: ["fragola", "fragola"] }))).toEqual(["palline"]);
  });
});

describe("salsa", () => {
  it("troppo poca non conta, nel mezzo è perfetta, ai lati va bene", () => {
    expect(qualitaSalsa(0.1)).toBeUndefined();
    expect(qualitaSalsa(0.3)).toBe("ok");
    expect(qualitaSalsa(0.65)).toBe("perfetta");
    expect(qualitaSalsa(0.95)).toBe("ok");
  });
});

describe("voto", () => {
  const o: Ordine = { base: "cono", palline: ["fragola", "limone"] };
  it("sbagliato: zero", () => {
    expect(vota(o, giusto(o, { base: "coppetta" }), 1, 3)).toEqual({ giusto: false, stelle: 0, punti: 0 });
  });
  it("le stelle seguono la fretta", () => {
    expect(vota(o, giusto(o), 0.1, 0).stelle).toBe(1);
    expect(vota(o, giusto(o), 0.5, 0).stelle).toBe(2);
    expect(vota(o, giusto(o), 0.9, 0).stelle).toBe(3);
  });
  it("la terza stella vuole la salsa perfetta", () => {
    const s: Ordine = { ...o, condimento: "salsa-fragola" };
    expect(vota(s, giusto(s, { qualita: "ok" }), 0.9, 0).stelle).toBe(2);
    expect(vota(s, giusto(s), 0.9, 0).stelle).toBe(3);
  });
  it("punti: 50 a pezzo più la fretta, per la serie", () => {
    expect(vota(o, giusto(o), 1, 0).punti).toBe(250);
    expect(vota(o, giusto(o), 0, 0).punti).toBe(150);
    expect(vota(o, giusto(o), 1, 2).punti).toBe(300);
    expect(moltiplicatore(99)).toBe(1.5);
  });
});

describe("difficoltà", () => {
  it("la pazienza scende e non va sotto il minimo", () => {
    expect(difficolta(0).pazienza).toBe(PAZIENZA_INIZIO);
    for (let n = 1; n < 60; n++) expect(difficolta(n).pazienza).toBeLessThanOrEqual(difficolta(n - 1).pazienza);
    expect(difficolta(200).pazienza).toBe(PAZIENZA_MINIMA);
  });
});

describe("partita", () => {
  it("tutti gli amici passano prima che uno torni, mai due volte di fila", () => {
    const p = new Partita(casoConSeme(7));
    const visti: string[] = [];
    for (let i = 0; i < AMICI.length * 4; i++) visti.push(p.prossimoCliente().amico.id);
    expect(new Set(visti.slice(0, AMICI.length)).size).toBe(AMICI.length);
    for (let i = 1; i < visti.length; i++) expect(visti[i]).not.toBe(visti[i - 1]);
  });
  it("un errore o un cliente scaduto tolgono un cuore e azzerano la serie, a zero cuori è finita", () => {
    const p = new Partita(casoConSeme(8));
    const c = p.prossimoCliente();
    expect(p.servi(c, giusto(c.ordine), 1).giusto).toBe(true);
    expect(p.serie).toBe(1);
    p.servi(p.prossimoCliente(), gelatoVuoto(), 1);
    expect(p.cuori).toBe(CUORI - 1);
    expect(p.serie).toBe(0);
    p.scaduto();
    p.scaduto();
    expect(p.finita).toBe(true);
    p.scaduto();
    expect(p.cuori).toBe(0);
  });
  it("i numeri dei clienti crescono", () => {
    const p = new Partita(casoConSeme(9));
    expect([p.prossimoCliente().numero, p.prossimoCliente().numero]).toEqual([0, 1]);
  });
  it("con un solo amico non si blocca", () => {
    const p = new Partita(casoConSeme(10), [AMICI[0]]);
    expect(p.prossimoCliente().amico.id).toBe(AMICI[0].id);
    expect(p.prossimoCliente().amico.id).toBe(AMICI[0].id);
  });
  it("mescola tiene tutti gli elementi", () => {
    expect(mescola(casoConSeme(1), [1, 2, 3, 4]).toSorted()).toEqual([1, 2, 3, 4]);
  });
});

describe("memoria", () => {
  it("record, serviti e suono si ricordano", () => {
    const a = new Finto();
    expect(leggi(a)).toEqual({ record: 0, servitiTotali: 0, muto: false });
    expect(fineDiPartita(500, a)).toBe(true);
    expect(fineDiPartita(300, a)).toBe(false);
    aggiungiServito(a);
    impostaMuto(true, a);
    expect(leggi(a)).toEqual({ record: 500, servitiTotali: 1, muto: true });
  });
  it("senza archivio o con dati rotti non si rompe", () => {
    const a = new Finto();
    a.setItem("gelateria-gelati", "{rotto");
    expect(leggi(a).record).toBe(0);
    expect(leggi(undefined).record).toBe(0);
    expect(fineDiPartita(10, undefined)).toBe(true);
  });
});

describe("gusti preferiti oltre le otto vaschette", () => {
  // dieci amici con dieci gusti diversi: più delle otto vaschette
  const dieci = ["mango", "menta", "amarena", "puffo", "nutella", "kinder", "pesca", "bosco", "yogurt", "malaga"];
  const amici = AMICI.slice(0, 10).map((a, i) => Object.assign({}, a, { gusto: dieci[i] }));
  it("ognuno ordina sempre il suo gusto, il bancone resta di otto vaschette tutte diverse", () => {
    const p = new Partita(casoConSeme(21), amici);
    let cambi = 0;
    for (let i = 0; i < 60; i++) {
      const prima = [...p.vaschette];
      const c = p.prossimoCliente();
      expect(c.ordine.palline).toContain(c.amico.gusto);
      expect(p.vaschette).toHaveLength(MAX_VASCHETTE);
      expect(new Set(p.vaschette).size).toBe(MAX_VASCHETTE);
      for (const g of c.ordine.palline) expect(p.vaschette).toContain(g);
      // senza cambio il bancone resta com'era; con il cambio cambia solo quella vaschetta, verso il gusto dell'amico
      const atteso = [...prima];
      if (c.cambio !== undefined) {
        cambi++;
        atteso[c.cambio.indice] = c.amico.gusto!;
      }
      expect(p.vaschette).toEqual(atteso);
      expect(c.cambio === undefined || prima[c.cambio.indice] === c.cambio.da).toBe(true);
    }
    expect(cambi).toBeGreaterThan(0);
  });
  it("con otto gusti o meno nessuna vaschetta cambia", () => {
    const p = new Partita(casoConSeme(22), amici.slice(0, 8));
    for (let i = 0; i < 30; i++) expect(p.prossimoCliente().cambio).toBeUndefined();
  });
  it("i nomi dei gusti stanno sotto la vaschetta", () => {
    for (const g of GUSTI) expect(g.nome.length).toBeLessThanOrEqual(13);
  });
});

describe("risposte degli amici", () => {
  it("riconosce chi e il gusto, scritti come capita", () => {
    const r = leggiRisposte(
      [
        "Cristina: pistacchio",
        "Andreea - cioccolato fondente!!",
        "gaia = Fior di latte 😍",
        "Bevilacqua: cioccolato bianco",
        "Luca: frutti di bosco",
        "Fraulin: il caffè",
        "",
        "Gilberto: menta e cioccolato",
        "Paolo: boh fammi pensare",
        "Sconosciuto: fragola",
      ].join("\n"),
    );
    const visto = r.map((x) => [x.amico, x.gusto]);
    expect(visto).toEqual([
      ["cristina", "pistacchio"],
      ["dede", "cioccolato"],
      ["gaia", "fiordilatte"],
      ["francesca", "bianco"],
      ["luca", "bosco"],
      ["matteo", "caffe"],
      ["gilberto", "menta"],
      ["paolo", undefined],
      [undefined, undefined],
    ]);
  });
  it("ogni modo di dire porta a un gusto che esiste", () => {
    for (const g of GUSTI) expect(trovaGusto(g.nome)?.gusto).toBe(g.id);
  });
  it("scrive e riscrive il gusto nella riga dell'amico", () => {
    const sorgente = readFileSync(new URL("../../src/data/amici.ts", import.meta.url), "utf8");
    const una = scriviGusti(sorgente, { cristina: "pistacchio", cice: "fragola" });
    expect(una).toContain('{ id: "cristina", nome: "Cristina", gusto: "pistacchio",');
    expect(una).toContain('{ id: "cice", nome: "Cice", gusto: "fragola",');
    const due = scriviGusti(una, { cristina: "nocciola" });
    expect(due).toContain('{ id: "cristina", nome: "Cristina", gusto: "nocciola",');
    expect(due.split("\n").length).toBe(sorgente.split("\n").length);
    expect(() => scriviGusti(sorgente, { nessuno: "fragola" })).toThrow("amico non trovato");
  });
});
