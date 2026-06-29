import Link from 'next/link'
import { developersPath } from '../_lib/developersPaths'
import { featurePath } from '../_lib/featurePaths'
import ArrowUpRight from './ArrowUpRight'
import Button from './Button'
import EdgeMarkers from './EdgeMarkers'
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
    <section className="relative isolate border-line border-b px-5 pt-[72px] pb-12 lg:pt-28 lg:pb-16">
      <EdgeMarkers edge="bottom" wideOnly />
      <HeroPatternCanvas />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[0%] from-surface-shell via-[50%] via-surface-shell/95 to-[100%] to-transparent"
      />
      <Reveal className="mx-auto flex w-full max-w-[860px] flex-col items-center text-center">
        <h1 className="max-w-[820px] font-sans text-[42px] text-foreground leading-[1.05] tracking-[-0.03em] antialiased sm:text-[56px] lg:text-[68px]">
          Engineered for payments from the ground up
        </h1>
        <p className="mt-5 max-w-[640px] font-sans text-[16px] text-foreground-secondary leading-[1.5] tracking-[0] lg:text-[18px]">
          Accept payments, issue stablecoins, and build blockchain applications that scale globally
          from day one.
        </p>
        <nav
          aria-label="Get started with Tempo"
          className="mt-9 flex w-full max-w-[420px] flex-col gap-2.5 sm:max-w-none sm:flex-row sm:justify-center"
        >
          <Button
            href={primaryAction.href}
            variant={primaryAction.variant}
            className="h-12 w-full px-6 sm:w-auto"
          >
            {primaryAction.label}
          </Button>
          <div className="grid grid-cols-2 gap-2.5 sm:contents">
            {secondaryActions.map((link) => (
              <Button
                key={link.label}
                href={link.href}
                variant={link.variant}
                className="h-12 w-full px-6 sm:w-auto"
              >
                {link.label}
              </Button>
            ))}
          </div>
        </nav>
      </Reveal>
      <nav
        id="protocol"
        aria-label="Choose what to build on Tempo"
        className="mx-auto mt-16 w-full max-w-5xl scroll-mt-12 lg:mt-20"
      >
        <ul className="grid gap-px border border-line bg-line lg:grid-cols-3">
          {HERO_PATHS.map((path, index) => (
            <li key={path.title} className="bg-surface-shell">
              <Link
                href={path.href}
                className="group flex h-full min-h-[150px] flex-col p-5 text-left transition-colors hover:bg-surface-block"
              >
                <span className="flex items-start justify-between gap-4">
                  <span
                    aria-hidden
                    className="size-4 shrink-0"
                    style={{
                      backgroundImage: `radial-gradient(circle, ${colorForIndex(index)} 1px, transparent 1.4px)`,
                      backgroundSize: '5px 5px',
                    }}
                  />
                  <ArrowUpRight className="size-5 shrink-0 text-foreground/30 transition-colors group-hover:text-foreground" />
                </span>
                <span className="mt-7 block">
                  <span className="block text-wrap font-sans text-[18px] text-foreground leading-[1.15] tracking-[0] sm:text-[20px] lg:text-[21px] xl:text-[22px]">
                    {path.title}
                  </span>
                  <span className="mt-3 line-clamp-2 block font-sans text-[15px] text-foreground-secondary leading-[1.4] tracking-[0] transition-colors group-hover:text-foreground">
                    {path.desc}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
