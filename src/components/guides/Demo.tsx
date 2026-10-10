'use client'
import { useQueryClient } from '@tanstack/react-query'
import * as React from 'react'
import type { Address, BaseError } from 'viem'
import { tempoModerato } from 'viem/chains'
import { useAccount, useConnect, useConnections, useDisconnect } from 'wagmi'
import { Hooks } from 'wagmi/tempo'
import { cx, type Props as StyleProps } from 'zyzz'
import LucideCheck from '~icons/lucide/check'
import LucideCopy from '~icons/lucide/copy'
import LucideExternalLink from '~icons/lucide/external-link'
import LucidePictureInPicture2 from '~icons/lucide/picture-in-picture-2'
import LucideRotateCcw from '~icons/lucide/rotate-ccw'
import LucideWalletCards from '~icons/lucide/wallet-cards'
import { usePostHogTracking } from '../../lib/posthog'
import { button } from '../../styles/controls'
import { useTempoWalletConnector, useWebAuthnConnector } from '../../wagmi.config'
import { Badge } from '../Badge'
import { Container as ParentContainer } from '../Container'
import { CopyIconSwap } from '../CopyIconSwap'
import { isFundableWalletConnector } from '../lib/wallets'
import * as ui from './Demo.recipes'
import { alphaUsd } from './tokens'

export { alphaUsd, betaUsd, ousd, pathUsd, thetaUsd } from './tokens'

export const FAKE_RECIPIENT = '0xbeefcafe54750903ac1c8909323af7beb21ea2cb'
export const FAKE_RECIPIENT_2 = '0xdeadbeef54750903ac1c8909323af7beb21ea2cb'

export function useHydrated() {
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}

function getExplorerHost() {
  const { VITE_TEMPO_ENV, VITE_EXPLORER_OVERRIDE } = import.meta.env

  if (VITE_TEMPO_ENV !== 'testnet' && VITE_EXPLORER_OVERRIDE !== undefined)
    return VITE_EXPLORER_OVERRIDE

  return tempoModerato.blockExplorers.default.url
}

export function ExplorerLink({ hash, inline = false }: { hash: string; inline?: boolean }) {
  const { trackExternalLinkClick } = usePostHogTracking()
  const url = `${getExplorerHost()}/tx/${hash}`

  return (
    <div
      className={inline ? ui.explorerLinkLayout().className : ui.explorerLinkLayout2().className}
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        {...ui.explorerLinkLink()}
        onClick={() => trackExternalLinkClick(url, 'View receipt')}
      >
        View receipt
        <LucideExternalLink className={ui.lucideExternalLink().className} />
      </a>
    </div>
  )
}

export function ReceiptHash({ hash }: { hash: string }) {
  const [copied, copyToClipboard] = useCopyToClipboard()
  const { trackCopy } = usePostHogTracking()

  return (
    <div {...ui.receiptHashLayout()}>
      <span {...ui.receiptHashText()}>Receipt hash</span>
      <code {...ui.code()}>{hash}</code>
      <button
        type="button"
        {...ui.receiptHashButton()}
        onClick={() => {
          copyToClipboard(hash)
          trackCopy('code', hash)
        }}
        aria-label={copied ? 'Copied receipt hash' : 'Copy receipt hash'}
        title={copied ? 'Copied' : 'Copy receipt hash'}
      >
        <CopyIconSwap
          copied={copied}
          copyIcon={<LucideCopy className={ui.lucideExternalLink().className} />}
          checkIcon={<LucideCheck className={ui.lucideExternalLink().className} />}
        />
      </button>
    </div>
  )
}

export function ExplorerAccountLink({
  address,
  inline = false,
  label = 'View account',
  tab,
}: {
  address: string
  inline?: boolean
  label?: string
  tab?: string
}) {
  const { trackExternalLinkClick } = usePostHogTracking()
  const url = `${getExplorerHost()}/address/${address}${tab ? `?tab=${tab}` : ''}`

  return (
    <div
      className={inline ? ui.explorerLinkLayout().className : ui.explorerLinkLayout2().className}
    >
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        {...ui.explorerLinkLink()}
        onClick={() => trackExternalLinkClick(url, label)}
      >
        {label}
        <LucideExternalLink className={ui.lucideExternalLink().className} />
      </a>
    </div>
  )
}

