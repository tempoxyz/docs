declare global {
  var process: {
    env: Record<string, string | undefined>
  }

  function btoa(input: string | ArrayBuffer): string
}

declare namespace React {
  type ReactNode = unknown

  interface PropsWithChildren<_P = Record<string, unknown>> {
    children?: ReactNode
  }

  type ComponentType<P = Record<string, unknown>> = (props: P) => ReactNode

  interface ButtonHTMLAttributes<_T> extends Record<string, unknown> {
    disabled?: boolean
  }
}

declare module 'react' {
  export = React
}

declare module '@tanstack/react-query' {
  export class QueryClient {
    constructor(config?: Record<string, unknown>)
  }

  export interface QueryClientProviderProps {
    client: QueryClient
    children?: React.ReactNode
  }

  export function QueryClientProvider(
    props: QueryClientProviderProps,
  ): React.ReactNode

  export interface UseMutationResult {
    mutate: (...parameters: unknown[]) => unknown
    isPending: boolean
  }

  export function useMutation(options: unknown): UseMutationResult
}

declare module 'sonner' {
  export interface ToasterProps {
    className?: string
    expand?: boolean
    position?: string
    swipeDirections?: string[]
    theme?: string
    toastOptions?: Record<string, unknown>
  }

  export function Toaster(props: ToasterProps): React.ReactNode
}

declare module 'tempo.ts/chains' {
  import type { Chain } from 'viem'

  export interface TempoChainConfig {
    feeToken: `0x${string}`
  }

  export interface TempoChain extends Chain {
    feeToken: `0x${string}`
  }

  export interface TempoChainFactory {
    (config: TempoChainConfig): TempoChain
    id: number
  }

  export function tempo(config: TempoChainConfig): TempoChain
  export const tempoAndantino: TempoChainFactory
  export const tempoLocal: TempoChainFactory
}

declare module 'tempo.ts/prool' {
  export interface TempoInstanceOptions {
    dev?: {
      blockTime?: string
    }
    port?: number
  }

  export interface TempoInstance {
    start(): Promise<void>
  }

  export const Instance: {
    tempo(options?: TempoInstanceOptions): TempoInstance
  }
}

declare module 'tempo.ts/viem' {
  import type { Hex } from 'viem'

  export type Transaction = {
    hash: Hex
  }

  export const Transaction: {
    deserialize(serialized: Hex): Transaction
  }

  export const Actions: Record<
    string,
    Record<string, (...parameters: unknown[]) => unknown>
  >

  export function tempoActions(): Record<string, unknown>

  export function withFeePayer(
    defaultTransport: unknown,
    relayTransport: unknown,
  ): unknown
}

declare module 'tempo.ts/wagmi' {
  export const Hooks: Record<
    string,
    Record<string, (...parameters: unknown[]) => unknown>
  >

  export function webAuthn(): unknown
}

declare module 'viem' {
  export type Address = `0x${string}`
  export type Hash = `0x${string}`
  export type Hex = `0x${string}`

  export interface Chain {
    id: number
    name?: string
    nativeCurrency?: {
      name: string
      symbol: string
      decimals: number
    }
  }

  export type Transport = unknown

  export interface TransactionReceipt {
    transactionHash: Hash
  }

  export interface Client<
    TTransport = Transport,
    TChain extends Chain | undefined = Chain | undefined,
  > {
    extend<TExtension>(
      extension: TExtension,
    ): Client<TTransport, TChain> & TExtension
    request<TResult = unknown>(args: {
      method: string
      params?: unknown[]
    }): Promise<TResult>
    waitForTransactionReceipt(args: { hash: Hash }): Promise<TransactionReceipt>
  }

  export function parseUnits(value: string, decimals?: number): bigint
  export function formatUnits(value: bigint, decimals?: number): string
  export function stringify(
    value: unknown,
    replacer?: unknown,
    space?: unknown,
  ): string

  export function createClient<
    TTransport = Transport,
    TChain extends Chain | undefined = Chain | undefined,
  >(config: unknown): Client<TTransport, TChain>

  export function http(url?: string | null, options?: unknown): unknown

  export const publicActions: Record<
    string,
    (...parameters: unknown[]) => unknown
  >
  export const walletActions: Record<
    string,
    (...parameters: unknown[]) => unknown
  >
}

declare module 'viem/accounts' {
  export function privateKeyToAccount(key: string): { address: `0x${string}` }
  export function mnemonicToAccount(mnemonic: string): {
    address: `0x${string}`
  }
}

declare module 'wagmi' {
  import type { Client } from 'viem'

  export interface CreateConfigParameters {
    chains?: unknown[]
    connectors?: unknown[]
    transports?: Record<number | string, unknown>
    batch?: Record<string, unknown>
    multiInjectedProviderDiscovery?: boolean
  }

  export function createConfig(parameters: CreateConfigParameters): unknown

  export function http(
    url?: string | null,
    options?: Record<string, unknown>,
  ): unknown

  export interface WagmiProviderProps {
    config: unknown
    children?: React.ReactNode
  }

  export function WagmiProvider(props: WagmiProviderProps): React.ReactNode

  export interface UseAccountResult {
    address?: `0x${string}`
  }

  export function useAccount(): UseAccountResult
  export function useAccountEffect(options: { onDisconnect?: () => void }): void

  export interface UseConnectResult {
    connect: (parameters?: unknown) => Promise<unknown>
    isPending: boolean
  }

  export function useConnect(): UseConnectResult
  export function useConnectors(): unknown[]

  export function useDisconnect(): { disconnect(parameters?: unknown): void }

  export function useBlockNumber(options?: unknown): { data?: bigint }

  export function useClient(): Client | undefined
}

export {}
