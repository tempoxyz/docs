import type { ReactNode } from 'react'
import ousd from '../../public/icons/ousd.svg?raw'
import accounts from '../../public/illustrations/docs/accounts.svg?raw'
import earn from '../../public/illustrations/docs/earn.svg?raw'
import getStarted from '../../public/illustrations/docs/get-started.svg?raw'
import machinePayments from '../../public/illustrations/docs/machine-payments.svg?raw'
import payments from '../../public/illustrations/docs/payments.svg?raw'
import partners from '../../public/illustrations/docs/partners.svg?raw'
import routes from '../../public/illustrations/docs/routes.svg?raw'
import tempoEvm from '../../public/illustrations/docs/tempo-evm.svg?raw'
import zones from '../../public/illustrations/docs/zones.svg?raw'
import './DocsProductOverview.css'

const illustrations = {
  ousd,
  'get-started': getStarted,
  accounts,
  payments,
  earn,
  routes,
  zones,
  'machine-payments': machinePayments,
  partners,
  'tempo-evm': tempoEvm,
}

/** A single page introduction, with authored text beside the product illustration. */
export function DocsProductOverview({
  children,
  image,
  alt,
}: {
  children: ReactNode
  image: keyof typeof illustrations
  alt: string
}) {
  const label = alt.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
  const svg = illustrations[image].replace(/<svg\b[^>]*>/, (openingTag) =>
    openingTag
      .replace(/\s(?:role|aria-label|aria-labelledby)="[^"]*"/g, '')
      .replace(/>$/, ` role="img" aria-label="${label}">`),
  )

  return (
    <header className="docs-product-overview">
      <div className="docs-product-overview-layout">
        <div className="docs-product-overview-copy">{children}</div>
        <figure className="docs-product-overview-art">
          {/* Inline checked-in artwork preserves selectable text and the site font. */}
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted local SVG source; alt is escaped above. */}
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        </figure>
      </div>
    </header>
  )
}
