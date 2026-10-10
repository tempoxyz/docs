import { readFile } from 'node:fs/promises'
import { describe, expect, test } from 'vitest'
import { goldenCases, goldenResponse, renderGolden } from '../../scripts/render-og-goldens'

describe('OG image goldens', () => {
  test('static docs card matches the shared renderer', async () => {
    const expected = await readFile(new URL('../../public/og-docs.png', import.meta.url))
    expect(await renderGolden(goldenCases[0])).toEqual(expected)
  })
  test.each(goldenCases)('$name', async (testCase) => {
    const response = await goldenResponse(testCase)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
    const actual = Buffer.from(await response.arrayBuffer())
    // PNG signature and IHDR dimensions validate the crawler-facing format.
    expect(actual.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    expect(actual.readUInt32BE(16)).toBe(1200)
    expect(actual.readUInt32BE(20)).toBe(657)
    const expected = await readFile(new URL(`./og-goldens/${testCase.name}.png`, import.meta.url))
    expect(actual).toEqual(expected)
  })
})
