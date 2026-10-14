import { describe, expect, it, vi } from 'vitest'
import {
  type AccessKey,
  type ActionRequest,
  type ApprovalRules,
  addAccessKey,
  addSigner,
  analyzeAccount,
  applyAction,
  approvalSets,
  changeLogin,
  configuredSigners,
  createLegacyAccount,
  deriveAddress,
  describeApprovalSets,
  evaluateAction,
  guidedActions,
  isCreated,
  isLogin,
  loadPreset,
  moveToTempoWallet,
  presets,
  removeSigner,
  requiredWeight,
  revokeAccessKey,
  rotateSigner,
  runGuidedAction,
  type SandboxAccount,
  type Signer,
  type SignerKind,
  setApprovalRules,
  setRuleWeight,
  setSignerLost,
  setSignerWeight,
  setThreshold,
  shortAddress,
  signerKinds,
  signerStatus,
  simulatedAdapter,
  upgradeLegacyAccount,
  validateConfig,
} from './account-sandbox'

const rulesOff: ApprovalRules = {
  enabled: false,
  paymentLimit: 5_000,
  paymentWeight: 2,
  adminWeight: 2,
}

function signer(id: string, kind: SignerKind, weight: number, name?: string): Signer {
  return {
    id,
    kind,
    name: name ?? signerKinds[kind].label,
    detail: '',
    weight,
    holder: signerKinds[kind].holder,
    lost: false,
    revoked: false,
    addedIn: 0,
  }
}

function withSigners(threshold: number, signers: Signer[]): SandboxAccount {
  const account = loadPreset('portable-sign-in')
  return {
    ...account,
    threshold,
    signers,
    committed: {
      threshold,
      owners: signers.map(({ id, weight }) => ({ id, weight })),
      rules: account.rules,
    },
  }
}

function bySigners(
  account: SandboxAccount,
  ids: string[],
  action: ActionRequest['action'] = { type: 'payment', amount: 50 },
) {
  return evaluateAction(account, { action, approver: { type: 'signers', signerIds: ids } })
}

function byKey(
  account: SandboxAccount,
  keyId: string,
  action: ActionRequest['action'] = { type: 'payment', amount: 50 },
  recipient: ActionRequest['recipient'] = 'approved',
  memberIds?: string[],
) {
  return evaluateAction(account, {
    action,
    approver: { type: 'access-key', keyId, memberIds },
    recipient,
  })
}

function ids(sets: Signer[][]) {
  return sets.map((set) => set.map((item) => item.id))
}

const send6000 = { type: 'payment', amount: 6_000 } as const

describe('configuration limits', () => {
  const check = (threshold: number, owners: Signer[], rules = rulesOff) =>
    validateConfig({ threshold, owners, rules }).map((issue) => issue.code)

  it('requires 1 to 48 owners', () => {
    expect(check(1, [])).toEqual(['no-owners'])
    const many = Array.from({ length: 49 }, (_, index) => signer(`k${index}`, 'device', 1))
    expect(check(1, many)).toEqual(['too-many-owners'])
    expect(check(1, many.slice(0, 48))).toEqual([])
  })

  it('bounds weights, total weight, and the threshold', () => {
    expect(check(1, [signer('a', 'device', 0)])).toEqual(['weight-range'])
    expect(check(1, [signer('a', 'device', 256)])).toEqual(['weight-range'])
    expect(check(1, [signer('a', 'device', 200), signer('b', 'device', 56)])).toEqual([
      'total-weight',
    ])
    expect(check(255, [signer('a', 'device', 200), signer('b', 'device', 55)])).toEqual([])
    expect(check(0, [signer('a', 'device', 1)])).toEqual(['threshold-range'])
    expect(check(256, [signer('a', 'device', 255)])).toEqual(['threshold-range'])
  })

  it('rejects a threshold above the total weight', () => {
    expect(
      validateConfig({
        threshold: 3,
        owners: [signer('a', 'device', 1), signer('b', 'device', 1)],
        rules: rulesOff,
      }),
    ).toEqual([
      { code: 'unreachable', tier: 'base', message: 'Threshold 3 is above total weight 2.' },
    ])
  })

  it('requires the threshold to be reachable with eight signatures', () => {
    const nine = Array.from({ length: 9 }, (_, index) => signer(`k${index}`, 'device', 1))
    expect(check(9, nine)).toEqual(['signature-limit'])
    expect(check(8, nine)).toEqual([])
    // Weights and thresholds may exceed eight when eight signatures still reach them.
    expect(check(20, [signer('a', 'device', 10), signer('b', 'device', 10)])).toEqual([])
  })

  it('rejects logins that reach the threshold only three or more at a time (TIP-1131)', () => {
    const logins = [signer('g', 'google', 1), signer('v', 'privy', 1), signer('a', 'apple', 1)]
    expect(validateConfig({ threshold: 3, owners: logins, rules: rulesOff })).toEqual([
      {
        code: 'login-limit',
        tier: 'base',
        message:
          'Viem rejects configurations that need three or more logins to reach the threshold.',
      },
    ])
    expect(check(2, logins)).toEqual([])
    // A passkey path doesn't make the unusable three-login path acceptable.
    expect(check(3, [signer('p', 'passkey', 2), ...logins])).toEqual(['login-limit'])
  })

  it('rejects configurations whose every path needs three or more logins', () => {
    const owners = [
      signer('p', 'passkey', 1),
      signer('g', 'google', 1),
      signer('v', 'privy', 1),
      signer('a', 'apple', 1),
    ]
    expect(check(4, owners)).toEqual(['no-usable-path'])
  })

  it('checks approval-rule weights against the threshold and the same limits (TIP-1135)', () => {
    const owners = [signer('a', 'device', 1), signer('b', 'device', 1), signer('c', 'device', 1)]
    const rules = { ...rulesOff, enabled: true, paymentWeight: 2, adminWeight: 3 }
    expect(check(2, owners, rules)).toEqual(['rule-order'])
    expect(check(1, owners, rules)).toEqual([])
    expect(check(1, owners, { ...rules, adminWeight: 1 })).toEqual(['rule-order'])
    expect(check(1, owners, { ...rules, adminWeight: 4 })).toEqual(['unreachable'])
  })
})

