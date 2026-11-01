import { expect, type Locator, type Page } from '@playwright/test'

// Vocs renders tabs on the server, so they are visible before hydration attaches their
// click handlers. Retry until the tab is selected; an early click is a no-op.
export async function selectTab(tab: Locator) {
  await expect(async () => {
    await tab.click()
    await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 1000 })
  }).toPass({ timeout: 30_000 })
}

export function getDemoStep(page: Page, title: string | RegExp): Locator {
  return page.locator('[data-active][data-completed]').filter({ hasText: title }).first()
}

// A failed transaction cannot produce the expected receipt. Surface the UI error
// immediately instead of burning the entire success timeout before a retry.
export async function expectDemoSuccess(page: Page, success: Locator, timeout = 90_000) {
  // Match the step's ARIA role, not its styling classes, which change with design migrations.
  const errors = page
    .locator('[data-active][data-completed] > [role="alert"]')
    .filter({ visible: true })
  await expect(success.or(errors).first()).toBeVisible({ timeout })
  expect(await errors.allTextContents(), 'Demo reported a terminal error').toEqual([])
  await expect(success).toBeVisible()
}
