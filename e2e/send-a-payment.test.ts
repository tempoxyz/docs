import { expect, test } from '@playwright/test'
import { getDemoStep } from './helpers'

test('send a payment', async ({ page }) => {
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

  await page.goto('/guide/payments/send-a-payment')

  // Step 1: Sign in
  const signUpButton = page.getByRole('button', { name: 'Sign in' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
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
    timeout: 90000,
  })

  // Step 3: Send payment
  const sendPaymentStep = getDemoStep(page, 'Send 100 AlphaUSD to a recipient.')
  const enterDetailsButton = sendPaymentStep.getByRole('button', { name: 'Enter details' })
  await expect(enterDetailsButton).toBeVisible()
  await enterDetailsButton.click()

  // Fill in optional memo
  const memoInput = page.getByLabel('Memo (optional)').first()
  await expect(memoInput).toBeVisible()
  await memoInput.fill('test-memo')

  // Click send
  const sendButton = sendPaymentStep.getByRole('button', { name: 'Send' })
  await sendButton.click()

  // Wait for transaction receipt link
  await expect(page.getByRole('link', { name: 'View receipt' })).toBeVisible({ timeout: 90000 })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
