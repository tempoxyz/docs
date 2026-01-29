import { expect, test } from '@playwright/test'

test('create a stablecoin', async ({ page }) => {
  test.setTimeout(120000)

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

  await page.goto('/guide/issuance/create-a-stablecoin')

  // Step 1: Sign up with passkey
  const signUpButton = page.getByRole('button', { name: 'Sign up' }).first()
  await expect(signUpButton).toBeVisible({ timeout: 90000 })
  await signUpButton.click()

  // Wait for sign out button (indicates successful sign up)
  await expect(page.getByRole('button', { name: 'Sign out' }).first()).toBeVisible({
    timeout: 30000,
  })

  // Step 2: Add funds
  const addFundsButton = page.getByRole('button', { name: 'Add funds' }).first()
  await expect(addFundsButton).toBeVisible()
  await addFundsButton.click()

  // Wait for "Add more funds" button (indicates funds were added)
  await expect(page.getByRole('button', { name: 'Add more funds' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 3: Fill in token details and deploy
  const nameInput = page.getByPlaceholder('demoUSD').first()
  await expect(nameInput).toBeVisible()
  await nameInput.fill('TestUSD')

  const symbolInput = page.getByPlaceholder('DEMO').first()
  await expect(symbolInput).toBeVisible()
  await symbolInput.fill('TEST')

  const deployButton = page.getByRole('button', { name: 'Deploy' }).first()
  await deployButton.click()

  // Wait for success - View receipt link
  await expect(page.getByRole('link', { name: 'View receipt' })).toBeVisible({ timeout: 90000 })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
