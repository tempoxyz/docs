import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TokenSelector } from '../../../TokenSelector'
import { alphaUsd, betaUsd, ousd } from '../../tokens'
import { PayWithFeeToken } from './PayWithFeeToken'

const state = vi.hoisted(() => ({
  address: '0x0000000000000000000000000000000000000001' as string | undefined,
  balances: {} as Record<string, bigint | undefined>,
  balanceError: null as Error | null,
  liquidity: {} as Record<string, boolean | undefined>,
  liquidityError: false,
  pending: false,
  mutate: vi.fn(),
  refetchBalance: vi.fn(),
  refetchLiquidity: vi.fn(),
  hooks: [] as unknown[],
  hookIndex: 0,
}))

// Retain hook state between renders so tests can open the form and change its token.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useMemo: (factory: () => unknown) => factory(),
  useState: (initial: unknown) => {
    const index = state.hookIndex++
    if (!(index in state.hooks)) state.hooks[index] = initial
    return [
      state.hooks[index],
      (value: unknown) => {
        state.hooks[index] = value
      },
    ]
  },
}))
vi.mock('wagmi', () => ({
  useConnection: () => ({ address: state.address }),
  useConnectionEffect: vi.fn(),
  usePublicClient: () => undefined,
}))
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => ({
    data: state.liquidity[queryKey[2]],
    isError: state.liquidityError,
    refetch: state.refetchLiquidity,
  }),
}))
vi.mock('wagmi/tempo', () => ({
  Hooks: {
    token: {
      useGetBalance: ({ token }: { token: string }) => ({
        data:
          state.balances[token] === undefined
            ? undefined
            : {
                amount: state.balances[token],
                formatted: String(Number(state.balances[token]) / 1e6),
              },
        error: state.balanceError,
        refetch: state.refetchBalance,
      }),
      useGetMetadata: () => ({ data: { name: 'OpenUSD' } }),
      useTransferSync: () => ({ mutate: state.mutate, isPending: state.pending }),
    },
  },
}))
vi.mock('../../Demo', () => ({
  Button: 'button',
  ExplorerLink: () => null,
  Step: () => null,
  FAKE_RECIPIENT: '0x0000000000000000000000000000000000000002',
}))

type Element = ReactElement<Record<string, unknown> & { children?: ReactNode }>
function elements(node: ReactNode): Element[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement(child)) return []
    const element = child as Element
    return [element, ...elements(element.props.children)]
  })
}
function renderStep() {
  state.hookIndex = 0
  return PayWithFeeToken({ stepNumber: 3, last: true }).props
}
function button(step: ReturnType<typeof renderStep>, label: string) {
  const result = elements([step.actions, step.children]).find(
    (element) => element.type === 'button' && element.props.children === label,
  )
  if (!result) throw new Error(`Button not found: ${label}`)
  return result.props as { disabled: boolean; onClick: () => void }
}
function openForm() {
  const details = button(renderStep(), 'Enter details')
  expect(details.disabled).toBe(false)
  details.onClick()
  return renderStep()
}
function requirement(step: ReturnType<typeof renderStep>) {
  return elements(step.children).find((element) => element.props.role === 'status')?.props.children
}
function chooseToken(step: ReturnType<typeof renderStep>, token: string) {
  const selector = elements(step.children).find((element) => element.type === TokenSelector)
  if (!selector) throw new Error('Fee token selector not found')
  ;(selector.props.onChange as (token: string) => void)(token)
  return renderStep()
}

beforeEach(() => {
  vi.clearAllMocks()
  state.address = '0x0000000000000000000000000000000000000001'
  state.balances = { [alphaUsd]: 200_000_000n, [ousd]: 0n, [betaUsd]: 100_000_000n }
  state.liquidity = { [alphaUsd]: true, [ousd]: true, [betaUsd]: true }
  state.balanceError = null
  state.liquidityError = false
  state.pending = false
  state.hooks = []
})

