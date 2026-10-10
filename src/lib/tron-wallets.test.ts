import { decodeFunctionData, erc20Abi } from 'viem'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  sendTronCall,
  TronRevertedError,
  type TronWallet,
  trc20Transfer,
  tronToEvm,
  waitForTronReceipt,
} from './tron-wallets'

const usdt = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
const sender = 'TFegAih8buiLL9zWvpsCsX4bp3FsGkuzGY'
afterEach(() => vi.unstubAllGlobals())

describe('Tron addresses and calls', () => {
  it('converts a Base58Check address to the EVM address used in ABI arguments', () => {
    expect(tronToEvm(usdt)).toBe('0xa614f803b6fd780986a42c78ec9c7f77e6ded13c')
    expect(() => tronToEvm('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6u')).toThrow('Invalid Tron address')
    expect(() => tronToEvm('0xa614f803b6fd780986a42c78ec9c7f77e6ded13c')).toThrow()
  })
  it('encodes a TRC-20 transfer to a deposit address', () => {
    const call = trc20Transfer(usdt, sender, 1_000_000n)
    expect(call).toMatchObject({ to: usdt, value: '0x0' })
    expect(decodeFunctionData({ abi: erc20Abi, data: call.data as `0x${string}` })).toEqual({
      functionName: 'transfer',
      args: [expect.stringMatching(/^0x[\da-f]{40}$/i), 1_000_000n],
    })
  })
})

function wallet({
  data,
  account = sender,
}: {
  data?: (input: string) => string
  account?: string
} = {}) {
  const sign = vi.fn(async (tx: unknown) => tx)
  const sendRawTransaction = vi.fn(async () => ({ result: true, txid: 'ab'.repeat(32) }))
  const tronWeb = {
    defaultAddress: { base58: account },
    transactionBuilder: {
      triggerSmartContract: vi.fn(async (_to: string, _s: string, options: { input: string }) => ({
        result: { result: true },
        transaction: {
          txID: 'ab'.repeat(32),
          raw_data: {
            contract: [
              { parameter: { value: { data: data ? data(options.input) : options.input } } },
            ],
          },
        },
      })),
    },
    trx: {
      sign,
      sendRawTransaction,
      getBlockByNumber: async () => ({ blockID: `${'0'.repeat(56)}2b6653dc` }),
    },
  }
  const tron: TronWallet = {
    id: 'tronlink',
    name: 'TronLink',
    tip1193: true,
    provider: { request: async () => [account] },
    tronWeb: () => tronWeb as unknown as ReturnType<TronWallet['tronWeb']>,
  }
  return { tron, sign, sendRawTransaction, tronWeb }
}

describe('Tron signing', () => {
  const call = { to: usdt, data: '0x095ea7b3ABCD', value: '0x0' }
  it('signs the exact calldata from the sender and returns the transaction ID', async () => {
    const { tron, sign, tronWeb } = wallet()
    const onBroadcast = vi.fn()
    await expect(sendTronCall(tron, sender, call, onBroadcast)).resolves.toBe('ab'.repeat(32))
    expect(tronWeb.transactionBuilder.triggerSmartContract).toHaveBeenCalledWith(
      usdt,
      '',
      expect.objectContaining({ input: '095ea7b3abcd', callValue: 0 }),
      [],
      sender,
    )
    expect(sign).toHaveBeenCalledOnce()
    expect(onBroadcast).toHaveBeenCalledOnce()
  })
  it('never signs a call an older wallet built without the calldata', async () => {
    const { tron, sign } = wallet({ data: () => '' })
    await expect(sendTronCall(tron, sender, call)).rejects.toThrow('built a different call')
    expect(sign).not.toHaveBeenCalled()
  })
  it('refuses a wallet signed in as someone other than the sender', async () => {
    const { tron, sign } = wallet({ account: usdt })
    await expect(sendTronCall(tron, sender, call)).rejects.toThrow('Switch TronLink to the sender')
    expect(sign).not.toHaveBeenCalled()
  })
})

describe('Tron receipts', () => {
  const info = (body: unknown) => vi.fn().mockResolvedValue(Response.json(body))
  it('waits for the including block, then checks the result', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(Response.json({}))
      .mockResolvedValueOnce(new Response('{"Error":"rate limited"}', { status: 429 }))
      .mockResolvedValueOnce(Response.json({ blockNumber: 1, receipt: { result: 'SUCCESS' } }))
    vi.stubGlobal('fetch', fetcher)
    await expect(waitForTronReceipt('ab', { intervalMs: 0 })).resolves.toMatchObject({
      blockNumber: 1,
    })
    expect(fetcher).toHaveBeenCalledTimes(3)
  })
  it('reports running out of energy as a funding problem', async () => {
    vi.stubGlobal(
      'fetch',
      info({ blockNumber: 1, result: 'FAILED', receipt: { result: 'OUT_OF_ENERGY' } }),
    )
    const failure = waitForTronReceipt('ab', { intervalMs: 0 })
    await expect(failure).rejects.toBeInstanceOf(TronRevertedError)
    await expect(failure).rejects.toThrow('Add TRX to the sender')
  })
})
