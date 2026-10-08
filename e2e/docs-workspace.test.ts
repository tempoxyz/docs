import { expect, test } from '@playwright/test'

const sectionLabels = [
  'Get Started',
  'Accounts',
  'Payments',
  'Earn',
  'Routes',
  'Zones',
  'Developer Resources',
]
const partnerCategoryPaths = [
  '/docs/ecosystem/assets',
  '/docs/ecosystem/wallets',
  '/docs/ecosystem/exchanges',
  '/docs/ecosystem/bridges',
  '/docs/ecosystem/orchestration',
  '/docs/ecosystem/node-infrastructure',
  '/docs/ecosystem/data-analytics',
  '/docs/ecosystem/developer-tools',
  '/docs/ecosystem/security-compliance',
] as const
const externalTools = [
  ['MPP', 'https://mpp.dev/'],
  ['Mercator', 'https://mercator.sh/'],
  ['Tempo Console', 'https://console.tempo.xyz/'],
  ['Tempo Wallet', 'https://wallet.tempo.xyz/'],
] as const

const homeAgentSetups = [
  {
    label: 'Codex',
    command:
      'codex plugin marketplace add tempoxyz/plugins --ref main\ncodex plugin add docs@tempo',
    instruction: /both commands in your terminal/i,
  },
  {
    label: 'Claude Code',
    command: 'claude plugin marketplace add tempoxyz/plugins\nclaude plugin install docs@tempo',
    instruction: /both commands in your terminal/i,
  },
  {
    label: 'Amp',
    command: 'amp mcp add tempo https://mcp.tempo.xyz',
    instruction: /MCP/,
  },
  {
    label: 'Other',
    command: 'npx skills add tempoxyz/plugins --skill docs',
    instruction: /skill/i,
  },
] as const

