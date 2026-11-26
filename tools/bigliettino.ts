// Il bigliettino da dare a mano a Laura (scelta di Francesco del 25 novembre 2026, 01:38: «qr su un bigliettino»):
// formato A6, titolo, un cono disegnato, il QR che apre il gioco, una riga per dire cosa fare e uno spazio vuoto per
// due righe scritte a mano da Francesco. Esce in PDF (da stampare) e PNG (per guardarlo).
//   node tools/bigliettino.ts URL CARTELLA
import { chromium } from "@playwright/test";
import QRCode from "qrcode";

const url = process.argv[2];
const cartella = process.argv[3] ?? ".";
if (url === undefined) {
  console.error("uso: node tools/bigliettino.ts URL CARTELLA");
  process.exit(2);
}
const qr = await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#4a2c3a", light: "#ffffff" } });

const cono = `<svg viewBox="-40 -100 80 190" width="70" height="166">
  <polygon points="-28,0 28,0 0,84" fill="#e3a961"/>
  <rect x="-30" y="-4" width="60" height="9" rx="4" fill="#c98a45"/>
  <circle cx="0" cy="-14" r="25" fill="#a8c66c"/><circle cx="0" cy="-48" r="25" fill="#f28ba8"/>
  <circle cx="0" cy="-80" r="22" fill="#6b3e26"/>
  <circle cx="-9" cy="-52" r="2.5" fill="#d9466f"/><circle cx="8" cy="-42" r="2.5" fill="#d9466f"/>
</svg>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @page { size: 105mm 148mm; margin: 0; }
  html, body { margin: 0; }
  body { width: 105mm; height: 148mm; font-family: "Trebuchet MS", "Segoe UI", sans-serif; color: #4a2c3a;
    background: repeating-linear-gradient(90deg, #fff3e6 0 7mm, #fde6d2 7mm 10mm); position: relative; overflow: hidden; }
  .tenda { height: 14mm; background: repeating-linear-gradient(90deg, #f27a9b 0 11.6mm, #fff7f9 11.6mm 23.3mm);
    -webkit-mask: radial-gradient(5.9mm at 5.83mm 8mm, #000 98%, transparent) 0 0 / 11.66mm 14mm repeat-x,
      linear-gradient(#000 0 0) 0 0 / 100% 8mm no-repeat; }
  h1 { margin: 5mm 0 0; text-align: center; font-size: 25pt; line-height: 0.95; letter-spacing: 0.5px;
    color: #5b3a4a; -webkit-text-stroke: 0; text-shadow: 0 0 3px #fff, 0 0 3px #fff; }
  .riga { display: flex; align-items: center; justify-content: center; gap: 5mm; margin-top: 5mm; }
  .qr { width: 44mm; height: 44mm; background: #fff; padding: 2mm; border-radius: 4mm; box-shadow: 0 1mm 2mm #0002; }
  .qr svg { width: 100%; height: 100%; display: block; }
  p { text-align: center; margin: 4mm 6mm 0; font-size: 11pt; font-weight: bold; }
  .mano { position: absolute; left: 8mm; right: 8mm; bottom: 9mm; height: 22mm; border-top: 0.3mm dashed #c9a; }
  .mano::after { content: ""; position: absolute; left: 0; right: 0; top: 11mm; border-top: 0.3mm dashed #c9a; }
</style></head><body>
  <div class="tenda"></div>
  <h1>Gelateria<br>Gelati</h1>
  <div class="riga">${cono}<div class="qr">${qr}</div></div>
  <p>Inquadra il codice e apri la gelateria.<br>I clienti li conosci tutti.</p>
  <div class="mano"></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 397, height: 559 }, deviceScaleFactor: 3 });
await page.setContent(html);
await page.pdf({ path: `${cartella}/bigliettino-gelateria.pdf`, width: "105mm", height: "148mm", printBackground: true });
await page.screenshot({ path: `${cartella}/bigliettino-gelateria.png`, fullPage: true });
await browser.close();
console.log(`fatto: ${cartella}/bigliettino-gelateria.pdf`);
