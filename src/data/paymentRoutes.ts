export type PaymentRoute = {
  sourceRail: string
  sourceCurrency: string
  destinationRail: string
  destinationCurrency: string
  provider: string
  providerUrl: string
  category: 'Fiat' | 'Cross-chain' | 'Exchange'
  region?: string
  minimum?: string
  settlement?: string
  limit?: string
  note?: string
}

const BRIDGE_SOURCE =
  'https://apidocs.bridge.xyz/get-started/introduction/what-we-support/payment-routes#route-explorer'

const BRIDGE_FIAT_RAILS = new Set([
  'ACH',
  'Bre-B & Bank Transfer',
  'Bridge Wallet',
  'Faster Payments',
  'FedNow',
  'Pix',
  'SEPA',
  'SPEI',
  'Wire',
])

const BRIDGE_ROUTES_TSV = `
ACH	USD	Tempo	OUSD	1 USD
ACH	USD	Tempo	PATHUSD	1 USD
ACH	USD	Tempo	USDB	1 USD
ACH	USD	Tempo	USDC	1 USD
ACH	USD	Tempo	USDT	1 USD
Aptos	USDC	Tempo	OUSD	1 USDC
Aptos	USDC	Tempo	PATHUSD	1 USDC
Aptos	USDC	Tempo	USDB	1 USDC
Aptos	USDC	Tempo	USDC	1 USDC
Aptos	USDC	Tempo	USDT	5 USDC
Aptos	USDCBL	Tempo	OUSD	1 USDCBL
Aptos	USDCBL	Tempo	PATHUSD	1 USDCBL
Aptos	USDCBL	Tempo	USDB	1 USDCBL
Aptos	USDCBL	Tempo	USDC	1 USDCBL
Aptos	USDCBL	Tempo	USDT	20 USDCBL
Arbitrum	USDC	Tempo	OUSD	1 USDC
Arbitrum	USDC	Tempo	PATHUSD	1 USDC
Arbitrum	USDC	Tempo	USDB	1 USDC
Arbitrum	USDC	Tempo	USDC	1 USDC
Arbitrum	USDC	Tempo	USDT	5 USDC
Avalanche C-Chain	USDC	Tempo	OUSD	1 USDC
Avalanche C-Chain	USDC	Tempo	PATHUSD	1 USDC
Avalanche C-Chain	USDC	Tempo	USDB	1 USDC
Avalanche C-Chain	USDC	Tempo	USDC	1 USDC
Avalanche C-Chain	USDC	Tempo	USDT	5 USDC
Base	EURC	Tempo	OUSD	1 EURC
Base	EURC	Tempo	PATHUSD	1 EURC
Base	EURC	Tempo	USDB	1 EURC
Base	EURC	Tempo	USDC	1 EURC
Base	EURC	Tempo	USDT	5 EURC
Base	OUSD	Tempo	OUSD	1 OUSD
Base	OUSD	Tempo	PATHUSD	1 OUSD
Base	OUSD	Tempo	USDB	1 OUSD
Base	OUSD	Tempo	USDC	1 OUSD
Base	OUSD	Tempo	USDT	5 OUSD
Base	USDB	Tempo	EURC	2 USDB
Base	USDB	Tempo	OUSD	1 USDB
Base	USDB	Tempo	PATHUSD	1 USDB
Base	USDB	Tempo	USDB	1 USDB
Base	USDB	Tempo	USDC	1 USDB
Base	USDB	Tempo	USDT	5 USDB
Base	USDC	Tempo	OUSD	1 USDC
Base	USDC	Tempo	PATHUSD	1 USDC
Base	USDC	Tempo	USDB	1 USDC
Base	USDC	Tempo	USDC	1 USDC
Base	USDC	Tempo	USDT	5 USDC
Bre-B & Bank Transfer	COP	Tempo	OUSD	100 COP
Bre-B & Bank Transfer	COP	Tempo	PATHUSD	100 COP
Bre-B & Bank Transfer	COP	Tempo	USDB	100 COP
Bre-B & Bank Transfer	COP	Tempo	USDC	100 COP
Bre-B & Bank Transfer	COP	Tempo	USDT	100 COP
Bridge Wallet	EURC	Tempo	PATHUSD	1 EURC
Bridge Wallet	OUSD	Tempo	OUSD	1 OUSD
Bridge Wallet	OUSD	Tempo	PATHUSD	1 OUSD
Bridge Wallet	OUSD	Tempo	USDB	1 OUSD
Bridge Wallet	OUSD	Tempo	USDC	1 OUSD
Bridge Wallet	OUSD	Tempo	USDT	5 OUSD
Bridge Wallet	PATHUSD	Tempo	OUSD	1 PATHUSD
Bridge Wallet	PATHUSD	Tempo	PATHUSD	1 PATHUSD
Bridge Wallet	PATHUSD	Tempo	USDB	1 PATHUSD
Bridge Wallet	PATHUSD	Tempo	USDC	1 PATHUSD
Bridge Wallet	PATHUSD	Tempo	USDT	5 PATHUSD
Bridge Wallet	PYUSD	Tempo	PATHUSD	1 PYUSD
Bridge Wallet	PYUSD	Tempo	USDC	1 PYUSD
Bridge Wallet	PYUSD	Tempo	USDT	5 PYUSD
Bridge Wallet	USDB	Tempo	EURC	2 USDB
Bridge Wallet	USDB	Tempo	OUSD	1 USDB
Bridge Wallet	USDB	Tempo	PATHUSD	1 USDB
Bridge Wallet	USDB	Tempo	USDB	1 USDB
Bridge Wallet	USDB	Tempo	USDC	1 USDB
Bridge Wallet	USDB	Tempo	USDT	5 USDB
Bridge Wallet	USDC	Tempo	OUSD	1 USDC
Bridge Wallet	USDC	Tempo	PATHUSD	1 USDC
Bridge Wallet	USDC	Tempo	USDB	1 USDC
Bridge Wallet	USDC	Tempo	USDT	5 USDC
Bridge Wallet	USDT	Tempo	OUSD	1 USDT
Bridge Wallet	USDT	Tempo	PATHUSD	1 USDT
Bridge Wallet	USDT	Tempo	USDB	1 USDT
Bridge Wallet	USDT	Tempo	USDC	1 USDT
Bridge Wallet	USDT	Tempo	USDT	5 USDT
Celo	USDC	Tempo	OUSD	1 USDC
Celo	USDC	Tempo	PATHUSD	1 USDC
Celo	USDC	Tempo	USDB	1 USDC
Celo	USDC	Tempo	USDC	1 USDC
Celo	USDC	Tempo	USDT	5 USDC
Ethereum	EURC	Tempo	OUSD	1 EURC
Ethereum	EURC	Tempo	PATHUSD	1 EURC
Ethereum	EURC	Tempo	USDB	1 EURC
Ethereum	OUSD	Tempo	EURC	2 OUSD
Ethereum	OUSD	Tempo	PATHUSD	1 OUSD
Ethereum	OUSD	Tempo	USDB	1 OUSD
Ethereum	OUSD	Tempo	USDC	1 OUSD
Ethereum	OUSD	Tempo	USDT	5 OUSD
Ethereum	PYUSD	Tempo	PATHUSD	1 PYUSD
Ethereum	PYUSD	Tempo	USDC	1 PYUSD
Ethereum	PYUSD	Tempo	USDT	5 PYUSD
Ethereum	USDB	Tempo	OUSD	1 USDB
Ethereum	USDB	Tempo	PATHUSD	1 USDB
Ethereum	USDB	Tempo	USDB	1 USDB
Ethereum	USDB	Tempo	USDC	1 USDB
Ethereum	USDB	Tempo	USDT	5 USDB
Ethereum	USDC	Tempo	OUSD	1 USDC
Ethereum	USDC	Tempo	PATHUSD	1 USDC
Ethereum	USDC	Tempo	USDB	1 USDC
Ethereum	USDC	Tempo	USDC	1 USDC
Ethereum	USDC	Tempo	USDT	5 USDC
Ethereum	USDT	Tempo	OUSD	2 USDT
Ethereum	USDT	Tempo	PATHUSD	2 USDT
Ethereum	USDT	Tempo	USDB	2 USDT
Ethereum	USDT	Tempo	USDC	1 USDT
Ethereum	USDT	Tempo	USDT	5 USDT
Faster Payments	GBP	Tempo	OUSD	2 GBP
Faster Payments	GBP	Tempo	PATHUSD	2 GBP
Faster Payments	GBP	Tempo	USDB	2 GBP
Faster Payments	GBP	Tempo	USDC	2 GBP
FedNow	USD	Tempo	OUSD	1 USD
FedNow	USD	Tempo	PATHUSD	1 USD
FedNow	USD	Tempo	USDB	1 USD
FedNow	USD	Tempo	USDC	1 USD
FedNow	USD	Tempo	USDT	1 USD
HyperEVM	USDC	Tempo	OUSD	1 USDC
HyperEVM	USDC	Tempo	PATHUSD	1 USDC
HyperEVM	USDC	Tempo	USDB	1 USDC
HyperEVM	USDC	Tempo	USDC	1 USDC
HyperEVM	USDC	Tempo	USDT	5 USDC
Linea	USDC	Tempo	OUSD	1 USDC
Linea	USDC	Tempo	PATHUSD	1 USDC
Linea	USDC	Tempo	USDB	1 USDC
Linea	USDC	Tempo	USDC	1 USDC
Linea	USDC	Tempo	USDT	5 USDC
Monad	USDC	Tempo	OUSD	1 USDC
Monad	USDC	Tempo	PATHUSD	1 USDC
Monad	USDC	Tempo	USDB	1 USDC
Monad	USDC	Tempo	USDC	1 USDC
Monad	USDC	Tempo	USDT	5 USDC
Optimism	USDC	Tempo	OUSD	1 USDC
Optimism	USDC	Tempo	PATHUSD	1 USDC
Optimism	USDC	Tempo	USDB	1 USDC
Optimism	USDC	Tempo	USDC	1 USDC
Optimism	USDC	Tempo	USDT	5 USDC
Pix	BRL	Tempo	OUSD	10 BRL
Pix	BRL	Tempo	PATHUSD	10 BRL
Pix	BRL	Tempo	USDB	10 BRL
Pix	BRL	Tempo	USDC	10 BRL
Pix	BRL	Tempo	USDT	10 BRL
Plasma	USDT	Tempo	OUSD	2 USDT
Plasma	USDT	Tempo	PATHUSD	2 USDT
Plasma	USDT	Tempo	USDB	2 USDT
Plasma	USDT	Tempo	USDC	1 USDT
Polygon	USDC	Tempo	OUSD	1 USDC
Polygon	USDC	Tempo	PATHUSD	1 USDC
Polygon	USDC	Tempo	USDB	1 USDC
Polygon	USDC	Tempo	USDC	1 USDC
Polygon	USDC	Tempo	USDT	5 USDC
SEPA	EUR	Tempo	OUSD	1 EUR
SEPA	EUR	Tempo	PATHUSD	1 EUR
SEPA	EUR	Tempo	USDB	1 EUR
SEPA	EUR	Tempo	USDC	1 EUR
SPEI	MXN	Tempo	EURC	50 MXN
SPEI	MXN	Tempo	OUSD	50 MXN
SPEI	MXN	Tempo	PATHUSD	50 MXN
SPEI	MXN	Tempo	USDB	50 MXN
SPEI	MXN	Tempo	USDC	50 MXN
SPEI	MXN	Tempo	USDT	50 MXN
Solana	CASH	Tempo	PATHUSD	1 CASH
Solana	CASH	Tempo	USDC	1 CASH
Solana	CASH	Tempo	USDT	5 CASH
Solana	EURC	Tempo	OUSD	1 EURC
Solana	EURC	Tempo	PATHUSD	1 EURC
Solana	EURC	Tempo	USDB	1 EURC
Solana	EURC	Tempo	USDC	1 EURC
Solana	OUSD	Tempo	OUSD	1 OUSD
Solana	OUSD	Tempo	PATHUSD	1 OUSD
Solana	OUSD	Tempo	USDB	1 OUSD
Solana	OUSD	Tempo	USDC	1 OUSD
Solana	OUSD	Tempo	USDT	5 OUSD
Solana	PYUSD	Tempo	PATHUSD	1 PYUSD
Solana	PYUSD	Tempo	USDC	1 PYUSD
Solana	PYUSD	Tempo	USDT	5 PYUSD
Solana	USDB	Tempo	EURC	2 USDB
Solana	USDB	Tempo	PATHUSD	1 USDB
Solana	USDB	Tempo	USDB	1 USDB
Solana	USDB	Tempo	USDC	1 USDB
Solana	USDB	Tempo	USDT	5 USDB
Solana	USDC	Tempo	OUSD	1 USDC
Solana	USDC	Tempo	PATHUSD	1 USDC
Solana	USDC	Tempo	USDB	1 USDC
Solana	USDC	Tempo	USDC	1 USDC
Solana	USDC	Tempo	USDT	5 USDC
Solana	USDG	Tempo	OUSD	1 USDG
Solana	USDG	Tempo	PATHUSD	1 USDG
Solana	USDG	Tempo	USDB	1 USDG
Solana	USDG	Tempo	USDC	1 USDG
Solana	USDG	Tempo	USDT	5 USDG
Solana	USDT	Tempo	OUSD	2 USDT
Solana	USDT	Tempo	PATHUSD	2 USDT
Solana	USDT	Tempo	USDB	2 USDT
Solana	USDT	Tempo	USDC	1 USDT
Solana	USDT	Tempo	USDT	1 USDT
Stellar	EURC	Tempo	OUSD	1 EURC
Stellar	EURC	Tempo	PATHUSD	1 EURC
Stellar	EURC	Tempo	USDB	1 EURC
Stellar	USDC	Tempo	OUSD	1 USDC
Stellar	USDC	Tempo	PATHUSD	1 USDC
Stellar	USDC	Tempo	USDB	1 USDC
Stellar	USDC	Tempo	USDC	1 USDC
Stellar	USDC	Tempo	USDT	5 USDC
Sui	USDC	Tempo	OUSD	1 USDC
Sui	USDC	Tempo	PATHUSD	1 USDC
Sui	USDC	Tempo	USDB	1 USDC
Sui	USDC	Tempo	USDC	1 USDC
Sui	USDC	Tempo	USDT	5 USDC
Sui	USDSUI	Tempo	OUSD	1 USDSUI
Sui	USDSUI	Tempo	PATHUSD	1 USDSUI
Sui	USDSUI	Tempo	USDB	1 USDSUI
Sui	USDSUI	Tempo	USDC	1 USDSUI
Sui	USDSUI	Tempo	USDT	20 USDSUI
Tempo	EURC	Arbitrum	USDC	1 EURC
Tempo	EURC	Avalanche C-Chain	USDC	1 EURC
Tempo	EURC	Base	EURC	1 EURC
Tempo	EURC	Base	OUSD	1 EURC
Tempo	EURC	Base	USDB	1 EURC
Tempo	EURC	Base	USDC	1 EURC
Tempo	EURC	Celo	USDC	1 EURC
Tempo	EURC	Ethereum	EURC	1 EURC
Tempo	EURC	Ethereum	OUSD	1 EURC
Tempo	EURC	Ethereum	USDB	1 EURC
Tempo	EURC	Ethereum	USDC	1 EURC
Tempo	EURC	HyperEVM	USDC	1 EURC
Tempo	EURC	Linea	USDC	1 EURC
Tempo	EURC	Monad	USDC	1 EURC
Tempo	EURC	Optimism	USDC	1 EURC
Tempo	EURC	Polygon	USDC	1 EURC
Tempo	EURC	SEPA	EUR	1 EURC
Tempo	EURC	SPEI	MXN	1 EURC
Tempo	EURC	Solana	EURC	1 EURC
Tempo	EURC	Solana	OUSD	1 EURC
Tempo	EURC	Solana	USDB	1 EURC
Tempo	EURC	Solana	USDC	1 EURC
Tempo	EURC	Solana	USDG	1 EURC
Tempo	EURC	Stellar	EURC	1 EURC
Tempo	EURC	Stellar	USDC	1 EURC
Tempo	EURC	Tempo	OUSD	1 EURC
Tempo	EURC	Tempo	PATHUSD	1 EURC
Tempo	EURC	Tempo	USDB	1 EURC
Tempo	EURC	Tempo	USDC	1 EURC
Tempo	EURC	World Chain	USDC	1 EURC
Tempo	EURC	XDC	USDC	1 EURC
Tempo	PATHUSD	ACH	USD	1 PATHUSD
Tempo	PATHUSD	Aptos	USDC	1 PATHUSD
Tempo	PATHUSD	Aptos	USDCBL	1 PATHUSD
Tempo	PATHUSD	Arbitrum	USDC	1 PATHUSD
Tempo	PATHUSD	Avalanche C-Chain	USDC	1 PATHUSD
Tempo	PATHUSD	Base	OUSD	1 PATHUSD
Tempo	PATHUSD	Base	USDB	1 PATHUSD
Tempo	PATHUSD	Base	USDC	1 PATHUSD
Tempo	PATHUSD	Celo	USDC	1 PATHUSD
Tempo	PATHUSD	Ethereum	OUSD	1 PATHUSD
Tempo	PATHUSD	Ethereum	PYUSD	1 PATHUSD
Tempo	PATHUSD	Ethereum	USDB	1 PATHUSD
Tempo	PATHUSD	Ethereum	USDC	1 PATHUSD
Tempo	PATHUSD	Ethereum	USDT	20 PATHUSD
Tempo	PATHUSD	Faster Payments	GBP	3 PATHUSD
Tempo	PATHUSD	HyperEVM	USDC	1 PATHUSD
Tempo	PATHUSD	Linea	USDC	1 PATHUSD
Tempo	PATHUSD	Monad	USDC	1 PATHUSD
Tempo	PATHUSD	Optimism	USDC	1 PATHUSD
Tempo	PATHUSD	Pix	BRL	2 PATHUSD
Tempo	PATHUSD	Plasma	USDT	5 PATHUSD
Tempo	PATHUSD	Polygon	USDC	1 PATHUSD
Tempo	PATHUSD	SEPA	EUR	2 PATHUSD
Tempo	PATHUSD	SPEI	MXN	2 PATHUSD
Tempo	PATHUSD	Solana	OUSD	1 PATHUSD
Tempo	PATHUSD	Solana	PYUSD	1 PATHUSD
Tempo	PATHUSD	Solana	USDB	1 PATHUSD
Tempo	PATHUSD	Solana	USDC	1 PATHUSD
Tempo	PATHUSD	Solana	USDG	1 PATHUSD
Tempo	PATHUSD	Solana	USDT	5 PATHUSD
Tempo	PATHUSD	Stellar	USDC	1 PATHUSD
Tempo	PATHUSD	Sui	USDC	1 PATHUSD
Tempo	PATHUSD	Sui	USDSUI	1 PATHUSD
Tempo	PATHUSD	Tempo	OUSD	1 PATHUSD
Tempo	PATHUSD	Tempo	USDB	1 PATHUSD
Tempo	PATHUSD	Tempo	USDC	1 PATHUSD
Tempo	PATHUSD	Tempo	USDT	5 PATHUSD
Tempo	PATHUSD	Tron	USDT	5 PATHUSD
Tempo	PATHUSD	Wire	USD	1 PATHUSD
Tempo	PATHUSD	XDC	USDC	1 PATHUSD
Tempo	USDB	ACH	USD	1 USDB
Tempo	USDB	Aptos	USDC	1 USDB
Tempo	USDB	Aptos	USDCBL	1 USDB
Tempo	USDB	Arbitrum	USDC	1 USDB
Tempo	USDB	Avalanche C-Chain	USDC	1 USDB
Tempo	USDB	Base	EURC	2 USDB
Tempo	USDB	Base	USDB	1 USDB
Tempo	USDB	Base	USDC	1 USDB
Tempo	USDB	Bre-B & Bank Transfer	COP	1 USDB
Tempo	USDB	Celo	USDC	1 USDB
Tempo	USDB	Ethereum	EURC	2 USDB
Tempo	USDB	Ethereum	OUSD	1 USDB
Tempo	USDB	Ethereum	PYUSD	1 USDB
Tempo	USDB	Ethereum	USDB	1 USDB
Tempo	USDB	Ethereum	USDC	1 USDB
Tempo	USDB	Ethereum	USDT	20 USDB
Tempo	USDB	Faster Payments	GBP	3 USDB
Tempo	USDB	HyperEVM	USDC	1 USDB
Tempo	USDB	Linea	USDC	1 USDB
Tempo	USDB	Monad	USDC	1 USDB
Tempo	USDB	Optimism	USDC	1 USDB
Tempo	USDB	Pix	BRL	2 USDB
Tempo	USDB	Plasma	USDT	5 USDB
Tempo	USDB	Polygon	USDC	1 USDB
Tempo	USDB	SEPA	EUR	2 USDB
Tempo	USDB	SPEI	MXN	2 USDB
Tempo	USDB	Solana	EURC	2 USDB
Tempo	USDB	Solana	OUSD	1 USDB
Tempo	USDB	Solana	PYUSD	1 USDB
Tempo	USDB	Solana	USDB	1 USDB
Tempo	USDB	Solana	USDC	1 USDB
Tempo	USDB	Solana	USDG	1 USDB
Tempo	USDB	Solana	USDT	5 USDB
Tempo	USDB	Stellar	EURC	2 USDB
Tempo	USDB	Stellar	USDC	1 USDB
Tempo	USDB	Sui	USDC	1 USDB
Tempo	USDB	Sui	USDSUI	1 USDB
Tempo	USDB	Tempo	EURC	2 USDB
Tempo	USDB	Tempo	PATHUSD	1 USDB
Tempo	USDB	Tempo	USDC	1 USDB
Tempo	USDB	Tempo	USDT	5 USDB
Tempo	USDB	Tron	USDT	5 USDB
Tempo	USDB	Wire	USD	1 USDB
Tempo	USDB	XDC	USDC	1 USDB
Tempo	USDC	ACH	USD	1 USDC
Tempo	USDC	Aptos	USDC	1 USDC
Tempo	USDC	Aptos	USDCBL	1 USDC
Tempo	USDC	Arbitrum	USDC	1 USDC
Tempo	USDC	Avalanche C-Chain	USDC	1 USDC
Tempo	USDC	Base	EURC	2 USDC
Tempo	USDC	Base	OUSD	1 USDC
Tempo	USDC	Base	USDB	1 USDC
Tempo	USDC	Base	USDC	1 USDC
Tempo	USDC	Bre-B & Bank Transfer	COP	1 USDC
Tempo	USDC	Celo	USDC	1 USDC
Tempo	USDC	Ethereum	EURC	2 USDC
Tempo	USDC	Ethereum	OUSD	1 USDC
Tempo	USDC	Ethereum	PYUSD	1 USDC
Tempo	USDC	Ethereum	USDB	1 USDC
Tempo	USDC	Ethereum	USDC	1 USDC
Tempo	USDC	Ethereum	USDT	20 USDC
Tempo	USDC	Faster Payments	GBP	3 USDC
Tempo	USDC	HyperEVM	USDC	1 USDC
Tempo	USDC	Linea	USDC	1 USDC
Tempo	USDC	Monad	USDC	1 USDC
Tempo	USDC	Optimism	USDC	1 USDC
Tempo	USDC	Pix	BRL	2 USDC
Tempo	USDC	Plasma	USDT	5 USDC
Tempo	USDC	Polygon	USDC	1 USDC
Tempo	USDC	SEPA	EUR	1 USDC
Tempo	USDC	SPEI	MXN	2 USDC
Tempo	USDC	Solana	CASH	1 USDC
Tempo	USDC	Solana	EURC	2 USDC
Tempo	USDC	Solana	OUSD	1 USDC
Tempo	USDC	Solana	PYUSD	1 USDC
Tempo	USDC	Solana	USDB	1 USDC
Tempo	USDC	Solana	USDC	1 USDC
Tempo	USDC	Solana	USDG	1 USDC
Tempo	USDC	Solana	USDT	5 USDC
Tempo	USDC	Stellar	EURC	2 USDC
Tempo	USDC	Stellar	USDC	1 USDC
Tempo	USDC	Sui	USDC	1 USDC
Tempo	USDC	Sui	USDSUI	1 USDC
Tempo	USDC	Tempo	OUSD	1 USDC
Tempo	USDC	Tempo	PATHUSD	1 USDC
Tempo	USDC	Tempo	USDB	1 USDC
Tempo	USDC	Tempo	USDT	5 USDC
Tempo	USDC	Tron	USDT	5 USDC
Tempo	USDC	Wire	USD	1 USDC
Tempo	USDC	XDC	USDC	1 USDC
Tempo	USDT	ACH	USD	2 USDT
Tempo	USDT	Arbitrum	USDC	2 USDT
Tempo	USDT	Avalanche C-Chain	USDC	2 USDT
Tempo	USDT	Base	EURC	2 USDT
Tempo	USDT	Base	OUSD	2 USDT
Tempo	USDT	Base	USDB	2 USDT
Tempo	USDT	Base	USDC	2 USDT
Tempo	USDT	Bre-B & Bank Transfer	COP	1 USDT
Tempo	USDT	Ethereum	EURC	2 USDT
Tempo	USDT	Ethereum	OUSD	2 USDT
Tempo	USDT	Ethereum	PYUSD	1 USDT
Tempo	USDT	Ethereum	USDB	2 USDT
Tempo	USDT	Ethereum	USDC	2 USDT
Tempo	USDT	Ethereum	USDT	5 USDT
Tempo	USDT	HyperEVM	USDC	2 USDT
Tempo	USDT	Linea	USDC	2 USDT
Tempo	USDT	Monad	USDC	2 USDT
Tempo	USDT	Optimism	USDC	2 USDT
Tempo	USDT	Pix	BRL	2 USDT
Tempo	USDT	Polygon	USDC	2 USDT
Tempo	USDT	SPEI	MXN	2 USDT
Tempo	USDT	Solana	CASH	2 USDT
Tempo	USDT	Solana	OUSD	2 USDT
Tempo	USDT	Solana	PYUSD	1 USDT
Tempo	USDT	Solana	USDB	2 USDT
Tempo	USDT	Solana	USDC	2 USDT
Tempo	USDT	Solana	USDG	2 USDT
Tempo	USDT	Solana	USDT	1 USDT
Tempo	USDT	Stellar	EURC	2 USDT
Tempo	USDT	Stellar	USDC	2 USDT
Tempo	USDT	Tempo	OUSD	2 USDT
Tempo	USDT	Tempo	PATHUSD	2 USDT
Tempo	USDT	Tempo	USDB	2 USDT
Tempo	USDT	Tempo	USDC	1 USDT
Tempo	USDT	Tron	USDT	5 USDT
Tempo	USDT	Wire	USD	2 USDT
Tron	USDT	Tempo	OUSD	5 USDT
Tron	USDT	Tempo	PATHUSD	5 USDT
Tron	USDT	Tempo	USDB	5 USDT
Tron	USDT	Tempo	USDC	1 USDT
Tron	USDT	Tempo	USDT	5 USDT
Wire	USD	Tempo	OUSD	1 USD
Wire	USD	Tempo	PATHUSD	1 USD
Wire	USD	Tempo	USDB	1 USD
Wire	USD	Tempo	USDC	1 USD
Wire	USD	Tempo	USDT	1 USD
XDC	USDC	Tempo	OUSD	1 USDC
XDC	USDC	Tempo	PATHUSD	1 USDC
XDC	USDC	Tempo	USDB	1 USDC
XDC	USDC	Tempo	USDC	1 USDC
XDC	USDC	Tempo	USDT	5 USDC
`.trim()

