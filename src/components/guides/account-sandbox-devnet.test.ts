import { describe, expect, it, vi } from 'vitest'
import {
  type AccessKey,
  type ActionRequest,
  accessKeyTemplateName,
  accessKeyTemplateOptions,
  accessKeyTemplates,
  addAccessKey,
  addSigner,
  loadPreset,
  type Signer,
  type SignerKind,
  setThreshold,
  signerKinds,
} from './account-sandbox'
import {
  accessKeySpec,
  attachHash,
  authorizationParameters,
  checkDevnet,
  chooseQuorum,
  createDevnetAdapter,
  DevnetRejection,
  devnetKeyType,
  devnetToken,
  isForeignCommitment,
  mapDevnetError,
  needsFunds,
  rebaseOnto,
  sameConfig,
  sendsTransaction,
  sessionKey,
  unitsToUsd,
  upgradeConfig,
  upgradeSalt,
  usdToUnits,
} from './account-sandbox-devnet'

function signer(id: string, kind: SignerKind, weight: number, lost = false): Signer {
  return {
    id,
    kind,
    name: signerKinds[kind].label,
    detail: '',
    weight,
    holder: signerKinds[kind].holder,
    lost,
    revoked: false,
    addedIn: 0,
  }
}

function key(template: keyof typeof accessKeyTemplates): AccessKey {
  return { ...accessKeyTemplates[template], id: 'key-1', spent: 0, status: 'active' }
}

const ids = (signers: Signer[] | null) => signers?.map((item) => item.id)

describe('units', () => {
  it('converts USD to six-decimal token units and back', () => {
    expect(usdToUnits(0.1 + 0.2)).toBe(300_000n)
    expect(usdToUnits(6_000)).toBe(6_000_000_000n)
    expect(unitsToUsd(1_899_997_947n)).toBe(1_899.997947)
  })
})

describe('devnetKeyType', () => {
  it('uses each signer kind’s scheme', () => {
    const types = Object.fromEntries(
      (Object.keys(signerKinds) as SignerKind[]).map((kind) => [kind, devnetKeyType(kind)]),
    )
    expect(types).toEqual({
      'private-key': 'secp256k1',
      passkey: 'webAuthn',
      device: 'p256',
      hardware: 'secp256k1',
      'wallet-provider': 'secp256k1',
      'recovery-provider': 'secp256k1',
    })
  })
})

describe('authorizationParameters', () => {
  const recipient = '0x00000000000000000000000000000000000000aa'

  it('limits approved-recipient keys to the demo recipient', () => {
    const parameters = authorizationParameters(key('payout'), recipient, 1_000)
    expect(parameters).not.toHaveProperty('expiry')
    expect(parameters.limits).toEqual([
      { token: devnetToken, limit: 10_000_000_000n, period: 86_400 },
    ])
    expect(parameters.scopes).toEqual([
      { address: devnetToken, selector: '0xa9059cbb', recipients: [recipient] },
    ])
  })

  it('maps expiry and weekly periods, and leaves any-recipient keys open', () => {
    const phone = authorizationParameters(key('iphone'), recipient, 1_000)
    expect(phone.expiry).toBe(1_000 + 30 * 86_400)
    expect(phone.scopes).toEqual([{ address: devnetToken, selector: '0xa9059cbb' }])
    expect(authorizationParameters(key('bill-pay'), recipient).limits[0].period).toBe(604_800)
  })

  it('gives different grants different specs', () => {
    expect(accessKeySpec(key('payout'))).toBe(accessKeySpec({ ...key('payout'), spent: 40 }))
    expect(accessKeySpec(key('payout'))).not.toBe(accessKeySpec(key('bill-pay')))
    expect(accessKeySpec(key('team'))).toContain('"threshold":2')
  })
})

