import { global } from 'zyzz/web'
import { inherited } from '../../../styles/inherited'
import { style } from '../../../styles/scoped'
import { vars as tokens } from '../../../styles/theme'

// Document/Vocs integration selectors cannot be attached to owned elements.
global({
  'html:has(.tempo-blog)': {
    '--vocs-spacing-topNav': 'var(--tempo-docs-primary-nav-height, 65px)',
  },
})

export const tempoBlog = style({
  '--blog-ink': 'var(--color-foreground)',
  '--blog-muted': 'color-mix(in srgb, var(--blog-ink) 72%, transparent)',
  '--blog-rule': 'color-mix(in srgb, var(--blog-ink) 12%, transparent)',
  display: 'flex',
  minHeight: '100dvh',
  flexDirection: 'column',
  // design-exception: Preserve the inherited component/framework scope at the point of use.
  paddingTop: 'var(--tempo-docs-primary-nav-height, 65px) !custom',
  backgroundColor: inherited.color.colorSurfacePage,

  color: inherited.color.blogInk,
  fontFamily: tokens.fontFamily.system,
  selectors: {
    '& .docs-site-header': {
      borderBottomWidth: tokens.borderWidth.hairline,
      borderBottomStyle: 'solid',
      borderBottomColor: inherited.color.blogRule,
    },
    '& :is(a, button, select):focus-visible': {
      // design-exception: Preserve this surface's layered artwork or focus treatment.
      outline: '2px solid currentColor !custom',
      outlineOffset: '5px',
    },
  },
})

export const tempoBlogIndex = style({
  width: 'min(100% - 96px, var(--tempo-hub-width, 1168px))',
  marginInline: 'auto !custom',
  '@media (width < 800px)': {
    width: 'calc(100% - 48px)',
  },
})

export const tempoBlogIntro = style({
  paddingTop: tokens.spacing['14'],
  paddingInlineEnd: tokens.spacing['0'],
  paddingBottom: tokens.spacing['10'],
  paddingInlineStart: tokens.spacing['0'],
  selectors: {
    '& h1': {
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      margin: '0 0 18px !custom',

      fontFamily: inherited.fontFamily.tempoFontDisplayVarFontPilatBook,
      // design-exception: Preserve this responsive geometry across viewport sizes.
      fontSize: 'clamp(40px, 4vw, 48px) !custom',
      fontWeight: tokens.fontWeight.medium,
      lineHeight: tokens.lineHeight.display,
      letterSpacing: tokens.letterSpacing.heading,
    },
    '& > p:last-child': {
      maxWidth: '640px',
      margin: 0,

      color: inherited.color.blogMuted,
      fontSize: tokens.fontSize.body,
      lineHeight: tokens.lineHeight.relaxed,
    },
  },
  '@media (width < 800px)': {
    paddingTop: tokens.spacing['10'],
    paddingBottom: tokens.spacing['8'],
  },
  '@media (width < 600px)': {
    selectors: {
      '& h1': {
        // design-exception: Preserve the optical typography of this specific surface.
        letterSpacing: '-1px !custom',
      },
      '& > p:last-child': {
        fontSize: tokens.fontSize.body,
      },
    },
  },
})

export const tempoBlogFeatured = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  alignItems: 'center',
  gap: tokens.spacing['12'],
  // design-exception: Preserve the inherited component/framework scope at the point of use.
  padding: 'var(--tempo-card-padding, 28px) !custom',
  border: 0,
  // design-exception: Preserve the inherited component/framework scope at the point of use.
  borderRadius: 'var(--tempo-card-radius, 24px) !custom',
  backgroundColor: inherited.color.colorSurfaceBlock,
  color: 'inherit !custom',
  textDecoration: 'none',
  selectors: {
    '&:where(:hover) h2': {
      textDecoration: 'underline',
      textDecorationThickness: '1px',
      textUnderlineOffset: '5px',
    },
    '& h2': {
      margin: 0,

      fontFamily: inherited.fontFamily.tempoFontDisplayVarFontPilatBook,
      // design-exception: Preserve this responsive geometry across viewport sizes.
      fontSize: 'clamp(26px, 2.5vw, 32px) !custom',
      fontWeight: tokens.fontWeight.medium,
      lineHeight: tokens.lineHeight.heading,
      // design-exception: Preserve the optical typography of this specific surface.
      letterSpacing: '-0.8px !custom',
    },
  },
  '@media (width < 800px)': {
    gridTemplateColumns: '1fr',
    gap: tokens.spacing['7'],
    padding: tokens.spacing['6'],
  },
})

