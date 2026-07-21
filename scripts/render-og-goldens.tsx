import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { ImageResponse } from '@takumi-rs/image-response'
// biome-ignore lint/correctness/noUnusedImports: tsx uses the classic JSX runtime for this script
import React from 'react'
import { OgImage } from '../src/pages/_api/api/og-image'

export const goldenCases = [
  { name: 'short-title', title: 'Tempo', section: 'BUILD', subsection: '' },
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

export async function renderGolden(testCase: (typeof goldenCases)[number]): Promise<Buffer> {
  const [hbSetFont, pilatFont, background] = await Promise.all([
    asset('fonts/HBSet-Light.otf'),
    asset('fonts/Pilat-Regular.otf'),
    asset('og-bg.png'),
  ])
  const backgroundUrl = `data:image/png;base64,${Buffer.from(background).toString('base64')}`
  const response = new ImageResponse(
    <OgImage
      title={testCase.title}
      section={testCase.section}
      subsection={testCase.subsection}
      backgroundUrl={backgroundUrl}
    />,
    {
      width: 1200,
      height: 657,
      format: 'png',
      fonts: [
        { name: 'HBSet', data: hbSetFont, weight: 300, style: 'normal' },
        { name: 'Pilat', data: pilatFont, weight: 400, style: 'normal' },
      ],
    },
  )
  return Buffer.from(await response.arrayBuffer())
}

async function main() {
  const check = process.argv.includes('--check')
  let changed = false

  for (const testCase of goldenCases) {
    const output = await renderGolden(testCase)
    const path = new URL(`${testCase.name}.png`, outputDir)

    if (check) {
      const expected = await readFile(path)
      if (!output.equals(expected)) {
        changed = true
        console.error(`${testCase.name}.png differs; run pnpm og:goldens to update it`)
      }
    } else {
      await writeFile(path, output)
      console.log(`updated ${fileURLToPath(path)}`)
    }
  }

  if (changed) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