describe('sameConfig', () => {
  const a = '0x00000000000000000000000000000000000000Aa'
  const b = '0x00000000000000000000000000000000000000bb'

  it('ignores owner order and address case', () => {
    expect(
      sameConfig(
        {
          owners: [
            { owner: a, weight: 1 },
            { owner: b, weight: 2 },
          ],
          threshold: 2,
        },
        {
          owners: [
            { owner: b, weight: 2 },
            { owner: a.toLowerCase(), weight: 1 },
          ],
          threshold: 2,
        },
      ),
    ).toBe(true)
  })

  it('notices weight and threshold changes', () => {
    const base = { owners: [{ owner: a, weight: 1 }], threshold: 1 }
    expect(sameConfig(base, { ...base, threshold: 2 })).toBe(false)
    expect(sameConfig(base, { owners: [{ owner: a, weight: 2 }], threshold: 1 })).toBe(false)
  })
})

describe('chooseQuorum', () => {
  it('takes the heaviest set that reaches the threshold', () => {
    const owners = [
      signer('finance', 'hardware', 1),
      signer('cfo', 'passkey', 2),
      signer('operations', 'hardware', 1),
    ]
    expect(ids(chooseQuorum(owners, 2))).toEqual(['cfo'])
  })

  it('skips lost signers when it can', () => {
    const owners = [
      signer('finance', 'hardware', 1),
      signer('cfo', 'passkey', 2, true),
      signer('operations', 'hardware', 1),
    ]
    expect(ids(chooseQuorum(owners, 2))).toEqual(['finance', 'operations'])
  })

  it('falls back to lost signers, since this page holds every devnet key', () => {
    const owners = [signer('finance', 'hardware', 1), signer('cfo', 'passkey', 2, true)]
    expect(ids(chooseQuorum(owners, 2))).toEqual(['cfo'])
  })

  it('returns null when no set reaches the threshold', () => {
    expect(chooseQuorum([signer('finance', 'hardware', 1)], 2)).toBeNull()
  })
})

describe('devnet adapter refusals', () => {
  // Nothing here reaches a network: missing WebAuthn and unreachable devnet fail first.
  const unreachable = 'http://127.0.0.1:9'
  const pay: ActionRequest = {
    action: { type: 'payment', amount: 50 },
    approver: { type: 'signers', signerIds: ['passkey'] },
  }

  it('fails passkey signers when the browser has no WebAuthn', async () => {
    const adapter = createDevnetAdapter({ rpcUrl: unreachable })
    await expect(adapter.prepare(loadPreset('team-treasury'))).rejects.toThrow(
      'This browser can’t create a passkey.',
    )
  })

  it('reports an unreachable devnet as a rejection', async () => {
    const adapter = createDevnetAdapter({ rpcUrl: unreachable, passkeys: 'headless' })
    const created = addSigner(loadPreset('from-scratch'), 'private-key', {
      privateKey: `0x${'33'.repeat(32)}`,
    })
    const rejection = adapter.prepare(created)
    await expect(rejection).rejects.toThrow(DevnetRejection)
    await expect(rejection).rejects.toThrow('Devnet unreachable.')
  })

  it('refuses an account with no signers yet', async () => {
    const adapter = createDevnetAdapter({ rpcUrl: unreachable, passkeys: 'headless' })
    const empty = loadPreset('from-scratch')
    await expect(adapter.prepare(empty)).rejects.toThrow(
      'Add the first signer to create the account.',
    )
    expect(await adapter.sync(empty, empty)).toEqual({ account: empty })
    expect((await adapter.submit(empty, pay)).result).toEqual({
      ok: false,
      code: 'not-created',
      message: 'Add the first signer to create the account.',
    })
  })

  it('creates the account when the first signer is added, or explains why not', async () => {
    const adapter = createDevnetAdapter({ rpcUrl: unreachable, passkeys: 'headless' })
    const empty = loadPreset('from-scratch')
    const synced = await adapter.sync(empty, addSigner(empty, 'passkey'))
    // Creating means funding, which needs devnet: it keeps the empty account and says why.
    expect(synced.account.address).toBeNull()
    expect(synced.account.notice).toBe('Devnet unreachable.')
  })
})

