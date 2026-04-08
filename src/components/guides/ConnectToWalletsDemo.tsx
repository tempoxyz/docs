'use client'
import * as Demo from './Demo'
import * as Step from './steps'

export default function ConnectToWalletsDemo() {
  return (
    <Demo.Container
      name="Connect to Wallets"
      footerVariant="source"
      src="tempoxyz/examples/tree/main/examples/accounts"
    >
      <Step.ConnectWallet stepNumber={1} last />
    </Demo.Container>
  )
}
