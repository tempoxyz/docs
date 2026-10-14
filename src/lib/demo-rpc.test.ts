import { watchContractEvent } from 'viem/actions'
import { tempoModerato } from 'viem/chains'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getConfig } from '../wagmi.config'

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('demo RPC traffic', () => {
  it('batches simultaneous reads into one HTTP request', async () => {
    const fetch = vi.fn(async (_url: unknown, init: RequestInit) => {
      const requests = JSON.parse(String(init.body))
      return Response.json(
        requests.map(({ id }: { id: number }) => ({ jsonrpc: '2.0', id, result: '0x1' })),
      )
    })
    vi.stubGlobal('fetch', fetch)
    const client = getConfig().getClient({ chainId: tempoModerato.id })

    await expect(
      Promise.all([
        client.request({ method: 'eth_blockNumber' }),
        client.request({ method: 'eth_chainId' }),
      ]),
    ).resolves.toEqual(['0x1', '0x1'])
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(
      JSON.parse(String(fetch.mock.calls[0][1].body)).map(
        (request: { method: string }) => request.method,
      ),
    ).toEqual(['eth_blockNumber', 'eth_chainId'])
  })

  it('bounds event-filter polling while a demo is waiting for funds', async () => {
    vi.useFakeTimers()
    const methods: string[] = []
    vi.stubGlobal('fetch', async (_url: unknown, init: RequestInit) => {
      const requests = JSON.parse(String(init.body))
      return Response.json(
        requests.map(({ id, method }: { id: number; method: string }) => {
          methods.push(method)
          return { jsonrpc: '2.0', id, result: method === 'eth_newFilter' ? '0x1' : [] }
        }),
      )
    })
    const client = getConfig().getClient({ chainId: tempoModerato.id })
    const stop = watchContractEvent(client, {
      abi: [{ type: 'event', name: 'Transfer', inputs: [] }],
      eventName: 'Transfer',
      poll: true,
      onLogs: () => {},
    })
    try {
      await vi.advanceTimersByTimeAsync(6_100)
      expect(methods.filter((method) => method === 'eth_getFilterChanges')).toHaveLength(3)
    } finally {
      stop()
      await vi.advanceTimersByTimeAsync(100)
    }
  })
})
