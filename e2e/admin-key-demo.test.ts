import { expect, test } from '@playwright/test'

function localhostDemo(baseURL: string | undefined) {
  const url = new URL('/docs/accounts/admin-keys#authorize-an-admin-key', baseURL)
  url.hostname = 'localhost'
  return url.href
}

test('requires a test account before authorizing or revoking an admin key', async ({
  page,
  baseURL,
}) => {
  const writes: string[] = []
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('https://rpc.moderato.tempo.xyz/**', async (route) => {
    const payload = route.request().postDataJSON()
    for (const request of Array.isArray(payload) ? payload : [payload]) {
      if (request?.method && /send|fund/i.test(request.method)) writes.push(request.method)
    }
    // This test never needs the network or a real credential.
    await route.abort()
  })

  const ipDemo = new URL('/docs/accounts/admin-keys#authorize-an-admin-key', baseURL)
  ipDemo.hostname = '127.0.0.1'
  await page.goto(ipDemo.href)
  const demo = page.getByTestId('admin-key-demo')
  await expect(demo).toBeVisible()
  await expect(demo.getByRole('link', { name: 'Open on localhost' })).toHaveAttribute(
    'href',
    localhostDemo(baseURL),
  )
  await expect(
    demo.getByRole('button', { name: 'Authorize admin key', exact: true }),
  ).toBeDisabled()
  await expect(demo.getByRole('button', { name: 'Revoke admin key', exact: true })).toBeDisabled()
  await expect(demo.getByRole('button', { name: 'Get test funds', exact: true })).toHaveCount(0)

  await page.getByRole('tab', { name: 'TypeScript', exact: true }).click()
  await expect(page.getByRole('tabpanel').filter({ visible: true })).toContainText(
    'await client.accessKey.authorizeSync',
  )
  await expect(page.getByRole('tabpanel').filter({ visible: true })).toContainText(
    'await client.accessKey.revokeSync',
  )
  await page.getByRole('tab', { name: 'Try it', exact: true }).click()
  await expect(
    demo.getByRole('button', { name: 'Authorize admin key', exact: true }),
  ).toBeDisabled()
  expect(writes).toEqual([])
  expect(errors).toEqual([])
})

test('creates a passkey on localhost with a virtual authenticator', async ({
  page,
  context,
  baseURL,
}) => {
  const cdp = await context.newCDPSession(page)
  await cdp.send('WebAuthn.enable')
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  })
  await page.route('https://rpc.moderato.tempo.xyz/**', (route) => route.abort())
  await page.goto(localhostDemo(baseURL))
  const demo = page.getByTestId('admin-key-demo')
  await demo.getByRole('button', { name: 'Create test account', exact: true }).click()
  await expect(demo.getByRole('button', { name: 'Get test funds', exact: true })).toBeVisible()
  await expect(demo).not.toContainText('Failed to create credential')
  await expect(
    demo.getByRole('button', { name: 'Authorize admin key', exact: true }),
  ).toBeDisabled()
})

test('explains a cancelled passkey request', async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    navigator.credentials.create = async () => {
      throw new DOMException('Cancelled', 'NotAllowedError')
    }
  })
  await page.goto(localhostDemo(baseURL))
  const demo = page.getByTestId('admin-key-demo')
  await demo.getByRole('button', { name: 'Create test account', exact: true }).click()
  await expect(demo.getByRole('alert')).toContainText('cancelled')
  await expect(demo.getByRole('button', { name: 'Create test account', exact: true })).toBeEnabled()
})
