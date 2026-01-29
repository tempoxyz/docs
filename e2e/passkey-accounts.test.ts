import { expect, test } from '@playwright/test'

test('sign up, sign out, then sign in with passkey', async ({ page }) => {
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

  await page.goto('/guide/use-accounts/embed-passkeys')

  // Wait for the demo to load
  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 60000 })

  // Sign up with passkey
  await signUpButton.click()

  // Wait for sign out button (indicates successful sign up)
  const signOutButton = page.getByRole('button', { name: 'Sign out' }).first()
  await expect(signOutButton).toBeVisible({ timeout: 30000 })

  // Sign out
  await signOutButton.click()

  // Wait for sign in button to reappear
  const signInButton = page.getByRole('button', { name: 'Sign in' }).first()
  await expect(signInButton).toBeVisible({ timeout: 10000 })

  // Sign in with the same passkey
  await signInButton.click()

  // Confirm signed in again (sign out button visible)
  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
