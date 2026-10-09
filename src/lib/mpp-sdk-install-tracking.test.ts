import { describe, expect, it } from 'vitest'
import { classifyMppSdkInstall } from './mpp-sdk-install-tracking'

describe('MPP SDK install intent classification', () => {
  it.each([
    ['npm install mppx viem', 'npm'],
    ['npm add mppx viem', 'npm'],
    ['npm i --save mppx@0.13.3 viem', 'npm'],
    ['pnpm add mppx viem', 'pnpm'],
    ['$ bun add mppx viem', 'bun'],
    ['yarn add mppx@latest viem', 'yarn'],
  ])('classifies %s without retaining command text', (command, manager) => {
    expect(classifyMppSdkInstall(command)).toEqual({
      package_manager: manager,
      sdk_package: 'mppx',
    })
  })

  it.each([
    'npm install viem',
    'npm install not-mppx',
    'npm install @other/mppx',
    'npx mppx https://example.com',
    'import { Mppx } from "mppx/client"',
    'echo npm install mppx',
    'npm install --registry=https://mppx.example.com viem',
    'yarn install mppx',
    'bun i mppx',
  ])('does not classify unrelated code: %s', (command) => {
    expect(classifyMppSdkInstall(command)).toBeNull()
  })
})
