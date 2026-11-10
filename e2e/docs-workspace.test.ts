import { expect, type Locator, type Page, test } from '@playwright/test'

// Single-section areas are links in the global nav; the others open a menu of sections.
const areaLinkLabels = ['Get started', 'Tempo EVM', 'Operate']
const areaMenus = [
  ['Products', ['Accounts', 'Earn', 'Routes', 'Zones', 'Machine Payments']],
  ['Reference', ['API reference', 'SDKs & CLI']],
  ['Resources', ['Guides', 'Partners']],
] as const
const productLabels = areaMenus[0][1]
const mobileAreaLinks = [
  'Get started',
  ...productLabels,
  'Tempo EVM',
  'Operate',
  ...areaMenus[1][1],
  ...areaMenus[2][1],
]
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
    instruction: null,
    install: /^Install Codex CLI/,
  },
  {
    label: 'Claude Code',
    command: 'claude plugin marketplace add tempoxyz/plugins\nclaude plugin install docs@tempo',
    instruction: null,
    install: /^Install Claude Code/,
  },
  {
    label: 'Amp',
    command: 'amp mcp add tempo https://mcp.tempo.xyz',
    instruction: /MCP/,
    install: /^Install Amp/,
  },
  {
    label: 'Skills',
    command: 'npx skills add tempoxyz/plugins --skill docs',
    instruction: /skill/i,
    install: null,
  },
  {
    label: 'MCP',
    command: 'https://mcp.tempo.xyz',
    instruction: /HTTP MCP server/i,
    install: null,
  },
] as const

/** The six documentation areas in the desktop header. */
function areaNav(page: Page) {
  return page
    .getByRole('navigation', { name: 'Developer navigation' })
    .getByRole('navigation', { name: 'Documentation areas', exact: true })
}

/** The second row: the sections of the current area. */
function sectionNav(page: Page, area: string) {
  return page
    .locator('.docs-section-nav')
    .getByRole('navigation', { name: `${area} sections`, exact: true })
}

/** Opens an area menu in the desktop header and returns its section links. */
async function openAreaMenu(page: Page, area: string) {
  const item = areaNav(page)
    .getByRole('listitem')
    .filter({ has: page.getByRole('button', { name: area, exact: true }) })
  const trigger = item.getByRole('button', { name: area, exact: true })
  // A click before hydration does nothing, so retry until the menu opens.
  await expect(async () => {
    if ((await trigger.getAttribute('aria-expanded')) !== 'true') await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
  }).toPass()
  return item.getByRole('link')
}

/** Opens a section from the desktop header: an area link, or a section in an area menu. */
async function openSection(page: Page, area: string, section: string) {
  if (areaLinkLabels.includes(area)) {
    await areaNav(page).getByRole('link', { name: area, exact: true }).click()
    return
  }
  const links = await openAreaMenu(page, area)
  await links.filter({ hasText: new RegExp(`^${section}`) }).click()
}

