'use client'

import { Fragment, useState } from 'react'
import { cx as composeStyles } from 'zyzz'
import EdgeMarkers from '../../_components/EdgeMarkers'
import Reveal from '../../_components/Reveal'
import * as ui from './FeatureFaq.recipes'

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
    <section id="faq" {...ui.featureFaqSection()}>
      <Reveal className={ui.reveal().className}>
        <EdgeMarkers wideOnly />
        <div {...ui.featureFaqLayout()}>
          <div {...ui.featureFaqLayout2()}>
            <h2 {...ui.featureFaqHeading()}>{title}</h2>
            <p {...ui.featureFaqDescription()}>{intro}</p>
          </div>

          <div {...ui.featureFaqLayout3()}>
            {items.map((item, index) => {
              const isActive = index === activeIndex
              const answerId = `faq-answer-${index}`

              return (
                <div
                  key={item.question}
                  {...composeStyles(
                    ui.featureFaqLayout4(),
                    !!isActive && ui.featureFaqLayout5(),
                    !isActive && ui.featureFaqLayout6(),
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-expanded={isActive}
                    aria-controls={answerId}
                    {...ui.featureFaqButton()}
                  >
                    <span {...ui.featureFaqText()}>{item.question}</span>
                    <span
                      aria-hidden="true"
                      {...composeStyles(
                        ui.featureFaqText2(),
                        !!isActive && ui.featureFaqText3(),
                        !isActive && ui.featureFaqText4(),
                      )}
                    >
                      {isActive ? '-' : '+'}
                    </span>
                  </button>
                  <div
                    id={answerId}
                    inert={!isActive}
                    aria-hidden={!isActive}
                    {...composeStyles(
                      ui.featureFaqLayout7(),
                      !!isActive && ui.featureFaqLayout8(),
                      !isActive && ui.featureFaqLayout9(),
                    )}
                  >
                    <div {...ui.featureFaqLayout10()}>
                      <p {...ui.featureFaqDescription2()}>
                        {item.answer.map((part) =>
                          typeof part === 'string' ? (
                            <Fragment key={part}>{part}</Fragment>
                          ) : (
                            <a
                              key={part.href}
                              href={part.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              {...ui.featureFaqLink()}
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
