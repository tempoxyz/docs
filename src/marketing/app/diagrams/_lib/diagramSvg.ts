// Pure builders for the house diagram style. The playground previews and exports
// come from the same string, so the preview matches the downloaded SVG.

export type DiagramStyle = {
  background: string
  boxFill: string
  boxStroke: string
  gridline: string
  baseline: string
  accentStroke: string
  accentFill: string
  textPrimary: number
  textSecondary: number
  textLabel: number
  textMuted: number
  titleSize: number
  subtitleSize: number
  labelSize: number
  letterSpacing: number
  strokeWidth: number
  cornerRadius: number
}

export const DEFAULT_STYLE: DiagramStyle = {
  background: '#0e0e0e',
  boxFill: '#1c1c1c',
  boxStroke: '#2e2e2e',
  gridline: '#181818',
  baseline: '#2e2e2e',
  accentStroke: '#57B88A',
  accentFill: '#143810',
  textPrimary: 0.85,
  textSecondary: 0.4,
  textLabel: 0.6,
  textMuted: 0.35,
  titleSize: 13,
  subtitleSize: 11,
  labelSize: 11,
  letterSpacing: 0.04,
  strokeWidth: 1,
  cornerRadius: 0,
}

export type BarChartData = {
  title: string
  subtitle: string
  values: number[]
  labels: string[]
  accentIndex: number
}

const FONT = "ui-monospace, 'JetBrains Mono', monospace"

function escapeXml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function white(opacity: number): string {
  return `rgba(255,255,255,${opacity})`
}

function titleBlock(s: DiagramStyle, title: string, subtitle: string): string {
  return [
    `  <text x="40" y="44" font-size="${s.titleSize}" letter-spacing="${s.letterSpacing}em" fill="${white(s.textPrimary)}">${escapeXml(title.toUpperCase())}</text>`,
    `  <text x="40" y="64" font-size="${s.subtitleSize}" fill="${white(s.textSecondary)}">${escapeXml(subtitle.toUpperCase())}</text>`,
  ].join('\n')
}

function formatTick(value: number): string {
  return value >= 950 ? `${Math.round(value / 1000)}K` : String(Math.round(value))
}

export function buildBarChartSvg(s: DiagramStyle, data: BarChartData): string {
  const W = 840
  const H = 420
  const left = 40
  const right = 800
  const baseY = 360
  const span = 254

  const values = data.values.length ? data.values : [1]
  const n = values.length
  const maxVal = Math.max(...values, 1)
  const barW = Math.min(96, Math.floor((right - 120 - (n - 1) * 24) / n))
  const gap = n > 1 ? (right - 120 - n * barW) / (n - 1) : 0

  const gridlines = [1, 2, 3, 4]
    .map((k) => {
      const y = baseY - k * 60
      const tick = formatTick((k * 60 * maxVal) / span)
      return [
        `  <line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="${s.gridline}"/>`,
        `  <text x="${left}" y="${y - 7}" font-size="10" fill="${white(0.3)}">${tick}</text>`,
      ].join('\n')
    })
    .join('\n')

  const bars = values
    .map((value, i) => {
      const h = (value / maxVal) * span
      const x = 120 + i * (barW + gap)
      const y = baseY - h
      const cx = x + barW / 2
      const accent = i === data.accentIndex
      const label = escapeXml(data.labels[i] ?? '')
      const fill = accent ? s.accentFill : s.boxFill
      const stroke = accent ? s.accentStroke : s.boxStroke
      const valueFill = accent ? s.accentStroke : white(0.45)
      const labelFill = accent ? white(0.7) : white(s.textSecondary)
      return [
        `  <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${h.toFixed(1)}" rx="${s.cornerRadius}" fill="${fill}" stroke="${stroke}" stroke-width="${s.strokeWidth}"/>`,
        `  <text x="${cx.toFixed(1)}" y="${(y - 12).toFixed(1)}" font-size="${s.labelSize}" fill="${valueFill}" text-anchor="middle">${value.toLocaleString('en-US')}</text>`,
        `  <text x="${cx.toFixed(1)}" y="382" font-size="${s.labelSize}" fill="${labelFill}" text-anchor="middle">${label}</text>`,
      ].join('\n')
    })
    .join('\n')

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}">
  <rect width="${W}" height="${H}" fill="${s.background}"/>
${titleBlock(s, data.title, data.subtitle)}
${gridlines}
  <line x1="${left}" y1="${baseY}" x2="${right}" y2="${baseY}" stroke="${s.baseline}"/>
${bars}
</svg>
`
}

export function buildLaneDiagramSvg(s: DiagramStyle): string {
  const W = 840
  const H = 260
  const rows = [0, 1, 2]
  const boxH = 32
  const boxW = 110

  const lanes = rows
    .map((i) => {
      const boxY = 96 + i * 44
      const textY = boxY + 21
      return [
        `  <text x="40" y="${textY}" font-size="${s.labelSize}" fill="${white(s.textMuted)}">LANE ${i}</text>`,
        `  <rect x="120" y="${boxY}" width="${boxW}" height="${boxH}" rx="${s.cornerRadius}" fill="${s.boxFill}" stroke="${s.boxStroke}" stroke-width="${s.strokeWidth}"/>`,
        `  <text x="${120 + boxW / 2}" y="${textY}" font-size="${s.labelSize}" fill="${white(s.textLabel)}" text-anchor="middle">tx ${i + 1}</text>`,
        `  <rect x="246" y="${boxY}" width="${boxW}" height="${boxH}" rx="${s.cornerRadius}" fill="${s.accentFill}" stroke="${s.accentStroke}" stroke-width="${s.strokeWidth}"/>`,
        `  <text x="${246 + boxW / 2}" y="${textY}" font-size="${s.labelSize}" fill="${s.accentStroke}" text-anchor="middle">tx ${i + 4}</text>`,
      ].join('\n')
    })
    .join('\n')

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" font-family="${FONT}">
  <rect width="${W}" height="${H}" fill="${s.background}"/>
${titleBlock(s, 'Box / lane diagram', 'Neutral boxes, accent boxes & a dashed conceptual region')}
${lanes}
  <rect x="372" y="96" width="428" height="120" rx="${s.cornerRadius}" fill="none" stroke="${s.boxStroke}" stroke-width="${s.strokeWidth}" stroke-dasharray="4 4"/>
  <text x="586" y="161" font-size="${s.labelSize}" fill="${white(s.textMuted)}" text-anchor="middle">RECLAIMED BLOCKSPACE</text>
</svg>
`
}
