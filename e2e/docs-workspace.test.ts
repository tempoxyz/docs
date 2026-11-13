import { expect, type Locator, type Page, test } from '@playwright/test'

// From 1200px the top bar lists the products as plain links, then Resources, its only menu.
const productLabels = [
  'Get started',
  'Accounts',
  'Earn',
  'Routes',
  'Zones',
  'Machine Payments',
  'Network',
]
const resourceSections = [
  ['Guides', '/docs/resources/guides'],
  ['Partners', '/docs/partners'],
  ['SDKs & CLI', '/docs/sdk'],
] as const
const resourceLabels: string[] = resourceSections.map(([label]) => label)
// Below 1200px the menu drawer lists the products, then Resources' sections under its label.
const menuLinks = [...productLabels, ...resourceLabels]
// The other Tempo products are linked from the full footer on Home; docs pages have no footer.
const footerTools = [
  ['tempo.xyz', 'https://tempo.xyz'],
  ['Console', 'https://console.tempo.xyz'],
  ['Wallet', 'https://wallet.tempo.xyz'],
  ['Explorer', 'https://explore.tempo.xyz'],
  ['MPP', 'https://mpp.dev'],
  ['Mercator', 'https://mercator.sh'],
  ['GitHub', 'https://github.com/tempoxyz'],
  ['X', 'https://twitter.com/tempo'],
] as const

// Vocs marks the desktop sidebar's current page with data-active; the drawer's DS items use
// aria-current and set data-active="false" on every other page.
const activeSidebarLink = 'a[data-active="true"], a[aria-current="page"]'

/** The products in the top bar (1200px and up). */
function productNav(page: Page) {
  return page
    .locator('header.docs-site-header')
    .getByRole('navigation', { name: 'Products', exact: true })
}

/** The Resources menu button after the products. */
function resourcesButton(page: Page) {
  return productNav(page).getByRole('button', { name: 'Resources', exact: true })
}

/** The Resources menu, named after its button. */
function resourcesMenu(page: Page) {
  return page.getByRole('menu', { name: 'Resources', exact: true })
}

/** Below 1200px, Open menu opens the menu drawer. */
function menuButton(page: Page) {
  return page.getByRole('button', { name: 'Open menu', exact: true })
}

/** The menu drawer: the products and Resources, then the current section's pages. */
function menuDrawer(page: Page) {
  return page.getByRole('dialog', { name: 'Tempo Developers menu', exact: true })
}

/** The current section's pages in the menu drawer, named after the section. */
function sectionPages(page: Page, section: string) {
  return menuDrawer(page).getByRole('navigation', { name: `${section} pages`, exact: true })
}

/** The breadcrumb above a docs page's H1: the section, then the current page. */
function breadcrumbItems(page: Page) {
  return page
    .locator('.docs-page-header')
    .getByRole('navigation', { name: 'Breadcrumb', exact: true })
    .getByRole('listitem')
}

/** The Copy page split button's menu, named after its More page options button. */
function pageOptionsMenu(page: Page) {
  return page.getByRole('menu', { name: 'More page options', exact: true })
}

/**
 * The current section: its product in the top bar from 1200px, the breadcrumb's section below.
 * Guides, Partners and SDKs & CLI mark the Resources button instead; the API reference has no
 * top-bar entry, so only the breadcrumb names it.
 */
async function expectSection(page: Page, section: string, mobile = false) {
  if (mobile) {
    await expect(breadcrumbItems(page).first()).toHaveText(section)
    return
  }
  const current = productNav(page).locator('[aria-current="page"]')
  if (productLabels.includes(section)) {
    await expect(current).toBeVisible()
    await expect(current).toHaveText(section)
    return
  }
  await expect(current).toHaveCount(0)
  await expect(breadcrumbItems(page).first()).toHaveText(section)
  if (resourceLabels.includes(section))
    await expect(resourcesButton(page)).toHaveAttribute('data-active', '')
  else await expect(resourcesButton(page)).not.toHaveAttribute('data-active')
}

test('the top bar lists the products and Resources, and products expose their tasks and developer chapters', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const products = productNav(page)
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  await expect(products.getByRole('link')).toHaveText(productLabels)
  // Products are plain links; Resources is the only menu.
  await expect(products.getByRole('button')).toHaveText(['Resources'])
  // Home belongs to no section.
  await expect(products.locator('[aria-current]')).toHaveCount(0)
  await expect(resourcesButton(page)).not.toHaveAttribute('data-active')
  // Clicks before hydration do nothing; the header search enables once hydrated.
  await expect(
    page.getByRole('button', { name: 'Search documentation', exact: true }),
  ).toBeEnabled()
  for (const [label, href] of resourceSections) {
    await resourcesButton(page).click()
    await expect(resourcesMenu(page).getByRole('menuitem')).toHaveText(resourceLabels)
    await resourcesMenu(page).getByRole('menuitem', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${href}/?$`))
    await expect(resourcesMenu(page)).toBeHidden()
    await expectSection(page, label)
  }
  await resourcesButton(page).click()
  await expect(resourcesMenu(page).locator('[aria-current="page"]')).toHaveText('SDKs & CLI')
  await page.keyboard.press('Escape')
  await expect(resourcesMenu(page)).toBeHidden()
  for (const section of [
    {
      label: 'Get started',
      path: '/get-started',
      links: ['/get-started/quickstart', '/docs/guide/using-tempo-with-ai'],
    },
    {
      label: 'Accounts',
      path: '/docs/accounts',
      links: [
        '/docs/accounts/how-it-works',
        '/docs/accounts/security',
        '/docs/accounts/use-cases',
        '/docs/accounts/create',
        '/docs/accounts/fund',
        '/docs/accounts/authentication',
        '/docs/accounts/policies',
        '/docs/accounts/access-keys',
        '/docs/accounts/account-configuration',
        '/docs/accounts/fees',
        '/docs/accounts/virtual-addresses',
        '/docs/accounts/apps',
        '/docs/accounts/automations',
        '/docs/accounts/custodians',
        '/docs/accounts/wallets',
      ],
    },
    {
      label: 'Earn',
      path: '/docs/earn',
      links: [
        '/docs/earn/vaults',
        '/docs/earn/integrate',
        '/docs/earn/balances',
        '/docs/earn/withdraw',
      ],
    },
    {
      label: 'Routes',
      path: '/docs/routes',
      links: [
        '/docs/routes/test',
        '/docs/routes/networks',
        '/docs/routes/deposits',
        '/docs/routes/transfers',
        '/docs/routes/delivery',
      ],
    },
    {
      label: 'Zones',
      path: '/docs/zones',
      links: [
        '/docs/zones/privacy',
        '/docs/zones/connect',
        '/docs/zones/deposit',
        '/docs/zones/balances',
        '/docs/zones/withdraw',
      ],
    },
    {
      label: 'Machine Payments',
      path: '/docs/agents',
      links: [
        '/docs/guide/machine-payments/client',
        '/docs/guide/machine-payments/server',
        '/docs/guide/machine-payments/agent',
        '/docs/guide/mercator',
      ],
    },
    {
      // Network merges Tempo EVM and Operate: building on the chain, nodes, upgrades and releases.
      label: 'Network',
      path: '/docs/development',
      links: [
        '/docs/development',
        '/docs/guide/node',
        '/docs/protocol/upgrades',
        '/docs/changelog',
      ],
    },
  ]) {
    await products.getByRole('link', { name: section.label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${section.path}/?$`))
    // Only the section's own product is marked current in the top bar.
    await expect(products.locator('[aria-current]')).toHaveText([section.label])
    await expect(page.locator('#related-documentation')).toHaveCount(0)
    for (const href of section.links)
      await expect(sidebar.locator(`a[href="${href}"]`), `${section.label}: ${href}`).toBeVisible()
  }
  await expect(sidebar.getByText('More guides', { exact: true })).toHaveCount(0)
  await expect(sidebar.getByRole('button', { name: 'Protocol', exact: true })).toHaveCount(0)
  const specifications = sidebar.getByRole('link', { name: 'All specifications', exact: true })
  await expect(specifications).toBeVisible()
  await specifications.click()
  await expect(page).toHaveURL(/\/docs\/protocol\/?$/)
  await expectSection(page, 'Network')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

