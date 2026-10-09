import { style } from 'zyzz'
import { global } from 'zyzz/web'

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
  paddingTop: 'var(--tempo-docs-primary-nav-height, 65px)',
  background: 'var(--color-surface-page)',
  color: 'var(--blog-ink)',
  fontFamily: 'var(--font-pilat-book), ui-sans-serif, system-ui, sans-serif',
  selectors: {
    '& .docs-site-header': {
      borderBottom: '1px solid var(--blog-rule)',
    },
    '& :is(a, button, select):focus-visible': {
      outline: '2px solid currentColor',
      outlineOffset: '5px',
    },
  },
})

export const tempoBlogIndex = style({
  width: 'min(100% - 96px, var(--tempo-hub-width, 1168px))',
  marginInline: 'auto',
  '@media (width < 800px)': {
    width: 'calc(100% - 48px)',
  },
})

export const tempoBlogIntro = style({
  padding: '56px 0 40px',
  selectors: {
    '& h1': {
      margin: '0 0 18px',
      fontFamily: 'var(--tempo-font-display, var(--font-pilat-book))',
      fontSize: 'clamp(40px, 4vw, 48px)',
      fontWeight: 500,
      lineHeight: 1.1,
      letterSpacing: '-0.03em',
    },
    '& > p:last-child': {
      maxWidth: '640px',
      margin: 0,
      color: 'var(--blog-muted)',
      fontSize: '16px',
      lineHeight: 1.6,
    },
  },
  '@media (width < 800px)': {
    paddingTop: '40px',
    paddingBottom: '32px',
  },
  '@media (width < 600px)': {
    selectors: {
      '& h1': {
        letterSpacing: '-1px',
      },
      '& > p:last-child': {
        fontSize: '16px',
      },
    },
  },
})

export const tempoBlogFeatured = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  alignItems: 'center',
  gap: '48px',
  padding: 'var(--tempo-card-padding, 28px)',
  border: 0,
  borderRadius: 'var(--tempo-card-radius, 24px)',
  background: 'var(--color-surface-block)',
  color: 'inherit',
  textDecoration: 'none',
  selectors: {
    '&:where(:hover) h2': {
      textDecoration: 'underline',
      textDecorationThickness: '1px',
      textUnderlineOffset: '5px',
    },
    '& h2': {
      margin: 0,
      fontFamily: 'var(--tempo-font-display, var(--font-pilat-book))',
      fontSize: 'clamp(26px, 2.5vw, 32px)',
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '-0.8px',
    },
  },
  '@media (width < 800px)': {
    gridTemplateColumns: '1fr',
    gap: '28px',
    padding: '24px',
  },
})

export const tempoBlogFeaturedCopy = style({
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '16px',
  padding: '16px 0',
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
  borderRadius: '12px',
  background: 'var(--color-surface-shell)',
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
  color: 'var(--blog-muted)',
  fontSize: '16px',
  lineHeight: 1.6,
})

export const tempoBlogByline = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '7px 16px',
  margin: 0,
  color: 'var(--blog-muted)',
  fontSize: '13px',
  lineHeight: 1.6,
  selectors: {
    '& > span': {
      color: 'var(--blog-ink)',
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
  gap: '8px 16px',
  color: 'var(--blog-muted)',
  fontSize: '12px',
  lineHeight: 1.5,
  selectors: {
    '& > span::first-letter': {
      textTransform: 'uppercase',
    },
    '& > span + span': {
      borderLeft: '1px solid var(--blog-rule)',
      paddingLeft: '16px',
    },
  },
})

export const tempoBlogExplorer = style({
  marginTop: '48px',
  '@media (width < 600px)': {
    marginTop: '44px',
  },
})

export const tempoBlogExplorerHeading = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '20px',
  marginBottom: '24px',
  selectors: {
    '& h2': {
      margin: 0,
      fontFamily: 'var(--tempo-font-display, var(--font-pilat-book))',
      fontSize: '24px',
      fontWeight: 500,
      letterSpacing: '-0.03em',
    },
    '& > span': {
      color: 'var(--blog-muted)',
      fontSize: '12px',
      whiteSpace: 'nowrap',
    },
  },
  '@media (width < 600px)': {
    selectors: {
      '& h2': {
        fontSize: '22px',
      },
    },
  },
})

export const tempoBlogFilters = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px 24px',
  minWidth: 0,
  padding: '0 0 24px',
  border: 0,
  selectors: {
    '& button': {
      minHeight: '36px',
      border: 0,
      borderBottom: '1px solid transparent',
      padding: '7px 0',
      color: 'var(--blog-muted)',
      background: 'transparent',
      font: 'inherit',
      fontSize: '13px',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      transition: 'color 150ms',
    },
    '& button:hover': {
      color: 'var(--blog-ink)',
    },
    '& button[aria-pressed="true"]': {
      borderBottomColor: 'var(--blog-ink)',
      color: 'var(--blog-ink)',
    },
  },
  '@media (width < 600px)': {
    gap: '4px 20px',
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
  borderTop: '1px solid var(--blog-rule)',
  listStyle: 'none',
})

