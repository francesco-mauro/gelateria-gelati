// Dalle risposte degli amici, scritte come capita, ai gusti del gioco. Lo usa `tools/gusti.ts`, non il gioco.
// Una risposta per riga, «Chi: gusto» (anche «Chi - gusto» o «Chi gusto»). Chi si riconosce dal nome nel gioco o da
// un pezzo del nome in rubrica; il gusto da una tabella di modi di dirlo, senza accenti e maiuscole.
import { AMICI } from "./amici.ts";
import { GUSTI } from "./gusti.ts";

export function normalizza(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// I pezzi del nome in rubrica (vault, brainstorm del 24 novembre, «Le persone a cui chiedere il gusto»).
const ALIAS_AMICI: Record<string, string[]> = {
  cristina: ["falco", "showoman"],
  gaia: ["salemi"],
  dede: ["andreea", "caragia"],
  enza: ["enzina"],
  aurora: ["auris", "labanca"],
  gilberto: ["magnacrani"],
  matteo: ["fraulin"],
  francesca: ["bevilacqua"],
  marco: ["fioravanti"],
  paolo: ["ferrante"],
  francesco: ["io", "me"],
};

// Modi di dire un gusto, già normalizzati. Vince il più lungo che compare nella risposta.
const MODI: Record<string, string[]> = {
  cioccolato: ["cioccolato", "cioccolata", "fondente", "cioccolato fondente", "cacao", "ciocco"],
  bianco: ["cioccolato bianco", "cioccolata bianca", "bianco"],
  fiordilatte: ["fiordilatte", "fior di latte", "fiore di latte", "panna"],
  stracciatella: ["stracciatella"],
  caffe: ["caffe", "espresso", "moka"],
  tiramisu: ["tiramisu"],
  puffo: ["puffo", "puffi", "blu"],
  amarena: ["amarena", "amarene", "variegato amarena", "crema amarena"],
  bosco: ["frutti di bosco", "frutti bosco", "bosco"],
  menta: ["menta", "after eight", "menta e cioccolato"],
  caramello: ["caramello", "caramello salato", "mou", "dulce de leche"],
  biscotto: ["biscotto", "biscotti", "cookie", "cookies", "oreo", "pan di stelle"],
  nutella: ["nutella"],
  gianduia: ["gianduia", "gianduja", "ferrero", "ferrero rocher", "rocher"],
  bacio: ["bacio", "baci", "bacio perugina"],
  kinder: ["kinder", "kinder bueno", "bueno"],
  anguria: ["anguria", "cocomero"],
  yogurt: ["yogurt", "yoghurt"],
  zabaione: ["zabaione", "zabaglione"],
  malaga: ["malaga"],
  ricotta: ["ricotta", "ricotta e fichi"],
  mandorla: ["mandorla", "mandorle", "latte di mandorla"],
  pistacchio: ["pistacchio", "pistacchi"],
  nocciola: ["nocciola", "nocciole"],
  liquirizia: ["liquirizia"],
};

export type Risposta =
  | { riga: string; amico: string; gusto: string; come: string }
  | { riga: string; amico: string; gusto?: undefined; resto: string }
  | { riga: string; amico?: undefined; gusto?: undefined; resto: string };

export function trovaAmico(testo: string): string | undefined {
  const parole = normalizza(testo).split(" ");
  for (const a of AMICI) {
    const nomi = new Set([normalizza(a.nome), a.id, ...(ALIAS_AMICI[a.id] ?? [])]);
    if (parole.some((p) => nomi.has(p))) return a.id;
  }
  return undefined;
}

export function trovaGusto(testo: string): { gusto: string; come: string } | undefined {
  const t = ` ${normalizza(testo)} `;
  let meglio: { gusto: string; come: string } | undefined;
  const prova = (gusto: string, modo: string) => {
    if (t.includes(` ${modo} `) && (meglio === undefined || modo.length > meglio.come.length)) meglio = { gusto, come: modo };
  };
  for (const [gusto, modi] of Object.entries(MODI)) for (const m of modi) prova(gusto, m);
  for (const g of GUSTI) {
    prova(g.id, g.id);
    prova(g.id, normalizza(g.nome));
  }
  return meglio;
}

// Una riga: prima chi (fino a «:», «-» o «=», o la prima parola), poi il gusto.
export function leggiRiga(riga: string): Risposta | undefined {
  const pulita = riga.trim();
  if (pulita === "") return undefined;
  const m = /^(.+?)\s*[:=\-–]\s*(.+)$/.exec(pulita);
  const chi = m ? m[1] : pulita.split(/\s+/)[0];
  const resto = m ? m[2] : pulita.slice(chi.length).trim();
  const amico = trovaAmico(chi);
  if (amico === undefined) return { riga: pulita, resto };
  const g = trovaGusto(resto);
  if (g === undefined) return { riga: pulita, amico, resto };
  return { riga: pulita, amico, gusto: g.gusto, come: g.come };
}

export function leggiRisposte(testo: string): Risposta[] {
  return testo.split(/\r?\n/).flatMap((r) => {
    const x = leggiRiga(r);
    return x === undefined ? [] : [x];
  });
}

// Scrive i gusti nel sorgente di src/data/amici.ts: nella riga dell'amico mette (o cambia) `gusto: "..."` subito dopo
// il nome. Torna il sorgente nuovo.
export function scriviGusti(sorgente: string, gusti: Record<string, string>): string {
  let s = sorgente;
  for (const [amico, gusto] of Object.entries(gusti)) {
    const riga = new RegExp(`(\\{ id: "${amico}", nome: "[^"]*",)( gusto: "[^"]*",)?`);
    if (!riga.test(s)) throw new Error(`amico non trovato in amici.ts: ${amico}`);
    s = s.replace(riga, `$1 gusto: "${gusto}",`);
  }
  return s;
}
