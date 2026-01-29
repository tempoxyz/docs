import { expect, test } from '@playwright/test'

test('send a payment', async ({ page }) => {
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

  await page.goto('/guide/payments/send-a-payment')

  // Step 1: Sign up with passkey
  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 60000 })
  await signUpButton.click()

  // Wait for sign out button (indicates successful sign up)
  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })

  // Step 2: Add funds
  const addFundsButton = page.getByRole('button', { name: 'Add funds' }).first()
  await expect(addFundsButton).toBeVisible()
  await addFundsButton.click()

  // Wait for "Add more funds" button (indicates funds were added)
  await expect(page.getByRole('button', { name: 'Add more funds' }).first()).toBeVisible({
    timeout: 60000,
  })

  // Step 3: Send payment
  const enterDetailsButton = page.getByRole('button', { name: 'Enter details' }).first()
  await expect(enterDetailsButton).toBeVisible()
  await enterDetailsButton.click()

  // Fill in optional memo
  const memoInput = page.getByLabel('Memo (optional)').first()
  await expect(memoInput).toBeVisible()
  await memoInput.fill('test-memo')

  // Click send
  const sendButton = page.getByRole('button', { name: 'Send' }).first()
  await sendButton.click()

  // Wait for transaction receipt link
  await expect(page.getByRole('link', { name: 'View receipt' })).toBeVisible({ timeout: 60000 })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
