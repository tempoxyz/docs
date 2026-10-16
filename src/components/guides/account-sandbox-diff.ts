import {
  type AccessKey,
  formatUsd,
  remainingLimit,
  type SandboxAccount,
  type Signer,
} from './account-sandbox'

export type SignerChange = 'added' | 'removed' | 'lost' | 'found' | 'weight'
export type KeyChange = 'added' | 'revoked' | 'spent'

/** What changed between two states of the same account, for highlighting a demo step. */
export type AccountDiff = {
  signers: Record<string, { change: SignerChange; from?: number }>
  keys: Record<string, { change: KeyChange; from?: number }>
  threshold?: { from: number; to: number }
  version?: { from: number; to: number }
  balance?: { from: number; to: number }
  /** One line per change, in reading order. */
  summary: { tone: 'add' | 'remove' | 'change'; text: string }[]
}

function present(signer: Signer | undefined) {
  return Boolean(signer && !signer.revoked)
}

function keyActive(key: AccessKey | undefined) {
  return Boolean(key && key.status !== 'revoked')
}

export function diffAccounts(before: SandboxAccount, after: SandboxAccount): AccountDiff {
  const diff: AccountDiff = { signers: {}, keys: {}, summary: [] }
  const beforeSigners = new Map(before.signers.map((signer) => [signer.id, signer]))
  for (const signer of after.signers) {
    const previous = beforeSigners.get(signer.id)
    if (present(signer) && !present(previous)) {
      diff.signers[signer.id] = { change: 'added' }
      diff.summary.push({ tone: 'add', text: `${signer.name} added (W${signer.weight})` })
    } else if (!present(signer) && present(previous)) {
      diff.signers[signer.id] = { change: 'removed' }
      diff.summary.push({ tone: 'remove', text: `${signer.name} removed` })
    } else if (previous && present(signer)) {
      if (signer.lost && !previous.lost) {
        diff.signers[signer.id] = { change: 'lost' }
        diff.summary.push({ tone: 'remove', text: `${signer.name} lost` })
      } else if (!signer.lost && previous.lost) {
        diff.signers[signer.id] = { change: 'found' }
        diff.summary.push({ tone: 'add', text: `${signer.name} found` })
      } else if (signer.weight !== previous.weight) {
        diff.signers[signer.id] = { change: 'weight', from: previous.weight }
        diff.summary.push({
          tone: 'change',
          text: `${signer.name} weight ${previous.weight} → ${signer.weight}`,
        })
      }
    }
  }

  const beforeKeys = new Map(before.accessKeys.map((key) => [key.id, key]))
  for (const key of after.accessKeys) {
    const previous = beforeKeys.get(key.id)
    if (keyActive(key) && !keyActive(previous)) {
      diff.keys[key.id] = { change: 'added' }
      diff.summary.push({ tone: 'add', text: `${key.name} key added` })
    } else if (!keyActive(key) && keyActive(previous)) {
      diff.keys[key.id] = { change: 'revoked' }
      diff.summary.push({ tone: 'remove', text: `${key.name} key revoked` })
    } else if (previous && key.spent !== previous.spent) {
      diff.keys[key.id] = { change: 'spent', from: remainingLimit(previous) }
      diff.summary.push({
        tone: 'change',
        text: `${key.name}: $${formatUsd(remainingLimit(previous))} → $${formatUsd(remainingLimit(key))} left`,
      })
    }
  }

  if (after.threshold !== before.threshold) {
    diff.threshold = { from: before.threshold, to: after.threshold }
    diff.summary.push({
      tone: 'change',
      text: `Threshold ${before.threshold} → ${after.threshold}`,
    })
  }
  if (after.balance !== before.balance) {
    diff.balance = { from: before.balance, to: after.balance }
    diff.summary.push({
      tone: 'change',
      text: `Balance −$${formatUsd(before.balance - after.balance)}`,
    })
  }
  if (after.version !== before.version) {
    diff.version = { from: before.version, to: after.version }
    diff.summary.push({
      tone: 'change',
      text: `Config v${before.version} → v${after.version} · same address`,
    })
  }
  return diff
}
