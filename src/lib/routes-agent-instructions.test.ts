import { describe, expect, it } from 'vitest'
import { type AgentRun, agentInstructions } from './routes-agent-instructions'
import type { TestRoute } from './routes-test'

const sender = `0x${'1'.repeat(40)}`
const recipient = `0x${'2'.repeat(40)}`
const route: TestRoute = {
  id: 'route',
  sourceChain: { id: 'eip155:8453', name: 'Base', addressFormat: 'hex' },
  destinationChain: { id: 'eip155:4217', name: 'Tempo', addressFormat: 'hex' },
  sourceToken: { tokenKey: 'eip155:8453/erc20:0xusdc', symbol: 'USDC', decimals: 6 },
  destinationToken: { tokenKey: 'eip155:4217/erc20:0xusdce', symbol: 'USDC.e', decimals: 6 },
  capabilities: { transfer: { modes: ['exactSource'] }, depositAddress: true },
}
const run: AgentRun = {
  route,
  method: 'transfer',
  mode: 'exactSource',
  amount: '1',
  amountToken: { symbol: 'USDC', decimals: 6 },
  subsidize: true,
  quoteQuery: { amount: '1000000', sourceChain: 'eip155:8453', sender, recipient, subsidize: true },
  createBody: { amount: '1000000', sender, recipient, mode: 'exactSource' },
  addresses: { sender, recipient },
  outcome: { deliveredAmount: '1' },
}

describe('agent instructions', () => {
  it('describe the run with placeholders instead of the reader’s addresses', () => {
    const markdown = agentInstructions(run)
    expect(markdown).toContain('# Send 1 USDC from USDC on Base to USDC.e on Tempo')
    expect(markdown).not.toContain(sender)
    expect(markdown).not.toContain(recipient)
    expect(markdown).toContain(
      '/v1/routes/transfers/quote?amount=1000000&sourceChain=eip155%3A8453&sender=<SENDER>&recipient=<RECIPIENT>&subsidize=true',
    )
    expect(markdown).toContain('"sender":"<SENDER>","recipient":"<RECIPIENT>"')
    expect(markdown).toContain('-H "tempo-api-key: $TEMPO_API_KEY"')
    expect(markdown).toContain('## 3. Sign and send the source transactions')
    expect(markdown).toContain('`evm:calls`')
    expect(markdown).toContain('A run of it delivered 1 USDC.e.')
    expect(markdown).not.toMatch(/0x[\da-f]{64}/)
  })
  it('funds a deposit address instead of signing calls', () => {
    const markdown = agentInstructions({
      ...run,
      method: 'depositAddress',
      quoteQuery: { amount: '1000000' },
      createBody: { amount: '1000000', recipient, refundAddress: sender },
      addresses: { recipient, refundAddress: sender },
    })
    expect(markdown).toContain('/v1/routes/deposit-addresses/quote?amount=1000000')
    expect(markdown).toContain('"refundAddress":"<REFUND_ADDRESS>"')
    expect(markdown).toContain('## 3. Fund the deposit address')
    expect(markdown).toContain('/v1/routes/deposits/<DEPOSIT_ID>')
    expect(markdown).not.toContain('source-transactions')
  })
})
