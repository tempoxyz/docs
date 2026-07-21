import { readFile } from 'node:fs/promises'
import { describe, expect, test } from 'vitest'
import { goldenCases, renderGolden } from '../../scripts/render-og-goldens'

describe('OG image goldens', () => {
  test.each(goldenCases)('$name', async (testCase) => {
    const expected = await readFile(new URL(`./og-goldens/${testCase.name}.png`, import.meta.url))
    expect(await renderGolden(testCase)).toEqual(expected)
  })
})
