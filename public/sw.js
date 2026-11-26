// Il gioco senza rete: dopo la prima apertura tutto quello che serve resta nel telefono, così Laura può giocare in
// aereo o in Finlandia senza dati. La pagina chiede prima alla rete (così una versione nuova arriva appena c'è
// connessione) e, se la rete non risponde, usa la copia salvata. I file in /assets/ hanno l'impronta nel nome e non
// cambiano mai: si prendono dalla copia salvata e si scaricano solo la prima volta.
const CACHE = "gelateria-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/icona.svg", "/icona-180.png", "/manifest.webmanifest"])));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((nomi) => Promise.all(nomi.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

async function salva(richiesta, risposta) {
  if (risposta.ok) {
    const c = await caches.open(CACHE);
    await c.put(richiesta, risposta.clone());
  }
  return risposta;
}

self.addEventListener("fetch", (e) => {
  const r = e.request;
  const url = new URL(r.url);
  if (r.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(caches.match(r).then((c) => c ?? fetch(r).then((x) => salva(r, x))));
    return;
  }
  // la pagina e gli altri file: prima la rete, poi la copia (la pagina con ?prova o senza è la stessa)
  e.respondWith(
    fetch(r)
      .then((x) => salva(r.mode === "navigate" ? "/" : r, x))
      .catch(() => caches.match(r.mode === "navigate" ? "/" : r).then((c) => c ?? Response.error())),
  );
});