test('seven documentation sections and Specifications keep their own sidebars through client navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const navigation = page.getByRole('navigation', { name: 'Documentation sections', exact: true })
  await expect(navigation.getByRole('link')).toHaveText(sectionLabels)
  const utilities = page.locator('.docs-section-utilities')
  await expect(utilities.locator(':scope > a, :scope > .docs-reference-menu > button')).toHaveText([
    'Tools',
    'Specifications',
  ])
  const specifications = utilities.getByRole('link', { name: 'Specifications', exact: true })
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  for (const section of [
    {
      label: 'Accounts',
      path: '/docs/accounts',
      includes: [
        '/docs/accounts/create',
        '/docs/accounts/integrate',
        '/docs/accounts/providers',
        '/docs/accounts/access-keys',
        '/docs/accounts/agents',
        '/docs/quickstart/wallet-developers',
        '/docs/quickstart/tokenlist',
      ],
      excludes: [
        '/docs/payments',
        '/docs/guide/payments',
        '/docs/guide/issuance',
        '/docs/guide/stablecoin-dex',
      ],
    },
    {
      label: 'Payments',
      path: '/docs/payments',
      includes: [
        '/docs/guide/payments/send-a-payment',
        '/docs/guide/payments/accept-a-payment',
        '/docs/agents',
        '/docs/guide/mercator',
        '/docs/guide/machine-payments/client',
        '/docs/guide/machine-payments/server',
      ],
      excludes: ['/docs/accounts/create', '/docs/guide/issuance', '/docs/guide/private-zones'],
    },
    {
      label: 'Earn',
      path: '/docs/earn',
      includes: [
        '/docs/earn/vaults',
        '/docs/earn/integrate',
        '/docs/earn/balances',
        '/docs/earn/withdraw',
        '/docs/earn#connect-a-yield-source',
      ],
      excludes: [
        '/docs/guide/issuance',
        '/docs/guide/machine-payments',
        '/docs/earn#liquidity-and-withdrawals',
      ],
    },
    {
      label: 'Routes',
      path: '/docs/routes',
      includes: [
        '/docs/routes/transfers',
        '/docs/routes/deposits',
        '/docs/routes/delivery',
        '/docs/routes/quotes',
        '/docs/routes/networks',
        '/docs/guide/stablecoin-dex/executing-swaps',
        '/docs/guide/stablecoin-dex/providing-liquidity',
        '/docs/guide/stablecoin-dex/managing-fee-liquidity',
      ],
      excludes: [
        '/docs/guide/payments',
        '/docs/guide/issuance',
        '/docs/guide/bridge-relay',
        '/docs/api/routes/transfers',
      ],
    },
    {
      label: 'Zones',
      path: '/docs/zones',
      includes: [
        '/docs/zones/privacy',
        '/docs/zones/connect',
        '/docs/zones/deposit',
        '/docs/zones/balances',
        '/docs/zones/withdraw',
        '/docs/guide/private-zones/connect-to-a-zone',
        '/docs/guide/private-zones/deposit-to-a-zone',
      ],
      excludes: ['/docs/guide/issuance', '/docs/guide/machine-payments'],
    },
    {
      label: 'Developer Resources',
      path: '/docs/development',
      includes: [
        '/docs/guide/using-tempo-with-ai',
        '/docs/api',
        '/docs/ecosystem',
        '/docs/quickstart/connection-details',
        '/docs/quickstart/evm-compatibility',
      ],
      excludes: ['/docs/guide/issuance', '/docs/guide/private-zones', '/docs/api/console'],
    },
  ]) {
    await navigation.getByRole('link', { name: section.label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${section.path}/?$`))
    await expect(navigation.locator('[aria-current="page"]')).toHaveText(section.label)
    await expect(sidebar).toBeVisible()
    for (const href of section.includes) {
      await expect(sidebar.locator(`a[href$="${href}"]`), `${section.label}: ${href}`).toHaveCount(
        1,
      )
      await expect(
        sidebar.locator(`a[href$="${href}"]`),
        `${section.label}: ${href} is expanded`,
      ).toBeVisible()
    }
    for (const href of section.excludes) {
      await expect(sidebar.locator(`a[href$="${href}"]`), `${section.label}: ${href}`).toHaveCount(
        0,
      )
    }
  }
  await specifications.click()
  await expect(page).toHaveURL(/\/docs\/protocol\/?$/)
  await expect(specifications).toHaveAttribute('aria-current', 'page')
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(0)
  await expect(sidebar.locator('a[href]').first()).toHaveAttribute(
    'href',
    '/docs/protocol/upgrades',
  )
  await sidebar.getByRole('button', { name: 'Tokens and policies', exact: true }).click()
  await expect(sidebar.locator('a[href="/docs/protocol/tip20/overview"]')).toHaveCount(1)
  for (const href of [
    '/docs/guide/node',
    '/docs/guide/issuance',
    '/docs/guide/machine-payments',
    '/docs/guide/private-zones',
  ]) {
    await expect(sidebar.locator(`a[href$="${href}"]`)).toHaveCount(0)
  }
  await navigation.getByRole('link', { name: 'Developer Resources', exact: true }).click()
  await sidebar.getByRole('button', { name: 'Run a node', exact: true }).click()
  await sidebar.locator('a[href="/docs/guide/node"]').click()
  await expect(page).toHaveURL(/\/docs\/guide\/node\/?$/)
  await expect(navigation.locator('[aria-current="page"]')).toHaveText('Developer Resources')
  await expect(specifications).not.toHaveAttribute('aria-current')
  await navigation.getByRole('link', { name: 'Get Started', exact: true }).click()
  await expect(page).toHaveURL(/\/get-started\/?$/)
  await expect(navigation.locator('[aria-current="page"]')).toHaveText('Get Started')
  await expect(sidebar).toBeVisible()
  await expect(sidebar.getByRole('link', { name: 'Overview', exact: true })).toHaveAttribute(
    'href',
    '/get-started',
  )
  await expect(sidebar.locator('nav[data-v-sidebar]').getByRole('link')).toHaveText([
    'Overview',
    'Stablecoins on Tempo',
    'Build with AI',
    'Create an account',
    'Get test funds',
    'First payment',
    'Network details',
  ])
  for (const href of [
    '/get-started/stablecoins',
    '/docs/guide/using-tempo-with-ai',
    '/docs/accounts/create',
    '/docs/quickstart/faucet',
    '/docs/guide/payments/send-a-payment',
    '/docs/quickstart/connection-details',
  ]) {
    await expect(sidebar.locator(`a[href="${href}"]`)).toBeVisible()
  }
  await page.getByRole('link', { name: 'Tempo documentation', exact: true }).click()
  await expect(page).toHaveURL((url) => url.pathname === '/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Documentation', exact: true }),
  ).toBeVisible()
  await expect(sidebar).toBeHidden()
  await page.locator('.tempo-agent-start-footer a').click()
  await expect(page).toHaveURL(/\/docs\/guide\/using-tempo-with-ai\/?$/)
  await expect(navigation.locator('[aria-current="page"]')).toHaveText('Developer Resources')
  await expect(sidebar.locator('a[href$="/docs/development"]')).toHaveCount(1)
  await expect(sidebar.locator('a[href$="/docs/guide/issuance"]')).toHaveCount(0)
})

for (const section of [
  {
    label: 'Accounts',
    overview: '/docs/accounts',
    paths: [
      '/docs/build',
      '/docs/guide/getting-funds',
      '/docs/accounts/create',
      '/docs/accounts/agents',
      '/docs/quickstart/wallet-developers',
      '/docs/quickstart/tokenlist',
    ],
  },
  {
    label: 'Payments',
    overview: '/docs/payments',
    paths: [
      '/docs/guide/payments/transfer-memos',
      '/docs/guide/tempo-transaction',
      '/docs/agents',
      '/docs/guide/mercator',
      '/docs/guide/machine-payments/agent',
      '/docs/guide/machine-payments/server',
    ],
  },
  {
    label: 'Routes',
    overview: '/docs/routes',
    paths: [
      '/docs/routes/transfers',
      '/docs/routes/deposits',
      '/docs/guide/stablecoin-dex/executing-swaps',
    ],
  },
  {
    label: 'Zones',
    overview: '/docs/zones',
    paths: ['/docs/guide/private-zones', '/docs/guide/private-zones/connect-to-a-zone'],
  },
  {
    label: 'Developer Resources',
    overview: '/docs/development',
    paths: [
      ...partnerCategoryPaths,
      '/docs/ecosystem/smart-contract-libraries',
      '/docs/ecosystem/block-explorers',
      '/docs/partners',
      '/docs/guide/ousd',
      '/docs/guide/bridge-relay',
      '/docs/guide/node/installation',
      '/docs/guide/node/upgrade-cadence',
      '/docs/ecosystem/bridges#coinbase',
      '/docs/ecosystem/orchestration#allunity',
      '/docs/tools',
      '/docs/sdk',
      '/docs/guide/using-tempo-with-ai',
      '/docs/api/console',
      '/docs/api/console/api-keys',
      '/docs/quickstart/integrate-tempo',
      '/docs/quickstart/connection-details',
      '/docs/quickstart/evm-compatibility',
      '/docs/protocol/rpc',
    ],
  },
  {
    label: 'Specifications',
    overview: '/docs/protocol',
    paths: ['/docs/guide/issuance/create-a-stablecoin'],
  },
]) {
  test(`existing deep links select the ${section.label} navigation and sidebar`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    const navigation = page.locator('.docs-section-nav')
    const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
    for (const path of section.paths) {
      const [pathname, anchor] = path.split('#')
      expect((await page.goto(path))?.status(), path).toBe(200)
      await expect(page).toHaveURL(
        (url) => url.pathname === pathname && url.hash === (anchor ? `#${anchor}` : ''),
      )
      if (anchor) await expect(page.locator(`[id="${anchor}"]`)).toHaveCount(1)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(navigation.locator('a[aria-current="page"]')).toHaveText(section.label)
      await expect(sidebar).toBeVisible()
      await expect(sidebar.locator(`a[href="${section.overview}"]`)).toHaveCount(1)
    }
    expect((await page.reload())?.status()).toBe(200)
    await expect(navigation.locator('a[aria-current="page"]')).toHaveText(section.label)
    await expect(sidebar.locator(`a[href="${section.overview}"]`)).toHaveCount(1)
  })
}

