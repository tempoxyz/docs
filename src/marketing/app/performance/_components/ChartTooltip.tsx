import type { ReactNode } from 'react'

// Floating data card for chart hover states, clamped inside the chart width.
export default function ChartTooltip({
  x,
  width,
  children,
}: {
  x: number
  width: number
  children: ReactNode
}) {
  const clamped = Math.min(Math.max(x, 110), width - 110)
  return (
    <div
      className="pointer-events-none absolute top-3 z-10 -translate-x-1/2 border border-line bg-surface-panel px-3.5 py-2.5 shadow-xl"
      style={{ left: clamped }}
    >
      {children}
    </div>
  )
}
