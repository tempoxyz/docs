// biome-ignore lint/correctness/noUnusedImports: the golden renderer uses the classic JSX runtime
import React from 'react'
import { layoutTitle } from './og-layout'

export function OgImage({
  title,
  section,
  subsection,
  backgroundUrl,
}: {
  title: string
  section: string
  subsection: string
  backgroundUrl: string
}) {
  const { lines, fontSize } = layoutTitle(title)
  const hasSubsection = !!subsection

  return (
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
        src={backgroundUrl}
        width={1200}
        height={657}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />

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
    </div>
  )
}
