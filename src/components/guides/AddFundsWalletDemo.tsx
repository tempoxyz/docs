'use client'

import Providers from '../Providers'
import * as Demo from './Demo'
import { AddFundsToWallet } from './steps/wallet/AddFundsToWallet.tsx'
import { AddTokensToWallet } from './steps/wallet/AddTokensToWallet.tsx'
import { ConnectWallet } from './steps/wallet/ConnectWallet.tsx'
import { SetFeeToken } from './steps/wallet/SetFeeToken.tsx'
import * as Token from './tokens'

export function AddFundsWalletDemo() {
  return (
    <Providers mipd>
      <Demo.Container
        name="Connect and fund your wallet"
        footerVariant="balances"
        tokens={[Token.pathUsd, Token.alphaUsd, Token.betaUsd, Token.thetaUsd]}
        balanceSource="wallet"
      >
        <ConnectWallet stepNumber={1} />
        <AddFundsToWallet stepNumber={2} />
        <AddTokensToWallet stepNumber={3} />
        <SetFeeToken stepNumber={4} last />
      </Demo.Container>
    </Providers>
  )
}
