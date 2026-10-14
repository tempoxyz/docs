import { describe, expect, it } from 'vitest'
import {
  addAccessKey,
  configuredSigners,
  loadPreset,
  removeSigner,
  runGuidedAction,
  setSignerWeight,
  setThreshold,
} from './account-sandbox'
import { diffAccounts } from './account-sandbox-diff'

describe('diffAccounts', () => {
  it('reports no changes for the same state', () => {
    const account = loadPreset('multi-factor')
    expect(diffAccounts(account, account).summary).toEqual([])
  })

  it('marks an added passkey and the new config version at the same address', () => {
    const before = loadPreset('add-signers')
    const after = runGuidedAction(before, 'add-passkey')
    const diff = diffAccounts(before, after)
    const added = Object.values(diff.signers).filter((item) => item.change === 'added')
    expect(added).toHaveLength(1)
    expect(diff.version).toEqual({ from: before.version, to: after.version })
    expect(after.address).toBe(before.address)
    expect(diff.summary.some((line) => line.text.includes('same address'))).toBe(true)
  })

  it('marks weight, threshold, and removal changes', () => {
    const before = loadPreset('team-treasury')
    const [first, second] = configuredSigners(before)
    let after = setSignerWeight(before, first.id, 2)
    after = setThreshold(after, 3)
    after = removeSigner(after, second.id)
    const diff = diffAccounts(before, after)
    expect(diff.signers[first.id]).toEqual({ change: 'weight', from: 1 })
    expect(diff.signers[second.id]).toEqual({ change: 'removed' })
    expect(diff.threshold).toEqual({ from: before.threshold, to: 3 })
  })

  it('marks a lost signer without a config change', () => {
    const before = loadPreset('recover')
    const after = runGuidedAction(before, 'lose-passkey')
    const diff = diffAccounts(before, after)
    expect(Object.values(diff.signers).map((item) => item.change)).toEqual(['lost'])
    expect(diff.version).toBeUndefined()
  })

  it('marks a new access key', () => {
    const before = loadPreset('portable-sign-in')
    const after = addAccessKey(before, 'macbook')
    const diff = diffAccounts(before, after)
    expect(Object.values(diff.keys).map((item) => item.change)).toEqual(['added'])
  })
})
