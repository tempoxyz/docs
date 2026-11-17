'use client'

import { useQuery } from '@tanstack/react-query'
import type { Account } from 'viem/tempo'
import { useConnection } from 'wagmi'

type RootWebAuthnAccount = ReturnType<typeof Account.fromWebAuthnP256>

/** The passkey connector's root account, which signs Zone transactions. */
export function useRootWebAuthnAccount() {
  const { address, connector } = useConnection()

  return useQuery({
    enabled: Boolean(address && connector?.id === 'webAuthn'),
    queryKey: ['root-webauthn-account', address],
    queryFn: async () => {
      if (!connector) throw new Error('connector not ready')
      const client = (await connector.getClient?.()) as
        | { account?: RootWebAuthnAccount }
        | undefined
      if (!client?.account || client.account.address.toLowerCase() !== address?.toLowerCase())
        throw new Error(`webauthn account ${address} not ready`)
      return client.account
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 500,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
