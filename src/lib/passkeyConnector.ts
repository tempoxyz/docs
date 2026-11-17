import { createConnector } from '@wagmi/core'
import { type Hex, http, SwitchChainError } from 'viem'
import { Account, createClient, WebAuthnP256 } from 'viem/tempo'
import { ChainNotConfiguredError } from 'wagmi'

type Credential = { id: string; publicKey: Hex }
type ConnectParameters = {
  capabilities?: { method?: 'register' | 'login' } | undefined
  chainId?: number | undefined
  withCapabilities?: boolean | undefined
}

/** Where the connector keeps passkeys' public keys, which WebAuthn returns only at creation. */
const credentialsKey = 'tempo-docs-passkeys'
/** The passkey that is signed in. */
const activeKey = 'tempo-docs-passkey-active'

/**
 * A passkey account that the site holds itself, for the private Zone guides, which sign Zone
 * transactions with the account's root key. Tempo's access keys can't sign on a Zone. It uses
 * viem's WebAuthn signer, and keeps each passkey's public key in this browser.
 */
export function passkey(parameters: { rpId?: string | undefined; label?: string } = {}) {
  const { label = 'Tempo Docs' } = parameters
  const rpId = () =>
    parameters.rpId ?? (typeof location === 'undefined' ? undefined : location.hostname)

  return createConnector((config) => {
    let chainId = config.chains[0].id

    function credentials(): Record<string, Hex> {
      try {
        return JSON.parse(localStorage.getItem(credentialsKey) ?? '{}')
      } catch {
        return {}
      }
    }
    function active(): Credential | undefined {
      const id = globalThis.localStorage?.getItem(activeKey)
      const publicKey = id ? credentials()[id] : undefined
      return id && publicKey ? { id, publicKey } : undefined
    }
    function account(credential = active()) {
      if (!credential) throw new Error('No passkey is signed in.')
      return Account.fromWebAuthnP256(credential, { rpId: rpId() })
    }

    return {
      id: 'webAuthn',
      name: 'Passkey',
      type: 'webAuthn',
      async connect(connectParameters: ConnectParameters = {}) {
        let credential = active()
        const method = connectParameters.capabilities?.method
        if (method === 'register') {
          const created = await WebAuthnP256.createCredential({ label, rpId: rpId() })
          credential = { id: created.id, publicKey: created.publicKey }
          localStorage.setItem(
            credentialsKey,
            JSON.stringify({ ...credentials(), [created.id]: created.publicKey }),
          )
        } else if (method === 'login' || !credential) {
          const stored = credentials()
          const found = await WebAuthnP256.getCredential({
            rpId: rpId(),
            async getPublicKey(raw) {
              const publicKey = stored[raw.id]
              if (!publicKey)
                throw new Error('This browser has no public key for that passkey. Sign up first.')
              return publicKey
            },
          })
          credential = { id: found.id, publicKey: found.publicKey }
        }
        localStorage.setItem(activeKey, credential.id)
        if (connectParameters.chainId) chainId = connectParameters.chainId
        const address = account(credential).address
        return {
          accounts: (connectParameters.withCapabilities
            ? [{ address, capabilities: {} }]
            : [address]) as never,
          chainId,
        }
      },
      async disconnect() {
        localStorage.removeItem(activeKey)
      },
      async getAccounts() {
        return active() ? [account().address] : []
      },
      async getChainId() {
        return chainId
      },
      async getProvider() {
        return undefined
      },
      async getClient({ chainId: requested } = {}) {
        const chain = config.chains.find((c) => c.id === (requested ?? chainId))
        if (!chain) throw new ChainNotConfiguredError()
        return createClient({
          account: account(),
          chain,
          transport: config.transports?.[chain.id] ?? http(),
        }) as never
      },
      async isAuthorized() {
        return Boolean(active())
      },
      async switchChain({ chainId: next }) {
        const chain = config.chains.find((c) => c.id === next)
        if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())
        chainId = next
        config.emitter.emit('change', { chainId: next })
        return chain
      },
      onAccountsChanged(accounts) {
        config.emitter.emit('change', { accounts: accounts as `0x${string}`[] })
      },
      onChainChanged(chain) {
        config.emitter.emit('change', { chainId: Number(chain) })
      },
      onDisconnect() {
        config.emitter.emit('disconnect')
      },
    }
  })
}
