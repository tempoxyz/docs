import { expect, test } from '@playwright/test'
import { authorizeAndWaitForEnabledAction } from './private-zone-actions'

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

  const authorizeButton = page
    .getByRole('button', { name: /^Authoriz(?:e|ing) Zone A reads$/i })
    .first()

  const getFundsButton = page.getByRole('button', { name: /^Get testnet pathUSD$/i }).first()
  const depositButton = page.getByRole('button', { name: /^Deposit 100 pathUSD$/i }).first()

  const initialAction = await authorizeAndWaitForEnabledAction(
    { locator: authorizeButton, name: 'authorize' },
    [
      { locator: getFundsButton, name: 'fund' },
      { locator: depositButton, name: 'deposit' },
    ],
  )

  if (initialAction.name === 'fund') {
    await initialAction.locator.click()
    await expect(depositButton).toBeEnabled({ timeout: 90000 })
  }

  await depositButton.click()
  await expect(page.getByRole('link', { name: 'View receipt' }).first()).toBeVisible({
    timeout: 120000,
  })
  await expect(page.getByText('Wait for Zone A to credit the deposit.').first()).toBeVisible()

  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
