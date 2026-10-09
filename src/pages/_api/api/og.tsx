import wasmModule from '@takumi-rs/wasm/takumi_wasm_bg.wasm?arraybuffer'
import hbSetFont from './fonts/HBSet-Light.otf?arraybuffer'
import pilatFont from './fonts/Pilat-Regular.otf?arraybuffer'
import bgImageBuf from './og-bg.png?arraybuffer'
import { createOgResponse } from './og-response'

export default async function handler(request: Request) {
  return createOgResponse(request, { wasmModule, hbSetFont, pilatFont, background: bgImageBuf })
}