describe('mapDevnetError', () => {
  it.each([
    [
      {
        details:
          'execution reverted: Account keychain error: SpendingLimitExceeded(SpendingLimitExceeded)',
      },
      'key-limit',
      'Over its limit on devnet.',
    ],
    [
      { details: 'execution reverted: Account keychain error: CallNotAllowed(CallNotAllowed)' },
      'recipient-not-allowed',
      'Not an approved recipient on devnet.',
    ],
    [
      {
        details:
          'Revm error: keychain validation failed: AccountKeychainError(KeyAlreadyRevoked(KeyAlreadyRevoked))',
      },
      'key-revoked',
      'Revoked on devnet.',
    ],
    [
      { details: 'execution reverted: Account keychain error: KeyNotFound(KeyNotFound)' },
      'key-revoked',
      'Not authorized on devnet.',
    ],
    [
      new Error('multisig configuration commitment mismatch'),
      'invalid-config',
      'Config is out of sync with devnet.',
    ],
    [
      new Error('Local owners do not meet the threshold.'),
      'insufficient-weight',
      'Below the devnet threshold.',
    ],
    [new TypeError('fetch failed'), 'network-error', 'Devnet unreachable.'],
  ])('maps %o', (error, code, message) => {
    expect(mapDevnetError(error)).toEqual({ code, message })
  })

  it('maps WebAuthn errors anywhere in the cause chain', () => {
    const dom = (name: string) => Object.assign(new Error(name), { name })
    expect(mapDevnetError(new Error('create failed', { cause: dom('NotAllowedError') }))).toEqual({
      code: 'no-approver',
      message: 'Passkey cancelled.',
    })
    expect(mapDevnetError(dom('NotSupportedError'))).toEqual({
      code: 'network-error',
      message: 'This browser can’t create a passkey.',
    })
    expect(mapDevnetError(new DevnetRejection('key-limit', 'Over its limit on devnet.'))).toEqual({
      code: 'key-limit',
      message: 'Over its limit on devnet.',
    })
  })

  it('keeps the first line of anything else', () => {
    expect(
      mapDevnetError({ details: 'Revm error: primitive root key retired for account 0x52\nmore' }),
    ).toEqual({
      code: 'network-error',
      message: 'Devnet: primitive root key retired for account 0x52',
    })
  })
})

describe('log helpers', () => {
  it('attaches a hash to the newest matching entry after a point', () => {
    const previous = loadPreset('team-treasury')
    const once = setThreshold(previous, 3)
    const twice = setThreshold(once, 2)
    const sinceId = previous.log[0].id
    const tagged = attachHash(twice, (entry) => entry.kind === 'config', '0x01', sinceId)
    expect(tagged.log.map((entry) => entry.hash)).toEqual(['0x01', undefined, undefined])
    const again = attachHash(tagged, (entry) => entry.kind === 'config', '0x02', sinceId)
    expect(again.log.map((entry) => entry.hash)).toEqual(['0x01', '0x02', undefined])
    expect(attachHash(previous, () => true, '0x03', sinceId)).toBe(previous)
  })

  it('replays an edit onto the prepared account', () => {
    const previous = loadPreset('team-treasury')
    const next = setThreshold(previous, 3)
    const prepared = {
      ...previous,
      address: '0x00000000000000000000000000000000000000cc',
      balance: 1_000_000,
      devnet: { standInLogins: false, lastHash: '0x01' },
      log: [{ id: 2, kind: 'event' as const, title: 'On devnet' }, ...previous.log],
    }
    const rebased = rebaseOnto(previous, next, prepared)
    expect(rebased.threshold).toBe(3)
    expect(rebased.committed.threshold).toBe(3)
    expect(rebased.address).toBe(prepared.address)
    expect(rebased.balance).toBe(1_000_000)
    expect(rebased.devnet).toBe(prepared.devnet)
    expect(rebased.log.map((entry) => [entry.id, entry.title])).toEqual([
      [3, 'Config v1 · Threshold 2 → 3'],
      [2, 'On devnet'],
      [1, previous.log[0].title],
    ])
  })

  it('keys sessions by preset and address', () => {
    expect(sessionKey({ presetId: 'export', address: '0xAB' })).toBe('export:0xab')
  })

  it('keys each account created from scratch apart', () => {
    const empty = loadPreset('from-scratch')
    const first = addSigner(empty, 'private-key', { privateKey: `0x${'44'.repeat(32)}` })
    const second = addSigner(empty, 'private-key', { privateKey: `0x${'55'.repeat(32)}` })
    expect(sessionKey(first)).not.toBe(sessionKey(second))
    expect(sessionKey(first)).toBe(`from-scratch:${first.genesis?.nonce}`)
    // Edits keep the account's key.
    expect(sessionKey(setThreshold(first, 1))).toBe(sessionKey(first))
  })
})

