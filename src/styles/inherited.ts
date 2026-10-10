// These explicit, reviewed exceptions bridge inherited CSS scopes, rather than
// admitting arbitrary new values at each call site. Keep literals in the contract.
// Typed references to existing Vocs/component scopes. Keep these expressions at
// their point of use: hoisting them into :root would break inherited overrides.
export const inherited = {
  color: {
    homePanel: 'var(--home-panel) !custom',
    homeLine: 'var(--home-line) !custom',
    vocsBackgroundColorPrimary: 'var(--vocs-background-color-primary) !custom',
    colorSurfaceBlock: 'var(--color-surface-block) !custom',
    colorMixInSrgbColorForeground85ColorSurfaceShell:
      'color-mix(in srgb, var(--color-foreground) 85%, var(--color-surface-shell)) !custom',
    colorMixInSrgbCurrentColor12Transparent:
      'color-mix(in srgb, currentColor 12%, transparent) !custom',
    colorSurfacePage: 'var(--color-surface-page) !custom',
    colorMixInSrgbCurrentColor5Transparent:
      'color-mix(in srgb, currentColor 5%, transparent) !custom',
    colorMixInSrgbCurrentColor10Transparent:
      'color-mix(in srgb, currentColor 10%, transparent) !custom',
    colorMixInSrgbColorForeground3Transparent:
      'color-mix(in srgb, var(--color-foreground) 3%, transparent) !custom',
    colorMixInSrgbColorForeground8ColorSurfaceShell:
      'color-mix(in srgb, var(--color-foreground) 8%, var(--color-surface-shell)) !custom',
    colorMixInSrgbColorForeground12Transparent:
      'color-mix(in srgb, var(--color-foreground) 12%, transparent) !custom',
    colorMixInSrgbCurrentColor16Transparent:
      'color-mix(in srgb, currentColor 16%, transparent) !custom',
    colorMixInSrgbColorForeground6Transparent:
      'color-mix(in srgb, var(--color-foreground) 6%, transparent) !custom',
    tempoBorder: 'var(--tempo-border) !custom',
    vocsBorderColorPrimary: 'var(--vocs-border-color-primary) !custom',
    colorMixInSrgbForeground12Transparent:
      'color-mix(in srgb, var(--foreground) 12%, transparent) !custom',
    colorMixInSrgbForeground4Transparent:
      'color-mix(in srgb, var(--foreground) 4%, transparent) !custom',
    colorMixInSrgbForeground5Transparent:
      'color-mix(in srgb, var(--foreground) 5%, transparent) !custom',
    selectionBg: 'var(--selection-bg) !custom',
    diagramSelectionBg: 'var(--diagram-selection-bg) !custom',
    scrollbarThumb: 'var(--scrollbar-thumb) !custom',
    blogRule: 'var(--blog-rule) !custom',
    colorMixInSrgbColorForeground14Transparent:
      'color-mix(in srgb, var(--color-foreground) 14%, transparent) !custom',
    colorMixInSrgbColorForeground10Transparent:
      'color-mix(in srgb, var(--color-foreground) 10%, transparent) !custom',
    colorMixInSrgbColorForeground8Transparent:
      'color-mix(in srgb, var(--color-foreground) 8%, transparent) !custom',
    backgroundColorAccentTint: 'var(--background-color-accentTint) !custom',
    textColorAccent: 'var(--text-color-accent) !custom',
    vocsTextColorPrimary: 'var(--vocs-text-color-primary) !custom',
    vocsTextColorSecondary: 'var(--vocs-text-color-secondary) !custom',
    colorMixInOklabForeground70Transparent:
      'color-mix(in oklab, var(--foreground) 70%, transparent) !custom',
    colorMixInOklabForeground6Transparent:
      'color-mix(in oklab, var(--foreground) 6%, transparent) !custom',
    colorMixInOklabForeground60Transparent:
      'color-mix(in oklab, var(--foreground) 60%, transparent) !custom',
    colorMixInOklabForeground3Transparent:
      'color-mix(in oklab, var(--foreground) 3%, transparent) !custom',
    colorMixInOklabForeground35000000000000004Transparent:
      'color-mix(in oklab, var(--foreground) 3.5000000000000004%, transparent) !custom',
    colorMixInOklabForeground55Transparent:
      'color-mix(in oklab, var(--foreground) 55%, transparent) !custom',
    colorMixInOklabForeground4Transparent:
      'color-mix(in oklab, var(--foreground) 4%, transparent) !custom',
    surfaceInput: 'var(--surface-input) !custom',
    colorMixInOklabForeground65Transparent:
      'color-mix(in oklab, var(--foreground) 65%, transparent) !custom',
    homeInk: 'var(--home-ink) !custom',
    homeMuted: 'var(--home-muted) !custom',
    colorMixInSrgbAccentBlue40Transparent:
      'color-mix(in srgb, var(--accent-blue) 40%, transparent) !custom',
    colorMixInSrgbHomeInk35Transparent:
      'color-mix(in srgb, var(--home-ink) 35%, transparent) !custom',
    backgroundColorInvert: 'var(--background-color-invert) !custom',
    textColorInvert: 'var(--text-color-invert) !custom',
    colorMixInSrgbColorForeground60Transparent:
      'color-mix(in srgb, var(--color-foreground) 60%, transparent) !custom',
    colorMixInSrgbColorForeground65Transparent:
      'color-mix(in srgb, var(--color-foreground) 65%, transparent) !custom',
    colorSurfaceShell: 'var(--color-surface-shell) !custom',
    colorMixInSrgbColorForeground55Transparent:
      'color-mix(in srgb, var(--color-foreground) 55%, transparent) !custom',
    colorMixInSrgbForeground65Transparent:
      'color-mix(in srgb, var(--foreground) 65%, transparent) !custom',
    vocsTextColorMuted: 'var(--vocs-text-color-muted) !custom',
    colorMixInSrgbForeground68Transparent:
      'color-mix(in srgb, var(--foreground) 68%, transparent) !custom',
    colorMixInOklabColorBlack40Transparent:
      'color-mix(in oklab, var(--color-black) 40%, transparent) !custom',
    colorMixInOklabForeground5Transparent:
      'color-mix(in oklab, var(--foreground) 5%, transparent) !custom',
    backgroundColorDestructiveTint: 'var(--background-color-destructiveTint) !custom',
    textColorDestructive: 'var(--text-color-destructive) !custom',
    tempoBackground: 'var(--tempo-background) !custom',
    tempoForeground: 'var(--tempo-foreground) !custom',
    backgroundColorAccent: 'var(--background-color-accent) !custom',
    termBlue9: 'var(--term-blue9) !custom',
    termGreen9: 'var(--term-green9) !custom',
    termGray4: 'var(--term-gray4) !custom',
    termGray3: 'var(--term-gray3) !custom',
    termGray6: 'var(--term-gray6) !custom',
    termGray5: 'var(--term-gray5) !custom',
    termGray10: 'var(--term-gray10) !custom',
    termAmber9: 'var(--term-amber9) !custom',
    termOrange9: 'var(--term-orange9) !custom',
    vocsBorderColorPrimaryVarTermGray4:
      'var(--vocs-border-color-primary, var(--term-gray4)) !custom',
    termBg2: 'var(--term-bg2) !custom',
    termPink9: 'var(--term-pink9) !custom',
    colorMixInSrgbSurfaceBlock70Transparent:
      'color-mix(in srgb, var(--surface-block) 70%, transparent) !custom',
    vocsTextColorHeading: 'var(--vocs-text-color-heading) !custom',
    colorMixInOklabColorBlack80Transparent:
      'color-mix(in oklab, var(--color-black) 80%, transparent) !custom',
    colorMixInOklabSurfaceSkeleton35Transparent:
      'color-mix(in oklab, var(--surface-skeleton) 35%, transparent) !custom',
    surfacePage: 'var(--surface-page) !custom',
    textColorPrimary: 'var(--text-color-primary) !custom',
    surfacePanel: 'var(--surface-panel) !custom',
    colorMixInSrgbForeground78Transparent:
      'color-mix(in srgb, var(--foreground) 78%, transparent) !custom',
    colorMixInSrgbForeground72Transparent:
      'color-mix(in srgb, var(--foreground) 72%, transparent) !custom',
    colorMixInSrgbForeground10Transparent:
      'color-mix(in srgb, var(--foreground) 10%, transparent) !custom',
    colorMixInSrgbForeground38Transparent:
      'color-mix(in srgb, var(--foreground) 38%, transparent) !custom',
    selectionFg: 'var(--selection-fg) !custom',
    diagramBg: 'var(--diagram-bg) !custom',
    diagramBox: 'var(--diagram-box) !custom',
    diagramBoxBorder: 'var(--diagram-box-border) !custom',
    diagramAccentBg: 'var(--diagram-accent-bg) !custom',
    diagramAccent: 'var(--diagram-accent) !custom',
    diagramLine: 'var(--diagram-line) !custom',
    diagramLineSoft: 'var(--diagram-line-soft) !custom',
    colorMixInSrgbIndicatorGreen28SurfaceShell:
      'color-mix(in srgb, var(--indicator-green) 28%, var(--surface-shell)) !custom',
    lineDashed: 'var(--line-dashed) !custom',
    colorMixInSrgbIndicatorGreen12SurfaceShell:
      'color-mix(in srgb, var(--indicator-green) 12%, var(--surface-shell)) !custom',
    proseBody: 'var(--prose-body) !custom',
    proseQuote: 'var(--prose-quote) !custom',
    proseLinkDecoration: 'var(--prose-link-decoration) !custom',
    proseMarker: 'var(--prose-marker) !custom',
    lightDarkShikiLightShikiDark: 'light-dark(var(--shiki-light), var(--shiki-dark)) !custom',
    proseCaption: 'var(--prose-caption) !custom',
    colorRed500: 'var(--color-red-500) !custom',
    colorMixInOklabColorGray240Transparent:
      'color-mix(in oklab, var(--color-gray2) 40%, transparent) !custom',
    colorMixInOklabForeground50Transparent:
      'color-mix(in oklab, var(--foreground) 50%, transparent) !custom',
    colorMixInOklabForeground40Transparent:
      'color-mix(in oklab, var(--foreground) 40%, transparent) !custom',
    colorMixInOklabForeground7000000000000001Transparent:
      'color-mix(in oklab, var(--foreground) 7.000000000000001%, transparent) !custom',
    colorMixInOklabForeground8Transparent:
      'color-mix(in oklab, var(--foreground) 8%, transparent) !custom',
    colorMixInOklabForeground80Transparent:
      'color-mix(in oklab, var(--foreground) 80%, transparent) !custom',
    tempoColor: 'var(--tempo-color) !custom',
    colorMixInOklabForeground35Transparent:
      'color-mix(in oklab, var(--foreground) 35%, transparent) !custom',
    colorMixInOklabForeground45Transparent:
      'color-mix(in oklab, var(--foreground) 45%, transparent) !custom',
    colorMixInOklabForeground30Transparent:
      'color-mix(in oklab, var(--foreground) 30%, transparent) !custom',
    colorMixInOklabLine30Transparent: 'color-mix(in oklab, var(--line) 30%, transparent) !custom',
    colorMixInOklabForeground85Transparent:
      'color-mix(in oklab, var(--foreground) 85%, transparent) !custom',
    tempoBackgroundColor: 'var(--tempo-backgroundColor) !custom',
    colorMixInOklabIndicatorGreen5Transparent:
      'color-mix(in oklab, var(--indicator-green) 5%, transparent) !custom',
    colorMixInOklabIndicatorGreen80Transparent:
      'color-mix(in oklab, var(--indicator-green) 80%, transparent) !custom',
    colorMixInOklabIndicatorGreen65Transparent:
      'color-mix(in oklab, var(--indicator-green) 65%, transparent) !custom',
    colorMixInOklabForeground25Transparent:
      'color-mix(in oklab, var(--foreground) 25%, transparent) !custom',
    colorMixInOklabColorBlack60Transparent:
      'color-mix(in oklab, var(--color-black) 60%, transparent) !custom',
    blogInk: 'var(--blog-ink) !custom',
    blogMuted: 'var(--blog-muted) !custom',
    colorMixInOklabSurfaceBlock40Transparent:
      'color-mix(in oklab, var(--surface-block) 40%, transparent) !custom',
    colorMixInOklabIndicatorGreen35Transparent:
      'color-mix(in oklab, var(--indicator-green) 35%, transparent) !custom',
    colorGray600: 'var(--color-gray-600) !custom',
    colorMixInOklabForeground75Transparent:
      'color-mix(in oklab, var(--foreground) 75%, transparent) !custom',
    indicatorGreen: 'var(--indicator-green) !custom',
    backgroundColorWarning: 'var(--background-color-warning) !custom',
    vocsColorRed: 'var(--vocs-color_red) !custom',
  },
  // Prose rhythm and code scale with the local font, not a root pixel grid.
  spacing: {
    heading: '2.5em !custom',
    subheading: '2em !custom',
    subtitle: '1.75em !custom',
    paragraph: '1.25em !custom',
    block: '1.5em !custom',
    caption: '0.75em !custom',
    marker: '0.4em !custom',
    listInset: '1.4em !custom',
    inlineCode: '0.875em !custom',
  },
  fontFamily: {
    tempoFontBodyVarVocsFontFamily: 'var(--tempo-font-body, var(--vocs-font-family)) !custom',
    tempoFontDisplayVarVocsFontFamily: 'var(--tempo-font-display, var(--vocs-font-family)) !custom',
    vocsFontFamilyMono: 'var(--vocs-font-family-mono) !custom',
    tempoFontBodySansSerif: 'var(--tempo-font-body), sans-serif !custom',
    fontMonoGeistMonoMonospace: 'var(--font-mono, "Geist Mono", monospace) !custom',
    tempoFontDisplay: 'var(--tempo-font-display) !custom',
    tempoFontDisplayVarFontPilatBook: 'var(--tempo-font-display, var(--font-pilat-book)) !custom',
    tempoFontFamily: 'var(--tempo-fontFamily) !custom',
  },
  lineHeight: {
    leadingNormal: 'var(--leading-normal) !custom',
    leadingRelaxed: 'var(--leading-relaxed) !custom',
    textSmLineHeight: 'var(--text-sm--line-height) !custom',
    textXsLineHeight: 'var(--text-xs--line-height) !custom',
    leadingTight: 'var(--leading-tight) !custom',
    leadingSnug: 'var(--leading-snug) !custom',
  },
  letterSpacing: {
    trackingWide: 'var(--tracking-wide) !custom',
    trackingTight: 'var(--tracking-tight) !custom',
    trackingWider: 'var(--tracking-wider) !custom',
  },
} as const
