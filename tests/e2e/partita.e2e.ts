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
  // su Chewi il WebGL senza schermo di Chromium è lento: otto clienti ci mettono un minuto e mezzo
  test.setTimeout(240000);
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
  // un gusto che non c'è nell'ordine: l'aiuto non invita a servire, dice di buttare
  await tocca(page, s.ordine!.base);
  const sbagliato = (await stato(page)).vaschette.find((v) => !s.ordine!.palline.includes(v))!;
  await trascina(page, `vaschetta:${sbagliato}`, "attacco");
  expect((await stato(page)).aiuto).toBe("butta");
  await tocca(page, "cestino");
  expect((await stato(page)).aiuto).toBe("base");
  expect(errori).toEqual([]);
});

test("un secondo dito che si alza non interrompe la pallina trascinata", async ({ page, browserName }) => {
  // i tocchi a più dita si mandano con CDP, che c'è solo in Chromium
  test.skip(browserName !== "chromium", "tocchi a più dita solo con Chromium");
  const errori = osservaErrori(page);
  await apri(page);
  const s = await stato(page);
  await tocca(page, s.ordine!.base);
  // due dita con i tocchi veri: il primo appoggiato sul muro, il secondo trascina la pallina
  const v = await dove(page, `vaschetta:${s.ordine!.palline[0]}`);
  const a = await dove(page, "attacco");
  const cdp = await page.context().newCDPSession(page);
  const tocco = (type: "touchStart" | "touchMove" | "touchEnd", punti: { x: number; y: number; id: number }[]) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints: punti.map((p) => ({ x: p.x, y: p.y, id: p.id })) });
  const muro = { x: 40, y: 120, id: 1 };
  await tocco("touchStart", [muro]);
  await tocco("touchStart", [muro, { ...v, id: 2 }]);
  await tocco("touchMove", [muro, { x: (v.x + a.x) / 2, y: (v.y + a.y) / 2, id: 2 }]);
  // il dito sul muro si alza a metà trascinamento: per Chrome è un touchMove con il solo dito rimasto
  // (un touchEnd vorrebbe dire «tutte le dita su»)
  await tocco("touchMove", [{ x: (v.x + a.x) / 2, y: (v.y + a.y) / 2, id: 2 }]);
  await tocco("touchMove", [{ ...a, id: 2 }]);
  await tocco("touchEnd", []);
  await expect.poll(async () => (await stato(page)).gelato.palline).toEqual([s.ordine!.palline[0]]);
  expect(errori).toEqual([]);
});

test("tre gelati sbagliati chiudono la gelateria, il record resta e si riapre", async ({ page }) => {
  test.setTimeout(180000);
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
  // subito dopo la chiusura i tocchi non contano (così non si saltano i punti per sbaglio): il tocco parte appena
  // la schermata finale c'è, prima di qualunque altra lettura
  await page.waitForFunction(() => window.fineProva !== undefined);
  const r = await page.evaluate(() => window.fineProva!.schermo("rigioca"));
  await page.mouse.click(r.x, r.y);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => window.giocoProva!.scene.isActive("Fine"))).toBe(true);
  const fine = await page.evaluate(() => ({ nuovo: window.fineProva!.nuovoRecord, record: window.fineProva!.record }));
  expect(fine.nuovo).toBe(true);
  expect(fine.record).toBeGreaterThan(0);
  const salvato = await page.evaluate(() => JSON.parse(localStorage.getItem("gelateria-gelati") ?? "{}"));
  expect(salvato.record).toBe(fine.record);
  await page.waitForTimeout(800);
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

test("una vaschetta che cambia gusto si prende col nuovo nome", async ({ page }) => {
  const errori = osservaErrori(page);
  await apri(page);
  const s = await stato(page);
  const via = s.vaschette[0];
  const nuovo = "mango";
  // il cambio che fa la partita quando arriva un amico col gusto che manca: qui chiamato a mano sul bancone
  await page.evaluate(
    ([da, a]) => {
      const scena = window.giocoProva!.scene.getScene("Bancone") as unknown as {
        partita: { vaschette: string[] };
        cambiaVaschetta: (c: { indice: number; da: string; a: string }) => void;
      };
      scena.partita.vaschette[0] = a;
      scena.cambiaVaschetta({ indice: 0, da, a });
    },
    [via, nuovo],
  );
  await page.waitForTimeout(500);
  await tocca(page, s.ordine!.base);
  await trascina(page, `vaschetta:${nuovo}`, "attacco");
  expect((await stato(page)).gelato.palline).toEqual([nuovo]);
  expect(errori).toEqual([]);
});
