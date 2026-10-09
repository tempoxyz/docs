import { defineConfig, devices } from '@playwright/test'

// These tests submit live testnet transactions; keep RPC concurrency bounded.
const liveTests = [
  'create-a-stablecoin',
  'executing-swaps',
  'faucet',
  'manage-stablecoin',
  'mint-stablecoins',
  'ousd-zone-deposit',
  'pay-with-ousd-fees',
  'providing-liquidity',
  'send-a-payment',
  'use-for-fees',
  'virtual-addresses',
  'zones-live',
].map((name) => `**/${name}.test.ts`)

const isCI = !!process.env.CI
const webServerUrl = isCI ? 'http://localhost:5173' : 'https://localhost:5173'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 1, // Retry once due to testnet flakiness
  workers: isCI ? 2 : undefined,
  maxFailures: isCI ? 1 : undefined,
  timeout: 180000, // 3 min default timeout for testnet transactions
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: webServerUrl,
    actionTimeout: 15000,
    navigationTimeout: 30000,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium-live',
      testMatch: liveTests,
      workers: 1,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      testIgnore: liveTests,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: isCI
      ? 'PORT=5173 VITE_E2E=true VITE_USE_HTTP=true node dist/preview.js'
      : 'pnpm run dev 2>/dev/null',
    url: webServerUrl,
    ignoreHTTPSErrors: true,
    reuseExistingServer: !isCI,
    stdout: 'ignore',
    stderr: 'ignore',
  },
})
