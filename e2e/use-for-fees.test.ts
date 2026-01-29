import { expect, test } from '@playwright/test'

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

  // Step 1: Sign up with passkey
  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
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
  const nameInput = page.getByPlaceholder('demoUSD').first()
  await expect(nameInput).toBeVisible()
  await nameInput.fill('FeeTestUSD')

  const symbolInput = page.getByPlaceholder('DEMO').first()
  await symbolInput.fill('FEE')

  const deployButton = page.getByRole('button', { name: 'Deploy' }).first()
  await deployButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 4: Grant issuer role
  const grantEnterDetails = page.getByRole('button', { name: 'Enter details' }).first()
  await expect(grantEnterDetails).toBeVisible()
  await grantEnterDetails.click()

  const grantButton = page.getByRole('button', { name: 'Grant' }).first()
  await grantButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(1)).toBeVisible({
    timeout: 90000,
  })

  // Step 5: Mint tokens
  const mintEnterDetails = page.getByRole('button', { name: 'Enter details' }).nth(1)
  await expect(mintEnterDetails).toBeVisible()
  await mintEnterDetails.click()

  const mintButton = page.getByRole('button', { name: 'Mint' }).first()
  await mintButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(2)).toBeVisible({
    timeout: 90000,
  })

  // Step 6: Mint fee AMM liquidity
  const mintLiquidityButton = page.getByRole('button', { name: 'Mint liquidity' }).first()
  await expect(mintLiquidityButton).toBeVisible()
  await mintLiquidityButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(3)).toBeVisible({
    timeout: 90000,
  })

  // Step 7: Send payment using token as fee
  const payEnterDetails = page.getByRole('button', { name: 'Enter details' }).nth(2)
  await expect(payEnterDetails).toBeVisible()
  await payEnterDetails.click()

  const sendButton = page.getByRole('button', { name: 'Send' }).first()
  await expect(sendButton).toBeVisible()
  await sendButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(4)).toBeVisible({
    timeout: 90000,
  })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
