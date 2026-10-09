import { style as instanceStyle } from 'zyzz'
import { metrics } from '../../../../styles/metrics'
import { style } from '../../../../styles/recipes'
export const accessKeysSectionSection = style({
  marginTop: '140px',
  scrollMarginTop: metrics.spacing['12'],
})
export const reveal = style({
  position: 'relative',
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
})
export const accessKeysSectionLayout = style({
  display: 'grid',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const accessKeysSectionLayout2 = style({
  position: 'relative',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  '@media (width >= 64rem)': {
    minHeight: '0',
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomWidth: '0px',
  },
})
export const accessKeysSectionLayout3 = style({
  position: 'absolute',
  right: metrics.spacing['5'],
  bottom: metrics.spacing['5'],
  zIndex: 20,
  '@media (width >= 64rem)': {
    right: metrics.spacing['8'],
    bottom: metrics.spacing['8'],
  },
})
export const accessKeysSectionLayout4 = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  '@media (width >= 64rem)': {
    position: 'absolute',
    inset: '0',
    minHeight: '0',
  },
})
export const accessKeysSectionLayout5 = style({
  display: 'grid',
  '@media (width >= 64rem)': {
    height: '100%',
    minHeight: '0',
  },
})
export const accessKeysSectionLayout6 = style({
  gridArea: '1/1',
})
export const accessKeysSectionLayout7 = style({
  display: 'none',
})
export const accessKeysSectionLayout8 = style({
  display: 'flex',
  minHeight: '520px',
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
export const accessKeysSectionLayout9 = style({
  width: '100%',
  maxWidth: '600px',
})
export const accessKeysSectionLayout10 = style({
  backgroundColor: 'var(--surface-shell)',
})
export const accessKeysSectionLayout11 = style({
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['14'],
  '@media (width >= 64rem)': {
    paddingInline: metrics.spacing['12'],
    paddingBlock: metrics.spacing['20'],
  },
})
export const accessKeysSectionHeading = style({
  maxWidth: '560px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(2rem, 6vw, 3rem)',
  lineHeight: 1.08,
  letterSpacing: '-0.03em',
  textWrap: 'balance',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const accessKeysSectionDescription = style({
  marginTop: metrics.spacing['5'],
  maxWidth: '540px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.5,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
})
export const accessKeysSectionLayout12 = style({
  marginTop: metrics.spacing['8'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: metrics.spacing['2_5'],
})
export const accessKeysSectionLayout13 = style({
  display: 'grid',
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
  '@media (width >= 40rem)': {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  },
})
export const link = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['6'],
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-block)',
      },
    },
  },
  '@media (width >= 40rem)': {
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
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
    paddingInline: metrics.spacing['12'],
  },
})
export const accessKeysSectionHeading2 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '18px',
  lineHeight: 1.2,
  letterSpacing: '0',
  color: 'var(--foreground)',
})
export const accessKeysSectionDescription2 = style({
  marginTop: metrics.spacing['2'],
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '14px',
  lineHeight: 1.45,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
      },
    },
  },
})
export const primitiveGroupSectionSection2 = style({
  scrollMarginTop: metrics.spacing['12'],
})
export const primitiveGroupSectionSection = style({
  marginTop: '140px',
})
export const reveal2 = style({
  position: 'relative',
  borderBlockStyle: 'solid',
  borderBlockWidth: '1px',
  borderColor: 'var(--line)',
})
export const primitiveGroupSectionLayout = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingInline: metrics.spacing['5'],
  paddingBlock: metrics.spacing['14'],
  textAlign: 'center',
  '@media (width >= 64rem)': {
    paddingBlock: metrics.spacing['20'],
  },
})
export const primitiveGroupSectionHeading = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: 'clamp(2rem, 6vw, 3rem)',
  lineHeight: 1.08,
  letterSpacing: '-0.03em',
  textWrap: 'balance',
  color: 'var(--foreground)',
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
})
export const primitiveGroupSectionDescription = style({
  marginTop: metrics.spacing['5'],
  maxWidth: '560px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.5,
  letterSpacing: '0',
  textWrap: 'balance',
  color: 'color-mix(in oklab, var(--foreground) 50%, transparent)',
  '@media (width >= 64rem)': {
    fontSize: '18px',
  },
})
export const primitiveGroupSectionLayout2 = style({
  marginTop: metrics.spacing['8'],
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: metrics.spacing['2_5'],
})
export const primitiveGroupSectionLayout3 = style({
  display: 'grid',
  borderTopStyle: 'solid',
  borderTopWidth: '1px',
  borderColor: 'var(--line)',
  backgroundColor: 'var(--surface-shell)',
  '@media (width >= 64rem)': {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
})
export const primitiveGroupSectionList = style({
  display: 'grid',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  '@media (width >= 64rem)': {
    borderRightStyle: 'solid',
    borderRightWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomWidth: '0px',
  },
})
export const primitiveGroupSectionItem = style({
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderColor: 'var(--line)',
  selectors: {
    '&:last-child': {
      borderBottomStyle: 'solid',
      borderBottomWidth: '0px',
    },
  },
})
export const link2 = style({
  display: 'flex',
  height: '100%',
  width: '100%',
  flexDirection: 'column',
  gap: metrics.spacing['3'],
  padding: metrics.spacing['7'],
  textAlign: 'left',
  transitionProperty:
    'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tempo-style-gradient-from, --tempo-style-gradient-via, --tempo-style-gradient-to',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  transitionDuration: '150ms',
  '@media (width >= 64rem)': {
    padding: metrics.spacing['8'],
  },
})
export const link3 = style({
  backgroundColor: 'var(--surface-block)',
  color: 'var(--foreground)',
})
export const link4 = style({
  color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
  selectors: {
    '&:hover': {
      '@media (hover: hover)': {
        backgroundColor: 'var(--surface-block)',
        color: 'color-mix(in oklab, var(--foreground) 80%, transparent)',
      },
    },
  },
})
export const primitiveGroupSectionText = style({
  display: 'flex',
  alignItems: 'center',
  gap: metrics.spacing['3'],
})
export const primitiveGroupSectionText2 = style({
  width: metrics.spacing['4'],
  height: metrics.spacing['4'],
  flexShrink: 0,
})
export const primitiveGroupSectionText3 = style({
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '20px',
  lineHeight: 1.2,
  letterSpacing: '0',
  '@media (width >= 64rem)': {
    fontSize: '24px',
  },
})
export const primitiveGroupSectionText4 = style({
  maxWidth: '480px',
  fontFamily: 'var(--font-pilat-book)',
  fontSize: '16px',
  lineHeight: 1.4,
  letterSpacing: '0',
  color: 'color-mix(in oklab, var(--foreground) 45%, transparent)',
  selectors: {
    '&:is(:where(.group):hover *)': {
      '@media (hover: hover)': {
        color: 'color-mix(in oklab, var(--foreground) 55%, transparent)',
      },
    },
  },
})
export const primitiveGroupSectionLayout4 = style({
  position: 'relative',
  '@media (width >= 64rem)': {
    minHeight: '520px',
  },
})
export const primitiveGroupSectionLayout5 = style({
  display: 'flex',
  minHeight: '460px',
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
export const primitiveGroupSectionLayout6 = style({
  width: '100%',
  maxWidth: '560px',
})
export const primitiveGroupSectionTextAppearance = instanceStyle((values: { value0: string }) => ({
  '--tempo-backgroundImage': values.value0,
  backgroundImage: 'var(--tempo-backgroundImage)',
  backgroundSize: '5px 5px',
}))
