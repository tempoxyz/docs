import { readFile } from 'node:fs/promises'
import { describe, expect, test } from 'vitest'
import { goldenCases, renderGolden } from '../../scripts/render-og-goldens'

describe('OG image goldens', () => {
  test('static docs card matches the shared renderer', async () => {
    const expected = await readFile(new URL('../../public/og-docs.png', import.meta.url))
    expect(await renderGolden(goldenCases[0])).toEqual(expected)
  })
  test.each(goldenCases)('$name', async (testCase) => {
    const expected = await readFile(new URL(`./og-goldens/${testCase.name}.png`, import.meta.url))
    expect(await renderGolden(testCase)).toEqual(expected)
  })
})
