import { expect, test } from '@playwright/test'

test.describe.configure({ retries: 0, timeout: 120000 })

test('prepare zone balance and withdraw from Zone A', async ({ page }) => {
  test.setTimeout(180000)

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

  await page.goto('/guide/private-zones/withdraw-from-a-zone')

  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 45000 })
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 20000,
  })

  const authorizeButton = page.getByRole('button', { name: 'Authorize Zone A reads' }).first()
  await expect(authorizeButton).toBeVisible({ timeout: 30000 })
  await authorizeButton.click()

  const getFundsButton = page.getByRole('button', { name: /^Get testnet pathUSD$/i }).first()
  const topUpButton = page.getByRole('button', { name: /^Approve \+ top up Zone A$/i }).first()
  const withdrawButton = page.getByRole('button', { name: /^Withdraw 100 pathUSD$/i }).first()

  await expect
    .poll(
      async () =>
        (await getFundsButton.isVisible()) ||
        (await topUpButton.isVisible()) ||
        (await withdrawButton.isVisible()),
      { timeout: 90000 },
    )
    .toBe(true)

  if (await getFundsButton.isVisible()) {
    await getFundsButton.click()
    await expect
      .poll(async () => (await topUpButton.isVisible()) || (await withdrawButton.isVisible()), {
        timeout: 90000,
      })
      .toBe(true)
  }

  if (await topUpButton.isVisible()) {
    await topUpButton.click()
  }

  await expect(withdrawButton).toBeVisible({ timeout: 90000 })

  await withdrawButton.click()

  await expect(
    page
      .locator('div[data-completed="true"]', {
        has: page.getByText('Wait for pathUSD to settle back to your public balance.'),
      })
      .first(),
  ).toBeVisible({
    timeout: 120000,
  })

  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