describe('approval sets', () => {
  it('lists minimal sets, smallest first', () => {
    const sets = approvalSets(configuredSigners(loadPreset('multi-factor')), 2)
    expect(ids(sets)).toEqual([['passkey'], ['google', 'privy']])
  })

  it('never includes a signer the set doesn’t need', () => {
    const owners = configuredSigners(loadPreset('change-login'))
    for (const weight of [1, 2, 3, 4, 5])
      for (const set of approvalSets(owners, weight)) {
        const total = set.reduce((sum, item) => sum + item.weight, 0)
        expect(total).toBeGreaterThanOrEqual(weight)
        for (const item of set) expect(total - item.weight).toBeLessThan(weight)
      }
  })

  it('never uses more than two logins or eight signatures', () => {
    const owners = [
      ...Array.from({ length: 4 }, (_, index) => signer(`l${index}`, 'google', 1)),
      ...Array.from({ length: 8 }, (_, index) => signer(`k${index}`, 'device', 1)),
    ]
    const sets = approvalSets(owners, 8)
    expect(sets.length).toBeGreaterThan(0)
    for (const set of sets) {
      expect(set.filter((item) => item.kind === 'google').length).toBeLessThanOrEqual(2)
      expect(set.length).toBeLessThanOrEqual(8)
    }
    expect(approvalSets(owners, 11)).toEqual([])
  })

  it.each([
    ['portable-sign-in', 'Threshold 1: the Google login'],
    ['multi-factor', 'Threshold 2: the passkey, or Google and Privy together'],
    ['change-login', 'Threshold 2: the passkey, or Google and Privy together'],
    ['export', 'Threshold 1: Harbor’s signer'],
    ['team-treasury', 'Threshold 2: any 2 of Finance key, Operations key, and CFO passkey'],
    ['approval-rules', 'Threshold 1: the Finance key, the Operations key, or the CFO passkey'],
    [
      'team-account',
      'Threshold 4: any 4 of Finance key, Operations key, CFO passkey, CEO passkey, and Controller key',
    ],
    ['backend-automation', 'Threshold 2: the passkey, or Google and recovery provider together'],
  ] as const)('summarizes the %s preset', (preset, summary) => {
    expect(analyzeAccount(loadPreset(preset)).summary).toBe(summary)
  })

  it('summarizes escalated weights', () => {
    const owners = configuredSigners(loadPreset('multi-factor'))
    expect(describeApprovalSets(approvalSets(owners, 3), owners)).toBe(
      'the passkey plus Google or Privy',
    )
    expect(describeApprovalSets(approvalSets(owners, 4), owners)).toBe('all 3 signers together')
  })

  it('caps the summary at three alternatives', () => {
    const owners = ['A', 'B', 'C', 'D'].map((name) => signer(name, 'hardware', 1, `${name} key`))
    expect(describeApprovalSets(approvalSets(owners, 1), owners)).toBe(
      'any one of A key, B key, C key, or D key',
    )
    const mixed = [
      ...owners.slice(0, 3).map((item) => ({ ...item, weight: 3 })),
      signer('D', 'hardware', 2, 'D key'),
      signer('E', 'hardware', 2, 'E key'),
    ]
    expect(describeApprovalSets(approvalSets(mixed, 3), mixed)).toBe(
      'the A key, the B key, the C key, or 1 other combination',
    )
  })
})

