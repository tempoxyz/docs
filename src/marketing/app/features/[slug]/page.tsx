import { notFound } from 'next/navigation'
import Button from '../../_components/Button'
import CodePanel from '../../_components/CodePanel'
import Footer from '../../_components/Footer'
import { features } from '../../_components/features'
import Header from '../../_components/Header'
import HeroDots from '../../_components/HeroDots'
import Reveal from '../../_components/Reveal'
import TokensSections from '../_components/TokensSections'
import TransactionsSections from '../_components/TransactionsSections'

export function generateStaticParams() {
  return features.map((feature) => ({ slug: feature.slug }))
}

type FeatureParams = { slug: string } | Promise<{ slug: string }>

function resolveParams(params: FeatureParams) {
  if ('then' in params) {
    throw new Error('FeaturePage must receive resolved params in the Vite adapter')
  }
  return params
}

export default function FeaturePage({ params }: { params: FeatureParams }) {
  const { slug } = resolveParams(params)
  const feature = features.find((f) => f.slug === slug)
  if (!feature) notFound()

  // The dedicated page has room for the full capability set.
  const items = [...feature.items, ...(feature.extraItems ?? [])]

  const heroActions = feature.heroActions ?? [
    { label: feature.readLabel, href: feature.readHref, primary: true },
  ]
  const primaryAction = heroActions.find((a) => a.primary) ?? heroActions[0]
  const secondaryActions = heroActions.filter((a) => a !== primaryAction)

  const page = (
    <main className="min-h-screen w-full bg-surface-page">
      <div className="mx-auto w-full max-w-7xl border-line border-x bg-surface-shell">
        <Header />

        <section className="relative isolate px-5 py-28 lg:py-36">
          <HeroDots plus={feature.slug === 'transactions' || feature.slug === 'tokens'} />
          <Reveal className="flex flex-col items-center text-center">
            <h1 className="text-balance font-sans text-[clamp(2.5rem,7vw,3.5rem)] text-foreground leading-[1.05] tracking-[-0.03em] antialiased">
              {feature.title}
            </h1>
            <p className="mt-5 max-w-[560px] text-balance font-sans text-[16px] text-foreground/50 leading-[1.5] tracking-[0] lg:text-[18px]">
              {feature.description}
            </p>
            <div className="mt-9 flex w-full max-w-[420px] flex-col gap-2.5 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
              <Button
                href={primaryAction.href}
                variant="primary"
                className="h-12 w-full px-6 sm:w-auto"
              >
                {primaryAction.label}
              </Button>
              {secondaryActions.length > 0 ? (
                <div className="grid grid-cols-2 gap-2.5 sm:contents">
                  {secondaryActions.map((action) => (
                    <Button
                      key={action.label}
                      href={action.href}
                      variant="secondary"
                      arrow
                      className="h-12 w-full px-4 sm:w-auto sm:px-6"
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          </Reveal>
        </section>

        {/* Every snippet expanded — no select-to-reveal on the dedicated page.
            Rows run full-bleed so their borders meet the shell's side borders;
            the content is inset to match the section intros. */}
        {feature.slug === 'transactions' ? (
          <TransactionsSections />
        ) : feature.slug === 'tokens' ? (
          <TokensSections />
        ) : (
          <div id="capabilities" className="scroll-mt-12 border-line border-t">
            {items.map((item, i) => (
              <Reveal key={item.label} delay={i * 50}>
                <div className="grid gap-6 border-line border-b px-5 py-10 lg:grid-cols-2 lg:items-start lg:gap-12 lg:px-8">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-sans text-[20px] text-foreground tracking-[0] lg:text-[24px]">
                      {item.label}
                    </h3>
                    <p className="text-pretty font-sans text-[16px] text-foreground/50 leading-[1.4] tracking-[0] lg:max-w-[360px]">
                      {item.desc}
                    </p>
                  </div>
                  {item.code ? (
                    <CodePanel code={item.code} highlight={item.highlight} inline />
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <Footer />
      </div>
    </main>
  )

  return page
}
