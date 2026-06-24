import Link from 'next/link'
import type { ReactNode } from 'react'
import ArrowUpRight from './ArrowUpRight'

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
      {external ? (
        <ArrowUpRight className="absolute top-2.5 right-3 size-3 text-foreground/35 transition-colors group-hover/item:text-foreground/60" />
      ) : null}
      <span className="grid size-[34px] shrink-0 place-items-center bg-surface-input text-foreground">
        {link.icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-sans text-[14px] text-foreground tracking-[0]">{link.label}</span>
        <span className="font-sans text-[13px] text-foreground/45 leading-[1.4] tracking-[0]">
          {link.desc}
        </span>
      </span>
    </>
  )

  const className =
    'group/item relative flex items-start gap-3 rounded-[4px] px-3 py-2.5 transition-colors hover:bg-foreground/[0.04]'

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
      <div className="w-[360px] p-3">
        <ul className="flex flex-col gap-1">
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
    <div className="flex w-max gap-1 p-3">
      {data.columns.map((col) => {
        return (
          <div key={col.title} className="w-[224px]">
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
