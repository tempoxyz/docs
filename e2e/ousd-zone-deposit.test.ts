import { expect, test } from '@playwright/test'
import { getZoneTransportConfig, stripRpcBasicAuth, ZONE_A } from '../src/lib/private-zones'
import { getDemoStep } from './helpers'

test('deposit OUSD into Zone A with a passkey', async ({ page }) => {
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

  // The E2E connector routes private RPC requests through this same-origin URL.
  await page.route('**/__e2e_zone_rpc/6', async (route) => {
    const url = stripRpcBasicAuth(ZONE_A.rpcUrl)
    const request = route.request()
    const init = await getZoneTransportConfig(ZONE_A.rpcUrl)?.onFetchRequest?.(new Request(url), {
      headers: await request.allHeaders(),
    })
    const headers = new Headers(init?.headers)
    headers.delete('host')
    headers.delete('origin')
    const response = await route.fetch({ url, headers: Object.fromEntries(headers) })
    await route.fulfill({ response })
  })

  try {
    await page.goto('/docs/guide/private-zones/deposit-to-a-zone')
    await page.getByRole('button', { name: 'Sign up', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible({
      timeout: 30_000,
    })
    await page.getByRole('button', { name: 'Authorize Zone A reads', exact: true }).click()
    await page.getByRole('button', { name: 'Get testnet OUSD', exact: true }).click()
    await page.getByRole('button', { name: 'Deposit 100 OUSD', exact: true }).click({
      timeout: 60_000,
    })
    await expect(getDemoStep(page, 'Wait for Zone A to credit the deposit.')).toHaveAttribute(
      'data-completed',
      'true',
      { timeout: 90_000 },
    )
  } finally {
    await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId }).catch(() => {})
  }
})
