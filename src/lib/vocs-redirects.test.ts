import { describe, expect, it } from 'vitest'
import vocsConfig from '../../vocs.config'

type Redirect = {
  source: string
  destination: string
  status?: number
}

const redirects = vocsConfig.redirects as Redirect[]

describe('Vocs public docs redirects', () => {
  it.each([
    ['/developers/docs/developer-tools/fee-payer', '/developers/docs/api/fee-payer'],
    ['/developers/docs/developer-tools/fee-payer/', '/developers/docs/api/fee-payer'],
    ['/developers/docs/developer-tools/indexer', '/developers/docs/api/indexer-api'],
    ['/developers/docs/developer-tools/indexer/', '/developers/docs/api/indexer-api'],
    ['/developers/docs/hosted-services', '/developers/docs/api'],
    ['/developers/docs/hosted-services/', '/developers/docs/api'],
  ])('redirects %s to %s', (source, destination) => {
    expect(redirects.find((redirect) => redirect.source === source)).toMatchObject({
      destination,
      status: 301,
    })
  })
})