describe('stable address', () => {
  it('derives the address from the version-zero configuration', () => {
    const maya = loadPreset('portable-sign-in')
    expect(maya.address).toMatch(/^0x[0-9a-f]{40}$/)
    for (const preset of ['add-signers', 'multi-factor', 'change-login', 'recover'] as const)
      expect(loadPreset(preset).address).toBe(maya.address)
    expect(loadPreset('team-treasury').address).toBe(loadPreset('approval-rules').address)
    expect(loadPreset('export').address).not.toBe(maya.address)
    expect(deriveAddress('maya', { threshold: 1, owners: [{ id: 'google', weight: 1 }] })).toBe(
      maya.address,
    )
    expect(shortAddress(String(maya.address))).toMatch(/^0x[0-9A-F]{4}…[0-9A-F]{4}$/)
  })

  it('never changes the address when signers change', () => {
    const start = loadPreset('multi-factor')
    let account = addSigner(start, 'apple')
    account = changeLogin(account)
    account = setThreshold(account, 3)
    account = removeSigner(account, 'privy')
    expect(account.address).toBe(start.address)
    const harbor = loadPreset('export')
    expect(moveToTempoWallet(harbor).address).toBe(harbor.address)
  })
})

describe('configuration updates', () => {
  it('increments the version and logs each applied update', () => {
    const account = addSigner(loadPreset('multi-factor'), 'apple')
    expect(account.version).toBe(3)
    expect(account.log[0]).toMatchObject({
      kind: 'config',
      title: 'Config v3 · Added Apple login (W1)',
      detail: 'By the passkey · same address and balance',
    })
    const added = account.signers.at(-1) as Signer
    expect(signerStatus(account, added)).toBe('added')
    expect(signerStatus(setSignerWeight(account, 'privy', 2), added)).toBe('active')
  })

  it('changes an email in one update and keeps access keys', () => {
    const start = applyAction(loadPreset('change-login'), {
      action: { type: 'payment', amount: 50 },
      approver: { type: 'access-key', keyId: 'key-1' },
    }).account
    const account = runGuidedAction(start, 'change-login')
    expect(account.version).toBe(start.version + 1)
    expect(account.log[0].title).toBe(
      'Config v3 · Added Google login (maya@work.example, W1), revoked Google login (maya@example.com)',
    )
    const emails = account.signers.filter((item) => item.kind === 'google')
    expect(emails.map((item) => [item.subject, item.revoked])).toEqual([
      ['maya@example.com', true],
      ['maya@work.example', false],
    ])
    expect(account.accessKeys).toEqual(start.accessKeys)
    expect(account.balance).toBe(start.balance)
  })

  it('moves an account to Tempo Wallet in one update with the same balance', () => {
    const start = loadPreset('export')
    expect(analyzeAccount(start).notices.map((notice) => notice.id)).toEqual([
      'provider-alone',
      'no-backup',
    ])
    expect(guidedActions(start)).toEqual([
      { id: 'move-to-tempo-wallet', label: 'Move to Tempo Wallet' },
    ])
    const account = runGuidedAction(start, 'move-to-tempo-wallet')
    expect(account.version).toBe(1)
    expect(account.log[0].title).toBe(
      'Config v1 · Added Tempo Wallet signer (W1), revoked Harbor’s signer',
    )
    expect(account.log[0].detail).toBe('By Harbor’s signer · same address and balance')
    expect(account.balance).toBe(3_600)
    expect(configuredSigners(account).map((item) => item.name)).toEqual(['Tempo Wallet signer'])
    const health = analyzeAccount(account)
    expect(health.summary).toBe('Threshold 1: the Tempo Wallet signer')
    expect(health.notices.map((notice) => notice.id)).toEqual(['no-backup'])
    expect(guidedActions(account)).toEqual([])
  })

  it('leaves an invalid update unapplied until the configuration is valid', () => {
    const start = loadPreset('portable-sign-in')
    const draft = setThreshold(start, 2)
    expect(draft.version).toBe(0)
    expect(draft.log).toEqual(start.log)
    expect(analyzeAccount(draft)).toMatchObject({ valid: false, summary: 'Not applied' })
    expect(bySigners(draft, ['google'])).toMatchObject({
      ok: false,
      code: 'invalid-config',
      message: 'Fix the configuration first.',
    })
    const applied = addSigner(draft, 'passkey')
    expect(applied.version).toBe(1)
    expect(applied.log[0].title).toBe('Config v1 · Added Passkey (W1), threshold 1 → 2')
  })

  it('applies an add and a revoke together after an empty draft', () => {
    const draft = removeSigner(loadPreset('export'), 'harbor')
    expect(draft.version).toBe(0)
    expect(analyzeAccount(draft).issues[0].message).toBe('Add at least one signer.')
    const account = addSigner(draft, 'passkey')
    expect(account.version).toBe(1)
    expect(account.log[0].title).toBe('Config v1 · Added Passkey (W1), revoked Harbor’s signer')
  })

  it('drops a signer that was never applied', () => {
    const draft = addSigner(setThreshold(loadPreset('portable-sign-in'), 3), 'passkey')
    const id = (draft.signers.at(-1) as Signer).id
    expect(draft.version).toBe(0)
    expect(removeSigner(draft, id).signers.map((item) => item.id)).toEqual(['google'])
  })

  it('blocks updates when lost signers leave no approval path', () => {
    const lost = setSignerLost(loadPreset('portable-sign-in'), 'google', true)
    expect(lost.log[0]).toMatchObject({ title: 'Google login lost', detail: 'Config unchanged' })
    const blocked = addSigner(lost, 'passkey')
    expect(blocked.version).toBe(0)
    expect(configuredSigners(blocked)).toHaveLength(1)
    expect(blocked.notice).toBe('Locked out: no usable signers reach weight 1.')
    expect(addAccessKey(lost, 'macbook').accessKeys).toHaveLength(1)
    expect(revokeAccessKey(lost, 'key-1').accessKeys[0].status).toBe('active')
  })

  it('records approval-rule changes as policy revisions', () => {
    const account = setApprovalRules(loadPreset('multi-factor'), true)
    expect(account.rules).toEqual({
      enabled: true,
      paymentLimit: 5_000,
      paymentWeight: 3,
      adminWeight: 4,
    })
    expect(account.version).toBe(2)
    expect(account.rulesRevision).toBe(1)
    expect(account.log[0].title).toBe('Rules r1 · on · over $5,000 W3 · changes W4')
    expect(setRuleWeight(account, 'adminWeight', 3).log[0].title).toBe(
      'Rules r2 · over $5,000 W3 · changes W3',
    )
    expect(setApprovalRules(account, false).log[0].title).toBe('Rules r2 · off')
  })

  it('rejects a rotation that makes a rule weight unreachable', () => {
    const draft = removeSigner(loadPreset('approval-rules'), 'cfo')
    expect(draft.version).toBe(1)
    expect(analyzeAccount(draft).issues.map((issue) => issue.message)).toEqual([
      'Change weight 3 is above total weight 2.',
    ])
  })

  it('logs access-key authorization and revocation without a config version', () => {
    let account = addAccessKey(loadPreset('portable-sign-in'), 'macbook')
    expect(account.version).toBe(0)
    expect(account.log[0]).toMatchObject({ kind: 'key', title: 'Authorized MacBook' })
    account = revokeAccessKey(account, 'key-1')
    expect(account.accessKeys.map((key) => key.status)).toEqual(['revoked', 'active'])
    expect(account.log[0].title).toBe('Revoked This iPhone')
  })
})

