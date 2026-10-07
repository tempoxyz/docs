#!/usr/bin/env -S node --experimental-strip-types

import fs from 'node:fs/promises'

const output = process.argv[2]
if (!output) throw new Error('Expected an output file path')

const specUrl = new URL('https://api.tempo.xyz/openapi.json')
const spec = await fetchJson(specUrl)
if (!isObject(spec) || !isObject(spec.paths)) throw new Error('Invalid OpenAPI document')

for (const pathItem of Object.values(spec.paths)) {
  if (!isObject(pathItem)) continue
  for (const operation of Object.values(pathItem)) {
    if (!isObject(operation) || typeof operation['x-openrpc'] !== 'string') continue
    operation['x-openrpc'] = await fetchJson(new URL(operation['x-openrpc'], specUrl))
  }
}

await fs.writeFile(output, JSON.stringify(spec))

async function fetchJson(url: URL) {
  let failure: unknown
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) })
      if (!response.ok) throw new Error(`${url} returned ${response.status}`)
      return (await response.json()) as unknown
    } catch (error) {
      failure = error
      if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, attempt * 1_000))
    }
  }
  throw failure
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
