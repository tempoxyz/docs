import { expect, test } from '@playwright/test'

test('send pathUSD from Zone A into Zone B', async ({ page }) => {
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

  await page.goto('/guide/private-zones/send-tokens-across-zones')

  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })

  const authorizeSourceButton = page
    .getByRole('button', { name: /^Authoriz(?:e|ing) Zone A reads$/i })
    .first()
  await expect(authorizeSourceButton).toBeVisible({ timeout: 30000 })
  await expect(authorizeSourceButton).toBeEnabled({ timeout: 90000 })
  await authorizeSourceButton.click()

  const getFundsButton = page.getByRole('button', { name: /^Get testnet pathUSD$/i }).first()
  const topUpButton = page.getByRole('button', { name: /^Approve \+ top up Zone A$/i }).first()
  const sendButton = page.getByRole('button', { name: /^Send 25 pathUSD into Zone B$/i }).first()
  const authorizeTargetButton = page
    .getByRole('button', { name: /^Authoriz(?:e|ing) Zone B reads$/i })
    .first()

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
    await expect
      .poll(async () => (await topUpButton.isVisible()) || (await sendButton.isVisible()), {
        timeout: 90000,
      })
      .toBe(true)
  }

  if (await topUpButton.isVisible()) {
    await topUpButton.click()
  }

  await expect(sendButton).toBeVisible({ timeout: 120000 })
  await sendButton.click()

  await expect(authorizeTargetButton).toBeVisible({ timeout: 120000 })
  await expect(authorizeTargetButton).toBeEnabled({ timeout: 90000 })
  await authorizeTargetButton.click()

  await expect(
    page
      .locator('div[data-completed="true"]', {
        has: page.getByText('Authorize private reads in Zone B and confirm the pathUSD balance.'),
      })
      .first(),
  ).toBeVisible({ timeout: 120000 })

  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