describe('guided actions', () => {
  it('adds a passkey to a single-login account', () => {
    const start = loadPreset('add-signers')
    expect(guidedActions(start)).toEqual([{ id: 'add-passkey', label: 'Add a passkey' }])
    const account = runGuidedAction(start, 'add-passkey')
    expect(account.log[0].title).toBe('Config v1 · Added Passkey (W2)')
    expect(analyzeAccount(account).summary).toBe('Threshold 1: the passkey, or the Google login')
    expect(guidedActions(account)).toEqual([])
  })

  it('rotates the operations key and keeps the payout key', () => {
    const start = loadPreset('rotate-keys')
    const account = runGuidedAction(start, 'rotate-operations')
    expect(account.version).toBe(1)
    expect(account.log[0]).toMatchObject({
      title:
        'Config v1 · Added Operations key (serial 8802, W1), revoked Operations key (serial 4471)',
      detail: 'By the Finance key and the Operations key · same address and balance',
    })
    expect(account.accessKeys).toEqual(start.accessKeys)
    expect(guidedActions(account)).toEqual([
      { id: 'rotate-operations', label: 'Rotate the operations key' },
    ])
  })

  it('loses and replaces the passkey with the remaining logins', () => {
    const start = loadPreset('recover')
    expect(guidedActions(start).map((action) => action.id)).toEqual(['lose-passkey'])
    const lost = runGuidedAction(start, 'lose-passkey')
    expect(analyzeAccount(lost).notices[0].message).toBe(
      'Recoverable: Google and Privy together can replace the lost signer.',
    )
    expect(guidedActions(lost).map((action) => action.id)).toEqual(['replace-passkey'])
    const replaced = runGuidedAction(lost, 'replace-passkey')
    expect(replaced.log[0]).toMatchObject({
      title: 'Config v3 · Added Passkey (new iPhone, W2), revoked Passkey (this iPhone)',
      detail: 'By the Google login and the Privy login · same address and balance',
    })
    expect(replaced.address).toBe(start.address)
    expect(bySigners(replaced, [(replaced.signers.at(-1) as Signer).id])).toMatchObject({
      ok: true,
    })
  })

  it('rotates generic signers through the same update path', () => {
    const account = rotateSigner(loadPreset('multi-factor'), 'privy')
    expect(account.version).toBe(3)
    expect(configuredSigners(account).filter((item) => item.kind === 'privy')).toHaveLength(1)
  })
})

