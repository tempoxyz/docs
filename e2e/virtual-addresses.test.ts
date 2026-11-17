import { selectTab } from './helpers'
import { expect, type Locator, type Page, test } from './live'
import { seedTempoIdSession } from './tempo-id'

async function openVirtualAddressesGuide(page: Page): Promise<Locator> {
  let lastError: unknown

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await page.goto('/docs/guide/payments/virtual-addresses', { waitUntil: 'domcontentloaded' })

      await expect(page.getByRole('heading', { name: 'Customer deposit addresses' })).toBeVisible({
        timeout: 30000,
      })

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

  // Sign in to Tempo ID with a seeded session, since a test can't use its dialog.
  await seedTempoIdSession(page.context(), { baseURL: test.info().project.use.baseURL ?? '' })

  const realRegistrationTab = await openVirtualAddressesGuide(page)
  await selectTab(realRegistrationTab)

  const signInButton = page.getByRole('button', { name: 'Sign in with Tempo' }).first()
  await expect(signInButton).toBeVisible({ timeout: 90000 })
  await signInButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })
  await expect(page.getByText('Connected Tempo Account')).toBeVisible()

  const registerButton = page.getByRole('button', { name: 'Register master id' }).first()
  await expect(registerButton).toBeVisible()
  await registerButton.click()

  await expect
    .poll(
      async () => {
        if (await page.getByRole('button', { name: 'Mining salt…' }).first().isVisible()) {
          return 'mining'
        }
        if (await page.getByRole('button', { name: 'Check Tempo…' }).first().isVisible()) {
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
})
