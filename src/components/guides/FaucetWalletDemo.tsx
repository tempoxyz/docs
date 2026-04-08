'use client'
import * as Demo from './Demo'
import * as Step from './steps'
import * as Token from './tokens'

export default function FaucetWalletDemo({ variant }: { variant: 'wallet' | 'address' }) {
  if (variant === 'address') {
    return (
      <Demo.Container name="Fund an address">
        <Step.AddFundsToOthers stepNumber={1} last />
      </Demo.Container>
    )
  }

  return (
    <Demo.Container
      name="Connect and fund your wallet"
      footerVariant="balances"
      tokens={[Token.pathUsd, Token.alphaUsd, Token.betaUsd, Token.thetaUsd]}
      balanceSource="wallet"
    >
      <Step.ConnectWallet stepNumber={1} />
      <Step.AddFundsToWallet stepNumber={2} />
      <Step.AddTokensToWallet stepNumber={3} />
      <Step.SetFeeToken stepNumber={4} last />
    </Demo.Container>
  )
}
