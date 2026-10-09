import { box, fade, ink, label, line, node, path, pill, scene, squircle } from './kit.mjs'

// Standard-scale Linework. These scenes leave the first 72 px quiet for
// adjoining copy; only a fading field can enter that band.
const group = (name, content) => `<g data-layer="${name}">${content}</g>`
const join = (parts) => parts.join('')
const outline = (x, y, color = ink.strong) => node(x, y, 8, ink.white, color)
const element = (x, y) => box(x - 16, y - 16, 32, 32, 8, ink.white, ink.strong)
const illustration = (title, description, body) =>
  scene({ title, description, system: 'linework' }, body)

// LNW-P2, Ledger rows: records on a fixed pitch, with one entry in focus.
// Keep the ledger abstract so it introduces Tempo without implying a balance,
// token, network, or payment result. The outer rows are a quiet continuation.
const ledgerRows = [108, 132, 156, 180, 204, 228, 252].map((y, row) => {
  const selected = y === 180
  const edge = row === 0 || row === 6
  const recordInk = selected ? ink.black : edge ? ink.faint : ink.border
  const trackInk = selected ? ink.black : edge ? ink.faint : ink.line
  const records = [152, 200, 248, 296, 344]
  const lead = `ledger-lead-${row}`
  return group(
    selected ? 'Selected ledger entry' : `Ledger row ${row + 1}`,
    join([
      fade(lead, 72, y, 146, y, trackInk, 'start'),
      line(72, y, 146, y, `url(#${lead})`),
      ...records.flatMap((x, index) => [
        node(x, y, 4, recordInk),
        line(x + 6, y, index === records.length - 1 ? 384 : x + 42, y, trackInk),
      ]),
      node(392, y, 8, selected ? ink.black : 'none', recordInk),
    ]),
  )
})

const getStarted = illustration(
  'Tempo ledger',
  'Stablecoin payments recorded on Tempo’s ledger.',
  group('Ledger', join(ledgerRows)),
)

// Reuse the shared 100%-smoothed corner, rather than a circular elbow.
// This turns right/down through a 32 x 32 corner budget with radius 16.
const downCorner = (x, y) =>
  squircle(x - 64, y, 64, 64, 16)
    .split(' L')[0]
    .replace(/^M[^c]+/, '')

const routes = illustration(
  'Routes funding paths',
  'Supported funding paths connect through the Routes API to a Tempo account.',
  join([
    group(
      'Field',
      join(
        [132, 180, 228].map(
          (y, index) =>
            fade(`routes-in-${index}`, 56, y, 116, y, ink.line, 'start') +
            line(56, y, 116, y, `url(#routes-in-${index})`),
        ),
      ),
    ),
    group(
      'Tracks',
      join([
        path('M132 132H164C212 132 212 172 266 172'),
        line(132, 180, 264, 180),
        path('M132 228H164C212 228 212 188 266 188'),
      ]),
    ),
    group(
      'Focal route',
      join([line(336, 180, 366, 180, ink.black), line(378, 180, 412, 180, ink.black)]),
    ),
    group(
      'Marks',
      join([
        outline(124, 132),
        outline(124, 180),
        outline(124, 228),
        pill(268, 168, 64, 24, '1 API'),
        node(372, 180, 4),
        node(420, 180),
      ]),
    ),
    group(
      'Labels',
      join([
        label(124, 100, 'Sources', { anchor: 'middle' }),
        label(420, 216, 'Account', { anchor: 'middle' }),
      ]),
    ),
  ]),
)

// The public field stops before the gate. No balance or deposit amount is
// obscured: this is an access boundary, not a claim about operator privacy.
const publicLedger = [108, 132, 228, 252].map((y, index) => {
  const id = `zones-public-${index}`
  return (
    fade(id, 56, y, 236, y, ink.border) +
    join([
      line(56, y, 118, y, `url(#${id})`),
      line(130, y, 166, y, `url(#${id})`),
      line(178, y, 214, y, `url(#${id})`),
      line(226, y, 236, y, `url(#${id})`),
      node(124, y, 4, ink.border),
      node(172, y, 4, ink.border),
      node(220, y, 4, ink.divider),
    ])
  )
})

const zones = illustration(
  'A controlled Zone boundary',
  'A public deposit enters a private Zone account through a controlled boundary; the Zone operator can view its ledger.',
  join([
    group('Field', join(publicLedger)),
    group(
      'Boundary',
      join([
        // A single enclosure with an opening for the gate. The open ends stop
        // 4 px above and below the gate rather than intersecting it.
        path(
          squircle(268, 104, 180, 152, 16)
            .replace('L268 136', 'L268 196 M268 164 L268 136')
            .replace(/Z$/, ' L416 104'),
        ),
      ]),
    ),
    group(
      'Tracks',
      join([
        fade('zones-deposit-in', 64, 180, 116, 180, ink.line, 'start'),
        line(64, 180, 116, 180, 'url(#zones-deposit-in)'),
        line(132, 180, 252, 180),
      ]),
    ),
    group(
      'Focal route',
      join([line(284, 180, 310, 180, ink.black), line(322, 180, 364, 180, ink.black)]),
    ),
    group(
      'Marks',
      join([
        outline(124, 180),
        box(256, 168, 24, 24, 6, ink.black),
        node(316, 180, 4),
        element(384, 180),
        node(384, 180),
      ]),
    ),
    group(
      'Labels',
      join([
        label(164, 80, 'Public', { anchor: 'middle' }),
        label(356, 80, 'Zone', { anchor: 'middle' }),
      ]),
    ),
  ]),
)

