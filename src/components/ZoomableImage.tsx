'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

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
    // biome-ignore lint/correctness/useExhaustiveDependencies: _
  }, [isZoomed, handleClose])

  return (
    <>
      <img
        src={src}
        alt={alt}
        className="cursor-zoom-in rounded-lg border border-gray4 bg-[#F9F9F9] p-[10px] transition-opacity hover:opacity-80"
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
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-8"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
          >
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: only prevents propagation, not interactive */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: only prevents propagation, not interactive */}
            <div
              className="relative flex h-[90vh] w-[90vw] items-center justify-center rounded-lg border border-gray4 bg-[#F9F9F9] p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray6 bg-gray3 text-gray12 transition-colors hover:bg-gray4"
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
              <img
                src={src}
                alt={alt}
                className="max-h-full max-w-full cursor-zoom-out rounded object-contain"
                onClick={handleClose}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
