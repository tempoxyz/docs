'use client'

import { Link, useRouter } from 'waku'
import { showsStartBuilding, startBuildingSteps, startBuildingTitle } from '../lib/start-building'
import * as ui from './StartBuilding.recipes'

/**
 * Closes every docs page with the steps to start building on Tempo, the same
 * steps and links its Markdown export ends with (`src/lib/start-building.ts`).
 */
export default function StartBuilding() {
  const { path } = useRouter()
  if (!showsStartBuilding(path ?? '/')) return null

  return (
    <aside aria-label={startBuildingTitle} {...ui.startBuildingSection()}>
      <h2 {...ui.startBuildingHeading()}>{startBuildingTitle}</h2>
      <ol {...ui.startBuildingList()}>
        {startBuildingSteps.map((step, index) => (
          <li {...ui.startBuildingItem()} key={index}>
            {step.map((part, key) =>
              typeof part === 'string' ? (
                part
              ) : 'code' in part ? (
                <code key={key} {...ui.startBuildingCode()}>
                  {part.code}
                </code>
              ) : part.href.startsWith('/') ? (
                <Link key={key} to={part.href} {...ui.startBuildingLink()}>
                  {part.label}
                </Link>
              ) : (
                <a key={key} href={part.href} {...ui.startBuildingLink()}>
                  {part.label}
                </a>
              ),
            )}
          </li>
        ))}
      </ol>
    </aside>
  )
}
