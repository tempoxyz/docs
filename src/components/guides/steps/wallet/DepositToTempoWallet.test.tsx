import type { ReactElement } from 'react'
import { numberToHex } from 'viem'
import { tempo } from 'viem/chains'
import { beforeEach, expect, test, vi } from 'vitest'
import { DepositToTempoWallet } from './DepositToTempoWallet'

const state = vi.hoisted(() => ({
  connection: {
    address: '0x0000000000000000000000000000000000000001',
    connector: { id: 'xyz.tempo' },
    status: 'connected',
  },
  request: vi.fn(),
  getProvider: vi.fn(),
  operation: Promise.resolve() as Promise<unknown>,
}))

vi.mock('wagmi', () => ({ useConnection: () => state.connection }))
vi.mock('../../../../wagmi.config', () => ({
  useTempoWalletConnector: () => ({ id: 'xyz.tempo', getProvider: state.getProvider }),
}))
vi.mock('@tanstack/react-query', () => ({
  useMutation: ({ mutationFn }: { mutationFn: () => Promise<unknown> }) => ({
    mutate: () => {
      state.operation = mutationFn()
    },
    isPending: false,
    error: null,
  }),
}))
vi.mock('../../Demo', () => ({ Button: () => null, Step: () => null }))

beforeEach(() => {
  vi.clearAllMocks()
  state.connection.status = 'connected'
  state.connection.connector.id = 'xyz.tempo'
  state.getProvider.mockResolvedValue({ request: state.request })
  state.request.mockResolvedValue({})
})

function renderStep() {
  return DepositToTempoWallet({ stepNumber: 2 }).props as {
    actions: ReactElement<{ disabled: boolean; onClick: () => void }>
  }
}

test('opens funding through the live connector when the saved connection has no methods', async () => {
  const step = renderStep()
  expect(step.actions.props.disabled).toBe(false)
  step.actions.props.onClick()
  await state.operation
  expect(state.getProvider).toHaveBeenCalledOnce()
  expect(state.request).toHaveBeenCalledWith({
    method: 'wallet_deposit',
    params: [{ address: state.connection.address, chainId: numberToHex(tempo.id) }],
  })
})

test.each([
  'reconnecting',
  'connecting',
  'disconnected',
])('does not allow funding while %s', async (status) => {
  state.connection.status = status
  const step = renderStep()
  expect(step.actions.props.disabled).toBe(true)
  step.actions.props.onClick()
  await expect(state.operation).rejects.toThrow('Connect Tempo Wallet')
  expect(state.request).not.toHaveBeenCalled()
})

test('does not fund a different active wallet', async () => {
  state.connection.connector.id = 'webAuthn'
  const step = renderStep()
  expect(step.actions.props.disabled).toBe(true)
  step.actions.props.onClick()
  await expect(state.operation).rejects.toThrow('Connect Tempo Wallet')
  expect(state.request).not.toHaveBeenCalled()
})
