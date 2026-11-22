import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 2,
  outputDir: join(tmpdir(), `shixu-tests-${process.pid}`),
  preserveOutput: "failures-only",
  use: {
    baseURL,
    viewport: { width: 1200, height: 820 },
    timezoneId: "Asia/Shanghai",
    reducedMotion: "reduce",
    testIdAttribute: "data-ocid",
  },
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 4173 --strictPort",
    url: baseURL,
    timeout: 30_000,
  },
});
