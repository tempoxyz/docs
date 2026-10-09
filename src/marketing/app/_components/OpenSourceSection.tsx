'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ripple } from '../../../styles/motion'
import { repoBrandSquareNeutral } from '../../../styles/surfaces.styles'
import { variants } from '../../../styles/theme'
import ArrowUpRight from './ArrowUpRight'
import EdgeMarkers from './EdgeMarkers'
import * as ui from './OpenSourceSection.recipes'
import Reveal from './Reveal'

type Repo = {
  name: string
  desc: string
  href: string
  brandColor: string
}

const repos: Repo[] = [
  {
    name: 'Tempo',
    desc: 'The chain itself: node, EVM, and protocol.',
    href: 'https://github.com/tempoxyz',
    brandColor: '#ffffff',
  },
  {
    name: 'MPP',
    desc: 'The open machine-payments protocol, co-authored with Stripe.',
    href: 'https://mpp.dev/',
    brandColor: '#ffffff',
  },
  {
    name: 'Reth',
    desc: 'The Rust execution client Tempo runs on.',
    href: 'https://github.com/paradigmxyz/reth',
    brandColor: '#F74C00',
  },
  {
    name: 'Foundry',
    desc: 'The standard for testing and deploying contracts.',
    href: 'https://www.getfoundry.sh/',
    brandColor: '#04E100',
  },
  {
    name: 'Viem',
    desc: 'TypeScript interfaces for Ethereum and Tempo apps.',
    href: 'https://viem.sh/',
    brandColor: '#FFC515',
  },
  {
    name: 'Wagmi',
    desc: 'React hooks and app primitives for onchain interfaces.',
    href: 'https://wagmi.sh/',
    brandColor: '#455CB8',
  },
]

// Decorative Reth chip straddling the shell's left boundary line. Hidden at
// rest; it scales into view only while the "Reth" repo tile below is hovered.
// Only rendered when the viewport is wide enough for it to hang outside the
// max-w-7xl shell without being clipped.
function RethBadge({ shown }: { shown: boolean }) {
  const reveal = ` ${ui.rethBadgeStateState().className} ${
    shown ? ui.rethBadgeStateState2().className : ui.rethBadgeStateState3().className
  }`

  return (
    <div aria-hidden="true" {...ui.rethBadgeLayout()}>
      <div className={` ${ui.rethBadgeLayout2({ className: 'group' }).className} ${reveal}`}>
        {/* Ripple rings: invisible at rest, expanding outward while hovered. */}
        <span {...rippleRing({ delayed: false })} />
        <span {...rippleRing({ delayed: true })} />
        <div className={` ${ui.rethBadgeLayout3().className} ${reveal}`}>
          <Image src="/assets/reth.svg" alt="" width={75} height={75} className={reveal} />
        </div>
      </div>
    </div>
  )
}

export default function OpenSourceSection() {
  const [rethHovered, setRethHovered] = useState(false)
  return (
    <section {...ui.openSourceSectionSection()}>
      <RethBadge shown={rethHovered} />
      <Reveal className={ui.reveal().className}>
        <h2 {...ui.openSourceSectionHeading()}>Open source</h2>
        <p {...ui.openSourceSectionDescription()}>
          All of Tempo&apos;s code is open source, built by the same team behind Reth, Foundry,
          viem, and more.
        </p>
      </Reveal>

      <div {...ui.openSourceSectionLayout()}>
        <EdgeMarkers wideOnly />
        <ul {...ui.openSourceSectionList()}>
          {repos.map(({ name, desc, href, brandColor }, i) => {
            const neutralMarker = name === 'Tempo' || name === 'MPP'
            const isReth = name === 'Reth'

            return (
              <li key={name} {...ui.openSourceSectionItem()}>
                <Reveal delay={i * 50} className={ui.openSourceSectionItem().className}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={isReth ? () => setRethHovered(true) : undefined}
                    onMouseLeave={isReth ? () => setRethHovered(false) : undefined}
                    {...ui.openSourceSectionLink({ className: 'group' })}
                  >
                    <span {...ui.openSourceSectionText()}>
                      <span {...ui.openSourceSectionText2()}>
                        <span
                          aria-hidden="true"
                          {...ui.openSourceSectionTextAppearance({
                            value0: neutralMarker ? 'var(--foreground)' : brandColor,
                            className: ` ${ui.openSourceSectionText3().className} ${neutralMarker ? `repo-brand-square-neutral ${repoBrandSquareNeutral().className}` : ''}`,
                          })}
                        />
                        <span {...ui.openSourceSectionText4()}>{name}</span>
                      </span>
                      <ArrowUpRight className={ui.arrowUpRight().className} />
                    </span>

                    <span {...ui.openSourceSectionText5()}>{desc}</span>
                  </a>
                </Reveal>
              </li>
            )
          })}
        </ul>
        <Reveal>
          <a
            href="https://github.com/tempoxyz"
            target="_blank"
            rel="noopener noreferrer"
            {...ui.openSourceSectionLink2({ className: 'group' })}
          >
            View on GitHub
            <ArrowUpRight className={ui.arrowUpRight2().className} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}

const rippleRing = variants({
  base: {
    pointerEvents: 'none',
    position: 'absolute',
    inset: 0,
    border: '1px solid var(--line)',
    opacity: 0,
    animationDuration: '2.8s',
    animationTimingFunction: 'ease-out',
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: no-preference) and (hover: hover)': {
      selectors: { '.group:hover &': { animationName: ripple } },
    },
  },
  variants: { delayed: { true: { animationDelay: '1.4s' }, false: { animationDelay: '0s' } } },
})
