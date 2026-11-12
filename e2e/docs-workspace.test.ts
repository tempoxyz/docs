import { expect, type Locator, type Page, test } from '@playwright/test'

// The top bar's four tabs are plain links. Every tab but Home owns a row of section tabs.
const tabLabels = ['Home', 'Docs', 'Reference', 'Resources']
const tabSections = [
  ['Docs', ['Get started', 'Accounts', 'Earn', 'Routes', 'Zones', 'Machine Payments', 'Network']],
  ['Reference', ['API', 'SDKs & CLI']],
  ['Resources', ['Guides', 'Partners']],
] as const
const tabHrefs: Record<string, string> = {
  Docs: '/get-started',
  Reference: '/docs/api',
  Resources: '/docs/resources/guides',
}
const docsSectionLabels = tabSections[0][1]
// The mobile menu lists Home, then each tab's sections under the tab's label.
const mobileMenuLinks = ['Home', ...tabSections.flatMap(([, sections]) => sections)]
// The other Tempo products left the header: the footer links them, Full on Home and Compact on
// docs pages.
const footerTools = {
  full: [
    ['tempo.xyz', 'https://tempo.xyz'],
    ['Console', 'https://console.tempo.xyz'],
    ['Wallet', 'https://wallet.tempo.xyz'],
    ['Explorer', 'https://explore.tempo.xyz'],
    ['MPP', 'https://mpp.dev'],
    ['Mercator', 'https://mercator.sh'],
    ['GitHub', 'https://github.com/tempoxyz'],
    ['X', 'https://twitter.com/tempo'],
  ],
  compact: [
    ['tempo.xyz', 'https://tempo.xyz'],
    ['Console', 'https://console.tempo.xyz'],
    ['Explorer', 'https://explore.tempo.xyz'],
    ['GitHub', 'https://github.com/tempoxyz'],
    ['X', 'https://twitter.com/tempo'],
  ],
} as const

// The drawer lists the tab's sections above the sidebar; sidebar checks leave that list out.
const outsideSectionTabs = ':not(nav[aria-label$=" sections"] a)'
const activeSidebarLink = `a[data-active]${outsideSectionTabs}, a[aria-current="page"]${outsideSectionTabs}`

/** The four tabs in the top bar. */
function tabNav(page: Page) {
  return page
    .getByRole('navigation', { name: 'Developer navigation' })
    .getByRole('navigation', { name: 'Documentation areas', exact: true })
}

/** The section tabs under the top bar (Desktop and up): the sections of the current tab. */
function sectionNav(page: Page, tab: string) {
  return page
    .locator('.docs-section-nav')
    .getByRole('navigation', { name: `${tab} sections`, exact: true })
}

/** Below Desktop, the page bar reads "Section / Page" and opens the drawer. */
function pageBar(page: Page) {
  return page.getByRole('button', { name: 'Open docs navigation', exact: true })
}

