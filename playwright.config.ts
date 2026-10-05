import { defineConfig, devices } from '@playwright/test'

// Los tests se ejecutan siempre contra los adaptadores locales.
// El servidor de desarrollo lo arranca el usuario (`pnpm dev`); en CI se levanta con `webServer`.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'android-360',
      use: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 740 } },
    },
    { name: 'iphone', use: { ...devices['iPhone 15'] } },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: process.env.CI
    ? {
        command: 'pnpm build && pnpm preview',
        url: baseURL,
        env: { DATA_ADAPTER: 'local', AUTH_ADAPTER: 'dev', NOTIFIER_ADAPTER: 'console' },
      }
    : undefined,
})
