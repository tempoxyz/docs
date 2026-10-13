import type { ReactNode } from 'react'
import * as ui from './ChartTooltip.recipes'

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
      {...ui.chartTooltipLayoutAppearance({
        value0: `${clamped}px`,
        className: ui.chartTooltipLayout().className,
      })}
    >
      {children}
    </div>
  )
}
