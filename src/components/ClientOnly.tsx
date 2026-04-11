'use client'
import { Suspense, lazy, type ComponentType } from 'react'

function Placeholder({ minHeight = 200 }: { minHeight?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-gray6 border-dashed text-[14px] text-gray9"
      style={{ minHeight }}
    >
      Loading…
    </div>
  )
}

export function clientOnly<T extends Record<string, unknown>>(
  load: () => Promise<{ default: ComponentType<T> }>,
  options?: { minHeight?: number },
) {
  const Component = lazy(load)

  return function ClientOnly(props: T) {
    return (
      <Suspense fallback={<Placeholder minHeight={options?.minHeight} />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

export function clientOnlyNamed<T extends Record<string, unknown>>(
  load: () => Promise<Record<string, ComponentType<T>>>,
  name: string,
  options?: { minHeight?: number },
) {
  const Component = lazy(() =>
    load().then((mod) => ({ default: mod[name] as ComponentType<T> })),
  )

  return function ClientOnly(props: T) {
    return (
      <Suspense fallback={<Placeholder minHeight={options?.minHeight} />}>
        <Component {...props} />
      </Suspense>
    )
  }
}
