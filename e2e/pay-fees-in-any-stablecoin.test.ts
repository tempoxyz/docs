import { expect, test } from '@playwright/test'

test('pay fees in any stablecoin', async ({ page }) => {
  test.setTimeout(120000)

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

  await page.goto('/guide/payments/pay-fees-in-any-stablecoin')

  // Step 1: Sign up with passkey
  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 60000,
  })

  // Step 2: Add funds
  const addFundsButton = page.getByRole('button', { name: 'Add funds' }).first()
  await expect(addFundsButton).toBeVisible()
  await addFundsButton.click()

  await expect(page.getByRole('button', { name: 'Add more funds' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 3: Pay with fee token
  const enterDetailsButton = page.getByRole('button', { name: 'Enter details' }).first()
  await expect(enterDetailsButton).toBeVisible()
  await enterDetailsButton.click()

  const sendButton = page.getByRole('button', { name: 'Send' }).first()
  await sendButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' })).toBeVisible({ timeout: 90000 })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