export const tempoBlogFeaturedCopy = style({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: tokens.spacing['4'],

  paddingBlock: tokens.spacing['4'],
  paddingInline: tokens.spacing['0'],
  '@media (width < 800px)': {
    padding: 0,
  },
  '@media (width < 600px)': {
    padding: 0,
  },
})

export const tempoBlogFeaturedImage = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: tokens.radius.xl,
  '--corner-radius': tokens.radius.xl,
  backgroundColor: inherited.color.colorSurfaceShell,
  selectors: {
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
  },
  '@media (width < 800px)': {
    maxHeight: '300px',
  },
})

export const tempoBlogExcerpt = style({
  margin: 0,

  color: inherited.color.blogMuted,
  fontSize: tokens.fontSize.body,
  lineHeight: tokens.lineHeight.relaxed,
})

export const tempoBlogByline = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  gap: '7px 16px !custom',
  margin: 0,

  color: inherited.color.blogMuted,
  fontSize: tokens.fontSize.compact,
  lineHeight: tokens.lineHeight.relaxed,
  selectors: {
    '& > span': {
      color: inherited.color.blogInk,
    },
    '& time': {
      whiteSpace: 'nowrap',
    },
  },
})

export const tempoBlogLabels = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  gap: '8px 16px !custom',

  color: inherited.color.blogMuted,
  fontSize: tokens.fontSize.xs,
  lineHeight: tokens.lineHeight.normal,
  selectors: {
    '& > span::first-letter': {
      textTransform: 'uppercase',
    },
    '& > span + span': {
      borderInlineStartWidth: tokens.borderWidth.hairline,
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: inherited.color.blogRule,
      paddingInlineStart: tokens.spacing['4'],
    },
  },
})

export const tempoBlogExplorer = style({
  marginTop: tokens.spacing['12'],
  '@media (width < 600px)': {
    marginTop: tokens.spacing['11'],
  },
})

export const tempoBlogExplorerHeading = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: tokens.spacing['5'],
  marginBottom: tokens.spacing['6'],
  selectors: {
    '& h2': {
      margin: 0,

      fontFamily: inherited.fontFamily.tempoFontDisplayVarFontPilatBook,
      fontSize: tokens.fontSize.title,
      fontWeight: tokens.fontWeight.medium,
      letterSpacing: tokens.letterSpacing.heading,
    },
    '& > span': {
      color: inherited.color.blogMuted,
      fontSize: tokens.fontSize.xs,
      whiteSpace: 'nowrap',
    },
  },
  '@media (width < 600px)': {
    selectors: {
      '& h2': {
        fontSize: tokens.fontSize.titleSmall,
      },
    },
  },
})

