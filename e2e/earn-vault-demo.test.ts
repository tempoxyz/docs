import { expect, test } from '@playwright/test'
import { earnVaultForNetwork, sentoraPathUsdVault } from '../src/components/guides/earn-vault-demo'

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
  test(`defaults to Sentora and preserves approved network and vault dropdowns at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const requests: string[] = []
    await page.route('https://api.tempo.xyz/v1/earn/**', async (route) => {
      requests.push(route.request().url())
      const network =
        new URL(route.request().url()).searchParams.get('chainId') === 'testnet'
          ? 'testnet'
          : 'mainnet'
      await route.fulfill({ json: { ...vault, ...earnVaultForNetwork(network) } })
    })
    await page.goto('/docs/earn/vaults')
    const demo = page.getByTestId('earn-vault-demo')
    await expect(demo.getByLabel('Network', { exact: true })).toBeEnabled({ timeout: 30_000 })
    await expect(demo.getByTestId('earn-vault-details')).toBeVisible()
    await expect(demo).toContainText('Sentora pathUSD (Earn)')
    await expect(demo).toContainText(sentoraPathUsdVault)
    const network = demo.getByLabel('Network', { exact: true })
    const dropdown = demo.getByLabel('Vault', { exact: true })
    await expect(network).toHaveValue('mainnet')
    await expect(network.locator('option')).toHaveText(['Moderato testnet', 'Tempo mainnet'])
    await expect(dropdown).toHaveValue(sentoraPathUsdVault)
    await expect(dropdown.locator('option')).toHaveText(['Sentora pathUSD (Earn)'])
    await demo.getByRole('button', { name: 'Refresh vault', exact: true }).click()
    await expect(demo.getByTestId('earn-vault-details')).toBeVisible()
    await network.selectOption('testnet')
    const testnet = earnVaultForNetwork('testnet')
    await expect(dropdown).toHaveValue(testnet.id)
    await expect(dropdown.locator('option')).toHaveText(['pathUSD test vault'])
    await expect(demo.getByTestId('earn-vault-details')).toContainText(testnet.id)
    await expect(demo).not.toContainText(sentoraPathUsdVault)
    await network.selectOption('mainnet')
    await expect(dropdown).toHaveValue(sentoraPathUsdVault)
    await expect(demo.getByTestId('earn-vault-details')).toContainText(sentoraPathUsdVault)
    expect(requests.length).toBeGreaterThanOrEqual(4)
    for (const request of requests) {
      const url = new URL(request)
      const network = url.searchParams.get('chainId') === 'testnet' ? 'testnet' : 'mainnet'
      expect(url.pathname).toBe(`/v1/earn/vaults/${earnVaultForNetwork(network).id}`)
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
  await expect(demo.getByLabel('Network', { exact: true })).toBeEnabled({ timeout: 30_000 })
  await expect(demo.getByRole('alert')).toContainText('approved vault is currently unavailable')
  await expect(demo.getByTestId('earn-vault-details')).toHaveCount(0)
  await expect(demo).not.toContainText('Private vault')
  valid = true
  await demo.getByRole('button', { name: 'Refresh vault', exact: true }).click()
  await expect(demo.getByTestId('earn-vault-details')).toBeVisible()
  await expect(demo.getByRole('alert')).toHaveCount(0)
})
