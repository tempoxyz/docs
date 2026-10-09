import { routesApi } from './routes-execution'
import type { TestMethod, TestMode, TestRoute } from './routes-test'

/** What a completed demo run did, to describe for an agent that repeats it for another user. */
export type AgentRun = {
  route: TestRoute
  method: TestMethod
  mode: TestMode
  /** The amount the reader entered, in whole units of `amountToken`. */
  amount: string
  amountToken: { symbol: string; decimals: number }
  subsidize: boolean
  quoteQuery: Record<string, unknown>
  createBody: Record<string, unknown>
  /** The reader's own addresses, replaced with placeholders for the next user. */
  addresses: { sender?: string; recipient?: string; refundAddress?: string }
  outcome: { deliveredAmount?: string; destinationHash?: string }
}

const placeholders = {
  sender: '<SENDER>',
  recipient: '<RECIPIENT>',
  refundAddress: '<REFUND_ADDRESS>',
} as const

/** Replace the reader's addresses with placeholders, so nothing user-specific carries over. */
function generalize(values: Record<string, unknown>, addresses: AgentRun['addresses']) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => {
      const match = (Object.keys(placeholders) as (keyof typeof placeholders)[]).find(
        (name) => addresses[name] && value === addresses[name],
      )
      return [key, match ? placeholders[match] : value]
    }),
  )
}

const query = (values: Record<string, unknown>) =>
  Object.entries(values)
    .map(([key, value]) =>
      String(value).startsWith('<')
        ? `${key}=${value}`
        : `${key}=${encodeURIComponent(String(value))}`,
    )
    .join('&')

/** Markdown instructions for an AI agent to send the same route for another user. */
export function agentInstructions(run: AgentRun): string {
  const { route, method, outcome } = run
  const transfer = method === 'transfer'
  const kind = transfer ? 'transfers' : 'deposit-addresses'
  const source = `${route.sourceToken.symbol} on ${route.sourceChain.name}`
  const destination = `${route.destinationToken.symbol} on ${route.destinationChain.name}`
  const quoteQuery = generalize(run.quoteQuery, run.addresses)
  const createBody = generalize(run.createBody, run.addresses)
  const tempoSource = /^eip155:(4217|42431)$/.test(route.sourceChain.id)
  const read = transfer ? 'transfers/<TRANSFER_ID>' : 'deposits/<DEPOSIT_ID>'
  const lines = [
    `# Send ${run.amount} ${run.amountToken.symbol} from ${source} to ${destination}`,
    '',
    `Reproduce this Tempo Routes ${transfer ? 'transfer' : 'deposit address'} for a user with the Routes API.${outcome.deliveredAmount ? ` A run of it delivered ${outcome.deliveredAmount} ${route.destinationToken.symbol}.` : ''} Show the user the quote and get their approval before anything moves funds.`,
    '',
    '## Inputs from the user',
    '',
    '| Input | What it is |',
    '| --- | --- |',
    '| `TEMPO_API_KEY` | A Tempo project API key with `routes:read` and `routes:write`, in the environment. Never print it. |',
    ...(transfer
      ? [
          `| \`<SENDER>\` | The user's ${route.sourceChain.name} address. It signs the source transactions and holds the ${route.sourceToken.symbol}. |`,
        ]
      : [`| \`<REFUND_ADDRESS>\` | The user's ${route.sourceChain.name} address for refunds. |`]),
    `| \`<RECIPIENT>\` | The ${route.destinationChain.name} address that receives the ${route.destinationToken.symbol}. |`,
    '',
    '## The route',
    '',
    `- Source: ${source} (\`${route.sourceToken.tokenKey}\`)`,
    `- Destination: ${destination} (\`${route.destinationToken.tokenKey}\`)`,
    `- Method: ${transfer ? `transfer, mode \`${run.mode}\`` : 'deposit address'}`,
    `- Amount: ${run.amount} ${run.amountToken.symbol} (\`${String(run.quoteQuery.amount)}\` base units)`,
    `- 1:1 delivery: ${run.subsidize ? 'requested (`subsidize=true`), which needs the organization to be approved' : 'not requested'}`,
    '',
    '## 1. Quote the route',
    '',
    '```bash',
    `curl -s "${routesApi}/${kind}/quote?${query(quoteQuery)}" \\`,
    '  -H "tempo-api-key: $TEMPO_API_KEY"',
    '```',
    '',
    `Show the user \`sourceAmount\`, \`destinationAmount\`, and \`fees\`. A quote is not reserved${transfer ? '; `quote.expiresAt` is when it stops being executable' : ''}.`,
    '',
    `## 2. Create the ${transfer ? 'transfer' : 'deposit address'}`,
    '',
    '```bash',
    `curl -s -X POST "${routesApi}/${kind}" \\`,
    '  -H "tempo-api-key: $TEMPO_API_KEY" \\',
    '  -H "content-type: application/json" \\',
    '  -H "idempotency-key: <NEW_UUID>" \\',
    `  -d '${JSON.stringify(createBody)}'`,
    '```',
    '',
    `Save \`id\`${transfer ? ' and `action`' : ' and `address`'}. If the request fails or times out, retry it with the same idempotency key and body, so it cannot create a duplicate.`,
    '',
    ...(transfer
      ? [
          '## 3. Sign and send the source transactions',
          '',
          tempoSource
            ? '- Send every entry in `action.calls` in one Tempo transaction from `<SENDER>` (for example with `wallet_sendCalls`), and wait for its receipt.'
            : `- Sign and broadcast each entry in \`action.calls\` (\`action.type\` is \`${route.sourceChain.id.startsWith('tron:') ? 'tron:calls' : 'evm:calls'}\`) from \`<SENDER>\` on ${route.sourceChain.name}, in order. Wait for each receipt to succeed before sending the next.`,
          '- Check `quote.expiresAt` before each broadcast, and stop if it has passed.',
          '- Never send a call again once it may have been broadcast. Check the sender’s history first.',
          '- Register the hashes:',
          '',
          '```bash',
          `curl -s -X POST "${routesApi}/transfers/<TRANSFER_ID>/source-transactions" \\`,
          '  -H "tempo-api-key: $TEMPO_API_KEY" \\',
          '  -H "content-type: application/json" \\',
          `  -d '{"transactionHashes":["<HASH_1>"]}'`,
          '```',
          '',
          'Retry every 3 seconds while the API answers `source_transaction_pending`.',
        ]
      : [
          '## 3. Fund the deposit address',
          '',
          `- Send exactly ${run.amount} ${run.amountToken.symbol} on ${route.sourceChain.name} to \`address\`, from any wallet the user controls.`,
          '- Find the deposit every 6 seconds until one appears, and save its `id`:',
          '',
          '```bash',
          `curl -s "${routesApi}/deposits?depositAddress=<ADDRESS>" -H "tempo-api-key: $TEMPO_API_KEY"`,
          '```',
        ]),
    '',
    '## 4. Track delivery',
    '',
    '```bash',
    `curl -s "${routesApi}/${read}" -H "tempo-api-key: $TEMPO_API_KEY"`,
    '```',
    '',
    'Read it every 6 seconds until `status` is `completed`, `refunded`, `action-required`, or `expired`. Success is `completed`: report `destinationAmount` and `destinationTransactionHashes` to the user.',
    ...(outcome.destinationHash
      ? [
          '',
          '## Reference run',
          '',
          `The demo run delivered ${outcome.deliveredAmount ?? 'the transfer'} ${route.destinationToken.symbol}, in destination transaction \`${outcome.destinationHash}\`.`,
        ]
      : []),
    '',
  ]
  return lines.join('\n')
}
