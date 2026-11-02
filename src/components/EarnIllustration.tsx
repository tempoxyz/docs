import type { ReactNode } from 'react'
import flow from '../../public/illustrations/earn/flow.svg?raw'
import revenueShare from '../../public/illustrations/earn/revenue-share.svg?raw'
import strategyCredit from '../../public/illustrations/earn/strategy-credit.svg?raw'
import strategyLending from '../../public/illustrations/earn/strategy-lending.svg?raw'
import strategyTreasuries from '../../public/illustrations/earn/strategy-treasuries.svg?raw'
import {
  earnIllustration,
  earnIllustrationPanel,
  earnIllustrationWide,
  earnStrategyCard,
  earnStrategyCardCopy,
  earnStrategyCardDescription,
  earnStrategyCards,
  earnStrategyCardsGrid,
  earnStrategyCardTitle,
} from './EarnIllustration.styles'

const illustrations = {
  flow: { svg: flow, size: earnIllustrationWide },
  'revenue-share': { svg: revenueShare, size: earnIllustrationPanel },
}

const strategies = {
  treasuries: strategyTreasuries,
  credit: strategyCredit,
  lending: strategyLending,
}

/** Replace the generated title/description ids, which would repeat when several SVGs share a page. */
function inlineSvg(svg: string, label?: string) {
  const escaped = label?.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
  return svg
    .replace(/<title\b[^>]*>[\s\S]*?<\/title><desc\b[^>]*>[\s\S]*?<\/desc>/, '')
    .replace(/<svg\b[^>]*>/, (openingTag) =>
      openingTag
        .replace(/\s(?:role|aria-label|aria-labelledby)="[^"]*"/g, '')
        .replace(
          />$/,
          escaped
            ? ` role="img" aria-label="${escaped}">`
            : ' aria-hidden="true" focusable="false">',
        ),
    )
}

/** An Earn guide figure: checked-in artwork that follows the page theme. */
export function EarnIllustration({
  name,
  alt,
  caption,
}: {
  name: keyof typeof illustrations
  alt: string
  caption?: string
}) {
  const { svg, size } = illustrations[name]
  return (
    <figure className={`docs-earn-art ${earnIllustration().className} ${size().className}`}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local SVG source; alt is escaped. */}
      <div dangerouslySetInnerHTML={{ __html: inlineSvg(svg, alt) }} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

/** A row of strategy categories, each with its artwork, name, and one-line description. */
export function EarnStrategyCards({ children }: { children: ReactNode }) {
  return (
    <div className={earnStrategyCards().className}>
      <ul className={earnStrategyCardsGrid().className}>{children}</ul>
    </div>
  )
}

export function EarnStrategyCard({
  strategy,
  title,
  description,
}: {
  strategy: keyof typeof strategies
  title: string
  description: string
}) {
  return (
    <li className={`docs-earn-art ${earnStrategyCard().className}`}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local SVG source. */}
      <div dangerouslySetInnerHTML={{ __html: inlineSvg(strategies[strategy]) }} />
      <div className={earnStrategyCardCopy().className}>
        <span className={earnStrategyCardTitle().className}>{title}</span>
        <span className={earnStrategyCardDescription().className}>{description}</span>
      </div>
    </li>
  )
}
