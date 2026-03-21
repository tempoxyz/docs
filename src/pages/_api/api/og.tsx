import { ImageResponse } from '@takumi-rs/image-response/wasm'
// @ts-expect-error -- vite arraybuffer import
import wasmModule from '@takumi-rs/wasm/takumi_wasm_bg.wasm?arraybuffer'
// @ts-expect-error -- vite arraybuffer import
import hbSetFont from './fonts/HBSet-Light.otf?arraybuffer'
// @ts-expect-error -- vite arraybuffer import
import pilatFont from './fonts/Pilat-Regular.otf?arraybuffer'
// @ts-expect-error -- vite arraybuffer import
import bgImageBuf from './og-bg.png?arraybuffer'

function getTitleFontSize(_title: string): number {
  return 105
}

/**
 * Split title into balanced lines so no single word is orphaned.
 * Finds the word-boundary split closest to the midpoint of the string.
 */
function balanceLines(text: string, fontSize: number): string[] {
  const words = text.split(' ')
  if (words.length <= 2) return [text]

  const maxWidth = 960
  const avgCharWidth = fontSize * 0.58
  const charsPerLine = Math.floor(maxWidth / avgCharWidth)

  if (text.length <= charsPerLine) return [text]

  const needsThreeLines = text.length > charsPerLine * 2

  if (needsThreeLines) {
    const target = text.length / 3
    let bestI = 0
    let bestJ = 1
    let bestScore = Number.POSITIVE_INFINITY
    for (let i = 0; i < words.length - 2; i++) {
      const line1 = words.slice(0, i + 1).join(' ')
      for (let j = i + 1; j < words.length - 1; j++) {
        const line2 = words.slice(i + 1, j + 1).join(' ')
        const line3 = words.slice(j + 1).join(' ')
        const score =
          Math.abs(line1.length - target) +
          Math.abs(line2.length - target) +
          Math.abs(line3.length - target)
        if (score < bestScore) {
          bestScore = score
          bestI = i
          bestJ = j
        }
      }
    }
    return [
      words.slice(0, bestI + 1).join(' '),
      words.slice(bestI + 1, bestJ + 1).join(' '),
      words.slice(bestJ + 1).join(' '),
    ]
  }

  let bestSplit = 0
  let bestDiff = Number.POSITIVE_INFINITY
  for (let i = 0; i < words.length - 1; i++) {
    const left = words.slice(0, i + 1).join(' ')
    const right = words.slice(i + 1).join(' ')
    const diff = Math.abs(left.length - right.length)
    if (diff < bestDiff) {
      bestDiff = diff
      bestSplit = i
    }
  }

  return [words.slice(0, bestSplit + 1).join(' '), words.slice(bestSplit + 1).join(' ')]
}

export default async function handler(request: Request) {
  const url = new URL(request.url)
  const title = url.searchParams.get('title') || 'Tempo'
  const section = url.searchParams.get('section') || ''
  const subsection = url.searchParams.get('subsection') || ''

  const hasSubsection = !!subsection

  const fontSize = getTitleFontSize(title)

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
          {balanceLines(title, fontSize).map((line) => (
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
        fonts: [
          { name: 'HBSet', data: hbSetFont, weight: 300, style: 'normal' as const },
          { name: 'Pilat', data: pilatFont, weight: 400, style: 'normal' as const },
        ],
      },
    )
  } catch (error) {
    console.error(error)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
