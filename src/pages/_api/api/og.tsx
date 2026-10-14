import { createOgResponse } from '../../../lib/og-response'
import hbSetFont from './fonts/HBSet-Light.otf?arraybuffer'
import pilatFont from './fonts/Pilat-Regular.otf?arraybuffer'
import bgImageBuf from './og-bg.png?arraybuffer'

export default async function handler(request: Request) {
  // Imported on first request: the server imports every API route at startup, and the inlined wasm is a 9M-character module.
  const { default: wasmModule } = await import('@takumi-rs/wasm/takumi_wasm_bg.wasm?arraybuffer')
  return createOgResponse(request, { wasmModule, hbSetFont, pilatFont, background: bgImageBuf })
}
