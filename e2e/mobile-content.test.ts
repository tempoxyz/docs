import { expect, test } from '@playwright/test'

for (const width of [320, 375, 393, 430, 1280]) {
  test.describe(`${width}px content`, () => {
    test.use({ viewport: { width, height: 900 } })

    test('MCP panels fit and keep JSON internally scrollable', async ({ page }) => {
      await page.goto('/docs/guide/using-tempo-with-ai', { waitUntil: 'domcontentloaded' })
      const explorer = page.locator('#tempo-mcp-explorer')
      await expect(explorer).toBeVisible()
      const request = explorer.locator('pre').first()
      await expect(request).toContainText('jsonrpc')
      const metrics = await explorer.evaluate((form) => {
        const panel = form.querySelector('pre')
        if (!panel) throw new Error('Expected request JSON')
        const bounds = form.getBoundingClientRect()
        const rect = panel.getBoundingClientRect()
        panel.scrollLeft = panel.scrollWidth
        return {
          panelFits: rect.left >= bounds.left && rect.right <= bounds.right,
          scrollable: panel.scrollWidth <= panel.clientWidth || panel.scrollLeft > 0,
          formFits: bounds.right <= document.documentElement.clientWidth,
        }
      })
      expect(metrics).toEqual({ panelFits: true, scrollable: true, formFits: true })
      expect(
        await page
          .locator('article pre[data-v]')
          .first()
          .evaluate((pre) => getComputedStyle(pre).whiteSpace),
      ).toBe('pre')
    })

    test('all language tabs are reachable inside the article', async ({ page }) => {
      await page.goto('/docs/guide/payments/send-a-payment/examples', {
        waitUntil: 'domcontentloaded',
      })
      const tabs = page
        .locator('article [role="tablist"]')
        .filter({
          has: page.getByRole('tab', { name: 'Solidity', exact: true }),
        })
        .first()
      const solidity = tabs.getByRole('tab', { name: 'Solidity', exact: true })
      await expect(solidity).toBeAttached({ timeout: 30_000 })
      await tabs.evaluate((list) => {
        list.scrollLeft = list.scrollWidth
      })
      await solidity.click()
      await expect(solidity).toHaveAttribute('aria-selected', 'true')
      const fits = await tabs.evaluate((list) => {
        const rect = list.getBoundingClientRect()
        return rect.right <= document.documentElement.clientWidth
      })
      expect(fits).toBe(true)
    })

    test('long prose code wraps while fenced code preserves whitespace', async ({ page }) => {
      await page.goto('/docs/guide/private-zones', { waitUntil: 'domcontentloaded' })
      const callback = page
        .locator('article p code, article li code')
        .filter({
          hasText: 'onWithdrawalReceived(bytes32,address,uint128,bytes)',
        })
        .first()
      await expect(callback).toBeVisible()
      const fits = await callback.evaluate((code) => {
        const article = code.closest('article')?.getBoundingClientRect()
        if (!article) throw new Error('Expected an article')
        const range = document.createRange()
        range.selectNodeContents(code)
        return [...range.getClientRects()].every(
          (rect) => rect.left >= article.left - 1 && rect.right <= article.right + 1,
        )
      })
      expect(fits).toBe(true)
    })
  })
}
