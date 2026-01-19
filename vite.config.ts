import react from '@vitejs/plugin-react'
import { Instance } from 'prool'
import { defineConfig, type Plugin } from 'vite'
import { vocs } from 'vocs/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vocs(), react(), tempoNode()],
  ssr: {
    noExternal: ['@iconify-json/lucide', '@iconify-json/simple-icons'],
  },
})

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
