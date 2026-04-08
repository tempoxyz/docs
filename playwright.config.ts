import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const webServerUrl = isCI ? 'http://127.0.0.1:5173' : 'https://localhost:5173'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 1, // Retry once due to testnet flakiness
  workers: isCI ? 4 : undefined,
  timeout: 180000, // 3 min default timeout for testnet transactions
  reporter: 'html',
  use: {
    baseURL: webServerUrl,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: isCI ? 'VITE_E2E=true VITE_USE_HTTP=true pnpm run dev' : 'pnpm run dev 2>/dev/null',
    url: webServerUrl,
    ignoreHTTPSErrors: true,
    reuseExistingServer: !isCI,
    stdout: 'ignore',
    stderr: 'ignore',
  },
})
