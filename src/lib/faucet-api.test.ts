import { Actions } from 'viem/tempo'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OPTIONS, POST } from '../pages/_api/api/faucet'

vi.mock('viem/tempo', () => ({
  Actions: {
    faucet: {
      fund: vi.fn(),
    },
  },
}))

const fund = vi.mocked(Actions.faucet.fund)

describe('faucet API', () => {
  beforeEach(() => {
    fund.mockReset()
    delete process.env.ALLOWED_ORIGINS
  })

  afterEach(() => {
    delete process.env.ALLOWED_ORIGINS
  })

  it.each([
    ['missing address', {}],
    ['empty address', { address: '' }],
    ['missing 0x prefix', { address: 'beefcafe54750903ac1c8909323af7beb21ea2cb' }],
    ['too short', { address: '0xbeefcafe54750903ac1c8909323af7beb21ea2c' }],
    ['too long', { address: '0xbeefcafe54750903ac1c8909323af7beb21ea2cbb' }],
    ['non-hex character', { address: '0xbeefcafe54750903ac1c8909323af7beb21ea2cg' }],
  ])('rejects %s', async (_name, body) => {
    const response = await POST(jsonRequest(body))

    await expect(response.json()).resolves.toEqual({
      data: null,
      error: 'Invalid or missing address',
    })
    expect(response.status).toBe(400)
    expect(fund).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON', async () => {
    const response = await POST(
      new Request('https://tempo.xyz/developers/api/faucet', {
        method: 'POST',
        body: '{',
      }),
    )

    await expect(response.json()).resolves.toEqual({
      data: null,
      error: 'Invalid request: could not parse JSON',
    })
    expect(response.status).toBe(400)
    expect(fund).not.toHaveBeenCalled()
  })

  it('funds a valid address and normalizes it to lowercase', async () => {
    fund.mockResolvedValueOnce(['0xhash1', '0xhash2'])

    const response = await POST(
      jsonRequest({ address: '0xBEEFcafe54750903ac1c8909323af7beb21ea2cb' }),
    )

    await expect(response.json()).resolves.toEqual({
      data: [{ hash: '0xhash1' }, { hash: '0xhash2' }],
      error: null,
    })
    expect(response.status).toBe(200)
    expect(fund).toHaveBeenCalledTimes(1)
    expect(fund).toHaveBeenCalledWith(expect.anything(), {
      account: '0xbeefcafe54750903ac1c8909323af7beb21ea2cb',
    })
  })

  it('allows the default Tempo origins for CORS', async () => {
    const tempoResponse = await OPTIONS(requestWithOrigin('https://tempo.xyz'))
    const docsResponse = await OPTIONS(requestWithOrigin('https://docs.tempo.xyz'))

    expect(tempoResponse.headers.get('Access-Control-Allow-Origin')).toBe('https://tempo.xyz')
    expect(docsResponse.headers.get('Access-Control-Allow-Origin')).toBe('https://docs.tempo.xyz')
  })

  it('allows extra origins only when they are explicitly allowlisted', async () => {
    const preview = 'https://docs-git-branch.vercel.app'

    expect(
      (await OPTIONS(requestWithOrigin(preview))).headers.get('Access-Control-Allow-Origin'),
    ).toBeNull()

    process.env.ALLOWED_ORIGINS = `https://tempo.xyz, ${preview}`

    expect(
      (await OPTIONS(requestWithOrigin(preview))).headers.get('Access-Control-Allow-Origin'),
    ).toBe(preview)
  })

  it('does not allow arbitrary CORS origins', async () => {
    const response = await OPTIONS(requestWithOrigin('https://example.com'))
    const prefixResponse = await OPTIONS(requestWithOrigin('https://tempo.xyz.example.com'))
    const suffixResponse = await OPTIONS(requestWithOrigin('https://evil-tempo.xyz'))

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
    expect(prefixResponse.headers.get('Access-Control-Allow-Origin')).toBeNull()
    expect(suffixResponse.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})

function jsonRequest(body: unknown) {
  return new Request('https://tempo.xyz/developers/api/faucet', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      origin: 'https://tempo.xyz',
    },
  })
}

function requestWithOrigin(origin: string) {
  return new Request('https://tempo.xyz/developers/api/faucet', {
    method: 'OPTIONS',
    headers: { origin },
  })
}