const bridgeRoutes: PaymentRoute[] = BRIDGE_ROUTES_TSV.split('\n').map((line) => {
  const [sourceRail, sourceCurrency, destinationRail, destinationCurrency, minimum] =
    line.split('\t')

  return {
    sourceRail,
    sourceCurrency,
    destinationRail,
    destinationCurrency,
    minimum,
    provider: 'Bridge',
    providerUrl: BRIDGE_SOURCE,
    category:
      BRIDGE_FIAT_RAILS.has(sourceRail) || BRIDGE_FIAT_RAILS.has(destinationRail)
        ? 'Fiat'
        : 'Cross-chain',
    note: 'Minimum shown by Bridge when this catalog was reviewed.',
  }
})

type DueCorridor = [
  currency: string,
  direction: 'in' | 'out' | 'both',
  rail: string,
  region: string,
  settlement: string,
  limit?: string,
  note?: string,
]

const DUE_SOURCE = 'https://due.readme.io/docs/supported-payment-methods'

const dueCorridors: DueCorridor[] = [
  ['USD', 'both', 'SWIFT', 'Global', 'T+1 to T+3'],
  ['EUR', 'out', 'SWIFT', 'Global', 'T+1 to T+3'],
  ['GBP', 'out', 'SWIFT', 'Global', 'T+1 to T+3'],
  ['EUR', 'both', 'SEPA Instant', 'Europe', 'Instant', '€100,000'],
  ['EUR', 'both', 'SEPA Credit', 'Europe', 'T+0 to T+1'],
  ['GBP', 'both', 'Faster Payments', 'United Kingdom', 'Instant', '£1,000,000'],
  ['GBP', 'both', 'BACS', 'United Kingdom', 'T+0 to T+1'],
  ['DKK', 'out', 'Local wire', 'Denmark', 'T+0'],
  ['NOK', 'out', 'Local wire', 'Norway', 'T+0'],
  ['PLN', 'out', 'Local wire', 'Poland', 'T+0'],
  ['BOB', 'out', 'Local wire', 'Bolivia', 'T+0', 'BOB 10,000,000'],
  ['CAD', 'out', 'EFT', 'Canada', 'T+0 to T+1', 'CA$600,000'],
  ['CLP', 'out', 'Local wire', 'Chile', 'T+1', 'CLP 89,000,000'],
  ['COP', 'in', 'Bre-B', 'Colombia', 'Instant'],
  ['COP', 'out', 'Bre-B', 'Colombia', 'Instant to T+1'],
  ['CRC', 'out', 'Local wire', 'Costa Rica', 'Instant', 'CRC 13,510,000'],
  ['CRC', 'out', 'Pako', 'Costa Rica', 'Instant', 'CRC 540,800'],
  ['DOP', 'out', 'Local wire', 'Dominican Republic', 'T+1'],
  ['DOP', 'out', 'Billet', 'Dominican Republic', 'Instant', 'DOP 70,000'],
  ['GTQ', 'out', 'Local wire', 'Guatemala', 'T+0', 'GTQ 58,605'],
  ['GTQ', 'out', 'Tigo Money', 'Guatemala', 'Instant', 'GTQ 20,000'],
  ['HNL', 'out', 'Local wire', 'Honduras', 'T+0', 'HNL 184,488'],
  ['JMD', 'out', 'Local wire', 'Jamaica', 'T+0'],
  ['JMD', 'out', 'Digicel', 'Jamaica', 'Instant', 'JMD 75,000'],
  ['MXN', 'both', 'SPEI', 'Mexico', 'Instant'],
  ['USD', 'both', 'FedWire', 'United States', '<2 hours'],
  ['USD', 'both', 'ACH', 'United States', 'T+0 to T+1'],
  ['USD', 'out', 'Local wire', 'Ecuador', 'T+0'],
  ['USD', 'out', 'Local wire', 'El Salvador', 'T+0', '$7,500'],
  ['USD', 'out', 'Tigo Money', 'El Salvador', 'Instant', '$1,850'],
  ['KES', 'both', 'M-Pesa', 'Kenya', 'Instant', 'KES 999,999', 'B2B only; available upon request.'],
  ['NGN', 'both', 'Bank transfer', 'Nigeria', 'Instant', 'NGN 50,000,000'],
  [
    'RWF',
    'both',
    'Mobile money',
    'Rwanda',
    'Instant',
    'RWF 2,000,000',
    'B2B only; available upon request.',
  ],
  ['SLE', 'both', 'Mobile money', 'Sierra Leone', 'Instant', 'SLE 15,000'],
  ['UGX', 'both', 'Mobile money', 'Uganda', 'Instant', 'UGX 5,000,000'],
  [
    'XAF',
    'both',
    'Mobile money',
    'Central Africa',
    'Instant',
    'XAF 500,000',
    'B2B only; available upon request.',
  ],
  ['XOF', 'both', 'Mobile money', 'West Africa', 'Instant', 'XOF 2,000,000'],
  ['ZMW', 'both', 'Mobile money', 'Zambia', 'Instant', 'ZMW 20,000'],
  ['AED', 'in', 'IPP', 'United Arab Emirates', 'Instant', 'AED 50,000'],
  ['AED', 'in', 'FTS', 'United Arab Emirates', '<2 hours'],
  ['AED', 'out', 'IPP', 'United Arab Emirates', 'Instant', 'AED 50,000'],
  ['AED', 'out', 'FTS', 'United Arab Emirates', '<2 hours'],
  ['AUD', 'out', 'Local wire', 'Australia', 'T+0'],
  ['CNY', 'out', 'WeChat Pay', 'China', 'Instant', 'CNY 50,000', 'Individual accounts only.'],
  ['CNY', 'out', 'Alipay', 'China', 'Instant', 'CNY 50,000', 'Individual accounts only.'],
  ['HKD', 'out', 'FPS', 'Hong Kong', 'Instant'],
  ['INR', 'out', 'UPI / IMPS', 'India', 'Instant'],
  [
    'IDR',
    'out',
    'BI-FAST',
    'Indonesia',
    'Instant',
    undefined,
    'Limit depends on beneficiary bank.',
  ],
  ['ILS', 'out', 'Local wire', 'Israel', 'T+1', 'ILS 25,000'],
  ['JPY', 'out', 'Local wire', 'Japan', 'T+0', 'JPY 1,000,000'],
  ['KRW', 'out', 'Local wire', 'South Korea', 'Instant to T+1'],
  ['MYR', 'out', 'RPP / DuitNow', 'Malaysia', 'Instant to T+1', 'MYR 1,000,000'],
  ['NZD', 'out', 'Local wire', 'New Zealand', 'T+0'],
  ['PHP', 'both', 'InstaPay (banks + e-wallets)', 'Philippines', 'Instant', 'PHP 50,000'],
  ['PHP', 'both', 'PESONet (banks + e-wallets)', 'Philippines', 'T+0 to T+1', 'PHP 10,000,000'],
  ['PKR', 'out', 'Raast / e-wallets', 'Pakistan', 'Instant', 'PKR 50,000 for e-wallets'],
  ['BDT', 'out', 'Local wire / e-wallets', 'Bangladesh', 'Instant', 'BDT 250,000 for e-wallets'],
  ['SAR', 'out', 'Sarie Instant', 'Saudi Arabia', 'Instant to T+0'],
  ['THB', 'out', 'PromptPay', 'Thailand', 'Instant', 'THB 49,999–9,999,999'],
  ['TRY', 'out', 'FAST', 'Türkiye', 'Instant', 'TRY 100,000'],
  ['TRY', 'out', 'EFT', 'Türkiye', 'T+0 to T+1'],
  ['VND', 'out', 'NAPAS', 'Vietnam', 'Instant to T+0'],
]

