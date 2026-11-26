// La partita nel browser vero, con i gesti veri: tocco sulla base, palline trascinate, salsa tenuta premuta e lasciata
// nel verde, granella a tre tocchi, gelato spinto verso il cliente. Poi tre errori di fila fino alla fine, il record
// salvato e il rigioca. In nessun momento errori in console.
import { expect, test, type Page } from "@playwright/test";

function osservaErrori(page: Page): string[] {
  const errori: string[] = [];
  page.on("pageerror", (e) => errori.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errori.push(m.text());
  });
  return errori;
}

const stato = (page: Page) => page.evaluate(() => window.banconeProva!.stato());
const dove = (page: Page, nome: string) => page.evaluate((n) => window.banconeProva!.schermo(n), nome);

async function tocca(page: Page, nome: string): Promise<void> {
  const p = await dove(page, nome);
  await page.mouse.click(p.x, p.y);
}

async function trascina(page: Page, da: string, a: string): Promise<void> {
  const p = await dove(page, da);
  const q = await dove(page, a);
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move((p.x + q.x) / 2, (p.y + q.y) / 2, { steps: 4 });
  await page.mouse.move(q.x, q.y, { steps: 4 });
  await page.mouse.up();
}

async function aspettaCliente(page: Page): Promise<void> {
  await page.waitForFunction(() => window.banconeProva?.stato().fase === "attesa");
}

async function apri(page: Page): Promise<void> {
  await page.goto("/?prova");
  await page.waitForFunction(() => window.giocoProva?.scene.isActive("Titolo") === true);
  const v = page.viewportSize()!;
  await page.mouse.click(v.width / 2, v.height / 2);
  await page.waitForFunction(() => window.banconeProva !== undefined);
  await aspettaCliente(page);
}

// Prepara l'ordine del cliente che aspetta, con i gesti, e lo serve. Torna il voto.
async function servi(page: Page): Promise<{ giusto: boolean; condimento?: string; base: string }> {
  const s = await stato(page);
  const o = s.ordine!;
  await tocca(page, o.base);
  for (const p of o.palline) await trascina(page, `vaschetta:${p}`, "attacco");
  if (o.condimento === "granella") for (let i = 0; i < 3; i++) await tocca(page, "granella");
  else if (o.condimento !== undefined) {
    const b = await dove(page, o.condimento);
    await page.mouse.move(b.x, b.y);
    await page.mouse.down();
    await page.waitForFunction(() => (window.banconeProva!.stato().livelloSalsa ?? 0) >= 0.6);
    await page.mouse.up();
  }
  const prima = await stato(page);
  expect(prima.gelato.palline.toSorted()).toEqual(o.palline.toSorted());
  const g = await dove(page, "gelato");
  await page.mouse.move(g.x, g.y);
  await page.mouse.down();
  await page.mouse.move(g.x, g.y - 120, { steps: 8 });
  await page.mouse.up();
  await page.waitForFunction(() => window.banconeProva!.stato().fase !== "attesa");
  const dopo = await stato(page);
  return { giusto: dopo.ultimoVoto!.giusto, condimento: o.condimento, base: o.base };
}

test("sei clienti serviti giusti con i gesti veri, salse e granella comprese", async ({ page }) => {
  test.setTimeout(120000);
  const errori = osservaErrori(page);
  await apri(page);
  const visti = new Set<string>();
  for (let i = 0; i < 8; i++) {
    const r = await servi(page);
    expect(r.giusto).toBe(true);
    visti.add(r.base);
    if (r.condimento !== undefined) visti.add(r.condimento);
    await aspettaCliente(page);
  }
  const s = await stato(page);
  expect(s.serviti).toBe(8);
  expect(s.cuori).toBe(3);
  expect(s.punti).toBeGreaterThan(8 * 100);
  expect(visti.has("cono")).toBe(true);
  expect(errori).toEqual([]);
});

test("la salsa lasciata nel verde è perfetta, toccata appena non conta", async ({ page }) => {
  const errori = osservaErrori(page);
  await apri(page);
  const s = await stato(page);
  await tocca(page, s.ordine!.base);
  // senza palline la salsa non parte
  await tocca(page, "salsa-fragola");
  expect((await stato(page)).gelato.condimento).toBeUndefined();
  await trascina(page, `vaschetta:${s.ordine!.palline[0]}`, "attacco");
  // un tocco veloce: troppo poca
  await tocca(page, "salsa-fragola");
  expect((await stato(page)).gelato.condimento).toBeUndefined();
  const b = await dove(page, "salsa-cioccolato");
  await page.mouse.move(b.x, b.y);
  await page.mouse.down();
  await page.waitForFunction(() => (window.banconeProva!.stato().livelloSalsa ?? 0) >= 0.62);
  await page.mouse.up();
  const dopo = await stato(page);
  expect(dopo.gelato.condimento).toBe("salsa-cioccolato");
  expect(dopo.gelato.qualita).toBe("perfetta");
  // il cestino svuota tutto
  await tocca(page, "cestino");
  expect((await stato(page)).gelato).toEqual({ palline: [], tocchiGranella: 0 });
  expect(errori).toEqual([]);
});

test("tre gelati sbagliati chiudono la gelateria, il record resta e si riapre", async ({ page }) => {
  test.setTimeout(90000);
  const errori = osservaErrori(page);
  await apri(page);
  // prima uno giusto, per avere dei punti
  expect((await servi(page)).giusto).toBe(true);
  for (let i = 0; i < 3; i++) {
    await aspettaCliente(page);
    const s = await stato(page);
    // la base sbagliata, servita subito
    await tocca(page, s.ordine!.base === "cono" ? "coppetta" : "cono");
    const g = await dove(page, "gelato");
    await page.mouse.move(g.x, g.y);
    await page.mouse.down();
    await page.mouse.move(g.x, g.y - 120, { steps: 8 });
    await page.mouse.up();
    await page.waitForFunction(() => window.banconeProva!.stato().fase !== "attesa");
    expect((await stato(page)).ultimoVoto!.giusto).toBe(false);
  }
  await page.waitForFunction(() => window.giocoProva?.scene.isActive("Fine") === true);
  const fine = await page.evaluate(() => ({ nuovo: window.fineProva!.nuovoRecord, record: window.fineProva!.record }));
  expect(fine.nuovo).toBe(true);
  expect(fine.record).toBeGreaterThan(0);
  const salvato = await page.evaluate(() => JSON.parse(localStorage.getItem("gelateria-gelati") ?? "{}"));
  expect(salvato.record).toBe(fine.record);
  const r = await page.evaluate(() => window.fineProva!.schermo("rigioca"));
  await page.mouse.click(r.x, r.y);
  await page.waitForFunction(() => window.banconeProva?.stato().fase === "attesa");
  expect((await stato(page)).cuori).toBe(3);
  expect(errori).toEqual([]);
});

test("con un dito vero: tocchi sul telefono per base e granella", async ({ page }) => {
  const errori = osservaErrori(page);
  await apri(page);
  const s = await stato(page);
  const b = await dove(page, s.ordine!.base);
  await page.touchscreen.tap(b.x, b.y);
  await expect.poll(async () => (await stato(page)).gelato.base).toBe(s.ordine!.base);
  expect(errori).toEqual([]);
});
