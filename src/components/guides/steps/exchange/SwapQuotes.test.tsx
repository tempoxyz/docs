import type { ComponentProps, MouseEvent } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BuySwap } from './BuySwap'
import { SellSwap } from './SellSwap'

const state = vi.hoisted(() => ({
  button: undefined as ComponentProps<'button'> | undefined,
  quote: {
    data: undefined as bigint | undefined,
    error: null as Error | null,
    isPending: true,
  },
  sendCalls: {
    sendCallsSync: vi.fn(),
    isPending: false,
    isSuccess: false,
    reset: vi.fn(),
  },
}))

vi.mock('wagmi', () => ({
  useConnection: () => ({ address: '0x0000000000000000000000000000000000000001' }),
  useConnectionEffect: () => {},
  useSendCallsSync: () => state.sendCalls,
}))

vi.mock('wagmi/tempo', () => ({
  Hooks: {
    token: { useGetMetadata: () => ({ data: { decimals: 6, name: 'TestUSD' } }) },
    dex: {
      useBuyQuote: () => state.quote,
      useSellQuote: () => state.quote,
    },
  },
}))

vi.mock('../../Demo', () => ({
  Button: ({ variant: _variant, ...props }: ComponentProps<'button'> & { variant: string }) => {
    state.button = props
    return <button {...props} />
  },
  ExplorerLink: () => null,
}))

describe.each([
  ['buy', BuySwap],
  ['sell', SellSwap],
] as const)('%s quote handling', (_name, Component) => {
  beforeEach(() => {
    state.button = undefined
    state.quote = { data: undefined, error: null, isPending: true }
    state.sendCalls.isPending = false
    state.sendCalls.sendCallsSync.mockClear()
  })

  function click() {
    state.button?.onClick?.({} as MouseEvent<HTMLButtonElement>)
  }

  it('waits for the first quote before allowing a swap', () => {
    const html = renderToStaticMarkup(<Component />)
    expect(html).toContain('Getting a quote...')
    expect(state.button?.disabled).toBe(true)
    click()
    expect(state.sendCalls.sendCallsSync).not.toHaveBeenCalled()
  })

  it('blocks a zero quote', () => {
    state.quote = { data: 0n, error: null, isPending: false }
    const html = renderToStaticMarkup(<Component />)
    expect(html).toContain('No quote is available')
    expect(state.button?.disabled).toBe(true)
    click()
    expect(state.sendCalls.sendCallsSync).not.toHaveBeenCalled()
  })

  it('does not trade using cached data after a quote request fails', () => {
    state.quote = { data: 10_000_000n, error: new Error('Quote timed out'), isPending: false }
    const html = renderToStaticMarkup(<Component />)
    expect(html).toContain('role="alert"')
    expect(html).not.toContain('Quote:</span>')
    expect(state.button?.disabled).toBe(true)
    click()
    expect(state.sendCalls.sendCallsSync).not.toHaveBeenCalled()
  })

  it('allows trading again when a valid quote arrives', () => {
    state.quote = { data: undefined, error: new Error('Quote timed out'), isPending: false }
    renderToStaticMarkup(<Component />)
    expect(state.button?.disabled).toBe(true)

    state.quote = { data: 10_000_000n, error: null, isPending: false }
    const html = renderToStaticMarkup(<Component />)
    expect(html).not.toContain('role="alert"')
    expect(state.button?.disabled).toBe(false)
    click()
    expect(state.sendCalls.sendCallsSync).toHaveBeenCalledOnce()
  })

  it('blocks another submission while a swap is pending', () => {
    state.quote = { data: 10_000_000n, error: null, isPending: false }
    state.sendCalls.isPending = true
    renderToStaticMarkup(<Component />)
    expect(state.button?.disabled).toBe(true)
    click()
    expect(state.sendCalls.sendCallsSync).not.toHaveBeenCalled()
  })
})
