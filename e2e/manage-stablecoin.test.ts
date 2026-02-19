import { expect, test } from '@playwright/test'

test('manage stablecoin - grant and revoke roles', async ({ page }) => {
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

  await page.goto('/guide/issuance/manage-stablecoin')

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
  // Use label-based selectors to ensure we're filling the right inputs in the demo form
  const nameInput = page.getByLabel('Token name').first()
  await expect(nameInput).toBeVisible()
  await nameInput.fill('ManageTestUSD')

  const symbolInput = page.getByLabel('Token symbol').first()
  await expect(symbolInput).toBeVisible()
  await symbolInput.fill('MANAGE')

  const deployButton = page.getByRole('button', { name: 'Deploy' }).first()
  await expect(deployButton).toBeVisible()
  await deployButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).first()).toBeVisible({
    timeout: 90000,
  })

  // Step 4: Grant issuer role
  const grantEnterDetails = page.getByRole('button', { name: 'Enter details' }).first()
  await expect(grantEnterDetails).toBeVisible()
  await grantEnterDetails.click()

  const grantButton = page.getByRole('button', { name: 'Grant' }).first()
  await expect(grantButton).toBeVisible()
  await grantButton.click()

  await expect(page.getByRole('link', { name: 'View receipt' }).nth(1)).toBeVisible({
    timeout: 90000,
  })

  // Step 5: Revoke issuer role (now the first visible Enter details)
  const revokeEnterDetails = page.getByRole('button', { name: 'Enter details' }).first()
  await expect(revokeEnterDetails).toBeVisible()
  await revokeEnterDetails.click()

  const revokeButton = page.getByRole('button', { name: 'Revoke' }).first()
  await expect(revokeButton).toBeVisible()
  await revokeButton.click()

  // Wait for revoke receipt
  await expect(page.getByRole('link', { name: 'View receipt' }).nth(2)).toBeVisible({
    timeout: 90000,
  })

  // Clean up
  await client.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
})
