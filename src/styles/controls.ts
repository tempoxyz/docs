import { inherited } from './inherited'
import { vars as tokens, variants } from './theme'

// Shared controls use the component contract; caller layout recipes override them.
export const button = variants({
  base: {
    position: 'relative',
    display: 'inline-flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing['2'],
    whiteSpace: 'nowrap',
    // G8: TDS Platform buttons, a little rounder than before, with smooth corners.
    borderRadius: tokens.radius.md,
    '--corner-radius': tokens.radius.md,
    borderWidth: tokens.borderWidth.hairline,
    borderStyle: 'solid',
    borderColor: 'transparent !custom',
    fontWeight: tokens.fontWeight.medium,
    transitionProperty: 'color, background-color, border-color, opacity, transform',
    transitionDuration: 'var(--tempo-exit)',
    transitionTimingFunction: 'var(--tempo-ease)',
    ':hover': { transitionDuration: 'var(--tempo-enter)' },
    ':focus-visible': {
      outlineWidth: tokens.borderWidth.emphasis,
      outlineStyle: 'solid',
      outlineColor: tokens.color.accent,
      outlineOffset: '3px',
    },
    ':disabled': { pointerEvents: 'none', cursor: 'default', opacity: 0.5 },
    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
  },
  defaultVariants: { size: 'default', variant: 'default' },
  variants: {
    size: {
      default: {
        minHeight: '40px', // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
        paddingBlock: tokens.spacing['2'],
        paddingInline: tokens.spacing['4'],
        fontSize: tokens.fontSize.sm, // design-exception: Preserve the optical typography of this specific surface.
        lineHeight: tokens.lineHeight.control,
      },
    },
    disabled: { false: {}, true: { pointerEvents: 'none', opacity: 0.5 } },
    static: { false: {}, true: { pointerEvents: 'none', cursor: 'default' } },
    variant: {
      accent: {
        backgroundColor: inherited.color.backgroundColorInvert,

        color: inherited.color.textColorInvert,
        '@media (hover: hover)': { ':hover': { opacity: 0.9 } },
      },
      // Secondary: the Platform gray fill, no outline.
      default: {
        backgroundColor: tokens.color.container,

        color: inherited.color.textColorPrimary,
        '@media (hover: hover)': {
          ':hover': {
            backgroundColor: tokens.color.containerStrong,
          },
        },
      },
      destructive: {
        backgroundColor: inherited.color.backgroundColorDestructiveTint,

        color: inherited.color.textColorDestructive,
        '@media (hover: hover)': { ':hover': { opacity: 0.9 } },
      },
    },
  },
})
