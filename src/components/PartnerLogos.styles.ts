import { global } from 'zyzz/web'
import { style } from '../styles/scoped'
import { vars as tokens } from '../styles/theme'

// Document/Vocs integration selectors cannot be attached to owned elements.
global({
  ':root[data-vocs-theme="dark"] .partner-logo--dfns': {
    backgroundImage: 'url("/partners/directory/dfns-dark.svg")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--dynamic': {
    backgroundImage: 'url("/partners/directory/dynamic-dark.svg")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--turnkey': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--0x': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--open-usd-ousd': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--zerion': {
    filter: 'none',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--luganodes': {
    backgroundImage: 'url("/partners/directory/luganodes-dark.svg")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--rio': {
    backgroundImage: 'url("/partners/directory/rio-dark.svg")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--mt-pelerin': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--brale': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--moonpay': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--safe': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--enact': {
    filter: 'none',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--pimlico': {
    filter: 'none',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--hercle': {
    filter: 'none',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--ur': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--zerodev': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--codex': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--crossmint': {
    backgroundImage: 'url("/partners/directory/crossmint-dark.svg")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--allium': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--artemis': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--coins-ph': {
    backgroundImage: 'url("/partners/directory/coins-ph-dark.svg")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--para': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--uniswap': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--tempo-explorer': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--bridge': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--privy': {
    filter: 'none',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--fireblocks': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--blockaid': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--chainalysis': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--trm-labs': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--layerzero': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--squid': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--utila': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--xfx': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--conduit': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--quicknode': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--sonarx': {
    filter: 'none',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--coinbase': {
    backgroundImage: 'url("/partners/directory/coinbase-dark.svg")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--dune': {
    backgroundImage: 'url("/partners/directory/dune-dark.svg")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--tenderly': {
    backgroundImage: 'url("/partners/directory/tenderly-dark.svg")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--relay': {
    backgroundImage: 'url("/partners/directory/relay-dark.svg")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--wirex': {
    backgroundImage: 'url("/partners/directory/wirex-mark.png")',
    filter: 'none',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--coingecko': {
    backgroundImage: 'url("/partners/directory/coingecko-dark.png")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--rhino-fi': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--validation-cloud': {
    filter: 'brightness(0) invert(1)',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--allunity': {
    backgroundImage: 'url("/partners/directory/allunity-dark.png")',
  },
  ':root[data-vocs-theme="dark"] .partner-logo--ondo': {
    filter: 'brightness(0) invert(1)',
  },
})

export const partnerLogo = style({
  display: 'inline-block',
  width: '28px',
  height: '24px',
  marginInlineEnd: tokens.spacing['2_5'],
  verticalAlign: '-3px',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'contain',
})

export const partnerLogoDfns = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/dfns.svg")',
})

export const partnerLogoDynamic = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/dynamic.svg")',
})

export const partnerLogoTurnkey = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/turnkey.svg")',
})

export const partnerLogo0x = style({
  width: '39px',
  backgroundImage: 'url("/partners/directory/0x.svg")',
})

export const partnerLogoAcross = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/across.svg")',
})

export const partnerLogoSenseinode = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/senseinode.svg")',
})

export const partnerLogoAlchemy = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/alchemy.svg")',
})

export const partnerLogoGemWallet = style({
  width: '94px',
  backgroundImage: 'url("/partners/directory/gem-wallet.svg")',
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  backgroundColor: '#171717 !custom',
  borderRadius: tokens.radius.sm,
  backgroundSize: '90% auto',
  height: '28px',
  verticalAlign: '-5px',
})

export const partnerLogoBlockradar = style({
  width: '94px',
  backgroundImage: 'url("/partners/directory/blockradar.svg")',
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  backgroundColor: '#171717 !custom',
  borderRadius: tokens.radius.sm,
  backgroundSize: '90% auto',
  height: '28px',
  verticalAlign: '-5px',
})

export const partnerLogoCubist = style({
  width: '29px',
  backgroundImage: 'url("/partners/directory/cubist.svg")',
})

export const partnerLogoOpenUsdOusd = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/open-usd-ousd.svg")',
})

export const partnerLogoGoldsky = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/goldsky.svg")',
})

export const partnerLogoSqd = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/sqd.svg")',
})

export const partnerLogoZerion = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/zerion.svg")',
  filter: 'brightness(0)',
})

export const partnerLogoBitgo = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/bitgo.svg")',
})

export const partnerLogoLuganodes = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/luganodes.svg")',
})

export const partnerLogoRio = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/rio.svg")',
})

export const partnerLogoDrpc = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/drpc.svg")',
  // design-exception: Preserve this component’s existing geometry; it is not a shared scale step.
  backgroundColor: '#171717 !custom',
  borderRadius: tokens.radius.sm,
  backgroundSize: '90% auto',
  height: '28px',
  verticalAlign: '-5px',
})

