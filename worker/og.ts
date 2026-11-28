import wasmModule from '@takumi-rs/wasm/takumi_wasm_bg.wasm'
import { createOgResponse } from '../src/lib/og-response'
import hbSetFont from '../src/pages/_api/api/fonts/HBSet-Light.otf'
import pilatFont from '../src/pages/_api/api/fonts/Pilat-Regular.otf'
import background from '../src/pages/_api/api/og-bg.png'

export function renderOg(request: Request) {
  return createOgResponse(request, { wasmModule, hbSetFont, pilatFont, background })
}
