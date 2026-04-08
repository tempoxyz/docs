'use client'
import * as Demo from './Demo'
import * as Step from './steps'

export default function AccountsDemo() {
  return (
    <Demo.Container name="Make a Payment" footerVariant="source" src="tempoxyz/accounts/tree/main/examples/basic">
      <Step.Connect stepNumber={1} />
      <Step.AddFunds stepNumber={2} />
      <Step.SendPayment stepNumber={3} last />
    </Demo.Container>
  )
}
