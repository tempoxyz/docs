import { spawnSync } from 'node:child_process'

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

console.log(
  `Markdown component audit passed (${report.components.length} allowlisted component types).`,
)
