import react from '@vitejs/plugin-react'
import { createServer } from 'vite'

// Bundle Takumi's browser-targeted WASM package as in production. Loading it
// through tsx's CommonJS compatibility path changes its default export.
const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [react()],
  server: { middlewareMode: true },
  ssr: { noExternal: [/@takumi-rs\//] },
})
try {
  const { main } = await server.ssrLoadModule('/scripts/render-og-goldens.tsx')
  await main()
} finally {
  await server.close()
}
