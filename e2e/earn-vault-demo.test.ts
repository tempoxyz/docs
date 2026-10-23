import { expect, test } from '@playwright/test'
import { sentoraPathUsdVault } from '../src/components/guides/earn-vault-demo'

const vault = {
  id: sentoraPathUsdVault,
  verified: true,
  label: 'Sentora pathUSD (Earn)',
  assetToken: {
    address: '0x20c0000000000000000000000000000000000000',
    symbol: 'pathUSD',
    decimals: 6,
  },
  state: { depositsPaused: false },
  instantLiquidity: '1000000',
}

for (const width of [1296, 390]) {
  test(`shows only Sentora and never reads the directory at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    const requests: string[] = []
    await page.route('https://api.tempo.xyz/v1/earn/**', async (route) => {
      requests.push(route.request().url())
      await route.fulfill({ json: vault })
    })
    await page.goto('/docs/earn/vaults')
    const demo = page.getByTestId('earn-vault-demo')
    await expect(demo.getByTestId('earn-vault-details')).toBeVisible()
    await expect(demo).toContainText('Sentora pathUSD (Earn)')
    await expect(demo).toContainText(sentoraPathUsdVault)
    await expect(demo.locator('select')).toHaveCount(0)
    await demo.getByRole('button', { name: 'Refresh vault', exact: true }).click()
    await expect(demo.getByTestId('earn-vault-details')).toBeVisible()
    expect(requests.length).toBeGreaterThanOrEqual(2)
    for (const request of requests) {
      const url = new URL(request)
      expect(url.pathname).toBe(`/v1/earn/vaults/${sentoraPathUsdVault}`)
      expect(url.searchParams.get('chainId')).toBe('mainnet')
      expect(url.searchParams.has('cursor')).toBe(false)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('hides unexpected vault data and retries only the approved vault', async ({ page }) => {
  let valid = false
  await page.route('https://api.tempo.xyz/v1/earn/**', async (route) => {
    await route.fulfill({
      json: valid
        ? vault
        : { ...vault, id: '0x1234567890123456789012345678901234567890', label: 'Private vault' },
    })
  })
  await page.goto('/docs/earn/vaults')
  const demo = page.getByTestId('earn-vault-demo')
  await expect(demo.getByRole('alert')).toContainText(
    'Sentora pathUSD vault is currently unavailable',
  )
  await expect(demo.getByTestId('earn-vault-details')).toHaveCount(0)
  await expect(demo).not.toContainText('Private vault')
  valid = true
  await demo.getByRole('button', { name: 'Refresh vault', exact: true }).click()
  await expect(demo.getByTestId('earn-vault-details')).toBeVisible()
  await expect(demo.getByRole('alert')).toHaveCount(0)
})
