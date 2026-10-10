import { defineVars } from 'zyzz'

// Tempo's light/dark palette and semantic tokens. Vocs owns color-scheme.
export const palette = defineVars({
  color: {
    black: '#000000',
    white: '#ffffff',
    gray1: {
      light: '#fcfcfc',
      dark: '#111111',
    },
    gray2: {
      light: '#f9f9f9',
      dark: '#191919',
    },
    gray3: {
      light: '#f0f0f0',
      dark: '#222222',
    },
    gray4: {
      light: '#e8e8e8',
      dark: '#2a2a2a',
    },
    gray5: {
      light: '#e0e0e0',
      dark: '#313131',
    },
    gray6: {
      light: '#d9d9d9',
      dark: '#3a3a3a',
    },
    gray7: {
      light: '#cecece',
      dark: '#484848',
    },
    gray8: {
      light: '#bbbbbb',
      dark: '#606060',
    },
    gray9: {
      light: '#8d8d8d',
      dark: '#6e6e6e',
    },
    gray10: {
      light: '#838383',
      dark: '#7b7b7b',
    },
    gray11: {
      light: '#646464',
      dark: '#b4b4b4',
    },
    gray12: {
      light: '#202020',
      dark: '#eeeeee',
    },
    grayA1: {
      light: '#00000003',
      dark: '#00000000',
    },
    grayA2: {
      light: '#00000006',
      dark: '#ffffff09',
    },
    grayA3: {
      light: '#0000000f',
      dark: '#ffffff12',
    },
    grayA4: {
      light: '#00000017',
      dark: '#ffffff1b',
    },
    grayA5: {
      light: '#0000001f',
      dark: '#ffffff22',
    },
    grayA6: {
      light: '#00000026',
      dark: '#ffffff2c',
    },
    grayA7: {
      light: '#00000031',
      dark: '#ffffff3b',
    },
    grayA8: {
      light: '#00000044',
      dark: '#ffffff55',
    },
    grayA9: {
      light: '#00000072',
      dark: '#ffffff64',
    },
    grayA10: {
      light: '#0000007c',
      dark: '#ffffff72',
    },
    grayA11: {
      light: '#0000009b',
      dark: '#ffffffaf',
    },
    grayA12: {
      light: '#000000df',
      dark: '#ffffffed',
    },
    blackA1: 'rgba(0, 0, 0, 0.05)',
    blackA2: 'rgba(0, 0, 0, 0.1)',
    blackA3: 'rgba(0, 0, 0, 0.15)',
    blackA4: 'rgba(0, 0, 0, 0.2)',
    blackA5: 'rgba(0, 0, 0, 0.3)',
    blackA6: 'rgba(0, 0, 0, 0.4)',
    blackA7: 'rgba(0, 0, 0, 0.5)',
    blackA8: 'rgba(0, 0, 0, 0.6)',
    blackA9: 'rgba(0, 0, 0, 0.7)',
    blackA10: 'rgba(0, 0, 0, 0.8)',
    blackA11: 'rgba(0, 0, 0, 0.9)',
    blackA12: 'rgba(0, 0, 0, 0.95)',
    whiteA1: 'rgba(255, 255, 255, 0.05)',
    whiteA2: 'rgba(255, 255, 255, 0.1)',
    whiteA3: 'rgba(255, 255, 255, 0.15)',
    whiteA4: 'rgba(255, 255, 255, 0.2)',
    whiteA5: 'rgba(255, 255, 255, 0.3)',
    whiteA6: 'rgba(255, 255, 255, 0.4)',
    whiteA7: 'rgba(255, 255, 255, 0.5)',
    whiteA8: 'rgba(255, 255, 255, 0.6)',
    whiteA9: 'rgba(255, 255, 255, 0.7)',
    whiteA10: 'rgba(255, 255, 255, 0.8)',
    whiteA11: 'rgba(255, 255, 255, 0.9)',
    whiteA12: 'rgba(255, 255, 255, 0.95)',
    blue1: {
      light: '#fbfdff',
      dark: '#0d1520',
    },
    blue2: {
      light: '#f4faff',
      dark: '#111927',
    },
    blue3: {
      light: '#e6f4fe',
      dark: '#0d2847',
    },
    blue4: {
      light: '#d5efff',
      dark: '#003362',
    },
    blue5: {
      light: '#c2e5ff',
      dark: '#004074',
    },
    blue6: {
      light: '#acd8fc',
      dark: '#104d87',
    },
    blue7: {
      light: '#8ec8f6',
      dark: '#205d9e',
    },
    blue8: {
      light: '#5eb1ef',
      dark: '#2870bd',
    },
    blue9: {
      light: '#0090ff',
      dark: '#0090ff',
    },
    blue10: {
      light: '#0588f0',
      dark: '#3b9eff',
    },
    blue11: {
      light: '#0d74ce',
      dark: '#70b8ff',
    },
    blue12: {
      light: '#113264',
      dark: '#c2e6ff',
    },
    blueA1: {
      light: '#0080ff04',
      dark: '#004df211',
    },
    blueA2: {
      light: '#008cff0b',
      dark: '#1166fb18',
    },
    blueA3: {
      light: '#008ff519',
      dark: '#0077ff3a',
    },
    blueA4: {
      light: '#009eff2a',
      dark: '#0075ff57',
    },
    blueA5: {
      light: '#0093ff3d',
      dark: '#0081fd6b',
    },
    blueA6: {
      light: '#0088f653',
      dark: '#0f89fd7f',
    },
    blueA7: {
      light: '#0083eb71',
      dark: '#2a91fe98',
    },
    blueA8: {
      light: '#0084e6a1',
      dark: '#3094feb9',
    },
    blueA9: {
      light: '#0090ff',
      dark: '#0090ff',
    },
    blueA10: {
      light: '#0086f0fa',
      dark: '#3b9eff',
    },
    blueA11: {
      light: '#006dcbf2',
      dark: '#70b8ff',
    },
    blueA12: {
      light: '#002359ee',
      dark: '#c2e6ff',
    },
    amber1: {
      light: '#fefdfb',
      dark: '#16120c',
    },
    amber2: {
      light: '#fefbe9',
      dark: '#1d180f',
    },
    amber3: {
      light: '#fff7c2',
      dark: '#302008',
    },
    amber4: {
      light: '#ffee9c',
      dark: '#3f2700',
    },
    amber5: {
      light: '#fbe577',
      dark: '#4d3000',
    },
    amber6: {
      light: '#f3d673',
      dark: '#5c3d05',
    },
    amber7: {
      light: '#e9c162',
      dark: '#714f19',
    },
    amber8: {
      light: '#e2a336',
      dark: '#8f6424',
    },
    amber9: {
      light: '#ffc53d',
      dark: '#ffc53d',
    },
    amber10: {
      light: '#ffba18',
      dark: '#ffd60a',
    },
    amber11: {
      light: '#ab6400',
      dark: '#ffca16',
    },
    amber12: {
      light: '#4f3422',
      dark: '#ffe7b3',
    },
    amberA1: {
      light: '#c0800004',
      dark: '#e63c0006',
    },
    amberA2: {
      light: '#f4d10016',
      dark: '#fd9b000d',
    },
    amberA3: {
      light: '#ffde003d',
      dark: '#fa820022',
    },
    amberA4: {
      light: '#ffd40063',
      dark: '#fc820032',
    },
    amberA5: {
      light: '#f8cf0088',
      dark: '#fd8b0041',
    },
    amberA6: {
      light: '#eab5008c',
      dark: '#fd9b0051',
    },
    amberA7: {
      light: '#dc9b009d',
      dark: '#ffab2567',
    },
    amberA8: {
      light: '#da8a00c9',
      dark: '#ffae3587',
    },
    amberA9: {
      light: '#ffb300c2',
      dark: '#ffc53d',
    },
    amberA10: {
      light: '#ffb300e7',
      dark: '#ffd60a',
    },
    amberA11: {
      light: '#ab6400',
      dark: '#ffca16',
    },
    amberA12: {
      light: '#341500dd',
      dark: '#ffe7b3',
    },
    green1: {
      light: '#fbfefc',
      dark: '#0e1512',
    },
    green2: {
      light: '#f4fbf6',
      dark: '#121b17',
    },
    green3: {
      light: '#e6f6eb',
      dark: '#132d21',
    },
    green4: {
      light: '#d6f1df',
      dark: '#113b29',
    },
    green5: {
      light: '#c4e8d1',
      dark: '#174933',
    },
    green6: {
      light: '#adddc0',
      dark: '#20573e',
    },
    green7: {
      light: '#8eceaa',
      dark: '#28684a',
    },
    green8: {
      light: '#5bb98b',
      dark: '#2f7c57',
    },
    green9: {
      light: '#30a46c',
      dark: '#30a46c',
    },
    green10: {
      light: '#2b9a66',
      dark: '#33b074',
    },
    green11: {
      light: '#218358',
      dark: '#3dd68c',
    },
    green12: {
      light: '#193b2d',
      dark: '#b1f1cb',
    },
    red1: {
      light: '#fffcfc',
      dark: '#191111',
    },
    red2: {
      light: '#fff7f7',
      dark: '#201314',
    },
    red3: {
      light: '#feebec',
      dark: '#3b1219',
    },
    red4: {
      light: '#ffdbdc',
      dark: '#500f1c',
    },
    red5: {
      light: '#ffcdce',
      dark: '#611623',
    },
    red6: {
      light: '#fdbdbe',
      dark: '#72232d',
    },
    red7: {
      light: '#f4a9aa',
      dark: '#8c333a',
    },
    red8: {
      light: '#eb8e90',
      dark: '#b54548',
    },
    red9: {
      light: '#e5484d',
      dark: '#e5484d',
    },
    red10: {
      light: '#dc3e42',
      dark: '#ec5d5e',
    },
    red11: {
      light: '#ce2c31',
      dark: '#ff9592',
    },
    red12: {
      light: '#641723',
      dark: '#ffd1d9',
    },
    violet1: {
      light: '#fdfcfe',
      dark: '#14121f',
    },
    violet2: {
      light: '#faf8ff',
      dark: '#1b1525',
    },
    violet3: {
      light: '#f4f0fe',
      dark: '#291f43',
    },
    violet4: {
      light: '#ebe4ff',
      dark: '#33255b',
    },
    violet5: {
      light: '#e1d9ff',
      dark: '#3c2e69',
    },
    violet6: {
      light: '#d4cafe',
      dark: '#473876',
    },
    violet7: {
      light: '#c2b5f5',
      dark: '#56468b',
    },
    violet8: {
      light: '#aa99ec',
      dark: '#6958ad',
    },
    violet9: {
      light: '#6e56cf',
      dark: '#6e56cf',
    },
    violet10: {
      light: '#654dc4',
      dark: '#7d66d9',
    },
    violet11: {
      light: '#6550b9',
      dark: '#baa7ff',
    },
    violet12: {
      light: '#2f265f',
      dark: '#e2ddfe',
    },
    jade1: {
      light: '#fbfefd',
      dark: '#0d1512',
    },
    jade2: {
      light: '#f4fbf7',
      dark: '#121c18',
    },
    jade3: {
      light: '#e6f7ed',
      dark: '#0d2a1f',
    },
    jade4: {
      light: '#d6f1e3',
      dark: '#113b29',
    },
    jade5: {
      light: '#c3e9d7',
      dark: '#164430',
    },
    jade6: {
      light: '#adddc3',
      dark: '#1b543a',
    },
    jade7: {
      light: '#8eceaa',
      dark: '#236e4a',
    },
    jade8: {
      light: '#5bb98b',
      dark: '#2a7e59',
    },
    jade9: {
      light: '#30a46c',
      dark: '#30a46c',
    },
    jade10: {
      light: '#299764',
      dark: '#33b074',
    },
    jade11: {
      light: '#18794e',
      dark: '#3dd68c',
    },
    jade12: {
      light: '#153226',
      dark: '#b1f1cb',
    },
    foreground: 'var(--foreground)',
    muted: 'var(--foreground-secondary)',
    background: 'var(--background)',
    shell: 'var(--surface-shell)',
    card: 'var(--surface-card)',
    elevated: 'var(--surface-card-elev)',
    block: 'var(--surface-block)',
    // Docs panels and cards: the light surface-block fill, lifted to surface-panel in dark so
    // borderless panels separate from the page.
    panel: {
      light: '#f5f5f5',
      dark: '#181818',
    },
    line: 'var(--line)',
    lineStrong: 'var(--line-strong)',
    accent: 'var(--accent-blue)',
    onyx: 'var(--surface-onyx)',
    onOnyx: 'var(--on-surface-onyx)',
  },
  fontFamily: {
    sans: 'var(--font-pilat-book)',
    mono: 'var(--font-jetbrains-mono), ui-monospace, monospace',
  },
})
