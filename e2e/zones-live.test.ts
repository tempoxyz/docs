import { expect, type Page, test } from '@playwright/test'
import { getDemoStep } from './helpers'

// Opt in explicitly: these checks create a fresh passkey and spend only faucet-funded testnet assets.
test.skip(process.env.ZONES_LIVE_E2E !== 'true', 'Requires the live Moderato Zones sandbox')

test('Zones demos complete using an isolated faucet-funded passkey', async ({ page }) => {
  page.setDefaultTimeout(30_000)
  test.setTimeout(600_000)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  })
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  let keyServiceRequestCount = 0
  page.on('request', (request) => {
    if (new URL(request.url()).hostname === 'keys.tempo.xyz') keyServiceRequestCount += 1
  })
  const confirmations: Record<string, unknown>[] = []
  const pendingConfirmations = new Set<Promise<void>>()
  page.on('response', (response) => {
    const capture = (async () => {
      try {
        const request = response.request()
        if (request.method() !== 'POST') return
        const payload = request.postDataJSON()
        const calls = Array.isArray(payload) ? payload : [payload]
        const receiptMethods = new Set(['eth_getTransactionReceipt', 'eth_sendRawTransactionSync'])
        if (!calls.some((call) => receiptMethods.has(call?.method))) return
        const body = await response.json()
        const replies = Array.isArray(body) ? body : [body]
        const url = new URL(response.url())
        for (const reply of replies) {
          const method = calls.find((call) => call?.id === reply?.id)?.method
          const receipt = reply?.result
          if (!receiptMethods.has(method) || !receipt?.transactionHash) continue
          // Record only confirmation metadata, never headers, tokens, or signed requests.
          confirmations.push({
            observedAt: new Date().toISOString(),
            page: new URL(page.url()).pathname,
            transport: url.pathname.endsWith('/api/zone-rpc')
              ? `docs relay: Zone ${url.searchParams.get('zone')}`
              : url.hostname,
            method,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            status: receipt.status,
          })
        }
      } catch {
        // Non-RPC responses and navigation-cancelled reads provide no receipt evidence.
      }
    })()
    pendingConfirmations.add(capture)
    void capture.finally(() => pendingConfirmations.delete(capture))
  })

  try {
    await page.goto('/docs/guide/private-zones/deposit-to-a-zone')
    await test.step('Normal passkey signup and existing-account sign-in restore the same account', async () => {
      // This suite intentionally runs against Vite, so inspect the app's actual configuration
      // rather than allowing the VITE_E2E connector replacement to silently pass again.
      const connectorIds = await page.evaluate(async () => {
        const configModule = '/src/wagmi.config.ts'
        const { getConfig } = await import(configModule)
        return getConfig().connectors.map((connector: { id: string }) => connector.id)
      })
      expect(connectorIds).toEqual(expect.arrayContaining(['xyz.tempo', 'webAuthn']))

      await page.getByRole('button', { name: 'Sign up', exact: true }).first().click()
      await expect(page.getByRole('button', { name: 'Sign out', exact: true }).first()).toBeVisible(
        {
          timeout: 30_000,
        },
      )
      const registeredAddress = await copyAccountAddress(page)

      await page.getByRole('button', { name: 'Sign out', exact: true }).first().click()
      await expect(page.getByRole('button', { name: 'Sign in', exact: true }).first()).toBeVisible()
      await page.reload()
      await page.getByRole('button', { name: 'Sign in', exact: true }).first().click()
      await expect(page.getByRole('button', { name: 'Sign out', exact: true }).first()).toBeVisible(
        {
          timeout: 30_000,
        },
      )
      expect(await copyAccountAddress(page)).toBe(registeredAddress)
      // The hosted ceremony's RP is tempo.xyz. Localhost intentionally uses the SDK's
      // local ceremony, including persisted credential lookup after a page reload.
      expect(keyServiceRequestCount).toBe(0)
    })
    await authorize(page, 'Zone A')
    await page.getByRole('button', { name: 'Get testnet pathUSD', exact: true }).click()
    await test.step('Plaintext deposit credits Zone A', async () => {
      await page
        .getByRole('button', { name: 'Deposit 100 pathUSD', exact: true })
        .click({ timeout: 60_000 })
      await completed(page, 'Wait for Zone A to credit the deposit.')
    })
    await test.step('Encrypted deposit credits Zone A', async () => {
      await page.getByRole('button', { name: 'Encrypted', exact: true }).click()
      await page.getByRole('button', { name: 'Deposit 100 pathUSD', exact: true }).click()
      await completed(page, 'Wait for Zone A to credit the encrypted deposit.')
    })
    await test.step('Private transfer confirms on Zone A', async () => {
      await page.goto('/docs/guide/private-zones/send-tokens-within-a-zone')
      await page
        .getByRole('button', { name: 'Send 25 pathUSD', exact: true })
        .click({ timeout: 45_000 })
      await completed(page, 'Wait for Zone A to show the updated private balance.')
    })
    await test.step('Withdrawal settles to the public chain', async () => {
      await page.goto('/docs/guide/private-zones/withdraw-from-a-zone')
      await page
        .getByRole('button', { name: 'Withdraw 100 pathUSD', exact: true })
        .click({ timeout: 45_000 })
      await completed(page, 'Wait for pathUSD to settle back to your public balance.')
    })
    await test.step('Cross-zone send credits Zone B', async () => {
      await page.goto('/docs/guide/private-zones/send-tokens-across-zones')
      await authorize(page, 'Zone A and Zone B')
      await page
        .getByRole('button', { name: 'Send 25 pathUSD into Zone B', exact: true })
        .click({ timeout: 45_000 })
      await completed(page, 'Confirm the credited pathUSD balance in Zone B.')
    })
    await test.step('Cross-zone swap credits betaUSD in Zone B', async () => {
      await page.goto('/docs/guide/private-zones/swap-across-zones')
      await page
        .getByRole('button', { name: 'Swap 25 pathUSD into Zone B betaUSD', exact: true })
        .click({ timeout: 45_000 })
      await completed(page, 'Confirm the credited betaUSD balance in Zone B.')
    })
    await test.step('Authenticated withdrawal settles to the public chain', async () => {
      await page.goto('/docs/guide/private-zones/withdraw-from-a-zone')
      await page.getByRole('button', { name: 'Authenticated', exact: true }).click()
      await page
        .getByRole('button', { name: 'Approve + top up Zone A', exact: true })
        .click({ timeout: 45_000 })
      await page
        .getByRole('button', { name: 'Withdraw 100 pathUSD', exact: true })
        .click({ timeout: 45_000 })
      await completed(page, 'Wait for pathUSD to settle back to your public balance.')
    })
    await test.step('A repeat cross-zone send confirms its own deposit with prior Zone B funds', async () => {
      await page.goto('/docs/guide/private-zones/send-tokens-across-zones')
      await page
        .getByRole('button', { name: 'Approve + top up Zone A', exact: true })
        .click({ timeout: 45_000 })
      await expect(
        getDemoStep(page, 'Confirm the credited pathUSD balance in Zone B.'),
      ).toHaveAttribute('data-completed', 'false')
      await page
        .getByRole('button', { name: 'Send 25 pathUSD into Zone B', exact: true })
        .click({ timeout: 45_000 })
      await completed(page, 'Confirm the credited pathUSD balance in Zone B.')
    })
    expect(pageErrors).toEqual([])
    expect(keyServiceRequestCount).toBe(0)
  } finally {
    await Promise.all(pendingConfirmations)
    await test.info().attach('live-chain-confirmations.json', {
      body: JSON.stringify(confirmations, null, 2),
      contentType: 'application/json',
    })
    await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
  }
})

async function copyAccountAddress(page: Page) {
  const accountStep = getDemoStep(page, 'Create or use a passkey account on the public chain.')
  const addressButton = accountStep.getByRole('button', {
    name: /^0x[\da-f]{4}⋅⋅⋅[\da-f]{4}$/i,
  })
  // Clear first so a failed second copy cannot pass by reading the previous address.
  await page.evaluate(() => navigator.clipboard.writeText(''))
  await addressButton.click()
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toMatch(/^0x[\da-f]{40}$/i)
  return (await page.evaluate(() => navigator.clipboard.readText())).toLowerCase()
}

async function authorize(page: Page, zone: string) {
  await page
    .getByRole('button', { name: `Authorize ${zone} reads`, exact: true })
    .click({ timeout: 90_000 })
}

async function completed(page: Page, title: string) {
  await expect(getDemoStep(page, title)).toHaveAttribute('data-completed', 'true', {
    timeout: 90_000,
  })
}