test('Developer Resources connects AI setup, the console, and partner discovery', async ({
  page,
}) => {
  await page.goto('/docs/development')
  const navigation = page.getByRole('navigation', { name: 'Documentation sections', exact: true })
  const article = page.locator('article[data-v-content]')
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  for (const path of ['/docs/guide/using-tempo-with-ai', '/docs/api/console', '/docs/ecosystem']) {
    await article.locator(`a[href="${path}"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`${path}/?$`))
    await expect(article.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(navigation.locator('a[aria-current="page"]')).toHaveText('Developer Resources')
    if (path === '/docs/ecosystem') {
      for (const category of partnerCategoryPaths) {
        await expect(article.locator(`a[href="${category}"]`).first()).toBeVisible()
      }
      await article.locator('a[href="/docs/ecosystem/wallets"]').first().click()
      await expect(page).toHaveURL(/\/docs\/ecosystem\/wallets\/?$/)
      await expect(navigation.locator('a[aria-current="page"]')).toHaveText('Developer Resources')
    }
    await sidebar.locator('a[href="/docs/development"]').click()
    await expect(page).toHaveURL(/\/docs\/development\/?$/)
  }
})

test('Earn separates choosing, depositing, reading, and withdrawing from the overview', async ({
  page,
}) => {
  await page.goto('/docs/earn')
  const article = page.locator('article[data-v-content]')
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  await expect(
    article.getByRole('heading', { level: 1, name: 'Tempo Earn', exact: true }),
  ).toBeVisible()
  for (const [label, path] of [
    ['Choose a vault', '/docs/earn/vaults'],
    ['Deposit funds', '/docs/earn/integrate'],
    ['Balances and earnings', '/docs/earn/balances'],
    ['Withdraw funds', '/docs/earn/withdraw'],
    ['How Earn works', '/docs/earn/how-it-works'],
  ]) {
    await sidebar.getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${path}/?$`))
    await expect(article.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(sidebar.locator('a[data-active]')).toHaveCount(1)
    await expect(sidebar.locator('a[data-active]')).toHaveAttribute('href', path)
  }
  await sidebar.getByRole('link', { name: 'Balances and earnings', exact: true }).click()
  await article.locator('a[href="/docs/api/earn"]').first().click()
  await expect(page).toHaveURL(/\/docs\/api\/earn\/?$/)
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation sections', exact: true })
      .getByRole('link', { name: 'Developer Resources', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test('Specifications leads to Changelog and keeps existing upgrade URLs usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/docs/protocol')
  const sections = page.getByRole('navigation', { name: 'Documentation sections', exact: true })
  const specifications = page
    .locator('.docs-section-nav')
    .getByRole('link', { name: 'Specifications', exact: true })
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  const changelog = sidebar.getByRole('link', { name: 'Changelog', exact: true })
  const back = sidebar.getByRole('link', { name: '← Back to Specifications', exact: true })
  await expect(changelog).toBeVisible()
  await expect(
    page.getByRole('article').getByRole('link', { name: 'View the changelog →', exact: true }),
  ).toHaveAttribute('href', '/docs/protocol/upgrades')
  await expect(
    page.locator('.docs-section-utilities').getByRole('link', { name: 'Changelog', exact: true }),
  ).toHaveCount(0)
  await expect(sidebar.locator('a[href$="/docs/protocol/upgrades/t11"]')).toHaveCount(0)
  await changelog.click()
  await expect(page).toHaveURL(/\/docs\/protocol\/upgrades\/?$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Changelog', exact: true }),
  ).toBeVisible()
  await expect(specifications).toHaveAttribute('aria-current', 'page')
  await expect(sections.locator('a[aria-current="page"]')).toHaveCount(0)
  await expect(back).toHaveAttribute('href', '/docs/protocol')
  for (const href of [
    '/docs/protocol/upgrades',
    '/docs/protocol/upgrades/t12',
    '/docs/protocol/upgrades/t2',
    '/docs/changelog',
    '/docs/guide/node/upgrade-cadence',
    '/docs/guide/node/network-upgrades',
  ]) {
    await expect(sidebar.locator(`a[href$="${href}"]`)).toHaveCount(1)
  }
  await sidebar.locator('a[href$="/docs/protocol/upgrades/t11"]').click()
  await expect(page).toHaveURL(/\/docs\/protocol\/upgrades\/t11\/?$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'T11 Network Upgrade', exact: true }),
  ).toBeVisible()
  await expect(specifications).toHaveAttribute('aria-current', 'page')
  await expect(sections.locator('a[aria-current="page"]')).toHaveCount(0)
  await expect(back).toHaveAttribute('href', '/docs/protocol')
  expect((await page.reload())?.status()).toBe(200)
  await expect(
    page.getByRole('heading', { level: 1, name: 'T11 Network Upgrade', exact: true }),
  ).toBeVisible()
  await expect(specifications).toHaveAttribute('aria-current', 'page')
  await sidebar.getByRole('link', { name: 'Overview', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/protocol\/upgrades\/?$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Changelog', exact: true }),
  ).toBeVisible()
  await sidebar.getByRole('link', { name: 'Node releases', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/changelog\/?$/)
  await expect(back).toHaveAttribute('href', '/docs/protocol')
  await back.click()
  await expect(page).toHaveURL(/\/docs\/protocol\/?$/)
  await expect(changelog).toBeVisible()
  await expect(back).toHaveCount(0)
})

test('mobile Specifications navigation reaches Changelog from Blog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/blog')
  await expect(page.locator('.docs-section-nav')).toHaveCount(0)
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  const specifications = menu.getByRole('link', { name: 'Specifications', exact: true })
  await expect(menu.getByRole('link', { name: 'Changelog', exact: true })).toHaveCount(0)
  await specifications.click()
  await expect(page).toHaveURL(/\/docs\/protocol\/?$/)
  await expect(menu).toBeHidden()
  await expect(
    page.getByRole('article').getByRole('link', { name: 'View the changelog →', exact: true }),
  ).toHaveAttribute('href', '/docs/protocol/upgrades')
  const trigger = page.getByRole('button', { name: 'Open docs navigation', exact: true })
  const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
  const back = drawer.getByRole('link', { name: '← Back to Specifications', exact: true })
  await trigger.click()
  await drawer.getByRole('link', { name: 'Changelog', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/protocol\/upgrades\/?$/)
  await expect(drawer).toBeHidden()
  await expect(
    page.getByRole('heading', { level: 1, name: 'Changelog', exact: true }),
  ).toBeVisible()
  await trigger.click()
  await expect(back).toHaveAttribute('href', '/docs/protocol')
  await expect(drawer.getByRole('link', { name: 'Overview', exact: true })).toHaveAttribute(
    'href',
    '/docs/protocol/upgrades',
  )
  await expect(drawer.locator('a[href$="/docs/protocol/upgrades/t2"]')).toBeVisible()
  await drawer.locator('a[href$="/docs/protocol/upgrades/t12"]').click()
  await expect(page).toHaveURL(/\/docs\/protocol\/upgrades\/t12\/?$/)
  await expect(drawer).toBeHidden()
  await expect(
    page.getByRole('heading', { level: 1, name: 'T12 Network Upgrade', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await expect(specifications).toHaveAttribute('aria-current', 'page')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await trigger.click()
  await expect(back).toHaveAttribute('href', '/docs/protocol')
  await back.click()
  await expect(page).toHaveURL(/\/docs\/protocol\/?$/)
  await expect(drawer).toBeHidden()
})

test('Tools contains only external destinations and remains keyboard accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const trigger = page.getByRole('button', { name: 'Tools', exact: true })
  const tools = page.getByRole('navigation', { name: 'External tools', exact: true })
  await expect(trigger).toBeEnabled()
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(tools).toBeVisible()
  await expect(tools.getByRole('link')).toHaveCount(externalTools.length)
  for (const [label, href] of externalTools) {
    const link = tools.getByRole('link', { name: label, exact: true })
    await expect(link).toHaveAttribute('href', href)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)
    await expect(link).toHaveAttribute('rel', /noreferrer/)
  }
  await expect(tools.locator('[aria-current]')).toHaveCount(0)
  await page.keyboard.press('Tab')
  const firstLink = tools.getByRole('link', { name: 'MPP', exact: true })
  await expect(firstLink).toBeFocused()
  expect(
    await firstLink.evaluate((element) => {
      const rect = element.getBoundingClientRect()
      return element.contains(
        document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
      )
    }),
  ).toBe(true)
  await page.keyboard.press('Escape')
  await expect(tools).toBeHidden()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.getByRole('heading', { level: 1 }).click({ position: { x: 4, y: 4 } })
  await expect(tools).toBeHidden()
  await trigger.click()
  await page
    .getByRole('navigation', { name: 'Documentation sections', exact: true })
    .getByRole('link', { name: 'Developer Resources', exact: true })
    .click()
  await expect(page).toHaveURL(/\/docs\/development\/?$/)
  await expect(tools).toBeHidden()
  await expect(trigger).not.toHaveAttribute('aria-current')
})

for (const path of ['/', '/blog']) {
  test(`mobile menu separates documentation from external tools on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(path)
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
    const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
    const sections = menu.getByRole('navigation', { name: 'All documentation sections' })
    await expect(sections.getByRole('link')).toHaveCount(sectionLabels.length)
    for (const label of sectionLabels) {
      await expect(sections.getByRole('link', { name: label, exact: true })).toBeVisible()
    }
    await expect(sections.getByRole('link', { name: 'Specifications', exact: true })).toHaveCount(0)
    await expect(menu.getByRole('link', { name: 'Specifications', exact: true })).toHaveAttribute(
      'href',
      '/docs/protocol',
    )
    const tools = menu.getByRole('navigation', { name: 'External tools', exact: true })
    await expect(tools.getByRole('link')).toHaveCount(externalTools.length)
    for (const [label, href] of externalTools) {
      const link = tools.getByRole('link', { name: label, exact: true })
      await expect(link).toHaveAttribute('href', href)
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', /noopener/)
      await expect(link).toHaveAttribute('rel', /noreferrer/)
    }
    await sections.getByRole('link', { name: 'Developer Resources', exact: true }).click()
    await expect(page).toHaveURL(/\/docs\/development\/?$/)
    await expect(menu).toBeHidden()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
    await expect(
      sections.getByRole('link', { name: 'Developer Resources', exact: true }),
    ).toHaveAttribute('aria-current', 'page')
    await expect(tools.locator('[aria-current]')).toHaveCount(0)
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
  })
}

for (const path of ['/', '/blog']) {
  for (const width of [1080, 1440]) {
    test(`desktop header destinations and agent setup stay usable on ${path} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(path)
      const navigation = page.getByRole('navigation', { name: 'Developer navigation' })
      await expect(
        navigation.getByRole('combobox', { name: 'Color theme', includeHidden: true }),
      ).toHaveCount(0)
      const destinations = [
        navigation.getByRole('link', { name: 'Docs', exact: true }),
        navigation.getByRole('link', { name: 'Blog', exact: true }),
      ]
      const search = navigation.getByRole('button', { name: 'Search documentation', exact: true })
      const agents = navigation.getByRole('button', { name: 'Agent setup', exact: true })
      await expect(agents).toBeEnabled()
      await page.evaluate(() => document.fonts.ready)

      const boxes = await Promise.all(
        [...destinations, search, agents].map(async (control) => {
          await expect(control).toBeVisible()
          const box = await control.boundingBox()
          if (!box) throw new Error('Header control has no visible bounds')
          return box
        }),
      )
      for (const box of boxes.slice(0, 2)) {
        expect(box.x).toBeGreaterThan(width / 2)
        expect(box.x + box.width).toBeLessThanOrEqual(width)
      }
      for (const [index, a] of boxes.entries()) {
        for (const b of boxes.slice(index + 1)) {
          expect(a.x + a.width <= b.x || b.x + b.width <= a.x).toBe(true)
        }
      }

      await agents.click()
      const panel = page.locator('#docs-agent-tools')
      await expect(panel).toBeVisible()
      await expect(agents).toHaveAttribute('aria-expanded', 'true')
      const sections = page.getByRole('navigation', { name: 'Documentation sections', exact: true })
      if (path === '/') await expect(sections).toBeVisible()
      else {
        await expect(sections).toHaveCount(0)
        await expect(page.locator('.docs-section-nav')).toHaveCount(0)
      }
      // Visibility alone does not detect another stacking context covering the panel.
      const overlap = await panel.evaluate((element) => {
        const sectionNav = document.querySelector('.docs-section-nav')
        const panelRect = element.getBoundingClientRect()
        const navRect = sectionNav?.getBoundingClientRect() ?? panelRect
        const left = Math.max(panelRect.left, navRect.left)
        const right = Math.min(panelRect.right, navRect.right)
        const top = Math.max(panelRect.top, navRect.top)
        const bottom = Math.min(panelRect.bottom, navRect.bottom)
        return {
          width: right - left,
          height: bottom - top,
          panelReceivesPointer: element.contains(
            document.elementFromPoint((left + right) / 2, (top + bottom) / 2),
          ),
        }
      })
      expect(overlap.width).toBeGreaterThan(0)
      expect(overlap.height).toBeGreaterThan(0)
      expect(overlap.panelReceivesPointer).toBe(true)

      await page.keyboard.press('Escape')
      await expect(panel).toBeHidden()
      await expect(agents).toBeFocused()
      await agents.click()
      await expect(panel).toBeVisible()
      await page.getByRole('heading', { level: 1 }).click({ position: { x: 4, y: 4 } })
      await expect(panel).toBeHidden()
      await expect(agents).toHaveAttribute('aria-expanded', 'false')
    })
  }
}