export function Container(
  props: React.PropsWithChildren<
    {
      name: string
      showBadge?: boolean | undefined
      showRestart?: boolean | undefined
    } & (
      | {
          footerVariant: undefined
        }
      | {
          footerVariant: 'balances'
          tokens: Address[]
          balanceSource?: 'webAuthn' | 'wallet' | undefined
        }
      | {
          footerVariant: 'source'
          src: string
        }
    )
  >,
) {
  const { children, name, showBadge = true, showRestart = true } = props
  const { address } = useAccount()
  const connections = useConnections()
  const disconnect = useDisconnect()
  const restart = React.useCallback(() => {
    disconnect.disconnect()
  }, [disconnect.disconnect, disconnect])

  const balanceAddress = React.useMemo(() => {
    if (props.footerVariant !== 'balances') return address

    const source = props.balanceSource
    if (!source) return address

    if (source === 'webAuthn') {
      const webAuthnConnection = connections.find(
        (c) => c.connector.id === 'webAuthn' || c.connector.id === 'xyz.tempo',
      )
      return webAuthnConnection?.accounts[0]
    }

    if (source === 'wallet') {
      const includeWebAuthn = import.meta.env.VITE_E2E === 'true'
      const walletConnection = connections.find((c) =>
        isFundableWalletConnector(c.connector, { includeWebAuthn }),
      )
      return walletConnection?.accounts[0]
    }

    return address
  }, [props, address, connections])

  const footerElement = React.useMemo(() => {
    if (props.footerVariant === 'balances')
      return (
        <Container.BalancesFooter address={balanceAddress} tokens={props.tokens || [alphaUsd]} />
      )
    if (props.footerVariant === 'source') return <Container.SourceFooter src={props.src} />
    return null
  }, [props, balanceAddress, Container])

  return (
    <ParentContainer
      headerLeft={
        <div {...ui.containerLayout()}>
          <h4 {...ui.containerHeading()}>{name}</h4>
          {showBadge && <Badge variant="blue">Demo</Badge>}
        </div>
      }
      headerRight={
        <div>
          {showRestart && address && (
            <button type="button" onClick={restart} {...ui.containerButton()}>
              <LucideRotateCcw className={ui.lucideRotateCcw().className} />
              Restart
            </button>
          )}
        </div>
      }
      footer={footerElement}
    >
      <div {...ui.containerLayout2()}>{children}</div>
    </ParentContainer>
  )
}

export namespace Container {
  function BalancesFooterItem(props: { address: Address; token: Address }) {
    const queryClient = useQueryClient()
    const { address, token } = props
    const {
      data: balance,
      isPending: balanceIsPending,
      queryKey: balancesKey,
    } = Hooks.token.useGetBalance({
      account: address,
      token,
    })
    const { data: metadata, isPending: metadataIsPending } = Hooks.token.useGetMetadata({
      token,
    })

    Hooks.token.useWatchTransfer({
      token,
      args: {
        to: address,
      },
      onTransfer: () => {
        queryClient.invalidateQueries({ queryKey: balancesKey })
      },
      enabled: !!address,
    })

    Hooks.token.useWatchTransfer({
      token,
      args: {
        from: address,
      },
      onTransfer: () => {
        queryClient.invalidateQueries({ queryKey: balancesKey })
      },
      enabled: !!address,
    })

    const isPending = balanceIsPending || metadataIsPending
    const isUndefined = balance === undefined || metadata === undefined

    return (
      <div>
        {isPending || isUndefined ? (
          <span />
        ) : (
          <span {...ui.balancesFooterItemText()}>
            <span {...ui.balancesFooterItemText2()}>{balance.formatted}</span>
            {metadata.symbol}
          </span>
        )}
      </div>
    )
  }

