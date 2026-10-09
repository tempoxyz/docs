import { style, variants } from '../styles/recipes'
import { style as scopedStyle } from '../styles/scoped'
import { vars } from '../styles/theme'

style({
  color: 'foreground',
  padding: '3',
  fontSize: 'compact',
  borderRadius: 'md',
  zIndex: 'header',
})
style({ color: vars.color.foreground, padding: vars.spacing['3'] })
style({
  // @ts-expect-error An off-brand literal must not typecheck.
  color: '#0070f3',
})
style({
  // @ts-expect-error An off-scale spacing value must not typecheck.
  padding: '13px',
})
style({
  // @ts-expect-error Misspelled tokens must not typecheck.
  color: 'forground',
})
scopedStyle({
  // @ts-expect-error Unlayered selectors have the same token policy.
  backgroundColor: '#0070f3',
})
style({
  // @ts-expect-error Stacking must come from the reviewed scale.
  zIndex: 12345,
})
const choice = variants({
  variants: { size: { compact: { padding: '2' }, roomy: { padding: '4' } } },
})
// @ts-expect-error Consumers cannot invent a new component size.
choice({ size: 'enormous' })
