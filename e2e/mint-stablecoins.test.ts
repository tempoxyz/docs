import { expect, test } from '@playwright/test'

test('mint stablecoins', async ({ page }) => {
  test.setTimeout(180000)

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

  await page.goto('/guide/issuance/mint-stablecoins')

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

  // Step 3: Create a token (fill form and deploy)
  const nameInput = page.getByPlaceholder('demoUSD').first()
  await expect(nameInput).toBeVisible()
  await nameInput.fill('MintTestUSD')

  const symbolInput = page.getByPlaceholder('DEMO').first()
  await symbolInput.fill('MINT')

  const deployButton = page.getByRole('button', { name: 'Deploy' }).first()
  await deployButton.click()

  // Wait for token to be created (View receipt appears)
  await expect(page.getByRole('link', { name: 'View receipt' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 4: Grant issuer role - click "Enter details" then "Grant"
  const grantEnterDetails = page.getByRole('button', { name: 'Enter details' }).first()
  await expect(grantEnterDetails).toBeVisible()
  await grantEnterDetails.click()

  const grantButton = page.getByRole('button', { name: 'Grant' }).first()
  await expect(grantButton).toBeVisible()
  await grantButton.click()

  // Wait for grant receipt
  await expect(page.getByRole('link', { name: 'View receipt' }).nth(1)).toBeVisible({
    timeout: 90000,
  })

  // Step 5: Mint tokens - click "Enter details" then "Mint"
  const mintEnterDetails = page.getByRole('button', { name: 'Enter details' }).nth(1)
  await expect(mintEnterDetails).toBeVisible()
  await mintEnterDetails.click()

  const mintButton = page.getByRole('button', { name: 'Mint' }).first()
  await expect(mintButton).toBeVisible()
  await mintButton.click()

  // Wait for mint receipt
  await expect(page.getByRole('link', { name: 'View receipt' }).nth(2)).toBeVisible({
    timeout: 90000,
  })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