test('seven sections expose product tasks and expandable developer chapters', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  const areas = areaNav(page)
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  await expect(areas.getByRole('link')).toHaveText(areaLinkLabels)
  await expect(areas.getByRole('button')).toHaveText(areaMenus.map(([area]) => area))
  for (const [area, sections] of areaMenus) {
    const links = await openAreaMenu(page, area)
    await expect(links).toHaveText(sections.map((section) => new RegExp(`^${section}`)))
    await page.keyboard.press('Escape')
    await expect(links).toHaveCount(0)
  }
  for (const section of [
    {
      area: 'Get started',
      label: 'Get Started',
      path: '/get-started',
      links: ['/get-started/quickstart', '/docs/guide/using-tempo-with-ai'],
    },
    {
      area: 'Products',
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
      area: 'Products',
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
      area: 'Products',
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
      area: 'Products',
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
      area: 'Products',
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
      area: 'Tempo EVM',
      label: 'Tempo EVM',
      path: '/docs/development',
      links: ['/docs/development'],
    },
  ]) {
    await openSection(page, section.area, section.label)
    await expect(page).toHaveURL(new RegExp(`${section.path}/?$`))
    await expect(sectionNav(page, section.area).locator('[aria-current="page"]')).toHaveText(
      section.label,
    )
    // Only the section's own area is marked current in the header.
    await expect(areas.locator('[aria-current]:visible')).toHaveText(section.area)
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
  await expect(sectionNav(page, 'Tempo EVM').locator('[aria-current="page"]')).toHaveText(
    'Tempo EVM',
  )
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

for (const section of [
  {
    label: 'Get Started',
    overview: '/get-started',
    paths: [
      '/get-started/quickstart',
      '/docs/guide/using-tempo-with-ai',
      '/docs/quickstart/faucet',
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
    label: 'Tempo EVM',
    overview: '/docs/development',
    paths: [
      '/docs/network/transactions',
      '/docs/build',
      '/docs/payments',
      '/docs/guide/payments/transfer-memos',
      '/docs/guide/payments/send-a-payment/examples',
      '/docs/guide/getting-funds',
      '/docs/quickstart/connection-details',
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
    label: 'API reference',
    overview: '/docs/api/console',
    paths: ['/docs/api/console', '/docs/api/console/api-keys', '/docs/api/team'],
  },
  {
    label: 'Operate',
    overview: '/docs/guide/node',
    paths: ['/docs/guide/node/installation'],
  },
  {
    label: 'Operate (Changelog)',
    overview: '/docs/protocol/upgrades',
    paths: ['/docs/protocol/upgrades/t11', '/docs/changelog'],
  },
]) {
  test(`existing deep links select ${section.label} and retain their sidebar`, async ({ page }) => {
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
      await expect(navigation.locator('[aria-current="page"]')).toHaveText(
        section.label.replace(/ \(.*\)$/, ''),
      )
      await expect(sidebar.locator(`a[href="${section.overview}"]`).first()).toBeVisible()
    }
    expect((await page.reload())?.status()).toBe(200)
    await expect(navigation.locator('[aria-current="page"]')).toHaveText(
      section.label.replace(/ \(.*\)$/, ''),
    )
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
    await expect(sectionNav(page, 'Products').getByRole('link')).toHaveText(productLabels)
  }
})

test('Earn task pages and API reference remain distinct', async ({ page }) => {
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
  await openSection(page, 'Reference', 'API reference')
  await expect(page).toHaveURL(/\/docs\/api\/?$/)
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('API reference')
})

test('Changelog lives in Operate and retains upgrade URLs', async ({ page }) => {
  await page.goto('/docs/development')
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  await expect(areaNav(page).getByText('Changelog')).toHaveCount(0)
  const upgrades = sidebar.locator('a[href="/docs/protocol/upgrades"]')
  // The Tempo EVM sidebar no longer carries the Changelog chapter.
  await expect(upgrades).toHaveCount(0)
  await openSection(page, 'Operate', 'Operate')
  await expect(page).toHaveURL(/\/docs\/guide\/node\/?$/)
  await upgrades.click()
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('Operate')
  await sidebar.locator('a[href="/docs/protocol/upgrades/t11"]').click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('T11 Network Upgrade')
  expect((await page.reload())?.status()).toBe(200)
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('Operate')
  await sidebar.getByRole('link', { name: 'Node releases', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/changelog\/?$/)
  await openSection(page, 'Tempo EVM', 'Tempo EVM')
  await expect(page).toHaveURL(/\/docs\/development\/?$/)
})

test('API reference is a keyboard-accessible utility and the old tools hub redirects', async ({
  page,
}) => {
  await page.goto('/')
  // Keys pressed before hydration do nothing; the header search enables once hydrated.
  await expect(
    page.getByRole('button', { name: 'Search documentation', exact: true }),
  ).toBeEnabled()
  const reference = areaNav(page).getByRole('button', { name: 'Reference', exact: true })
  await reference.focus()
  await page.keyboard.press('Enter')
  await expect(reference).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Tab')
  await expect(areaNav(page).getByRole('link', { name: /^API reference/ })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/docs\/api\/?$/)
  await expect(
    sectionNav(page, 'Reference').getByRole('link', { name: 'API reference', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(page.locator('#related-documentation')).toHaveCount(0)
  expect((await page.goto('/docs/tools'))?.status()).toBe(200)
  await expect(page).toHaveURL(/\/docs\/sdk\/?$/)
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('SDKs & CLI')
})

for (const path of ['/', '/docs/accounts']) {
  test(`mobile navigation separates products, utilities, and external tools on ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(path)
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
    const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
    const areas = menu.getByRole('navigation', { name: 'All documentation areas', exact: true })
    await expect(areas.getByRole('link')).toHaveText(mobileAreaLinks)
    for (const label of mobileAreaLinks)
      await expect(areas.getByRole('link', { name: label, exact: true })).toBeVisible()
    // Products, Reference and Resources are labels above their section links, not links.
    for (const [area] of areaMenus)
      await expect(areas.getByText(area, { exact: true })).toBeVisible()
    const tools = menu.getByRole('navigation', { name: 'External tools', exact: true })
    for (const [label, href] of externalTools) {
      const link = tools.getByRole('link', { name: label, exact: true })
      await expect(link).toHaveAttribute('href', href)
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', /noopener/)
    }
    await areas.getByRole('link', { name: 'Operate', exact: true }).click()
    await expect(page).toHaveURL(/\/docs\/guide\/node\/?$/)
    await expect(menu).toBeHidden()
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
    await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
    // Changelog is an always-open Operate chapter, so its upgrades list without a toggle.
    await expect(drawer.locator('p').filter({ hasText: /^Changelog$/ })).toBeVisible()
    await drawer.locator('a[href="/docs/protocol/upgrades/t12"]').click()
    await expect(page).toHaveURL(/\/docs\/protocol\/upgrades\/t12\/?$/)
    await expect(drawer).toBeHidden()
  })
}

for (const path of ['/', '/docs/accounts']) {
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
      await expect(navigation.getByRole('link', { name: 'Blog', exact: true })).toHaveCount(0)
      const areas = navigation.getByRole('navigation', { name: 'Documentation areas', exact: true })
      await expect(areas.getByRole('link')).toHaveText(areaLinkLabels)
      await expect(areas.getByRole('button')).toHaveText(areaMenus.map(([area]) => area))
      const sectionRow = page.locator('.docs-section-nav')
      await expect(sectionRow.getByRole('link', { name: 'Blog', exact: true })).toHaveCount(0)
      const search = navigation.getByRole('button', { name: 'Search documentation', exact: true })
      const agents = navigation.getByRole('button', { name: 'Agent setup', exact: true })
      const login = navigation.getByRole('link', { name: 'Log in', exact: true })
      const apiKey = navigation.getByRole('link', { name: 'Get API key', exact: true })
      await expect(agents).toBeEnabled()
      await page.evaluate(() => document.fonts.ready)

      const boxes = await Promise.all(
        [search, agents, login, apiKey].map(async (control) => {
          await expect(control).toBeVisible()
          const box = await control.boundingBox()
          if (!box) throw new Error('Header control has no visible bounds')
          return box
        }),
      )
      const [searchBox, agentsBox] = boxes
      expect(agentsBox.x).toBeGreaterThan(searchBox.x + searchBox.width)
      for (const box of boxes) expect(box.x + box.width).toBeLessThanOrEqual(width)
      for (const [index, a] of boxes.entries()) {
        for (const b of boxes.slice(index + 1)) {
          expect(a.x + a.width <= b.x || b.x + b.width <= a.x).toBe(true)
        }
      }

      await agents.click()
      const panel = page.locator('#docs-agent-tools')
      await expect(panel).toBeVisible()
      await expect(agents).toHaveAttribute('aria-expanded', 'true')
      await expect(sectionRow.getByRole('navigation')).toBeVisible()
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

test('entry page offers agent setup and payment guides', async ({ page, context, request }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Build stablecoin payments on Tempo',
  )
  await expect(page.locator('[data-v-gutter-left]')).toBeHidden()
  await expect(page.locator('.tempo-docs-home-product-group')).toHaveCount(6)
  for (const product of ['accounts', 'earn', 'routes', 'zones', 'agents', 'development']) {
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
  for (const { label, command, instruction, install } of homeAgentSetups) {
    const multipleCommands = command.includes('\n')
    const commandSuccess =
      label === 'MCP'
        ? 'URL copied. Add it as an HTTP MCP server in your agent’s settings.'
        : multipleCommands
          ? 'Commands copied. Paste them into your terminal and run both commands.'
          : 'Command copied. Paste it into your terminal and run it.'
    await setup.getByRole('radio', { name: label, exact: true }).click()
    await expect(installStatus).toHaveText('')
    const instructionText = setup.locator(
      '.tempo-agent-start-install .tempo-agent-start-instruction',
    )
    if (instruction) await expect(instructionText).toContainText(instruction)
    else await expect(instructionText).toHaveCount(0)
    // The install link sits on the Connect Tempo docs heading row.
    const installLink = setup.locator('.tempo-agent-start-heading .tempo-agent-start-prerequisite')
    if (install) await expect(installLink).toContainText(install)
    else await expect(installLink).toHaveCount(0)
    await setup
      .getByRole('button', {
        name:
          label === 'MCP'
            ? 'Copy URL for MCP'
            : `Copy command${multipleCommands ? 's' : ''} for ${label}`,
        exact: true,
      })
      .click()
    await expect(installStatus).toHaveText(commandSuccess)
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command)
  }
  await setup.getByRole('radio', { name: 'Codex', exact: true }).click()
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
  await page.waitForURL(/\/get-started\/quickstart\/?$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quickstart')
  await expect(
    sectionNav(page, 'Get started').getByRole('link', { name: 'Get Started', exact: true }),
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
    const commandFailure =
      label === 'MCP'
        ? 'Copy failed. Select and copy the server URL above.'
        : multipleCommands
          ? 'Copy failed. Select and copy both commands above.'
          : 'Copy failed. Select and copy the command above.'
    await setup.getByRole('radio', { name: label, exact: true }).click()
    await expect(installStatus).toHaveText('')
    await setup
      .getByRole('button', {
        name:
          label === 'MCP'
            ? 'Copy URL for MCP'
            : `Copy command${multipleCommands ? 's' : ''} for ${label}`,
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
    ['Tempo EVM', '/docs/development'],
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
    await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
    await expect(drawer.locator(`a[href="${path}"]`)).toBeVisible()
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
    await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
    await expect(drawer.locator(`a[href="${destination}"]`)).toBeVisible()
    await expect(
      drawer.locator('summary').filter({ hasText: /More about|Earlier testnet/ }),
    ).toHaveCount(0)
    await page.keyboard.press('Escape')
  }
  await page.goto('/docs/accounts')
  await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
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
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('Accounts')
})

test('sandbox guides stay collapsed under Testnet Sandbox until a sandbox page opens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/zones')
  await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
  const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
  const sandbox = drawer.locator('summary').filter({ hasText: /^Testnet Sandbox$/ })
  await expect(sandbox).toBeVisible()
  await expect(drawer.locator('a[href="/docs/guide/private-zones/deposit-to-a-zone"]')).toBeHidden()
  await sandbox.click()
  await drawer.locator('a[href="/docs/guide/private-zones"]').click()
  await expect(page).toHaveURL(/\/docs\/guide\/private-zones\/?$/)
  await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
  await expect(drawer.locator('a[href="/docs/zones/privacy"]')).toBeVisible()
  await expect(
    drawer.locator('a[href="/docs/guide/private-zones/deposit-to-a-zone"]'),
  ).toBeVisible()
  await drawer.locator('a[href="/docs/guide/private-zones/deposit-to-a-zone"]').click()
  await expect(page).toHaveURL(/\/docs\/guide\/private-zones\/deposit-to-a-zone\/?$/)
  await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
  await expect(
    drawer.locator('a[href="/docs/guide/private-zones/withdraw-from-a-zone"]'),
  ).toBeVisible()
  await expect(drawer.locator('a[href="/docs/zones/deposit"]')).toBeVisible()
})

test('mobile article drawer traps focus and survives client navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/docs/network')
  const trigger = page.getByRole('button', { name: 'Open docs navigation', exact: true })
  await trigger.click()
  const drawer = page.getByRole('dialog', { name: 'Documentation', exact: true })
  const close = drawer.getByRole('button', { name: 'Close docs navigation', exact: true })
  await expect(close).toBeFocused()
  const specifications = drawer.getByRole('link', { name: 'All specifications', exact: true })
  await page.keyboard.press('Shift+Tab')
  await expect(specifications).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(trigger).toBeFocused()
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  const menu = page.getByRole('dialog', { name: 'Documentation navigation', exact: true })
  await menu.getByRole('link', { name: 'API reference', exact: true }).click()
  await expect(page).toHaveURL(/\/docs\/api\/?$/)
  await expect(menu).toBeHidden()
  await trigger.click()
  await expect(drawer).toBeVisible()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await expect(drawer).toBeHidden()
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
  // Tempo SDK is an always-open section, so it renders as a heading above its pages.
  await expect(drawer.locator('p').filter({ hasText: /^Tempo SDK$/ })).toBeVisible()
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
  await page.goto('/docs/accounts')
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
  await page.goto('/docs/cli')
  const actions = page.getByRole('navigation', { name: 'Page tools' })
  await actions.getByRole('button', { name: 'Copy for agent' }).click()
  await expect(actions.getByRole('status')).toHaveText('Page Markdown copied to clipboard.')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('# Tempo CLI')
  await expect(actions.getByRole('link', { name: 'View Markdown' })).toHaveAttribute(
    'href',
    '/assets/md/docs/cli.md',
  )
  await sectionNav(page, 'Reference')
    .getByRole('link', { name: 'API reference', exact: true })
    .click()
  await page.waitForURL(/\/docs\/api\/?$/)
  await expect(actions).toHaveCount(1)
  await expect(actions.getByRole('link', { name: 'View Markdown' })).toHaveAttribute(
    'href',
    '/assets/md/docs/api.md',
  )
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
  await menu.getByRole('button', { name: 'Search documentation', exact: true }).click()
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
  const active = sidebar.locator('a[data-active], a[aria-current="page"]')
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
      section: 'Tempo EVM',
      path: '/docs/network/tokens',
      group: 'TIP-20 Tokens',
      sibling: '/docs/guide/issuance/manage-stablecoin',
      unrelated: '/docs/accounts/access-keys',
    },
    {
      name: 'token management',
      section: 'Tempo EVM',
      path: '/docs/guide/issuance/manage-stablecoin',
      group: 'TIP-20 Tokens',
      sibling: '/docs/guide/issuance/mint-stablecoins',
      unrelated: '/docs/accounts/access-keys',
    },
    {
      name: 'wallet integration',
      section: 'Tempo EVM',
      path: '/docs/quickstart/wallet-developers',
      group: 'Accounts and keys',
      sibling: '/docs/development/account-keychain',
      unrelated: '/docs/guide/issuance/manage-stablecoin',
    },
    {
      name: 'transaction specification',
      section: 'Tempo EVM',
      path: '/docs/protocol/transactions/spec-tempo-transaction',
      group: 'Transactions',
      sibling: '/docs/guide/tempo-transaction',
      unrelated: '/docs/network/fees',
      guide: '/docs/guide/tempo-transaction',
    },
    {
      name: 'fee specification',
      section: 'Tempo EVM',
      path: '/docs/protocol/fees/spec-fee',
      group: 'Fees',
      sibling: '/docs/network/fees',
      unrelated: '/docs/network/transactions',
      guide: '/docs/network/fees',
    },
    {
      name: 'token specification',
      section: 'Tempo EVM',
      path: '/docs/protocol/tip20/spec',
      group: 'TIP-20 Tokens',
      sibling: '/docs/network/tokens',
      unrelated: '/docs/accounts/access-keys',
      guide: '/docs/network/tokens',
    },
    {
      name: 'account keychain reference',
      section: 'Tempo EVM',
      path: '/docs/protocol/transactions/AccountKeychain',
      group: 'Accounts and keys',
      sibling: '/docs/development/account-keychain',
      unrelated: '/docs/guide/payments/transfer-memos',
      guide: '/docs/development/account-keychain',
    },
    {
      name: 'receive policy reference',
      section: 'Tempo EVM',
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
      await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText(
        entry.section,
      )
      if (mobile)
        await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
      const sidebar = mobile
        ? page.getByRole('dialog', { name: 'Documentation', exact: true })
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
      if (mobile)
        await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
      await expect(sidebar.locator(`a[href="${entry.sibling}"]`)).toBeVisible()
      await expectOnlyActiveLeaf(sidebar, entry.path)
      if ('guide' in entry && entry.guide) {
        // Guides and their references keep the same tab and chapter through client navigation.
        await sidebar.locator(`a[href="${entry.guide}"]`).click()
        await expect(page).toHaveURL(new RegExp(`${entry.guide}/?$`))
        await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText(
          entry.section,
        )
        if (mobile)
          await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
        await expectOnlyActiveLeaf(sidebar, entry.guide)
        await expect(disclosure).toBeVisible()
        await expect(sidebar.locator(`a[href="${entry.path}"]`)).toBeVisible()
        await sidebar.locator(`a[href="${entry.path}"]`).click()
        await expect(page).toHaveURL(new RegExp(`${entry.path}/?$`))
        await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText(
          entry.section,
        )
        if (mobile)
          await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
        await expectOnlyActiveLeaf(sidebar, entry.path)
        await expect(sidebar.locator(`a[href="${entry.guide}"]`)).toBeVisible()
      }
    })
  }

  test(`${surface} MPP deep links navigate within Machine payments`, async ({ page }) => {
    await page.setViewportSize(viewport)
    expect((await page.goto('/docs/guide/machine-payments/pay-as-you-go'))?.status()).toBe(200)
    await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText(
      'Machine Payments',
    )
    if (mobile)
      await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
    const sidebar = mobile
      ? page.getByRole('dialog', { name: 'Documentation', exact: true })
      : page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
    const active = sidebar.locator('a[data-active], a[aria-current="page"]')
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('href', '/docs/guide/machine-payments/pay-as-you-go')
    await expect(sidebar.getByRole('link', { name: 'Use Mercator', exact: true })).toBeVisible()
    await expect(sidebar.locator('a[href="/docs/network/tokens"]')).toHaveCount(0)
    await sidebar.getByRole('link', { name: 'Accept API payments', exact: true }).click()
    await expect(page).toHaveURL(/\/docs\/guide\/machine-payments\/server\/?$/)
    if (mobile) await expect(sidebar).toBeHidden()
    expect((await page.reload())?.status()).toBe(200)
    await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText(
      'Machine Payments',
    )
    if (mobile)
      await page.getByRole('button', { name: 'Open docs navigation', exact: true }).click()
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('href', '/docs/guide/machine-payments/server')
  })
}

test('the developer guide catalog opens Browser payments in its Tempo EVM home', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/docs/development')
  const article = page.locator('article[data-v-content]')
  await expect(article.getByRole('heading', { level: 1 })).toHaveText('Tempo EVM')
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('Tempo EVM')
  const browserPayments = article.locator('a[href="/docs/guide/payments/send-a-payment/browser"]')
  await expect(browserPayments).toHaveCount(1)
  await expect(browserPayments).toHaveText('Browser payments')
  await browserPayments.click()
  await expect(page).toHaveURL(/\/docs\/guide\/payments\/send-a-payment\/browser\/?$/)
  await expect(page.locator('.docs-section-nav [aria-current="page"]')).toHaveText('Tempo EVM')
  await expect(article.getByRole('heading', { level: 1 })).toHaveText('Browser payments')
  const sidebar = page.locator('[data-v-gutter-left] [data-v-sidebar-container]')
  await expect(sidebar.getByRole('link', { name: 'Send payments', exact: true })).toBeVisible()
  const active = sidebar.locator('a[data-active], a[aria-current="page"]')
  await expect(active).toHaveCount(1)
  await expect(active).toHaveAttribute('href', '/docs/guide/payments/send-a-payment/browser')
})
