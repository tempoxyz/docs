import Link from 'next/link'
import type { ReactNode } from 'react'
import ArrowUpRight from './ArrowUpRight'
import * as ui from './MegaMenu.recipes'

export type MegaLink = {
  label: string
  desc: string
  href: string
  icon: ReactNode
}

export type MegaColumn = { title: string; items: MegaLink[] }
export type MegaMenuData = { columns: MegaColumn[]; variant?: 'columns' | 'vertical' }

// One leaf link: an icon tile beside a stacked label + description. Internal
// hrefs (starting with "/") route through next/link; everything else opens in a
// new tab. Icon tiles use neutral surfaces so the nav stays monochrome.
function MegaItem({ link }: { link: MegaLink }) {
  const external = !link.href.startsWith('/') && !link.href.startsWith('#')
  const inner = (
    <>
      {external ? <ArrowUpRight className={ui.arrowUpRight().className} /> : null}
      <span {...ui.megaItemText()}>{link.icon}</span>
      <span {...ui.megaItemText2()}>
        <span {...ui.megaItemText3()}>{link.label}</span>
        <span {...ui.megaItemText4()}>{link.desc}</span>
      </span>
    </>
  )

  const className = ui.megaItemStateState({ className: 'group/item' }).className

  return link.href.startsWith('/') ? (
    <Link href={link.href} className={className}>
      {inner}
    </Link>
  ) : (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  )
}

// Chrome (border, bg, shadow) lives on the shared morphing surface in Header,
// so panels can crossfade inside one box.
export default function MegaMenu({ data }: { data: MegaMenuData }) {
  if (data.variant === 'vertical') {
    return (
      <div {...ui.megaMenuLayout()}>
        <ul {...ui.megaMenuList()}>
          {data.columns
            .flatMap((col) => col.items)
            .map((item) => (
              <li key={item.label}>
                <MegaItem link={item} />
              </li>
            ))}
        </ul>
      </div>
    )
  }

  return (
    <div {...ui.megaMenuLayout2()}>
      {data.columns.map((col) => {
        return (
          <div key={col.title} {...ui.megaMenuLayout3()}>
            <ul>
              {col.items.map((item) => (
                <li key={item.label}>
                  <MegaItem link={item} />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
