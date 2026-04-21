'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import type { Hex } from 'viem'
import { Storage as ZoneStorage } from 'viem/tempo'

const zoneAuthorizationInfoTimeoutMs = 5_000

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
        const info = await withTimeout(
          zoneClient.zone.getAuthorizationTokenInfo(),
          zoneAuthorizationInfoTimeoutMs,
        )
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
    isChecking: statusQuery.fetchStatus === 'fetching',
    statusQuery,
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      const timeout = setTimeout(() => {
        const error = new Error('zone authorization info request timed out')
        error.name = 'TimeoutError'
        reject(error)
      }, timeoutMs)

      promise.finally(() => clearTimeout(timeout))
    }),
  ])
}

function isZoneAuthorizationError(error: unknown) {
  const status = getErrorStatus(error)
  if (status === 401 || status === 403) return true

  const name = getErrorName(error)
  if (name === 'HttpRequestError' || name === 'TimeoutError') return true

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

function getErrorStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) return null

  if ('status' in error && typeof error.status === 'number') {
    return error.status
  }

  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode
  }

  if ('cause' in error) {
    return getErrorStatus(error.cause)
  }

  return null
}

function getErrorName(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) return null

  if ('name' in error && typeof error.name === 'string') {
    return error.name
  }

  if ('cause' in error) {
    return getErrorName(error.cause)
  }

  return null
}