export const tempoBlogFilters = style({
  display: 'flex',
  flexWrap: 'wrap',
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  gap: '8px 24px !custom',
  minWidth: 0,

  paddingTop: tokens.spacing['0'],
  paddingInlineEnd: tokens.spacing['0'],
  paddingBottom: tokens.spacing['6'],
  paddingInlineStart: tokens.spacing['0'],
  border: 0,
  selectors: {
    '& button': {
      minHeight: '36px',
      border: 0,
      borderBottomWidth: tokens.borderWidth.hairline,
      borderBottomStyle: 'solid',
      borderBottomColor: 'transparent !custom',
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      padding: '7px 0 !custom',

      color: inherited.color.blogMuted,
      backgroundColor: 'transparent !custom',
      font: 'inherit',
      fontSize: tokens.fontSize.compact,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      transition: 'color 150ms',
    },
    '& button:hover': {
      color: inherited.color.blogInk,
    },
    '& button[aria-pressed="true"]': {
      borderBottomColor: inherited.color.blogInk,

      color: inherited.color.blogInk,
    },
  },
  '@media (width < 600px)': {
    // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
    gap: '4px 20px !custom',
    selectors: {
      '& button': {
        minHeight: '44px',
        paddingInline: 0,
      },
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    selectors: {
      '& button': {
        transition: 'none',
      },
    },
  },
})

export const tempoBlogPostList = style({
  margin: 0,
  padding: 0,
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: inherited.color.blogRule,
  listStyle: 'none',
})

export const tempoBlogPostRow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 220px 20px',
  alignItems: 'center',
  gap: tokens.spacing['8'],

  paddingBlock: tokens.spacing['8'],
  paddingInline: tokens.spacing['0'],
  borderBottomWidth: tokens.borderWidth.hairline,
  borderBottomStyle: 'solid',
  borderBottomColor: inherited.color.blogRule,
  color: 'inherit !custom',
  textDecoration: 'none',
  selectors: {
    '&:hover .tempo-blog-post-arrow': {
      transform: 'translate(2px, -2px)',

      color: inherited.color.blogInk,
    },
    '&:hover h3': {
      textDecoration: 'underline',
      textDecorationThickness: '1px',
      textUnderlineOffset: '5px',
    },
  },
  '@media (width < 800px)': {
    gridTemplateColumns: 'minmax(0, 1fr) 170px 16px',
    gap: tokens.spacing['5'],
  },
  '@media (width < 600px)': {
    gridTemplateColumns: 'minmax(0, 1fr) 16px',

    gap: tokens.spacing['4'],

    paddingBlock: tokens.spacing['6'],
  },
})

export const tempoBlogPostCopy = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing['3'],
  selectors: {
    '& h3': {
      margin: 0,

      fontFamily: inherited.fontFamily.tempoFontDisplayVarFontPilatBook,
      fontSize: tokens.fontSize.title,
      fontWeight: tokens.fontWeight.medium,
      lineHeight: tokens.lineHeight.compact,
      // design-exception: Preserve the optical typography of this specific surface.
      letterSpacing: '-0.4px !custom',
    },
    '& .tempo-blog-excerpt': {
      display: 'var(--tempo-clamped-display, -webkit-box)',
      overflow: 'hidden',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    },
  },
  '@media (width < 800px)': {
    selectors: {
      '& h3': {
        fontSize: tokens.fontSize.subheading,
      },
    },
  },
})

export const tempoBlogPostThumbnail = style({
  overflow: 'hidden',
  backgroundColor: inherited.color.colorSurfaceShell,
  '@media (width < 600px)': {
    display: 'none',
  },
})

export const tempoBlogPostArrow = style({
  alignSelf: 'start',
  marginTop: tokens.spacing['1'],

  color: inherited.color.blogMuted,
  transition: 'transform 150ms',
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
})

export const tempoBlogEmpty = style({
  margin: 0,

  paddingBlock: tokens.spacing['12'],
  paddingInline: tokens.spacing['0'],

  color: inherited.color.blogMuted,
  fontSize: tokens.fontSize.bodySmall,
  lineHeight: tokens.lineHeight.relaxed,
})

export const tempoBlogFooter = style({
  display: 'flex',
  width: 'min(100% - 96px, var(--tempo-hub-width, 1168px))',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: tokens.spacing['6'],
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  margin: '80px auto 0 !custom',
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: inherited.color.blogRule,

  paddingTop: tokens.spacing['7'],
  paddingInlineEnd: tokens.spacing['0'],
  paddingBottom: tokens.spacing['9'],
  paddingInlineStart: tokens.spacing['0'],

  color: inherited.color.blogMuted,
  fontSize: tokens.fontSize.xs,
  selectors: {
    '& nav': {
      display: 'flex',
      flexWrap: 'wrap',
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      gap: '12px 24px !custom',
    },
    '& a': {
      color: 'inherit !custom',
      textDecoration: 'none',
    },
    '& a:hover': {
      color: inherited.color.blogInk,
    },
  },
  '@media (width < 800px)': {
    width: 'calc(100% - 48px)',
  },
  '@media (width < 600px)': {
    alignItems: 'flex-start',
    flexDirection: 'column',

    gap: tokens.spacing['4'],
    marginTop: tokens.spacing['14'],
    selectors: {
      '& nav': {
        gap: tokens.spacing['5'],
      },
    },
  },
})

