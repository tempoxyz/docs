import {
  type Config,
  type Connector,
  connect,
  createConfig,
  disconnect,
  getConnection,
  getConnections,
  mock,
  switchConnection,
} from '@wagmi/core'
import type { ReactElement } from 'react'
import { type Address, custom } from 'viem'
import { tempoModerato } from 'viem/chains'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { SignInWithTempo } from './SignInWithTempo'

const state = vi.hoisted(() => ({
  config: undefined as Config | undefined,
  operation: Promise.resolve() as Promise<unknown>,
  connect: vi.fn(),
  disconnect: vi.fn(),
  switchConnection: vi.fn(),
}))

// Keep Wagmi's real connection-state transitions; only replace React hooks and UI.
vi.mock('wagmi', () => ({
  useConnection: () => getConnection(testConfig()),
  useConnections: () => getConnections(testConfig()),
  useConnect: () => ({ connect: state.connect, reset: vi.fn(), isPending: false }),
  useDisconnect: () => ({ disconnectAsync: state.disconnect }),
  useSwitchConnection: () => ({
    mutate: state.switchConnection,
    reset: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('../../../../wagmi.config', () => ({
  useTempoWalletConnector: () => state.config?.connectors.find((item) => item.id === 'xyz.tempo'),
}))

vi.mock('~icons/lucide/picture-in-picture-2', () => ({ default: () => null }))

vi.mock('../../Demo', () => ({
  Button: () => null,
  Logout: () => null,
  Step: () => null,
  TempoMarkBoxed: () => null,
  useHydrated: () => true,
}))

function testConfig() {
  if (!state.config) throw new Error('Connection test config is not initialized')
  return state.config
}

function localConnector(id: string, address: Address) {
  const factory = mock({ accounts: [address] })
  return (parameters: Parameters<typeof factory>[0]) => ({ ...factory(parameters), id })
}

beforeEach(() => {
  vi.clearAllMocks()
  state.operation = Promise.resolve()
  state.config = createConfig({
    chains: [tempoModerato],
    connectors: [
      localConnector('xyz.tempo', '0x0000000000000000000000000000000000000001'),
      localConnector('webAuthn', '0x0000000000000000000000000000000000000002'),
    ],
    multiInjectedProviderDiscovery: false,
    storage: null,
    ssr: true,
    transports: {
      [tempoModerato.id]: custom({
        request: async () => {
          throw new Error('This connection test must not send RPC requests')
        },
      }),
    },
  })
  state.connect.mockImplementation((parameters: { connector: Connector }) => {
    state.operation = connect(testConfig(), parameters)
  })
  state.switchConnection.mockImplementation((parameters: { connector: Connector }) => {
    state.operation = switchConnection(testConfig(), parameters)
  })
  state.disconnect.mockImplementation((parameters?: { connector: Connector }) =>
    disconnect(testConfig(), parameters),
  )
})

function renderedStep() {
  return SignInWithTempo({ stepNumber: 1 }).props as {
    active: boolean
    completed: boolean
    actions: ReactElement<{ onClick: () => void | Promise<void> }>
  }
}

async function clickConnect() {
  const step = renderedStep()
  expect(step.completed).toBe(false)
  expect(step.active).toBe(true)
  await step.actions.props.onClick()
  await state.operation
}

describe('Tempo Wallet connection across account demos', () => {
  test('reactivates a retained wallet after creating a passkey account', async () => {
    const config = testConfig()
    const [wallet, passkey] = config.connectors
    await connect(config, { connector: wallet })
    await connect(config, { connector: passkey })
    expect(getConnection(config).connector?.id).toBe('webAuthn')

    await clickConnect()

    expect(getConnection(config).connector?.id).toBe('xyz.tempo')
    expect(getConnections(config)).toHaveLength(2)
    expect(state.connect).not.toHaveBeenCalled()
    expect(state.disconnect).not.toHaveBeenCalled()
    expect(renderedStep().completed).toBe(true)
  })

  test('connects a new wallet without dropping the existing passkey connection', async () => {
    const config = testConfig()
    const [, passkey] = config.connectors
    await connect(config, { connector: passkey })

    await clickConnect()

    expect(getConnection(config).connector?.id).toBe('xyz.tempo')
    expect(getConnections(config).map((item) => item.connector.id)).toEqual([
      'webAuthn',
      'xyz.tempo',
    ])
    expect(state.disconnect).not.toHaveBeenCalled()
    expect(renderedStep().completed).toBe(true)
  })
})
