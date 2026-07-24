import { spawnSync } from 'node:child_process'
import { glob, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const expectedComponentCounts = {
  AddFunds: 30,
  AddFundsToOthers: 1,
  AddFundsToWallet: 1,
  AddTokensToWallet: 1,
  ApproveSpend: 1,
  Badge: 34,
  BurnFeeAmmLiquidity: 1,
  BurnToken: 1,
  BurnTokenBlocked: 1,
  Callout: 2,
  CancelOrder: 1,
  Card: 333,
  Cards: 93,
  CheckFeeAmmPool: 1,
  Connect: 24,
  ConnectWallet: 2,
  CreateOrLoadToken: 11,
  CreateToken: 3,
  CreateTokenPolicy: 2,
  'Demo.Container': 43,
  DepositToTempoWallet: 1,
  DepositToZone: 1,
  DocsLinkButton: 1,
  GrantTokenRoles: 8,
  LinkTokenPolicy: 2,
  MakeSwaps: 1,
  MermaidDiagram: 6,
  MintFeeAmmLiquidity: 2,
  MintToken: 4,
  'OpenApi.Endpoints': 1,
  PauseUnpauseTransfers: 1,
  PayWithFeeToken: 3,
  PayWithIssuedToken: 1,
  PlaceOrder: 4,
  QueryOrder: 2,
  RevokeTokenRoles: 1,
  SendParallelPayments: 1,
  SendPayment: 2,
  SendPaymentWithMemo: 1,
  SendRelayerSponsoredPayment: 1,
  SendTokensAcrossZones: 1,
  SendTokensWithinZone: 1,
  SetFeeToken: 1,
  SetSupplyCap: 1,
  SignInWithTempo: 1,
  StaticMermaidDiagram: 6,
  SwapAcrossZones: 1,
  T7BenchmarkVisual: 1,
  Tab: 191,
  Tabs: 32,
  TempoMcpExplorer: 1,
  TerminalDemo: 1,
  TidxQuery: 1,
  TokenListDemo: 1,
  VirtualAddressesFastDemo: 1,
  VirtualAddressesLiveDemo: 1,
  WithdrawFromZone: 1,
}

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

if (report.errors.length > 0) {
  console.error('Markdown component audit failed.')
  for (const { path, error } of report.errors) console.error(`- ${path}: ${error}`)
  process.exit(1)
}

const markdownDirectory = resolve('dist/public/assets/md')
const files = []
for await (const file of glob(`${markdownDirectory}/**/*.md`)) files.push(file)

if (files.length === 0)
  throw new Error('No generated Markdown files found. Run `pnpm run build` before this audit.')

const componentCounts = new Map()
for (const file of files) {
  const tree = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .parse(await readFile(file, 'utf8'))
  visit(tree, (node) => {
    if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return
    if (!/^[A-Z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)*$/.test(node.name ?? '')) return
    componentCounts.set(node.name, (componentCounts.get(node.name) ?? 0) + 1)
  })
}

const failures = []
for (const [name, count] of componentCounts) {
  if (!(name in expectedComponentCounts))
    failures.push(`- ${name}: unexpected ${count} occurrence${plural(count)}`)
  else if (count !== expectedComponentCounts[name])
    failures.push(`- ${name}: expected ${expectedComponentCounts[name]}, found ${count}`)
}
for (const [name, count] of Object.entries(expectedComponentCounts)) {
  if (!componentCounts.has(name)) failures.push(`- ${name}: expected ${count}, found 0`)
}

if (failures.length > 0) {
  console.error('Generated Markdown component audit failed.')
  console.error('Update the allowlist only after reviewing the new AI-facing Markdown.')
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Markdown component audit passed (${files.length} generated Markdown files).`)

function visit(node, callback) {
  callback(node)
  for (const child of node.children ?? []) visit(child, callback)
}

function plural(count) {
  return count === 1 ? '' : 's'
}
