import { expect, test } from '@playwright/test'
import { getDemoStep } from './helpers'

test('send a payment with OUSD fees', async ({ page }) => {
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
    await page.goto('/docs/guide/payments/pay-fees-in-any-stablecoin')
    await page.getByRole('button', { name: 'Sign in' }).first().click()
    await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
      timeout: 30_000,
    })
    await page.getByRole('button', { name: 'Add funds', exact: true }).first().click()
    await expect(page.getByRole('button', { name: 'Add more funds' }).first()).toBeVisible({
      timeout: 90_000,
    })

    const payment = getDemoStep(page, /Send 100 AlphaUSD and pay fees in/)
    const details = payment.getByRole('button', { name: 'Enter details' })
    await expect(details).toBeEnabled({ timeout: 30_000 })
    await details.click()
    await expect(payment.locator('select[name="feeToken"]')).toHaveValue(
      '0x20c0000000000000000000006a37da5c996874be',
    )
    await payment.getByRole('button', { name: 'Send', exact: true }).click()
    await expect(payment.getByRole('link', { name: 'View receipt' })).toBeVisible({
      timeout: 90_000,
    })
  } finally {
    await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId }).catch(() => {})
  }
})