test('agent-first entry page offers setup and payment guides', async ({
  page,
  context,
  request,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Documentation')
  await expect(page.locator('[data-v-gutter-left]')).toBeHidden()
  await expect(page.locator('.tempo-docs-home-product-group')).toHaveCount(5)
  for (const product of ['accounts', 'payments', 'earn', 'routes', 'zones']) {
    await expect(
      page.locator(`.tempo-docs-home-product-group h3 a[href="/docs/${product}"]`),
    ).toHaveCount(1)
  }
  const setup = page.locator('.tempo-agent-start')
  const installStatus = setup.locator('.tempo-agent-start-install').getByRole('status')
  await expect(setup.getByRole('heading', { level: 3 })).toHaveText('Connect Tempo docs')
  await expect(setup.getByRole('button', { name: /Copy prompt/ })).toHaveCount(0)
  await expect(
    setup.getByRole('link', { name: 'All setup options', exact: false }),
  ).toHaveAttribute('href', '/docs/guide/using-tempo-with-ai')
  for (const { label, command, instruction } of homeAgentSetups) {
    const multipleCommands = command.includes('\n')
    const commandSuccess = multipleCommands
      ? 'Commands copied. Paste them into your terminal and run both commands.'
      : 'Command copied. Paste it into your terminal and run it.'
    await setup.getByRole('button', { name: label, exact: true }).click()
    await expect(installStatus).toHaveText('')
    await expect(
      setup.locator('.tempo-agent-start-install .tempo-agent-start-instruction'),
    ).toContainText(instruction)
    await setup
      .getByRole('button', {
        name: `Copy command${multipleCommands ? 's' : ''} for ${label}`,
        exact: true,
      })
      .click()
    await expect(installStatus).toHaveText(commandSuccess)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command)
  }
  await setup.getByRole('button', { name: 'Codex', exact: true }).click()
  await expect(installStatus).toHaveText('')
  await expect(page.locator('.tempo-docs-home')).not.toContainText('Bring your existing EVM app')
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

  await page.getByRole('link', { name: 'Send your first payment', exact: false }).first().click()
  await page.waitForURL(/\/docs\/guide\/payments\/send-a-payment\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Send a payment')
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation sections' })
      .getByRole('link', { name: 'Payments', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
})

test('agent setup offers manual copy recovery without overflowing a narrow viewport', async ({
  page,
}) => {
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
  await page.goto('/')
  const setup = page.locator('.tempo-agent-start')
  const installStatus = setup.locator('.tempo-agent-start-install').getByRole('status')
  const commands = setup.locator('.tempo-agent-start-command code')
  for (const { label, command } of homeAgentSetups) {
    const multipleCommands = command.includes('\n')
    const commandFailure = multipleCommands
      ? 'Copy failed. Select and copy both commands above.'
      : 'Copy failed. Select and copy the command above.'
    await setup.getByRole('button', { name: label, exact: true }).click()
    await expect(installStatus).toHaveText('')
    await setup
      .getByRole('button', {
        name: `Copy command${multipleCommands ? 's' : ''} for ${label}`,
        exact: true,
      })
      .click()
    await expect(installStatus).toHaveText(commandFailure)
    await expect(commands).toBeVisible()
    expect(await commands.innerText()).toBe(command)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      label,
    ).toBe(true)
  }
})

test('mobile documentation menu restores focus and navigates to another section', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Documentation')
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
    ['Payments', '/docs/payments'],
    ['Developer Resources', '/docs/development'],
  ]) {
    await trigger.click()
    await menu
      .getByRole('navigation', { name: 'All documentation sections' })
      .getByRole('link', { name: label, exact: true })
      .click()
    await expect(page).toHaveURL(new RegExp(`${path}/?$`))
    await expect(menu).toBeHidden()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
    await expect(drawer.locator(`a[href="${path}"]`)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
  }
})