const dueRoutes: PaymentRoute[] = dueCorridors.flatMap(
  ([currency, direction, rail, region, settlement, limit, note]) => {
    const routes: PaymentRoute[] = []
    const common = {
      provider: 'Due',
      providerUrl: DUE_SOURCE,
      category: 'Fiat' as const,
      region,
      settlement,
      limit,
      note,
    }

    if (direction === 'in' || direction === 'both') {
      routes.push({
        sourceRail: rail,
        sourceCurrency: currency,
        destinationRail: 'Tempo',
        destinationCurrency: 'USDC',
        ...common,
      })
    }

    if (direction === 'out' || direction === 'both') {
      routes.push({
        sourceRail: 'Tempo',
        sourceCurrency: 'USDC',
        destinationRail: rail,
        destinationCurrency: currency,
        ...common,
      })
    }

    return routes
  },
)

type FonbnkCorridor = [region: string, currency: string, rail: string, direction?: 'both' | 'out']

const FONBNK_SOURCE = 'https://docs.fonbnk.com/supported-countries-and-cryptocurrencies'
const fonbnkCorridors: FonbnkCorridor[] = [
  ['Benin', 'XOF', 'Mobile money'],
  ['Brazil', 'BRL', 'Bank transfer'],
  ['Burkina Faso', 'XOF', 'Mobile money'],
  ['Cameroon', 'XAF', 'Mobile money'],
  ['Gabon', 'XAF', 'Mobile money'],
  ['Ghana', 'GHS', 'Mobile money'],
  ['Ivory Coast', 'XOF', 'Mobile money'],
  ['Kenya', 'KES', 'Mobile money'],
  ['Malawi', 'MWK', 'Airtime', 'out'],
  ['Nigeria', 'NGN', 'Bank transfer'],
  ['Republic of the Congo', 'XAF', 'Mobile money'],
  ['Rwanda', 'RWF', 'Airtime', 'out'],
  ['Senegal', 'XOF', 'Mobile money'],
  ['South Africa', 'ZAR', 'Bank transfer'],
  ['Tanzania', 'TZS', 'Mobile money'],
  ['Uganda', 'UGX', 'Mobile money'],
  ['Zambia', 'ZMW', 'Mobile money'],
]

