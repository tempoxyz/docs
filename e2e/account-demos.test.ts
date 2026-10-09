import { expect, test } from '@playwright/test'

function accountPage(baseURL: string | undefined, hostname = 'localhost') {
  const url = new URL('/docs/accounts/create#try-a-passkey-account', baseURL)
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

  // A passkey connection must not be mistaken for a Tempo Wallet connection.
  await page.locator('[data-v-gutter-left] a[href="/docs/accounts/integrate"]').click()
  await expect(
    page.getByRole('button', { name: 'Connect Tempo Wallet', exact: true }),
  ).toBeEnabled()
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

test('requests a testnet connection from Tempo Wallet', async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error('The wallet demo requires a docs baseURL')
  const origin = new URL(baseURL).origin
  await context.route('https://wallet.tempo.xyz/embed**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><title>Tempo Wallet</title>
        <output aria-label="Connection request"></output>
        <script>
          const origin = ${JSON.stringify(origin)};
          const host = window.opener || window.parent;
          addEventListener('message', (event) => {
            if (event.origin !== origin || event.data.topic !== 'rpc-requests') return;
            const { chainId, requests } = event.data.payload;
            document.querySelector('output').textContent =
              requests.map(({ request }) => request.method).join(',') + ':' + chainId;
          });
          host.postMessage({ id: 'ready', topic: 'ready', payload: {
            trustedHosts: [new URL(origin).hostname]
          } }, origin);
        </script>`,
    }),
  )
  await page.goto('/docs/accounts/integrate#connect-tempo-wallet')
  const connect = page.getByRole('button', { name: 'Connect Tempo Wallet', exact: true })
  await expect(connect).toBeEnabled()
  if (new URL(page.url()).protocol === 'http:') {
    const popupPromise = page.waitForEvent('popup')
    await connect.click()
    const wallet = await popupPromise
    await expect(wallet.getByLabel('Connection request')).toHaveText('wallet_connect:42431')
    await wallet.close()
  } else {
    await connect.click()
    const wallet = page.getByRole('dialog', { name: 'Tempo Wallet', exact: true })
    await expect(wallet.frameLocator('iframe').getByLabel('Connection request')).toHaveText(
      'wallet_connect:42431',
    )
  }
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
  await page.goto('/docs/accounts/integrate#connect-tempo-wallet')
  await expect(
    page.getByRole('button', { name: 'Connect Tempo Wallet', exact: true }),
  ).toBeEnabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
