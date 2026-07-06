import { describe, expect, it } from 'vitest'
import { OG_IMAGE_VERSION, ogLandingPaths, ogSectionMap, ogSubsectionMap } from './og-sections'

// vocs.config.ts's `ogImageUrl` is serialized to source and re-evaluated at
// runtime, so it cannot import the maps in og-sections.ts — it carries an
// inline copy instead. This suite fails when the two drift, in either
// direction: behaviorally (every og-sections entry must be honored) and by
// parsing the serialized function source (no extra inline entries).
//
// The config is imported with a computed specifier so the type-checker does
// not pull vocs.config.ts (which belongs to no tsconfig project and has its
// own looser typing) into the strict app program; vitest resolves it fine.
const vocsConfig = (await import(`${'../../vocs.config'}`)).default

const ogImageUrl = vocsConfig.ogImageUrl as (path: string, options?: { baseUrl?: string }) => string

function param(url: string, name: string) {
  return new URL(url, 'http://x').searchParams.get(name)
}

// Extracts `key: 'VALUE'` / `"key": "VALUE"` pairs from an inline object
// literal in the function source — the exact code that gets serialized.
// Quote style depends on the transpiler, so accept either.
function parseInlineMap(source: string, name: string): Record<string, string> {
  const match = source.match(new RegExp(`const ${name}[^{]*\\{([^}]*)\\}`))
  expect(match, `inline ${name} in vocs.config.ts ogImageUrl`).toBeTruthy()
  const map: Record<string, string> = {}
  for (const [, key, value] of (match as RegExpMatchArray)[1].matchAll(
    /["']?([\w-]+)["']?\s*:\s*["']([^"']*)["']/g,
  )) {
    map[key] = value
  }
  return map
}

describe('vocs.config ogImageUrl stays in sync with src/lib/og-sections', () => {
  const source = ogImageUrl.toString()

  it('has identical section maps (both directions)', () => {
    expect(parseInlineMap(source, 'sectionMap')).toEqual(ogSectionMap)
  })

  it('has identical subsection maps (both directions)', () => {
    expect(parseInlineMap(source, 'subsectionMap')).toEqual(ogSubsectionMap)
  })

  it('has identical landing paths', () => {
    const match = source.match(/const landingPaths\s*=\s*\[([^\]]*)\]/)
    expect(match).toBeTruthy()
    const paths = [...(match as RegExpMatchArray)[1].matchAll(/["']([^"']*)["']/g)].map((m) => m[1])
    expect(paths).toEqual(ogLandingPaths)
  })

  it('uses the static landing image for landing paths', () => {
    for (const path of ogLandingPaths) {
      const docsPath = path === '/' ? '/docs' : `/docs${path}`
      expect(ogImageUrl(docsPath), `landing ${path}`).toBe('/og-docs.png')
    }
  })

  it.each(Object.entries(ogSectionMap))('maps section %s -> %s', (segment, label) => {
    const url = ogImageUrl(`/${segment}/some-page`)
    expect(param(url, 'section')).toBe(label)
  })

  it.each(Object.entries(ogSubsectionMap))('maps subsection %s -> %s', (segment, label) => {
    const url = ogImageUrl(`/guide/${segment}/some-page`)
    expect(param(url, 'subsection')).toBe(label)
  })

  it('uses the shared OG_IMAGE_VERSION cache-buster', () => {
    // /api/og responses are cached immutable for a year, so the version in the
    // serialized config must match the one blog JSON-LD URLs use (seo.ts).
    expect(param(ogImageUrl('/guide/payments/send-a-payment'), 'v')).toBe(OG_IMAGE_VERSION)
  })

  it('omits the unused description param', () => {
    expect(ogImageUrl('/guide/payments/send-a-payment')).not.toContain('description')
  })
})
