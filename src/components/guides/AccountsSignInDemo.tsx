'use client'
import * as Demo from './Demo'
import { AccountsSignIn } from './AccountsSignIn'

export default function AccountsSignInDemo() {
  return (
    <Demo.Container name="Tempo Wallet" footerVariant="source" src="tempoxyz/accounts/tree/main/examples/basic">
      <AccountsSignIn />
    </Demo.Container>
  )
}
