import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { VariantProps } from 'cva'
import * as React from 'react'
import type { TokenRole } from 'tempo.ts/ox'
import { Actions, Addresses, type Chain } from 'tempo.ts/viem'
import { Hooks } from 'tempo.ts/wagmi'
import {
  type Address,
  type Client,
  formatUnits,
  isAddress,
  pad,
  parseUnits,
  stringToHex,
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
  useSendTransactionSync,
} from 'wagmi'
import LucideCheck from '~icons/lucide/check'
import LucideCopy from '~icons/lucide/copy'
import LucideExternalLink from '~icons/lucide/external-link'
import LucidePictureInPicture2 from '~icons/lucide/picture-in-picture-2'
import LucideRotateCcw from '~icons/lucide/rotate-ccw'
import LucideWalletCards from '~icons/lucide/wallet-cards'
import { cva, cx } from '../../cva.config'
import { Container as ParentContainer } from '../Container'
import { useDemoContext } from '../DemoContext'
import { TokenSelector } from '../TokenSelector'

export const linkingUsd = '0x20c0000000000000000000000000000000000000'
export const alphaUsd = '0x20c0000000000000000000000000000000000001'
export const betaUsd = '0x20c0000000000000000000000000000000000002'
export const thetaUsd = '0x20c0000000000000000000000000000000000003'

// Current validator token on testnet
const validatorToken = alphaUsd

export type DemoStepProps = {
  stepNumber: number
  // if this is the last step in a flow
  last?: boolean
}

export function useWebAuthnConnector() {
  const connectors = useConnectors()
  return React.useMemo(
    // biome-ignore lint/style/noNonNullAssertion: webAuthn connector always defined in wagmi.config.ts
    () => connectors.find((connector) => connector.id === 'webAuthn')!,
    [connectors],
  )
}

export function Connect(props: DemoStepProps) {
  const { stepNumber = 1 } = props
  const { address } = useAccount()
  return (
    <Step
      active={!address}
      completed={Boolean(address)}
      actions={address ? <Logout /> : <Login />}
      number={stepNumber}
      title="Create an account, or use an existing one."
    />
  )
}

/**
 * BEGIN STEPS
 */

export function AddFunds(props: DemoStepProps) {
  const { stepNumber = 2, last = false } = props
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
      else {
        await Actions.token.transferSync(
          client as unknown as Client<Transport, Chain.Chain<null>>,
          {
            account: mnemonicToAccount(
              'test test test test test test test test test test test junk',
            ),
            amount: parseUnits('10000', 6),
            to: address,
            token: alphaUsd,
          },
        )
      }
      await new Promise((resolve) => setTimeout(resolve, 400))
      balanceRefetch()
    },
  })

  const showLogin = stepNumber === 1 && !address

  const active = React.useMemo(() => {
    // If we need to show the login button, we are active.
    if (showLogin) return true

    // If this is the last step, simply has to be logged in
    if (last) return !!address

    // If this is an intermediate step, also needs to not have succeeded
    return Boolean(address && !balance)
  }, [address, balance, last])

  const actions = React.useMemo(() => {
    if (showLogin) return <Login />
    if (balance && balance > 0n)
      return (
        <Button
          disabled={fundAccount.isPending}
          variant="default"
          className="text-[14px] -tracking-[2%] font-normal"
          onClick={() => fundAccount.mutate()}
          type="button"
        >
          {fundAccount.isPending ? 'Adding funds' : 'Add more funds'}
        </Button>
      )
    return (
      <Button
        disabled={!address || fundAccount.isPending}
        variant={address ? 'accent' : 'default'}
        className="text-[14px] -tracking-[2%] font-normal"
        type="button"
        onClick={() => fundAccount.mutate()}
      >
        {fundAccount.isPending ? 'Adding funds' : 'Add funds'}
      </Button>
    )
  }, [stepNumber, address, balance, fundAccount.isPending])

  return (
    <Step
      active={active}
      completed={Boolean(address && balance && balance > 0n)}
      actions={actions}
      number={stepNumber}
      title="Add testnet funds to your account."
    />
  )
}

export function CreateOrLoadToken(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { data: contextData, clearData } = useDemoContext()

  const { tokenAddress, tokenReceipt } = contextData

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })

  const handleClear = () => {
    clearData('tokenReceipt')
    clearData('tokenAddress')
  }

  if (last || !metadata || !tokenAddress) {
    return <CreateToken {...props} />
  }

  return (
    <Step
      active={false}
      completed={true}
      number={stepNumber}
      actions={
        <Button type="button" variant="default" onClick={handleClear}>
          Reset
        </Button>
      }
      title={`Using token ${metadata.name}`}
    >
      {tokenReceipt && (
        <div className="flex ml-6 flex-col gap-3 py-4">
          <div className="relative">
            <div
              className={cx(
                'bg-gray2 rounded-[10px] p-4 text-center text-gray9 font-normal text-[13px] -tracking-[2%] leading-snug flex flex-col items-center',
              )}
            >
              <div>
                Token{' '}
                <span className="text-primary font-medium">
                  {' '}
                  {metadata.name} ({metadata.symbol}){' '}
                </span>{' '}
                successfully created and deployed to Tempo!
              </div>
              <ExplorerLink hash={tokenReceipt.transactionHash ?? ''} />
            </div>
          </div>
        </div>
      )}
    </Step>
  )
}