describe('signer approvals', () => {
  const multiFactor = loadPreset('multi-factor')

  it('needs the threshold', () => {
    expect(bySigners(multiFactor, ['google'])).toMatchObject({
      ok: false,
      code: 'insufficient-weight',
      message: 'Needs weight 2 · has 1',
      requiredWeight: 2,
      weight: 1,
    })
    expect(bySigners(multiFactor, ['google', 'privy'])).toMatchObject({
      ok: true,
      message: 'The Google login and the Privy login · weight 2 of 2',
    })
    expect(bySigners(multiFactor, ['passkey'])).toMatchObject({ ok: true })
  })

  it('leaves out signatures the threshold doesn’t need', () => {
    expect(bySigners(multiFactor, ['google', 'passkey'])).toMatchObject({
      ok: true,
      signerIds: ['passkey'],
    })
    expect(bySigners(loadPreset('change-login'), ['google', 'privy', 'passkey'])).toMatchObject({
      ok: true,
      signerIds: ['passkey'],
    })
  })

  it('carries at most two login signatures', () => {
    const account = withSigners(4, [
      signer('p', 'passkey', 2),
      signer('d', 'device', 1),
      signer('g', 'google', 1),
      signer('v', 'privy', 1),
      signer('a', 'apple', 1),
    ])
    expect(analyzeAccount(account).valid).toBe(true)
    expect(bySigners(account, ['d', 'g', 'v', 'a'])).toMatchObject({
      ok: false,
      code: 'login-limit',
      message: 'A transaction can carry at most two logins.',
    })
    expect(bySigners(account, ['p', 'd', 'g'])).toMatchObject({ ok: true })
  })

  it('carries at most eight signatures', () => {
    const keys = Array.from({ length: 9 }, (_, index) => signer(`k${index}`, 'device', 1))
    const account = withSigners(9, [signer('p', 'passkey', 8), ...keys])
    expect(analyzeAccount(account).valid).toBe(true)
    expect(
      bySigners(
        account,
        keys.map((key) => key.id),
      ),
    ).toMatchObject({
      ok: false,
      code: 'signature-limit',
      message: 'A transaction can carry at most eight signatures.',
    })
  })

  it('rejects lost signers', () => {
    const account = setSignerLost(multiFactor, 'passkey', true)
    expect(bySigners(account, ['passkey'])).toMatchObject({
      ok: false,
      code: 'lost-signer',
      message: 'Lost signers can’t approve.',
    })
    expect(bySigners(account, ['google', 'privy'])).toMatchObject({ ok: true })
  })

  it('reports a payment the balance can’t cover', () => {
    expect(bySigners(loadPreset('export'), ['harbor'], send6000)).toMatchObject({
      ok: false,
      code: 'insufficient-balance',
      message: 'Balance is $3,600.00.',
    })
  })

  it('reduces the balance and logs an approved payment', () => {
    const { account, result } = applyAction(multiFactor, {
      action: { type: 'payment', amount: 50 },
      approver: { type: 'signers', signerIds: ['passkey'] },
    })
    expect(result.ok).toBe(true)
    expect(account.balance).toBe(multiFactor.balance - 50)
    expect(account.log[0]).toMatchObject({ title: 'Sent $50', detail: 'By the passkey' })
  })

  it('checks a signer change without changing the configuration', () => {
    const { account, result } = applyAction(multiFactor, {
      action: { type: 'change-signers' },
      approver: { type: 'signers', signerIds: ['passkey'] },
    })
    expect(result.ok).toBe(true)
    expect(account.version).toBe(multiFactor.version)
    expect(account.log[0].title).toBe('Signer change approved')
  })
})

describe('approval rules', () => {
  const rules = loadPreset('approval-rules')

  it('escalates payments above the limit, not at it', () => {
    expect(requiredWeight(rules, { type: 'payment', amount: 5_000 }).weight).toBe(1)
    expect(requiredWeight(rules, { type: 'payment', amount: 5_000.01 }).weight).toBe(2)
    expect(bySigners(rules, ['finance'], { type: 'payment', amount: 5_000 })).toMatchObject({
      ok: true,
    })
    expect(bySigners(rules, ['finance'], send6000)).toMatchObject({
      ok: false,
      code: 'insufficient-weight',
      message: 'Over $5,000 needs weight 2 · has 1',
    })
    expect(bySigners(rules, ['finance', 'operations'], send6000)).toMatchObject({ ok: true })
  })

  it('needs the administrative weight for signer changes and new keys', () => {
    expect(bySigners(rules, ['finance', 'cfo'], { type: 'change-signers' })).toMatchObject({
      ok: false,
      message: 'Signer changes need weight 3 · has 2',
    })
    expect(bySigners(rules, ['finance', 'cfo'], { type: 'authorize-key' })).toMatchObject({
      ok: false,
      message: 'New keys need weight 3 · has 2',
    })
    expect(
      bySigners(rules, ['finance', 'operations', 'cfo'], { type: 'authorize-key' }),
    ).toMatchObject({ ok: true })
  })

  it('matches the weighted passkey and login example', () => {
    const account = setApprovalRules(loadPreset('multi-factor'), true)
    expect(bySigners(account, ['passkey'], send6000)).toMatchObject({
      ok: false,
      message: 'Over $5,000 needs weight 3 · has 2',
    })
    expect(bySigners(account, ['passkey', 'privy'], send6000)).toMatchObject({ ok: true })
    expect(bySigners(account, ['passkey', 'google'], { type: 'change-signers' })).toMatchObject({
      ok: false,
      message: 'Signer changes need weight 4 · has 3',
    })
  })

  it('stops access keys from spending while rules are on', () => {
    expect(byKey(rules, 'key-1')).toMatchObject({
      ok: false,
      code: 'rules-block-keys',
      message: 'Access keys can’t spend while approval rules are on.',
    })
    const off = setApprovalRules(rules, false)
    expect(off.log[0].title).toBe('Rules r2 · off')
    expect(byKey(off, 'key-1')).toMatchObject({ ok: true })
  })

  it('keeps access keys working while unapplied rules are invalid', () => {
    const draft = setApprovalRules(loadPreset('portable-sign-in'), true)
    expect(analyzeAccount(draft).issues[0].message).toBe(
      'Over-$5,000 weight 2 is above total weight 1.',
    )
    expect(draft.rulesRevision).toBe(0)
    expect(byKey(draft, 'key-1')).toMatchObject({ ok: true })
  })
})