for (const section of [
  {
    label: 'Get started',
    overview: '/get-started',
    paths: [
      '/get-started/quickstart',
      '/docs/guide/using-tempo-with-ai',
      '/docs/quickstart/faucet',
      '/docs/quickstart/connection-details',
    ],
  },
  {
    label: 'Accounts',
    overview: '/docs/accounts',
    paths: [
      '/docs/accounts/create',
      '/docs/accounts/access-keys',
      '/docs/accounts/policies/signing-thresholds',
      '/docs/accounts/automations/pay-out-from-a-backend',
      '/docs/accounts/policies/receive-policies',
      '/docs/accounts/wallets#connect-tempo-wallet',
    ],
  },
  {
    label: 'Earn',
    overview: '/docs/earn',
    paths: ['/docs/earn/vaults', '/docs/earn/integrate', '/docs/earn/providers'],
  },
  {
    label: 'Routes',
    overview: '/docs/routes',
    paths: ['/docs/routes/transfers', '/docs/routes/deposits', '/docs/routes/quotes'],
  },
  {
    label: 'Zones',
    overview: '/docs/zones',
    paths: [
      '/docs/zones/privacy',
      '/docs/guide/private-zones',
      '/docs/guide/private-zones/connect-to-a-zone',
    ],
  },
  {
    label: 'Network',
    overview: '/docs/development',
    paths: [
      '/docs/network/transactions',
      '/docs/build',
      '/docs/payments',
      '/docs/guide/payments/transfer-memos',
      '/docs/guide/payments/send-a-payment/examples',
      '/docs/guide/getting-funds',
      '/docs/quickstart/wallet-developers',
      '/docs/protocol/rpc',
      '/docs/guide/issuance/create-a-stablecoin',
      '/docs/guide/stablecoin-dex/executing-swaps',
      '/docs/guide/issuance/manage-stablecoin',
    ],
  },
  {
    label: 'Machine Payments',
    overview: '/docs/agents',
    paths: [
      '/docs/agents',
      '/docs/guide/machine-payments/agent',
      '/docs/guide/machine-payments/pay-as-you-go',
      '/docs/guide/machine-payments/streamed-payments',
      '/docs/guide/mercator',
    ],
  },
  {
    label: 'SDKs & CLI',
    overview: '/docs/sdk',
    paths: ['/docs/sdk', '/docs/cli', '/docs/cli/api', '/docs/sdk/typescript/api-client'],
  },
  {
    label: 'Partners',
    overview: '/docs/partners',
    paths: [
      '/docs/partners/wallets',
      '/docs/partners/bridges#coinbase',
      '/docs/guide/bridge-relay',
    ],
  },
  {
    label: 'API',
    overview: '/docs/api/console',
    paths: ['/docs/api/console', '/docs/api/console/api-keys', '/docs/api/team'],
  },
  {
    label: 'Network (node operators)',
    overview: '/docs/guide/node',
    paths: ['/docs/guide/node/installation'],
  },
  {
    label: 'Network (Changelog)',
    overview: '/docs/protocol/upgrades',
    paths: ['/docs/protocol/upgrades/t11', '/docs/changelog'],
  },
]) {
  test(`existing deep links select ${section.label} and retain their sidebar`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    const label = section.label.replace(/ \(.*\)$/, '')
    const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
    for (const path of section.paths) {
      const [pathname, anchor] = path.split('#')
      expect((await page.goto(path))?.status(), path).toBe(200)
      await expect(page).toHaveURL(
        (url) => url.pathname === pathname && url.hash === (anchor ? `#${anchor}` : ''),
      )
      if (anchor) await expect(page.locator(`[id="${anchor}"]`)).toHaveCount(1)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expectSection(page, label)
      await expect(sidebar.locator(`a[href="${section.overview}"]`).first()).toBeVisible()
    }
    expect((await page.reload())?.status()).toBe(200)
    await expectSection(page, label)
  })
}

