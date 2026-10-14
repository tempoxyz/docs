import { expect, test } from '@playwright/test'
import { expectDemoSuccess, getDemoStep } from './helpers'

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
  await expectDemoSuccess(page, transfersLink)
  await expect(transfersLink).toHaveAttribute(
    'href',
    'https://explore.testnet.tempo.xyz/address/0xbeefcafe54750903ac1c8909323af7beb21ea2cb?tab=transfers',
  )
})

test('fund a connected passkey wallet via faucet', async ({ page }) => {
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
    await page.goto('/docs/quickstart/faucet')

    const tab = page.getByRole('tab', { name: 'Fund your wallet' })
    await expect(tab).toBeVisible({ timeout: 90000 })
    await tab.click()

    const connectStep = getDemoStep(page, 'Connect your wallet.')
    const connectButton = connectStep.getByRole('button').first()
    await expect(connectButton).toBeVisible({ timeout: 30000 })
    await expect(connectButton).toBeEnabled()
    await connectButton.click()

    await expect(connectStep.getByRole('button', { name: 'Disconnect' })).toBeVisible({
      timeout: 30000,
    })

    // Request funds once the demo's initial balance reads finish, as a reader would, so the
    // faucet call doesn't compete with them for the public RPC's per-client rate limit.
    const balances = page.getByText('Personal balances', { exact: true }).locator('..')
    for (const symbol of ['OUSD', 'PathUSD', 'AlphaUSD', 'BetaUSD', 'ThetaUSD'])
      await expect(balances).toContainText(symbol, { timeout: 30000 })

    const addFundsStep = getDemoStep(page, 'Add testnet funds to your wallet.')
    const addFundsButton = addFundsStep.getByRole('button', { name: 'Add funds' })
    await expect(addFundsButton).toBeVisible({ timeout: 30000 })
    await expect(addFundsButton).toBeEnabled()
    await addFundsButton.click()

    // A faucet or RPC failure shows in the step; report it instead of waiting out the timeout.
    await expectDemoSuccess(
      page,
      addFundsStep.getByRole('button', { name: 'Add more funds' }),
      120000,
    )
  } finally {
    await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId }).catch(() => {})
  }
})
