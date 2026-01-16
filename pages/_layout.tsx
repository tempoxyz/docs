import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { Toaster } from 'sonner'
import type { ReactNode } from 'react'
import { wagmiConfig } from './lib/wagmi'

const queryClient = new QueryClient()

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          {children}
          <Toaster position="bottom-right" />
        </NuqsAdapter>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export function TopNavEnd() {
  return null
}
