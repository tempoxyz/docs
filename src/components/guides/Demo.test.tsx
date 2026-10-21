import { Actions } from '@wagmi/core/tempo'
import { renderToStaticMarkup } from 'react-dom/server'
import { type Address, getAddress } from 'viem'
import { tempoModerato } from 'viem/chains'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { Container, Step } from './Demo'
import { alphaUsd, betaUsd, ousd, pathUsd, thetaUsd } from './tokens'

const state = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  watches: [] as {
    address: Address[]
    args: Record<string, Address>
    enabled: boolean
    onLogs: (logs: { address: Address }[]) => void
  }[],
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: undefined }),
  useConnect: () => ({ connect: vi.fn(), isPending: false }),
  useConnections: () => [],
  useDisconnect: () => ({ disconnect: vi.fn() }),
  useReadContract: () => ({ data: 'AlphaUSD', isPending: false }),
  useWatchContractEvent: (parameters: (typeof state.watches)[number]) => {
    state.watches.push(parameters)
  },
}))

vi.mock('wagmi/tempo', () => ({
  Hooks: {
    token: {
      useGetBalance: () => ({ data: { amount: 1n, formatted: '1' }, isPending: false }),
    },
  },
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: state.invalidateQueries }),
}))

vi.mock('../../wagmi.config', () => ({
  useTempoWalletConnector: () => undefined,
  useWebAuthnConnector: () => undefined,
}))

vi.mock('../../lib/posthog', () => ({ usePostHogTracking: () => ({}) }))

// Compiled zyzz recipes need the site's compiler plugin; markup is what these tests check.
vi.mock(
  './Demo.recipes',
  () =>
    new Proxy(
      {},
      {
        get: (_, key) => (key === 'then' ? undefined : () => ({ className: '' })),
        has: (_, key) => key !== 'then',
      },
    ),
)
vi.mock('../../styles/controls', () => ({ button: () => ({}) }))
vi.mock('../Badge', () => ({ Badge: () => null }))
vi.mock('../Container', () => ({ Container: () => null }))

const account = '0x2d0517b4567A426e92B5AB5c508D0171B7825506'
const tokens: Address[] = [ousd, pathUsd, alphaUsd, betaUsd, thetaUsd]

beforeEach(() => {
  state.invalidateQueries.mockReset()
  state.watches = []
})

describe('Container.BalancesFooter', () => {
  test('watches transfers once per direction for every token', () => {
    renderToStaticMarkup(<Container.BalancesFooter address={account} tokens={tokens} />)

    expect(state.watches.map(({ address, args, enabled }) => ({ address, args, enabled }))).toEqual(
      [
        { address: tokens, args: { to: account }, enabled: true },
        { address: tokens, args: { from: account }, enabled: true },
      ],
    )
  })

  test('refreshes only the balances of tokens that moved', async () => {
    const { partialMatchKey } =
      await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query')
    const balanceKey = (token: Address) =>
      Actions.token.getBalance.queryKey({ account, token, chainId: tempoModerato.id })
    renderToStaticMarkup(<Container.BalancesFooter address={account} tokens={tokens} />)

    // RPC logs carry addresses in any case.
    state.watches[0]?.onLogs([{ address: getAddress(betaUsd) }])

    expect(state.invalidateQueries).toHaveBeenCalledTimes(1)
    const [{ queryKey }] = state.invalidateQueries.mock.calls[0] ?? []
    expect(partialMatchKey(balanceKey(betaUsd), queryKey)).toBe(true)
    expect(partialMatchKey(balanceKey(alphaUsd), queryKey)).toBe(false)
  })

  test('does not watch transfers before an account connects', () => {
    renderToStaticMarkup(<Container.BalancesFooter tokens={tokens} />)

    expect(state.watches.map(({ enabled }) => enabled)).toEqual([false, false])
  })
})

test('Step reports errors through the alert role that live E2E tests detect', () => {
  const html = renderToStaticMarkup(
    <Step
      active
      completed={false}
      error={new Error('Request exceeds defined limit.')}
      number={2}
      title="Add testnet funds to your wallet."
    />,
  )

  expect(html).toMatch(/<div role="alert"[^>]*>Request exceeds defined limit\.<\/div><\/div>$/)
})
