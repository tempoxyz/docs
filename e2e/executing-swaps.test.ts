import { expectDemoSuccess } from './helpers'
import { expect, test } from './live'
import { seedTempoIdSession } from './tempo-id'

test('executing swaps', async ({ page }) => {
  test.setTimeout(180000)

  // Sign in to Tempo ID with a seeded session, since a test can't use its dialog.
  await seedTempoIdSession(page.context(), { baseURL: test.info().project.use.baseURL ?? '' })

  await page.goto('/docs/guide/stablecoin-dex/executing-swaps')

  // Step 1: Sign in
  const signUpButton = page.getByRole('button', { name: 'Sign in' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })

  // Step 2: Add funds
  const addFundsButton = page.getByRole('button', { name: 'Add funds' }).first()
  await expect(addFundsButton).toBeVisible()
  await addFundsButton.click()

  await expectDemoSuccess(page, page.getByRole('button', { name: 'Add more funds' }).first())

  // Step 3: Execute a swap (Buy AlphaUSD with BetaUSD)
  const buyButton = page.getByRole('button', { name: 'Buy' }).first()
  await expect(buyButton).toBeVisible()
  await buyButton.click()

  // Wait for swap receipt
  await expectDemoSuccess(page, page.getByRole('link', { name: 'View receipt' }))
})
