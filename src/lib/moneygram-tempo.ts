import type { Account, Address, Chain, Client, Hash, Transport } from 'viem'
import { formatUnits, getAddress, isAddress, parseUnits } from 'viem'
import { Actions } from 'viem/tempo'

export type MoneyGramRampMode = 'off-ramp' | 'on-ramp'

export interface MoneyGramSession {
  sessionId: string
  sessionToken: string
  widgetUrl: string
}

export interface MoneyGramCustomer {
  firstName?: string
  middleName?: string
  lastName?: string
  secondLastName?: string
  dateOfBirth?: string
  email?: string
  phone?: string
  addressLine1?: string
  city?: string
  postalCode?: string
  countryCode?: string
  countrySubdivisionCode?: string
  birthCountryCode?: string
  citizenshipCountryCode?: string
  idType?: 'PAS' | 'DRV' | 'STA' | 'GOV'
  idNumber?: string
  idIssueCountry?: string
  idCountrySubdivisionCode?: string
}

export interface MoneyGramTransaction {
  id: string
  referenceNumber: string
  amount: string
  asset: 'USDC'
  status: string
  createdAt: number
}

type TempoClient = Client<Transport, Chain, Account>

export interface MoneyGramTempoOptions {
  client: TempoClient
  container: HTMLElement
  sessionUrl: string
  walletAddress: Address
  mode?: MoneyGramRampMode
  amount?: string
  customer?: MoneyGramCustomer
  destinationCountry?: string
  destinationSubdivision?: string
  viewTransactionId?: string
  theme?: 'light' | 'dark'
  apiBaseUrl?: string
  /** Allow only tokens provisioned by MoneyGram for this environment. */
  allowedTokens: readonly Address[]
  onClose?: () => void
  onTransaction?: (transaction: MoneyGramTransaction) => void
}

interface BridgeMessage {
  type?: string
  payload?: Record<string, unknown>
}

interface SignPayload {
  chain: string
  requiredNetwork: string
  chainId: number
  to: string
  amount: string
  asset: string
  tokenAddress: string
  tokenDecimals: number
}

function cleanCustomer(customer?: MoneyGramCustomer) {
  if (!customer) return undefined
  const values = Object.entries(customer).flatMap(([key, value]) => {
    const cleaned = value?.trim()
    return cleaned ? [[key, cleaned]] : []
  })
  return values.length ? Object.fromEntries(values) : undefined
}

function readSignPayload(payload: Record<string, unknown> | undefined): SignPayload {
  const value = payload ?? {}
  const parsed: SignPayload = {
    chain: String(value.chain ?? ''),
    requiredNetwork: String(value.requiredNetwork ?? ''),
    chainId: Number(value.chainId),
    to: String(value.to ?? ''),
    amount: String(value.amount ?? ''),
    asset: String(value.asset ?? ''),
    tokenAddress: String(value.tokenAddress ?? ''),
    tokenDecimals: Number(value.tokenDecimals),
  }

  if (parsed.chain !== 'tempo') throw new Error('MoneyGram requested a non-Tempo transfer')
  if (!Number.isSafeInteger(parsed.chainId))
    throw new Error('MoneyGram omitted a valid Tempo chain ID')
  if (!isAddress(parsed.to)) throw new Error('MoneyGram returned an invalid recipient address')
  if (!isAddress(parsed.tokenAddress))
    throw new Error('MoneyGram returned an invalid token address')
  if (
    !Number.isInteger(parsed.tokenDecimals) ||
    parsed.tokenDecimals < 0 ||
    parsed.tokenDecimals > 255
  )
    throw new Error('MoneyGram returned invalid token decimals')
  if (parsed.asset !== 'USDC') throw new Error('MoneyGram requested an unsupported asset')
  parseUnits(parsed.amount, parsed.tokenDecimals)
  return parsed
}

export class MoneyGramTempo {
  readonly #options: MoneyGramTempoOptions
  #frame?: HTMLIFrameElement
  #session?: MoneyGramSession
  #widgetOrigin?: string
  #pendingAmount = ''
  #onMessage = (event: MessageEvent) => void this.#handleMessage(event)

  constructor(options: MoneyGramTempoOptions) {
    this.#options = options
  }

