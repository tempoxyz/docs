import { describe, expect, it } from 'vitest'
import { partitionByCost } from '../../scripts/playwright-shard-reporter'

describe('CI shard scheduling', () => {
  it('balances expensive tests without dropping or duplicating any tests', () => {
    const cases = [1, 1, 1, 1, 1, 9, 8, 7].map((cost, id) => ({ id, cost }))
    const partitions = partitionByCost(cases, 3, (item) => item.cost)
    expect(
      partitions
        .flat()
        .map((item) => item.id)
        .sort(),
    ).toEqual(cases.map((item) => item.id))
    expect(partitions.map((part) => part.reduce((total, item) => total + item.cost, 0))).toEqual([
      10, 10, 9,
    ])
    expect(cases.map((item) => item.cost)).toEqual([1, 1, 1, 1, 1, 9, 8, 7])
  })

  it('includes zero-cost skipped tests exactly once and is deterministic', () => {
    const cases = [0, 1, 2, 3]
    expect(partitionByCost(cases, 3, () => 0)).toEqual([[0, 3], [1], [2]])
    expect(partitionByCost(cases, 3, () => 1)).toEqual([[0, 3], [1], [2]])
  })

  it('rejects invalid shard counts', () => {
    for (const count of [0, -1, 1.5, Number.NaN])
      expect(() => partitionByCost([1], count, () => 1)).toThrow('Shard count must be positive')
  })
})
