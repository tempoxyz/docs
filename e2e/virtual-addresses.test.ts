import { expect, type Locator, type Page, test } from '@playwright/test'

async function openVirtualAddressesGuide(page: Page): Promise<Locator> {
  let lastError: unknown

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await page.goto('/docs/guide/payments/virtual-addresses', { waitUntil: 'domcontentloaded' })

      await expect(
        page.getByRole('heading', { name: 'Use virtual addresses for deposits' }),
      ).toBeVisible({ timeout: 30000 })

      const realRegistrationTab = page.getByRole('tab', { name: 'Real registration' })
      await expect(realRegistrationTab).toBeVisible({ timeout: 30000 })
      return realRegistrationTab
    } catch (error) {
      lastError = error

      if (attempt === 3) throw error

      // Vite can briefly serve SSR while client chunks are still re-optimizing in CI.
      await page.waitForTimeout(1000)
    }
  }

  throw lastError
}

test('virtual addresses guide signs in and starts master registration', async ({ page }) => {
  test.setTimeout(240000)

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
    const realRegistrationTab = await openVirtualAddressesGuide(page)
    await realRegistrationTab.click()

    const passkeySignUpButton = page.getByRole('button', { name: 'Sign up' }).first()
    await expect(passkeySignUpButton).toBeVisible({ timeout: 90000 })
    await passkeySignUpButton.click()

    await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
      timeout: 30000,
    })

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
