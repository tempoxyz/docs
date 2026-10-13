import { lazy, Suspense } from 'react'
import Header from './_components/Header'
import Hero from './_components/Hero'
import * as ui from './page.recipes'

const HomeBelowFold = lazy(() => import('./_components/HomeBelowFold'))

export default function Home() {
  return (
    <main {...ui.main()}>
      <div {...ui.homeLayout()}>
        <Header />
        <Hero />
        <Suspense fallback={null}>
          <HomeBelowFold />
        </Suspense>
      </div>
    </main>
  )
}
