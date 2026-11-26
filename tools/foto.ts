// Foto del gioco in formato telefono, per guardarlo senza telefono: node tools/foto.ts CARTELLA
// Apre la build con `vite preview` già acceso sulla porta 4173.
import { chromium, devices } from "@playwright/test";

const cartella = process.argv[2] ?? ".";
const browser = await chromium.launch();
const page = await browser.newPage({ ...devices["iPhone 13"] });
const errori: string[] = [];
page.on("pageerror", (e) => errori.push(e.message));
page.on("console", (m) => m.type() === "error" && errori.push(m.text()));
await page.goto(`${process.env.INDIRIZZO ?? "http://localhost:4173"}/?prova`);
await page.waitForTimeout(800);
await page.screenshot({ path: `${cartella}/1-titolo.png` });
await page.touchscreen.tap(195, 420);
await page.waitForFunction(() => window.banconeProva?.stato().fase === "attesa");
await page.screenshot({ path: `${cartella}/2-bancone.png` });
const tap = async (n: string) => {
  const p = await page.evaluate((x) => window.banconeProva!.schermo(x), n);
  await page.touchscreen.tap(p.x, p.y);
};
await tap("cono");
await page.waitForTimeout(250);
await page.screenshot({ path: `${cartella}/3-cono.png` });
console.log(JSON.stringify(await page.evaluate(() => window.banconeProva!.stato())));
console.log("errori:", errori.join(" | ") || "nessuno");
await browser.close();
