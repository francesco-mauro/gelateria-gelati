// Diagnosi: gioca N clienti con i gesti della prova e stampa, per ognuno, ordine, gelato, tempo e voto.
// Serve `vite preview` acceso sulla porta 4173.   node tools/diagnosi.ts [N]
import { chromium, devices } from "@playwright/test";

const n = Number(process.argv[2] ?? 8);
const browser = await chromium.launch();
const page = await browser.newPage({ ...devices["iPhone 13"] });
page.setDefaultTimeout(40000);
await page.goto("http://localhost:4173/?prova");
await page.waitForFunction(() => window.giocoProva?.scene.isActive("Titolo") === true);
await page.mouse.click(195, 330);
const stato = () => page.evaluate(() => window.banconeProva!.stato());
const dove = (x: string) => page.evaluate((y) => window.banconeProva!.schermo(y), x);
for (let i = 0; i < n; i++) {
  await page.waitForFunction(() => window.banconeProva?.stato().fase === "attesa");
  const t0 = Date.now();
  const o = (await stato()).ordine!;
  let p = await dove(o.base);
  await page.mouse.click(p.x, p.y);
  for (const g of o.palline) {
    const a = await dove(`vaschetta:${g}`);
    const b = await dove("attacco");
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 4 });
    await page.mouse.move(b.x, b.y, { steps: 4 });
    await page.mouse.up();
  }
  if (o.condimento === "granella")
    for (let k = 0; k < 3; k++) {
      p = await dove("granella");
      await page.mouse.click(p.x, p.y);
    }
  else if (o.condimento !== undefined) {
    p = await dove(o.condimento);
    await page.mouse.move(p.x, p.y);
    await page.mouse.down();
    await page.waitForFunction(() => (window.banconeProva!.stato().livelloSalsa ?? 0) >= 0.6);
    await page.mouse.up();
  }
  const s = await stato();
  const g = await dove("gelato");
  await page.mouse.move(g.x, g.y);
  await page.mouse.down();
  await page.mouse.move(g.x, g.y - 120, { steps: 8 });
  await page.mouse.up();
  await page.waitForFunction(() => window.banconeProva!.stato().fase !== "attesa");
  const d = await stato();
  console.log(
    i,
    JSON.stringify(o),
    "| gelato",
    JSON.stringify(s.gelato),
    "| tempo",
    s.tempo.toFixed(1),
    "/",
    s.pazienza.toFixed(1),
    "| ms",
    Date.now() - t0,
    "| voto",
    JSON.stringify(d.ultimoVoto),
  );
}
await browser.close();
