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
import * as ui from './page.recipes'

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
    <main {...ui.main()}>
      <div {...ui.featurePageLayout()}>
        <Header />

        <section {...ui.featurePageSection()}>
          <HeroDots plus={feature.slug === 'transactions' || feature.slug === 'tokens'} />
          <Reveal className={ui.reveal().className}>
            <h1 {...ui.featurePageTitle()}>{feature.title}</h1>
            <p {...ui.featurePageDescription()}>{feature.description}</p>
            <div {...ui.featurePageLayout2()}>
              <Button
                href={primaryAction.href}
                variant="primary"
                className={ui.featurePageButton().className}
              >
                {primaryAction.label}
              </Button>
              {secondaryActions.length > 0 ? (
                <div {...ui.featurePageLayout3()}>
                  {secondaryActions.map((action) => (
                    <Button
                      key={action.label}
                      href={action.href}
                      variant="secondary"
                      arrow
                      className={ui.featurePageButton2().className}
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
          <div id="capabilities" {...ui.featurePageLayout4()}>
            {items.map((item, i) => (
              <Reveal key={item.label} delay={i * 50}>
                <div {...ui.featurePageLayout5()}>
                  <div {...ui.featurePageLayout6()}>
                    <h3 {...ui.featurePageHeading()}>{item.label}</h3>
                    <p {...ui.featurePageDescription2()}>{item.desc}</p>
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
