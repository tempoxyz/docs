import { expect, test } from '@playwright/test'

test('manage fee liquidity', async ({ page }) => {
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

  await page.goto('/guide/stablecoin-dex/managing-fee-liquidity')

  // Step 1: Sign up with passkey
  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  await signUpButton.click()

  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 60000,
  })

  // Step 2: Add funds
  const addFundsButton = page.getByRole('button', { name: 'Add funds' }).first()
  await expect(addFundsButton).toBeVisible()
  await addFundsButton.click()

  await expect(page.getByRole('button', { name: 'Add more funds' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 3: Create or load token
  const nameInput = page.getByLabel('Token name').first()
  await expect(nameInput).toBeVisible()
  await nameInput.fill('FeeLiquidityUSD')

  const symbolInput = page.getByLabel('Token symbol').first()
  await expect(symbolInput).toBeVisible()
  await symbolInput.fill('FEELIQ')

  const deployButton = page.getByRole('button', { name: 'Deploy' }).first()
  await expect(deployButton).toBeVisible()
  await deployButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 4: Add liquidity (mint)
  const addLiquidityButton = page.getByRole('button', { name: 'Add Liquidity' }).first()
  await expect(addLiquidityButton).toBeVisible()
  await addLiquidityButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(1)).toBeVisible({
    timeout: 90000,
  })

  // Step 5: Check pool (no action needed, pool info should be visible after adding liquidity)
  // The pool data is displayed inline; just wait a moment for it to update
  await page.waitForTimeout(2000)

  // Step 6: Burn liquidity
  const burnLiquidityButton = page.getByRole('button', { name: 'Burn Liquidity' }).first()
  await expect(burnLiquidityButton).toBeVisible({ timeout: 30000 })
  await burnLiquidityButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(2)).toBeVisible({
    timeout: 90000,
  })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
