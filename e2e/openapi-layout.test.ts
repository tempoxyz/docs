import { expect, test } from '@playwright/test'

test.use({ viewport: { height: 1000, width: 1960 } })

test('centers the API overview and authored guides while preserving full-width endpoint references', async ({
  page,
}) => {
  await page.goto('/docs/api')

  const overviewLayout = page.locator('[data-layout][data-v-sidebar]')
  const overview = overviewLayout.locator('[data-v-openapi-landing]')
  const overviewMain = overviewLayout.locator(':scope > [data-v-main]')

  await expect(overviewLayout).not.toHaveAttribute('data-v-content-width', 'full')
  await expect(overview).toBeVisible()

  const [overviewBox, overviewMainBox, overviewMainPaddingRight] = await Promise.all([
    overview.boundingBox(),
    overviewMain.boundingBox(),
    overviewMain.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingRight)),
  ])

  expect(overviewBox).not.toBeNull()
  expect(overviewMainBox).not.toBeNull()
  if (!overviewBox || !overviewMainBox) throw new Error('Expected the API overview to render')

  const overviewCenter = overviewBox.x + overviewBox.width / 2
  const overviewReadableAreaCenter =
    overviewMainBox.x + (overviewMainBox.width - overviewMainPaddingRight) / 2
  expect(Math.abs(overviewCenter - overviewReadableAreaCenter)).toBeLessThanOrEqual(1)

  await page.goto('/docs/api/indexer-api')

  const guideLayout = page.locator('[data-layout][data-v-sidebar]')
  const guide = guideLayout.locator('[data-v-openapi-guide]')
  const main = guideLayout.locator(':scope > [data-v-main]')

  await expect(guideLayout).not.toHaveAttribute('data-v-content-width', 'full')
  await expect(guide).toBeVisible()

  const [guideBox, mainBox, mainPaddingRight] = await Promise.all([
    guide.boundingBox(),
    main.boundingBox(),
    main.evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingRight)),
  ])

  expect(guideBox).not.toBeNull()
  expect(mainBox).not.toBeNull()
  if (!guideBox || !mainBox) throw new Error('Expected the guide and main content to render')

  const guideCenter = guideBox.x + guideBox.width / 2
  const readableAreaCenter = mainBox.x + (mainBox.width - mainPaddingRight) / 2
  expect(Math.abs(guideCenter - readableAreaCenter)).toBeLessThanOrEqual(1)

  await page.goto('/docs/api/authentication')

  const referenceLayout = page.locator('[data-layout][data-v-sidebar]')
  const operation = referenceLayout.locator('[data-v-openapi-operation]').first()
  const playground = operation.locator('[data-v-openapi-operation-aside]')

  await expect(referenceLayout).toHaveAttribute('data-v-content-width', 'full')
  await expect(playground).toBeVisible()

  const [operationBox, playgroundBox] = await Promise.all([
    operation.boundingBox(),
    playground.boundingBox(),
  ])

  expect(operationBox).not.toBeNull()
  expect(playgroundBox).not.toBeNull()
  if (!operationBox || !playgroundBox) throw new Error('Expected the API operation to render')

  expect(playgroundBox.x).toBeGreaterThan(operationBox.x + operationBox.width / 2)
})
