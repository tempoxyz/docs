import { spawnSync } from 'node:child_process'
import { glob, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const allowedComponents = new Set([
  'AddFunds',
  'AddFundsToOthers',
  'AddFundsToWallet',
  'AddTokensToWallet',
  'ApproveSpend',
  'Badge',
  'BurnFeeAmmLiquidity',
  'BurnToken',
  'BurnTokenBlocked',
  'Callout',
  'CancelOrder',
  'Card',
  'Cards',
  'CheckFeeAmmPool',
  'Connect',
  'ConnectWallet',
  'CreateOrLoadToken',
  'CreateToken',
  'CreateTokenPolicy',
  'Demo.Container',
  'DepositToTempoWallet',
  'DepositToZone',
  'DocsLinkButton',
  'GrantTokenRoles',
  'LinkTokenPolicy',
  'MakeSwaps',
  'MermaidDiagram',
  'MintFeeAmmLiquidity',
  'MintToken',
  'OpenApi.Endpoints',
  'OpenApi.Playground',
  'PauseUnpauseTransfers',
  'PayWithFeeToken',
  'PayWithIssuedToken',
  'PlaceOrder',
  'QueryOrder',
  'RevokeTokenRoles',
  'SendParallelPayments',
  'SendPayment',
  'SendPaymentWithMemo',
  'SendRelayerSponsoredPayment',
  'SendTokensAcrossZones',
  'SendTokensWithinZone',
  'SetFeeToken',
  'SetSupplyCap',
  'SignInWithTempo',
  'StaticMermaidDiagram',
  'SwapAcrossZones',
  'T7BenchmarkVisual',
  'Tab',
  'Tabs',
  'TempoMcpExplorer',
  'TerminalDemo',
  'TidxQuery',
  'TokenListDemo',
  'VirtualAddressesFastDemo',
  'VirtualAddressesLiveDemo',
  'WithdrawFromZone',
])

const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const audit = spawnSync(command, ['exec', 'vocs', 'markdown-audit', '--json'], {
  encoding: 'utf8',
})

if (audit.error) throw audit.error

let report
try {
  report = JSON.parse(audit.stdout)
} catch {
  console.error(audit.stderr || audit.stdout)
  throw new Error('Vocs did not produce a JSON Markdown audit report.')
}

if (audit.status !== 0 && audit.status !== 1) {
  console.error(audit.stderr)
  process.exit(audit.status ?? 1)
}

const unexpected = report.components.filter(({ name }) => !allowedComponents.has(name))
if (report.errors.length > 0 || unexpected.length > 0) {
  console.error('Markdown component audit failed.')
  for (const { path, error } of report.errors) console.error(`- ${path}: ${error}`)
  for (const { name, count } of unexpected)
    console.error(`- ${name}: ${count} unallowlisted occurrence${count === 1 ? '' : 's'}`)
  process.exit(1)
}

const markdownDirectory = resolve('dist/public/assets/md')
const files = []
for await (const file of glob(`${markdownDirectory}/**/*.md`)) files.push(file)

if (files.length === 0)
  throw new Error('No generated Markdown files found. Run `pnpm run build` before this audit.')

const generatedComponents = new Set()
for (const file of files) {
  const tree = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .parse(await readFile(file, 'utf8'))
  visit(tree, (node) => {
    if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return
    if (!/^[A-Z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)*$/.test(node.name ?? '')) return
    generatedComponents.add(node.name)
  })
}

const unexpectedGenerated = [...generatedComponents].filter((name) => !allowedComponents.has(name))
if (unexpectedGenerated.length > 0) {
  console.error('Generated Markdown component audit failed.')
  for (const name of unexpectedGenerated) console.error(`- ${name}: unallowlisted component`)
  process.exit(1)
}

console.log(
  `Markdown component audit passed (${allowedComponents.size} allowlisted component types).`,
)

function visit(node, callback) {
  callback(node)
  for (const child of node.children ?? []) visit(child, callback)
}
