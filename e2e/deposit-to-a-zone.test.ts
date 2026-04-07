import { expect, test } from '@playwright/test'

test('prepare zone access and deposit to Zone A', async ({ page }) => {
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

  await page.goto('/guide/private-zones/deposit-to-a-zone')

  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })

  const getFundsButton = page.getByRole('button', { name: 'Get testnet PathUSD' }).first()
  const depositButton = page
    .getByRole('button', { name: /^(Approve \+ deposit|Deposit) 100 PathUSD$/ })
    .first()

  if (await getFundsButton.isVisible()) {
    await getFundsButton.click()
    await expect(depositButton).toBeVisible({ timeout: 90000 })
  }

  await depositButton.click()

  await expect(
    page
      .locator('div[data-completed="true"]', {
        has: page.getByText('Poll Zone A until the batched deposit is reflected.'),
      })
      .first(),
  ).toBeVisible({ timeout: 120000 })

  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
