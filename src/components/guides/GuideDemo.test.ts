import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  addSigner,
  applyAction,
  configuredSigners,
  isCreated,
  loadPreset,
  remainingLimit,
  type SandboxAccount,
  type Signer,
  setThreshold,
} from './account-sandbox'
import type { DevnetCallOptions } from './account-sandbox-devnet'
import {
  asOneUpdate,
  consume,
  type DemoState,
  type GuideContext,
  type GuideId,
  guideDemoIds,
  guideScripts,
  missingNeed,
  recoveryCheck,
  type StepOutcome,
  scriptStart,
} from './guide-demo-scripts'

const pages: Record<GuideId, string> = {
  'add-signers': 'guides/self-custody',
  'multi-factor': 'guides/self-custody',
  'rotate-keys': 'guides/company-treasury',
  recover: 'guides/self-custody',
  export: 'guides/self-custody',
  'backend-automation': 'guides/automate-backend',
  'team-accounts': 'guides/company-treasury',
}

/** The `###` headings in the first `:::::steps` block after a guide's `<GuideDemo>` embed. */
function stepHeadings(guide: GuideId) {
  const page = readFileSync(
    new URL(`../../pages/docs/accounts/${pages[guide]}.mdx`, import.meta.url),
    'utf8',
  )
  const embed = page.indexOf(`<GuideDemo guide="${guide}" />`)
  if (embed === -1) throw new Error(`${pages[guide]}.mdx doesn't embed the ${guide} demo.`)
  const start = page.indexOf(':::::steps', embed)
  const block = page.slice(start, page.indexOf('\n:::::', start + 10))
  return [...block.matchAll(/^### (.+)$/gm)].map((match) => match[1].replaceAll("'", '’').trim())
}

// ---------------------------------------------------------------------------
// A test double for devnet: the engine's own edits, with made-up addresses and hashes. It checks
// that steps hand the adapter the keys they made earlier.

type Fake = GuideContext & {
  /** Signers and access keys that used a key made in an earlier step. */
  preparedUses: string[]
}

function fakeContext(): Fake {
  let serial = 0
  const next = (width: number) => `0x${(++serial).toString(16).padStart(width, '0')}`
  const signerAddresses = new Map<string, string>()
  const accounts = new Map<string, SandboxAccount>()
  const registered = new Set<string>()
  const preparedUses: string[] = []

  function addressFor(signer: Signer, options: DevnetCallOptions | undefined) {
    const known = signerAddresses.get(signer.id)
    if (known) return known
    const prepared = options?.prepared?.signer?.(signer)
    let address = prepared?.address ?? next(40)
    if (prepared) preparedUses.push(`${signer.kind}:${signer.name}`)
    if (signer.privateKey) address = `0x${signer.privateKey.slice(-40)}`
    signerAddresses.set(signer.id, address)
    return address
  }

  const knownKeys = new Set<string>()
  function noteKeys(account: SandboxAccount, options: DevnetCallOptions | undefined) {
    for (const key of account.accessKeys) {
      if (knownKeys.has(key.id)) continue
      knownKeys.add(key.id)
      if (options?.prepared?.accessKey?.(key)) preparedUses.push(`${key.kind}:${key.name}`)
    }
  }

  function record(account: SandboxAccount) {
    if (account.address) accounts.set(account.address, account)
    return account
  }

  return {
    preparedUses,
    adapter: {
      async sync(previous, nextAccount, options) {
        for (const signer of configuredSigners(nextAccount)) addressFor(signer, options)
        noteKeys(nextAccount, options)
        // Like devnet, creating the account sends nothing: the address comes from v0.
        if (!isCreated(previous)) {
          const address = next(40)
          return { account: record({ ...nextAccount, address, balance: 0, devnet: {} }) }
        }
        if (previous.balance <= 0) throw new Error('Get test funds first.')
        registered.add(previous.address)
        return {
          account: record({ ...nextAccount, address: previous.address, devnet: {} }),
          hash: next(64),
        }
      },
      async fund(account) {
        return { account: record({ ...account, balance: account.balance + 1_000 }), hash: next(64) }
      },
      async submit(account, request, options) {
        noteKeys(account, options)
        const { account: paid, result } = applyAction(account, request)
        if (account.address) registered.add(account.address)
        return {
          account: record(paid),
          result: result.ok ? { ...result, hash: next(64) } : result,
        }
      },
      async inspect(address) {
        const account = accounts.get(address)
        if (!account) return undefined
        return {
          address: address as `0x${string}`,
          config: {
            owners: account.committed.owners.map(({ id, weight }) => ({
              owner: (signerAddresses.get(id) ?? '0x0') as `0x${string}`,
              weight,
            })),
            salt: `0x${'0'.repeat(64)}`,
            threshold: account.committed.threshold,
            version: BigInt(account.version),
          },
          recipient: `0x${'ab'.repeat(20)}`,
          keys: account.accessKeys.map((key) => ({
            id: key.id,
            keyId: `0x${key.id.padStart(40, '0')}` as `0x${string}`,
            revoked: key.status === 'revoked',
            team: Boolean(key.delegate),
          })),
        }
      },
      async prepareSigner() {
        return { address: next(40) as `0x${string}` }
      },
      async prepareAccessKey() {
        return { address: next(40) as `0x${string}` }
      },
    },
    chain: {
      commitment: async (address) => (registered.has(address) ? 'committed' : null),
      configCommitment: () => 'committed',
      inferAddress: () => next(40),
      balance: async () => 995,
      remaining: async () => 950,
      generatePrivateKey: () => next(64),
      addressOf: (privateKey) => `0x${privateKey.slice(-40)}`,
    },
    options: {},
  }
}

async function run(guide: GuideId, choice?: string, ctx: Fake = fakeContext()) {
  const script = guideScripts[guide]
  const outcomes: StepOutcome[] = []
  let state: DemoState = scriptStart(guide, choice)
  const states = [state]
  for (const action of [...script.setup, ...script.steps]) {
    const outcome = await action.run(state, ctx)
    outcomes.push(outcome)
    state = outcome.state
    states.push(state)
  }
  return { ctx, outcomes, states, account: state.account }
}

/** Whether a step changed anything on Tempo. */
function changed(before: SandboxAccount, after: SandboxAccount) {
  return (
    before.address !== after.address ||
    before.version !== after.version ||
    before.balance !== after.balance ||
    JSON.stringify(before.accessKeys.map((key) => [key.id, key.status, key.spent])) !==
      JSON.stringify(after.accessKeys.map((key) => [key.id, key.status, key.spent]))
  )
}

const runs = guideDemoIds.flatMap((guide) =>
  (guideScripts[guide].choices?.map((choice) => choice.id) ?? ['']).map(
    (choice) => [guide, choice] as const,
  ),
)

// ---------------------------------------------------------------------------

describe('GuideDemo scripts', () => {
  it.each(guideDemoIds)('%s follows the guide’s step headings', (guide) => {
    expect(guideScripts[guide].steps.map((step) => step.title)).toEqual(stepHeadings(guide))
  })

  it('has no demo for logins or approval rules', () => {
    expect(guideDemoIds).not.toContain('approval-rules')
    expect(guideDemoIds).not.toContain('identity-provider')
    expect(guideDemoIds).not.toContain('change-email')
    const source = readFileSync(new URL('./guide-demo-scripts.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/[Ll]ogin|\b[Ss]ign[ -]in\b|OIDC|Privy|Google/)
  })

  it('names no made-up people and simulates nothing', () => {
    const source = readFileSync(new URL('./guide-demo-scripts.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(
      /Priya|\bSam\b|Lena|Diego|Northwind|\bAva\b|Noah|Harbor|Kite|Orbit|Acme|CFO|[Ss]imulat/,
    )
  })

  it.each(
    runs,
  )('%s (%s) runs every action and shows a hash for every change', async (guide, choice) => {
    const { outcomes, states } = await run(guide, choice || undefined)
    outcomes.forEach((outcome, index) => {
      expect(outcome.result).not.toBe('')
      expect(outcome.state.account.notice).toBeNull()
      const before = states[index].account
      expect(outcome.hashes.length > 0).toBe(changed(before, outcome.state.account))
    })
  })

  it('adds the passkey made in the first step, approved by the account’s first signer', async () => {
    for (const choice of ['private-key', 'device']) {
      const { account, ctx } = await run('add-signers', choice)
      expect(ctx.preparedUses).toEqual(['passkey:Passkey'])
      expect(configuredSigners(account).map((signer) => [signer.kind, signer.weight])).toEqual([
        [choice, 1],
        ['passkey', 1],
      ])
      expect(recoveryCheck(account).ok).toBe(true)
    }
  })

  it('turns on multi-factor in one update with the backup and recovery keys', async () => {
    const { states } = await run('multi-factor')
    const before = states[3].account
    const after = states[4].account
    expect(after.version).toBe(before.version + 1)
    expect(after.threshold).toBe(2)
    expect(
      configuredSigners(after).map((signer) => [signer.kind, signer.name, signer.weight]),
    ).toEqual([
      ['passkey', 'Passkey', 2],
      ['private-key', 'Backup key', 1],
      ['recovery-provider', 'Recovery key', 1],
    ])
    expect(recoveryCheck(after).ok).toBe(true)
  })

  it('rotates Approver key 2 for a new key and revokes the service key', async () => {
    const { account } = await run('rotate-keys')
    expect(configuredSigners(account).map((signer) => signer.name)).toEqual([
      'Approver key 1',
      'Approver key 3',
      'Approver key 4',
    ])
    expect(account.version).toBe(2)
    expect(account.accessKeys.find((key) => key.name === 'Service key')?.status).toBe('revoked')
  })

  it('recovers with the backup and recovery keys, replaces the lost passkey, and revokes the device key', async () => {
    const { account, ctx } = await run('recover')
    expect(configuredSigners(account).map((signer) => [signer.kind, signer.weight])).toEqual([
      ['private-key', 1],
      ['recovery-provider', 1],
      ['passkey', 2],
    ])
    const passkeys = configuredSigners(account).filter((signer) => signer.kind === 'passkey')
    expect(passkeys.map((signer) => [signer.weight, signer.lost])).toEqual([[2, false]])
    expect(ctx.preparedUses).toEqual(['passkey:New passkey'])
    expect(account.accessKeys.find((key) => key.name === 'This browser')?.status).toBe('revoked')
  })

  it('hands the account to the reader’s passkey after revoking the app’s key', async () => {
    const { account } = await run('export')
    expect(configuredSigners(account).map((signer) => signer.kind)).toEqual(['passkey'])
    expect(account.accessKeys.every((key) => key.status === 'revoked')).toBe(true)
  })

  it('authorizes the backend key with limits, pays with it, and revokes it', async () => {
    const { states, account } = await run('backend-automation')
    const authorized = states[3].account.accessKeys.find((key) => key.name === 'Backend key')
    expect(authorized).toMatchObject({
      kind: 'private-key',
      limit: 1_000,
      expiresInDays: 90,
      recipients: 'approved',
    })
    expect(account.accessKeys[0].status).toBe('revoked')
  })

  it('spends the team budget through the treasury with the prepared team account', async () => {
    const { account, ctx } = await run('team-accounts')
    const team = account.accessKeys.find((key) => key.name === 'Team account')
    expect(team && remainingLimit(team)).toBe(1_950)
    expect(team?.delegate?.members.map((member) => member.name)).toEqual([
      'Member 1',
      'Member 2',
      'Member 3',
    ])
    expect(ctx.preparedUses).toContain('account:Team account')
  })
})

describe('GuideDemo helpers', () => {
  it('sends several edits as one update', () => {
    const created = addSigner(loadPreset('from-scratch'), 'private-key', { privateKey: '0x01' })
    const twice = setThreshold(addSigner(addSigner(created, 'passkey'), 'passkey'), 2)
    expect(twice.version).toBe(3)
    const once = asOneUpdate(created, twice)
    expect(once.version).toBe(1)
    expect(configuredSigners(once).map((signer) => signer.addedIn)).toEqual([0, 1, 1])
  })

  it('finds signers whose loss locks the account', () => {
    const one = addSigner(loadPreset('from-scratch'), 'passkey')
    expect(recoveryCheck(one)).toMatchObject({ ok: false })
    const two = addSigner(one, 'private-key', { privateKey: '0x02' })
    expect(recoveryCheck(two)).toMatchObject({ ok: true })
  })

  it('drops held keys once a transaction uses them', () => {
    const before = addSigner(loadPreset('from-scratch'), 'private-key', { privateKey: '0x03' })
    const after = addSigner(before, 'passkey')
    const passkey = after.signers.at(-1) as Signer
    const held = consume(
      {
        signers: [
          { id: passkey.id, kind: 'passkey', key: { address: '0x01' } },
          { id: 'later', kind: 'passkey', key: { address: '0x02' } },
        ],
        accessKeys: [{ kind: 'browser', key: { address: '0x03' } }],
        privateKeys: {},
        notes: {},
      },
      before,
      after,
    )
    expect(held.signers.map((item) => item.id)).toEqual(['later'])
    expect(held.accessKeys).toHaveLength(1)
  })

  it('says what a demo is missing', () => {
    expect(missingNeed(['passkey'], new Set(['passkey']))).toBeNull()
    expect(missingNeed([], new Set())).toBeNull()
    expect(missingNeed(['passkey'], new Set())).toContain('Touch ID')
  })
})
