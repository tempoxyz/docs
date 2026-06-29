'use client'

import * as React from 'react'
import { Container } from './Container'

type Scenario = {
  id: string
  label: string
  description: string
  earnLabel: string
  earnBefore: number
  earnAfter: number
  reuseLabel: string
  reuseBefore: number
  reuseAfter: number
}

const SCENARIOS: Scenario[] = [
  {
    id: 'cancel',
    label: 'Order is canceled',
    description:
      'The maker cancels an eligible order, then returns later to place another eligible order.',
    earnLabel: 'Cancel bid, earn reusable savings',
    earnBefore: 304_741,
    earnAfter: 361_184,
    reuseLabel: 'Same maker reuses savings after cancel',
    reuseBefore: 2_075_413,
    reuseAfter: 868_756,
  },
  {
    id: 'full-fill',
    label: 'Order is fully filled',
    description:
      'An eligible order is fully filled, then the same maker returns later with another eligible order.',
    earnLabel: 'Full fill, earn reusable savings',
    earnBefore: 384_497,
    earnAfter: 436_040,
    reuseLabel: 'Same maker reuses savings after full fill',
    reuseBefore: 1_828_213,
    reuseAfter: 621_456,
  },
]

const numberFormat = new Intl.NumberFormat('en-US')
const percentFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
})

function formatGas(value: number) {
  return `${numberFormat.format(value)} gas`
}

function formatSignedGas(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatGas(Math.abs(value))}`
}

function formatSavings(value: number) {
  if (value > 0) return `${formatGas(value)} saved`
  if (value < 0) return `${formatGas(Math.abs(value))} more`
  return 'No gas change'
}

function formatPercent(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${percentFormat.format(Math.abs(value))}%`
}

function changePercent(before: number, after: number) {
  return ((after - before) / before) * 100
}

export function StorageSavingsExplorer() {
  const [scenarioId, setScenarioId] = React.useState(SCENARIOS[0].id)
  const [repeatOrders, setRepeatOrders] = React.useState(1)
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0]

  const earningCost = scenario.earnAfter - scenario.earnBefore
  const reuseSavings = scenario.reuseBefore - scenario.reuseAfter
  const beforeTotal = scenario.earnBefore + scenario.reuseBefore * repeatOrders
  const afterTotal = scenario.earnAfter + scenario.reuseAfter * repeatOrders
  const netSavings = beforeTotal - afterTotal
  const netPercent = changePercent(beforeTotal, afterTotal)
  const breaksEven = reuseSavings > earningCost
  const updateRepeatOrders = (value: number) => {
    setRepeatOrders(Math.min(10, Math.max(1, value)))
  }

  return (
    <Container
      headerLeft={
        <h4 className="font-normal text-[14px] text-gray12 leading-none">
          Storage savings explorer
        </h4>
      }
      footer={
        <span>
          Uses the StablecoinDEX T7 benchmark numbers. These numbers are for the StablecoinDEX
          benchmark only.
        </span>
      }
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="m-0 text-gray11 text-sm">
            Pick the lifecycle that earns a storage saving, then choose how many later eligible
            orders the same maker places.
          </p>

          <fieldset className="grid gap-2 md:grid-cols-2">
            <legend className="sr-only">Storage lifecycle</legend>
            {SCENARIOS.map((item) => {
              const active = item.id === scenario.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setScenarioId(item.id)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'border-accent bg-accent/10 text-gray12'
                      : 'border-gray5 bg-gray1 text-gray11 hover:border-gray8 hover:text-gray12'
                  }`}
                >
                  <span className="block font-medium">{item.label}</span>
                  <span className="mt-1 block text-[13px] leading-5">{item.description}</span>
                </button>
              )
            })}
          </fieldset>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3 text-gray11">
            <span id="repeat-orders-label">Later eligible orders by the same maker</span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Decrease later eligible orders"
                disabled={repeatOrders === 1}
                onClick={() => updateRepeatOrders(repeatOrders - 1)}
                className="grid h-7 w-7 place-items-center rounded-md border border-gray5 text-gray12 disabled:cursor-not-allowed disabled:opacity-40"
              >
                -
              </button>
              <strong className="min-w-5 text-center text-gray12">{repeatOrders}</strong>
              <button
                type="button"
                aria-label="Increase later eligible orders"
                disabled={repeatOrders === 10}
                onClick={() => updateRepeatOrders(repeatOrders + 1)}
                className="grid h-7 w-7 place-items-center rounded-md border border-gray5 text-gray12 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={repeatOrders}
            aria-labelledby="repeat-orders-label"
            onChange={(event) => updateRepeatOrders(Number(event.currentTarget.value))}
            onInput={(event) => updateRepeatOrders(Number(event.currentTarget.value))}
            className="w-full accent-gray12"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            <h5 className="m-0 font-medium text-[14px] text-gray12">Benchmark impact</h5>

            <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
              <span className="text-gray11">{scenario.earnLabel}</span>
              <span className="text-right text-gray12">
                {formatSignedGas(earningCost)} (
                {formatPercent(changePercent(scenario.earnBefore, scenario.earnAfter))})
              </span>
              <span className="text-gray11">{scenario.reuseLabel}</span>
              <span className="text-right text-gray12">
                {formatSavings(reuseSavings)} (
                {formatPercent(changePercent(scenario.reuseBefore, scenario.reuseAfter))})
              </span>
              <span className="text-gray11">Net over this lifecycle</span>
              <span className="text-right font-medium text-gray12">
                {formatSavings(netSavings)} ({formatPercent(netPercent)})
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="m-0 font-medium text-[14px] text-gray12">Who should get the saving?</h5>

            <ol className="m-0 grid list-decimal gap-2 pl-5 text-gray11 text-sm">
              <li>Alice clears eligible order storage and earns reusable savings.</li>
              <li>Bob places an order later, but does not spend Alice's savings.</li>
              <li>Alice returns and can use the savings she earned.</li>
            </ol>
          </div>
        </div>

        <div className="border-gray4 border-t pt-4 text-gray11 text-sm">
          {breaksEven ? (
            <p className="m-0">
              In this benchmark, one later eligible order is enough to outweigh the extra gas paid
              when the DEX records who earned the reusable savings.
            </p>
          ) : (
            <p className="m-0">
              This lifecycle needs more repeat usage before the reusable savings outweigh the
              upfront accounting cost.
            </p>
          )}
        </div>
      </div>
    </Container>
  )
}
