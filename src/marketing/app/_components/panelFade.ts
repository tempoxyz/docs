// Stacked showcase panels share a grid cell. Hide inactive panels without
// animating so tab and Visual/Code switches feel immediate.
export const panelFadeClass = (visible: boolean) =>
  `self-center [grid-area:1/1] ${visible ? '' : 'hidden'}`
