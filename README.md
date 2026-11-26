# Gelateria Gelati

Il gioco per Laura, da darle domenica 29 novembre 2026 con un QR su un bigliettino. Una gelateria a ordini: arriva un
amico con il suo biglietto, Laura prepara il gelato con i gesti e lo serve. Un cliente alla volta, sempre più in
fretta; tre errori e si chiude. Il record resta sul telefono.

## Come si gioca
- **Base:** un tocco sul cono o sulla coppetta.
- **Palline:** si trascina la pallina dalla vaschetta fino al gelato (al massimo tre).
- **Salsa:** si tiene premuta la bottiglia e si lascia quando la barra è nella fascia verde (perfetta = terza stella).
- **Granella:** tre tocchi sul barattolo.
- **Servire:** si spinge il gelato verso l'alto, verso il cliente.
- **Cestino:** butta il gelato e si ricomincia.

Voto: una stella se è giusto, due se resta almeno il 35% della pazienza, tre se ne resta il 65% e la salsa è perfetta.
Punti: 50 per pezzo più fino a 100 per la fretta, per la serie di clienti giusti di fila (fino a +50%).
Le prime tre volte compaiono gli aiuti sul bancone.

## Da completare
- `src/data/amici.ts`: il campo `gusto` di ogni amico (il preferito). Finché manca, l'amico ordina gusti a caso.
  Se il gusto non c'è in `src/data/gusti.ts`, una riga lì. Sul bancone ci stanno otto vaschette: prima i preferiti.
- `src/data/amici.ts`: l'aspetto (capelli, maglia, occhiali, barba) è un segnaposto, non com'è davvero ognuno.
- `src/data/testi.ts`: tutte le scritte; `dedica` è l'unica frase a nome di Francesco.

## Comandi
| Cosa | Comando |
|---|---|
| Provare in locale | `npm run dev` |
| Controlli (lint, tipi, prove) | `npm run check` |
| Prove nel browser | `npm run test:e2e` |
| Pubblicare su Cloudflare | `npm run deploy` |
| Bigliettino col QR | `node tools/bigliettino.ts URL CARTELLA` |
| Foto in formato telefono | `node tools/foto.ts CARTELLA` (con `npm run preview` acceso) |
| Giocare 8 clienti e stampare l'esito | `node tools/diagnosi.ts 8` (con `npm run preview` acceso) |

Phaser 4.2.1, Vite, TypeScript. Tutto disegnato con forme (nessuna immagine), suoni fatti al volo con WebAudio.
