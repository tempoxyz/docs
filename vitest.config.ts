import react from '@vitejs/plugin-react'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vitest/config'

// Unit tests need JSX and icons, not the site build or remote content plugins.
export default defineConfig({
  plugins: [react(), Icons({ compiler: 'jsx', jsx: 'react' })],
  test: {
    // Keep real Vocs head rendering while honoring the tests' virtual-config mock.
    server: { deps: { inline: ['vocs'] } },
  },
})