test('Get started recommends a test payment and offers build paths and tool links', async ({
  page,
}) => {
  await page.goto('/get-started')
  const article = page.locator('article[data-v-content]')
  await expect(article.getByRole('heading', { level: 1 })).toHaveText('Build on Tempo')
  const quickstart = article.getByRole('link', { name: 'Send your first payment', exact: true })
  await expect(quickstart).toHaveCount(1)
  await expect(quickstart).toHaveAttribute('href', '/get-started/quickstart')
  await expect(quickstart).toBeVisible()
  for (const [label, href] of [
    ['Embed stablecoins in your app', '/docs/accounts'],
    ['Route stablecoins across chains', '/docs/routes'],
    ['Earn on stablecoins', '/docs/earn'],
    ['Charge for APIs', '/docs/guide/machine-payments/server'],
  ]) {
    const choice = article.getByRole('link', { name: new RegExp(`^${label}`) })
    await expect(choice).toHaveCount(1)
    await expect(choice).toBeVisible()
    await expect(choice).toHaveAttribute('href', href)
  }
  for (const [label, href] of [
    ['RPC and chain IDs', '/docs/quickstart/connection-details'],
    ['Testnet faucet', '/docs/quickstart/faucet'],
    ['SDKs', '/docs/sdk'],
    ['CLI', '/docs/cli'],
    ['API reference', '/docs/api/reference'],
    ['API keys', '/docs/api/console/api-keys'],
    ['Build with AI', '/docs/guide/using-tempo-with-ai'],
  ]) {
    const utility = article.getByRole('link', { name: label, exact: true })
    await expect(utility).toBeVisible()
    await expect(utility).toHaveAttribute('href', href)
  }
  await expect(article).not.toContainText('Understand stablecoins')
  await quickstart.click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quickstart')
  await expect(article.locator('h2').filter({ hasText: /^Try a payment/ })).toBeVisible()
  await expect(article.locator('h2').filter({ hasText: /^Build the payment/ })).toBeVisible()
})

test('product availability lives in overview callouts, not navigation labels', async ({ page }) => {
  for (const [path, status] of [
    ['/docs/earn', /beta/i],
    ['/docs/routes', /beta/i],
    ['/docs/zones', /live on Tempo Mainnet/i],
  ] as const) {
    await page.goto(path)
    const article = page.locator('article[data-v-content]')
    await expect(article.getByRole('heading', { level: 1 })).not.toContainText(/beta|preview/i)
    await expect(article).toContainText(status)
    await expect(article.locator('a[href="https://tempo.xyz/contact"]').first()).toBeVisible()
    await expect(productNav(page).getByRole('link')).toHaveText(productLabels)
  }
})

test('Earn task pages and the API reference remain distinct', async ({ page }) => {
  await page.goto('/docs/earn')
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  for (const [label, path] of [
    ['Vaults', '/docs/earn/vaults'],
    ['Deposit', '/docs/earn/integrate'],
    ['Balances and earnings', '/docs/earn/balances'],
    ['Withdraw', '/docs/earn/withdraw'],
  ]) {
    await sidebar.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${path}/?$`))
    await expect(sidebar.locator('a[data-active]')).toHaveAttribute('href', path)
  }
  // Earn's sidebar ends with its API reference, which belongs to the API section, not Earn.
  await sidebar.getByRole('link', { name: 'Earn API', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/api\/earn\/?$/)
  await expectSection(page, 'API')
  // A generic Overview takes its group's name.
  await expect(breadcrumbItems(page)).toHaveText(['API', 'Earn API'])
})

test('node guides and the Changelog live in Network and retain upgrade URLs', async ({ page }) => {
  await page.goto('/docs/development')
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  const current = productNav(page).locator('[aria-current="page"]')
  await expect(productNav(page).getByText('Changelog')).toHaveCount(0)
  // One Network sidebar carries the chain, the node guides and the Changelog.
  await sidebar.locator('a[href="/docs/guide/node"]').click()
  await expect(page).toHaveURL(/\/docs\/guide\/node\/?$/)
  await expect(current).toHaveText('Network')
  await sidebar.locator('a[href="/docs/protocol/upgrades"]').click()
  await expect(page).toHaveURL(/\/docs\/protocol\/upgrades\/?$/)
  await expect(current).toHaveText('Network')
  await sidebar.locator('a[href="/docs/protocol/upgrades/t11"]').click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('T11 Network Upgrade')
  expect((await page.reload())?.status()).toBe(200)
  await expect(current).toHaveText('Network')
  await sidebar.getByRole('link', { name: 'Node releases', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/changelog\/?$/)
  await expect(current).toHaveText('Network')
  await productNav(page).getByRole('link', { name: 'Network', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/development\/?$/)
})

test('Resources is a keyboard-accessible menu and the old tools hub redirects', async ({
  page,
}) => {
  await page.goto('/')
  // Keys pressed before hydration do nothing; the header search enables once hydrated.
  await expect(
    page.getByRole('button', { name: 'Search documentation', exact: true }),
  ).toBeEnabled()
  const trigger = resourcesButton(page)
  const items = resourcesMenu(page).getByRole('menuitem')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(items).toHaveText(resourceLabels)
  await expect(items.first()).toBeFocused()
  await page.keyboard.press('End')
  await expect(items.last()).toBeFocused()
  await page.keyboard.press('Home')
  await expect(items.first()).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/docs\/resources\/guides\/?$/)
  await expectSection(page, 'Guides')
  await expect(page.locator('#related-documentation')).toHaveCount(0)
  expect((await page.goto('/docs/tools'))?.status()).toBe(200)
  await expect(page).toHaveURL(/\/docs\/sdk\/?$/)
  await expectSection(page, 'SDKs & CLI')
})

for (const path of ['/', '/docs/accounts']) {
  test(`mobile menu lists the products and Resources, and the footer links the products on ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(path)
    const footer = page.locator('.docs-site-footer')
    if (path === '/') {
      await expect(footer).toHaveAttribute('data-variant', 'full')
      await expect(
        footer.getByRole('navigation', { name: 'Footer', exact: true }).locator('p'),
      ).toHaveText(['Products', 'Resources', 'Tempo'])
      // Products and Resources repeat the top bar; the API reference, which has no top-bar
      // entry, closes Resources.
      await expect(footer.locator('a[href^="/"]')).toHaveText([...menuLinks, 'API reference'])
      for (const [label, href] of footerTools) {
        const link = footer.getByRole('link', {
          name: `${label} (opens in a new tab)`,
          exact: true,
        })
        await expect(link).toHaveAttribute('href', href)
        await expect(link).toHaveAttribute('target', '_blank')
        await expect(link).toHaveAttribute('rel', /noopener/)
      }
    } else {
      // Docs pages end at Previous / Next, without a footer.
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(footer).toHaveCount(0)
    }
    await menuButton(page).click()
    const menu = menuDrawer(page)
    const areas = menu.getByRole('navigation', { name: 'Products', exact: true })
    await expect(areas.getByRole('link')).toHaveText(menuLinks)
    for (const label of menuLinks)
      await expect(areas.getByRole('link', { name: label, exact: true })).toBeVisible()
    // Resources is a label above its sections, not a link.
    await expect(areas.getByText('Resources', { exact: true })).toBeVisible()
    await expect(areas.getByRole('link', { name: 'Resources', exact: true })).toHaveCount(0)
    if (path === '/') await expect(areas.locator('[aria-current="page"]')).toHaveCount(0)
    else await expect(areas.locator('[aria-current="page"]')).toHaveText('Accounts')
    await expect(menu.getByRole('link', { name: 'Get API key', exact: true })).toHaveAttribute(
      'href',
      'https://console.tempo.xyz',
    )
    await areas.getByRole('link', { name: 'Network', exact: true }).click()
    await expect(page).toHaveURL(/\/docs\/development\/?$/)
    await expect(menu).toBeHidden()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    await expect(breadcrumbItems(page)).toHaveText(['Network', 'Introduction'])
    await menuButton(page).click()
    const drawer = sectionPages(page, 'Network')
    // Changelog is an always-open Network chapter, so its upgrades list without a toggle.
    await expect(drawer.getByRole('group', { name: 'Changelog', exact: true })).toBeVisible()
    await drawer.locator('a[href="/docs/protocol/upgrades/t12"]').click()
    await expect(page).toHaveURL(/\/docs\/protocol\/upgrades\/t12\/?$/)
    await expect(menu).toBeHidden()
  })
}

