import { expect, test } from '@playwright/test'
import { getDemoStep } from './helpers'

test('fund an address via faucet', async ({ page }) => {
  test.setTimeout(120000)

  await page.goto('/docs/quickstart/faucet')

  // Switch to "Fund an address" tab
  const tab = page.getByRole('tab', { name: 'Fund an address' })
  await expect(tab).toBeVisible({ timeout: 90000 })
  await tab.click()

  // Enter an address
  const addressInput = page.getByPlaceholder('0x...')
  await addressInput.fill('0xbeefcafe54750903ac1c8909323af7beb21ea2cb')

  // Click "Add funds" button
  await page.getByRole('button', { name: 'Add funds' }).click()

  // Confirm the explorer link resolves to the funded account's transfers
  const transfersLink = page.getByRole('link', { name: 'View transfers' })
  await expect(transfersLink).toBeVisible({ timeout: 90000 })
  await expect(transfersLink).toHaveAttribute(
    'href',
    'https://explore.testnet.tempo.xyz/address/0xbeefcafe54750903ac1c8909323af7beb21ea2cb?tab=transfers',
  )
})

test('fund a connected passkey wallet and send a first payment', async ({ page }) => {
  test.setTimeout(300000)

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
    await page.goto('/docs/quickstart/faucet')

    const tab = page.getByRole('tab', { name: 'Fund your wallet' })
    await expect(tab).toBeVisible({ timeout: 90000 })
    await tab.click()

    const connectStep = page
      .locator('[data-active][data-completed]')
      .filter({ hasText: 'Connect your wallet.' })
      .first()
    const connectButton = connectStep.getByRole('button').first()
    await expect(connectButton).toBeVisible({ timeout: 30000 })
    await expect(connectButton).toBeEnabled()
    await connectButton.click()

    await expect(connectStep.getByRole('button', { name: 'Disconnect' })).toBeVisible({
      timeout: 30000,
    })

    const addFundsStep = page
      .locator('[data-active][data-completed]')
      .filter({ hasText: 'Add testnet funds to your wallet.' })
      .first()
    const addFundsButton = addFundsStep.getByRole('button', { name: 'Add funds' })
    await expect(addFundsButton).toBeVisible({ timeout: 30000 })
    await expect(addFundsButton).toBeEnabled()
    await addFundsButton.click()

    await expect(addFundsStep.getByRole('button', { name: 'Add more funds' })).toBeVisible({
      timeout: 120000,
    })

    const handoff = page.getByRole('link', { name: 'Send your first testnet payment' })
    await expect(handoff).toBeVisible()
    await handoff.click()
    await expect(page).toHaveURL(/\/docs\/guide\/payments\/send-a-payment#send-payment-demo$/)

    const sendPaymentStep = getDemoStep(page, 'Send 100 AlphaUSD to a recipient.')
    const enterDetailsButton = sendPaymentStep.getByRole('button', { name: 'Enter details' })
    await expect(enterDetailsButton).toBeEnabled({ timeout: 90000 })
    await enterDetailsButton.click()
    await sendPaymentStep.getByRole('button', { name: 'Send' }).click()
    await expect(sendPaymentStep.getByRole('link', { name: 'View receipt' })).toBeVisible({
      timeout: 90000,
    })
  } finally {
    await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId }).catch(() => {})
  }
})
