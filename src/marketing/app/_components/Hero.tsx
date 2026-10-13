import Link from 'next/link'
import { developersPath } from '../_lib/developersPaths'
import { featurePath } from '../_lib/featurePaths'
import ArrowUpRight from './ArrowUpRight'
import Button from './Button'
import EdgeMarkers from './EdgeMarkers'
import * as ui from './Hero.recipes'
import HeroPatternCanvas from './HeroPatternCanvas'
import { colorForIndex } from './palette'
import Reveal from './Reveal'

const HERO_ACTIONS = [
  {
    label: 'Integrate Tempo',
    href: '/docs/quickstart/integrate-tempo',
    variant: 'primary',
  },
  {
    label: 'Accept payments',
    href: '/docs/guide/payments/accept-a-payment',
    variant: 'secondary',
  },
  {
    label: 'Make agentic payments',
    href: '/docs/guide/machine-payments',
    variant: 'secondary',
  },
] as const

const [primaryAction, ...secondaryActions] = HERO_ACTIONS

const HERO_PATHS = [
  {
    title: 'Stablecoin-native tokens',
    desc: 'Stablecoins are first-class on Tempo, with TIP-20 and payments-first features.',
    href: featurePath('tokens'),
  },
  {
    title: 'Transaction flows designed for payments',
    desc: 'Batching, fee sponsorship, scheduling, and parallel transactions are built in.',
    href: featurePath('transactions'),
  },
  {
    title: 'Performance at scale',
    desc: 'Throughput that pushes the frontier, with predictably low fees at scale.',
    href: developersPath('/performance'),
  },
] as const

export default function Hero() {
  return (
    <section {...ui.heroSection()}>
      <EdgeMarkers edge="bottom" wideOnly />
      <HeroPatternCanvas />
      <div aria-hidden="true" {...ui.heroLayout()} />
      <Reveal className={ui.reveal().className}>
        <h1 {...ui.heroTitle()}>Build on the blockchain engineered for payments</h1>
        <p {...ui.heroDescription()}>
          Accept payments, issue stablecoins, and build blockchain applications that scale globally
          from day one.
        </p>
        <nav aria-label="Get started with Tempo" {...ui.nav()}>
          <Button
            href={primaryAction.href}
            variant={primaryAction.variant}
            className={ui.heroButton().className}
          >
            {primaryAction.label}
          </Button>
          <div {...ui.heroLayout2()}>
            {secondaryActions.map((link) => (
              <Button
                key={link.label}
                href={link.href}
                variant={link.variant}
                className={ui.heroButton().className}
              >
                {link.label}
              </Button>
            ))}
          </div>
        </nav>
      </Reveal>
      <nav id="protocol" aria-label="Choose what to build on Tempo" {...ui.nav2()}>
        <ul {...ui.heroList()}>
          {HERO_PATHS.map((path, index) => (
            <li key={path.title} {...ui.heroItem()}>
              <Link href={path.href} className={ui.link({ className: 'group' }).className}>
                <span {...ui.heroText()}>
                  <span
                    aria-hidden="true"
                    {...ui.heroTextAppearance({
                      value0: `radial-gradient(circle, ${colorForIndex(index)} 1px, transparent 1.4px)`,
                      className: ui.heroText2().className,
                    })}
                  />
                  <ArrowUpRight className={ui.arrowUpRight().className} />
                </span>
                <span {...ui.heroText3()}>
                  <span {...ui.heroText4()}>{path.title}</span>
                  <span {...ui.heroText5()}>{path.desc}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
