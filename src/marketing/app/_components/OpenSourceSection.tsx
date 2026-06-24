'use client'

import Image from 'next/image'
import { useState } from 'react'
import ArrowUpRight from './ArrowUpRight'
import EdgeMarkers from './EdgeMarkers'
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
  const reveal = `transition-[opacity,scale] duration-350 ease-out motion-reduce:transition-none ${
    shown ? 'scale-100 opacity-100' : 'scale-40 opacity-0'
  }`

  return (
    <div aria-hidden className="absolute top-0 left-0 hidden -translate-x-1/2 2xl:block">
      <div className={`group relative border border-line/30 bg-surface-page p-2.5 ${reveal}`}>
        {/* Ripple rings: invisible at rest, expanding outward while hovered. */}
        <span className="pointer-events-none absolute inset-0 border border-line opacity-0 motion-safe:group-hover:animate-[ripple_2.8s_ease-out_infinite]" />
        <span className="pointer-events-none absolute inset-0 border border-line opacity-0 motion-safe:group-hover:animate-[ripple_2.8s_ease-out_1.4s_infinite]" />
        <div className={`border border-line p-2.5 ${reveal}`}>
          <Image src="/assets/reth.svg" alt="" width={75} height={75} className={reveal} />
        </div>
      </div>
    </div>
  )
}

export default function OpenSourceSection() {
  const [rethHovered, setRethHovered] = useState(false)
  return (
    <section className="relative pb-6">
      <RethBadge shown={rethHovered} />
      <Reveal className="flex flex-col items-center px-5 text-center">
        <h2 className="font-sans text-[clamp(2rem,6vw,3rem)] text-foreground leading-[1.1] tracking-[-0.02em] antialiased">
          Open source
        </h2>
        <p className="mt-6 max-w-[560px] font-sans text-[16px] text-foreground/50 leading-[1.4] tracking-[0] lg:text-[20px]">
          All of Tempo&apos;s code is open source, built by the same team behind Reth, Foundry,
          viem, and more.
        </p>
      </Reveal>

      <div className="relative mt-16">
        <EdgeMarkers wideOnly />
        <ul className="grid auto-rows-fr grid-cols-1 gap-px border-line border-y bg-line md:grid-cols-2 xl:grid-cols-3">
          {repos.map(({ name, desc, href, brandColor }, i) => {
            const neutralMarker = name === 'Tempo' || name === 'MPP'
            const isReth = name === 'Reth'

            return (
              <li key={name} className="h-full">
                <Reveal delay={i * 50} className="h-full">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={isReth ? () => setRethHovered(true) : undefined}
                    onMouseLeave={isReth ? () => setRethHovered(false) : undefined}
                    className="group flex h-full min-h-[220px] flex-col justify-between bg-surface-shell p-6 text-left transition-colors hover:bg-surface-block lg:p-8"
                  >
                    <span className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className={`size-3 shrink-0 ${neutralMarker ? 'repo-brand-square-neutral' : ''}`}
                          style={neutralMarker ? undefined : { backgroundColor: brandColor }}
                        />
                        <span className="font-sans text-[18px] text-foreground tracking-[0]">
                          {name}
                        </span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-foreground/35 transition-colors group-hover:text-foreground/80" />
                    </span>

                    <span className="mt-8 font-sans text-[15px] text-foreground/65 leading-[1.45] tracking-[0] transition-colors group-hover:text-foreground/85">
                      {desc}
                    </span>
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
            className="group flex items-center justify-center gap-2 border-line border-b px-5 py-5 font-sans text-[16px] text-foreground tracking-[0] transition-colors hover:bg-surface-block lg:px-8"
          >
            View on GitHub
            <ArrowUpRight className="size-4 shrink-0 text-foreground/45 transition-colors group-hover:text-foreground/80" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