  export function BalancesFooter(props: { address?: string | undefined; tokens: Address[] }) {
    const { address, tokens } = props
    const personalBalanceLabel = tokens.length > 1 ? 'Personal balances' : 'Personal balance'

    return (
      <div {...ui.balancesFooterLayout()}>
        <div {...ui.balancesFooterLayout2()}>
          <span {...ui.balancesFooterItemText2()}>{personalBalanceLabel}</span>
          <div {...ui.balancesFooterLayout3()} />
          <div {...ui.balancesFooterLayout4()}>
            {address ? (
              tokens.map((token) => (
                <BalancesFooterItem key={token} address={address as Address} token={token} />
              ))
            ) : (
              <span {...ui.receiptHashText()}>No account detected</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  export function SourceFooter(props: { src: string }) {
    const { src } = props
    const [isCopied, copy] = useCopyToClipboard()
    const { trackCopy, trackDemo, trackExternalLinkClick } = usePostHogTracking()
    const command = `pnpx gitpick ${src}`

    return (
      <div {...ui.sourceFooterLayout()}>
        {/** biome-ignore lint/a11y/noStaticElementInteractions: _ */}
        {/** biome-ignore lint/a11y/useKeyWithClickEvents: _ */}
        <div
          {...ui.sourceFooterLayout2()}
          onClick={() => {
            copy(command)
            trackCopy('command', command)
          }}
          title="Copy to clipboard"
        >
          <div>
            <span {...ui.balancesFooterItemText2()}>pnpx gitpick</span> {src}
          </div>
          <CopyIconSwap
            copied={isCopied}
            copyIcon={<LucideCopy className={ui.lucideCheck().className} />}
            checkIcon={<LucideCheck className={ui.lucideCheck().className} />}
          />
        </div>
        <div {...ui.sourceFooterLayout3()}>
          <a
            {...ui.sourceFooterLink()}
            href={`https://github.com/${src}`}
            rel="noreferrer"
            target="_blank"
            onClick={() => {
              trackDemo(
                'source_click',
                undefined,
                undefined,
                undefined,
                `https://github.com/${src}`,
              )
              trackExternalLinkClick(`https://github.com/${src}`, 'Source')
            }}
          >
            Source <LucideExternalLink className={ui.lucideExternalLink2().className} />
          </a>
        </div>
      </div>
    )
  }
}

export function Step(
  props: React.PropsWithChildren<{
    actions?: React.ReactNode | undefined
    active: boolean
    completed: boolean
    error?: BaseError | Error | null | undefined
    number: number
    title: React.ReactNode
  }>,
) {
  const { actions, active, children, completed, error, number, title } = props
  return (
    <div data-active={active} data-completed={completed} className="group">
      <header {...ui.stepHeader()}>
        <div {...ui.stepLayout()}>
          <div
            {...cx(
              ui.stepLayout2(),
              !!completed && ui.stepLayout3(),
              !completed && ui.stepLayout4(),
            )}
          >
            {completed ? <LucideCheck className={ui.lucideCheck2().className} /> : number}
          </div>
          <div {...ui.stepLayout5()}>{title}</div>
        </div>
        <div {...ui.stepLayout6()}>{actions}</div>
      </header>
      {children}
      {error && (
        <>
          <div {...ui.stepLayout7()} />
          <div {...ui.stepLayout8()}>
            {'shortMessage' in error ? error.shortMessage : error.message}
          </div>
        </>
      )}
    </div>
  )
}

export namespace StringFormatter {
  export function truncate(
    str: string,
    {
      start = 8,
      end = 6,
      separator = '\u2026',
    }: {
      start?: number | undefined
      end?: number | undefined
      separator?: string | undefined
    } = {},
  ) {
    if (str.length <= start + end) return str
    return `${str.slice(0, start)}${separator}${str.slice(-end)}`
  }
}

export function Login() {
  const connect = useConnect()
  const disconnect = useDisconnect()
  const hydrated = useHydrated()
  const tempoWallet = useTempoWalletConnector()
  const webAuthn = useWebAuthnConnector()
  const isE2E = import.meta.env.VITE_E2E === 'true'
  const connector = isE2E ? webAuthn : tempoWallet

  if (!hydrated || !connector)
    return (
      <Button disabled variant="default">
        Loading account
      </Button>
    )

  return (
    <div {...ui.loginLayout()}>
      {connect.isPending ? (
        <Button disabled variant="default">
          <LucidePictureInPicture2 className={ui.lucidePictureInPicture2().className} />
          Check prompt
        </Button>
      ) : (
        <Button
          variant="accent"
          className={ui.loginButton().className}
          onClick={async () => {
            await disconnect.disconnectAsync().catch(() => {})
            connect.connect({
              connector,
              ...(isE2E
                ? { capabilities: { method: 'register' as const, name: 'Tempo Docs' } }
                : {}),
            })
          }}
          type="button"
        >
          Sign in
        </Button>
      )}
      {connect.error && (
        <div {...ui.loginLayout2()}>
          {'shortMessage' in connect.error ? connect.error.shortMessage : connect.error.message}
        </div>
      )}
    </div>
  )
}

export function Logout({ label = 'Sign out' }: { label?: string } = {}) {
  const { address, connector } = useAccount()
  const disconnect = useDisconnect()
  const [copied, copyToClipboard] = useCopyToClipboard()
  const { trackCopy, trackButtonClick } = usePostHogTracking()
  if (!address) return null
  return (
    <div {...ui.sourceFooterLink()}>
      <Button
        onClick={() => {
          copyToClipboard(address)
          trackCopy('code', address)
        }}
        variant="default"
      >
        {copied ? (
          <LucideCheck className={ui.lucideCheck3().className} />
        ) : (
          <LucideWalletCards className={ui.lucideCheck3().className} />
        )}
        {StringFormatter.truncate(address, {
          start: 6,
          end: 4,
          separator: '⋅⋅⋅',
        })}
      </Button>
      <Button
        variant="destructive"
        className={ui.loginButton().className}
        onClick={() => {
          disconnect.disconnect({ connector })
          trackButtonClick(label, 'destructive')
        }}
        type="button"
      >
        {label}
      </Button>
    </div>
  )
}

export function Button(
  props: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> &
    StyleProps.Variants<typeof button> & {
      render?: React.ReactElement
    },
) {
  const { className, disabled, render, size, static: static_, variant, ...rest } = props
  const Element = render ? (p: typeof props) => React.cloneElement(render, p) : 'button'
  return (
    <Element
      disabled={disabled ? true : undefined}
      {...button({
        className,
        disabled,
        size,
        static: static_,
        variant,
      })}
      {...rest}
    />
  )
}

export function useCopyToClipboard(props?: useCopyToClipboard.Props) {
  const { timeout = 1_500 } = props ?? {}

  const [isCopied, setIsCopied] = React.useState(false)

  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyToClipboard: useCopyToClipboard.CopyFn = React.useCallback(
    async (text) => {
      if (!navigator?.clipboard) {
        console.warn('Clipboard API not supported')
        return false
      }

      if (timer.current) clearTimeout(timer.current)

      try {
        await navigator.clipboard.writeText(text)
        setIsCopied(true)
        timer.current = setTimeout(() => setIsCopied(false), timeout)
        return true
      } catch (error) {
        console.error('Failed to copy text: ', error)
        return false
      }
    },
    [timeout],
  )

  return [isCopied, copyToClipboard] as const
}

export declare namespace useCopyToClipboard {
  type CopyFn = (text: string) => Promise<boolean>
  type Props = {
    timeout?: number
  }
}

/** The Tempo "T" mark inside a square, with the T cut out. Inherits `currentColor`. */
export function TempoMarkBoxed(props: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={props.className}
      fill="currentColor"
      height="28"
      role="img"
      viewBox="0 0 28 28"
      width="28"
    >
      <path
        clipRule="evenodd"
        d="M0 0h28v28H0V0Zm12.094 21H8.444L11.827 10.173H7.5L8.444 7H20.5l-.944 3.173H15.46L12.094 21Z"
        fillRule="evenodd"
      />
    </svg>
  )
}
