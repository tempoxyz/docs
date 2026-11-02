import { box, fade, ink, label, line, node, path, pill, scene, text } from './kit.mjs'

// Earn guide figures, reframed from the tempo.xyz/earn compositions at
// documentation scale. Strategy names are categories, not provider listings;
// amounts are illustrative and make no APY or fee promise.
const group = (name, content) => `<g data-layer="${name}">${content}</g>`
const join = (parts) => parts.join('')
const shift = (dx, dy, content) => `<g transform="translate(${dx} ${dy})">${content}</g>`
const outline = (x, y, color = ink.strong) => node(x, y, 8, ink.white, color)
const element = (x, y) => box(x - 16, y - 16, 32, 32, 8, ink.white, ink.strong)
const linework = (title, description, size, body) =>
  scene({ title, description, system: 'linework', ...size }, body)

// Label baselines sit 5 px below a mark's centre line.
const beside = (x, y, value, options) => label(x, y + 5, value, options)

// Fig 4 ("Design your Tempo Earn program"), reframed as the vault model: an
// account deposits into a vault and receives shares; the vault's engine connects
// to one strategy. Unselected strategies are alternatives, not an allocation.
const flow = linework(
  'Earn vault flow',
  'An account deposits stablecoins into a vault and receives vault shares. The vault’s engine connects it to one strategy, such as U.S. Treasuries, institutional credit, or collateralized lending.',
  { width: 720, height: 168 },
  // Drawn on a 720 x 240 grid, then cropped to its marks and centred.
  shift(
    -14,
    -44,
    join([
      group(
        'Tracks',
        join([
          path(
            'M256 132V144C256 152.837 248.837 160 240 160H112C103.163 160 96 152.837 96 144V136',
          ),
          outline(176, 160, ink.line),
          path('M408 120H432C472 120 472 72 512 72H528'),
          path('M408 120H432C472 120 472 168 512 168H528'),
        ]),
      ),
      group(
        'Focal route',
        join([
          line(116, 120, 158, 120, ink.black),
          line(170, 120, 212, 120, ink.black),
          line(296, 120, 328, 120, ink.black),
          line(340, 120, 372, 120, ink.black),
          line(408, 120, 528, 120, ink.black),
        ]),
      ),
      group(
        'Marks',
        join([
          element(96, 120),
          node(96, 120),
          node(164, 120, 4),
          pill(216, 108, 80, 24, 'VAULT'),
          node(334, 120, 4),
          element(392, 120),
          node(392, 120),
          outline(536, 72),
          node(536, 120),
          outline(536, 168),
        ]),
      ),
      group(
        'Labels',
        join([
          label(96, 80, 'Account', { anchor: 'middle' }),
          label(164, 104, 'Deposit', { anchor: 'middle' }),
          label(176, 188, 'Shares', { anchor: 'middle' }),
          label(392, 80, 'Engine', { anchor: 'middle' }),
          beside(552, 72, 'U.S. Treasuries'),
          beside(552, 120, 'Credit', { fill: ink.black }),
          beside(552, 168, 'Lending'),
        ]),
      ),
    ]),
  ),
)

const tile = { width: 320, height: 200 }

// Fig 3, U.S. Treasuries: maturities converge on one tokenized product.
const tenors = [
  [52, '1M'],
  [88, '3M'],
  [124, '6M'],
  [160, '1Y'],
  [196, '5Y'],
  [232, '10Y'],
  [268, '30Y'],
]
const treasuries = linework(
  'U.S. Treasuries',
  'Treasury maturities converge on one tokenized product.',
  tile,
  join([
    group(
      'Tracks',
      join(tenors.filter(([x]) => x !== 160).map(([x]) => path(`M${x} 72C${x} 88 160 80 160 100`))),
    ),
    group(
      'Focal route',
      join([line(160, 72, 160, 100, ink.black), line(160, 124, 160, 152, ink.black)]),
    ),
    group(
      'Marks',
      join([
        ...tenors.map(([x]) => node(x, 68, 4, x === 160 ? ink.black : ink.border)),
        pill(120, 100, 80, 24, '1 TOKEN'),
        node(160, 156),
      ]),
    ),
    group(
      'Labels',
      join(
        tenors.map(([x, value]) =>
          label(x, 56, value, { anchor: 'middle', fill: x === 160 ? ink.black : ink.secondary }),
        ),
      ),
    ),
  ]),
)