test('mobile product sidebars show supporting tasks without opening a disclosure', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const [path, group, destination] of [
    ['/docs/accounts', 'Wallet development', '/docs/quickstart/wallet-developers'],
    ['/docs/earn', 'For providers', '/docs/earn#connect-a-yield-source'],
    ['/docs/routes', 'For liquidity providers', '/docs/guide/stablecoin-dex/providing-liquidity'],
    ['/docs/zones', 'Testnet sandbox', '/docs/guide/private-zones/connect-to-a-zone'],
  ]) {
    await page.goto(path)
    await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
    const disclosure = drawer.locator('summary').filter({ hasText: new RegExp(`^${group}$`) })
    await expect(disclosure.locator('..')).toHaveJSProperty('open', true)
    await expect(drawer.locator(`a[href="${destination}"]`)).toBeVisible()
    await page.keyboard.press('Escape')
  }
})

test('mobile article drawer survives client navigation and traps keyboard focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/development')
  const trigger = page.getByRole('button', { name: 'Open docs navigation', exact: true })
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
  const close = drawer.getByRole('button', { name: 'Close docs navigation', exact: true })
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  const nodeDisclosure = drawer.locator('summary').filter({ hasText: /^Run a node$/ })
  await expect(nodeDisclosure).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Enter')
  const lastNodeLink = drawer.locator('a[href="/docs/guide/node/upgrade-cadence"]')
  await expect(lastNodeLink).toBeVisible()
  await close.focus()
  await page.keyboard.press('Shift+Tab')
  await expect(lastNodeLink).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(drawer).not.toBeVisible()
  await expect(trigger).toBeFocused()

  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  await menu.getByRole('link', { name: 'Specifications', exact: true }).click()
  await page.waitForURL(/\/docs\/protocol\/?$/)
  await expect(menu).toBeHidden()
  await trigger.click()
  await expect(drawer).toBeVisible()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(drawer).not.toBeVisible()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('mobile pages without an outline still expose the documentation drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/sdk')
  await expect(page.locator('article[data-v-content] h2')).toHaveCount(0)
  const trigger = page.getByRole('button', { name: 'Open docs navigation', exact: true })
  await expect(trigger).toBeVisible()
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
  await expect(drawer).toBeVisible()
  const sdkDisclosure = drawer.locator('summary').filter({ hasText: /^SDKs$/ })
  await expect(sdkDisclosure.locator('..')).toHaveJSProperty('open', true)
  await drawer.getByRole('link', { name: 'Python', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/sdk\/python\/?$/)
  await expect(drawer).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
  await expect(trigger).toBeVisible()
})

