'use client'

import Providers from '../Providers'
import * as Demo from './Demo'
import { AddFundsToOthers } from './steps/payments/AddFundsToOthers.tsx'

export function AddFundsAddressDemo() {
  return (
    <Providers>
      <Demo.Container footerVariant={undefined} name="Fund an address">
        <AddFundsToOthers stepNumber={1} last />
      </Demo.Container>
    </Providers>
  )
}
