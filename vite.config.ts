import react from '@vitejs/plugin-react'
import { Instance } from 'prool'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import { vocs } from 'vocs/vite'
import { moderatoZoneRpcUrls } from './src/lib/private-zones.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of Object.keys(env)) {
    if (!(key in process.env)) process.env[key] = env[key]
  }

  const isE2E = process.env.VITE_E2E === 'true' || env.VITE_E2E === 'true'
  const useHttp = process.env.CI === 'true' || process.env.VITE_USE_HTTP === 'true'
  const e2eZoneProxy = isE2E ? getE2EZoneProxy() : undefined

  return {
    plugins: [vocs(), react(), ...(useHttp ? [] : [mkcert()]), tempoNode()],
    server: useHttp
      ? {
          host: 'localhost',
          proxy: e2eZoneProxy,
        }
      : undefined,
  }
})

function getE2EZoneProxy() {
  return Object.fromEntries(
    Object.entries(moderatoZoneRpcUrls).map(([zoneId, rpcUrl]) => {
      const parsedUrl = new URL(rpcUrl)
      const authorization = `Basic ${Buffer.from(
        `${decodeURIComponent(parsedUrl.username)}:${decodeURIComponent(parsedUrl.password)}`,
      ).toString('base64')}`
      parsedUrl.username = ''
      parsedUrl.password = ''

      return [
        `/__e2e_zone_rpc/${zoneId}`,
        {
          changeOrigin: true,
          headers: { authorization },
          rewrite: () => '/',
          secure: true,
          target: parsedUrl.toString(),
        },
      ]
    }),
  )
}

function tempoNode(): Plugin {
  return {
    name: 'tempo-node',
    async configureServer(_server) {
      if (!('VITE_TEMPO_ENV' in process.env) || process.env.VITE_TEMPO_ENV !== 'localnet') return
      const instance = Instance.tempo({
        dev: { blockTime: '500ms' },
        port: 8545,
      })
      console.log('→ starting tempo node...')
      await instance.start()
      console.log('√ tempo node started on port 8545')
    },
  }
}
