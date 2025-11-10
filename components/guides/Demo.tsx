import { useMutation } from '@tanstack/react-query'
import type { VariantProps } from 'cva'
import * as React from 'react'
import { Actions } from 'tempo.ts/viem'
import { Hooks } from 'tempo.ts/wagmi'
import {
  type Chain,
  type Client,
  formatUnits,
  parseUnits,
  stringify,
  type Transport,
} from 'viem'
import { mnemonicToAccount } from 'viem/accounts'
import {
  useAccount,
  useAccountEffect,
  useBlockNumber,
  useClient,
  useConnect,
  useConnectors,
  useDisconnect,
} from 'wagmi'
import LucideCheck from '~icons/lucide/check'
import LucideCopy from '~icons/lucide/copy'
import LucideCopyCheck from '~icons/lucide/copy-check'
import LucidePictureInPicture2 from '~icons/lucide/picture-in-picture-2'
import LucideRotateCcw from '~icons/lucide/rotate-ccw'
import LucideWalletCards from '~icons/lucide/wallet-cards'
import { cva, cx } from '../../cva.config'
import { Container as ParentContainer } from '../Container'

const alphaUsd = '0x20c0000000000000000000000000000000000001'

export function Connect(props: { stepNumber?: number | undefined }) {
  const { stepNumber = 1 } = props
  const { address } = useAccount()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const connectors = useConnectors()
  // biome-ignore lint/style/noNonNullAssertion: defined
  const connector = React.useMemo(() => connectors[0]!, [connectors])
  const [copied, setCopied] = React.useState(false)
  const copyToClipboard = React.useCallback(() => {
    if (!address) return
    if (copied) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2_000)
  }, [address, copied])
  return (
    <Step
      active={!address}
      completed={Boolean(address)}
      actions={
        address ? (
          <div className="flex items-center gap-1">
            <Button onClick={copyToClipboard} variant="default">
              {copied ? (
                <LucideCheck className="text-gray9 mt-px" />
              ) : (
                <LucideWalletCards className="text-gray9 mt-px" />
              )}
              {StringFormatter.truncate(address, {
                start: 6,
                end: 4,
                separator: '⋅⋅⋅',
              })}
            </Button>
            <Button
              variant="destructive"
              className="text-[14px] -tracking-[2%] font-[510]"
              onClick={() => disconnect.disconnect({ connector })}
              type="button"
            >
              Sign out
            </Button>
          </div>
        ) : (
          <div>
            {connect.isPending ? (
              <Button disabled variant="default">
                <LucidePictureInPicture2 className="mt-px" />
                Check prompt
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="accent"
                  className="text-[14px] -tracking-[2%] font-[510]"
                  onClick={() => connect.connect({ connector })}
                  type="button"
                >
                  Sign in
                </Button>
                <Button
                  variant="default"
                  className="text-[14px] -tracking-[2%] font-[510]"
                  onClick={() =>
                    connect.connect({
                      connector,
                      capabilities: {
                        createAccount: { label: 'Tempo Docs' },
                      },
                    })
                  }
                  type="button"
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        )
      }
      number={stepNumber}
      title="Create an account, or use an existing one."
    />
  )
}

export function AddFunds(props: { stepNumber?: number | undefined }) {
  const { stepNumber = 2 } = props
  const { address } = useAccount()
  const { data: balance, refetch: balanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })
  const { data: blockNumber } = useBlockNumber({
    query: {
      enabled: Boolean(address && (!balance || balance < 0)),
      refetchInterval: 1_500,
    },
  })
  React.useEffect(() => {
    balanceRefetch()
  }, [blockNumber])
  const client = useClient()
  const fundAccount = useMutation({
    async mutationFn() {
      if (!address) throw new Error('account.address not found')
      if (!client) throw new Error('client not found')

      if (import.meta.env.VITE_LOCAL !== 'true')
        // biome-ignore lint/suspicious/noExplicitAny: pass
        await client.request<any>({
          method: 'tempo_fundAddress',
          params: [address],
        })
      else
        await Actions.token.transferSync(client as Client<Transport, Chain>, {
          account: mnemonicToAccount(
            'test test test test test test test test test test test junk',
          ),
          amount: parseUnits('10000', 6),
          to: address,
          token: alphaUsd,
        })
      await new Promise((resolve) => setTimeout(resolve, 400))
      balanceRefetch()
    },
  })
  return (
    <Step
      active={Boolean(address && !balance)}
      completed={Boolean(address && balance && balance > 0n)}
      actions={
        balance && balance > 0n ? (
          <Button
            disabled={fundAccount.isPending}
            variant="default"
            className="text-[14px] -tracking-[2%] font-[510]"
            onClick={() => fundAccount.mutate()}
            type="button"
          >
            {fundAccount.isPending ? 'Adding funds' : 'Add more funds'}
          </Button>
        ) : (
          <Button
            disabled={!address || fundAccount.isPending}
            variant={address ? 'accent' : 'default'}
            className="text-[14px] -tracking-[2%] font-[510]"
            type="button"
            onClick={() => fundAccount.mutate()}
          >
            {fundAccount.isPending ? 'Adding funds' : 'Add funds'}
          </Button>
        )
      }
      number={stepNumber}
      title="Add testnet funds to your account."
    />
  )
}

