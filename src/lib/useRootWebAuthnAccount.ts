'use client'

import { useQuery } from '@tanstack/react-query'
import { Account } from 'viem/tempo'
import { useConnection } from 'wagmi'

type RootWebAuthnAccount = ReturnType<typeof Account.fromWebAuthnP256>
type RootWebAuthnAccountProvider = {
  getAccount: (options: {
    accessKey?: boolean | undefined
    address?: `0x${string}` | undefined
    signable?: boolean | undefined
  }) => RootWebAuthnAccount
}

export function useRootWebAuthnAccount() {
  const { address, connector } = useConnection()

  return useQuery({
    enabled: Boolean(address && connector?.id === 'webAuthn'),
    queryKey: ['root-webauthn-account', address],
    queryFn: async () => {
      if (!address) throw new Error('account address not ready')
      if (!connector) throw new Error('connector not ready')

      const provider = (await connector.getProvider()) as RootWebAuthnAccountProvider
      return provider.getAccount({
        accessKey: false,
        address: address as `0x${string}`,
        signable: true,
      })
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