export function CreateToken(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()
  const { setData } = useDemoContext()
  const { data: balance, refetch: balanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })
  const create = Hooks.token.useCreateSync({
    mutation: {
      onSettled(data) {
        balanceRefetch()
        if (data) {
          setData('tokenAddress', data.token)
          setData('tokenReceipt', data.receipt)
        }
      },
    },
  })
  useAccountEffect({
    onDisconnect() {
      create.reset()
    },
  })

  const showLogin = stepNumber === 1 && !address

  const active = React.useMemo(() => {
    // If we need to show the login button, we are active.
    if (showLogin) return true

    // If this is the last step has to be logged in and funded.
    const activeWithBalance = Boolean(address && balance && balance > 0n)
    if (last) return activeWithBalance

    // If this is an intermediate step, also needs to not have succeeded
    return activeWithBalance && !create.isSuccess
  }, [stepNumber, address, balance, create.isSuccess, last])

  return (
    <Step
      active={active}
      completed={create.isSuccess}
      number={stepNumber}
      actions={showLogin && <Login />}
      title="Create & deploy a token to testnet."
    >
      {(active || create.isSuccess) && (
        <div className="flex ml-6 flex-col gap-3 py-4">
          <div className="ps-5 border-gray4 border-s-2">
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
                  feeToken: alphaUsd,
                })
              }}
              className="flex gap-2 flex-col md:items-end md:flex-row -mt-2.5"
            >
              <div className="flex flex-col flex-1">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="name"
                >
                  Token name
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-lg text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="name"
                  required
                  spellCheck={false}
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
                  className="h-[34px] border border-gray4 px-3.25 rounded-lg text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="symbol"
                  required
                  spellCheck={false}
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

          {create.data && (
            <div className="relative">
              <div
                className={cx(
                  'bg-gray2 rounded-[10px] p-4 text-center text-gray9 font-normal text-[13px] -tracking-[2%] leading-snug flex flex-col items-center',
                )}
              >
                <div>
                  Token{' '}
                  <span className="text-primary font-medium">
                    {' '}
                    {create.data.name} ({create.data.symbol}){' '}
                  </span>{' '}
                  successfully created and deployed to Tempo!
                </div>
                <ExplorerLink
                  hash={create.data?.receipt.transactionHash ?? ''}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Step>
  )
}

