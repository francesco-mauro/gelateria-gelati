// Quello che il telefono ricorda tra una partita e l'altra: il record (la sfida è con se stessa, scelta di Francesco
// del 24 novembre 2026, 15:59), quanti clienti ha servito in tutto (dopo i primi tre spariscono gli aiuti) e il suono.
// localStorage può mancare o lanciare un errore (navigazione privata): allora il gioco va avanti senza ricordare.
const CHIAVE = "gelateria-gelati";

interface Ricordo {
  record: number;
  servitiTotali: number;
  muto: boolean;
}

export interface Archivio {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

function archivio(): Archivio | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function leggi(a: Archivio | undefined = archivio()): Ricordo {
  const vuoto: Ricordo = { record: 0, servitiTotali: 0, muto: false };
  try {
    const t = a?.getItem(CHIAVE);
    if (t == null) return vuoto;
    const r = JSON.parse(t) as Partial<Ricordo>;
    return {
      record: Number.isFinite(r.record) ? Number(r.record) : 0,
      servitiTotali: Number.isFinite(r.servitiTotali) ? Number(r.servitiTotali) : 0,
      muto: r.muto === true,
    };
  } catch {
    return vuoto;
  }
}

function scrivi(r: Ricordo, a: Archivio | undefined): void {
  try {
    a?.setItem(CHIAVE, JSON.stringify(r));
  } catch {
    // niente memoria: si gioca lo stesso
  }
}

// Salva i punti della partita; dice se è un record nuovo.
export function fineDiPartita(punti: number, a: Archivio | undefined = archivio()): boolean {
  const r = leggi(a);
  const nuovo = punti > r.record;
  scrivi({ ...r, record: Math.max(r.record, punti) }, a);
  return nuovo;
}

export function aggiungiServito(a: Archivio | undefined = archivio()): void {
  const r = leggi(a);
  scrivi({ ...r, servitiTotali: r.servitiTotali + 1 }, a);
}

export function impostaMuto(muto: boolean, a: Archivio | undefined = archivio()): void {
  scrivi({ ...leggi(a), muto }, a);
}