const fonbnkRoutes: PaymentRoute[] = fonbnkCorridors.flatMap(
  ([region, currency, rail, direction = 'both']) => {
    const common = {
      provider: 'Fonbnk',
      providerUrl: FONBNK_SOURCE,
      category: 'Fiat' as const,
      region,
      note: 'Availability and limits depend on the account and current provider quote.',
    }
    const routes: PaymentRoute[] = [
      {
        sourceRail: 'Tempo',
        sourceCurrency: 'pathUSD',
        destinationRail: rail,
        destinationCurrency: currency,
        ...common,
      },
    ]

    if (direction === 'both') {
      routes.push(
        {
          sourceRail: rail,
          sourceCurrency: currency,
          destinationRail: 'Tempo',
          destinationCurrency: 'pathUSD',
          ...common,
        },
        {
          sourceRail: rail,
          sourceCurrency: currency,
          destinationRail: 'Tempo',
          destinationCurrency: 'USDC.e',
          ...common,
          note: 'USDC.e is available for on-ramp routes only. Confirm current availability and limits with Fonbnk.',
        },
      )
    }

    return routes
  },
)

const crossChainRoutes: PaymentRoute[] = [
  ...['Ethereum', 'Arbitrum', 'Base', 'Optimism', 'Polygon', 'Avalanche'].flatMap(
    (chain): PaymentRoute[] => [
      {
        sourceRail: chain,
        sourceCurrency: 'USDC',
        destinationRail: 'Tempo',
        destinationCurrency: 'USDC.e',
        provider: 'LayerZero / Stargate',
        providerUrl: '/docs/guide/bridge-layerzero',
        category: 'Cross-chain',
        note:
          chain === 'Ethereum'
            ? '0 bps Stargate transfer fee.'
            : 'Quote required; fees are route-dependent.',
      },
      {
        sourceRail: 'Tempo',
        sourceCurrency: 'USDC.e',
        destinationRail: chain,
        destinationCurrency: 'USDC',
        provider: 'LayerZero / Stargate',
        providerUrl: '/docs/guide/bridge-layerzero',
        category: 'Cross-chain',
        note:
          chain === 'Ethereum'
            ? '0 bps Stargate transfer fee.'
            : 'Quote required; fees are route-dependent.',
      },
    ],
  ),
  {
    sourceRail: 'Base',
    sourceCurrency: 'USDC',
    destinationRail: 'Tempo',
    destinationCurrency: 'USDC.e',
    provider: 'Bungee',
    providerUrl: '/docs/guide/bridge-bungee',
    category: 'Cross-chain',
    note: 'Request a quote to confirm current availability and output.',
  },
  {
    sourceRail: 'Tempo',
    sourceCurrency: 'USDC.e',
    destinationRail: 'Base',
    destinationCurrency: 'USDC',
    provider: 'Bungee',
    providerUrl: '/docs/guide/bridge-bungee',
    category: 'Cross-chain',
    note: 'Request a quote to confirm current availability and output.',
  },
  {
    sourceRail: 'Base',
    sourceCurrency: 'USDC',
    destinationRail: 'Tempo',
    destinationCurrency: 'USDC.e',
    provider: 'Relay',
    providerUrl: '/docs/guide/bridge-relay',
    category: 'Cross-chain',
    settlement: 'Typically seconds',
    note: 'Request a quote to confirm current availability and output.',
  },
  {
    sourceRail: 'Tempo',
    sourceCurrency: 'USDC.e',
    destinationRail: 'Base',
    destinationCurrency: 'USDC',
    provider: 'Relay',
    providerUrl: '/docs/guide/bridge-relay',
    category: 'Cross-chain',
    settlement: 'Typically seconds',
    note: 'Request a quote to confirm current availability and output.',
  },
]

