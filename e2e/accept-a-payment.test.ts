import { expect, test } from '@playwright/test'

test('accept a payment', async ({ page }) => {
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

  await page.goto('/guide/payments/accept-a-payment')

  // Step 1: Sign up with passkey
  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  // Wait for page to fully initialize
  await page.waitForTimeout(1000)
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 60000,
  })

  // Step 2: Add funds (this is the last step - balance updates confirm receipt)
  const addFundsButton = page.getByRole('button', { name: 'Add funds' }).first()
  await expect(addFundsButton).toBeVisible()
  await addFundsButton.click()

  await expect(page.getByRole('button', { name: 'Add more funds' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
