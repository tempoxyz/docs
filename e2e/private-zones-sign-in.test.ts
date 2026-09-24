import { expect, test } from '@playwright/test'

test('private zone guides sign in through the shared docs login', async ({ page }) => {
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

  try {
    await page.goto('/docs/guide/private-zones/deposit-to-a-zone')

    const accountStep = page
      .locator('[data-active][data-completed]')
      .filter({ hasText: 'Create or use a passkey account on the public chain.' })
      .first()
    await accountStep.getByRole('button', { name: 'Sign in' }).click()

    await expect(accountStep.getByRole('button', { name: 'Sign out' })).toBeVisible()
  } finally {
    await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId }).catch(() => {})
  }
})
