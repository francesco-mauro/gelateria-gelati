// La prova nel browser vero: Playwright apre la build (servita da `vite preview`) in formato telefono, uno alto
// (390x844) e uno basso (360x640, dove lo spazio è più stretto), più Safari di un iPhone (WebKit, il motore di
// tutti i browser su iPhone). Si lancia con `npm run test:e2e`.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "**/*.e2e.ts",
  reporter: "list",
  // una prova alla volta: il WebGL senza schermo è lento, in parallelo i clienti perderebbero la pazienza
  workers: 1,
  use: { baseURL: "http://localhost:4173", trace: "retain-on-failure", hasTouch: true },
  projects: [
    { name: "telefono", use: { viewport: { width: 390, height: 844 }, isMobile: true } },
    { name: "piccolo", use: { viewport: { width: 360, height: 640 }, isMobile: true } },
    { name: "iphone", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: true,
  },
});