export function SetSupplyCap(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()
  const { getData } = useDemoContext()
  const [expanded, setExpanded] = React.useState(false)

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata, refetch: refetchMetadata } =
    Hooks.token.useGetMetadata({
      token: tokenAddress,
    })

  const setSupplyCap = Hooks.token.useSetSupplyCapSync({
    mutation: {
      onSettled() {
        refetchMetadata()
      },
    },
  })

  useAccountEffect({
    onDisconnect() {
      setExpanded(false)
      setSupplyCap.reset()
    },
  })

  const handleSetSupplyCap = () => {
    if (!tokenAddress) return

    setSupplyCap.mutate({
      token: tokenAddress,
      supplyCap: parseUnits('1000', metadata?.decimals || 6),
      feeToken: alphaUsd,
    })
  }

  const active = Boolean(tokenAddress && address)
  const hasSupplyCap = Boolean(
    metadata?.supplyCap &&
      metadata.supplyCap <= parseUnits('1000', metadata.decimals || 6),
  )

  return (
    <Step
      active={active && (last ? true : !setSupplyCap.isSuccess)}
      completed={setSupplyCap.isSuccess || hasSupplyCap}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="text-[14px] -tracking-[2%] font-normal"
            type="button"
          >
            Hide
          </Button>
        ) : (
          <Button
            variant={
              active
                ? setSupplyCap.isSuccess
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={!active}
            onClick={() => setExpanded(true)}
            type="button"
            className="text-[14px] -tracking-[2%] font-normal"
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Set supply cap to 1,000 ${metadata ? metadata.name : 'tokens'}.`}
    >
      {expanded && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            <div className="flex gap-2 flex-col md:items-end md:flex-row pe-8 mt-2">
              <div className="flex flex-col flex-1">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="supplyCap"
                >
                  Supply cap amount
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="supplyCap"
                  value="1,000"
                  disabled={true}
                  onChange={() => {}}
                />
              </div>
              <Button
                variant={active ? 'accent' : 'default'}
                disabled={!active}
                onClick={handleSetSupplyCap}
                type="button"
                className="text-[14px] -tracking-[2%] font-normal"
              >
                {setSupplyCap.isPending ? 'Setting...' : 'Set Cap'}
              </Button>
            </div>
            {setSupplyCap.isSuccess && setSupplyCap.data && (
              <ExplorerLink hash={setSupplyCap.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}

export function GrantTokenRoles(
  props: DemoStepProps & {
    roles: TokenRole.TokenRole[]
  },
) {
  const { stepNumber, roles, last = false } = props
  const { address } = useAccount()
  const { getData } = useDemoContext()
  const queryClient = useQueryClient()

  const [expanded, setExpanded] = React.useState(false)

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })

  // Check if user has each requested role
  const roleChecks = roles.map((role) =>
    Hooks.token.useHasRole({
      account: address,
      token: tokenAddress,
      role: role,
    }),
  )

  // Check if user has all roles
  const hasAllRoles = roleChecks.every((check) => check.data === true)

  const grant = Hooks.token.useGrantRolesSync({
    mutation: {
      onSettled() {
        queryClient.refetchQueries({ queryKey: ['hasRole'] })
      },
    },
  })
  useAccountEffect({
    onDisconnect() {
      setExpanded(false)
      grant.reset()
    },
  })

  const handleGrant = async () => {
    if (!tokenAddress || !address) return

    await grant.mutate({
      token: tokenAddress,
      roles: roles,
      to: address,
      feeToken: alphaUsd,
    })
  }

  return (
    <Step
      active={
        !!tokenAddress && !hasAllRoles && (last ? true : !grant.isSuccess)
      }
      completed={grant.isSuccess || hasAllRoles}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="text-[14px] -tracking-[2%] font-normal"
            type="button"
          >
            Hide
          </Button>
        ) : (
          <Button
            variant={
              tokenAddress && !hasAllRoles
                ? grant.isSuccess
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={!tokenAddress || hasAllRoles}
            onClick={() => setExpanded(true)}
            type="button"
            className="text-[14px] -tracking-[2%] font-normal"
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Grant ${roles.join(', ')} role${roles.length > 1 ? 's' : ''} on ${metadata ? metadata.name : 'token'}.`}
    >
      {expanded && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            <div className="flex gap-2 flex-col md:items-end md:flex-row pe-8 mt-2">
              <div className="flex flex-col flex-2">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="recipient"
                >
                  Grant role to yourself
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="recipient"
                  value={address}
                  disabled={true}
                  onChange={() => {}}
                  placeholder="0x..."
                />
              </div>
              <Button
                variant={address ? 'accent' : 'default'}
                disabled={!address}
                onClick={handleGrant}
                type="button"
                className="text-[14px] -tracking-[2%] font-normal"
              >
                {grant.isPending ? 'Granting...' : 'Grant'}
              </Button>
            </div>
            {grant.isSuccess && grant.data && (
              <ExplorerLink hash={grant.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}

export function MintToken(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()
  const { getData } = useDemoContext()
  const queryClient = useQueryClient()

  const [memo, setMemo] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState(false)

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })
  const { data: hasRole } = Hooks.token.useHasRole({
    account: address,
    token: tokenAddress,
    role: 'issuer',
  })
  const { data: balance } = Hooks.token.useGetBalance({
    account: address,
    token: tokenAddress,
  })

  const mint = Hooks.token.useMintSync({
    mutation: {
      onSettled() {
        // refetch token balance for later steps in issuer demos
        queryClient.refetchQueries({ queryKey: ['getBalance'] })
      },
    },
  })
  useAccountEffect({
    onDisconnect() {
      setExpanded(false)
      mint.reset()
    },
  })

  const handleMint = async () => {
    if (!tokenAddress || !address || !metadata) return

    await mint.mutate({
      amount: parseUnits('100', metadata.decimals),
      to: address,
      token: tokenAddress,
      memo: memo ? pad(stringToHex(memo), { size: 32 }) : undefined,
      feeToken: alphaUsd,
    })
  }

  const hasSufficientBalance =
    balance && metadata && balance >= parseUnits('90', metadata.decimals)

  return (
    <Step
      active={Boolean(
        !!tokenAddress &&
          !!hasRole &&
          !hasSufficientBalance &&
          (last ? true : !mint.isSuccess),
      )}
      completed={mint.isSuccess || Boolean(hasSufficientBalance)}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="text-[14px] -tracking-[2%] font-normal"
            type="button"
          >
            Hide
          </Button>
        ) : (
          <Button
            variant={
              !!tokenAddress && !!hasRole && !hasSufficientBalance
                ? mint.isSuccess
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={Boolean(
              !tokenAddress || !hasRole || hasSufficientBalance,
            )}
            onClick={() => setExpanded(true)}
            type="button"
            className="text-[14px] -tracking-[2%] font-normal"
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Mint 100 ${metadata ? metadata.name : 'tokens'} to yourself.`}
    >
      {expanded && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            <div className="flex gap-2 flex-col md:items-end md:flex-row pe-8 mt-2">
              <div className="flex flex-col flex-2">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="recipient"
                >
                  Recipient address
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="recipient"
                  value={address}
                  disabled={true}
                  onChange={(_e) => {}}
                  placeholder="0x..."
                />
              </div>
              <div className="flex flex-col flex-1">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="memo"
                >
                  Memo (optional)
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="INV-12345"
                />
              </div>
              <Button
                variant={address ? 'accent' : 'default'}
                disabled={!address}
                onClick={handleMint}
                type="button"
                className="text-[14px] -tracking-[2%] font-normal"
              >
                {mint.isPending ? 'Minting...' : 'Mint'}
              </Button>
            </div>
            {mint.isSuccess && mint.data && (
              <ExplorerLink hash={mint.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}

export function BurnToken(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()
  const { getData } = useDemoContext()
  const queryClient = useQueryClient()

  const [memo, setMemo] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState(false)

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })
  const { data: hasRole } = Hooks.token.useHasRole({
    account: address,
    token: tokenAddress,
    role: 'issuer',
  })
  const { data: balance } = Hooks.token.useGetBalance({
    account: address,
    token: tokenAddress,
  })

  const burn = Hooks.token.useBurnSync({
    mutation: {
      onSettled() {
        // refetch token balance after burning
        queryClient.refetchQueries({ queryKey: ['getBalance'] })
      },
    },
  })
  useAccountEffect({
    onDisconnect() {
      setExpanded(false)
      burn.reset()
    },
  })

  const handleBurn = async () => {
    if (!tokenAddress || !address || !metadata) return

    await burn.mutate({
      amount: parseUnits('100', metadata.decimals),
      token: tokenAddress,
      memo: memo ? pad(stringToHex(memo), { size: 32 }) : undefined,
      feeToken: alphaUsd,
    })
  }

  const hasSufficientBalance =
    balance && metadata && balance >= parseUnits('100', metadata.decimals)
  const canBurn = !!tokenAddress && !!hasRole && hasSufficientBalance

  return (
    <Step
      active={Boolean(canBurn && (last ? true : !burn.isSuccess))}
      completed={burn.isSuccess}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="text-[14px] -tracking-[2%] font-normal"
            type="button"
          >
            Hide
          </Button>
        ) : (
          <Button
            variant={
              canBurn ? (burn.isSuccess ? 'default' : 'accent') : 'default'
            }
            disabled={!canBurn}
            onClick={() => setExpanded(true)}
            type="button"
            className="text-[14px] -tracking-[2%] font-normal"
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Burn 100 ${metadata ? metadata.name : 'tokens'} from yourself.`}
    >
      {expanded && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            <div className="flex gap-2 flex-col md:items-end md:flex-row pe-8 mt-2">
              <div className="flex flex-col flex-1">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="memo"
                >
                  Memo (optional)
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="INV-12345"
                />
              </div>
              <Button
                variant={address ? 'accent' : 'default'}
                disabled={!address}
                onClick={handleBurn}
                type="button"
                className="text-[14px] -tracking-[2%] font-normal"
              >
                {burn.isPending ? 'Burning...' : 'Burn'}
              </Button>
            </div>
            {burn.isSuccess && burn.data && (
              <ExplorerLink hash={burn.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}

export function PauseUnpauseTransfers(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()
  const { getData } = useDemoContext()

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata, refetch: refetchMetadata } =
    Hooks.token.useGetMetadata({
      token: tokenAddress,
    })

  // Check for pause and unpause roles
  const { data: hasPauseRole } = Hooks.token.useHasRole({
    account: address,
    token: tokenAddress,
    role: 'pause',
  })

  const { data: hasUnpauseRole } = Hooks.token.useHasRole({
    account: address,
    token: tokenAddress,
    role: 'unpause',
  })

  const pause = Hooks.token.usePauseSync({
    mutation: {
      onSettled() {
        refetchMetadata()
      },
    },
  })

  const unpause = Hooks.token.useUnpauseSync({
    mutation: {
      onSettled() {
        refetchMetadata()
      },
    },
  })

  useAccountEffect({
    onDisconnect() {
      pause.reset()
      unpause.reset()
    },
  })

  const paused = metadata?.paused || false

  const handleToggle = () => {
    if (!tokenAddress) return

    if (paused) {
      unpause.mutate({ token: tokenAddress, feeToken: alphaUsd })
    } else {
      pause.mutate({ token: tokenAddress, feeToken: alphaUsd })
    }
  }

  const canToggle = paused ? hasUnpauseRole : hasPauseRole
  const isProcessing = pause.isPending || unpause.isPending
  const active = Boolean(tokenAddress && canToggle)

  return (
    <Step
      active={active && (last ? true : !pause.isSuccess && !unpause.isSuccess)}
      completed={pause.isSuccess || unpause.isSuccess}
      actions={
        <Button
          variant={active ? 'accent' : 'default'}
          disabled={!active || isProcessing}
          onClick={handleToggle}
          type="button"
          className="text-[14px] -tracking-[2%] font-normal"
        >
          {isProcessing ? 'Processing...' : paused ? 'Unpause' : 'Pause'}
        </Button>
      }
      number={stepNumber}
      title={`${paused ? 'Unpause' : 'Pause'} transfers for ${metadata ? metadata.name : 'token'}.`}
    >
      {(pause.isSuccess || unpause.isSuccess) &&
        (pause.data || unpause.data) && (
          <div className="flex mx-6 flex-col gap-3 pb-4">
            <div className="ps-5 border-gray4 border-s-2">
              <ExplorerLink
                hash={
                  pause.data?.receipt.transactionHash ??
                  unpause.data?.receipt.transactionHash ??
                  ''
                }
              />
            </div>
          </div>
        )}
    </Step>
  )
}

export function SendPayment(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()
  const [recipient, setRecipient] = React.useState<string>(
    '0xbeefcafe54750903ac1c8909323af7beb21ea2cb',
  )
  const [memo, setMemo] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState(false)
  const { data: balance, refetch: balanceRefetch } = Hooks.token.useGetBalance({
    account: address,
    token: alphaUsd,
  })
  const sendPayment = Hooks.token.useTransferSync({
    mutation: {
      onSettled() {
        balanceRefetch()
      },
    },
  })
  useAccountEffect({
    onDisconnect() {
      setExpanded(false)
      sendPayment.reset()
    },
  })

  const isValidRecipient = recipient && isAddress(recipient)

  const handleTransfer = () => {
    if (!isValidRecipient) return
    sendPayment.mutate({
      amount: parseUnits('100', 6),
      to: recipient as `0x${string}`,
      token: alphaUsd,
      memo: memo ? pad(stringToHex(memo), { size: 32 }) : undefined,
    })
  }

  return (
    <Step
      active={
        Boolean(address && balance && balance > 0n) &&
        (last ? true : !sendPayment.isSuccess)
      }
      completed={sendPayment.isSuccess}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="text-[14px] -tracking-[2%] font-normal"
            type="button"
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant={
              address && balance && balance > 0n
                ? sendPayment.isSuccess
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={!(address && balance && balance > 0n)}
            onClick={() => setExpanded(true)}
            type="button"
            className="text-[14px] -tracking-[2%] font-normal"
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title="Send 100 AlphaUSD to a recipient."
    >
      {expanded && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            <div className="flex gap-2 flex-col md:items-end md:flex-row pe-8 mt-2">
              <div className="flex flex-col flex-2">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="recipient"
                >
                  Recipient address
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="flex flex-col flex-1">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="memo"
                >
                  Memo (optional)
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="INV-12345"
                />
              </div>
              <Button
                variant={
                  address && balance && balance > 0n && isValidRecipient
                    ? 'accent'
                    : 'default'
                }
                disabled={
                  !(address && balance && balance > 0n && isValidRecipient)
                }
                onClick={handleTransfer}
                type="button"
                className="text-[14px] -tracking-[2%] font-normal"
              >
                {sendPayment.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
            {sendPayment.isSuccess && sendPayment.data && (
              <ExplorerLink hash={sendPayment.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}

export function PayWithFeeToken(props: DemoStepProps & { feeToken?: Address }) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()
  const [recipient, setRecipient] = React.useState<string>(
    '0xbeefcafe54750903ac1c8909323af7beb21ea2cb',
  )
  const [memo, setMemo] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState(false)
  const [feeToken, setFeeToken] = React.useState<Address>(
    props.feeToken || betaUsd,
  )

  // Balance for the payment token (AlphaUSD)
  const { data: alphaBalance, refetch: alphaBalanceRefetch } =
    Hooks.token.useGetBalance({
      account: address,
      token: alphaUsd,
    })

  // Balance for the fee token (dynamic based on selection)
  const { data: feeTokenBalance, refetch: feeTokenBalanceRefetch } =
    Hooks.token.useGetBalance({
      account: address,
      token: feeToken,
    })

  // Metadata for fee token
  const { data: feeTokenMetadata } = Hooks.token.useGetMetadata({
    token: feeToken,
  })
  // Pool detals. Fees are paid in feeToken, so it's the userToken
  // validator token is a testnet property set at top of file
  const { data: pool } = Hooks.amm.usePool({
    userToken: feeToken,
    validatorToken,
    query: {
      enabled: feeToken !== alphaUsd,
    },
  })

  const sendPayment = Hooks.token.useTransferSync({
    mutation: {
      onSettled() {
        alphaBalanceRefetch()
        feeTokenBalanceRefetch()
      },
    },
  })

  useAccountEffect({
    onDisconnect() {
      setExpanded(false)
      sendPayment.reset()
    },
  })

  const isValidRecipient = recipient && isAddress(recipient)

  const handleTransfer = () => {
    if (!isValidRecipient) return
    sendPayment.mutate({
      amount: parseUnits('100', 6),
      to: recipient as `0x${string}`,
      token: alphaUsd,
      memo: memo ? pad(stringToHex(memo), { size: 32 }) : undefined,
      feeToken,
    })
  }

  const active = React.useMemo(() => {
    return Boolean(
      address &&
        alphaBalance &&
        alphaBalance > 0n &&
        feeTokenBalance &&
        feeTokenBalance > 0n &&
        (feeToken !== alphaUsd
          ? pool && pool.reserveValidatorToken > 0n
          : true),
    )
  }, [address, alphaBalance, feeTokenBalance, pool])

  return (
    <Step
      active={active && (last ? true : !sendPayment.isSuccess)}
      completed={sendPayment.isSuccess}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="text-[14px] -tracking-[2%] font-normal"
            type="button"
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant={
              active
                ? sendPayment.isSuccess
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={!active}
            onClick={() => setExpanded(true)}
            type="button"
            className="text-[14px] -tracking-[2%] font-normal"
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Send 100 AlphaUSD and pay fees in ${feeTokenMetadata ? feeTokenMetadata.name : 'another token'}.`}
    >
      {expanded && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            {/* Token info display */}
            <div className="mt-2 mb-3 p-3 rounded-lg bg-gray2 text-[13px] -tracking-[1%]">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray10 font-medium">
                    Payment Token: AlphaUSD
                  </span>
                  <span className="text-gray12">
                    balance: {formatUnits(alphaBalance ?? 0n, 6)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray10 font-medium">Fee Token</span>
                  <TokenSelector
                    tokens={[alphaUsd, betaUsd]}
                    value={feeToken}
                    onChange={setFeeToken}
                    name="feeToken"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray10 font-medium">
                    {`Fee Token: ${feeTokenMetadata ? feeTokenMetadata.name : ''}`}
                  </span>
                  <span className="text-gray12">
                    balance: {formatUnits(feeTokenBalance ?? 0n, 6)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-col md:items-end md:flex-row pe-8 mt-2">
              <div className="flex flex-col flex-2">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="recipient"
                >
                  Recipient address
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="flex flex-col flex-1">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="memo"
                >
                  Memo (optional)
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="INV-12345"
                />
              </div>
              <Button
                variant={active ? 'accent' : 'default'}
                disabled={!active}
                onClick={handleTransfer}
                type="button"
                className="text-[14px] -tracking-[2%] font-normal"
              >
                {sendPayment.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
            {sendPayment.isSuccess && sendPayment.data && (
              <ExplorerLink hash={sendPayment.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}

export function PayWithIssuedToken(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()
  const [recipient, setRecipient] = React.useState<string>(
    '0xbeefcafe54750903ac1c8909323af7beb21ea2cb',
  )
  const [memo, setMemo] = React.useState<string>('')
  const [expanded, setExpanded] = React.useState(false)
  const { getData } = useDemoContext()
  const feeToken = getData('tokenAddress')

  // Balance for the payment token (AlphaUSD)
  const { data: alphaBalance, refetch: alphaBalanceRefetch } =
    Hooks.token.useGetBalance({
      account: address,
      token: alphaUsd,
    })

  // Balance for the fee token (dynamic based on selection)
  const { data: feeTokenBalance, refetch: feeTokenBalanceRefetch } =
    Hooks.token.useGetBalance({
      account: address,
      token: feeToken,
    })

  // Metadata for fee token
  const { data: feeTokenMetadata } = Hooks.token.useGetMetadata({
    token: feeToken,
  })
  // Pool detals. Fees are paid in feeToken, so it's the userToken
  // validator token is a testnet property set at top of file
  const { data: pool } = Hooks.amm.usePool({
    userToken: feeToken,
    validatorToken,
  })

  const sendPayment = Hooks.token.useTransferSync({
    mutation: {
      onSettled() {
        alphaBalanceRefetch()
        feeTokenBalanceRefetch()
      },
    },
  })

  useAccountEffect({
    onDisconnect() {
      setExpanded(false)
      sendPayment.reset()
    },
  })

  const isValidRecipient = recipient && isAddress(recipient)

  const handleTransfer = () => {
    if (!isValidRecipient) return
    sendPayment.mutate({
      amount: parseUnits('100', 6),
      to: recipient as `0x${string}`,
      token: alphaUsd,
      memo: memo ? pad(stringToHex(memo), { size: 32 }) : undefined,
      feeToken,
    })
  }

  const active = React.useMemo(() => {
    return Boolean(
      address &&
        alphaBalance &&
        alphaBalance > 0n &&
        feeTokenBalance &&
        feeTokenBalance > 0n &&
        pool &&
        pool.reserveValidatorToken > 0n,
    )
  }, [address, alphaBalance, feeTokenBalance, pool])

  return (
    <Step
      active={active && (last ? true : !sendPayment.isSuccess)}
      completed={sendPayment.isSuccess}
      actions={
        expanded ? (
          <Button
            variant="default"
            onClick={() => setExpanded(false)}
            className="text-[14px] -tracking-[2%] font-normal"
            type="button"
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant={
              active
                ? sendPayment.isSuccess
                  ? 'default'
                  : 'accent'
                : 'default'
            }
            disabled={!active}
            onClick={() => setExpanded(true)}
            type="button"
            className="text-[14px] -tracking-[2%] font-normal"
          >
            Enter details
          </Button>
        )
      }
      number={stepNumber}
      title={`Send 100 AlphaUSD and pay fees in ${feeTokenMetadata ? feeTokenMetadata.name : 'your token'}.`}
    >
      {expanded && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            {/* Token info display */}
            <div className="mt-2 mb-3 p-3 rounded-lg bg-gray2 text-[13px] -tracking-[1%]">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray10 font-medium">
                    Payment Token: AlphaUSD
                  </span>
                  <span className="text-gray12">
                    balance: {formatUnits(alphaBalance ?? 0n, 6)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray10 font-medium">
                    {`Fee Token: ${feeTokenMetadata ? feeTokenMetadata.name : ''}`}
                  </span>
                  <span className="text-gray12">
                    balance: {formatUnits(feeTokenBalance ?? 0n, 6)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-col md:items-end md:flex-row pe-8 mt-2">
              <div className="flex flex-col flex-2">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="recipient"
                >
                  Recipient address
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <div className="flex flex-col flex-1">
                <label
                  className="text-[11px] -tracking-[1%] text-gray9"
                  htmlFor="memo"
                >
                  Memo (optional)
                </label>
                <input
                  className="h-[34px] border border-gray4 px-3.25 rounded-[50px] text-[14px] font-normal -tracking-[2%] placeholder-gray9 text-black dark:text-white"
                  data-1p-ignore
                  type="text"
                  name="memo"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="INV-12345"
                />
              </div>
              <Button
                variant={active ? 'accent' : 'default'}
                disabled={!active}
                onClick={handleTransfer}
                type="button"
                className="text-[14px] -tracking-[2%] font-normal"
              >
                {sendPayment.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
            {sendPayment.isSuccess && sendPayment.data && (
              <ExplorerLink hash={sendPayment.data.receipt.transactionHash} />
            )}
          </div>
        </div>
      )}
    </Step>
  )
}

export function MintFeeAmmLiquidity(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()
  const { getData } = useDemoContext()
  const queryClient = useQueryClient()

  // Get the address of the token created in a previous step
  const tokenAddress = getData('tokenAddress')

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: tokenAddress,
  })
  const { data: tokenBalance } = Hooks.token.useGetBalance({
    account: address,
    token: tokenAddress,
  })
  const mintFeeLiquidity = Hooks.amm.useMintSync({
    mutation: {
      onSettled() {
        queryClient.refetchQueries({ queryKey: ['getPool'] })
      },
    },
  })
  useAccountEffect({
    onDisconnect() {
      mintFeeLiquidity.reset()
    },
  })

  const active = React.useMemo(() => {
    return Boolean(address && tokenAddress && tokenBalance && tokenBalance > 0n)
  }, [address, tokenAddress, tokenBalance])

  return (
    <Step
      active={active && (last ? true : !mintFeeLiquidity.isSuccess)}
      completed={mintFeeLiquidity.isSuccess}
      actions={
        <Button
          variant={
            active
              ? mintFeeLiquidity.isSuccess
                ? 'default'
                : 'accent'
              : 'default'
          }
          disabled={!active}
          onClick={() => {
            if (!address || !tokenAddress) return
            mintFeeLiquidity.mutate({
              userToken: {
                amount: 0n,
                address: tokenAddress,
              },
              validatorToken: {
                amount: parseUnits('100', 6),
                address: validatorToken,
              },
              to: address,
              feeToken: alphaUsd,
            })
          }}
          type="button"
          className="text-[14px] -tracking-[2%] font-normal"
        >
          Add Liquidity
        </Button>
      }
      number={stepNumber}
      title={`Mint 100 linkingUSD of Fee Liquidity for ${metadata ? metadata.name : 'your token'}.`}
    >
      {mintFeeLiquidity.data && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            <ExplorerLink
              hash={mintFeeLiquidity.data.receipt.transactionHash}
            />
          </div>
        </div>
      )}
    </Step>
  )
}

export function SelectFeeToken(props: DemoStepProps) {
  const { stepNumber } = props
  const { address } = useAccount()
  const [feeToken, setFeeToken] = React.useState<Address>(alphaUsd)

  const active = Boolean(address)
  const completed = Boolean(address && feeToken)

  return (
    <Step
      active={active}
      completed={completed}
      number={stepNumber}
      title="Select a fee token."
    >
      {address && (
        <div className="flex ml-6 flex-col gap-3 py-4">
          <div className="ps-5 border-gray4 border-s-2">
            <TokenSelector
              tokens={[alphaUsd, betaUsd]}
              value={feeToken}
              onChange={setFeeToken}
              name="feeToken"
            />
          </div>
        </div>
      )}
    </Step>
  )
}

export function PlaceOrder(props: DemoStepProps) {
  const { stepNumber, last = false } = props
  const { address } = useAccount()

  const { data: metadata } = Hooks.token.useGetMetadata({
    token: alphaUsd,
  })

  const sendTransaction = useSendTransactionSync()

  useAccountEffect({
    onDisconnect() {
      sendTransaction.reset()
    },
  })

  const amount = parseUnits('100', metadata?.decimals || 6)

  const calls = [
    Actions.token.approve.call({
      spender: Addresses.stablecoinExchange,
      amount,
      token: linkingUsd,
    }),
    Actions.dex.place.call({
      amount,
      tick: 0,
      token: alphaUsd,
      type: 'buy',
    }),
  ]

  const active = React.useMemo(() => {
    return !!address
  }, [address])

  return (
    <Step
      active={active && (last ? true : !sendTransaction.isSuccess)}
      completed={sendTransaction.isSuccess}
      actions={
        <Button
          variant={
            active
              ? sendTransaction.isSuccess
                ? 'default'
                : 'accent'
              : 'default'
          }
          disabled={!active}
          onClick={async () => {
            await sendTransaction.sendTransactionSyncAsync({
              calls,
              feeToken: alphaUsd,
            })
          }}
          type="button"
          className="text-[14px] -tracking-[2%] font-normal"
        >
          Place Order
        </Button>
      }
      number={stepNumber}
      title={`Place buy order for 100 AlphaUSD`}
    >
      {sendTransaction.data && (
        <div className="flex mx-6 flex-col gap-3 pb-4">
          <div className="ps-5 border-gray4 border-s-2">
            <ExplorerLink hash={sendTransaction.data.transactionHash} />
          </div>
        </div>
      )}
    </Step>
  )
}

/**
 * END STEPS
 */

export function ExplorerLink({ hash }: { hash: string }) {
  return (
    <div className="mt-1">
      <a
        href={`https://explore.tempo.xyz/tx/${hash}`}
        target="_blank"
        rel="noreferrer"
        className="text-accent text-[13px] -tracking-[1%] flex items-center gap-1 hover:underline"
      >
        View receipt
        <LucideExternalLink className="size-3" />
      </a>
    </div>
  )
}

export function ExplorerAccountLink({ address }: { address: string }) {
  return (
    <div className="mt-1">
      <a
        href={`https://explore.tempo.xyz/account/${address}`}
        target="_blank"
        rel="noreferrer"
        className="text-accent text-[13px] -tracking-[1%] flex items-center gap-1 hover:underline"
      >
        View account
        <LucideExternalLink className="size-3" />
      </a>
    </div>
  )
}

export function Container(
  props: React.PropsWithChildren<
    {
      name: string
      showBadge?: boolean | undefined
    } & (
      | {
          footerVariant: undefined
        }
      | {
          footerVariant: 'balances'
          tokens: Address[]
        }
      | {
          footerVariant: 'source'
          src: string
        }
    )
  >,
) {
  const { children, name, showBadge = true } = props
  const { address } = useAccount()
  const disconnect = useDisconnect()
  const restart = React.useCallback(() => {
    disconnect.disconnect()
  }, [disconnect.disconnect])

  const footerElement = React.useMemo(() => {
    if (props.footerVariant === 'balances')
      return (
        <Container.BalancesFooter
          address={address}
          tokens={props.tokens || [alphaUsd]}
        />
      )
    if (props.footerVariant === 'source')
      return <Container.SourceFooter src={props.src} />
    return null
  }, [props, address])

  return (
    <ParentContainer
      headerLeft={
        <div className="flex gap-1.5 items-center">
          <h4 className="text-gray12 text-[14px] font-normal leading-none -tracking-[1%]">
            {name}
          </h4>
          {showBadge && (
            <span className="text-[9px] font-medium bg-accentTint text-accent h-[19px] flex items-center text-center justify-center rounded-[30px] px-1.5 tracking-[2%] uppercase leading-none">
              demo
            </span>
          )}
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
      footer={footerElement}
    >
      <div className="space-y-4">{children}</div>
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
    const { data: metadata, isPending: metadataIsPending } =
      Hooks.token.useGetMetadata({
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
          <span className="flex gap-1">
            <span className="text-gray10">
              {formatUnits(balance ?? 0n, metadata.decimals)}
            </span>
            {metadata.symbol}
          </span>
        )}
      </div>
    )
  }

  export function BalancesFooter(props: {
    address?: string | undefined
    tokens: Address[]
  }) {
    const { address, tokens } = props
    return (
      <div className="gap-2 h-full py-2 flex items-center leading-none">
        <span className="text-gray10">Balances</span>
        <div className="self-stretch min-h-5 w-px bg-gray4" />
        <div className="flex flex-col gap-2">
          {address ? (
            tokens.map((token) => (
              <BalancesFooterItem
                key={token}
                address={address as Address}
                token={token}
              />
            ))
          ) : (
            <span className="text-gray9">No account detected</span>
          )}
        </div>
      </div>
    )
  }

  export function SourceFooter(props: { src: string }) {
    const { src } = props
    const [isCopied, copy] = useCopyToClipboard()
    return (
      <div className="flex justify-between w-full">
        {/** biome-ignore lint/a11y/noStaticElementInteractions: _ */}
        {/** biome-ignore lint/a11y/useKeyWithClickEvents: _ */}
        <div
          className="text-primary flex cursor-pointer items-center gap-[6px] font-mono text-[12px] tracking-tight max-sm:hidden"
          onClick={() => copy(`pnpx gitpick ${src}`)}
          title="Copy to clipboard"
        >
          <div>
            <span className="text-gray10">pnpx gitpick</span> {src}
          </div>
          {isCopied ? (
            <LucideCheck className="text-gray10 size-3" />
          ) : (
            <LucideCopy className="text-gray10 size-3" />
          )}
        </div>
        <div className="text-accent text-[12px] tracking-tight">
          <a
            className="flex items-center gap-1"
            href={`https://github.com/${src}`}
            rel="noreferrer"
            target="_blank"
          >
            Source <LucideExternalLink className="size-[12px]" />
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
    number: number
    title: React.ReactNode
  }>,
) {
  const { actions, active, children, completed, number, title } = props
  return (
    <div data-active={active} data-completed={completed} className="group">
      <header className="flex max-sm:flex-col max-sm:items-start max-sm:justify-start items-center justify-between gap-4">
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

export function Login() {
  const connect = useConnect()
  const connector = useWebAuthnConnector()

  return (
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
            className="text-[14px] -tracking-[2%] font-normal"
            onClick={() => connect.connect({ connector })}
            type="button"
          >
            Sign in
          </Button>
          <Button
            variant="default"
            className="text-[14px] -tracking-[2%] font-normal"
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

export function Logout() {
  const { address, connector } = useAccount()
  const disconnect = useDisconnect()
  const [copied, copyToClipboard] = useCopyToClipboard()
  if (!address) return null
  return (
    <div className="flex items-center gap-1">
      <Button onClick={() => copyToClipboard(address)} variant="default">
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
        className="text-[14px] -tracking-[2%] font-normal"
        onClick={() => disconnect.disconnect({ connector })}
        type="button"
      >
        Sign out
      </Button>
    </div>
  )
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
  base: 'relative inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
  variants: {
    disabled: {
      true: 'pointer-events-none opacity-50',
    },
    size: {
      default: 'text-[14px] -tracking-[2%] h-[32px] px-[14px]',
    },
    static: {
      true: 'pointer-events-none',
    },
    variant: {
      accent:
        'bg-(--vocs-color_inverted) text-(--vocs-color_background) border dark:border-dashed',
      default:
        'text-(--vocs-color_inverted) bg-(--vocs-color_background) border border-dashed',
      destructive:
        'bg-(--vocs-color_backgroundRedTint2) text-(--vocs-color_textRed) border border-dashed',
    },
  },
})

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
