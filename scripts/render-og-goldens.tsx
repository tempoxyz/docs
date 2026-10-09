import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createOgResponse } from '../src/pages/_api/api/og-response'

export const goldenCases = [
  { name: 'docs-home', title: 'Documentation', section: 'DEVELOPERS', subsection: '' },
  { name: 'supported-routes', title: 'Supported routes', section: 'ROUTES', subsection: '' },
  { name: 'no-section', title: 'Tempo', section: '', subsection: '' },
  {
    name: 'machine-payments',
    title: 'Machine Payments',
    section: 'MACHINE PAYMENTS',
    subsection: '',
  },
  { name: 'short-title', title: 'Tempo', section: 'BUILD', subsection: '' },
  { name: 'blog-index-title', title: 'BLOG', section: 'BLOG', subsection: '' },
  {
    name: 'two-line-title',
    title: 'Introducing stable-bench-v1',
    section: 'BLOG',
    subsection: '',
  },
  {
    name: 'three-line-title',
    title: 'Build programmable global payments on Tempo',
    section: 'BUILD',
    subsection: '',
  },
  {
    name: 'section-and-subsection',
    title: 'Sponsor user transaction fees',
    section: 'BUILD',
    subsection: 'PAYMENTS',
  },
  {
    name: 'unicode-title',
    title: 'Émoji & “smart quotes” — café',
    section: 'BLOG',
    subsection: '',
  },
  {
    name: 'long-unbreakable-title',
    title: 'Supercalifragilisticexpialidocious',
    section: 'API',
    subsection: '',
  },
] as const

const apiDir = new URL('../src/pages/_api/api/', import.meta.url)
const outputDir = new URL('../src/lib/og-goldens/', import.meta.url)

async function asset(path: string): Promise<ArrayBuffer> {
  const bytes = await readFile(new URL(path, apiDir))
  return new Uint8Array(bytes).buffer
}

export async function goldenResponse(testCase: (typeof goldenCases)[number]): Promise<Response> {
  const [hbSetFont, pilatFont, background, wasmModule] = await Promise.all([
    asset('fonts/HBSet-Light.otf'),
    asset('fonts/Pilat-Regular.otf'),
    asset('og-bg.png'),
    readFile(fileURLToPath(import.meta.resolve('@takumi-rs/wasm/takumi_wasm_bg.wasm'))).then(
      (bytes) => new Uint8Array(bytes).buffer,
    ),
  ])
  const query = new URLSearchParams({
    title: testCase.title,
    section: testCase.section,
    subsection: testCase.subsection,
  })
  return createOgResponse(new Request(`https://tempo.xyz/api/og?${query}`), {
    hbSetFont,
    pilatFont,
    background,
    wasmModule,
  })
}

export async function renderGolden(testCase: (typeof goldenCases)[number]): Promise<Buffer> {
  const response = await goldenResponse(testCase)
  if (!response.ok || response.headers.get('content-type') !== 'image/png') {
    throw new Error(`${testCase.name}: expected a successful PNG response`)
  }
  return Buffer.from(await response.arrayBuffer())
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export async function main() {
  const check = process.argv.includes('--check')
  const reportDir = new URL('../test-results/og-goldens/', import.meta.url)
  await mkdir(reportDir, { recursive: true })
  const cards: string[] = []
  let changed = false

  async function compare(name: string, output: Buffer, path: URL) {
    if (!check) await writeFile(path, output)
    // Missing fixtures are regressions too; still publish the actual image.
    const expected = await readFile(path).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return null
      throw error
    })
    const matches = expected !== null && output.equals(expected)
    if (!matches) {
      changed = true
      console.error(`${name}.png differs or is missing; run pnpm og:goldens to update it`)
    }
    await writeFile(new URL(`${name}-actual.png`, reportDir), output)
    if (expected) await writeFile(new URL(`${name}-expected.png`, reportDir), expected)
    cards.push(`<section><h2>${escapeHtml(name)} — ${matches ? 'matches' : 'CHANGED'}</h2>
<div class="pair"><figure><figcaption>Expected</figcaption>${expected ? `<img src="${name}-expected.png" alt="Expected ${name}">` : '<p>Missing fixture</p>'}</figure>
<figure><figcaption>Actual</figcaption><img src="${name}-actual.png" alt="Actual ${name}"></figure></div></section>`)
  }

  try {
    for (const testCase of goldenCases) {
      await compare(
        testCase.name,
        await renderGolden(testCase),
        new URL(`${testCase.name}.png`, outputDir),
      )
    }
    await compare(
      'static-docs-card',
      await renderGolden(goldenCases[0]),
      new URL('../public/og-docs.png', import.meta.url),
    )
  } finally {
    await writeFile(
      new URL('index.html', reportDir),
      `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tempo Docs OG image goldens</title>
<style>body{margin:32px;background:#f3f3f3;color:#010101;font:16px/1.5 Arial,sans-serif}main{max-width:1600px;margin:auto}h2{font-size:18px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}figure{margin:0}img{width:100%;height:auto}section{margin:32px 0}figcaption{margin-bottom:8px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style>
<main><h1>Tempo Docs OG image goldens</h1><p>Production WASM renderer. Review both images before updating a changed fixture.</p>${cards.join('\n')}</main></html>`,
    )
    console.log(`OG review gallery: ${fileURLToPath(new URL('index.html', reportDir))}`)
  }
  if (changed) process.exitCode = 1
}
