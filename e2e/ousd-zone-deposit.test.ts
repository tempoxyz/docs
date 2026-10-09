import { expect, test } from '@playwright/test'
import { ZoneRpcAuthentication } from 'ox/tempo'
import { POST } from '../src/pages/_api/api/zone-rpc'
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

  // The static preview does not serve API routes; run the actual relay handler.
  await page.route('**/api/zone-rpc?zone=6', async (route) => {
    const request = route.request()
    const headers = await request.allHeaders()
    const token = headers['x-authorization-token'] as `0x${string}`
    expect(ZoneRpcAuthentication.deserialize(token).zoneId).toBe(6)
    const response = await POST(
      new Request(request.url(), {
        method: request.method(),
        headers,
        body: request.postData(),
      }),
    )
    await route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
    })
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
