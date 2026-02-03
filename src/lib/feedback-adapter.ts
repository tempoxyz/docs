import { Feedback } from 'vocs/config'
import { PostHog } from 'posthog-node'
import { POSTHOG_EVENTS, POSTHOG_PROPERTIES } from './posthog'

type FeedbackData = {
  helpful: boolean
  category?: string | undefined
  message?: string | undefined
  pageUrl: string
  timestamp: string
}

/**
 * Creates a combined feedback adapter that sends to both Slack and PostHog.
 *
 * PostHog events captured:
 * - docs_feedback_submitted: All feedback submissions
 * - docs_feedback_helpful: When user marks page as helpful
 * - docs_feedback_not_helpful: When user marks page as not helpful
 */
export function createFeedbackAdapter() {
  const slackAdapter = Feedback.slack()

  const posthogKey = process.env['VITE_POSTHOG_KEY']
  const posthogHost = process.env['VITE_POSTHOG_HOST'] || 'https://us.i.posthog.com'

  const posthog = posthogKey
    ? new PostHog(posthogKey, { host: posthogHost })
    : null

  return Feedback.from({
    type: 'slack+posthog',
    async submit(data: FeedbackData) {
      const promises: Promise<void>[] = []

      // Send to Slack
      promises.push(slackAdapter.submit(data))

      // Send to PostHog
      if (posthog) {
        const distinctId = `docs_feedback_${Date.now()}_${Math.random().toString(36).slice(2)}`

        const commonProperties = {
          [POSTHOG_PROPERTIES.FEEDBACK_HELPFUL]: data.helpful,
          [POSTHOG_PROPERTIES.FEEDBACK_CATEGORY]: data.category,
          [POSTHOG_PROPERTIES.FEEDBACK_MESSAGE]: data.message,
          [POSTHOG_PROPERTIES.FEEDBACK_PAGE_URL]: data.pageUrl,
          [POSTHOG_PROPERTIES.PAGE_PATH]: new URL(data.pageUrl).pathname,
          [POSTHOG_PROPERTIES.SITE]: 'docs',
          timestamp: data.timestamp,
        }

        // Capture main feedback event
        posthog.capture({
          distinctId,
          event: POSTHOG_EVENTS.FEEDBACK_SUBMITTED,
          properties: commonProperties,
        })

        // Capture sentiment-specific event for easier filtering
        posthog.capture({
          distinctId,
          event: data.helpful
            ? POSTHOG_EVENTS.FEEDBACK_HELPFUL
            : POSTHOG_EVENTS.FEEDBACK_NOT_HELPFUL,
          properties: commonProperties,
        })

        promises.push(posthog.flush().then(() => {}))
      }

      await Promise.all(promises)
    },
  })
}
