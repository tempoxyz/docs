import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { WagmiProvider } from 'wagmi'
import * as WagmiConfig from './wagmi.config'

const queryClient = new QueryClient()

export default function Layout(props: React.PropsWithChildren) {
  return (
    <>
      <WagmiProvider config={WagmiConfig.config}>
        <QueryClientProvider client={queryClient}>
          {props.children}
        </QueryClientProvider>
      </WagmiProvider>

      <Toaster
        className="z-[42069] select-none"
        expand={false}
        position="bottom-right"
        swipeDirections={['right', 'left', 'top', 'bottom']}
        theme="light"
        toastOptions={{
          style: {
            borderRadius: '1.5rem',
          },
        }}
      />
    </>
  )
}
