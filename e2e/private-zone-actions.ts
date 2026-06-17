import { expect, type Locator } from '@playwright/test'

type Action = {
  locator: Locator
  name: string
}

export async function waitForEnabledAction(actions: Action[], timeout = 120000) {
  await expect
    .poll(
      async () => {
        for (const action of actions) {
          const visible = await action.locator.isVisible().catch(() => false)
          if (!visible) continue

          const enabled = await action.locator.isEnabled().catch(() => false)
          if (enabled) return action.name
        }

        return ''
      },
      { timeout },
    )
    .not.toBe('')

  for (const action of actions) {
    const visible = await action.locator.isVisible().catch(() => false)
    const enabled = await action.locator.isEnabled().catch(() => false)
    if (visible && enabled) return action
  }

  throw new Error('No enabled action found')
}

export async function authorizeAndWaitForEnabledAction(
  authorizeAction: Action,
  actions: Action[],
  timeout = 120000,
) {
  const deadline = Date.now() + timeout

  await expect(authorizeAction.locator).toBeVisible({ timeout: 30000 })
  await expect(authorizeAction.locator).toBeEnabled({
    timeout: Math.min(90000, timeout),
  })

  while (Date.now() < deadline) {
    const enabledAction = await getEnabledAction(actions)
    if (enabledAction) return enabledAction

    const authorizeVisible = await authorizeAction.locator.isVisible().catch(() => false)
    const authorizeEnabled = await authorizeAction.locator.isEnabled().catch(() => false)
    if (authorizeVisible && authorizeEnabled) await authorizeAction.locator.click()

    await sleep(Math.min(1000, Math.max(deadline - Date.now(), 0)))
  }

  const enabledAction = await getEnabledAction(actions)
  if (enabledAction) return enabledAction

  throw new Error('No enabled action found after authorizing zone reads')
}

async function getEnabledAction(actions: Action[]) {
  for (const action of actions) {
    const visible = await action.locator.isVisible().catch(() => false)
    if (!visible) continue

    const enabled = await action.locator.isEnabled().catch(() => false)
    if (enabled) return action
  }

  return undefined
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}
