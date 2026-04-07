import { expect, test } from '@playwright/test'

test.describe.configure({ retries: 0, timeout: 120000 })

test('prepare zone balance and withdraw from Zone A', async ({ page }) => {
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

  const getFundsButton = page.getByRole('button', { name: 'Get testnet PathUSD' }).first()
  const topUpButton = page
    .getByRole('button', {
      name: /^(Approve \+ top up|Top up) Zone A$/,
    })
    .first()
  const withdrawButton = page
    .getByRole('button', { name: /^(Approve \+ withdraw|Withdraw) 100 PathUSD$/ })
    .first()

  await expect(getFundsButton).toBeVisible({ timeout: 20000 })
  await getFundsButton.click()
  await expect(topUpButton).toBeVisible({ timeout: 45000 })

  await topUpButton.click()
  await expect(withdrawButton).toBeVisible({ timeout: 45000 })

  await withdrawButton.click()

  await expect(
    page
      .locator('div[data-completed="true"]', {
        has: page.getByText('Wait for PathUSD to arrive on Moderato.'),
      })
      .first(),
  ).toBeVisible({
    timeout: 45000,
  })

  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
