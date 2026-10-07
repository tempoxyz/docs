import { defineConfig, devices } from '@playwright/test'

// Run with: ZONES_LIVE_E2E=true pnpm exec playwright test --config playwright.zones.config.ts
// Starts a fresh isolated server using the normal connector configuration.
// The test supplies virtual passkey hardware; the app chooses its real localhost ceremony.
export default defineConfig({
  testDir: './e2e',
  testMatch: 'zones-live.test.ts',
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:5174',
    actionTimeout: 30_000,
    permissions: ['clipboard-read', 'clipboard-write'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'VITE_E2E=false VITE_USE_HTTP=true pnpm dev --port 5174 --strictPort',
    url: 'http://localhost:5174',
    reuseExistingServer: false,
  },
})
