import { ImageResponse } from '@takumi-rs/image-response/wasm'
import wasmModule from '@takumi-rs/wasm/takumi_wasm_bg.wasm?arraybuffer'
import hbSetFont from './fonts/HBSet-Light.otf?arraybuffer'
import pilatFont from './fonts/Pilat-Regular.otf?arraybuffer'
import bgImageBuf from './og-bg.png?arraybuffer'
import { layoutTitle } from './og-layout'

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || 'Tempo'
  const section = url.searchParams.get('section') || ''
  const subsection = url.searchParams.get('subsection') || ''

  const hasSubsection = !!subsection

  const { lines, fontSize } = layoutTitle(title)

  const bgBytes = new Uint8Array(bgImageBuf)
  let bgBinary = ''
  for (let i = 0; i < bgBytes.length; i++) bgBinary += String.fromCharCode(bgBytes[i])
  const bgUrl = `data:image/png;base64,${btoa(bgBinary)}`

  try {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F3F3F3',
          position: 'relative',
        }}
      >
        {/** biome-ignore lint/a11y/useAltText: og image */}
        <img
          src={bgUrl}
          width={1200}
          height={657}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        />

        {/* Pill / tag at top center */}
        {section && (
          <div
            style={{
              position: 'absolute',
              top: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 7,
                border: '1px solid rgba(0, 0, 0, 0.2)',
                backgroundColor: '#F3F3F3',
                padding: 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 14,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  fontFamily: 'Pilat',
                  fontSize: 22,
                  letterSpacing: '0.03em',
                  color: '#3D3D3D',
                }}
              >
                DOCS
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: 14,
                  paddingRight: 14,
                  paddingTop: 8,
                  paddingBottom: 8,
                  backgroundColor: '#E7E7E7',
                  borderRadius: 5,
                  fontFamily: 'Pilat',
                  fontSize: 22,
                  letterSpacing: '0.03em',
                  color: '#3D3D3D',
                }}
              >
                {hasSubsection ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ opacity: 0.6 }}>{section}</span>
                    <span style={{ opacity: 0.6, marginLeft: 8, marginRight: 8 }}>›</span>
                    <span>{subsection}</span>
                  </div>
                ) : (
                  section
                )}
              </div>
            </div>
          </div>
        )}

        {/* Title text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            maxWidth: 1040,
            padding: '0 40px',
          }}
        >
          {lines.map((line) => (
            <div
              key={line}
              style={{
                fontFamily: 'HBSet',
                fontSize,
                fontWeight: 300,
                letterSpacing: '-0.04em',
                color: 'black',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Tempo "T" logo at bottom center */}
        {/** biome-ignore lint/a11y/noSvgWithoutTitle: og image */}
        <svg
          width="28"
          height="34"
          viewBox="0 0 28 34"
          fill="none"
          style={{ position: 'absolute', bottom: 52, left: 586 }}
        >
          <path
            d="M10.179 33.796H0.976L9.506 7.66H-1.403L0.976 0H31.369L28.99 7.66H18.664L10.179 33.796Z"
            fill="black"
          />
        </svg>
      </div>,
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
