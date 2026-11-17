import { createConnector } from '@wagmi/core'
import * as AccountsV0 from 'accounts-v0'
import { numberToHex, SwitchChainError, UserRejectedRequestError, withRetry } from 'viem'
import { parseAccount } from 'viem/utils'
import { ChainNotConfiguredError } from 'wagmi'

/**
 * A passkey account that this site holds itself, for the passkey demos and E2E tests.
 *
 * Version 1 of the accounts SDK has no WebAuthn adapter, and `@wagmi/core/tempo`'s `webAuthn`
 * connector loads whichever `accounts` the app installs. So this copy of that connector pins
 * `accounts-v0` (`accounts@0.19.1`), while Tempo ID uses `accounts` v1.
 */
export function passkey(parameters: passkey.Parameters = {}) {
  const { ceremony, storage } = parameters
  type Provider = ReturnType<typeof AccountsV0.Provider.create>
  return createConnector<Provider>((config) => {
    let providerPromise: Promise<Provider> | undefined
    let accountsChanged: ((accounts: string[]) => void) | undefined
    let chainChanged: ((chain: string) => void) | undefined
    let connect: ((info: { chainId: string }) => void) | undefined
    let disconnect: ((error?: Error) => void) | undefined

    async function getProvider() {
      providerPromise ??= Promise.resolve(
        AccountsV0.Provider.create({
          adapter: ceremony ? AccountsV0.webAuthn({ ceremony }) : AccountsV0.webAuthn(),
          chains: config.chains,
          ...(storage ? { storage } : {}),
          transports: config.transports,
          // biome-ignore lint/suspicious/noExplicitAny: v0's parameter types differ from wagmi's chain types.
        } as any),
      )
      return await providerPromise
    }

    return {
      id: 'webAuthn',
      name: 'EOA (WebAuthn)',
      type: 'webAuthn',
      // biome-ignore lint/suspicious/noExplicitAny: wagmi's connect parameters are generic.
      async connect(connectParameters: any = {}) {
        const { chainId, isReconnecting, withCapabilities } = connectParameters
        const capabilities =
          'capabilities' in connectParameters ? connectParameters.capabilities : undefined
        let accounts: { address: `0x${string}`; capabilities: Record<string, unknown> }[] = []
        try {
          if (isReconnecting)
            accounts = await this.getAccounts()
              .then((list) => list.map((address) => ({ address, capabilities: {} })))
              .catch(() => [])
          const provider = await getProvider()
          if (!accounts.length && !isReconnecting) {
            // biome-ignore lint/suspicious/noExplicitAny: v0 RPC schema.
            const response = (await (provider as any).request({
              method: 'wallet_connect',
              params: [
                { ...(chainId ? { chainId } : {}), ...(capabilities ? { capabilities } : {}) },
              ],
            })) as { accounts: typeof accounts }
            accounts = response.accounts
          }
          const currentChainId = await this.getChainId()
          if (!currentChainId) throw new ChainNotConfiguredError()
          listen(provider, this)
          return {
            accounts: (withCapabilities
              ? accounts
              : accounts.map((account) => account.address)) as never,
            chainId: currentChainId,
          }
        } catch (error) {
          const rpcError = error as { code?: number }
          if (rpcError.code === UserRejectedRequestError.code)
            throw new UserRejectedRequestError(rpcError as Error)
          throw error
        }
      },
      async disconnect() {
        const provider = await getProvider()
        unlisten(provider)
        if (!connect) {
          connect = this.onConnect?.bind(this)
          if (connect) provider.on('connect', connect as never)
        }
        // biome-ignore lint/suspicious/noExplicitAny: v0 RPC schema.
        await (provider as any).request({ method: 'wallet_disconnect' })
      },
      async getAccounts() {
        const provider = await getProvider()
        // biome-ignore lint/suspicious/noExplicitAny: v0 RPC schema.
        return (await (provider as any).request({ method: 'eth_accounts' })) as `0x${string}`[]
      },
      async getChainId() {
        const provider = await getProvider()
        // biome-ignore lint/suspicious/noExplicitAny: v0 RPC schema.
        return Number(await (provider as any).request({ method: 'eth_chainId' }))
      },
      async getClient({ chainId }: { chainId?: number } = {}) {
        const provider = await getProvider()
        // The SDK provider orchestrates access keys before signing, so give wagmi a JSON-RPC account.
        const { address } = provider.getAccount()
        return Object.assign(provider.getClient({ chainId }), {
          account: parseAccount(address),
          // biome-ignore lint/suspicious/noExplicitAny: v0's client type predates wagmi's.
        }) as any
      },
      async getProvider() {
        return await getProvider()
      },
      async isAuthorized() {
        try {
          return (await withRetry(() => this.getAccounts())).length > 0
        } catch {
          return false
        }
      },
      onAccountsChanged(accounts) {
        config.emitter.emit('change', { accounts: accounts as `0x${string}`[] })
      },
      onChainChanged(chain) {
        config.emitter.emit('change', { chainId: Number(chain) })
      },
      async onConnect(connectInfo) {
        const accounts = await this.getAccounts()
        if (accounts.length === 0) return
        config.emitter.emit('connect', { accounts, chainId: Number(connectInfo.chainId) })
        listen(await getProvider(), this)
      },
      async onDisconnect() {
        const provider = await getProvider()
        config.emitter.emit('disconnect')
        unlisten(provider)
        if (!connect) {
          connect = this.onConnect?.bind(this)
          if (connect) provider.on('connect', connect as never)
        }
      },
      async setup() {
        if (connect) return
        const provider = await getProvider()
        connect = this.onConnect?.bind(this)
        if (connect) provider.on('connect', connect as never)
      },
      async switchChain({ chainId }) {
        const chain = config.chains.find((chain) => chain.id === chainId)
        if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())
        const provider = await getProvider()
        // biome-ignore lint/suspicious/noExplicitAny: v0 RPC schema.
        await (provider as any).request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: numberToHex(chainId) }],
        })
        return chain
      },
    }

    // biome-ignore lint/suspicious/noExplicitAny: the connector's own handlers.
    function listen(provider: Provider, self: any) {
      if (connect) {
        provider.removeListener('connect', connect as never)
        connect = undefined
      }
      if (!accountsChanged) {
        accountsChanged = self.onAccountsChanged.bind(self)
        provider.on('accountsChanged', accountsChanged as never)
      }
      if (!chainChanged) {
        chainChanged = self.onChainChanged.bind(self)
        provider.on('chainChanged', chainChanged as never)
      }
      if (!disconnect) {
        disconnect = self.onDisconnect.bind(self)
        provider.on('disconnect', disconnect as never)
      }
    }

    function unlisten(provider: Provider) {
      if (chainChanged) {
        provider.removeListener('chainChanged', chainChanged as never)
        chainChanged = undefined
      }
      if (disconnect) {
        provider.removeListener('disconnect', disconnect as never)
        disconnect = undefined
      }
    }
  })
}

export declare namespace passkey {
  type Parameters = {
    /** The registration and login ceremony. Defaults to one the browser keeps. */
    ceremony?: AccountsV0.WebAuthnCeremony.WebAuthnCeremony | undefined
    /** Where the SDK keeps the passkey account. */
    storage?: AccountsV0.Storage.Storage | undefined
  }
}
