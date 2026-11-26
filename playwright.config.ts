import { defineConfig, devices } from '@playwright/test';

// Smoke tests against a production build (`npm run build` first). Supabase is pointed at a
// closed local port, so the site exercises its fallback content and treats everyone as
// signed out. Build with the same env (see the e2e job in .github/workflows/node.js.yml).
const PORT = 3100;

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
  },
  projects: [{
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      // Cloud sessions ship a Chromium that may not match this Playwright version.
      launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
    },
  }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
