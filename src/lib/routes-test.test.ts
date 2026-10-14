import { describe, expect, it } from 'vitest'
import {
  canSubsidize,
  demoMethods,
  directorySchema,
  routeChoices,
  routeQuoteRequest,
  routeTestRequest,
  subsidizedDelivery,
  type TestRoute,
  toBaseUnits,
} from './routes-test'

const route: TestRoute = {
  id: 'test-route',
  sourceChain: { id: 'eip155:1', name: 'Ethereum', addressFormat: 'hex' },
  destinationChain: { id: 'eip155:4217', name: 'Tempo', addressFormat: 'hex' },
  sourceToken: { tokenKey: 'eip155:1/erc20:source', symbol: 'USDC', decimals: 6 },
  destinationToken: { tokenKey: 'eip155:4217/erc20:destination', symbol: 'USDY', decimals: 18 },
  capabilities: { depositAddress: true, transfer: { modes: ['exactSource'] } },
}
const input = {
  method: 'transfer' as const,
  mode: 'exactSource' as const,
  amount: '1.234567',
  sender: `0x${'1'.repeat(40)}`,
  recipient: `0x${'2'.repeat(40)}`,
  refundAddress: `0x${'3'.repeat(40)}`,
}

describe('route test requests', () => {
  it('converts high-precision amounts without floating point or rounding', () => {
    expect(toBaseUnits('9007199254740993.000001', 6)).toBe('9007199254740993000001')
    expect(toBaseUnits('0.000000000000000001', 18)).toBe('1')
    for (const amount of ['0', '-1', '1e6', '1.0000001', 'NaN']) {
      expect(() => toBaseUnits(amount, 6)).toThrow()
    }
  })
  it('uses destination precision only for an advertised exact-destination transfer', () => {
    expect(() => routeTestRequest(route, { ...input, mode: 'exactDestination' })).toThrow(
      'advertise',
    )
    const supported = {
      ...route,
      capabilities: { transfer: { modes: ['exactDestination' as const] } },
    }
    expect(routeTestRequest(supported, { ...input, mode: 'exactDestination' }).amount).toBe(
      '1234567000000000000',
    )
  })
  it('supports omitted capabilities without inventing transfer support', () => {
    const depositOnly = directorySchema.parse({
      data: [{ ...route, capabilities: { depositAddress: true } }],
      nextCursor: null,
    }).data[0]
    expect(() => routeTestRequest(depositOnly, input)).toThrow('advertise')
    const request = routeTestRequest(depositOnly, { ...input, method: 'depositAddress' })
    expect(request).toMatchObject({
      amount: '1234567',
      refundAddress: input.refundAddress,
      subsidize: false,
    })
    expect(request).not.toHaveProperty('sender')
    expect(request).not.toHaveProperty('mode')
    expect(request).not.toHaveProperty('destinationChain')
  })
  it('rejects incomplete hex addresses and control characters', () => {
    expect(() => routeTestRequest(route, { ...input, recipient: '0x123' })).toThrow('20-byte')
    expect(() => routeTestRequest(route, { ...input, sender: 'a\nb' })).toThrow('sender')
  })
  it('requests 1:1 delivery only where the directory advertises a subsidy', () => {
    const subsidized = { ...route, subsidies: { transfer: true, depositAddress: false } }
    expect(canSubsidize(subsidized, 'transfer', 'exactSource')).toBe(true)
    expect(canSubsidize(subsidized, 'transfer', 'exactDestination')).toBe(false)
    expect(canSubsidize(subsidized, 'depositAddress', 'exactSource')).toBe(false)
    expect(canSubsidize(route, 'transfer', 'exactSource')).toBe(false)
    expect(routeTestRequest(subsidized, { ...input, subsidize: true }).subsidize).toBe(true)
    expect(() =>
      routeTestRequest(subsidized, { ...input, method: 'depositAddress', subsidize: true }),
    ).toThrow('1:1')
    expect(() => routeTestRequest(route, { ...input, subsidize: true })).toThrow('1:1')
  })
  it('cascades network and asset choices and fills single options', () => {
    const tempo = { id: 'eip155:4217', name: 'Tempo', addressFormat: 'hex' }
    const tron = { id: 'tron:0x2b6653dc', name: 'Tron', addressFormat: 'base58check' }
    const base = { id: 'eip155:8453', name: 'Base', addressFormat: 'hex' }
    const usdt0 = { tokenKey: 'tempo/usdt0', symbol: 'USDT0', decimals: 6 }
    const toTron = {
      ...route,
      id: 'to-tron',
      sourceChain: tempo,
      sourceToken: usdt0,
      destinationChain: tron,
      destinationToken: { tokenKey: 'tron/usdt', symbol: 'USDT', decimals: 6 },
    }
    const toBase = { ...route, id: 'to-base', destinationChain: base }
    const empty = { sourceChain: '', sourceToken: '', destinationChain: '', destinationToken: '' }
    const all = [route, toBase, toTron]
    expect(routeChoices(all, empty).options.sourceChains.map((o) => o.label)).toEqual([
      'Ethereum',
      'Tempo',
    ])
    const fromTempo = routeChoices(all, { ...empty, sourceChain: tempo.id })
    expect(fromTempo.pick).toEqual({
      sourceChain: tempo.id,
      sourceToken: usdt0.tokenKey,
      destinationChain: tron.id,
      destinationToken: 'tron/usdt',
    })
    expect(fromTempo.route?.id).toBe('to-tron')
    const fromEthereum = routeChoices(all, { ...empty, sourceChain: 'eip155:1' })
    expect(fromEthereum.options.destinationChains.map((o) => o.label)).toEqual(['Tempo', 'Base'])
    expect(fromEthereum.route).toBeUndefined()
  })
  it('reads the 1:1 amount a subsidy guarantees and what Tempo covers', () => {
    const deposit = {
      subsidize: true,
      sourceAmount: { baseUnits: '1000000', decimals: 6, formatted: '1' },
      destinationAmount: { baseUnits: '959100', decimals: 6, formatted: '0.9591' },
      destinationAmountMin: { baseUnits: '959100', decimals: 6, formatted: '0.9591' },
    }
    expect(subsidizedDelivery(deposit, 6)).toEqual({ guaranteed: 1_000_000n, covered: 40_900n })
    const transfer = {
      ...deposit,
      sourceAmount: { baseUnits: '1000000000000000000', decimals: 18 },
      destinationAmountRequired: { baseUnits: '999000', decimals: 6 },
    }
    expect(subsidizedDelivery(transfer, 6)).toEqual({ guaranteed: 999_000n, covered: 39_900n })
    expect(subsidizedDelivery({ sourceAmount: { baseUnits: '5', decimals: 18 } }, 6)).toEqual({
      guaranteed: 0n,
      covered: 0n,
    })
  })
  it('offers wallet transfers for EVM and Tron sources, and deposits everywhere', () => {
    expect(demoMethods(route)).toEqual(['transfer', 'depositAddress'])
    const tron = { id: 'tron:0x2b6653dc', name: 'Tron', addressFormat: 'base58check' }
    expect(demoMethods({ ...route, sourceChain: tron })).toEqual(['transfer', 'depositAddress'])
    // Routes has no signed action for Solana sources, so they fund through deposit addresses.
    const solana = {
      id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      name: 'Solana',
      addressFormat: 'base58',
    }
    expect(demoMethods({ ...route, sourceChain: solana })).toEqual(['depositAddress'])
    expect(
      demoMethods({
        ...route,
        sourceChain: solana,
        capabilities: { transfer: { modes: ['exactSource'] } },
      }),
    ).toEqual([])
  })
  it('quotes a deposit address without the creation-only recipient and refund address', () => {
    const deposit = {
      ...input,
      method: 'depositAddress' as const,
      recipient: '',
      refundAddress: '',
    }
    expect(routeQuoteRequest(route, deposit)).toEqual({
      amount: '1234567',
      sourceChain: route.sourceChain.id,
      sourceToken: route.sourceToken.tokenKey,
      destinationToken: route.destinationToken.tokenKey,
      subsidize: false,
    })
    expect(() => routeTestRequest(route, deposit)).toThrow('recipient')
    // Transfer quotes need the same sender and recipient as creation.
    expect(() => routeQuoteRequest(route, { ...input, sender: '' })).toThrow('sender')
    expect(routeQuoteRequest(route, input)).toEqual(routeTestRequest(route, input))
  })
})