export const partnerLogoMtPelerin = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/mt-pelerin.svg")',
})

export const partnerLogoBrale = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/brale.svg")',
})

export const partnerLogoMoonpay = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/moonpay.svg")',
})

export const partnerLogoRange = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/range.svg")',
})

export const partnerLogoRedstone = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/redstone.svg")',
})

export const partnerLogoSafe = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/safe.svg")',
})

export const partnerLogoEnact = style({
  width: '73px',
  backgroundImage: 'url("/partners/directory/enact.svg")',
  filter: 'brightness(0)',
})

export const partnerLogoPimlico = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/pimlico.svg")',
  filter: 'brightness(0)',
})

export const partnerLogoElliptic = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/elliptic.svg")',
})

export const partnerLogoHercle = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/hercle.svg")',
  filter: 'brightness(0)',
})

export const partnerLogoUr = style({
  width: '56px',
  backgroundImage: 'url("/partners/directory/ur.svg")',
})

export const partnerLogoZerodev = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/zerodev.svg")',
})

export const partnerLogoCodex = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/codex.svg")',
})

export const partnerLogoCrossmint = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/crossmint.svg")',
})

export const partnerLogoAllium = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/allium.svg")',
})

export const partnerLogoArtemis = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/artemis.svg")',
})

export const partnerLogoCoinsPh = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/coins-ph.svg")',
})

export const partnerLogoPara = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/para.svg")',
})

export const partnerLogoUniswap = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/uniswap.svg")',
})

export const partnerLogoTempoExplorer = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/tempo-explorer.svg")',
})

export const partnerLogoBridge = style({
  width: '28px',
  backgroundImage: 'url("/partners/directory/bridge-mark.svg")',
  height: '28px',
  filter: 'none',
})

export const partnerLogoPrivy = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/privy.svg")',
  filter: 'brightness(0)',
})

export const partnerLogoFireblocks = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/fireblocks.svg")',
})

export const partnerLogoBlockaid = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/blockaid.svg")',
})

export const partnerLogoChainalysis = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/chainalysis.svg")',
})

export const partnerLogoTrmLabs = style({
  width: '78px',
  backgroundImage: 'url("/partners/directory/trm-labs.svg")',
})

export const partnerLogoLayerzero = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/layerzero.svg")',
})

export const partnerLogoSquid = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/squid.svg")',
})

export const partnerLogoUtila = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/utila.svg")',
})

export const partnerLogoXfx = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/xfx.svg")',
})

export const partnerLogoConduit = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/conduit.svg")',
})

export const partnerLogoQuicknode = style({
  width: '24px',
  backgroundImage: 'url("/partners/directory/quicknode.svg")',
  filter: 'brightness(0)',
})

export const partnerLogoSonarx = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/sonarx.svg")',
  filter: 'brightness(0)',
})

export const partnerLogoCoinbase = style({
  width: '82px',
  backgroundImage: 'url("/partners/directory/coinbase.svg")',
})

export const partnerLogoDune = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/dune.svg")',
})

export const partnerLogoTenderly = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/tenderly.svg")',
})

export const partnerLogoRelay = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/relay.svg")',
})

export const partnerLogoBlockdaemon = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/blockdaemon.svg")',
})

export const partnerLogoWirex = style({
  width: '28px',
  backgroundImage: 'url("/partners/directory/wirex-mark.png")',
  height: '28px',
  filter: 'none',
})

export const partnerLogoCoingecko = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/coingecko.png")',
})

export const partnerLogoRhinoFi = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/rhino-fi.png")',
})

export const partnerLogoValidationCloud = style({
  width: '84px',
  backgroundImage: 'url("/partners/directory/validation-cloud.avif")',
  filter: 'brightness(0)',
})

export const partnerLogoRabby = style({
  width: '28px',
  height: '28px',
  backgroundImage: 'url("/partners/directory/rabby-mark.png")',
  filter: 'none',
})

export const partnerLogoBitgetWallet = style({
  width: '84px',
  height: '24px',
  backgroundImage: 'url("/partners/directory/bitget-wallet-mark.png")',
  filter: 'none',
})

export const partnerLogoChainlink = style({
  width: '28px',
  height: '28px',
  backgroundImage: 'url("/partners/directory/chainlink-mark.svg")',
  filter: 'none',
})

export const partnerLogoAllunity = style({
  width: '28px',
  backgroundImage: 'url("/partners/directory/allunity.png")',
})

export const partnerLogoOndo = style({
  width: '24px',
  backgroundPosition: 'left center',
  backgroundSize: 'auto 24px',
  backgroundImage: 'url("/partners/ondo.svg")',
})

export const partnerLogoFigure = style({
  backgroundImage: 'url("/partners/directory/figure.png")',
})

export const partnerLogoHastra = style({
  backgroundImage: 'url("/partners/directory/hastra.ico")',
})
