import { expect, test } from '@playwright/test'

test('send parallel transactions', async ({ page }) => {
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

  await page.goto('/guide/payments/send-parallel-transactions')

  // Step 1: Sign up with passkey
  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })

  // Wait a moment for the page to fully initialize
  await page.waitForTimeout(1000)

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

  // Step 3: Send parallel payments
  const enterDetailsButton = page.getByRole('button', { name: 'Enter details' }).first()
  await expect(enterDetailsButton).toBeVisible()
  await enterDetailsButton.click()

  // Click send both payments
  const sendBothButton = page.getByRole('button', { name: 'Send both payments' })
  await expect(sendBothButton).toBeVisible()
  await sendBothButton.click()

  // Wait for both transaction receipt links
  await expect(page.getByRole('link', { name: 'View receipt' }).first()).toBeVisible({
    timeout: 90000,
  })
  await expect(page.getByRole('link', { name: 'View receipt' }).nth(1)).toBeVisible({
    timeout: 90000,
  })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
