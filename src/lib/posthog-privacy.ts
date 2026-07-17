import type { PostHogConfig } from 'posthog-js'

/**
 * Session replay stays disabled on every surface that shares PostHogSetup,
 * including docs, developers, and docs routes proxied through tempo.xyz.
 * The remaining options fail closed if replay is ever enabled accidentally.
 */
export const POSTHOG_REPLAY_PRIVACY_CONFIG = {
  disable_session_recording: true,
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
} satisfies Partial<PostHogConfig>