  async mount() {
    if (this.#frame) throw new Error('MoneyGram Tempo is already mounted')

    const response = await fetch(this.#options.sessionUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`MoneyGram session creation failed (${response.status})`)

    this.#session = (await response.json()) as MoneyGramSession
    const widgetUrl = new URL(this.#session.widgetUrl)
    this.#widgetOrigin = widgetUrl.origin
    widgetUrl.searchParams.set('mode', this.#options.mode ?? 'off-ramp')
    widgetUrl.searchParams.set('_t', String(Date.now()))
    if (this.#options.viewTransactionId)
      widgetUrl.searchParams.set('transactionId', this.#options.viewTransactionId)

    const frame = document.createElement('iframe')
    frame.src = widgetUrl.toString()
    frame.title = 'MoneyGram cash ramp'
    frame.allow = 'camera; geolocation'
    frame.style.border = '0'
    frame.style.width = '100%'
    frame.style.height = '100%'
    this.#frame = frame
    window.addEventListener('message', this.#onMessage)
    this.#options.container.replaceChildren(frame)
  }

  destroy() {
    window.removeEventListener('message', this.#onMessage)
    this.#frame?.remove()
    this.#frame = undefined
    this.#session = undefined
    this.#widgetOrigin = undefined
  }

  #post(type: string, payload?: Record<string, unknown>) {
    if (!this.#frame?.contentWindow || !this.#widgetOrigin) return
    this.#frame.contentWindow.postMessage(
      payload ? { type, payload } : { type },
      this.#widgetOrigin,
    )
  }

  async #handleMessage(event: MessageEvent) {
    if (
      event.origin !== this.#widgetOrigin ||
      event.source !== this.#frame?.contentWindow ||
      !event.data ||
      typeof event.data !== 'object'
    )
      return

    const { type, payload } = event.data as BridgeMessage
    switch (type) {
      case 'RAMPS_READY': {
        const customer = cleanCustomer(this.#options.customer)
        const mode = this.#options.mode ?? 'off-ramp'
        this.#post('RAMPS_CONFIG', {
          sessionToken: this.#session?.sessionToken,
          wallet: {
            address: this.#options.walletAddress,
            chain: 'tempo',
            asset: 'USDC',
            walletType: 'non-custodial',
          },
          ...(this.#options.apiBaseUrl
            ? { devConfig: { mockMode: false, apiBaseUrl: this.#options.apiBaseUrl } }
            : {}),
          theme: this.#options.theme ?? 'dark',
          ...(customer ? { customer } : {}),
          ...(!this.#options.viewTransactionId
            ? {
                transaction: {
                  type: mode,
                  asset: 'USDC',
                  ...(this.#options.amount ? { amount: this.#options.amount } : {}),
                  ...(mode === 'off-ramp' && this.#options.destinationCountry
                    ? { destinationCountry: this.#options.destinationCountry }
                    : {}),
                  ...(mode === 'off-ramp' && this.#options.destinationSubdivision
                    ? { destinationSubdivision: this.#options.destinationSubdivision }
                    : {}),
                },
              }
            : { mode: 'view', transactionId: this.#options.viewTransactionId }),
        })
        break
      }

      case 'RAMPS_CHECK_BALANCE': {
        try {
          const sign = readSignPayload(payload)
          this.#validateRequest(sign)
          const balance = await Actions.token.getBalance(this.#options.client, {
            account: this.#options.walletAddress,
            token: getAddress(sign.tokenAddress),
          })
          const requested = parseUnits(sign.amount, sign.tokenDecimals)
          this.#post('RAMPS_BALANCE_RESULT', {
            walletAddress: this.#options.walletAddress,
            balance: formatUnits(balance.amount, sign.tokenDecimals),
            asset: 'USDC',
            blockchainNetwork: sign.requiredNetwork,
            sufficient: balance.amount >= requested,
          })
        } catch (error) {
          this.#post('RAMPS_BALANCE_RESULT', {
            walletAddress: this.#options.walletAddress,
            balance: '0',
            asset: 'USDC',
            sufficient: false,
            error: error instanceof Error ? error.message : 'Balance check failed',
          })
        }
        break
      }

      case 'RAMPS_SIGN_TRANSACTION': {
        try {
          const sign = readSignPayload(payload)
          this.#validateRequest(sign)
          this.#pendingAmount = sign.amount
          const { receipt } = await Actions.token.transferSync(this.#options.client, {
            account: this.#options.walletAddress,
            amount: parseUnits(sign.amount, sign.tokenDecimals),
            feeToken: getAddress(sign.tokenAddress),
            to: getAddress(sign.to),
            token: getAddress(sign.tokenAddress),
          })
          this.#post('RAMPS_SIGN_SUCCESS', {
            txHash: receipt.transactionHash satisfies Hash,
            walletAddress: this.#options.walletAddress,
          })
        } catch (error) {
          this.#post('RAMPS_SIGN_ERROR', {
            error: error instanceof Error ? error.message : 'Tempo transfer failed',
          })
        }
        break
      }

      case 'RAMPS_TRANSACTION_COMPLETE': {
        const transaction: MoneyGramTransaction = {
          id: String(payload?.id ?? ''),
          referenceNumber: String(payload?.referenceNumber ?? ''),
          amount: String(payload?.amount ?? this.#pendingAmount),
          asset: 'USDC',
          status: String(payload?.status ?? 'completed'),
          createdAt: Date.now(),
        }
        this.#options.onTransaction?.(transaction)
        break
      }

      case 'RAMPS_CLOSE':
        this.#options.onClose?.()
        break

      case 'RAMPS_OPEN_URL': {
        const url = String(payload?.url ?? '')
        if (url.startsWith('https://')) window.open(url, '_blank', 'noopener,noreferrer')
        break
      }
    }
  }

  #validateRequest(sign: SignPayload) {
    if (sign.chainId !== this.#options.client.chain?.id)
      throw new Error(
        `MoneyGram requested chain ${sign.chainId}; wallet is on ${this.#options.client.chain?.id}`,
      )
    const allowed = new Set(this.#options.allowedTokens.map((token) => token.toLowerCase()))
    if (!allowed.has(sign.tokenAddress.toLowerCase()))
      throw new Error('MoneyGram requested an unapproved token')
  }
}
