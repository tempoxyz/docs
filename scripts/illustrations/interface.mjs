import { box, fade, ink, path, scene, text } from './kit.mjs'

const positive = '#13A963'

const accounts = scene(
  {
    title: 'A connected account balance',
    description:
      'Illustrative Tempo Wallet account connected on Tempo Mainnet, showing an available balance of 1,000 OUSD and a shortened account address.',
  },
  [
    box(40, 40, 400, 280, 32, ink.subtle),
    text(80, 84, 'Available balance', { size: 16, fill: ink.secondary }),
    `<circle cx="316" cy="79" r="3" fill="${positive}"/>`,
    text(328, 84, 'Connected', { size: 14 }),
    text(80, 139, '1,000.00 OUSD', { size: 32, tracking: -0.32 }),
    text(80, 166, 'Tempo Mainnet', { size: 14, fill: ink.secondary }),
    box(80, 190, 320, 48, 12, ink.subtle),
    text(96, 220, '0x84a2…f19c', { size: 16, mono: true }),
    path('M371 208v-4h-10v10h4', ink.secondary),
    box(365, 208, 10, 10, 2, ink.subtle, ink.secondary),
    text(80, 282, 'Wallet', { size: 14, fill: ink.secondary }),
    text(400, 282, 'Tempo Wallet', { size: 16, anchor: 'end' }),
  ].join(''),
)

// Historical-looking sample values deliberately fluctuate: this is neither an
// APY claim nor a projection. Fine bars use the supplied Earn illustration width.
const sampleHistory = [
  46, 49, 45, 53, 50, 56, 54, 51, 59, 63, 58, 62, 68, 65, 61, 66, 71, 68, 64, 70, 74, 69, 67,
]
const chart = Array.from({ length: 80 }, (_, index) => {
  const position = (index / 79) * (sampleHistory.length - 1)
  const start = Math.floor(position)
  const fraction = position - start
  const height =
    sampleHistory[start] * (1 - fraction) +
    sampleHistory[Math.min(start + 1, sampleHistory.length - 1)] * fraction
  return box(80 + index * 4, 232 - height, 2.52, height, 1, ink.lavender)
}).join('')

const earn = scene(
  {
    title: 'An earning position',
    description:
      'Illustrative Earn position: 1,200 vault shares valued at 1,250 OUSD. A fluctuating historical value chart illustrates position tracking, not a yield forecast.',
  },
  [
    box(40, 40, 400, 280, 32, ink.subtle),
    text(80, 80, 'Position value', { size: 16, fill: ink.secondary }),
    text(400, 80, 'Illustrative', { size: 12, fill: ink.secondary, anchor: 'end' }),
    text(80, 127, '1,250.00 OUSD', { size: 32, tracking: -0.32 }),
    chart,
    text(80, 253, '30 days ago', { size: 12, fill: ink.secondary }),
    text(400, 253, 'Today', { size: 12, fill: ink.secondary, anchor: 'end' }),
    fade('earn-share-divider', 80, 268, 400, 268, ink.divider),
    path('M80 268H400', 'url(#earn-share-divider)'),
    text(80, 296, 'Share balance', { size: 14, fill: ink.secondary }),
    text(400, 296, '1,200 shares', { size: 16, anchor: 'end' }),
  ].join(''),
)

export const interfaceScenes = {
  accounts,
  earn,
}
