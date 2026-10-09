import { metrics } from '../../../styles/metrics'
import { style } from '../../../styles/recipes'
export const reveal = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingInline: metrics.spacing['5'],
  textAlign: 'center',
})
export const blogSectionHeading = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(2rem, 6vw, 3rem)',
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const blogSectionDescription = style({
  marginTop: metrics.spacing['6'],
  maxWidth: '560px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.4,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  '@media (width >= 64rem)': {
    fontSize: '20px',
  },
})
export const blogSectionText = style({
  color: 'var(--foreground)',
})
export const reveal2 = style({
  marginTop: metrics.spacing['16'],
})
export const link = style({
  display: 'grid',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--line)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-block)',
      },
    },
  },
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const blogSectionLayout = style({
  position: 'relative',
  height: '200px',
  overflow: 'hidden',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  '@media (width >= 64rem)': {
    order: 2,
    height: 'auto',
    minHeight: '280px',
    borderBottomStyle: 'solid',
    borderBottomWidth: '0px',
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
  },
})
export const blogSectionLayout2 = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: metrics.spacing['4'],
  padding: metrics.spacing['6'],
  '@media (width >= 64rem)': {
    order: 1,
    padding: metrics.spacing['10'],
  },
})
export const blogSectionHeading2 = style({
  maxWidth: '480px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(1.5rem, 3.5vw, 2.125rem)',
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const blogSectionDescription2 = style({
  maxWidth: '480px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '15px',
  lineHeight: 1.55,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
})
export const blogSectionDescription3 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  letterSpacing: '0.02em',
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
  textTransform: 'uppercase',
})
export const blogSectionLayout3 = style({
  position: 'relative',
  marginTop: '-1px',
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
})
export const link2 = style({
  display: 'flex',
  flexDirection: 'column',
  gap: metrics.spacing['2'],
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['5'],
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-block)',
      },
    },
  },
  '@media (width >= 64rem)': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: metrics.spacing['12'],
    paddingInline: metrics.spacing['8'],
  },
})
export const blogSectionText2 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  letterSpacing: '0',
  color: 'var(--foreground)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
})
export const blogSectionText3 = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: metrics.spacing['3'],
})
export const blogSectionText4 = style({
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '12px',
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap',
  color: 'color-mix(in oklab, var(--foreground) 40%, transparent)',
  textTransform: 'uppercase',
})
export const link3 = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['5'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  letterSpacing: '0',
  color: 'var(--foreground)',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-block)',
      },
    },
  },
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['8'],
  },
})
