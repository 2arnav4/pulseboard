import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

/**
 * E2E runs against a production build with every external API mocked (MOCK_APIS=1)
 * and the in-memory user store (empty DATABASE_URL), so runs are deterministic and free.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /responsive\.spec\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /responsive\.spec\.ts/ },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `${baseURL}/login`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      MOCK_APIS: "1",
      DATABASE_URL: "",
      NEWS_API_KEY: "",
      TMDB_API_KEY: "",
      AUTH_SECRET: "e2e-test-secret-not-used-in-production-0123456789",
      AUTH_TRUST_HOST: "true",
    },
  },
});