describe('access keys', () => {
  const portable = loadPreset('portable-sign-in')

  it('spend within the period limit and reduce what remains', () => {
    const first = applyAction(portable, {
      action: { type: 'payment', amount: 50 },
      approver: { type: 'access-key', keyId: 'key-1' },
    })
    expect(first.result).toMatchObject({ ok: true, message: 'This iPhone · 450 USD left this day' })
    expect(first.account.accessKeys[0].spent).toBe(50)
    expect(first.account.log[0]).toMatchObject({
      title: 'Sent $50 · This iPhone',
      detail: '450 USD left this day',
    })
    expect(byKey(first.account, 'key-1', send6000)).toMatchObject({
      ok: false,
      code: 'key-limit',
      message: 'This iPhone can spend 500 USD a day; 450 USD remains.',
    })
  })

  it('never count toward the threshold or manage the account', () => {
    expect(byKey(portable, 'key-1', { type: 'change-signers' })).toMatchObject({
      ok: false,
      code: 'key-not-allowed',
      message: 'Access keys can’t change signers.',
    })
    expect(byKey(portable, 'key-1', { type: 'authorize-key' })).toMatchObject({
      ok: false,
      message: 'Access keys can’t authorize keys.',
    })
  })

  it('fail when revoked or expired', () => {
    expect(byKey(revokeAccessKey(portable, 'key-1'), 'key-1')).toMatchObject({
      ok: false,
      code: 'key-revoked',
    })
    const expired: SandboxAccount = {
      ...portable,
      accessKeys: portable.accessKeys.map((key): AccessKey => ({ ...key, status: 'expired' })),
    }
    expect(byKey(expired, 'key-1')).toMatchObject({ ok: false, code: 'key-expired' })
  })

  it('apply recipient restrictions', () => {
    const account = addAccessKey(portable, 'bill-pay')
    const key = account.accessKeys.at(-1) as AccessKey
    expect(byKey(account, key.id, undefined, 'new')).toMatchObject({
      ok: false,
      code: 'recipient-not-allowed',
      message: 'Bill-pay agent pays approved recipients only.',
    })
    expect(byKey(account, key.id, undefined, 'approved')).toMatchObject({ ok: true })
    expect(byKey(account, 'key-1', undefined, 'new')).toMatchObject({ ok: true })
    expect(byKey(loadPreset('backend-automation'), 'key-1', undefined, 'new')).toMatchObject({
      ok: false,
      message: 'Payout service pays approved recipients only.',
    })
  })

  it('need the team account’s own quorum when the key is a team account', () => {
    const account = loadPreset('team-account')
    expect(byKey(account, 'key-1', undefined, 'approved', ['ana'])).toMatchObject({
      ok: false,
      code: 'insufficient-weight',
      message: 'Marketing team needs weight 2 · has 1',
    })
    const paid = applyAction(account, {
      action: { type: 'payment', amount: 1_500 },
      approver: { type: 'access-key', keyId: 'key-1', memberIds: ['ana', 'ben'] },
    })
    expect(paid.result).toMatchObject({ ok: true })
    expect(byKey(paid.account, 'key-1', undefined, 'approved', ['ana', 'chloe'])).toMatchObject({
      ok: true,
      message: 'Marketing team · 450 USD left this day',
    })
    expect(
      byKey(paid.account, 'key-1', { type: 'payment', amount: 600 }, 'approved', ['ana', 'ben']),
    ).toMatchObject({
      ok: false,
      message: 'Marketing team can spend 2,000 USD a day; 500 USD remains.',
    })
  })
})

