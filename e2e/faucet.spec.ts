import { expect, test } from '@playwright/test'

// Skip: This test depends on external faucet service and is flaky in CI
// TODO: Mock the faucet response or increase timeout
test.skip('fund an address via faucet', async ({ page }) => {
  await page.goto('/quickstart/faucet')

  // Switch to "Fund an address" tab
  await page.getByRole('tab', { name: 'Fund an address' }).click()

  // Enter an address
  const addressInput = page.getByPlaceholder('0x...')
  await addressInput.fill('0xbeefcafe54750903ac1c8909323af7beb21ea2cb')

  // Click "Add funds" button
  await page.getByRole('button', { name: 'Add funds' }).click()

  // Confirm "View receipt" link is visible
  await expect(page.getByRole('link', { name: 'View receipt' })).toBeVisible({ timeout: 30000 })
})
