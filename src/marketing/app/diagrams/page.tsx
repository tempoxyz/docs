import type { Metadata } from 'next'
import Footer from '../_components/Footer'
import Header from '../_components/Header'
import FeatureDiagramGallery from './_components/FeatureDiagramGallery'
import Playground from './_components/Playground'

export const metadata: Metadata = {
  title: 'Diagrams',
  description:
    "Internal playground for Tempo's diagram language, including feature diagrams and static SVG exports.",
}

export default function DiagramsPage() {
  return (
    <main className="min-h-screen w-full bg-surface-page">
      <div className="mx-auto w-full max-w-7xl border-line border-x bg-surface-shell">
        <Header />

        <section className="px-5 pt-14 pb-10 lg:px-8">
          <h1 className="font-sans text-[clamp(1.75rem,4vw,2.5rem)] text-foreground leading-[1.15] tracking-[-0.02em] antialiased">
            Diagram playground
          </h1>
          <p className="mt-4 max-w-[620px] font-sans text-[15px] text-foreground/50 leading-[1.55]">
            Home of Tempo&apos;s diagram language. Author and preview specs here, then ship them —
            the components live in <code className="font-mono text-[13px]">app/diagrams/</code>.
          </p>
        </section>

        <section className="flex flex-col gap-6 pb-10">
          <div className="px-5 lg:px-8">
            <h2 className="font-sans text-[18px] text-foreground">Feature diagrams</h2>
            <p className="mt-2 max-w-[620px] font-sans text-[14px] text-foreground/50 leading-[1.5]">
              One diagram per Tempo feature, grouped by product area. Each tile is a starting{' '}
              <code className="font-mono text-[12px]">spec</code> in{' '}
              <code className="font-mono text-[12px]">featureCatalog.ts</code> that we refine into a
              purpose-built diagram, feature by feature.
            </p>
          </div>
          <FeatureDiagramGallery />
        </section>

        <section className="flex flex-col gap-6 border-line border-t pt-12">
          <div className="px-5 lg:px-8">
            <h2 className="font-sans text-[18px] text-foreground">Static SVGs</h2>
            <p className="mt-2 max-w-[620px] font-sans text-[14px] text-foreground/50 leading-[1.5]">
              Tweak tokens, drop in data, and copy or download a ready-to-ship SVG.
            </p>
          </div>
          <Playground />
        </section>

        <div className="mt-[140px]">
          <Footer />
        </div>
      </div>
    </main>
  )
}
