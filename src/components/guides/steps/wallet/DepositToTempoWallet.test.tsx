import type { ReactElement } from 'react'
import { tempo } from 'viem/chains'
import { beforeEach, expect, test, vi } from 'vitest'
import { DepositToTempoWallet } from './DepositToTempoWallet'

const state = vi.hoisted(() => ({
  connection: {
    address: '0x0000000000000000000000000000000000000001',
    connector: { id: 'tempoId' },
    status: 'connected',
  },
  open: vi.fn(),
  getInstance: vi.fn(),
  operation: Promise.resolve() as Promise<unknown>,
}))

vi.mock('wagmi', () => ({
  useConnection: () => state.connection,
}))
vi.mock('../../../../wagmi.config', () => ({
  useTempoIdConnector: () => ({ id: 'tempoId', getInstance: state.getInstance }),
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
  state.connection.connector.id = 'tempoId'
  state.getInstance.mockResolvedValue({ funding: { open: state.open } })
  state.open.mockResolvedValue({ status: 'closed' })
})

function renderStep() {
  return DepositToTempoWallet({ stepNumber: 2 }).props as {
    actions: ReactElement<{ disabled: boolean; onClick: () => void }>
  }
}

test('opens Tempo ID funding for mainnet', async () => {
  const step = renderStep()
  expect(step.actions.props.disabled).toBe(false)
  step.actions.props.onClick()
  await state.operation
  expect(state.getInstance).toHaveBeenCalledOnce()
  expect(state.open).toHaveBeenCalledWith({ chainId: tempo.id })
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
  await expect(state.operation).rejects.toThrow('Sign in with Tempo ID')
  expect(state.open).not.toHaveBeenCalled()
})

test('does not fund a different active wallet', async () => {
  state.connection.connector.id = 'webAuthn'
  const step = renderStep()
  expect(step.actions.props.disabled).toBe(true)
  step.actions.props.onClick()
  await expect(state.operation).rejects.toThrow('Sign in with Tempo ID')
  expect(state.open).not.toHaveBeenCalled()
})