const exchangeRoutes: PaymentRoute[] = [
  ...['USDC.e', 'USDT0'].flatMap((currency): PaymentRoute[] => [
    {
      sourceRail: 'Kraken account',
      sourceCurrency: currency,
      destinationRail: 'Tempo',
      destinationCurrency: currency,
      provider: 'Kraken',
      providerUrl:
        'https://blog.kraken.com/product/new-features/usdt0-and-usdce-now-available-on-tempo',
      category: 'Exchange',
      note: 'Geographic restrictions may apply.',
    },
    {
      sourceRail: 'Tempo',
      sourceCurrency: currency,
      destinationRail: 'Kraken account',
      destinationCurrency: currency,
      provider: 'Kraken',
      providerUrl:
        'https://blog.kraken.com/product/new-features/usdt0-and-usdce-now-available-on-tempo',
      category: 'Exchange',
      note: 'Geographic restrictions may apply.',
    },
  ]),
  ...['USDT', 'USDT0'].flatMap((currency): PaymentRoute[] => [
    {
      sourceRail: 'OKX account',
      sourceCurrency: currency,
      destinationRail: 'Tempo',
      destinationCurrency: currency,
      provider: 'OKX',
      providerUrl:
        currency === 'USDT0'
          ? 'https://www.okx.com/en-us/learn/tempo-usdt0'
          : 'https://www.okx.com/en-us/help/okx-to-support-usdt-on-the-tempo-chain',
      category: 'Exchange',
      note: 'Account and regional eligibility requirements apply.',
    },
    {
      sourceRail: 'Tempo',
      sourceCurrency: currency,
      destinationRail: 'OKX account',
      destinationCurrency: currency,
      provider: 'OKX',
      providerUrl:
        currency === 'USDT0'
          ? 'https://www.okx.com/en-us/learn/tempo-usdt0'
          : 'https://www.okx.com/en-us/help/okx-to-support-usdt-on-the-tempo-chain',
      category: 'Exchange',
      note: 'Account and regional eligibility requirements apply.',
    },
  ]),
]

const moonPayRoutes: PaymentRoute[] = ['USDC.e', 'pathUSD'].map(
  (currency): PaymentRoute => ({
    sourceRail: 'MoonPay Ramps / Virtual Accounts',
    sourceCurrency: 'Supported fiat',
    destinationRail: 'Tempo',
    destinationCurrency: currency,
    provider: 'MoonPay',
    providerUrl: 'https://www.moonpay.com/newsroom/moonpay-tempo',
    category: 'Fiat',
    note: 'Fiat currency, payment method, country, and account eligibility vary. Confirm a live quote.',
  }),
)

export const paymentRoutes: PaymentRoute[] = [
  ...bridgeRoutes,
  ...dueRoutes,
  ...fonbnkRoutes,
  ...crossChainRoutes,
  ...exchangeRoutes,
  ...moonPayRoutes,
]

const providerReviewDates: Record<string, string> = {
  Bridge: 'October 6, 2026',
  Due: 'October 6, 2026',
  Fonbnk: 'October 6, 2026',
}

export function providerReviewedAt(provider: string): string {
  return providerReviewDates[provider] ?? 'August 22, 2026'
}
