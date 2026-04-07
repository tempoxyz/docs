'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import type { Hex } from 'viem'
import { Storage as ZoneStorage } from 'viem/tempo'

export type ZoneAuthClientLike = {
  zone: {
    getAuthorizationTokenInfo: () => Promise<{
      account: Hex
      expiresAt: bigint
    }>
    signAuthorizationToken: () => Promise<{
      authentication: {
        expiresAt: number
        zoneId: number
      }
      token: Hex
    }>
  }
}

export function useZoneAuthorization(parameters: {
  address: Hex | undefined
  chainId: number
  queryKey: readonly unknown[]
  zoneClient: ZoneAuthClientLike | undefined
}) {
  const { address, chainId, queryKey, zoneClient } = parameters

  const statusQuery = useQuery({
    enabled: Boolean(address && zoneClient),
    queryKey,
    queryFn: async () => {
      if (!address) throw new Error('account address not ready')
      if (!zoneClient) throw new Error('zone client not ready')

      const storage = ZoneStorage.defaultStorage()
      const lowerAddress = address.toLowerCase()
      const accountStorageKey = `auth:${lowerAddress}:${chainId}`
      const chainStorageKey = `auth:token:${chainId}`
      const accountToken = await storage.getItem(accountStorageKey)

      if (accountToken) await storage.setItem(chainStorageKey, accountToken)

      try {
        const info = await zoneClient.zone.getAuthorizationTokenInfo()
        const expired = info.expiresAt <= BigInt(Math.floor(Date.now() / 1000))
        const matchesAccount = info.account.toLowerCase() === lowerAddress

        if (!matchesAccount || expired) {
          await storage.removeItem(chainStorageKey)
          if (accountToken) await storage.removeItem(accountStorageKey)
          return null
        }

        if (!accountToken) {
          const chainToken = await storage.getItem(chainStorageKey)
          if (chainToken) await storage.setItem(accountStorageKey, chainToken)
        }

        return info
      } catch (error) {
        if (!isZoneAuthorizationError(error)) throw error

        await storage.removeItem(chainStorageKey)
        if (accountToken) await storage.removeItem(accountStorageKey)
        return null
      }
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 30_000,
  })

  const authorizeMutation = useMutation({
    mutationFn: async () => {
      if (!zoneClient) throw new Error('zone client not ready')

      return zoneClient.zone.signAuthorizationToken()
    },
    onSuccess: async () => {
      await statusQuery.refetch()
    },
  })

  return {
    authorizeMutation,
    error: authorizeMutation.error ?? statusQuery.error,
    isAuthorized: statusQuery.data !== null && statusQuery.data !== undefined,
    isChecking: statusQuery.isPending,
    statusQuery,
  }
}

function isZoneAuthorizationError(error: unknown) {
  const message = getErrorMessage(error)
  return /authorization token/i.test(message)
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    if ('shortMessage' in error && typeof error.shortMessage === 'string') {
      return error.shortMessage
    }

    if ('message' in error && typeof error.message === 'string') return error.message
  }

  if (error instanceof Error) return error.message

  return ''
}
