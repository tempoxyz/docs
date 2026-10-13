import { expect, test } from '@playwright/test'
import { expectDemoSuccess } from './helpers'

test('accepts a successful demo action', async ({ page }) => {
  await page.setContent('<button>Add more funds</button>')
  await expectDemoSuccess(page, page.getByRole('button', { name: 'Add more funds' }))
})

test('fails promptly when a demo reports a terminal error', async ({ page }) => {
  test.setTimeout(5_000)
  await page.setContent(
    '<div data-active data-completed><div class="bg-destructiveTint">Socket closed</div></div>',
  )
  await expect(
    expectDemoSuccess(page, page.getByRole('link', { name: 'View receipt' }), 60_000),
  ).rejects.toThrow('Demo reported a terminal error')
})

test('rejects a demo error even when a success indicator is also visible', async ({ page }) => {
  await page.setContent(
    '<button>Add more funds</button><div data-active data-completed><div class="bg-destructiveTint">Socket closed</div></div>',
  )
  await expect(
    expectDemoSuccess(page, page.getByRole('button', { name: 'Add more funds' })),
  ).rejects.toThrow('Demo reported a terminal error')
})

test('ignores hidden error content when the demo succeeds', async ({ page }) => {
  await page.setContent(
    '<button>Add more funds</button><div data-active data-completed hidden><div class="bg-destructiveTint">Socket closed</div></div>',
  )
  await expectDemoSuccess(page, page.getByRole('button', { name: 'Add more funds' }))
})

test('does not mistake destructive action buttons for errors', async ({ page }) => {
  await page.setContent(
    '<div data-active data-completed><header><button class="bg-destructiveTint">Sign out</button></header><button>Add more funds</button></div>',
  )
  await expectDemoSuccess(page, page.getByRole('button', { name: 'Add more funds' }))
})
