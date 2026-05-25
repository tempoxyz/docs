import type { Locator, Page } from '@playwright/test'

export function getDemoStep(page: Page, title: string | RegExp): Locator {
  return page.locator('[data-active][data-completed]').filter({ hasText: title }).first()
}
