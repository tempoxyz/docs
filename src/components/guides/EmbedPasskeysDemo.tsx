'use client'
import * as Demo from './Demo'
import { EmbedPasskeys } from './EmbedPasskeys'

export default function EmbedPasskeysDemo() {
  return (
    <Demo.Container name="Passkey Accounts" footerVariant="source" src="tempoxyz/accounts/tree/main/examples/domain-bound-webauthn">
      <EmbedPasskeys />
    </Demo.Container>
  )
}
