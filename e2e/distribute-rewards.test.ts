import { expect, test } from '@playwright/test'

test('distribute rewards', async ({ page }) => {
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

  await page.goto('/guide/issuance/distribute-rewards')

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
  await nameInput.fill('RewardTestUSD')

  const symbolInput = page.getByPlaceholder('DEMO').first()
  await symbolInput.fill('REWARD')

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

  // Step 6: Opt in to rewards
  const optInButton = page.getByRole('button', { name: 'Opt In' }).first()
  await expect(optInButton).toBeVisible()
  await optInButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(3)).toBeVisible({
    timeout: 90000,
  })

  // Step 7: Start reward
  const startButton = page.getByRole('button', { name: 'Start' }).first()
  await expect(startButton).toBeVisible()
  await startButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(4)).toBeVisible({
    timeout: 90000,
  })

  // Step 8: Claim reward
  const claimButton = page.getByRole('button', { name: 'Claim' }).first()
  await expect(claimButton).toBeVisible()
  await claimButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(5)).toBeVisible({
    timeout: 90000,
  })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
