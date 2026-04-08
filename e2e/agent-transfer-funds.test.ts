import { expect, test } from '@playwright/test'
import { execute } from '@sourcegraph/amp-sdk'
import { createPublicClient, http, isHash } from 'viem'
import { tempoModerato } from 'viem/chains'

const PROMPT = `
Build a TypeScript CLI script that transfers 0.01 pathUSD on Tempo testnet.

Requirements:
1. Use the tempo.ts SDK (already installed in this project)
2. Generate a random private key for the sender
3. Use the faucet to fund the sender address
4. Transfer 0.01 pathUSD to address 0xbeefcafe54750903ac1c8909323af7beb21ea2cb
5. Output ONLY the transaction hash on the final line (no other output after it)

Network details:
- Chain ID: 42431
- RPC: https://rpc.moderato.tempo.xyz
- Native token: pathUSD (not ETH, not USDC)
- Use MPP (Meta Payment Protocol) for gas - the network handles fees automatically

Write the script to a file called transfer-test.ts in the current directory, then run it with tsx.
`

test('agent can build and execute a transfer script using docs context', async () => {
  test.setTimeout(300_000) // 5 minutes for agent execution

  let lastResult = ''
  let threadUrl = ''

  // Execute Amp agent with the prompt
  for await (const message of execute({
    prompt: PROMPT,
    options: {
      cwd: process.cwd(),
      dangerouslyAllowAll: true,
      mode: 'smart',
    },
  })) {
    if (message.type === 'system') {
      threadUrl = `https://ampcode.com/threads/${message.session_id}`
      console.log(`Amp thread: ${threadUrl}`)
    } else if (message.type === 'result') {
      lastResult = message.result
      console.log('Agent result:', lastResult)
    }
  }

  // Extract transaction hash from the result
  // The agent should output the tx hash on the final line
  const lines = lastResult.trim().split('\n')
  const lastLine = lines[lines.length - 1].trim()

  // Try to find a transaction hash in the output
  const txHashMatch = lastLine.match(/0x[a-fA-F0-9]{64}/) || lastResult.match(/0x[a-fA-F0-9]{64}/)
  expect(txHashMatch, `Expected transaction hash in output. Thread: ${threadUrl}`).toBeTruthy()

  const txHash = txHashMatch?.[0] as `0x${string}`
  expect(isHash(txHash), `Invalid transaction hash format: ${txHash}`).toBe(true)

  // Verify the transaction exists on-chain
  const client = createPublicClient({
    chain: tempoModerato,
    transport: http(),
  })

  const receipt = await client.getTransactionReceipt({ hash: txHash })
  expect(receipt, `Transaction ${txHash} not found on chain`).toBeTruthy()
  expect(receipt.status).toBe('success')

  console.log(`✓ Transaction verified: ${txHash}`)
  console.log(`  Block: ${receipt.blockNumber}`)
  console.log(`  Gas used: ${receipt.gasUsed}`)
})
