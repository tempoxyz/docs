'use client'

import { useQuery } from '@tanstack/react-query'
import { Account } from 'viem/tempo'
import { useConnection } from 'wagmi'
import { config, webAuthnRpId } from '../wagmi.config.ts'

type RootWebAuthnCredential = Parameters<typeof Account.fromWebAuthnP256>[0]

export function useRootWebAuthnAccount() {
  const { address, connector } = useConnection()

  return useQuery({
    enabled: Boolean(address && connector?.id === 'webAuthn' && webAuthnRpId),
    queryKey: ['root-webauthn-account', address, webAuthnRpId],
    queryFn: async () => {
      if (!webAuthnRpId) throw new Error('webauthn RP ID is not configured')

      const credential = await config.storage?.getItem('webAuthn.activeCredential')
      if (!credential) throw new Error('webauthn credential not available')

      return Account.fromWebAuthnP256(credential as RootWebAuthnCredential, {
        rpId: webAuthnRpId,
      })
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
}