/** The page bar's drawer, named after the current tab. */
function docsDrawer(page: Page, tab = 'Docs') {
  return page.getByRole('dialog', { name: tab, exact: true })
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** The page bar's text: the section, a decorative slash, then the page (any page when omitted). */
function pageBarText(section: string, pageLabel?: string) {
  const label = pageLabel ? escapeRegExp(pageLabel) : '\\S.*'
  return new RegExp(`^${escapeRegExp(section)}\\s*/\\s*${label}$`)
}

/** The current section: its tab under the top bar at Desktop, the page bar below Desktop. */
async function expectSection(page: Page, section: string, mobile = false) {
  if (mobile) {
    await expect(pageBar(page)).toBeVisible()
    await expect(pageBar(page)).toHaveText(pageBarText(section))
    return
  }
  const current = page.locator('.docs-section-nav [aria-current="page"]')
  await expect(current).toBeVisible()
  await expect(current).toHaveText(section)
}

test('the top bar has four plain tabs and Docs sections expose product tasks and developer chapters', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const tabs = tabNav(page)
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  await expect(tabs.getByRole('link')).toHaveText(tabLabels)
  // Tabs are plain links, without menus.
  await expect(tabs.getByRole('button')).toHaveCount(0)
  await expect(tabs.locator('[aria-current]')).toHaveText('Home')
  // Home has no section tabs.
  await expect(page.locator('.docs-section-nav')).toBeHidden()
  await expect(page.locator('.docs-section-nav a')).toHaveCount(0)
  for (const [tab, sections] of tabSections) {
    await tabs.getByRole('link', { name: tab, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${tabHrefs[tab]}/?$`))
    await expect(tabs.locator('[aria-current]')).toHaveText(tab)
    await expect(sectionNav(page, tab).getByRole('link')).toHaveText(sections)
    await expect(sectionNav(page, tab).locator('[aria-current="page"]')).toHaveText(sections[0])
  }
  await tabs.getByRole('link', { name: 'Docs', exact: true }).click()
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
    await sectionNav(page, 'Docs').getByRole('link', { name: section.label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${section.path}/?$`))
    await expect(sectionNav(page, 'Docs').locator('[aria-current="page"]')).toHaveText(
      section.label,
    )
    // Only the section's own tab is marked current in the top bar.
    await expect(tabs.locator('[aria-current]')).toHaveText('Docs')
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
  await expect(sectionNav(page, 'Docs').locator('[aria-current="page"]')).toHaveText('Network')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

for (const section of [
  {
    tab: 'Docs',
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
    tab: 'Docs',
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
    tab: 'Docs',
    label: 'Earn',
    overview: '/docs/earn',
    paths: ['/docs/earn/vaults', '/docs/earn/integrate', '/docs/earn/providers'],
  },
  {
    tab: 'Docs',
    label: 'Routes',
    overview: '/docs/routes',
    paths: ['/docs/routes/transfers', '/docs/routes/deposits', '/docs/routes/quotes'],
  },
  {
    tab: 'Docs',
    label: 'Zones',
    overview: '/docs/zones',
    paths: [
      '/docs/zones/privacy',
      '/docs/guide/private-zones',
      '/docs/guide/private-zones/connect-to-a-zone',
    ],
  },
  {
    tab: 'Docs',
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
    tab: 'Docs',
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
    tab: 'Reference',
    label: 'SDKs & CLI',
    overview: '/docs/sdk',
    paths: ['/docs/sdk', '/docs/cli', '/docs/cli/api', '/docs/sdk/typescript/api-client'],
  },
  {
    tab: 'Resources',
    label: 'Partners',
    overview: '/docs/partners',
    paths: [
      '/docs/partners/wallets',
      '/docs/partners/bridges#coinbase',
      '/docs/guide/bridge-relay',
    ],
  },
  {
    tab: 'Reference',
    label: 'API',
    overview: '/docs/api/console',
    paths: ['/docs/api/console', '/docs/api/console/api-keys', '/docs/api/team'],
  },
  {
    tab: 'Docs',
    label: 'Network (node operators)',
    overview: '/docs/guide/node',
    paths: ['/docs/guide/node/installation'],
  },
  {
    tab: 'Docs',
    label: 'Network (Changelog)',
    overview: '/docs/protocol/upgrades',
    paths: ['/docs/protocol/upgrades/t11', '/docs/changelog'],
  },
]) {
  test(`existing deep links select ${section.label} and retain their sidebar`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    const label = section.label.replace(/ \(.*\)$/, '')
    const current = sectionNav(page, section.tab).locator('[aria-current="page"]')
    const tab = tabNav(page).locator('[aria-current]')
    const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
    for (const path of section.paths) {
      const [pathname, anchor] = path.split('#')
      expect((await page.goto(path))?.status(), path).toBe(200)
      await expect(page).toHaveURL(
        (url) => url.pathname === pathname && url.hash === (anchor ? `#${anchor}` : ''),
      )
      if (anchor) await expect(page.locator(`[id="${anchor}"]`)).toHaveCount(1)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(current).toHaveText(label)
      await expect(tab).toHaveText(section.tab)
      await expect(sidebar.locator(`a[href="${section.overview}"]`).first()).toBeVisible()
    }
    expect((await page.reload())?.status()).toBe(200)
    await expect(current).toHaveText(label)
    await expect(tab).toHaveText(section.tab)
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
    await expect(sectionNav(page, 'Docs').getByRole('link')).toHaveText(docsSectionLabels)
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
  await tabNav(page).getByRole('link', { name: 'Reference', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/api\/?$/)
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('API')
})

test('node guides and the Changelog live in Network and retain upgrade URLs', async ({ page }) => {
  await page.goto('/docs/development')
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  const current = page.locator('.docs-section-nav [aria-current="page"]')
  await expect(tabNav(page).getByText('Changelog')).toHaveCount(0)
  await expect(sectionNav(page, 'Docs').getByText('Changelog')).toHaveCount(0)
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
  await sectionNav(page, 'Docs').getByRole('link', { name: 'Network', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/development\/?$/)
})

test('Reference is a keyboard-accessible tab and the old tools hub redirects', async ({ page }) => {
  await page.goto('/')
  // Keys pressed before hydration do nothing; the header search enables once hydrated.
  await expect(
    page.getByRole('button', { name: 'Search documentation', exact: true }),
  ).toBeEnabled()
  const reference = tabNav(page).getByRole('link', { name: 'Reference', exact: true })
  await reference.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/docs\/api\/?$/)
  await expect(reference).toHaveAttribute('aria-current', 'page')
  await expect(
    sectionNav(page, 'Reference').getByRole('link', { name: 'API', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('#related-documentation')).toHaveCount(0)
  expect((await page.goto('/docs/tools'))?.status()).toBe(200)
  await expect(page).toHaveURL(/\/docs\/sdk\/?$/)
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('SDKs & CLI')
  await expect(tabNav(page).locator('[aria-current]')).toHaveText('Reference')
})

for (const path of ['/', '/docs/accounts']) {
  test(`mobile menu lists every tab's sections and the footer links the products on ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(path)
    const variant = path === '/' ? 'full' : 'compact'
    const footer = page.locator('.docs-site-footer')
    await expect(footer).toHaveAttribute('data-variant', variant)
    for (const [label, href] of footerTools[variant]) {
      const link = footer.getByRole('link', { name: `${label} (opens in a new tab)`, exact: true })
      await expect(link).toHaveAttribute('href', href)
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', /noopener/)
    }
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
    const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
    const areas = menu.getByRole('navigation', { name: 'All documentation areas', exact: true })
    await expect(areas.getByRole('link')).toHaveText(mobileMenuLinks)
    for (const label of mobileMenuLinks)
      await expect(areas.getByRole('link', { name: label, exact: true })).toBeVisible()
    // Docs, Reference and Resources are labels above their section links, not links.
    for (const [tab] of tabSections) {
      await expect(areas.getByText(tab, { exact: true })).toBeVisible()
      await expect(areas.getByRole('link', { name: tab, exact: true })).toHaveCount(0)
    }
    await expect(areas.locator('[aria-current="page"]')).toHaveText(
      path === '/' ? 'Home' : 'Accounts',
    )
    await expect(menu.getByRole('link', { name: 'Get API key', exact: true })).toHaveAttribute(
      'href',
      'https://console.tempo.xyz',
    )
    await areas.getByRole('link', { name: 'Network', exact: true }).click()
    await expect(page).toHaveURL(/\/docs\/development\/?$/)
    await expect(menu).toBeHidden()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    await expect(pageBar(page)).toHaveText(pageBarText('Network', 'Introduction'))
    await pageBar(page).click()
    const drawer = docsDrawer(page)
    // Changelog is an always-open Network chapter, so its upgrades list without a toggle.
    await expect(drawer.locator('p').filter({ hasText: /^Changelog$/ })).toBeVisible()
    await drawer.locator('a[href="/docs/protocol/upgrades/t12"]').click()
    await expect(page).toHaveURL(/\/docs\/protocol\/upgrades\/t12\/?$/)
    await expect(drawer).toBeHidden()
  })
}

for (const path of ['/', '/docs/accounts']) {
  for (const width of [1080, 1440]) {
    test(`desktop top bar tabs, search and Get API key stay usable on ${path} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(path)
      const navigation = page.getByRole('navigation', { name: 'Developer navigation' })
      await expect(
        navigation.getByRole('combobox', { name: 'Color theme', includeHidden: true }),
      ).toHaveCount(0)
      await expect(navigation.getByRole('link', { name: 'Blog', exact: true })).toHaveCount(0)
      const tabs = navigation.getByRole('navigation', { name: 'Documentation areas', exact: true })
      await expect(tabs.getByRole('link')).toHaveText(tabLabels)
      await expect(tabs.getByRole('button')).toHaveCount(0)
      await expect(tabs.locator('[aria-current]')).toHaveText(path === '/' ? 'Home' : 'Docs')
      const sectionRow = page.locator('.docs-section-nav')
      await expect(sectionRow.getByRole('link', { name: 'Blog', exact: true })).toHaveCount(0)
      if (path === '/') await expect(sectionRow).toBeHidden()
      else await expect(sectionNav(page, 'Docs').getByRole('link')).toHaveText(docsSectionLabels)
      // Get API key is the one primary action; agent setup and Log in left the top bar.
      await expect(
        navigation.getByRole('button', { name: 'Agent setup', exact: true }),
      ).toHaveCount(0)
      await expect(navigation.getByRole('link', { name: 'Log in', exact: true })).toHaveCount(0)
      const search = navigation.getByRole('button', { name: 'Search documentation', exact: true })
      const apiKey = navigation.getByRole('link', { name: 'Get API key', exact: true })
      await expect(search).toBeEnabled()
      await expect(apiKey).toHaveAttribute('href', 'https://console.tempo.xyz')
      await page.evaluate(() => document.fonts.ready)

      // The tabs, search and Get API key sit left to right, inside the viewport, without overlap.
      const boxes = await Promise.all(
        [...(await tabs.getByRole('link').all()), search, apiKey].map(async (control) => {
          await expect(control).toBeVisible()
          const box = await control.boundingBox()
          if (!box) throw new Error('Header control has no visible bounds')
          return box
        }),
      )
      expect(boxes).toHaveLength(tabLabels.length + 2)
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
  await expect(page.locator('.docs-section-nav')).toBeHidden()
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
  await expect(tabNav(page).getByRole('link', { name: 'Docs', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(
    sectionNav(page, 'Docs').getByRole('link', { name: 'Get started', exact: true }),
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
  await actions.getByRole('button', { name: 'Copy page', exact: true }).click()
  await expect(actions.getByRole('status')).toHaveText(
    'Could not copy. Open View as Markdown to select the page text.',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await actions.getByRole('button', { name: 'More page options', exact: true }).click()
  const markdown = actions.getByRole('menuitem', { name: 'View as Markdown', exact: true })
  await expect(markdown).toBeVisible()
  await expect(markdown).toHaveAttribute('href', '/assets/md/docs/cli.md')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('mobile documentation menu restores focus and navigates to another section', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Build stablecoin payments on Tempo',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true })
  await trigger.click()
  const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('button', { name: 'Close menu', exact: true })).toBeFocused()
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
      .getByRole('navigation', { name: 'All documentation areas', exact: true })
      .getByRole('link', { name: label, exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`${path}/?$`))
    await expect(menu).toBeHidden()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(pageBar(page)).toHaveText(pageBarText(label))
    await pageBar(page).click()
    const drawer = docsDrawer(page)
    await expect(
      drawer
        .getByRole('navigation', { name: 'Docs sections', exact: true })
        .locator('[aria-current="page"]'),
    ).toHaveText(label)
    await expect(drawer.locator(`a[href="${path}"]${outsideSectionTabs}`)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
  }
})

test('mobile sidebars keep useful product guides visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const [path, destination] of [
    ['/docs/earn', '/docs/earn/how-it-works'],
    ['/docs/routes', '/docs/routes/quotes'],
    ['/docs/zones', '/docs/zones/connect'],
  ]) {
    await page.goto(path)
    await pageBar(page).click()
    const drawer = docsDrawer(page)
    await expect(drawer.locator(`a[href="${destination}"]`)).toBeVisible()
    await expect(
      drawer.locator('summary').filter({ hasText: /More about|Earlier testnet/ }),
    ).toHaveCount(0)
    await page.keyboard.press('Escape')
  }
  await page.goto('/docs/accounts')
  await pageBar(page).click()
  const drawer = docsDrawer(page)
  for (const href of ['/docs/accounts/create', '/docs/accounts/fund'])
    await expect(drawer.locator(`a[href="${href}"]`)).toBeVisible()
  // Each Features and Build group opens to its own overview page and guides.
  for (const [group, href] of [
    ['Account Policies', '/docs/accounts/policies'],
    ['Access Keys', '/docs/accounts/access-keys'],
    ['Wallets', '/docs/accounts/wallets'],
  ]) {
    const disclosure = drawer.locator('summary').filter({ hasText: new RegExp(`^${group}$`) })
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
  await expect(pageBar(page)).toHaveText(pageBarText('Accounts', 'Create an Account'))
})

test('sandbox guides stay collapsed under Testnet Sandbox until a sandbox page opens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/zones')
  await pageBar(page).click()
  const drawer = docsDrawer(page)
  const sandbox = drawer.locator('summary').filter({ hasText: /^Testnet Sandbox$/ })
  await expect(sandbox).toBeVisible()
  await expect(drawer.locator('a[href="/docs/guide/private-zones/deposit-to-a-zone"]')).toBeHidden()
  await sandbox.click()
  await drawer.locator('a[href="/docs/guide/private-zones"]').click()
  await expect(page).toHaveURL(/\/docs\/guide\/private-zones\/?$/)
  await pageBar(page).click()
  await expect(drawer.locator('a[href="/docs/zones/privacy"]')).toBeVisible()
  await expect(
    drawer.locator('a[href="/docs/guide/private-zones/deposit-to-a-zone"]'),
  ).toBeVisible()
  await drawer.locator('a[href="/docs/guide/private-zones/deposit-to-a-zone"]').click()
  await expect(page).toHaveURL(/\/docs\/guide\/private-zones\/deposit-to-a-zone\/?$/)
  await pageBar(page).click()
  await expect(
    drawer.locator('a[href="/docs/guide/private-zones/withdraw-from-a-zone"]'),
  ).toBeVisible()
  await expect(drawer.locator('a[href="/docs/zones/deposit"]')).toBeVisible()
})

test('mobile article drawer traps focus and survives client navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/network')
  // Below Desktop the page bar replaces the outline row's "On this page" button.
  const outline = page
    .locator('[data-v-outline-mobile]')
    .getByRole('button', { name: 'On this page', exact: true, includeHidden: true })
  await expect(outline).toHaveCount(1)
  await expect(outline).toBeHidden()
  const trigger = pageBar(page)
  await expect(trigger).toHaveText(pageBarText('Network'))
  await trigger.click()
  const drawer = docsDrawer(page)
  const close = drawer.getByRole('button', { name: 'Close docs navigation', exact: true })
  await expect(close).toBeFocused()
  const lastLink = drawer.getByRole('link', { name: 'Operator updates', exact: true })
  await page.keyboard.press('Shift+Tab')
  await expect(lastLink).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  // The tab's sections come straight after the close button.
  await page.keyboard.press('Tab')
  await expect(
    drawer
      .getByRole('navigation', { name: 'Docs sections', exact: true })
      .getByRole('link', { name: 'Get started', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  await menu.getByRole('link', { name: 'API', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/api\/?$/)
  await expect(menu).toBeHidden()
  await trigger.click()
  // The drawer takes the current tab's name.
  const reference = docsDrawer(page, 'Reference')
  await expect(reference).toBeVisible()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(reference).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('mobile pages without an outline still expose the documentation drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/sdk')
  await expect(page.locator('article[data-v-content] h2')).toHaveCount(0)
  const trigger = pageBar(page)
  await expect(trigger).toBeVisible()
  await expect(trigger).toHaveText(pageBarText('SDKs & CLI', 'Overview'))
  await trigger.click()
  const drawer = docsDrawer(page, 'Reference')
  await expect(drawer).toBeVisible()
  await expect(
    drawer
      .getByRole('navigation', { name: 'Reference sections', exact: true })
      .locator('[aria-current="page"]'),
  ).toHaveText('SDKs & CLI')
  // Tempo SDK is an always-open section, so it renders as a heading above its pages.
  await expect(drawer.locator('p').filter({ hasText: /^Tempo SDK$/ })).toBeVisible()
  await drawer.getByRole('link', { name: 'Python', exact: true }).click()
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
  const menu = actions.getByRole('menu', { name: 'Page options', exact: true })
  const items = menu.getByRole('menuitem')
  await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(menu).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(items).toHaveText(['Copy page', 'View as Markdown', 'Connect your agent'])
  await expect(
    menu.getByRole('menuitem', { name: 'View as Markdown', exact: true }),
  ).toHaveAttribute('href', '/assets/md/docs/accounts.md')
  await expect(items.nth(0)).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(items.nth(1)).toBeFocused()
  await page.keyboard.press('End')
  await expect(items.nth(2)).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(items.nth(0)).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(items.nth(2)).toBeFocused()
  await page.keyboard.press('Home')
  await expect(items.nth(0)).toBeFocused()
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
  await page.getByRole('heading', { level: 1 }).click({ position: { x: 4, y: 4 } })
  await expect(menu).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  // Agent setup moved from the header into this menu and Get started › Build with AI.
  await trigger.click()
  await menu.getByRole('menuitem', { name: 'Connect your agent', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/guide\/using-tempo-with-ai\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Build with AI')
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('Get started')
})

test('Copy page copies readable Markdown and survives client navigation', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/docs/cli')
  const actions = page.locator('.docs-page-actions')
  const options = actions.getByRole('button', { name: 'More page options', exact: true })
  const markdown = actions.getByRole('menuitem', { name: 'View as Markdown', exact: true })
  await actions.getByRole('button', { name: 'Copy page', exact: true }).click()
  await expect(actions.getByRole('status')).toHaveText('Page Markdown copied to clipboard.')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('# Tempo CLI')
  await options.click()
  await expect(markdown).toHaveAttribute('href', '/assets/md/docs/cli.md')
  await page.keyboard.press('Escape')
  await expect(markdown).toBeHidden()
  await sectionNav(page, 'Reference').getByRole('link', { name: 'API', exact: true }).click()
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
  const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
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
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await menu.getByRole('combobox', { name: 'Color theme' }).selectOption('light')
  await expect(page.locator('html')).toHaveAttribute('data-vocs-theme', 'light')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
})

function developerDisclosure(sidebar: Locator, label: string, mobile: boolean) {
  return mobile
    ? sidebar.locator('summary:visible').filter({ hasText: new RegExp(`^${label}$`) })
    : sidebar.getByRole('button', { name: new RegExp(`^(?:Toggle )?${label}(?: section)?$`) })
}

async function expectOnlyActiveLeaf(sidebar: Locator, path: string) {
  const active = sidebar.locator(activeSidebarLink)
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', path)
  const hrefs = await sidebar
    .locator(`a[href]${outsideSectionTabs}`)
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
      if (mobile) await pageBar(page).click()
      const sidebar = mobile
        ? docsDrawer(page)
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
      if (mobile) await pageBar(page).click()
      await expect(sidebar.locator(`a[href="${entry.sibling}"]`)).toBeVisible()
      await expectOnlyActiveLeaf(sidebar, entry.path)
      if ('guide' in entry && entry.guide) {
        // Guides and their references keep the same tab and chapter through client navigation.
        await sidebar.locator(`a[href="${entry.guide}"]`).click()
        await expect(page).toHaveURL(new RegExp(`${entry.guide}/?$`))
        await expectSection(page, entry.section, mobile)
        if (mobile) await pageBar(page).click()
        await expectOnlyActiveLeaf(sidebar, entry.guide)
        await expect(disclosure).toBeVisible()
        await expect(sidebar.locator(`a[href="${entry.path}"]`)).toBeVisible()
        await sidebar.locator(`a[href="${entry.path}"]`).click()
        await expect(page).toHaveURL(new RegExp(`${entry.path}/?$`))
        await expectSection(page, entry.section, mobile)
        if (mobile) await pageBar(page).click()
        await expectOnlyActiveLeaf(sidebar, entry.path)
        await expect(sidebar.locator(`a[href="${entry.guide}"]`)).toBeVisible()
      }
    })
  }

  test(`${surface} MPP deep links navigate within Machine Payments`, async ({ page }) => {
    await page.setViewportSize(viewport)
    expect((await page.goto('/docs/guide/machine-payments/pay-as-you-go'))?.status()).toBe(200)
    await expectSection(page, 'Machine Payments', mobile)
    if (mobile) await pageBar(page).click()
    const sidebar = mobile
      ? docsDrawer(page)
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
    if (mobile) await pageBar(page).click()
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('href', '/docs/guide/machine-payments/server')
  })
}

test('the developer guide catalog opens Browser payments in its Network home', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/docs/development')
  const article = page.locator('article[data-v-content]')
  await expect(article.getByRole('heading', { level: 1 })).toHaveText('Tempo EVM')
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('Network')
  const browserPayments = article.locator('a[href="/docs/guide/payments/send-a-payment/browser"]')
  await expect(browserPayments).toHaveCount(1)
  await expect(browserPayments).toHaveText('Browser payments')
  await browserPayments.click()
  await expect(page).toHaveURL(/\/docs\/guide\/payments\/send-a-payment\/browser\/?$/)
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('Network')
  await expect(article.getByRole('heading', { level: 1 })).toHaveText('Browser payments')
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  await expect(sidebar.getByRole('link', { name: 'Send payments', exact: true })).toBeVisible()
  const active = sidebar.locator('a[data-active], a[aria-current="page"]')
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', '/docs/guide/payments/send-a-payment/browser')
})
