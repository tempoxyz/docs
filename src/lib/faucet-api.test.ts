import { Actions } from 'viem/tempo'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('allows docs and Vercel origins for CORS', async () => {
    const docsResponse = await OPTIONS(requestWithOrigin('https://tempo.xyz'))
    const vercelResponse = await OPTIONS(requestWithOrigin('https://docs-git-branch.vercel.app'))

    expect(docsResponse.headers.get('Access-Control-Allow-Origin')).toBe('https://tempo.xyz')
    expect(vercelResponse.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://docs-git-branch.vercel.app',
    )
  })

  it('does not allow arbitrary CORS origins', async () => {
    const response = await OPTIONS(requestWithOrigin('https://example.com'))

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
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
