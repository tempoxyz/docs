'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Json } from 'ox'
import * as React from 'react'
import { WagmiProvider } from 'wagmi'
import * as WagmiConfig from '../wagmi.config'
import { DemoContextProvider } from './DemoContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: Json.stringify,
    },
  },
})

export default function Providers({
  children,
  mipd,
}: {
  children: React.ReactNode
  mipd?: boolean
}) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const config = React.useMemo(
    () =>
      WagmiConfig.getConfig({
        multiInjectedProviderDiscovery: mounted && Boolean(mipd),
      }),
    [mounted, mipd],
  )

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <DemoContextProvider>{children}</DemoContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
