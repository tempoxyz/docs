'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import * as ui from './ZoomableImage.recipes'

export function ZoomableImage(props: { src: string; alt: string }) {
  const { src, alt } = props
  const [isZoomed, setIsZoomed] = useState(false)

  const handleOpen = () => setIsZoomed(true)
  const handleClose = () => setIsZoomed(false)

  useEffect(() => {
    if (!isZoomed) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isZoomed, handleClose])

  return (
    <>
      <img
        src={src}
        alt={alt}
        {...ui.img()}
        onClick={handleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleOpen()
          }
        }}
        aria-label={`Click to zoom ${alt}`}
      />

      {isZoomed &&
        createPortal(
          // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard close handled via Escape in useEffect
          <div {...ui.zoomableImageLayout()} onClick={handleClose} role="dialog" aria-modal="true">
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: only prevents propagation, not interactive */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: only prevents propagation, not interactive */}
            <div {...ui.zoomableImageLayout2()} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                {...ui.zoomableImageButton()}
                onClick={handleClose}
                aria-label="Close zoomed image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard close handled via Escape in useEffect */}
              <img src={src} alt={alt} {...ui.img2()} onClick={handleClose} />
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