// Fig 3, institutional credit: real-world loans pool into a credit fund.
const credit = linework(
  'Institutional credit',
  'Real-world loans, such as real estate, invoices, and GPU financing, pool into a credit fund.',
  tile,
  shift(
    4,
    0,
    join([
      group(
        'Tracks',
        join([
          path('M116 64H128C150 64 150 100 172 100'),
          path('M116 136H128C150 136 150 100 172 100'),
        ]),
      ),
      group(
        'Focal route',
        join([line(116, 100, 172, 100, ink.black), line(284, 100, 300, 100, ink.black)]),
      ),
      group(
        'Marks',
        join([
          outline(112, 64),
          node(112, 100),
          outline(112, 136),
          pill(172, 88, 112, 24, 'CREDIT FUND'),
          node(308, 100),
        ]),
      ),
      group(
        'Labels',
        join([
          beside(100, 64, 'Real estate', { anchor: 'end' }),
          beside(100, 100, 'Invoices', { anchor: 'end', fill: ink.black }),
          beside(100, 136, 'GPUs', { anchor: 'end' }),
        ]),
      ),
    ]),
  ),
)

// Fig 3, collateralized lending: a collateral pool backs stablecoin loans.
const collateral = [48, 68, 88, 108].flatMap((x) =>
  [84, 100, 116].map((y) => node(x, y, 4, ink.border)),
)
const lending = linework(
  'Collateralized lending',
  'A pool of collateral backs stablecoin loans to borrowers.',
  tile,
  join([
    group('Pool', join([box(28, 64, 96, 72, 12, ink.white, ink.strong), ...collateral])),
    group(
      'Focal route',
      join([line(128, 100, 152, 100, ink.black), line(220, 100, 252, 100, ink.black)]),
    ),
    group('Marks', join([pill(156, 88, 64, 24, 'USDC'), node(260, 100)])),
    group(
      'Labels',
      join([
        label(76, 52, 'Collateral', { anchor: 'middle' }),
        label(260, 132, 'Borrower', { anchor: 'middle' }),
      ]),
    ),
  ]),
)

// "Configurable rewards and pricing" as a still Interface panel: one fee split
// of illustrative returns, matching the guide's 20% fixed-fee example. Cropped
// to the panel, since it sits inline in a guide rather than beside overview copy.
const revenueShare = scene(
  {
    width: 400,
    height: 280,
    title: 'Share returns',
    description:
      'Illustrative split of $100.00 in returns: 20%, or $20.00, to your business as a fee recipient and 80%, or $80.00, to your customers.',
  },
  shift(
    -40,
    -40,
    [
      box(40, 40, 400, 280, 32, ink.subtle),
      text(80, 80, 'Share returns', { size: 16, fill: ink.secondary }),
      text(400, 80, 'Illustrative', { size: 12, fill: ink.secondary, anchor: 'end' }),
      text(80, 118, 'Returns to distribute', { size: 14, fill: ink.secondary }),
      text(400, 118, '$100.00', { size: 16, anchor: 'end' }),
      fade('earn-revenue-divider', 80, 140, 400, 140, ink.divider),
      path('M80 140H400', 'url(#earn-revenue-divider)'),
      `<circle cx="84" cy="168" r="4" fill="${ink.black}"/>`,
      text(96, 172, 'Your business', { size: 12, fill: ink.secondary }),
      `<circle cx="306" cy="168" r="4" fill="${ink.line}"/>`,
      text(400, 172, 'Your customers', { size: 12, fill: ink.secondary, anchor: 'end' }),
      text(80, 216, '20%', { size: 32, tracking: -0.32 }),
      text(400, 216, '80%', { size: 32, tracking: -0.32, anchor: 'end' }),
      text(80, 242, '$20.00', { size: 14, fill: ink.secondary }),
      text(400, 242, '$80.00', { size: 14, fill: ink.secondary, anchor: 'end' }),
      box(80, 277, 320, 6, 3, ink.line),
      box(80, 277, 64, 6, 3, ink.black),
      `<circle cx="144" cy="280" r="9" fill="${ink.white}" stroke="${ink.black}" stroke-width="2"/>`,
    ].join(''),
  ),
)

export const earnScenes = {
  flow,
  'strategy-treasuries': treasuries,
  'strategy-credit': credit,
  'strategy-lending': lending,
  'revenue-share': revenueShare,
}
