import { expect, test } from '@playwright/test'

test('prepare zone balance and send tokens within Zone A', async ({ page }) => {
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

  await page.goto('/guide/private-zones/send-tokens-within-a-zone')

  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })

  const getFundsButton = page.getByRole('button', { name: 'Get testnet PathUSD' }).first()
  const topUpButton = page
    .getByRole('button', {
      name: /^(Approve \+ top up|Top up) Zone A$/,
    })
    .first()
  const sendButton = page.getByRole('button', { name: 'Send 25 PathUSD' }).first()

  await expect
    .poll(
      async () =>
        (await getFundsButton.isVisible()) ||
        (await topUpButton.isVisible()) ||
        (await sendButton.isVisible()),
      { timeout: 90000 },
    )
    .toBe(true)

  if (await getFundsButton.isVisible()) {
    await getFundsButton.click()
    await expect(topUpButton).toBeVisible({ timeout: 90000 })
  }

  if (await topUpButton.isVisible()) await topUpButton.click()
  await expect(sendButton).toBeVisible({ timeout: 120000 })

  await sendButton.click()

  await expect(
    page
      .locator('div[data-completed="true"]', {
        has: page.getByText('Wait for the Zone A balance to reflect the transfer.'),
      })
      .first(),
  ).toBeVisible({ timeout: 120000 })

  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
