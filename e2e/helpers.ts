import { expect, type Locator, type Page } from '@playwright/test'

export function getDemoStep(page: Page, title: string | RegExp): Locator {
  return page.locator('[data-active][data-completed]').filter({ hasText: title }).first()
}

// A failed transaction cannot produce the expected receipt. Surface the UI error
// immediately instead of burning the entire success timeout before a retry.
export async function expectDemoSuccess(page: Page, success: Locator, timeout = 90_000) {
  const errors = page
    .locator('[data-active][data-completed] > div.bg-destructiveTint')
    .filter({ visible: true })
  await expect(success.or(errors).first()).toBeVisible({ timeout })
  expect(await errors.allTextContents(), 'Demo reported a terminal error').toEqual([])
  await expect(success).toBeVisible()
}
