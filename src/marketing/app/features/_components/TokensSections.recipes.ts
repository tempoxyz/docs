import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const storyPointsListList = style({
  display: 'grid',
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
})
export const storyPointsListList2 = style({
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
})
export const storyPointsListText = style({
  marginTop: metrics.spacing['0_5'],
  width: metrics.spacing['5'],
  height: metrics.spacing['5'],
  flexShrink: 0,
})
export const storyPointsListHeading = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '18px',
  lineHeight: 1.2,
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const storyPointsListDescription = style({
  marginTop: metrics.spacing['2'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  lineHeight: 1.45,
  letterSpacing: '0',
})
export const storyPointsListDescription2 = style({
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
})
export const storyPointsListDescription3 = style({
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
      },
    },
  },
})
export const storyPointsListItem = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
  '@media (width >= 40rem)': {
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomWidth: '0px',
    selectors: {
      '&:last-child': {
        borderRightStyle: 'solid',
        borderRightWidth: '0px',
      },
    },
  },
  '@media (width >= 64rem)': {
    borderRightStyle: 'solid',
    borderRightWidth: '0px',
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    selectors: {
      '&:last-child': {
        borderBottomStyle: 'solid',
        borderBottomWidth: '0px',
      },
    },
  },
})
export const storyPointsListButton = style({
  display: 'flex',
  height: '100%',
  width: '100%',
  alignItems: 'flex-start',
  gap: metrics.spacing['4'],
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['6'],
  textAlign: 'left',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['12'],
  },
})
export const storyPointsListButton2 = style({
  backgroundColor: 'var(--surface-block)',
})
export const storyPointsListButton3 = style({
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-block)',
      },
    },
  },
})
export const storyPointsListLayout = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: metrics.spacing['4'],
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['6'],
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['12'],
  },
})
export const storySectionSection2 = style({
  scrollMarginTop: metrics.spacing['12'],
})
export const storySectionSection = style({
  marginTop: '140px',
})
export const reveal = style({
  position: 'relative',
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
})
export const storySectionLayout = style({
  display: 'grid',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-shell)',
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const storySectionLayout2 = style({
  display: 'flex',
  flexDirection: 'column',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  textAlign: 'left',
  '@media (width >= 64rem)': {
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomWidth: '0px',
  },
})
export const storySectionLayout3 = style({
  display: 'flex',
  flex: '1 1 0%',
  flexDirection: 'column',
  justifyContent: 'center',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['14'],
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['12'],
    paddingBlock: metrics.spacing['20'],
  },
})
export const storySectionHeading = style({
  maxWidth: '620px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
  lineHeight: 1.08,
  letterSpacing: '-0.03em',
  textWrap: 'balance',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const storySectionDescription = style({
  marginTop: metrics.spacing['6'],
  maxWidth: '620px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.5,
  letterSpacing: '0',
  textWrap: 'balance',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
})
export const storySectionLayout4 = style({
  marginTop: metrics.spacing['9'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: metrics.spacing['2_5'],
})
export const storySectionLayout5 = style({
  position: 'relative',
  '@media (width >= 64rem)': {
    minHeight: '620px',
  },
})
export const storySectionLayout6 = style({
  position: 'absolute',
  right: metrics.spacing['5'],
  bottom: metrics.spacing['5'],
  zIndex: 20,
  '@media (width >= 64rem)': {
    right: metrics.spacing['8'],
    bottom: metrics.spacing['8'],
  },
})
export const storySectionLayout7 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  '@media (width >= 64rem)': {
    position: 'absolute',
    inset: '0',
    minHeight: '0',
  },
})
export const storySectionLayout8 = style({
  display: 'grid',
  '@media (width >= 64rem)': {
    height: '100%',
    minHeight: '0',
  },
})
export const storySectionLayout9 = style({
  gridArea: '1/1',
})
export const storySectionLayout10 = style({
  display: 'none',
})
export const storySectionLayout11 = style({
  display: 'flex',
  minHeight: '420px',
  alignItems: 'center',
  justifyContent: 'center',
  padding: metrics.spacing['6'],
  paddingBottom: metrics.spacing['20'],
  '@media (width >= 64rem)': {
    height: '100%',
    minHeight: '0',
    padding: metrics.spacing['10'],
    paddingBottom: metrics.spacing['24'],
  },
})
export const storySectionLayout12 = style({
  width: '100%',
  maxWidth: '560px',
})
export const storyPointsListStateState = style({
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const storyPointsListStateState2 = style({
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
})
export const storyPointsListTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-backgroundImage': values.value0,
  backgroundImage: 'var(--tempo-backgroundImage)',
  backgroundSize: '5px 5px',
}))
