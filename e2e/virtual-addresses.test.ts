import { expect, test } from '@playwright/test'

test('virtual addresses guide signs in and starts master registration', async ({ page }) => {
  test.setTimeout(150000)

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
    await page.goto('/guide/use-accounts/embed-passkeys')

    const passkeySignUpButton = page.getByRole('button', { name: 'Sign up' }).first()
    await expect(passkeySignUpButton).toBeVisible({ timeout: 90000 })
    await passkeySignUpButton.click()

    await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
      timeout: 30000,
    })

    await page.goto('/guide/payments/virtual-addresses')

    await expect(
      page.getByRole('heading', { name: 'Use virtual addresses for deposits' }),
    ).toBeVisible()
    await page.getByRole('tab', { name: 'Real registration' }).click()
    await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
      timeout: 30000,
    })
    await expect(page.getByText('Connected passkey account')).toBeVisible()

    const registerButton = page.getByRole('button', { name: 'Register master id' }).first()
    await expect(registerButton).toBeVisible()
    await registerButton.click()

    await expect
      .poll(
        async () => {
          if (await page.getByRole('button', { name: 'Mining salt…' }).first().isVisible()) {
            return 'mining'
          }
          if (await page.getByRole('button', { name: 'Confirm passkey…' }).first().isVisible()) {
            return 'confirm'
          }
          if (await page.getByRole('button', { name: 'Registering…' }).first().isVisible()) {
            return 'registering'
          }
          if (await page.getByText('registration tx:').isVisible()) return 'registered'
          return null
        },
        {
          timeout: 30000,
        },
      )
      .not.toBeNull()

    await expect
      .poll(
        async () => {
          if (await page.getByText('hashes tried:').isVisible()) return 'mining'
          if (
            await page
              .getByText('Waiting for the registration transaction to be confirmed.')
              .isVisible()
          ) {
            return 'found'
          }
          if (await page.getByText('registration tx:').isVisible()) return 'registered'
          return null
        },
        { timeout: 30000 },
      )
      .not.toBeNull()
  } finally {
    await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId }).catch(() => {})
  }
})