describe('checkDevnet', () => {
  const reply = (body: unknown, ok = true) =>
    vi.fn(async () => ({ ok, json: async () => body }) as Response)

  it('is true only for chain ID 31318', async () => {
    expect(await checkDevnet({ fetch: reply({ result: '0x7a56' }), protocol: 'http:' })).toBe(true)
    expect(await checkDevnet({ fetch: reply({ result: '0x1' }), protocol: 'http:' })).toBe(false)
    expect(await checkDevnet({ fetch: reply({}, false), protocol: 'http:' })).toBe(false)
  })

  it('skips HTTPS pages without a request', async () => {
    const fetch = reply({ result: '0x7a56' })
    expect(await checkDevnet({ fetch, protocol: 'https:' })).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('is false when the request fails or times out', async () => {
    const failing = vi.fn(async () => {
      throw new TypeError('fetch failed')
    })
    expect(await checkDevnet({ fetch: failing, protocol: 'http:' })).toBe(false)
    const hanging = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_, reject) =>
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted'))),
        ),
    )
    expect(await checkDevnet({ fetch: hanging, protocol: 'http:', timeoutMs: 5 })).toBe(false)
  })
})

describe('access keys the reader adds', () => {
  it('offers only real key types, for every account', () => {
    expect(accessKeyTemplateOptions).toEqual(['private-key', 'browser', 'device'])
    const scratch = addSigner(loadPreset('from-scratch'), 'passkey')
    const names = accessKeyTemplateOptions.map((id) => accessKeyTemplateName(scratch, id))
    expect(names.slice(0, 2)).toEqual(['Private key', 'This browser'])
    expect(names[2]).toMatch(/^Passkey/)
    expect(accessKeyTemplateName(loadPreset('team-treasury'), 'device')).toBe(names[2])
  })

  it('keeps a private key’s generated key for devnet to sign with', () => {
    const privateKey = `0x${'11'.repeat(32)}`
    const added = addAccessKey(loadPreset('team-treasury'), 'private-key', { privateKey })
    expect(added.accessKeys.at(-1)).toMatchObject({
      name: 'Private key',
      kind: 'private-key',
      privateKey,
    })
    // The key isn't part of the grant, so it never changes what devnet authorizes.
    const { privateKey: _, ...grant } = added.accessKeys.at(-1) as AccessKey
    expect(accessKeySpec(added.accessKeys.at(-1) as AccessKey)).toBe(accessKeySpec(grant))
  })

  it('authorizes all three with the same limits and expiry', () => {
    const recipient = '0x00000000000000000000000000000000000000aa'
    const scratch = addSigner(loadPreset('from-scratch'), 'passkey')
    const grants = accessKeyTemplateOptions.map((id) =>
      authorizationParameters(addAccessKey(scratch, id).accessKeys[0], recipient, 0),
    )
    expect(grants[1]).toEqual(grants[0])
    expect(grants[2]).toEqual(grants[0])
    expect(grants[0].limits[0].limit).toBe(500_000_000n)
  })
})

describe('salt collisions', () => {
  const config = {
    owners: [{ owner: '0x00000000000000000000000000000000000000aa' as const, weight: 1 }],
    salt: `0x${'00'.repeat(32)}` as const,
    threshold: 1,
    version: 0n,
  }

  it('keeps the zero salt for a new address or one still at its v0', async () => {
    const { AccountConfig } = await import('viem/tempo')
    expect(isForeignCommitment(`0x${'00'.repeat(32)}`, config)).toBe(false)
    expect(isForeignCommitment(AccountConfig.getCommitment(config), config)).toBe(false)
  })

  it('needs a new salt when an earlier run moved the account past v0', () => {
    expect(isForeignCommitment(`0x${'12'.repeat(32)}`, config)).toBe(true)
  })
})

