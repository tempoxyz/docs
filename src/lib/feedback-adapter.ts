import { PostHog } from 'posthog-node'
import { Feedback } from 'vocs/config'
import { POSTHOG_EVENTS, POSTHOG_PROPERTIES } from './posthog'

type FeedbackData = {
  helpful: boolean
  category?: string | undefined
  message?: string | undefined
  pageUrl: string
  timestamp: string
}

export function createFeedbackAdapter() {
  const slackAdapter = Feedback.slack()

  const posthogKey = process.env.VITE_POSTHOG_KEY
  const posthogHost = process.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

  const posthog = posthogKey ? new PostHog(posthogKey, { host: posthogHost }) : null

  return Feedback.from({
    type: 'slack+posthog',
    async submit(data: FeedbackData) {
      const slackPromise = slackAdapter.submit(data)

      const posthogPromise = (async () => {
        if (!posthog) return

        let pagePath: string | undefined
        try {
          pagePath = new URL(data.pageUrl).pathname
        } catch {
          pagePath = undefined
        }

        const distinctId = `docs_feedback_${Date.now()}_${Math.random().toString(36).slice(2)}`
        const ts = data.timestamp ? new Date(data.timestamp) : undefined

        const commonProperties = {
          [POSTHOG_PROPERTIES.FEEDBACK_HELPFUL]: data.helpful,
          [POSTHOG_PROPERTIES.FEEDBACK_CATEGORY]: data.category,
          [POSTHOG_PROPERTIES.FEEDBACK_MESSAGE]: data.message,
          [POSTHOG_PROPERTIES.FEEDBACK_PAGE_URL]: data.pageUrl,
          [POSTHOG_PROPERTIES.PAGE_PATH]: pagePath,
          [POSTHOG_PROPERTIES.SITE]: 'docs',
        }

        posthog.capture({
          distinctId,
          event: POSTHOG_EVENTS.FEEDBACK_SUBMITTED,
          properties: commonProperties,
          timestamp: ts,
        })

        posthog.capture({
          distinctId,
          event: data.helpful
            ? POSTHOG_EVENTS.FEEDBACK_HELPFUL
            : POSTHOG_EVENTS.FEEDBACK_NOT_HELPFUL,
          properties: commonProperties,
          timestamp: ts,
        })

        await posthog.flush()
      })().catch(() => {})

      await Promise.allSettled([slackPromise, posthogPromise])
    },
  })
}
