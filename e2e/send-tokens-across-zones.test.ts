import { expect, test } from '@playwright/test'

test('send PathUSD from Zone A into Zone B without a spurious Zone B auth error', async ({
  page,
}) => {
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
    await page.goto('/guide/private-zones/send-tokens-across-zones')

    const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
    await expect(signUpButton).toBeVisible({ timeout: 90000 })
    await signUpButton.click()

    await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
      timeout: 30000,
    })

    const authorizeZoneAButton = page
      .getByRole('button', { name: 'Authorize Zone A reads' })
      .first()
    const getFundsButton = page.getByRole('button', { name: 'Get testnet PathUSD' }).first()
    const topUpButton = page
      .getByRole('button', {
        name: /^(Approve \+ top up|Top up) Zone A$/,
      })
      .first()
    const sendButton = page.getByRole('button', { name: 'Send 25 PathUSD into Zone B' }).first()
    const waitingForZoneBDeposit = page.getByText(
      'Wait for the routed pathUSD deposit to land in Zone B.',
      { exact: true },
    )
    const httpError = page.getByText('HTTP request failed.', { exact: true })

    await expect
      .poll(
        async () =>
          (await authorizeZoneAButton.isVisible()) ||
          (await getFundsButton.isVisible()) ||
          (await topUpButton.isVisible()) ||
          (await sendButton.isVisible()),
        { timeout: 90000 },
      )
      .toBe(true)

    if (await authorizeZoneAButton.isVisible()) {
      await authorizeZoneAButton.click()
      await expect
        .poll(
          async () =>
            (await getFundsButton.isVisible()) ||
            (await topUpButton.isVisible()) ||
            (await sendButton.isVisible()),
          { timeout: 90000 },
        )
        .toBe(true)
    }

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

    await expect(waitingForZoneBDeposit).toBeVisible({ timeout: 120000 })

    for (let index = 0; index < 30; index++) {
      await expect(httpError).toHaveCount(0)
      await page.waitForTimeout(1000)
    }
  } finally {
    await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
  }
})
