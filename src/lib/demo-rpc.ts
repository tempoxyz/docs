import { fallback, http, webSocket } from 'wagmi'
import { developersPath } from '../marketing/app/_lib/developersPaths'

export function getDemoRpcTransport() {
  if (import.meta.env.VITE_RPC_PROXY === 'true') {
    // Never fall back to the anonymous pool when a deployment enables the proxy.
    return http(developersPath('/api/demo-rpc'), { batch: { batchSize: 5 } })
  }
  return fallback([
    http('https://rpc.moderato.tempo.xyz', { batch: { batchSize: 5 } }),
    webSocket('wss://rpc.moderato.tempo.xyz', { keepAlive: { interval: 1_000 } }),
  ])
}
