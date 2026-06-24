import { lazy, Suspense } from 'react'
import Header from './_components/Header'
import Hero from './_components/Hero'

const HomeBelowFold = lazy(() => import('./_components/HomeBelowFold'))

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-surface-page">
      <div className="mx-auto w-full max-w-7xl border-line border-x bg-surface-shell">
        <Header />
        <Hero />
        <Suspense fallback={null}>
          <HomeBelowFold />
        </Suspense>
      </div>
    </main>
  )
}