describe('start from scratch', () => {
  // Devnet's faucet funds a new account; these checks fund it directly.
  const pay = (account: SandboxAccount, signerIds: string[]) =>
    evaluateAction(isCreated(account) ? { ...account, balance: 100 } : account, {
      action: { type: 'payment', amount: 50 },
      approver: { type: 'signers', signerIds },
    })

  it('starts with no signers, no address, and nothing to approve', () => {
    const account = loadPreset('from-scratch')
    expect(account.signers).toEqual([])
    expect(account.accessKeys).toEqual([])
    expect(account.address).toBeNull()
    expect(isCreated(account)).toBe(false)
    expect(account.balance).toBe(0)
    expect(analyzeAccount(account)).toMatchObject({
      valid: false,
      tiers: [],
      notices: [{ message: 'No signers yet. Add the first one to create the account.' }],
    })
    expect(guidedActions(account)).toEqual([])
  })

  it('refuses payments, access keys, and updates until a signer exists', () => {
    const account = loadPreset('from-scratch')
    expect(pay(account, [])).toEqual({
      ok: false,
      code: 'not-created',
      message: 'Add the first signer to create the account.',
    })
    expect(addAccessKey(account, 'browser').notice).toBe(
      'Add the first signer to create the account.',
    )
    expect(addAccessKey(account, 'browser').accessKeys).toEqual([])
    expect(setThreshold(account, 2).notice).toBe('Add the first signer to create the account.')
  })

  it('creates the account from the first signer as v0', () => {
    const empty = loadPreset('from-scratch')
    const created = addSigner(empty, 'passkey')
    const [first] = created.signers
    expect(isCreated(created)).toBe(true)
    expect(created).toMatchObject({
      version: 0,
      startVersion: 0,
      threshold: 1,
      genesis: { threshold: 1, owners: [{ id: first.id, weight: 1 }] },
      committed: { threshold: 1, owners: [{ id: first.id, weight: 1 }] },
    })
    expect(first).toMatchObject({ kind: 'passkey', weight: 1, addedIn: 0 })
    expect(signerStatus(created, first)).toBe('active')
    const nonce = String(created.genesis?.nonce)
    expect(nonce).toMatch(/^[0-9a-f]{16}$/)
    expect(created.address).toBe(
      deriveAddress(`from-scratch:passkey:${first.subject ?? ''}:${nonce}`, {
        threshold: 1,
        owners: [{ id: first.id, weight: 1 }],
      }),
    )
    // Two accounts created the same way are still two accounts.
    expect(addSigner(empty, 'passkey').address).not.toBe(created.address)
    expect(created.log[0].title).toBe('Created account · v0 · Passkey W1 · address from v0')
    expect(pay(created, [first.id]).ok).toBe(true)
    expect(analyzeAccount(created).notices.map((notice) => notice.message)).toEqual([
      'No backup signer: losing it locks the account.',
    ])
  })

  it('adds later signers as updates at the same address', () => {
    const created = addSigner(loadPreset('from-scratch'), 'private-key', {
      privateKey: `0x${'22'.repeat(32)}`,
    })
    expect(created.signers[0].privateKey).toBe(`0x${'22'.repeat(32)}`)
    const backup = addSigner(created, 'passkey')
    expect(backup.address).toBe(created.address)
    expect(backup.version).toBe(1)
    expect(backup.genesis).toEqual(created.genesis)
    expect(backup.log[0].title).toMatch(/^Config v1 · Added Passkey/)
    for (const signer of configuredSigners(backup)) expect(pay(backup, [signer.id]).ok).toBe(true)
    expect(analyzeAccount(backup).notices).toEqual([])
  })
})

describe('Privy login', () => {
  it('is an OIDC login the account holder controls', () => {
    expect(signerKinds.privy).toEqual({
      label: 'Privy login',
      scheme: 'oidc',
      holder: 'you',
      group: 'Logins',
      loginWord: 'Privy',
    })
    expect(isLogin({ kind: 'privy' })).toBe(true)
  })

  it('adds as a backup login at the same address', () => {
    const created = addSigner(loadPreset('from-scratch'), 'passkey')
    const backup = addSigner(created, 'privy')
    const added = backup.signers.at(-1)
    expect(added).toMatchObject({
      kind: 'privy',
      name: 'Privy login',
      detail: 'OIDC · Privy account',
      holder: 'you',
      weight: 1,
    })
    expect(backup.address).toBe(created.address)
    expect(backup.log[0].title).toMatch(/^Config v1 · Added Privy login/)
  })

  it('counts toward the two-login limit and reads as Privy in approval phrases', () => {
    const logins = [signer('g', 'google', 1), signer('a', 'apple', 1), signer('v', 'privy', 1)]
    expect(
      validateConfig({ threshold: 3, owners: logins, rules: rulesOff }).map((issue) => issue.code),
    ).toEqual(['login-limit'])
    const owners = [signer('p', 'passkey', 2), signer('g', 'google', 1), signer('v', 'privy', 1)]
    expect(describeApprovalSets(approvalSets(owners, 2))).toBe(
      'the passkey, or Google and Privy together',
    )
  })
})