describe('fee-token demo recovery', () => {
  it('lets a funded user replace missing OpenUSD and submit using BetaUSD', () => {
    const blocked = openForm()
    expect(requirement(blocked)).toContain('You need OpenUSD')
    expect(button(blocked, 'Send').disabled).toBe(true)
    button(blocked, 'Send').onClick()
    expect(state.mutate).not.toHaveBeenCalled()

    const ready = chooseToken(blocked, betaUsd)
    expect(requirement(ready)).toBeUndefined()
    expect(button(ready, 'Send').disabled).toBe(false)
    button(ready, 'Send').onClick()
    expect(state.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 100_000_000n,
        token: alphaUsd,
        feeToken: betaUsd,
      }),
    )
  })

  it('allows another fee token when the default has no conversion liquidity', () => {
    state.balances[ousd] = 10_000_000n
    state.liquidity[ousd] = false
    const blocked = openForm()
    expect(requirement(blocked)).toContain('no available fee-conversion liquidity')
    expect(button(blocked, 'Send').disabled).toBe(true)
    expect(button(chooseToken(blocked, betaUsd), 'Send').disabled).toBe(false)
  })

  it('keeps the form accessible before funding and checks the full payment amount', () => {
    state.balances[alphaUsd] = 99_000_000n
    const step = openForm()
    expect(requirement(step)).toContain('at least 100 AlphaUSD')
    expect(button(step, 'Send').disabled).toBe(true)
  })

  it('reserves funds for fees when AlphaUSD pays both the payment and the fee', () => {
    state.balances[alphaUsd] = 100_000_000n
    const step = chooseToken(openForm(), alphaUsd)
    expect(requirement(step)).toContain('more than 100 AlphaUSD')
    expect(button(step, 'Send').disabled).toBe(true)
    expect(button(chooseToken(step, betaUsd), 'Send').disabled).toBe(false)
  })

  it('distinguishes loading balances from zero balances', () => {
    state.balances[ousd] = undefined
    expect(requirement(openForm())).toBe('Checking your token balances…')
  })

  it.each(['balances', 'liquidity'])('allows retrying failed %s checks', (check) => {
    state.balances[ousd] = 10_000_000n
    if (check === 'balances') state.balanceError = new Error('offline')
    else state.liquidityError = true
    const step = openForm()
    // Cached successful data must not hide a failed refresh.
    expect(requirement(step)).toContain('Could not check')
    expect(button(step, 'Send').disabled).toBe(true)
    button(step, 'Retry checks').onClick()
    expect(state.refetchBalance).toHaveBeenCalledTimes(2)
    expect(state.refetchLiquidity).toHaveBeenCalledOnce()
  })

  it('waits for fee eligibility without locking the selector', () => {
    state.balances[ousd] = 10_000_000n
    state.liquidity[ousd] = undefined
    const step = openForm()
    expect(requirement(step)).toBe('Checking whether this token can pay fees…')
    expect(button(step, 'Send').disabled).toBe(true)
    expect(button(chooseToken(step, betaUsd), 'Send').disabled).toBe(false)
  })

  it('prevents duplicate submission while a payment is pending', () => {
    state.pending = true
    const step = chooseToken(openForm(), betaUsd)
    expect(button(step, 'Sending...').disabled).toBe(true)
    button(step, 'Sending...').onClick()
    expect(state.mutate).not.toHaveBeenCalled()
  })

  it('requires a connected account before opening the form', () => {
    state.address = undefined
    expect(button(renderStep(), 'Enter details').disabled).toBe(true)
  })

  it('rejects invalid recipient addresses before sending', () => {
    const step = chooseToken(openForm(), betaUsd)
    const recipient = elements(step.children).find((element) => element.props.name === 'recipient')
    if (!recipient) throw new Error('Recipient input not found')
    ;(recipient.props.onChange as (event: { target: { value: string } }) => void)({
      target: { value: 'invalid' },
    })
    expect(requirement(renderStep())).toBe('Enter a valid recipient address.')
    expect(button(renderStep(), 'Send').disabled).toBe(true)
  })
})
