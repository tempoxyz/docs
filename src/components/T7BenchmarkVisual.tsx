'use client'

import { Container } from './Container'

const numberFormat = new Intl.NumberFormat('en-US')

function formatGas(value: number) {
  return `${numberFormat.format(value)} gas`
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

function GasSnapshotRow(props: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium text-gray12 text-sm">{props.label}</span>
        <strong className="text-gray12 text-sm tabular-nums">{formatGas(props.value)}</strong>
      </div>
      <div className="h-2.5 overflow-hidden rounded bg-gray3" aria-hidden="true">
        <div className="h-full rounded bg-accent" style={{ width: '18%' }} />
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
      <div className="grid gap-5 lg:grid-cols-2">
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
              Credited reopen path for payer-scoped channel savings.
            </p>
          </div>
          <GasSnapshotRow label="Open new channel with storage credit" value={60_225} />
        </section>
      </div>
    </Container>
  )
}
