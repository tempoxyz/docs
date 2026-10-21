import { decodeFunctionData, erc20Abi } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Config, Connector } from 'wagmi'

const actions = vi.hoisted(() => ({
  connect: vi.fn(),
  estimateGas: vi.fn(),
  getConnections: vi.fn(),
  getConnectorClient: vi.fn(),
  sendTransaction: vi.fn(),
  switchChain: vi.fn(),
}))
const viemActions = vi.hoisted(() => ({
  getTransactionCount: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
}))
vi.mock('wagmi/actions', () => actions)
vi.mock('viem/actions', () => viemActions)

const { evmTokenTransfer, sendEvmCall, WalletSendError, waitForEvmCall } = await import(
  './evm-wallets'
)
const { SourceRevertedError } = await import('./routes-execution')

const sender = `0x${'1'.repeat(40)}`
const hash = `0x${'a'.repeat(64)}`
const call = { to: `0x${'2'.repeat(40)}`, data: '0x1234', value: '0x0' }
const config = { getClient: () => ({}) } as unknown as Config
const future = () => new Date(Date.now() + 60_000).toISOString()

function wallet(chainIds: number[] = [8453]) {
  const ids = [...chainIds]
  return { uid: 'rabby', getChainId: vi.fn(async () => (ids.length > 1 ? ids.shift() : ids[0])) }
}
const send = (connector: ReturnType<typeof wallet>, overrides = {}) =>
  sendEvmCall(config, {
    connector: connector as unknown as Connector,
    chainId: 8453,
    sender,
    call,
    expiresAt: future(),
    onHash: vi.fn(),
    ...overrides,
  })

beforeEach(() => {
  actions.getConnections.mockReturnValue([])
  actions.connect.mockResolvedValue({ accounts: [sender], chainId: 8453 })
  actions.getConnectorClient.mockResolvedValue({})
  actions.estimateGas.mockResolvedValue(21_000n)
  actions.sendTransaction.mockResolvedValue(hash)
  actions.switchChain.mockResolvedValue({})
  viemActions.getTransactionCount.mockResolvedValue(34)
})
afterEach(() => vi.clearAllMocks())

describe('EVM wallet sends through wagmi', () => {
  it('connects, sends with its own gas estimate plus headroom, and saves the hash', async () => {
    const onHash = vi.fn()
    const onBroadcast = vi.fn()
    await expect(send(wallet(), { onHash, onBroadcast })).resolves.toBe(hash)
    expect(actions.connect).toHaveBeenCalledWith(config, expect.objectContaining({ chainId: 8453 }))
    expect(actions.sendTransaction).toHaveBeenCalledWith(
      config,
      expect.objectContaining({ account: sender, chainId: 8453, gas: 25_200n, value: 0n }),
    )
    expect(onBroadcast).toHaveBeenCalledOnce()
    expect(onHash).toHaveBeenCalledWith(hash)
  })
  it('reuses an existing connection instead of prompting again', async () => {
    const connector = wallet()
    actions.getConnections.mockReturnValue([{ connector, accounts: [sender] }])
    await send(connector)
    expect(actions.connect).not.toHaveBeenCalled()
  })
  it('switches the wallet to the source network, and stops if it stays elsewhere', async () => {
    await send(wallet([1, 8453]))
    expect(actions.switchChain).toHaveBeenCalledWith(
      config,
      expect.objectContaining({ chainId: 8453 }),
    )
    await expect(send(wallet([1]))).rejects.toThrow('Switch your wallet')
    expect(actions.sendTransaction).toHaveBeenCalledOnce()
  })
  it('refuses another account, and expired actions, before opening the wallet', async () => {
    actions.connect.mockResolvedValue({ accounts: [call.to] })
    await expect(send(wallet())).rejects.toThrow('sender')
    await expect(send(wallet(), { expiresAt: '2000-01-01T00:00:00Z' })).rejects.toThrow('expired')
    expect(actions.sendTransaction).not.toHaveBeenCalled()
  })
  it('treats a wallet error as not broadcast only while the sender nonce stays put', async () => {
    vi.useFakeTimers()
    try {
      const failure = Object.assign(new Error('Unexpected error'), { code: -32603 })
      actions.sendTransaction.mockRejectedValue(new Error('wrapped', { cause: failure }))
      const unmoved = send(wallet())
      const settled = expect(unmoved).rejects.toThrow(
        new WalletSendError('Unexpected error · -32603'),
      )
      await vi.advanceTimersByTimeAsync(2_000)
      await settled

      // The nonce moved, so the wallet may have broadcast: keep its error and the uncertainty.
      viemActions.getTransactionCount.mockResolvedValueOnce(34).mockResolvedValueOnce(35)
      const moved = send(wallet())
      const settledMoved = expect(moved).rejects.toBe(failure)
      await vi.advanceTimersByTimeAsync(2_000)
      await settledMoved
    } finally {
      vi.useRealTimers()
    }
  })
  it('funds a deposit address with a token transfer that has no expiry', async () => {
    const transfer = evmTokenTransfer(call.to, sender, 1_000_000n)
    expect(decodeFunctionData({ abi: erc20Abi, data: transfer.data as `0x${string}` })).toEqual({
      functionName: 'transfer',
      args: [sender, 1_000_000n],
    })
    await expect(
      send(wallet(), { sender: undefined, call: transfer, expiresAt: null }),
    ).resolves.toBe(hash)
  })
  it('stops on a mined revert', async () => {
    viemActions.waitForTransactionReceipt.mockResolvedValueOnce({ status: 'success' })
    await expect(waitForEvmCall(config, 8453, hash)).resolves.toMatchObject({ status: 'success' })
    viemActions.waitForTransactionReceipt.mockResolvedValueOnce({ status: 'reverted' })
    await expect(waitForEvmCall(config, 8453, hash)).rejects.toBeInstanceOf(SourceRevertedError)
  })
})
