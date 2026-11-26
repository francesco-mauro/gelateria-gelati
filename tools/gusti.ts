// I gusti degli amici dentro il gioco. Si incollano le risposte in un file di testo, una per riga («Cristina:
// pistacchio», «Andreea - cioccolato fondente»), e lo script dice chi ha riconosciuto e con quale gusto.
//   node tools/gusti.ts RISPOSTE.txt            mostra e basta
//   node tools/gusti.ts RISPOSTE.txt --scrivi   scrive i gusti riconosciuti in src/data/amici.ts
// Le righe non capite restano fuori e si vedono nell'elenco: un gusto che non c'è va aggiunto prima in
// src/data/gusti.ts (e, se si dice in un altro modo, in MODI di src/data/riconosci.ts). Poi `npm run check`,
// `npm run deploy`. Esce con 1 se qualche riga non è stata capita.
import { readFileSync, writeFileSync } from "node:fs";
import { AMICI } from "../src/data/amici.ts";
import { gusto } from "../src/data/gusti.ts";
import { leggiRisposte, scriviGusti } from "../src/data/riconosci.ts";

const [file, opzione] = process.argv.slice(2);
if (file === undefined) {
  console.error("uso: node tools/gusti.ts RISPOSTE.txt [--scrivi]");
  process.exit(2);
}

const risposte = leggiRisposte(readFileSync(file, "utf8"));
const gusti: Record<string, string> = {};
let nonCapite = 0;
for (const r of risposte) {
  if (r.amico === undefined) {
    nonCapite++;
    console.log(`?  non so chi è: «${r.riga}»`);
  } else if (r.gusto === undefined) {
    nonCapite++;
    console.log(`?  ${r.amico}: gusto non riconosciuto in «${r.resto}»`);
  } else {
    gusti[r.amico] = r.gusto;
    console.log(`ok ${r.amico}: ${gusto(r.gusto).nome}  (da «${r.come}»)`);
  }
}

const mancano = AMICI.filter((a) => a.gusto === undefined && gusti[a.id] === undefined).map((a) => a.nome);
console.log(`\nriconosciuti ${Object.keys(gusti).length}, non capiti ${nonCapite}`);
if (mancano.length > 0) console.log(`ancora senza gusto: ${mancano.join(", ")}`);
const diversi = new Set(AMICI.map((a) => gusti[a.id] ?? a.gusto).filter((g) => g !== undefined));
if (diversi.size > 8) console.log(`gusti diversi: ${diversi.size}, più delle 8 vaschette: le vaschette cambiano gusto quando arriva chi lo preferisce`);

if (opzione === "--scrivi" && Object.keys(gusti).length > 0) {
  const percorso = new URL("../src/data/amici.ts", import.meta.url);
  writeFileSync(percorso, scriviGusti(readFileSync(percorso, "utf8"), gusti));
  console.log("scritto in src/data/amici.ts");
}
process.exit(nonCapite > 0 ? 1 : 0);
