'use client'

import { Fragment, useState } from 'react'
import EdgeMarkers from '../../_components/EdgeMarkers'
import Reveal from '../../_components/Reveal'

type FaqAnswerPart =
  | string
  | {
      text: string
      href: string
    }

export type FaqItem = {
  question: string
  answer: FaqAnswerPart[]
}

export default function FeatureFaq({
  title,
  intro,
  items,
}: {
  title: string
  intro: string
  items: FaqItem[]
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section id="faq" className="mt-[140px] scroll-mt-12">
      <Reveal className="relative border-line border-t">
        <EdgeMarkers wideOnly />
        <div className="grid border-line border-b lg:grid-cols-[0.78fr_1.22fr]">
          <div className="border-line border-b bg-surface-shell px-5 py-14 lg:border-r lg:border-b-0 lg:px-12 lg:py-20">
            <h2 className="max-w-[520px] text-balance font-sans text-[clamp(2rem,6vw,3rem)] text-foreground leading-[1.08] tracking-[-0.03em] antialiased">
              {title}
            </h2>
            <p className="mt-5 max-w-[500px] font-sans text-[16px] text-foreground/50 leading-[1.5] tracking-[0]">
              {intro}
            </p>
          </div>

          <div className="bg-surface-shell">
            {items.map((item, index) => {
              const isActive = index === activeIndex
              const answerId = `faq-answer-${index}`

              return (
                <div
                  key={item.question}
                  className={`flex flex-col justify-center overflow-hidden border-line border-b px-5 transition-[height,background-color] duration-300 ease-out last:border-b-0 motion-reduce:transition-none lg:px-10 ${
                    isActive ? 'h-[236px] bg-surface-block md:h-[220px]' : 'h-[116px]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-expanded={isActive}
                    aria-controls={answerId}
                    className="flex w-full items-start justify-between gap-6 text-left"
                  >
                    <span className="max-w-[720px] font-sans text-[20px] text-foreground leading-[1.2] tracking-[0] lg:text-[24px]">
                      {item.question}
                    </span>
                    <span
                      aria-hidden
                      className={`mt-1 grid size-6 shrink-0 place-items-center border border-line font-mono text-[16px] leading-none transition-colors ${
                        isActive ? 'bg-foreground text-background' : 'text-foreground/45'
                      }`}
                    >
                      {isActive ? '-' : '+'}
                    </span>
                  </button>
                  <div
                    id={answerId}
                    inert={!isActive}
                    aria-hidden={!isActive}
                    className={`grid max-w-[720px] transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out motion-reduce:transition-none ${
                      isActive
                        ? 'mt-5 grid-rows-[1fr] opacity-100'
                        : 'mt-0 grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="font-sans text-[16px] text-foreground/50 leading-[1.55] tracking-[0]">
                        {item.answer.map((part) =>
                          typeof part === 'string' ? (
                            <Fragment key={part}>{part}</Fragment>
                          ) : (
                            <a
                              key={part.href}
                              href={part.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground/75 underline decoration-foreground/25 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
                            >
                              {part.text}
                            </a>
                          ),
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
