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
