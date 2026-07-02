'use client'

import { Container } from './Container'

const numberFormat = new Intl.NumberFormat('en-US')

function formatGas(value: number) {
  return `${numberFormat.format(value)} gas`
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function reduction(before: number, after: number) {
  return ((before - after) / before) * 100
}

function barWidth(value: number, max: number) {
  return `${Math.max((value / max) * 100, 3)}%`
}

function BeforeAfterRow(props: { label: string; before: number; after: number }) {
  const saved = props.before - props.after

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium text-gray12 text-sm">{props.label}</span>
        <span className="text-[13px] text-gray11">
          {formatGas(saved)} lower ({formatPercent(reduction(props.before, props.after))})
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-2 text-[13px]">
          <span className="text-gray10">Before</span>
          <div className="h-2.5 overflow-hidden rounded bg-gray3" aria-hidden="true">
            <div className="h-full rounded bg-gray7" style={{ width: '100%' }} />
          </div>
          <span className="text-gray11 tabular-nums">{formatGas(props.before)}</span>
        </div>
        <div className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-2 text-[13px]">
          <span className="text-gray10">After</span>
          <div className="h-2.5 overflow-hidden rounded bg-gray3" aria-hidden="true">
            <div
              className="h-full rounded bg-accent"
              style={{ width: barWidth(props.after, props.before) }}
            />
          </div>
          <span className="text-gray11 tabular-nums">{formatGas(props.after)}</span>
        </div>
      </div>
    </div>
  )
}

export function StorageSavingsSummary() {
  return (
    <Container
      headerLeft={
        <h4 className="font-normal text-[14px] text-gray12 leading-none">
          DEX savings at a glance
        </h4>
      }
      footer={
        <span>
          This is the StablecoinDEX benchmark. Benchmark non-DEX contracts before making the same
          claim.
        </span>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-3">
          <div>
            <h5 className="m-0 font-medium text-[14px] text-gray12">Same-maker repeat orders</h5>
            <p className="m-0 mt-1 text-gray11 text-sm">
              The saving shows up when the maker who earned it later places another eligible order.
            </p>
          </div>
          <BeforeAfterRow label="After cancel" before={2_075_413} after={868_756} />
          <BeforeAfterRow label="After filled order" before={1_828_213} after={621_456} />
        </section>

        <section className="space-y-3">
          <div>
            <h5 className="m-0 font-medium text-[14px] text-gray12">Allocation rule</h5>
            <p className="m-0 mt-1 text-gray11 text-sm">
              Savings should follow the user who cleared the storage.
            </p>
          </div>
          <ol className="m-0 grid list-decimal gap-2 pl-5 text-gray11 text-sm">
            <li>A maker cancels or fully fills an eligible order.</li>
            <li>The DEX records reusable savings for that maker.</li>
            <li>Only that same maker can use the saving on a later eligible order.</li>
          </ol>
        </section>
      </div>
    </Container>
  )
}
