'use client'

import { useQuery } from '@tanstack/react-query'
import type { WebAuthnP256 } from 'viem/tempo'
import { Account } from 'viem/tempo'
import { useConnection } from 'wagmi'
import { config, webAuthnRpId } from '../wagmi.config.ts'

type RootWebAuthnAccount = ReturnType<typeof Account.fromWebAuthnP256>
type RootWebAuthnCredential = WebAuthnP256.P256Credential
type RootWebAuthnAccountProvider = {
  getAccount: (options: {
    accessKey?: boolean | undefined
    address?: `0x${string}` | undefined
    signable?: boolean | undefined
  }) => RootWebAuthnAccount
  request: (args: { method: 'eth_accounts' }) => Promise<readonly `0x${string}`[]>
}

export function useRootWebAuthnAccount() {
  const { address, connector } = useConnection()

  return useQuery({
    enabled: Boolean(address && connector?.id === 'webAuthn'),
    queryKey: ['root-webauthn-account', address],
    queryFn: async () => {
      if (!address) throw new Error('account address not ready')
      if (!connector) throw new Error('connector not ready')

      const provider = await connector.getProvider()
      if (isRootWebAuthnAccountProvider(provider)) {
        await waitForProviderAccount(provider, address as `0x${string}`)

        return provider.getAccount({
          accessKey: false,
          address: address as `0x${string}`,
          signable: true,
        })
      }

      const credential = await waitForStoredCredential(address as `0x${string}`)
      return accountFromCredential(credential)
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
}

function accountFromCredential(credential: RootWebAuthnCredential) {
  return Account.fromWebAuthnP256(credential, webAuthnRpId ? { rpId: webAuthnRpId } : undefined)
}

function isRootWebAuthnAccountProvider(value: unknown): value is RootWebAuthnAccountProvider {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'getAccount' in value &&
      typeof value.getAccount === 'function' &&
      'request' in value &&
      typeof value.request === 'function',
  )
}

async function waitForProviderAccount(
  provider: RootWebAuthnAccountProvider,
  address: `0x${string}`,
  timeoutMs = 5_000,
) {
  const deadline = Date.now() + timeoutMs
  const normalizedAddress = address.toLowerCase()

  while (Date.now() < deadline) {
    const accounts = await provider.request({ method: 'eth_accounts' })
    if (accounts.some((account) => account.toLowerCase() === normalizedAddress)) return

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  throw new Error(`webauthn account ${address} not ready`)
}

async function waitForStoredCredential(
  address: `0x${string}`,
  timeoutMs = 5_000,
): Promise<RootWebAuthnCredential> {
  const deadline = Date.now() + timeoutMs
  const normalizedAddress = address.toLowerCase()

  while (Date.now() < deadline) {
    const credential = await config.storage?.getItem('webAuthn.activeCredential')
    if (credential) {
      const account = accountFromCredential(credential as RootWebAuthnCredential)
      if (account.address.toLowerCase() === normalizedAddress) {
        return credential as RootWebAuthnCredential
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  throw new Error(`webauthn credential for ${address} not ready`)
}
