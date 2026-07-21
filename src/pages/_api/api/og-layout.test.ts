import { describe, expect, test } from 'vitest'
import { layoutTitle } from './og-layout'

describe('layoutTitle', () => {
  test.each([
    ['Tempo', ['Tempo'], 105],
    ['Fast finality', ['Fast finality'], 105],
    ['Introducing stable-bench-v1', ['Introducing', 'stable-bench-v1'], 105],
    [
      'Build programmable global payments on Tempo',
      ['Build programmable', 'global payments', 'on Tempo'],
      91,
    ],
  ])('lays out %j', (title, lines, fontSize) => {
    expect(layoutTitle(title)).toEqual({ lines, fontSize })
  })

  test('normalizes repeated whitespace', () => {
    expect(layoutTitle('  Introducing   stable-bench-v1  ').lines).toEqual([
      'Introducing',
      'stable-bench-v1',
    ])
  })

  test('reduces the font size for a long unbreakable title', () => {
    const result = layoutTitle('Supercalifragilisticexpialidocious')
    expect(result.lines).toEqual(['Supercalifragilisticexpialidocious'])
    expect(result.fontSize).toBe(48)
  })
})
