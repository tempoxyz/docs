import { describe, expect, test } from 'vitest'
import type { IrOperation } from '../../node_modules/vocs/dist/internal/openapi/parser.js'
import {
  documentWithQuery,
  operationWithPreset,
  operationWithQuery,
} from '../../node_modules/vocs/dist/internal/openapi/query-presets.js'
import { codeSamples } from '../../node_modules/vocs/dist/internal/openapi/sample.js'

const path = '/v1/addresses/{address}/activities'
const operation: IrOperation = {
  id: 'getaddressactivities',
  method: 'GET',
  path,
  parameters: [
    { in: 'path', name: 'address', required: true, schema: { example: '0x123' } },
    { in: 'query', name: 'chainId', schema: { examples: [4217], default: 'mainnet' } },
    { in: 'query', name: 'type', schema: { type: 'array', examples: [['mint', 'burn']] } },
  ],
  responses: [],
}

describe('inline API query presets', () => {
  test('uses testnet and transfer values in copied requests without changing reference defaults', () => {
    const before = structuredClone(operation)
    const preset = operationWithQuery(operation, 'chainId=42431&type=transfer')
    const sample = codeSamples(preset, 'https://api.tempo.xyz')[0].code
    expect(sample).toContain('chainId=42431')
    expect(sample).toContain('type=transfer')
    expect(operation).toEqual(before)
    expect(codeSamples(operation, 'https://api.tempo.xyz')[0].code).toContain('chainId=4217')
    expect(preset.parameters[1].schema?.default).toBe('mainnet')
  })

  test('enables preset query rows only in this Scalar document and operation', () => {
    const document = {
      paths: {
        [path]: { get: { parameters: structuredClone(operation.parameters) } },
        '/v1/other': { get: { parameters: structuredClone(operation.parameters) } },
      },
    }
    const before = structuredClone(document)
    const preset = documentWithQuery(document, {
      method: 'GET',
      path,
      query: 'chainId=42431&type=transfer',
    }) as typeof document
    expect(preset.paths[path].get.parameters[1]).toMatchObject({
      schema: { default: 'mainnet', example: '42431' },
      examples: { default: { value: '42431', 'x-disabled': false } },
    })
    expect(preset.paths[path].get.parameters[2]).toMatchObject({
      examples: { default: { value: ['transfer'], 'x-disabled': false } },
    })
    expect(preset.paths['/v1/other']).toEqual(document.paths['/v1/other'])
    expect(document).toEqual(before)
  })

  test('fills path values and the JSON body, and drops unnamed optional query rows', () => {
    const create: IrOperation = {
      id: 'createtransfer',
      method: 'POST',
      path: '/v1/transfers/{id}',
      parameters: [
        { in: 'path', name: 'id', required: true, schema: { example: 'rtr_1' } },
        { in: 'query', name: 'chainId', schema: { examples: [4217] } },
        { in: 'query', name: 'tokens', required: true, schema: { examples: ['0x1'] } },
      ],
      requestBody: {
        content: [{ mediaType: 'application/json', schema: { type: 'object' } }],
      },
      responses: [],
    }
    const preset = operationWithPreset(create, {
      body: '{"amount":"1000000"}',
      params: 'id=rtr_2',
      query: 'tokens=0xa,0xb',
    })
    const sample = codeSamples(preset, 'https://api.tempo.xyz', { expand: true })[0]
    expect(sample.code).toContain('/v1/transfers/rtr_2?tokens=0xa,0xb')
    expect(sample.code).not.toContain('chainId')
    expect(sample.code).toContain('"amount": "1000000"')
    expect(sample.collapsed).toBeUndefined()

    const document = {
      paths: {
        '/v1/transfers/{id}': {
          post: {
            parameters: structuredClone(create.parameters),
            requestBody: { content: { 'application/json': { examples: { a: { value: {} } } } } },
          },
        },
      },
    }
    const scalar = documentWithQuery(document, {
      body: '{"amount":"1000000"}',
      method: 'POST',
      params: 'id=rtr_2',
      path: '/v1/transfers/{id}',
    }) as typeof document
    const post = scalar.paths['/v1/transfers/{id}'].post
    expect(post.parameters[0]).toMatchObject({ examples: { default: { value: 'rtr_2' } } })
    expect(post.requestBody.content['application/json']).toEqual({ example: { amount: '1000000' } })
  })

  test('leaves normal API reference instances unchanged', () => {
    const document = { paths: {} }
    expect(documentWithQuery(document)).toBe(document)
    expect(operationWithQuery(operation)).toBe(operation)
  })
})