export const tempoBlogPostRow = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 220px 20px',
  alignItems: 'center',
  gap: '32px',
  padding: '32px 0',
  borderBottom: '1px solid var(--blog-rule)',
  color: 'inherit',
  textDecoration: 'none',
  selectors: {
    '&:hover .tempo-blog-post-arrow': {
      transform: 'translate(2px, -2px)',
      color: 'var(--blog-ink)',
    },
    '&:hover h3': {
      textDecoration: 'underline',
      textDecorationThickness: '1px',
      textUnderlineOffset: '5px',
    },
  },
  '@media (width < 800px)': {
    gridTemplateColumns: 'minmax(0, 1fr) 170px 16px',
    gap: '20px',
  },
  '@media (width < 600px)': {
    gridTemplateColumns: 'minmax(0, 1fr) 16px',
    gap: '18px',
    paddingBlock: '26px',
  },
})

export const tempoBlogPostCopy = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  selectors: {
    '& h3': {
      margin: 0,
      fontFamily: 'var(--tempo-font-display, var(--font-pilat-book))',
      fontSize: '24px',
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: '-0.4px',
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
        fontSize: '20px',
      },
    },
  },
})

export const tempoBlogPostThumbnail = style({
  overflow: 'hidden',
  background: 'var(--color-surface-shell)',
  '@media (width < 600px)': {
    display: 'none',
  },
})

export const tempoBlogPostArrow = style({
  alignSelf: 'start',
  marginTop: '4px',
  color: 'var(--blog-muted)',
  transition: 'transform 150ms',
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
})

export const tempoBlogEmpty = style({
  margin: 0,
  padding: '48px 0',
  color: 'var(--blog-muted)',
  fontSize: '15px',
  lineHeight: 1.6,
})

export const tempoBlogFooter = style({
  display: 'flex',
  width: 'min(100% - 96px, var(--tempo-hub-width, 1168px))',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '24px',
  margin: '80px auto 0',
  borderTop: '1px solid var(--blog-rule)',
  padding: '28px 0 36px',
  color: 'var(--blog-muted)',
  fontSize: '12px',
  selectors: {
    '& nav': {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px 24px',
    },
    '& a': {
      color: 'inherit',
      textDecoration: 'none',
    },
    '& a:hover': {
      color: 'var(--blog-ink)',
    },
  },
  '@media (width < 800px)': {
    width: 'calc(100% - 48px)',
  },
  '@media (width < 600px)': {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: '18px',
    marginTop: '56px',
    selectors: {
      '& nav': {
        gap: '20px',
      },
    },
  },
})

export const tempoBlogArticle = style({
  width: 'min(100% - 64px, 740px)',
  marginInline: 'auto',
  '@media (width < 600px)': {
    width: 'calc(100% - 48px)',
  },
})

export const tempoBlogArticleHeader = style({
  padding: '54px 0 40px',
  selectors: {
    '& h1': {
      margin: '22px 0',
      fontFamily: 'var(--tempo-font-display, var(--font-pilat-book))',
      fontSize: 'clamp(32px, 4.5vw, 46px)',
      fontWeight: 500,
      lineHeight: 1.16,
      letterSpacing: '-0.03em',
      textWrap: 'balance',
    },
  },
  '@media (width < 600px)': {
    paddingTop: '32px',
    paddingBottom: '30px',
    selectors: {
      '& h1': {
        letterSpacing: '-0.8px',
      },
    },
  },
})

export const tempoBlogBack = style({
  display: 'inline-block',
  marginBottom: '38px',
  color: 'var(--blog-muted)',
  fontSize: '13px',
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      color: 'var(--blog-ink)',
    },
  },
  '@media (width < 600px)': {
    marginBottom: '30px',
  },
})

export const tempoBlogArticleLede = style({
  margin: '0 0 26px',
  color: 'var(--blog-muted)',
  fontSize: '18px',
  lineHeight: 1.6,
  '@media (width < 600px)': {
    fontSize: '16px',
  },
})

export const tempoBlogArticleBody = style({
  borderTop: '1px solid var(--blog-rule)',
  paddingTop: '36px',
  fontSize: '16px',
  lineHeight: 1.75,
  selectors: {
    '& :is(h2, h3, h4)': {
      scrollMarginTop: '8px',
      fontWeight: 500,
      letterSpacing: '-0.45px',
    },
    '& img': {
      height: 'auto',
      borderRadius: '2px',
    },
    '& pre': {
      borderRadius: '2px',
    },
  },
  '@media (width < 600px)': {
    paddingTop: '24px',
    fontSize: '16px',
  },
})

export const tempoBlogArticleEnd = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  marginTop: '56px',
  paddingBlock: '28px',
  borderTop: '1px solid var(--blog-rule)',
  fontSize: '13px',
  selectors: {
    '& a': {
      color: 'var(--blog-muted)',
      textDecoration: 'none',
    },
    '& a:hover': {
      color: 'var(--blog-ink)',
    },
  },
  '@media (width < 600px)': {
    flexDirection: 'column',
  },
})

export const tempoBlogPost = style({
  selectors: {
    '& .tempo-blog-footer': {
      paddingBottom: '90px',
      marginTop: '32px',
    },
  },
})

export const tempoBlogNotFound = style({
  flex: 1,
  padding: '100px 24px',
  textAlign: 'center',
  selectors: {
    '& h1': {
      marginBottom: '20px',
      fontSize: '40px',
      fontWeight: 400,
    },
    '& a': {
      color: 'var(--blog-muted)',
    },
  },
})