export const tempoBlogArticle = style({
  width: 'min(100% - 64px, 740px)',
  marginInline: 'auto !custom',
  '@media (width < 600px)': {
    width: 'calc(100% - 48px)',
  },
})

export const tempoBlogArticleHeader = style({
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  padding: '54px 0 40px !custom',
  selectors: {
    '& h1': {
      // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
      margin: '22px 0 !custom',

      fontFamily: inherited.fontFamily.tempoFontDisplayVarFontPilatBook,
      // design-exception: Preserve this responsive geometry across viewport sizes.
      fontSize: 'clamp(32px, 4.5vw, 46px) !custom',
      fontWeight: tokens.fontWeight.medium,

      lineHeight: tokens.lineHeight.heading,
      letterSpacing: tokens.letterSpacing.heading,
      textWrap: 'balance',
    },
  },
  '@media (width < 600px)': {
    paddingTop: tokens.spacing['8'],

    paddingBottom: tokens.spacing['7'],
    selectors: {
      '& h1': {
        // design-exception: Preserve the optical typography of this specific surface.
        letterSpacing: '-0.8px !custom',
      },
    },
  },
})

export const tempoBlogBack = style({
  display: 'inline-block',

  marginBottom: tokens.spacing['9'],

  color: inherited.color.blogMuted,
  fontSize: tokens.fontSize.compact,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      color: inherited.color.blogInk,
    },
  },
  '@media (width < 600px)': {
    marginBottom: tokens.spacing['7'],
  },
})

export const tempoBlogArticleLede = style({
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  margin: '0 0 26px !custom',

  color: inherited.color.blogMuted,
  fontSize: tokens.fontSize.lead,
  lineHeight: tokens.lineHeight.relaxed,
  '@media (width < 600px)': {
    fontSize: tokens.fontSize.body,
  },
})

export const tempoBlogArticleBody = style({
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: inherited.color.blogRule,
  paddingTop: tokens.spacing['9'],
  fontSize: tokens.fontSize.body,

  lineHeight: tokens.lineHeight.prose,
  selectors: {
    '& :is(h2, h3, h4)': {
      scrollMarginTop: '8px',
      fontWeight: tokens.fontWeight.medium,
      // design-exception: Preserve the optical typography of this specific surface.
      letterSpacing: '-0.45px !custom',
    },
    '& img': {
      height: 'auto',
      borderRadius: tokens.radius.lg,
      '--corner-radius': tokens.radius.lg,
    },
    '& pre': {
      borderRadius: tokens.radius.lg,
      '--corner-radius': tokens.radius.lg,
    },
  },
  '@media (width < 600px)': {
    paddingTop: tokens.spacing['6'],
    fontSize: tokens.fontSize.body,
  },
})

export const tempoBlogArticleEnd = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: tokens.spacing['5'],
  marginTop: tokens.spacing['14'],
  paddingBlock: tokens.spacing['7'],
  borderTopWidth: tokens.borderWidth.hairline,
  borderTopStyle: 'solid',
  borderTopColor: inherited.color.blogRule,
  fontSize: tokens.fontSize.compact,
  selectors: {
    '& a': {
      color: inherited.color.blogMuted,
      textDecoration: 'none',
    },
    '& a:hover': {
      color: inherited.color.blogInk,
    },
  },
  '@media (width < 600px)': {
    flexDirection: 'column',
  },
})

export const tempoBlogPost = style({
  selectors: {
    '& .tempo-blog-footer': {
      paddingBottom: tokens.spacing['24'],
      marginTop: tokens.spacing['8'],
    },
  },
})

export const tempoBlogNotFound = style({
  flex: 1,
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  padding: '100px 24px !custom',
  textAlign: 'center',
  selectors: {
    '& h1': {
      marginBottom: tokens.spacing['5'],
      fontSize: tokens.fontSize.display,
      fontWeight: tokens.fontWeight.normal,
    },
    '& a': {
      color: inherited.color.blogMuted,
    },
  },
})