export function CreateToken(props: { stepNumber: number }) {
  const { stepNumber } = props
  const { address } = useAccount()
  const { data: balance, refetch: balanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })
  const [expanded, setExpanded] = React.useState(false)
  const create = Hooks.token.useCreateSync({
    mutation: {
      onSettled() {
        balanceRefetch()
      },
    },
  })
  useAccountEffect({
    onDisconnect() {
      setExpanded(false)
      create.reset()
    },
  })
  const [copied, setCopied] = React.useState(false)
  const copyToClipboard = React.useCallback(() => {
    if (copied) return
    navigator.clipboard.writeText(stringify(create.data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2_000)
  }, [create.data, copied])
  return (
    <Step
      active={Boolean(address && balance && balance > 0n)}
      completed={create.isSuccess}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="text-[14px] -tracking-[2%] font-[510]"
            type="button"
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant={
              address && balance && balance > 0n
                ? create.isSuccess
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={!(address && balance && balance > 0n)}
            onClick={() => setExpanded(true)}
            type="button"
            className="text-[14px] -tracking-[2%] font-[510]"
          >
            Create a token
          </Button>
        )
      }
      number={stepNumber}
      title="Create & deploy a token to testnet."
    >
      {expanded && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            <div>
              <h5 className="font-[510] text-[16px] -tracking-[1%] text-black dark:text-white">
                Token details
              </h5>
              <div className="text-gray10 text-[13px] -tracking-[1%] ">
                Enter the required fields to deploy your token.
              </div>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const formData = new FormData(event.target as HTMLFormElement)
                const name = formData.get('name') as string
                const symbol = formData.get('symbol') as string
                create.mutate({
                  name,
                  symbol,
                  currency: 'USD',
                })
              }}
              className="flex gap-2 flex-col md:items-end md:flex-row pe-8"
            >
              <div className="flex flex-col flex-1">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="name"
                >
                  Token name
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-[510] -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="name"
                  required
                  placeholder="demoUSD"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="symbol"
                >
                  Token symbol
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-[510] -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="symbol"
                  required
                  placeholder="DEMO"
                />
              </div>
              <Button
                variant="accent"
                type="submit"
                disabled={create.isPending}
              >
                {create.isPending ? 'Deploying...' : 'Deploy'}
              </Button>
            </form>
          </div>

          <div className="relative">
            <div
              className={cx(
                'bg-gray2 rounded-[10px] scrollbar-width-thin scrollbar-gray9 overflow-auto max-h-[169px] min-h-[169px]',
                !create.data &&
                  'flex items-center justify-center text-gray9 font-[510] text-[13px] -tracking-[2%] text-center',
                (create.data || create.error) &&
                  'text-[12px] font-mono whitespace-pre-wrap leading-[16px] p-3 -tracking-[2%] font-[500] text-black dark:text-white',
              )}
            >
              {create.data
                ? stringify(create.data, null, 2)
                : create.error
                  ? stringify(create.error, null, 2)
                  : 'RPC response will display here...'}
            </div>
            {create.data && (
              <button
                onClick={copyToClipboard}
                type="button"
                className="absolute end-3 bottom-3"
              >
                <span className="sr-only">Copy</span>
                {copied ? (
                  <LucideCopyCheck className="size-3.5 text-gray9" />
                ) : (
                  <LucideCopy className="size-3.5 text-gray9" />
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </Step>
  )
}

export function Container(
  props: React.PropsWithChildren<{
    name: string
  }>,
) {
  const { children, name } = props
  const { address } = useAccount()
  const { data: balance, isPending: balanceIsPending } =
    Hooks.token.useGetBalance({ account: address, token: alphaUsd })
  const disconnect = useDisconnect()
  const restart = React.useCallback(() => {
    disconnect.disconnect()
  }, [disconnect.disconnect])
  return (
    <ParentContainer
      headerLeft={
        <div className="flex gap-1.5 items-center">
          <h4 className="text-gray12 text-[13px] leading-none -tracking-[1%]">
            {name}
          </h4>
          <span className="text-[9px] text-[#F59E0B] h-[19px] flex items-center text-center justify-center bg-gray4 rounded-[30px] px-1.5 tracking-[2%] uppercase leading-none">
            demo
          </span>
        </div>
      }
      headerRight={
        <div>
          {address && (
            <button
              type="button"
              onClick={restart}
              className="flex items-center text-gray9 leading-none gap-1 text-[12.5px] tracking-[-1%]"
            >
              <LucideRotateCcw className="text-gray9 size-3 mt-px" />
              Restart
            </button>
          )}
        </div>
      }
      footer={
        <div className="text-[13px] gap-2 h-full flex items-center leading-none">
          <span className="text-gray10">Balances</span>
          <div className="h-[60%] w-px bg-gray4" />
          {address ? (
            balanceIsPending || balance === undefined ? (
              <span></span>
            ) : (
              <span className="flex gap-1">
                <span className="text-gray10">
                  {formatUnits(balance ?? 0n, 6)}
                </span>
                AlphaUSD
              </span>
            )
          ) : (
            <span className="text-gray9">No account detected</span>
          )}
        </div>
      }
    >
      {children}
    </ParentContainer>
  )
}

function Step(
  props: React.PropsWithChildren<{
    actions?: React.ReactNode | undefined
    active: boolean
    completed: boolean
    number: number
    title: React.ReactNode
  }>,
) {
  const { actions, active, children, completed, number, title } = props
  return (
    <div data-active={active} data-completed={completed} className="group">
      <header className="flex items-center justify-between p-4.5">
        <div className="flex items-center gap-3.5">
          <div
            className={cx(
              'text-[13px] dark:text-white text-black size-7 rounded-full text-center flex items-center justify-center tabular-nums opacity-40 group-data-[completed=true]:opacity-100',
              completed ? 'bg-green3' : 'bg-gray4',
            )}
          >
            {completed ? <LucideCheck className="text-green9" /> : number}
          </div>
          <div className="text-[14px] dark:text-white text-black -tracking-[1%] group-data-[active=false]:opacity-40">
            {title}
          </div>
        </div>
        <div className="opacity-40 group-data-[active=true]:opacity-100 group-data-[completed=true]:opacity-100">
          {actions}
        </div>
      </header>
      {children}
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

export function Button(
  props: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> &
    VariantProps<typeof buttonClassName> & {
      render?: React.ReactElement
    },
) {
  const {
    className,
    disabled,
    render,
    size,
    static: static_,
    variant,
    ...rest
  } = props
  const Element = render
    ? (p: typeof props) => React.cloneElement(render, p)
    : 'button'
  return (
    <Element
      className={buttonClassName({
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

const buttonClassName = cva({
  base: 'relative inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-default font-[510] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
  variants: {
    disabled: {
      true: 'pointer-events-none opacity-50',
    },
    size: {
      default: 'text-[14px] -tracking-[2%] h-[34px] px-[12px]',
    },
    static: {
      true: 'pointer-events-none',
    },
    variant: {
      accent: 'bg-accent text-white hover:not-active:bg-accentHover',
      accentTint:
        'bg-accentTint text-accent hover:not-active:bg-accentTintHover',
      default:
        'bg-surface text-primary text-surface hover:not-active:bg-surfaceHover',
      destructive:
        'bg-destructive text-destructive hover:not-active:bg-destructiveHover',
    },
  },
})

export function ConnectNav() {
  const account = useAccount()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const connectors = useConnectors()
  const connector = React.useMemo(() => connectors[0], [connectors])

  if (account.address)
    return (
      <div className="flex items-center gap-2">
        <Button onClick={() => disconnect.disconnect()} variant="destructive">
          Sign out
        </Button>
      </div>
    )
  if (connect.isPending)
    return (
      <div>
        <Button disabled>Check prompt</Button>
      </div>
    )
  if (!connector) return null
  return (
    <div className="flex gap-1.5">
      <Button
        className="h-[32px] px-[14px] text-[13px]"
        onClick={() =>
          connect.connect({
            connector,
            capabilities: {
              createAccount: { label: 'Tempo Docs' },
            },
          })
        }
        variant="default"
      >
        Sign up
      </Button>
      <Button
        className="h-[32px] px-[14px] text-[13px]"
        onClick={() => connect.connect({ connector })}
        variant="accentTint"
      >
        Sign in
      </Button>
    </div>
  )
}
