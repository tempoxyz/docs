import { describe, expect, it } from 'vitest'
import { POSTHOG_REPLAY_PRIVACY_CONFIG } from './posthog-privacy'

describe('PostHog replay privacy', () => {
  it('keeps session replay disabled for every shared browser surface', () => {
    expect(POSTHOG_REPLAY_PRIVACY_CONFIG.disable_session_recording).toBe(true)
  })

  it('fails closed if session replay is enabled accidentally', () => {
    expect(POSTHOG_REPLAY_PRIVACY_CONFIG).toMatchObject({
      capture_performance: { network_timing: false },
      enable_recording_console_log: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '*',
        blockSelector: '[data-ph-sensitive]',
        recordHeaders: false,
        recordBody: false,
        captureCanvas: { recordCanvas: false },
        collectFonts: false,
      },
    })
  })
})
