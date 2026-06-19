import { useEffect, useState } from 'react'
import Footer from './_components/Footer'
import Header from './_components/Header'
import Hero from './_components/Hero'
import HomeShowcases from './_components/HomeShowcases'
import OpenSourceSection from './_components/OpenSourceSection'
import PerfSection from './_components/PerfSection'
import { stats as fallbackStats, fetchStats } from './_components/stats'
import { fetchPerfRuns } from './performance/_lib/runs'

export default function Home() {
  const [stats, setStats] = useState(fallbackStats)
  const [runs, setRuns] = useState<Awaited<ReturnType<typeof fetchPerfRuns>>>([])

  useEffect(() => {
    let active = true
    Promise.all([fetchStats(), fetchPerfRuns()]).then(([perfData, perfRuns]) => {
      if (!active) return
      setStats(perfData.stats)
      setRuns(perfRuns)
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <main className="min-h-screen w-full bg-surface-page">
      <div className="mx-auto w-full max-w-7xl border-line border-x bg-surface-shell">
        <Header />
        <Hero />
        <HomeShowcases />
        <div id="performance" className="mt-[140px] scroll-mt-12">
          <PerfSection stats={stats} runs={runs} />
        </div>
        <div id="open-source" className="mt-[140px] scroll-mt-12">
          <OpenSourceSection />
        </div>
        <Footer />
      </div>
    </main>
  )
}
