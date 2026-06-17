import { expect, test } from '@playwright/test'
import { authorizeAndWaitForEnabledAction } from './private-zone-actions'

test('swap pathUSD from Zone A into betaUSD on Zone B', async ({ page }) => {
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

  await page.goto('/guide/private-zones/swap-across-zones')

  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })

  const authorizeSourceButton = page
    .getByRole('button', { name: /^Authoriz(?:e|ing) Zone A reads$/i })
    .first()

  const getFundsButton = page.getByRole('button', { name: /^Get testnet pathUSD$/i }).first()
  const topUpButton = page.getByRole('button', { name: /^Approve \+ top up Zone A$/i }).first()

  const initialAction = await authorizeAndWaitForEnabledAction(
    { locator: authorizeSourceButton, name: 'authorize-source' },
    [
      { locator: getFundsButton, name: 'fund' },
      { locator: topUpButton, name: 'top-up' },
    ],
  )

  if (initialAction.name === 'fund') {
    await initialAction.locator.click()
    await expect(topUpButton).toBeEnabled({ timeout: 90000 })
  }

  if ((await topUpButton.isVisible()) && (await topUpButton.isEnabled())) {
    await topUpButton.click()
  }

  await expect(page.getByRole('link', { name: 'View receipt' }).first()).toBeVisible({
    timeout: 120000,
  })
  await expect(
    page
      .getByText('Withdraw 25 pathUSD from Zone A, swap it, and route betaUSD into Zone B.')
      .first(),
  ).toBeVisible()

  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
