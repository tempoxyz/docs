import { expect, test } from '@playwright/test'

test.describe('documentation without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('keeps the native skip link on a proxied /developers page', async ({ page, baseURL }) => {
    const path = '/docs/api/indexer-api'
    // Serve the unmounted docs response at its public URL, as the production proxy does.
    await page.route(`**/developers${path}`, async (route) => {
      const response = await route.fetch({ url: `${baseURL}${path}` })
      await route.fulfill({ response })
    })
    await page.goto(`/developers${path}`)
    const skip = page.getByRole('link', { name: 'Skip to content', exact: true })
    await expect(skip).toHaveAttribute('href', '#vocs-content')
    await skip.focus()
    await expect(skip).toHaveCSS('opacity', '1')
    await expect(skip).toHaveCSS('pointer-events', 'auto')
    await expect(skip).toHaveCSS('translate', /^0px(?: 0px)?$/)
    await skip.press('Enter')
    await expect(page).toHaveURL(new RegExp(`/developers${path}#vocs-content$`))
    // Native fragment navigation moves the sequential keyboard starting point
    // into main even though main itself is not a tab stop.
    await page.keyboard.press('Tab')
    await expect(page.locator('#vocs-content :focus')).toHaveCount(1)
  })

  test('keeps the indexer example readable before the interactive editor loads', async ({
    page,
    request,
  }) => {
    await page.goto('/docs/api/indexer-api')

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(
      page
        .locator('main pre code')
        .filter({
          hasText: /^SELECT num, hash, timestamp\nFROM blocks\nORDER BY num DESC\nLIMIT 5$/,
        })
        .filter({ visible: true }),
    ).toHaveText('SELECT num, hash, timestamp\nFROM blocks\nORDER BY num DESC\nLIMIT 5')

    const markdownUrl = await page
      .locator('link[rel="alternate"][type="text/markdown"]')
      .getAttribute('href')
    expect(markdownUrl).toBeTruthy()
    // Exercise the linked local artifact rather than the production deployment.
    const artifactPath = new URL(markdownUrl as string).pathname.replace(/^\/developers/, '')
    const markdown = await request.get(artifactPath)
    expect(markdown.ok()).toBe(true)
    // The local Node preview uses octet-stream for .md; Vercel serves
    // text/markdown. Verify the linked artifact itself in this local suite.
    expect(await markdown.text()).toContain('\n# Tempo Indexer API\n')
  })
})

test('names the faucet fee-token control when its wallet tab is opened', async ({ page }) => {
  await page.goto('/docs/quickstart/faucet')
  const tab = page.getByRole('tab', { name: 'Fund your wallet', exact: true })
  await expect(tab).toBeVisible({ timeout: 90000 })
  await tab.click()
  await expect(page.getByRole('combobox', { name: 'Fee token', exact: true })).toHaveCount(1)
})
