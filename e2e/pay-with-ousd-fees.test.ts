import { expectDemoSuccess, getDemoStep } from './helpers'
import { expect, test } from './live'

test('send a payment with OUSD fees', async ({ page }) => {
  await page.goto('/docs/guide/payments/pay-fees-in-any-stablecoin')
  await page.getByRole('button', { name: 'Sign in' }).first().click()
  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30_000,
  })
  await page.getByRole('button', { name: 'Add funds', exact: true }).first().click()
  await expectDemoSuccess(page, page.getByRole('button', { name: 'Add more funds' }).first())

  const payment = getDemoStep(page, /Send 100 AlphaUSD and pay fees in/)
  const details = payment.getByRole('button', { name: 'Enter details' })
  await expect(details).toBeEnabled({ timeout: 30_000 })
  await details.click()
  await expect(payment.locator('select[name="feeToken"]')).toHaveValue(
    '0x20c0000000000000000000006a37da5c996874be',
  )
  await payment.getByRole('button', { name: 'Send', exact: true }).click()
  await expectDemoSuccess(page, payment.getByRole('link', { name: 'View receipt' }))
})
