import { ImageResponse } from '@takumi-rs/image-response/wasm'
import wasmModule from '@takumi-rs/wasm/takumi_wasm_bg.wasm?arraybuffer'
import hbSetFont from './fonts/HBSet-Light.otf?arraybuffer'
import pilatFont from './fonts/Pilat-Regular.otf?arraybuffer'
import bgImageBuf from './og-bg.png?arraybuffer'
import { OgImage } from './og-image'

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || 'Tempo'
  const section = url.searchParams.get('section') || ''
  const subsection = url.searchParams.get('subsection') || ''

  const bgBytes = new Uint8Array(bgImageBuf)
  let bgBinary = ''
  for (let i = 0; i < bgBytes.length; i++) bgBinary += String.fromCharCode(bgBytes[i])
  const bgUrl = `data:image/png;base64,${btoa(bgBinary)}`

  try {
    return new ImageResponse(
      <OgImage title={title} section={section} subsection={subsection} backgroundUrl={bgUrl} />,
      {
        module: wasmModule,
        width: 1200,
        height: 657,
        // Explicit PNG: some social crawlers (notably Facebook) don't render
        // WebP og:images, and takumi's default format has changed across
        // versions.
        format: 'png',
        fonts: [
          { name: 'HBSet', data: hbSetFont, weight: 300, style: 'normal' as const },
          { name: 'Pilat', data: pilatFont, weight: 400, style: 'normal' as const },
        ],
        // The image is a pure function of the query string (`v` busts on
        // design changes), so let the CDN cache it indefinitely.
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      },
    )
  } catch (error) {
    console.error(error)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
