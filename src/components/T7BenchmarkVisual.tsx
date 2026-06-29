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

function BaseFeeRow(props: {
  label: string
  value: string
  width: number
  tone: 'before' | 'after'
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-gray11">{props.label}</span>
        <strong className="text-gray12">{props.value}</strong>
      </div>
      <div className="h-2.5 overflow-hidden rounded bg-gray3" aria-hidden="true">
        <div
          className={`h-full rounded ${props.tone === 'before' ? 'bg-gray7' : 'bg-accent'}`}
          style={{ width: `${Math.max(props.width, 3)}%` }}
        />
      </div>
    </div>
  )
}

function BeforeAfterRow(props: { label: string; before: number; after: number; unit?: 'gas' }) {
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

export function T7BenchmarkVisual() {
  return (
    <Container
      headerLeft={
        <h4 className="font-normal text-[14px] text-gray12 leading-none">Fee impact at a glance</h4>
      }
      footer={
        <span>
          Bars are normalized within each comparison. Exact benchmark numbers are listed below.
        </span>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="space-y-3">
          <div>
            <h5 className="m-0 font-medium text-[14px] text-gray12">Base fee</h5>
            <p className="m-0 mt-1 text-gray11 text-sm">Example cost for a 50,000 gas transfer.</p>
          </div>
          <BaseFeeRow label="Today fixed fee" value="$0.0010" width={100} tone="before" />
          <BaseFeeRow label="New fee cap" value="$0.0006" width={60} tone="after" />
          <BaseFeeRow label="Quiet-period floor" value="$0.00003" width={3} tone="after" />
        </section>

        <section className="space-y-3">
          <div>
            <h5 className="m-0 font-medium text-[14px] text-gray12">Payment channels</h5>
            <p className="m-0 mt-1 text-gray11 text-sm">
              Repeated channel opens can reuse payer-scoped savings.
            </p>
          </div>
          <BeforeAfterRow label="Open existing channel" before={1_055_229} after={294_425} />
          <BeforeAfterRow label="Open first channel" before={1_302_429} after={791_625} />
        </section>

        <section className="space-y-3">
          <div>
            <h5 className="m-0 font-medium text-[14px] text-gray12">DEX repeat orders</h5>
            <p className="m-0 mt-1 text-gray11 text-sm">
              Returning makers can reuse order-storage savings.
            </p>
          </div>
          <BeforeAfterRow label="Same maker after cancel" before={2_075_413} after={868_756} />
          <BeforeAfterRow label="Same maker after full fill" before={1_828_213} after={621_456} />
        </section>
      </div>
    </Container>
  )
}
