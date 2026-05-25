import { expect, test } from '@playwright/test'
import { getDemoStep } from './helpers'

test('use stablecoin for fees', async ({ page }) => {
  test.setTimeout(240000)

  // Set up virtual authenticator via CDP
  const client = await page.context().newCDPSession(page)
  await client.send('WebAuthn.enable')
  const { authenticatorId } = await client.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  })

  await page.goto('/guide/issuance/use-for-fees')

  // Step 1: Sign in
  const signUpButton = page.getByRole('button', { name: 'Sign in' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })

  // Step 2: Add funds
  const addFundsButton = page.getByRole('button', { name: 'Add funds' }).first()
  await expect(addFundsButton).toBeVisible()
  await addFundsButton.click()

  await expect(page.getByRole('button', { name: 'Add more funds' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 3: Create a token
  // Use label-based selectors to ensure we're filling the right inputs in the demo form
  const nameInput = page.getByLabel('Token name').first()
  await expect(nameInput).toBeVisible()
  await nameInput.fill('FeeTestUSD')

  const symbolInput = page.getByLabel('Token symbol').first()
  await expect(symbolInput).toBeVisible()
  await symbolInput.fill('FEE')

  const deployButton = page.getByRole('button', { name: 'Deploy' }).first()
  await expect(deployButton).toBeVisible()
  await deployButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 4: Grant issuer role
  const grantStep = getDemoStep(page, 'Grant issuer role on FeeTestUSD.')
  const grantEnterDetails = grantStep.getByRole('button', { name: 'Enter details' })
  await expect(grantEnterDetails).toBeVisible()
  await grantEnterDetails.click()

  const grantButton = grantStep.getByRole('button', { name: 'Grant' })
  await grantButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(1)).toBeVisible({
    timeout: 90000,
  })

  // Step 5: Mint tokens
  const mintStep = getDemoStep(page, 'Mint 100 FeeTestUSD to yourself.')
  const mintEnterDetails = mintStep.getByRole('button', { name: 'Enter details' })
  await expect(mintEnterDetails).toBeVisible()
  await mintEnterDetails.click()

  const mintButton = mintStep.getByRole('button', { name: 'Mint' })
  await mintButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(2)).toBeVisible({
    timeout: 90000,
  })

  // Step 6: Add fee AMM liquidity
  const addLiquidityButton = page.getByRole('button', { name: 'Add Liquidity' }).first()
  await expect(addLiquidityButton).toBeVisible()
  await addLiquidityButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(3)).toBeVisible({
    timeout: 90000,
  })

  // Step 7: Send payment using token as fee
  const payStep = getDemoStep(page, 'Send 100 AlphaUSD and pay fees in FeeTestUSD.')
  const payEnterDetails = payStep.getByRole('button', { name: 'Enter details' })
  await expect(payEnterDetails).toBeVisible()
  await payEnterDetails.click()

  const sendButton = payStep.getByRole('button', { name: 'Send' })
  await expect(sendButton).toBeVisible()
  await sendButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(4)).toBeVisible({
    timeout: 90000,
  })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