const machinePayments = illustration(
  'A paid service request',
  'An agent pays for a service through a machine payment on Tempo.',
  join([
    group(
      'Base',
      join([
        fade('machine-base-in', 136, 284, 364, 284, ink.line, 'start'),
        line(136, 284, 364, 284, 'url(#machine-base-in)'),
        line(380, 284, 388, 284),
        line(404, 284, 412, 284),
        fade('machine-base-out', 428, 284, 468, 284, ink.line, 'end'),
        line(428, 284, 468, 284, 'url(#machine-base-out)'),
        fade('machine-base-lane', 296, 308, 456, 308, ink.divider),
        line(296, 308, 456, 308, 'url(#machine-base-lane)'),
      ]),
    ),
    group(
      'Tracks',
      join([
        path('M128 172C176 172 196 132 244 132'),
        path('M128 188C176 188 196 228 244 228'),
        path(`M260 132H388${downCorner(420, 132)}V276`),
        path(`M260 228H340${downCorner(372, 228)}V276`),
      ]),
    ),
    group(
      'Focal route',
      join([
        line(128, 180, 174, 180, ink.black),
        line(186, 180, 244, 180, ink.black),
        path(`M260 180H364${downCorner(396, 180)}V234`, ink.black),
        line(396, 246, 396, 276, ink.black),
      ]),
    ),
    group(
      'Marks',
      join([
        element(108, 180),
        node(108, 180),
        outline(252, 132),
        node(252, 180),
        outline(252, 228),
        outline(372, 284),
        node(396, 284),
        outline(420, 284),
        node(180, 180, 4),
        node(396, 240, 4),
      ]),
    ),
    group(
      'Labels',
      join([
        label(108, 140, 'Request', { anchor: 'middle' }),
        label(252, 100, 'Service', { anchor: 'middle' }),
      ]),
    ),
  ]),
)

// Independent providers remain unconnected. The field yields around one
// chosen connection; its other nodes do not imply a common API or route.
const providerField = []
for (let row = 0; row < 7; row += 1) {
  for (let column = 0; column < 9; column += 1) {
    const x = 56 + column * 48
    const y = 36 + row * 48
    const selected = x === 200 && y === 132
    const nearRoute =
      (y === 132 && x > 200 && x <= 296) ||
      (y === 180 && x >= 296 && x <= 344) ||
      (y === 228 && x >= 296)
    if (selected || nearRoute) continue
    const edge = Math.min(column, 8 - column, row, 6 - row)
    const opacity = edge === 0 ? 0.18 : edge === 1 ? 0.45 : 0.8
    providerField.push(`<g opacity="${opacity}">${outline(x, y, ink.border)}</g>`)
  }
}

const partners = illustration(
  'Choose an infrastructure provider',
  'Connect your application to the independent provider that fits its needs.',
  join([
    group('Provider field', join(providerField)),
    group(
      'Focal route',
      join([
        line(208, 132, 242, 132, ink.black),
        path(
          'M254 132H280' +
            downCorner(312, 132) +
            'V196C312 211.085 312 218.628 316.686 223.314C321.372 228 328.915 228 344 228H354',
          ink.black,
        ),
        line(366, 228, 384, 228, ink.black),
      ]),
    ),
    group(
      'Marks',
      join([node(200, 132), node(248, 132, 4), node(360, 228, 4), pill(388, 216, 56, 24, 'APP')]),
    ),
  ]),
)

// An execution layer between incoming calls and recorded state. Abstract marks
// avoid implying a particular validator topology, fee, or throughput guarantee.
const tempoEvm = illustration(
  'Tempo EVM execution',
  'Transaction calls pass through Tempo EVM and become entries in the ledger.',
  join([
    group('Connections', join([132, 180, 228].map((y) => join([
      fade(`evm-input-${y}`, 56, y, 112, y, ink.line, 'start'),
      line(56, y, 112, y, `url(#evm-input-${y})`),
      line(128, y, 180, y, y === 180 ? ink.black : ink.line),
      line(316, y, 368, y, y === 180 ? ink.black : ink.line),
      line(388, y, 440, y, ink.faint),
    ])))),
    group('Execution', join([
      box(180, 100, 136, 160, 24, ink.white, ink.strong),
      box(192, 112, 112, 136, 16, ink.white, ink.faint),
      path('M232 154L218 168L232 182M264 154L278 168L264 182M253 148L243 188', ink.black, 1.5),
      label(248, 220, 'Tempo EVM', { anchor: 'middle', fill: ink.black, size: 14 }),
      ...[212, 248, 284].flatMap((x) => [line(x, 88, x, 100), line(x, 260, x, 272)]),
    ])),
    group('Calls and ledger entries', join([132, 180, 228].flatMap((y) => [
      node(120, y, 12, y === 180 ? ink.black : ink.white, y === 180 ? ink.black : ink.strong),
      node(378, y, 16, y === 180 ? ink.black : ink.white, y === 180 ? ink.black : ink.border),
    ]))),
  ]),
)

export const lineworkScenes = {
  'get-started': getStarted,
  'tempo-evm': tempoEvm,
  routes,
  zones,
  'machine-payments': machinePayments,
  partners,
}