describe('account health', () => {
  const notices = (account: SandboxAccount) =>
    analyzeAccount(account).notices.map((notice) => notice.message)

  it('flags logins alone and a missing backup', () => {
    expect(notices(loadPreset('portable-sign-in'))).toEqual([
      'Only logins can approve. Add a passkey for large balances.',
      'No backup signer: losing it locks the account.',
    ])
  })

  it('accepts the recommended passkey-or-both-logins setup', () => {
    expect(notices(loadPreset('multi-factor'))).toEqual([])
  })

  it('flags a key you don’t hold that can approve alone', () => {
    const account = addSigner(setThreshold(loadPreset('team-treasury'), 1), 'wallet-provider')
    expect(notices(account)).toContain('One key you don’t hold can move funds alone.')
  })

  it('flags a signer every approval needs', () => {
    expect(notices(loadPreset('approval-rules'))).toEqual([
      'Changes need every signer: losing one blocks recovery.',
    ])
    const both = setThreshold(addSigner(loadPreset('portable-sign-in'), 'passkey'), 2)
    expect(notices(both)).toContain('Every signer must approve: losing one locks the account.')
    const weighted = setSignerWeight(addSigner(loadPreset('portable-sign-in'), 'passkey'), 's2', 2)
    expect(notices(setThreshold(weighted, 2))).toContain('No backup for the passkey.')
  })

  it.each([
    ['multi-factor', 'google', 'Recoverable: the passkey can replace the lost signer.'],
    [
      'multi-factor',
      'passkey',
      'Recoverable: Google and Privy together can replace the lost signer.',
    ],
    [
      'change-login',
      'passkey',
      'Recoverable: Google and Privy together can replace the lost signer.',
    ],
    ['portable-sign-in', 'google', 'Locked out: remaining signers can’t reach weight 1.'],
  ] as const)('checks recovery for %s after losing %s', (preset, id, message) => {
    expect(notices(setSignerLost(loadPreset(preset), id, true))[0]).toBe(message)
  })

  it('checks recovery against the change weight while rules are on', () => {
    const account = setSignerLost(setApprovalRules(loadPreset('multi-factor'), true), 'privy', true)
    expect(notices(account)[0]).toBe('Locked out: remaining signers can’t reach weight 4.')
  })

  it('labels unchanged recommended presets that raise no warnings', () => {
    const recommended = presets.filter((preset) => preset.recommended).map((preset) => preset.id)
    expect(recommended).toEqual([
      'rotate-keys',
      'team-treasury',
      'team-account',
      'backend-automation',
    ])
    for (const id of recommended) {
      const health = analyzeAccount(loadPreset(id))
      expect(health.notices).toEqual([])
      expect(health.recommended).toBe(true)
    }
    expect(analyzeAccount(loadPreset('multi-factor')).recommended).toBe(false)
    expect(analyzeAccount(setThreshold(loadPreset('team-treasury'), 3)).recommended).toBe(false)
  })
})

describe('adapter boundary', () => {
  it('simulates without making a network request', async () => {
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    try {
      const account = loadPreset('multi-factor')
      const action: ActionRequest = {
        action: { type: 'payment', amount: 50 },
        approver: { type: 'signers', signerIds: ['passkey'] },
      }
      expect(await simulatedAdapter.submit(account, action)).toEqual(applyAction(account, action))
      expect(request).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('a single-key account', () => {
  const key = {
    privateKey: `0x${'99'.repeat(32)}`,
    address: '0x00000000000000000000000000000000000000a1',
  }
  const pay = (account: SandboxAccount, signerIds: string[]) =>
    evaluateAction(
      { ...account, balance: 100 },
      { action: { type: 'payment', amount: 5 }, approver: { type: 'signers', signerIds } },
    )

  it('uses the key’s own address, with the key alone', () => {
    const legacy = createLegacyAccount(loadPreset('from-scratch'), key)
    expect(legacy).toMatchObject({ address: key.address, legacy: true, threshold: 1, version: 0 })
    expect(legacy.genesis).toBeUndefined()
    expect(legacy.signers).toMatchObject([
      { kind: 'private-key', weight: 1, privateKey: key.privateKey },
    ])
    expect(legacy.log[0].title).toBe('Single-key account · not upgraded')
    expect(pay(legacy, [legacy.signers[0].id]).ok).toBe(true)
  })

  it('waits for the upgrade to take signers and keys', () => {
    const legacy = createLegacyAccount(loadPreset('from-scratch'), key)
    for (const next of [
      addSigner(legacy, 'passkey'),
      setThreshold(legacy, 2),
      addAccessKey(legacy, 'browser'),
    ]) {
      expect(next.notice).toBe('Upgrade first to add signers and keys.')
      expect(configuredSigners(next)).toHaveLength(1)
      expect(next.accessKeys).toEqual([])
    }
  })

  it('upgrades in place to a configurable account at the same address', () => {
    const legacy = createLegacyAccount(loadPreset('from-scratch'), key)
    const upgraded = upgradeLegacyAccount(legacy)
    expect(upgraded).toMatchObject({
      address: key.address,
      legacy: false,
      version: 1,
      threshold: 1,
    })
    expect(upgraded.committed.owners).toEqual([{ id: legacy.signers[0].id, weight: 1 }])
    expect(upgraded.log[0].title).toBe('Upgraded in place · same address')
    const backup = addSigner(upgraded, 'passkey')
    expect(backup.address).toBe(key.address)
    expect(backup.version).toBe(2)
    expect(backup.log[0].title).toMatch(/^Config v2 · Added Passkey/)
    expect(upgradeLegacyAccount(upgraded)).toBe(upgraded)
  })
})
