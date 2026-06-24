import { expect, test } from '@playwright/test'

test('fund an address via faucet', async ({ page }) => {
  test.setTimeout(120000)

  await page.goto('/docs/quickstart/faucet')

  // Switch to "Fund an address" tab
  const tab = page.getByRole('tab', { name: 'Fund an address' })
  await expect(tab).toBeVisible({ timeout: 90000 })
  await tab.click()

  // Enter an address
  const addressInput = page.getByPlaceholder('0x...')
  await addressInput.fill('0xbeefcafe54750903ac1c8909323af7beb21ea2cb')

  // Click "Add funds" button
  await page.getByRole('button', { name: 'Add funds' }).click()

  // Confirm the explorer link resolves to the funded account's transfers
  const transfersLink = page.getByRole('link', { name: 'View transfers' })
  await expect(transfersLink).toBeVisible({ timeout: 90000 })
  await expect(transfersLink).toHaveAttribute(
    'href',
    'https://explore.testnet.tempo.xyz/address/0xbeefcafe54750903ac1c8909323af7beb21ea2cb?tab=transfers',
  )
})