describe('keys prepared before the step that adds them', () => {
  // Nothing here reaches devnet: preparing makes keys only.
  const adapter = () => createDevnetAdapter({ rpcUrl: 'http://127.0.0.1:9', passkeys: 'headless' })
  const privateKey = `0x${'66'.repeat(32)}` as const

  it('prepares signers', async () => {
    const devnet = adapter()
    const { privateKeyToAddress } = await import('viem/accounts')
    expect(
      await devnet.prepareSigner({ kind: 'private-key', name: 'Private key', privateKey }),
    ).toEqual({ address: privateKeyToAddress(privateKey) })
    const passkey = await devnet.prepareSigner({ kind: 'passkey', name: 'Passkey' })
    expect(passkey.address).toMatch(/^0x[0-9a-fA-F]{40}$/)
    const prompts: unknown[] = []
    await devnet.prepareSigner(
      { kind: 'passkey', name: 'Passkey' },
      { onPrompt: (prompt) => prompts.push(prompt) },
    )
    expect(prompts).toEqual(['create-passkey', null])
  })

  it('fails a passkey when the browser has no WebAuthn', async () => {
    const devnet = createDevnetAdapter({ rpcUrl: 'http://127.0.0.1:9' })
    await expect(devnet.prepareSigner({ kind: 'passkey', name: 'Passkey' })).rejects.toThrow(
      'This browser can’t create a passkey.',
    )
  })

  it('prepares access keys before any account exists', async () => {
    const devnet = adapter()
    const { privateKeyToAddress } = await import('viem/accounts')
    const keyFor = (template: keyof typeof accessKeyTemplates, extra = {}) => ({
      ...key(template),
      ...extra,
    })
    expect(await devnet.prepareAccessKey(keyFor('private-key', { privateKey }))).toEqual({
      address: privateKeyToAddress(privateKey),
    })
    for (const template of ['browser', 'device', 'team', 'payout'] as const)
      expect((await devnet.prepareAccessKey(keyFor(template))).address).toMatch(
        /^0x[0-9a-fA-F]{40}$/,
      )
  })
})

describe('test funds', () => {
  it('tells which edits send a transaction', () => {
    const account = addSigner(loadPreset('from-scratch'), 'passkey')
    expect(sendsTransaction(account, account)).toBe(false)
    expect(sendsTransaction(account, setThreshold(account, 1))).toBe(false)
    expect(sendsTransaction(account, addSigner(account, 'device'))).toBe(true)
    expect(sendsTransaction(account, addAccessKey(account, 'browser'))).toBe(true)
  })

  it('says why an unfunded account can’t act', () => {
    expect(needsFunds).toBe('Get test funds first: transactions need fees.')
  })

  it('needs a created account to fund', async () => {
    const adapter = createDevnetAdapter({ rpcUrl: 'http://127.0.0.1:9', passkeys: 'headless' })
    const funded = await adapter.fund(loadPreset('from-scratch'))
    expect(funded.hash).toBeUndefined()
    expect(funded.account.notice).toBe('Add the first signer to create the account.')
  })
})

describe('upgrading a plain key account', () => {
  const address = '0x7483970d27134063Ce83A21aC706AC2E9bDf4109' as const

  it('uses Tempo’s upgrade salt for the address', async () => {
    const { concat, keccak256, toHex } = await import('viem')
    expect(upgradeSalt(address)).toBe(keccak256(concat([toHex('tempo:multisig:upgrade'), address])))
  })

  it('records owners sorted by address, at version 1', () => {
    const owners = [
      { owner: '0x00000000000000000000000000000000000000bb' as const, weight: 1 },
      { owner: '0x00000000000000000000000000000000000000Aa' as const, weight: 2 },
    ]
    expect(upgradeConfig(address, owners, 2)).toEqual({
      owners: [owners[1], owners[0]],
      salt: upgradeSalt(address),
      threshold: 2,
      version: 1n,
    })
  })
})
