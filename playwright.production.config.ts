import { defineConfig, devices } from '@playwright/test'

// The upstream production server is started separately so this audit never
// replaces the developer's current server or rebuilds its output mid-test.
export default defineConfig({
  testDir: './e2e',
  testMatch: 'production-mount.test.ts',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
})
