import { expect, test } from '@playwright/test'
import { expectDemoSuccess } from './helpers'

test('executing swaps', async ({ page }) => {
  test.setTimeout(180000)

  // Set up virtual authenticator via CDP
  const client = await page.context().newCDPSession(page)
  await client.send('WebAuthn.enable')
  const { authenticatorId } = await client.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  })

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

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
