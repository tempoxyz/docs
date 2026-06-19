import { Feedback } from 'vocs/config'
import { submitFeedback } from './feedback'

type VocsFeedbackData = {
  helpful: boolean
  category?: string | undefined
  message?: string | undefined
  pageUrl: string
  timestamp: string
}

export function createFeedbackAdapter() {
  return Feedback.from({
    type: 'tempo-feedback',
    async submit(data: VocsFeedbackData) {
      await submitFeedback({
        source: 'docs',
        helpful: data.helpful,
        category: data.category,
        message: data.message,
        pageUrl: data.pageUrl,
        timestamp: data.timestamp,
      })
    },
  })
}