for (const path of ['/', '/docs/accounts']) {
  for (const width of [1080, 1200, 1440]) {
    test(`desktop top bar products, search and Get API key stay usable on ${path} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(path)
      const header = page.locator('header.docs-site-header')
      await expect(
        header.getByRole('combobox', { name: 'Color theme', includeHidden: true }),
      ).toHaveCount(0)
      await expect(header.getByRole('link', { name: 'Blog', exact: true })).toHaveCount(0)
      // The products take the bar from 1200px; below it they move into the menu drawer.
      const wide = width >= 1200
      const products = productNav(page)
      const menu = menuButton(page)
      if (wide) {
        await expect(products.getByRole('link')).toHaveText(productLabels)
        await expect(products.getByRole('button')).toHaveText(['Resources'])
        if (path === '/') await expect(products.locator('[aria-current]')).toHaveCount(0)
        else await expect(products.locator('[aria-current]')).toHaveText(['Accounts'])
        await expect(menu).toBeHidden()
      } else {
        await expect(products).toBeHidden()
        await expect(menu).toBeEnabled()
      }
      // Get API key is the one primary action; agent setup and Log in left the top bar.
      await expect(header.getByRole('button', { name: 'Agent setup', exact: true })).toHaveCount(0)
      await expect(header.getByRole('link', { name: 'Log in', exact: true })).toHaveCount(0)
      const logo = header.getByRole('link', { name: 'Tempo Developers', exact: true })
      const search = header.getByRole('button', { name: 'Search documentation', exact: true })
      const apiKey = header.getByRole('link', { name: 'Get API key', exact: true })
      await expect(logo).toHaveAttribute('href', '/')
      await expect(search).toBeEnabled()
      await expect(apiKey).toHaveAttribute('href', 'https://console.tempo.xyz')
      await page.evaluate(() => document.fonts.ready)

      // The lockup, products, search, Get API key and menu sit left to right, inside the
      // viewport, without overlap.
      const controls = wide
        ? [logo, ...(await products.getByRole('link').all()), resourcesButton(page), search, apiKey]
        : [logo, search, apiKey, menu]
      const boxes = await Promise.all(
        controls.map(async (control) => {
          await expect(control).toBeVisible()
          const box = await control.boundingBox()
          if (!box) throw new Error('Header control has no visible bounds')
          return box
        }),
      )
      expect(boxes).toHaveLength(wide ? productLabels.length + 4 : 4)
      for (const [index, box] of boxes.entries()) {
        expect(box.x + box.width).toBeLessThanOrEqual(width)
        const previous = boxes[index - 1]
        if (previous) expect(box.x).toBeGreaterThanOrEqual(previous.x + previous.width)
      }
    })
  }
}

test('entry page offers one start button, three guides, the products and reference links', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Build stablecoin payments on Tempo',
  )
  await expect(page.locator('[data-v-gutter-left]')).toBeHidden()
  const home = page.locator('.tempo-docs-home')
  // One button in the hero.
  const start = home.locator('.tempo-docs-home-actions').getByRole('link')
  await expect(start).toHaveText(['Send your first payment'])
  await expect(start).toHaveAttribute('href', '/get-started/quickstart')
  // Three guides; Build with AI is the way in to agent setup.
  const guides = home.locator('.tempo-docs-home-guide')
  await expect(guides.getByRole('heading', { level: 3 })).toHaveText([
    'Send your first payment',
    'Create an account',
    'Build with AI',
  ])
  for (const [label, href] of [
    ['Run the quickstart', '/get-started/quickstart'],
    ['Choose a signing method', '/docs/accounts/create'],
    ['Set up your agent', '/docs/guide/using-tempo-with-ai'],
  ]) {
    await expect(guides.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      href,
    )
  }
  await expect(home.locator('.tempo-docs-home-product-group')).toHaveCount(6)
  for (const product of ['accounts', 'earn', 'routes', 'zones', 'agents', 'development']) {
    await expect(
      home.locator(`.tempo-docs-home-product-group h3 a[href="/docs/${product}"]`),
    ).toHaveCount(1)
  }
  const reference = home.locator('.tempo-docs-home-reference')
  await expect(reference.getByRole('heading', { level: 2 })).toHaveText('Reference & tools')
  expect(
    await reference
      .locator('.tempo-docs-home-quick-link a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
  ).toEqual([
    '/docs/quickstart/connection-details',
    '/docs/quickstart/faucet',
    '/docs/api',
    '/docs/sdk',
  ])
  await expect(home).not.toContainText('Bring your existing EVM app')
  for (const anchor of [
    'start-here',
    'choose-a-build-path',
    'reference-and-operations',
    'ecosystem-resources',
    'tempo-developer-documentation',
  ]) {
    await expect(page.locator(`[id="${anchor}"]`)).toHaveCount(1)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  const destinations = await page
    .locator('.tempo-docs-home a[href^="/docs"]')
    .evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href') as string))])
  for (const destination of destinations) {
    expect((await request.get(destination)).status(), destination).toBe(200)
  }

  await start.click()
  await page.waitForURL(/\/get-started\/quickstart\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quickstart')
  await expect(
    productNav(page).getByRole('link', { name: 'Get started', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test('Copy page offers manual recovery without overflowing a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new DOMException('Clipboard permission denied', 'NotAllowedError')
        },
      },
    })
  })
  await page.goto('/docs/cli')
  const actions = page.locator('.docs-page-actions')
  // Below 768px Ask AI and Copy page show only their icons and keep their names.
  for (const name of ['Ask AI', 'Copy page'])
    await expect(actions.getByRole('button', { name, exact: true })).toHaveText('')
  await actions.getByRole('button', { name: 'Copy page', exact: true }).click()
  await expect(actions.getByRole('status')).toHaveText(
    'Could not copy. Open View as Markdown to select the page text.',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await actions.getByRole('button', { name: 'More page options', exact: true }).click()
  const markdown = pageOptionsMenu(page).getByRole('menuitem', {
    name: 'View as Markdown',
    exact: true,
  })
  await expect(markdown).toBeVisible()
  await expect(markdown).toHaveAttribute('href', '/assets/md/docs/cli.md')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('mobile menu restores focus and navigates to another section', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Build stablecoin payments on Tempo',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const trigger = menuButton(page)
  await trigger.click()
  const menu = menuDrawer(page)
  await expect(menu).toBeVisible()
  // Focus moves into the drawer, which has its own Close button.
  await expect(menu).toBeFocused()
  await expect(menu.getByRole('button', { name: 'Close', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).not.toBeVisible()
  await expect(trigger).toBeFocused()
  for (const [label, path] of [
    ['Earn', '/docs/earn'],
    ['Accounts', '/docs/accounts'],
    ['Machine Payments', '/docs/agents'],
    ['Network', '/docs/development'],
  ]) {
    await trigger.click()
    await menu
      .getByRole('navigation', { name: 'Products', exact: true })
      .getByRole('link', { name: label, exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`${path}/?$`))
    await expect(menu).toBeHidden()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expectSection(page, label, true)
    await trigger.click()
    await expect(
      menu
        .getByRole('navigation', { name: 'Products', exact: true })
        .locator('[aria-current="page"]'),
    ).toHaveText(label)
    await expect(sectionPages(page, label).locator(`a[href="${path}"]`)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
  }
})

test('mobile sidebars keep useful product guides visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const [path, section, destination] of [
    ['/docs/earn', 'Earn', '/docs/earn/how-it-works'],
    ['/docs/routes', 'Routes', '/docs/routes/quotes'],
    ['/docs/zones', 'Zones', '/docs/zones/connect'],
  ]) {
    await page.goto(path)
    await menuButton(page).click()
    const drawer = sectionPages(page, section)
    await expect(drawer.locator(`a[href="${destination}"]`)).toBeVisible()
    await expect(drawer.getByRole('button', { name: /More about|Earlier testnet/ })).toHaveCount(0)
    await page.keyboard.press('Escape')
  }
  await page.goto('/docs/accounts')
  await menuButton(page).click()
  const drawer = sectionPages(page, 'Accounts')
  for (const href of ['/docs/accounts/create', '/docs/accounts/fund'])
    await expect(drawer.locator(`a[href="${href}"]`)).toBeVisible()
  // Each Features and Build submenu opens to its own overview page and guides.
  for (const [group, href] of [
    ['Account Policies', '/docs/accounts/policies'],
    ['Access Keys', '/docs/accounts/access-keys'],
    ['Wallets', '/docs/accounts/wallets'],
  ]) {
    const disclosure = drawer.getByRole('button', { name: group, exact: true })
    await expect(drawer.locator(`a[href="${href}"]`)).toBeHidden()
    await disclosure.click()
    await expect(drawer.locator(`a[href="${href}"]`)).toBeVisible()
  }
  await expect(drawer.getByText('More guides', { exact: true })).toHaveCount(0)
  const guide = drawer.getByRole('link', { name: 'Create an Account', exact: true })
  await guide.click()
  await expect(page).toHaveURL(/\/docs\/accounts\/create\/?$/)
  await expect(drawer).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create an Account')
  await expect(breadcrumbItems(page)).toHaveText(['Accounts', 'Create an Account'])
})

test('sandbox guides stay collapsed under Testnet Sandbox until a sandbox page opens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/zones')
  await menuButton(page).click()
  const drawer = sectionPages(page, 'Zones')
  const sandbox = drawer.getByRole('button', { name: 'Testnet Sandbox', exact: true })
  await expect(sandbox).toBeVisible()
  await expect(drawer.locator('a[href="/docs/guide/private-zones/deposit-to-a-zone"]')).toBeHidden()
  await sandbox.click()
  await drawer.locator('a[href="/docs/guide/private-zones"]').click()
  await expect(page).toHaveURL(/\/docs\/guide\/private-zones\/?$/)
  await menuButton(page).click()
  await expect(drawer.locator('a[href="/docs/zones/privacy"]')).toBeVisible()
  await expect(
    drawer.locator('a[href="/docs/guide/private-zones/deposit-to-a-zone"]'),
  ).toBeVisible()
  await drawer.locator('a[href="/docs/guide/private-zones/deposit-to-a-zone"]').click()
  await expect(page).toHaveURL(/\/docs\/guide\/private-zones\/deposit-to-a-zone\/?$/)
  await menuButton(page).click()
  await expect(
    drawer.locator('a[href="/docs/guide/private-zones/withdraw-from-a-zone"]'),
  ).toBeVisible()
  await expect(drawer.locator('a[href="/docs/zones/deposit"]')).toBeVisible()
})

test('mobile menu drawer traps focus and survives client navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/network')
  // Below Desktop the menu drawer holds the section's pages, so Vocs' outline row stays hidden.
  const outline = page
    .locator('[data-v-outline-mobile]')
    .getByRole('button', { name: 'On this page', exact: true, includeHidden: true })
  await expect(outline).toHaveCount(1)
  await expect(outline).toBeHidden()
  await expectSection(page, 'Network', true)
  const trigger = menuButton(page)
  await trigger.click()
  const drawer = menuDrawer(page)
  const search = drawer.getByRole('button', { name: 'Search docs', exact: true })
  const close = drawer.getByRole('button', { name: 'Close', exact: true })
  await expect(drawer).toBeFocused()
  // Focus wraps between the drawer's last control, Close, and its first, Search docs.
  await page.keyboard.press('Shift+Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(search).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(search).toBeFocused()
  // The products come straight after search.
  await page.keyboard.press('Tab')
  await expect(
    drawer
      .getByRole('navigation', { name: 'Products', exact: true })
      .getByRole('link', { name: 'Get started', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()
  // The API reference has no top-bar entry; each product's pages end with its API reference.
  await trigger.click()
  await sectionPages(page, 'Network').getByRole('link', { name: 'JSON-RPC', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/api\/rpc\/?$/)
  await expect(drawer).toBeHidden()
  await trigger.click()
  // The drawer follows the page to the API section's pages.
  const api = sectionPages(page, 'API')
  await expect(api).toBeVisible()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(drawer).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('mobile pages without an outline still expose the menu drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/sdk')
  await expect(page.locator('article[data-v-content] h2')).toHaveCount(0)
  // The page's generic Overview label takes its group's name.
  await expect(breadcrumbItems(page)).toHaveText(['SDKs & CLI', 'Tempo SDK'])
  const trigger = menuButton(page)
  await expect(trigger).toBeVisible()
  await trigger.click()
  const drawer = menuDrawer(page)
  await expect(drawer).toBeVisible()
  await expect(
    drawer
      .getByRole('navigation', { name: 'Products', exact: true })
      .locator('[aria-current="page"]'),
  ).toHaveText('SDKs & CLI')
  const pages = sectionPages(page, 'SDKs & CLI')
  // Tempo SDK is an always-open section, so it renders as a labelled group of its pages.
  await expect(pages.getByRole('group', { name: 'Tempo SDK', exact: true })).toBeVisible()
  await pages.getByRole('link', { name: 'Python', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/sdk\/python\/?$/)
  await expect(drawer).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await expect(trigger).toBeVisible()
})

test('the Copy page menu is keyboard operable, closes on Escape and outside presses, and connects your agent', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/docs/accounts')
  const actions = page.locator('.docs-page-actions')
  const trigger = actions.getByRole('button', { name: 'More page options', exact: true })
  const menu = pageOptionsMenu(page)
  const items = menu.getByRole('menuitem')
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  // Copy page is the split button's own action, so the menu holds the other page options.
  await expect(items).toHaveText(['View as Markdown', 'Connect your agent'])
  await expect(
    menu.getByRole('menuitem', { name: 'View as Markdown', exact: true }),
  ).toHaveAttribute('href', '/assets/md/docs/accounts.md')
  await expect(items.nth(0)).toBeFocused()
  await page.keyboard.press('End')
  await expect(items.nth(1)).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(items.nth(0)).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(items.nth(1)).toBeFocused()
  await page.keyboard.press('Home')
  await expect(items.nth(0)).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(items.nth(1)).toBeFocused()
  // Visibility alone does not detect another stacking context covering the menu.
  const receivesPointer = await menu.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return element.contains(
      document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2),
    )
  })
  expect(receivesPointer).toBe(true)

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.click()
  await expect(menu).toBeVisible()
  // While the menu is open, its backdrop takes presses outside it, such as on the H1.
  const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
  if (!heading) throw new Error('The page heading has no visible bounds')
  await page.mouse.click(heading.x + 4, heading.y + 4)
  await expect(menu).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  // Agent setup moved from the header into this menu and Get started › Build with AI.
  await trigger.click()
  await menu.getByRole('menuitem', { name: 'Connect your agent', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/guide\/using-tempo-with-ai\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Build with AI')
  await expectSection(page, 'Get started')
})

test('the page header links its section and Ask AI opens the page in ChatGPT or Claude', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/docs/accounts/create')
  const askAi = page
    .locator('.docs-page-actions')
    .getByRole('button', { name: 'Ask AI', exact: true })
  const menu = page.getByRole('menu', { name: 'Ask AI', exact: true })
  // Ask AI moved from Vocs' floating field into the page header.
  await expect(page.locator('[data-v-ask-ai-container]')).toBeHidden()
  await askAi.click()
  await expect(menu.getByRole('menuitem')).toHaveText(['Ask ChatGPT', 'Ask Claude'])
  for (const [name, href] of [
    ['Ask ChatGPT', /^https:\/\/chatgpt\.com\?hints=search&q=\S+$/],
    ['Ask Claude', /^https:\/\/claude\.ai\/new\?q=\S+$/],
  ] as const) {
    const item = menu.getByRole('menuitem', { name, exact: true })
    await expect(item).toHaveAttribute('href', href)
    await expect(item).toHaveAttribute('target', '_blank')
  }
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await expect(askAi).toBeFocused()
  // Cmd/Ctrl+I toggles it.
  await page.keyboard.press('ControlOrMeta+i')
  await expect(menu).toBeVisible()
  await page.keyboard.press('ControlOrMeta+i')
  await expect(menu).toBeHidden()
  // The breadcrumb's section links its overview.
  await expect(breadcrumbItems(page)).toHaveText(['Accounts', 'Create an Account'])
  await breadcrumbItems(page).getByRole('link', { name: 'Accounts', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/accounts\/?$/)
  await expect(breadcrumbItems(page)).toHaveText(['Accounts', 'Introduction'])
})

test('Copy page copies readable Markdown and survives client navigation', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/docs/cli')
  const actions = page.locator('.docs-page-actions')
  const options = actions.getByRole('button', { name: 'More page options', exact: true })
  const markdown = pageOptionsMenu(page).getByRole('menuitem', {
    name: 'View as Markdown',
    exact: true,
  })
  await actions.getByRole('button', { name: 'Copy page', exact: true }).click()
  await expect(actions.getByRole('status')).toHaveText('Page Markdown copied to clipboard.')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('# Tempo CLI')
  await options.click()
  await expect(markdown).toHaveAttribute('href', '/assets/md/docs/cli.md')
  await page.keyboard.press('Escape')
  await expect(markdown).toBeHidden()
  // The API reference has no top-bar entry; Get started's sidebar ends with its overview.
  await productNav(page).getByRole('link', { name: 'Get started', exact: true }).click()
  await page.waitForURL(/\/get-started\/?$/)
  await page.locator('[data-v-gutter-left] [data-v-sidebar-container] a[href="/docs/api"]').click()
  await page.waitForURL(/\/docs\/api\/?$/)
  await expect(actions).toHaveCount(1)
  await options.click()
  await expect(markdown).toHaveAttribute('href', '/assets/md/docs/api.md')
})

test('mobile docs search works and appearance persists through navigation and reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/accounts')
  const menu = menuDrawer(page)
  await menuButton(page).click()
  await menu.getByRole('combobox', { name: 'Color theme' }).selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-vocs-theme', 'dark')
  await menu.getByRole('button', { name: 'Search docs', exact: true }).click()
  await expect(menu).toBeHidden()
  const search = page.getByRole('dialog', { name: 'Search documentation', exact: true })
  await expect(search).toBeVisible()
  await search.getByRole('combobox').fill('passkeys')
  const result = search.locator('a[href="/docs/accounts/authentication/passkeys#create-a-passkey"]')
  await expect(result).toBeVisible()
  await result.click()
  await expect(page).toHaveURL(/\/docs\/accounts\/authentication\/passkeys#create-a-passkey$/)
  await expect(search).toBeHidden()
  await expect(page.locator('html')).toHaveAttribute('data-vocs-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-vocs-theme', 'dark')
  await menuButton(page).click()
  await menu.getByRole('combobox', { name: 'Color theme' }).selectOption('light')
  await expect(page.locator('html')).toHaveAttribute('data-vocs-theme', 'light')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
})

function developerDisclosure(sidebar: Locator, label: string, mobile: boolean) {
  return mobile
    ? sidebar.getByRole('button', { name: label, exact: true })
    : sidebar.getByRole('button', { name: new RegExp(`^(?:Toggle )?${label}(?: section)?$`) })
}

async function expectOnlyActiveLeaf(sidebar: Locator, path: string) {
  const active = sidebar.locator(activeSidebarLink)
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', path)
  const hrefs = await sidebar
    .locator('a[href]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
  expect(new Set(hrefs).size, 'A sidebar URL should appear only once').toBe(hrefs.length)
}

test('developer chapters expand in place and retain their tree across client navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/docs/development')
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  const controls = sidebar.getByRole('button')
  const tokens = developerDisclosure(sidebar, 'TIP-20 Tokens', false)
  const wallets = developerDisclosure(sidebar, 'Accounts and keys', false)
  const tokenIntro = sidebar.locator('a[href="/docs/network/tokens"]')
  const tokenLists = sidebar.locator('a[href="/docs/quickstart/tokenlist"]')
  await expect(tokens).toBeVisible()
  await expect(wallets).toBeVisible()
  const initialControls = await controls.allTextContents()
  await expect(tokenIntro).toBeHidden()
  await expect(tokenLists).toBeHidden()
  await expectOnlyActiveLeaf(sidebar, '/docs/development')

  // Retry until hydration attaches the toggle; an early click is a no-op.
  await expect(async () => {
    if (!(await tokenIntro.isVisible())) await tokens.click()
    await expect(tokenIntro).toBeVisible({ timeout: 1000 })
  }).toPass()
  await expect(page).toHaveURL(/\/docs\/development\/?$/)
  await expect(sidebar.getByRole('link', { name: 'Manage tokens', exact: true })).toBeVisible()
  await tokenIntro.click()
  await expect(page).toHaveURL(/\/docs\/network\/tokens\/?$/)
  await expect(controls).toHaveText(initialControls)
  await expectOnlyActiveLeaf(sidebar, '/docs/network/tokens')

  await sidebar.getByRole('link', { name: 'Manage tokens', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/guide\/issuance\/manage-stablecoin\/?$/)
  await expect(controls).toHaveText(initialControls)
  await expectOnlyActiveLeaf(sidebar, '/docs/guide/issuance/manage-stablecoin')
  await expect(sidebar.getByRole('link', { name: 'Create a token', exact: true })).toBeVisible()
  await expect(
    sidebar.getByRole('link', { name: 'Migrate from ERC-20', exact: true }),
  ).toBeVisible()

  await wallets.click()
  await expect(page).toHaveURL(/\/docs\/guide\/issuance\/manage-stablecoin\/?$/)
  await expect(tokenLists).toBeVisible()
  await tokenLists.click()
  await expect(page).toHaveURL(/\/docs\/quickstart\/tokenlist\/?$/)
  await expect(controls).toHaveText(initialControls)
  await expectOnlyActiveLeaf(sidebar, '/docs/quickstart/tokenlist')
  // A chapter manually opened earlier stays open when another chapter is selected.
  await expect(tokenIntro).toBeVisible()
  await expect(tokenLists).toBeVisible()
  await expect(sidebar.getByRole('link', { name: 'All specifications', exact: true })).toBeVisible()
  await expect(sidebar.getByText('Token guides', { exact: true })).toHaveCount(0)
  await expect(sidebar.getByText('Wallet guides', { exact: true })).toHaveCount(0)
  await expect(sidebar.getByText('More guides', { exact: true })).toHaveCount(0)
})

for (const mobile of [false, true]) {
  const viewport = mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }
  const surface = mobile ? 'mobile' : 'desktop'

  for (const entry of [
    {
      name: 'token introduction',
      section: 'Network',
      path: '/docs/network/tokens',
      group: 'TIP-20 Tokens',
      sibling: '/docs/guide/issuance/manage-stablecoin',
      unrelated: '/docs/accounts/access-keys',
    },
    {
      name: 'token management',
      section: 'Network',
      path: '/docs/guide/issuance/manage-stablecoin',
      group: 'TIP-20 Tokens',
      sibling: '/docs/guide/issuance/mint-stablecoins',
      unrelated: '/docs/accounts/access-keys',
    },
    {
      name: 'wallet integration',
      section: 'Network',
      path: '/docs/quickstart/wallet-developers',
      group: 'Accounts and keys',
      sibling: '/docs/development/account-keychain',
      unrelated: '/docs/guide/issuance/manage-stablecoin',
    },
    {
      name: 'transaction specification',
      section: 'Network',
      path: '/docs/protocol/transactions/spec-tempo-transaction',
      group: 'Transactions',
      sibling: '/docs/guide/tempo-transaction',
      unrelated: '/docs/network/fees',
      guide: '/docs/guide/tempo-transaction',
    },
    {
      name: 'fee specification',
      section: 'Network',
      path: '/docs/protocol/fees/spec-fee',
      group: 'Fees',
      sibling: '/docs/network/fees',
      unrelated: '/docs/network/transactions',
      guide: '/docs/network/fees',
    },
    {
      name: 'token specification',
      section: 'Network',
      path: '/docs/protocol/tip20/spec',
      group: 'TIP-20 Tokens',
      sibling: '/docs/network/tokens',
      unrelated: '/docs/accounts/access-keys',
      guide: '/docs/network/tokens',
    },
    {
      name: 'account keychain reference',
      section: 'Network',
      path: '/docs/protocol/transactions/AccountKeychain',
      group: 'Accounts and keys',
      sibling: '/docs/development/account-keychain',
      unrelated: '/docs/guide/payments/transfer-memos',
      guide: '/docs/development/account-keychain',
    },
    {
      name: 'receive policy reference',
      section: 'Network',
      path: '/docs/protocol/tip403/receive-policies',
      group: 'Receive payments',
      sibling: '/docs/guide/payments/transfer-memos',
      unrelated: '/docs/development/account-keychain',
      guide: '/docs/guide/payments/transfer-memos',
    },
    {
      name: 'Zone architecture reference',
      section: 'Zones',
      path: '/docs/protocol/zones/architecture',
      group: 'Technical Reference',
      sibling: '/docs/protocol/zones/proving',
      unrelated: '/docs/guide/private-zones/connect-to-a-zone',
    },
  ]) {
    test(`${surface} direct ${entry.name} links open only their active chapter`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      expect((await page.goto(entry.path))?.status()).toBe(200)
      await expectSection(page, entry.section, mobile)
      if (mobile) await menuButton(page).click()
      const sidebar = mobile
        ? sectionPages(page, entry.section)
        : page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
      const disclosure = developerDisclosure(sidebar, entry.group, mobile)
      await expect(disclosure).toBeVisible()
      await expect(sidebar.locator(`a[href="${entry.sibling}"]`)).toBeVisible()
      await expect(sidebar.locator(`a[href="${entry.unrelated}"]`)).toBeHidden()
      await expectOnlyActiveLeaf(sidebar, entry.path)
      if (entry.group === 'TIP-20 Tokens') {
        await expect(
          sidebar.getByRole('link', { name: 'Create a token', exact: true }),
        ).toBeVisible()
        await expect(
          sidebar.getByRole('link', { name: 'Migrate from ERC-20', exact: true }),
        ).toBeVisible()
      }
      // The group control folds its children instead of navigating to an introduction.
      // Retry until hydration attaches the toggle; an early click is a no-op.
      const sibling = sidebar.locator(`a[href="${entry.sibling}"]`)
      await expect(async () => {
        if (await sibling.isVisible()) await disclosure.click()
        await expect(sibling).toBeHidden({ timeout: 1000 })
      }).toPass()
      await expect(page).toHaveURL(new RegExp(`${entry.path}/?$`))
      await disclosure.click()
      await expect(sibling).toBeVisible()
      if (mobile) await page.keyboard.press('Escape')
      expect((await page.reload())?.status()).toBe(200)
      if (mobile) await menuButton(page).click()
      await expect(sidebar.locator(`a[href="${entry.sibling}"]`)).toBeVisible()
      await expectOnlyActiveLeaf(sidebar, entry.path)
      if ('guide' in entry && entry.guide) {
        // Guides and their references keep the same section and chapter through client navigation.
        await sidebar.locator(`a[href="${entry.guide}"]`).click()
        await expect(page).toHaveURL(new RegExp(`${entry.guide}/?$`))
        await expectSection(page, entry.section, mobile)
        if (mobile) await menuButton(page).click()
        await expectOnlyActiveLeaf(sidebar, entry.guide)
        await expect(disclosure).toBeVisible()
        await expect(sidebar.locator(`a[href="${entry.path}"]`)).toBeVisible()
        await sidebar.locator(`a[href="${entry.path}"]`).click()
        await expect(page).toHaveURL(new RegExp(`${entry.path}/?$`))
        await expectSection(page, entry.section, mobile)
        if (mobile) await menuButton(page).click()
        await expectOnlyActiveLeaf(sidebar, entry.path)
        await expect(sidebar.locator(`a[href="${entry.guide}"]`)).toBeVisible()
      }
    })
  }

  test(`${surface} MPP deep links navigate within Machine Payments`, async ({ page }) => {
    await page.setViewportSize(viewport)
    expect((await page.goto('/docs/guide/machine-payments/pay-as-you-go'))?.status()).toBe(200)
    await expectSection(page, 'Machine Payments', mobile)
    if (mobile) await menuButton(page).click()
    const sidebar = mobile
      ? sectionPages(page, 'Machine Payments')
      : page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
    const active = sidebar.locator(activeSidebarLink)
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('href', '/docs/guide/machine-payments/pay-as-you-go')
    await expect(sidebar.getByRole('link', { name: 'Use Mercator', exact: true })).toBeVisible()
    await expect(sidebar.locator('a[href="/docs/network/tokens"]')).toHaveCount(0)
    await sidebar.getByRole('link', { name: 'Accept API payments', exact: true }).click()
    await expect(page).toHaveURL(/\/docs\/guide\/machine-payments\/server\/?$/)
    if (mobile) await expect(sidebar).toBeHidden()
    expect((await page.reload())?.status()).toBe(200)
    await expectSection(page, 'Machine Payments', mobile)
    if (mobile) await menuButton(page).click()
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('href', '/docs/guide/machine-payments/server')
  })
}

test('the developer guide catalog opens Browser payments in its Network home', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/docs/development')
  const article = page.locator('article[data-v-content]')
  await expect(article.getByRole('heading', { level: 1 })).toHaveText('Tempo EVM')
  await expectSection(page, 'Network')
  const browserPayments = article.locator('a[href="/docs/guide/payments/send-a-payment/browser"]')
  await expect(browserPayments).toHaveCount(1)
  await expect(browserPayments).toHaveText('Browser payments')
  await browserPayments.click()
  await expect(page).toHaveURL(/\/docs\/guide\/payments\/send-a-payment\/browser\/?$/)
  await expectSection(page, 'Network')
  await expect(article.getByRole('heading', { level: 1 })).toHaveText('Browser payments')
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  await expect(sidebar.getByRole('link', { name: 'Send payments', exact: true })).toBeVisible()
  const active = sidebar.locator('a[data-active], a[aria-current="page"]')
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', '/docs/guide/payments/send-a-payment/browser')
})
