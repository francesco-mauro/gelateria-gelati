// La configurazione di Vite: nessun plugin. Le prove unitarie stanno in tests/unit (vitest), quelle nel browser in
// tests/e2e (Playwright, file .e2e.ts, che vitest non deve prendere).
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: { chunkSizeWarningLimit: 2000 },
  test: { include: ["tests/unit/**/*.test.ts"] },
});