test('agent setup closes when keyboard focus leaves and when resizing to mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/blog')
  const trigger = page.getByRole('button', { name: 'Agent setup', exact: true })
  const panel = page.locator('#docs-agent-tools')
  await trigger.click()
  await expect(panel).toBeVisible()
  await panel.locator('a[href], button:not([disabled])').last().focus()
  await page.keyboard.press('Tab')
  await expect(panel).toBeHidden()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')

  await trigger.click()
  await expect(panel).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  // Wait for the menu state to close, beyond CSS hiding the desktop header.
  await expect(panel).toHaveCount(0)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(trigger).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(panel).toBeHidden()
})

test('article tools copy readable Markdown and survive client navigation', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/docs/tools')
  const actions = page.getByRole('navigation', { name: 'Page tools' })
  await actions.getByRole('button', { name: 'Copy for agent' }).click()
  await expect(actions.getByRole('status')).toHaveText('Page Markdown copied to clipboard.')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('# APIs and SDKs')
  await expect(actions.getByRole('link', { name: 'View Markdown' })).toHaveAttribute(
    'href',
    '/assets/md/docs/tools.md',
  )
  await page.locator('[data-v-gutter-left] [data-v-sidebar-container] a[href="/docs/api"]').click()
  await page.waitForURL(/\/docs\/api\/?$/)
  await expect(actions).toHaveCount(1)
  await expect(actions.getByRole('link', { name: 'View Markdown' })).toHaveAttribute(
    'href',
    '/assets/md/docs/api.md',
  )
})

test('blog search reaches working docs search and appearance persists between surfaces', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/blog')
  const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await menu.getByRole('combobox', { name: 'Color theme' }).selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-vocs-theme', 'dark')
  await menu.getByRole('button', { name: 'Search documentation', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('html')).toHaveAttribute('data-vocs-theme', 'dark')
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await menu.getByRole('combobox', { name: 'Color theme' }).selectOption('light')
  await expect(page.locator('html')).toHaveAttribute('data-vocs-theme', 'light')
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
})
