'use client'

import { type ComponentType, type SVGProps, useState } from 'react'
import { cx } from 'zyzz'
import LogoBase from '~icons/token-branded/base'
import LogoBnb from '~icons/token-branded/bnb'
import LogoEthereum from '~icons/token-branded/ethereum'
import LogoHyperEvm from '~icons/token-branded/hyper-evm'
import LogoMonad from '~icons/token-branded/monad'
import LogoPolygon from '~icons/token-branded/polygon'
import LogoSolana from '~icons/token-branded/solana'
import LogoTron from '~icons/token-branded/tron'
import LogoUsdc from '~icons/token-branded/usdc'
import LogoUsdt from '~icons/token-branded/usdt'
import { erc20Address } from '../lib/routes-execution'
import { inherited } from '../styles/inherited'
import { style, vars as tokens } from '../styles/theme'

type Logo = ComponentType<SVGProps<SVGSVGElement>>

// Official chain marks (Web3 Icons) keyed by CAIP-2 id, matching the console's Routes map.
const chainLogos: Record<string, Logo> = {
  'eip155:1': LogoEthereum,
  'eip155:137': LogoPolygon,
  'eip155:143': LogoMonad,
  'eip155:56': LogoBnb,
  'eip155:8453': LogoBase,
  'eip155:999': LogoHyperEvm,
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': LogoSolana,
  'tron:0x2b6653dc': LogoTron,
}
// Tempo chains whose tokens have icons in the token list service.
const tempoChainIds: Record<string, number> = { 'eip155:4217': 4217, 'eip155:42431': 42431 }
// Off-Tempo stablecoins with an official mark, by symbol family.
const tokenLogo = (symbol: string): Logo | undefined =>
  /^USDC/i.test(symbol) ? LogoUsdc : /^USDT/i.test(symbol) ? LogoUsdt : undefined

/** The Tempo "T" mark. Inherits `currentColor`. */
function TempoMark() {
  return (
    <svg aria-hidden="true" {...tempoGlyph()} fill="none" viewBox="0 0 13 14">
      <path d="M4.594 14H.944L4.327 3.173H0L.944 0H13l-.944 3.173H7.96z" fill="currentColor" />
    </svg>
  )
}

function Monogram({ text, size }: { text?: string; size: number }) {
  return (
    <span
      aria-hidden="true"
      {...cx(
        square({ size: `${size}px` }),
        badge(),
        monogram(),
        !!text && monogramFilled(),
        !text && monogramEmpty(),
      )}
    >
      {text?.[0]?.toUpperCase()}
    </span>
  )
}

/** A network's official mark, the Tempo mark for Tempo chains, or a monogram. */
export function ChainLogo({
  chainId,
  name,
  size = 28,
}: {
  chainId?: string
  name?: string
  /** Width and height in pixels. */
  size?: number
}) {
  const Logo = chainId ? chainLogos[chainId] : undefined
  if (Logo) return <Logo aria-hidden="true" {...square({ size: `${size}px` })} />
  if ((chainId && tempoChainIds[chainId]) || (name && /^tempo\b/i.test(name)))
    return (
      <span aria-hidden="true" {...cx(square({ size: `${size}px` }), badge(), tempoBadge())}>
        <TempoMark />
      </span>
    )
  return <Monogram text={name} size={size} />
}

/**
 * A token's icon: Tempo tokens load theirs from the token list service, other stablecoins use
 * their official mark, and anything else falls back to a monogram.
 */
export function TokenLogo({
  chainId,
  tokenKey,
  symbol,
  size = 28,
}: {
  chainId?: string
  tokenKey?: string
  symbol?: string
  /** Width and height in pixels. */
  size?: number
}) {
  const [broken, setBroken] = useState(false)
  const tempo = chainId ? tempoChainIds[chainId] : undefined
  const address = tokenKey ? erc20Address(tokenKey) : undefined
  if (symbol && tempo && address && !broken)
    return (
      <img
        alt=""
        {...cx(square({ size: `${size}px` }), round())}
        onError={() => setBroken(true)}
        src={`https://tokenlist.tempo.xyz/icon/${tempo}/${address}.svg`}
      />
    )
  const Logo = symbol ? tokenLogo(symbol) : undefined
  if (Logo) return <Logo aria-hidden="true" {...square({ size: `${size}px` })} />
  return <Monogram text={symbol} size={size} />
}

// Every logo is a fixed square that never shrinks in a flex row; callers choose the size.
const square = style((values: { size: `${number}px` }) => ({
  width: values.size,
  height: values.size,
  flexShrink: 0,
}))
const round = style({ borderRadius: tokens.radius.full })
const badge = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: tokens.radius.full,
})
const tempoBadge = style({
  backgroundColor: inherited.color.backgroundColorInvert,
  color: inherited.color.textColorInvert,
})
const tempoGlyph = style({ width: 'auto', height: '42%' })
const monogram = style({
  borderWidth: tokens.borderWidth.hairline,
  borderStyle: 'solid',
  borderColor: tokens.color.lineStrong,
  fontWeight: tokens.fontWeight.medium,
  fontSize: tokens.fontSize.caption,
})
const monogramFilled = style({
  backgroundColor: inherited.color.surfacePanel,
  color: inherited.color.textColorPrimary,
})
const monogramEmpty = style({ borderStyle: 'dashed', color: tokens.color.gray10 })
