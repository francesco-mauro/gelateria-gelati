// I suoni, fatti al volo con WebAudio (niente file da scaricare): note corte e morbide.
// Il browser li permette solo dopo il primo tocco: sblocca() si chiama al primo pointerdown.
import { impostaMuto, leggi } from "../logic/memoria";

export type Suono = "tocco" | "plop" | "salsa" | "granella" | "giusto" | "tre" | "sbagliato" | "via" | "record" | "fine";

let ctx: AudioContext | undefined;
let muto = leggi().muto;

export function sblocca(): void {
  try {
    if (ctx === undefined) ctx = new AudioContext();
    // su iPhone dopo una telefonata lo stato è "interrupted", non "suspended"
    if (ctx.state !== "running") void ctx.resume();
  } catch {
    ctx = undefined;
  }
}

export function eMuto(): boolean {
  return muto;
}

export function cambiaMuto(): boolean {
  muto = !muto;
  impostaMuto(muto);
  return muto;
}

function nota(freq: number, inizio: number, durata: number, tipo: OscillatorType = "sine", volume = 0.18): void {
  if (ctx === undefined) return;
  const t = ctx.currentTime + inizio;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durata);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + durata + 0.02);
}

function scivola(da: number, a: number, durata: number, tipo: OscillatorType = "sine", volume = 0.16): void {
  if (ctx === undefined) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(da, t);
  o.frequency.exponentialRampToValueAtTime(a, t + durata);
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durata);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + durata + 0.02);
}

export function suona(s: Suono): void {
  if (muto || ctx === undefined) return;
  try {
    switch (s) {
      case "tocco":
        nota(660, 0, 0.08, "triangle", 0.12);
        break;
      case "plop":
        scivola(520, 180, 0.14, "sine", 0.25);
        break;
      case "salsa":
        scivola(220, 160, 0.25, "triangle", 0.08);
        break;
      case "granella":
        nota(1400 + Math.random() * 400, 0, 0.04, "square", 0.04);
        nota(1800 + Math.random() * 400, 0.03, 0.04, "square", 0.04);
        break;
      case "giusto":
        nota(660, 0, 0.12, "triangle");
        nota(880, 0.09, 0.18, "triangle");
        break;
      case "tre":
        nota(660, 0, 0.1, "triangle");
        nota(880, 0.08, 0.1, "triangle");
        nota(1320, 0.16, 0.25, "triangle");
        break;
      case "sbagliato":
        nota(220, 0, 0.18, "sawtooth", 0.07);
        nota(180, 0.14, 0.28, "sawtooth", 0.07);
        break;
      case "via":
        scivola(400, 200, 0.4, "triangle", 0.1);
        break;
      case "record":
        [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.12, 0.3, "triangle"));
        break;
      case "fine":
        [392, 330, 262].forEach((f, i) => nota(f, i * 0.15, 0.3, "triangle", 0.12));
        break;
    }
  } catch {
    // un suono perso non ferma il gioco
  }
}

export function vibra(ms: number): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // non tutti i telefoni vibrano (iPhone no)
  }
}
