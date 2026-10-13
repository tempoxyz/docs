import { keyframes } from 'zyzz/web'
import { inherited } from './inherited'

export const navActivePixel = keyframes({
  '0%': {
    opacity: 0,
    scale: 0,
  },
  '55%': {
    opacity: 1,
    scale: 1.4,
  },
  '100%': {
    opacity: 1,
    scale: 1,
  },
})

export const indicatorFlow = keyframes({
  '0%': {
    backgroundPosition: '0% 50%',
  },
  '100%': {
    backgroundPosition: '100% 50%',
  },
})

export const ripple = keyframes({
  from: {
    scale: 1,
    opacity: 0.5,
  },
  to: {
    scale: 1.45,
    opacity: 0,
  },
})

export const laneFlow = keyframes({
  to: {
    strokeDashoffset: -188,
  },
})

export const diagramFlow = keyframes({
  to: {
    strokeDashoffset: -40,
  },
})

export const zoneBreathe = keyframes({
  from: {
    opacity: 0.07,
  },
  to: {
    opacity: 0.12,
  },
})

export const blockIn = keyframes({
  from: {
    scale: 0.85,
  },
})

export const buildFill = keyframes({
  from: {
    transform: 'scaleX(0)',
  },
  to: {
    transform: 'scaleX(1)',
  },
})

export const settleFlash = keyframes({
  from: {
    backgroundColor: inherited.color.colorMixInSrgbIndicatorGreen28SurfaceShell,
  },
})

export const pulse = keyframes({ '50%': { opacity: 0.5 } })
