import { expect, test } from '@playwright/test'

/** The chain ID in the access key that Tempo ID's sign-in URL carries. */
function signInChainId(url: string) {
  const keyAuthorization = new URL(url).searchParams.get('key_authorization') ?? ''
  const { chainId } = JSON.parse(Buffer.from(keyAuthorization, 'base64url').toString())
  return Number(chainId)
}

// CI always tests the E2E build; set VITE_E2E=true to test one locally.
const e2eBuild = Boolean(process.env.CI) || process.env.VITE_E2E === 'true'

function accountPage(baseURL: string | undefined, hostname = 'localhost') {
  const url = new URL('/docs/accounts/authentication/passkeys#try-a-passkey-account', baseURL)
  url.hostname = hostname
  return url.href
}

test('explains how to open the passkey demo from a loopback IP', async ({ page, baseURL }) => {
  await page.goto(accountPage(baseURL, '127.0.0.1'))
  const demo = page.getByTestId('passkey-account-demo')
  await expect(demo).toBeVisible()
  await expect(demo.getByRole('link', { name: 'Open on localhost' })).toHaveAttribute(
    'href',
    accountPage(baseURL),
  )
  await expect(demo.getByTestId('passkey-account-address')).toHaveCount(0)
})

test('creates and reconnects the same passkey account without funding or sending', async ({
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
  const writes: string[] = []
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route(/https:\/\/(rpc|sponsor)\.moderato\.tempo\.xyz/, async (route) => {
    const payload = route.request().postDataJSON()
    for (const request of Array.isArray(payload) ? payload : [payload]) {
      if (request?.method && /send|fund|sign/i.test(request.method)) writes.push(request.method)
    }
    await route.abort()
  })
  await page.goto(accountPage(baseURL))
  const demo = page.getByTestId('passkey-account-demo')
  await demo.getByRole('button', { name: 'Create a passkey account', exact: true }).click()
  await expect(demo.getByTestId('passkey-account-address')).toHaveText(/^0x[0-9a-fA-F]{40}$/)
  const address = await demo.getByTestId('passkey-account-address').innerText()

  await page.reload()
  await expect(demo.getByTestId('passkey-account-address')).toHaveText(address)
  await demo.getByRole('button', { name: 'Disconnect passkey account' }).click()
  await expect(demo.getByTestId('passkey-account-address')).toHaveCount(0)
  await demo.getByRole('button', { name: 'Use an existing passkey' }).click()
  await expect(demo.getByTestId('passkey-account-address')).toHaveText(address)

  // A passkey connection must not be mistaken for a Tempo ID session.
  await page.locator('[data-v-gutter-left] a[href="/docs/accounts/wallets"]').click()
  await expect(page.getByRole('button', { name: 'Sign in with Tempo', exact: true })).toBeEnabled()
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toHaveCount(0)
  expect(writes).toEqual([])
  expect(errors).toEqual([])
})

test('recovers from a cancelled passkey request', async ({ page, baseURL }) => {
  await page.addInitScript(() => {
    navigator.credentials.create = async () => {
      throw new DOMException('Cancelled', 'NotAllowedError')
    }
  })
  await page.goto(accountPage(baseURL))
  const demo = page.getByTestId('passkey-account-demo')
  await demo.getByRole('button', { name: 'Create a passkey account', exact: true }).click()
  await expect(demo.getByRole('alert')).toContainText('cancelled')
  await expect(
    demo.getByRole('button', { name: 'Create a passkey account', exact: true }),
  ).toBeEnabled()
  await expect(demo.getByTestId('passkey-account-address')).toHaveCount(0)
})

test('requests a testnet access key from Tempo', async ({ page, context }) => {
  const signIns: string[] = []
  await context.route('https://id.tempo.xyz/**', (route) => {
    signIns.push(route.request().url())
    return route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><title>Tempo</title>',
    })
  })
  await page.goto('/docs/accounts/wallets#connect-a-wallet-to-your-app')
  const connect = page.getByRole('button', { name: 'Sign in with Tempo', exact: true })
  await expect(connect).toBeEnabled()
  await connect.click()
  if (e2eBuild) {
    // The E2E build signs in with `accounts/test`, which sends no request to Tempo ID.
    await expect(page.getByRole('button', { name: 'Disconnect', exact: true })).toBeVisible()
    expect(signIns).toEqual([])
    return
  }
  // Over HTTP, the sign-in opens in a popup. Over HTTPS, it frames Tempo ID's embed page.
  await expect.poll(() => signIns.length).toBeGreaterThan(0)
  const authorize = signIns.find((url) => new URL(url).pathname === '/oauth2/authorize')
  if (authorize) expect(signInChainId(authorize)).toBe(42431)
  else expect(new URL(signIns[0] ?? '').pathname).toBe('/embed')
})

test('keeps account demos usable on a narrow screen', async ({ page, baseURL }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(accountPage(baseURL))
  const demo = page.getByTestId('passkey-account-demo')
  await expect(
    demo.getByRole('button', { name: 'Create a passkey account', exact: true }),
  ).toBeEnabled()
  await expect(demo.getByRole('button', { name: 'Use an existing passkey' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.goto('/docs/accounts/wallets#connect-a-wallet-to-your-app')
  await expect(page.getByRole('button', { name: 'Sign in with Tempo', exact: true })).toBeEnabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
