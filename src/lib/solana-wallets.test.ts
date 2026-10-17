import { afterEach, describe, expect, it, vi } from 'vitest'
import { base58Decode, base58Encode } from './base58'
import { legacyTransaction, tokenAccount, waitForSolanaSignature } from './solana-wallets'

const usdc = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const usdt = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
afterEach(() => vi.unstubAllGlobals())

describe('Solana encoding', () => {
  it('round-trips base58, keeping leading zero bytes', () => {
    expect(base58Encode(base58Decode('11111111111111111111111111111111'))).toBe(
      '11111111111111111111111111111111',
    )
    expect(base58Decode('11111111111111111111111111111111')).toEqual(new Uint8Array(32))
    expect(() => base58Decode('0OIl')).toThrow('Invalid base58')
  })
  it('derives associated token accounts, skipping bumps that land on the curve', () => {
    // Vectors from @solana-program/token; the second one needs bump 250.
    expect(tokenAccount('So11111111111111111111111111111111111111112', usdc)).toBe(
      'DHe62eeQVEnNK7vg5xUpDkJm7tuqHadjhvmPRFBG9UPo',
    )
    expect(tokenAccount('ErtdgZUuA8BBWAV1WH9588RRsQCgHvxzk2MT4HpWBi7D', usdt)).toBe(
      'HcZxJXa1ZNm2m3Vbooc9Aaq285fzRSd1h8i9ch4fWJ5s',
    )
  })
  it('compiles a legacy transaction with the payer as the only signer', () => {
    const payer = 'ErtdgZUuA8BBWAV1WH9588RRsQCgHvxzk2MT4HpWBi7D'
    const program = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
    const bytes = legacyTransaction(payer, usdc, [
      {
        program,
        accounts: [
          { address: usdt, writable: true },
          { address: payer, writable: false, signer: true },
        ],
        data: Uint8Array.of(12),
      },
    ])
    // One empty signature, then header [signers, read-only signers, read-only others].
    expect(bytes[0]).toBe(1)
    expect([...bytes.slice(1, 65)]).toEqual(new Array(64).fill(0))
    const message = bytes.slice(65)
    expect([...message.slice(0, 4)]).toEqual([1, 0, 1, 3])
    const key = (i: number) => base58Encode(message.slice(4 + i * 32, 36 + i * 32))
    expect([key(0), key(1), key(2)]).toEqual([payer, usdt, program])
    expect(base58Encode(message.slice(100, 132))).toBe(usdc)
    // One instruction: program index 2, accounts [1, 0], one byte of data.
    expect([...message.slice(132)]).toEqual([1, 2, 2, 1, 0, 1, 12])
  })
})

describe('Solana confirmation', () => {
  const answer = (result: unknown) => Response.json({ jsonrpc: '2.0', id: 1, result })
  it('waits for a confirmed status', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(answer({ value: [null] }))
      .mockResolvedValueOnce(answer(10))
      .mockResolvedValueOnce(answer({ value: [{ err: null, confirmationStatus: 'confirmed' }] }))
    vi.stubGlobal('fetch', fetcher)
    await expect(waitForSolanaSignature('sig', 100n, { intervalMs: 0 })).resolves.toBeUndefined()
  })
  it('reports a failed or expired transaction', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(answer({ value: [{ err: { InstructionError: [1, 'x'] } }] })),
    )
    await expect(waitForSolanaSignature('sig', 100n, { intervalMs: 0 })).rejects.toThrow(
      'The Solana transaction failed',
    )
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(answer({ value: [null] }))
        .mockResolvedValueOnce(answer(101)),
    )
    await expect(waitForSolanaSignature('sig', 100n, { intervalMs: 0 })).rejects.toThrow('expired')
  })
})
