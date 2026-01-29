import { expect, test } from '@playwright/test'

test('providing liquidity - place and query order', async ({ page }) => {
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

  await page.goto('/guide/stablecoin-dex/providing-liquidity')

  // Step 1: Sign up with passkey
  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })

  // Step 2: Add funds
  const addFundsButton = page.getByRole('button', { name: 'Add funds' }).first()
  await expect(addFundsButton).toBeVisible()
  await addFundsButton.click()

  await expect(page.getByRole('button', { name: 'Add more funds' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 3: Place order
  const placeOrderButton = page.getByRole('button', { name: 'Place order' }).first()
  await expect(placeOrderButton).toBeVisible()
  await placeOrderButton.click()

  // Wait for order to be placed - should see View receipt
  await expect(page.getByRole('link', { name: 'View receipt' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 4: Query order - button should become enabled after placing
  const queryButton = page.getByRole('button', { name: 'Query' }).first()
  await expect(queryButton).toBeEnabled({ timeout: 30000 })
  await queryButton.click()

  // Wait for order details to show (order type indicator)
  await expect(page.getByText('Buy').first()).toBeVisible({ timeout: 30000 })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
