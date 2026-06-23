import { useEffect, useRef, useState } from 'react'
import { fetchPerfRuns } from '../performance/_lib/runs'
import Footer from './Footer'
import HomeShowcases from './HomeShowcases'
import OpenSourceSection from './OpenSourceSection'
import PerfSection from './PerfSection'
import { stats as fallbackStats, fetchStats } from './stats'

export default function HomeBelowFold() {
  const [stats, setStats] = useState(fallbackStats)
  const [runs, setRuns] = useState<Awaited<ReturnType<typeof fetchPerfRuns>>>([])
  const [loadPerfData, setLoadPerfData] = useState(false)
  const perfSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = perfSectionRef.current
    if (!section || loadPerfData) return
    if (!('IntersectionObserver' in window)) {
      const timeoutId = globalThis.setTimeout(() => setLoadPerfData(true), 4_000)
      return () => globalThis.clearTimeout(timeoutId)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setLoadPerfData(true)
        observer.disconnect()
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [loadPerfData])

  useEffect(() => {
    if (!loadPerfData) return
    let active = true
    Promise.all([fetchStats(), fetchPerfRuns()]).then(([perfData, perfRuns]) => {
      if (!active) return
      setStats(perfData.stats)
      setRuns(perfRuns)
    })
    return () => {
      active = false
    }
  }, [loadPerfData])

  return (
    <>
      <HomeShowcases />
      <div ref={perfSectionRef} id="performance" className="mt-[140px] scroll-mt-12">
        <PerfSection stats={stats} runs={runs} />
      </div>
      <div id="open-source" className="mt-[140px] scroll-mt-12">
        <OpenSourceSection />
      </div>
      <Footer />
    </>
  )
}
