// Compact documentation compositions using the supplied Tempo illustration tokens.
export const ink = {
  black: 'var(--tempo-art-ink, #000000)',
  secondary: 'var(--tempo-art-secondary, #707070)',
  white: 'var(--tempo-art-paper, #FFFFFF)',
  subtle: 'var(--tempo-art-surface, #F5F5F5)',
  divider: 'var(--tempo-art-divider, #EBEBEB)',
  line: 'var(--tempo-art-line, #C4C4C4)',
  strong: 'var(--tempo-art-strong, #939393)',
  border: 'var(--tempo-art-border, #D6D6D6)',
  faint: 'var(--tempo-art-faint, #E1E1E1)',
  lavender: '#B9A3FF',
}

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

// Figma smoothing=1, including the corner budget clamp; supplied Linework recipe.
export function squircle(x, y, w, h, radius) {
  const rad = (degrees) => (degrees * Math.PI) / 180
  const n = (value) => +value.toFixed(3)
  const budget = Math.min(w, h) / 2
  const R = Math.min(radius, budget)
  if (R <= 0) return `M${x} ${y}h${w}v${h}h${-w}Z`
  const s = Math.max(0, Math.min(1, budget / R - 1))
  const p = Math.min((1 + s) * R, budget)
  const am = 90 * (1 - s)
  const arc = Math.sin(rad(am / 2)) * R * Math.SQRT2
  const p34 = R * Math.tan(rad((90 - am) / 4))
  const c = p34 * Math.cos(rad(45 * s))
  const d = c * Math.tan(rad(45 * s))
  const b = (p - arc - c - d) / 3
  const a = 2 * b
  const A = (dx, dy) => (arc > 0.0001 ? `a${n(R)} ${n(R)} 0 0 1 ${n(dx)} ${n(dy)}` : '')
  return [
    `M${n(x + w - p)} ${n(y)}`,
    `c${n(a)} 0 ${n(a + b)} 0 ${n(a + b + c)} ${n(d)}`,
    A(arc, arc),
    `c${n(d)} ${n(c)} ${n(d)} ${n(b + c)} ${n(d)} ${n(a + b + c)}`,
    `L${n(x + w)} ${n(y + h - p)}`,
    `c0 ${n(a)} 0 ${n(a + b)} ${n(-d)} ${n(a + b + c)}`,
    A(-arc, arc),
    `c${n(-c)} ${n(d)} ${n(-(b + c))} ${n(d)} ${n(-(a + b + c))} ${n(d)}`,
    `L${n(x + p)} ${n(y + h)}`,
    `c${n(-a)} 0 ${n(-(a + b))} 0 ${n(-(a + b + c))} ${n(-d)}`,
    A(-arc, -arc),
    `c${n(-d)} ${n(-c)} ${n(-d)} ${n(-(b + c))} ${n(-d)} ${n(-(a + b + c))}`,
    `L${n(x)} ${n(y + p)}`,
    `c0 ${n(-a)} 0 ${n(-(a + b))} ${n(d)} ${n(-(a + b + c))}`,
    A(arc, -arc),
    `c${n(c)} ${n(-d)} ${n(b + c)} ${n(-d)} ${n(a + b + c)} ${n(-d)}Z`,
  ].join(' ')
}

export function box(x, y, w, h, r = 12, fill = ink.white, stroke = 'none') {
  return `<path d="${squircle(x, y, w, h, r)}" fill="${fill}" stroke="${stroke}" stroke-width="1" vector-effect="non-scaling-stroke"/>`
}

export function path(d, color = ink.line, width = 1) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" vector-effect="non-scaling-stroke"/>`
}

export function line(x1, y1, x2, y2, color = ink.line) {
  return path(`M${x1} ${y1}L${x2} ${y2}`, color)
}

export function text(
  x,
  y,
  value,
  { size = 14, fill = ink.black, anchor = 'start', tracking = 0, mono = false } = {},
) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${mono ? 'JetBrains Mono' : 'Pilat'}" font-size="${size}" font-weight="400" text-anchor="${anchor}" letter-spacing="${tracking}">${escapeXml(value)}</text>`
}

export function label(x, y, value, options = {}) {
  return text(x, y, value.toUpperCase(), {
    size: 13.3,
    tracking: 0.266,
    fill: ink.secondary,
    ...options,
  })
}

export function pill(x, y, w, h, value, { fill = ink.black, color = ink.white, size = 13.3 } = {}) {
  return (
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>` +
    text(x + w / 2, y + h / 2 + size * 0.34, value, { size, fill: color, anchor: 'middle' })
  )
}

export function node(x, y, size = 8, fill = ink.black, stroke = 'none') {
  return box(x - size / 2, y - size / 2, size, size, size / 4, fill, stroke)
}

export function fade(id, x1, y1, x2, y2, color = ink.line, ends = 'both') {
  return `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${color}" stop-opacity="${ends === 'end' ? 1 : 0}"/><stop offset=".2" stop-color="${color}"/><stop offset=".8" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="${ends === 'start' ? 1 : 0}"/></linearGradient></defs>`
}

export function scene({ title, description, system = 'interface' }, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 480 360" role="img" data-illustration="${system}" aria-labelledby="title description"><title id="title">${escapeXml(title)}</title><desc id="description">${escapeXml(description)}</desc>${body}</svg>\n`
}
