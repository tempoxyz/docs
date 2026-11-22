/**
 * The Start building block that closes every docs page (`StartBuilding.tsx`)
 * and its Markdown export (`ai-docs.ts`), from one list, so people and agents
 * read the same steps and links. Point a step only at a page or product that
 * is live today.
 */
export type StartBuildingPart = string | { label: string; href: string } | { code: string }

export const startBuildingTitle = 'Start building on Tempo'

export const startBuildingSteps: readonly (readonly StartBuildingPart[])[] = [
  [
    'Send your first payment on Moderato testnet with the ',
    { label: 'quickstart', href: '/get-started/quickstart' },
    '.',
  ],
  [
    'Fund any testnet address with test stablecoins from the ',
    { label: 'faucet', href: '/docs/quickstart/faucet' },
    '.',
  ],
  [
    'Connect your coding agent to the Tempo MCP server at ',
    { code: 'https://mcp.tempo.xyz' },
    ', as ',
    { label: 'Build with AI', href: '/docs/guide/using-tempo-with-ai' },
    ' shows.',
  ],
  [
    'Create an API key in ',
    { label: 'Tempo Console', href: 'https://tempo.com/console' },
    ' to call the ',
    { label: 'Tempo API', href: '/docs/api/reference' },
    '.',
  ],
  [
    'To plan a production launch, ',
    { label: 'contact the Tempo team', href: 'https://tempo.com/contact/' },
    '.',
  ],
]

// The docs home and Get Started already lead with these steps.
const routesWithoutStartBuilding = new Set(['/', '/index', '/get-started'])

/** Takes a route with or without the `/developers` mount. */
export function showsStartBuilding(route: string) {
  const normalized =
    route
      .replace(/^\/developers(?=\/|$)/, '')
      .replace(/\.md$/, '')
      .replace(/\/+$/, '') || '/'
  return !routesWithoutStartBuilding.has(normalized)
}

/** The block as a Markdown quote; production exports make its docs links absolute. */
export function renderStartBuildingMarkdown() {
  const part = (item: StartBuildingPart) =>
    typeof item === 'string'
      ? item
      : 'code' in item
        ? `\`${item.code}\``
        : `[${item.label}](${item.href})`
  return [
    `**${startBuildingTitle}**`,
    '',
    ...startBuildingSteps.map((step, index) => `${index + 1}. ${step.map(part).join('')}`),
  ]
    .map((line) => (line ? `> ${line}` : '>'))
    .join('\n')
}
