'use client'

import { Container } from './Container'
import * as ui from './T7BenchmarkVisual.recipes'

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
    <div {...ui.baseFeeRowLayout()}>
      <div {...ui.baseFeeRowLayout2()}>
        <span {...ui.baseFeeRowText()}>{props.label}</span>
        <strong {...ui.strong()}>{props.value}</strong>
      </div>
      <div {...ui.baseFeeRowLayout3()} aria-hidden="true">
        <div
          {...ui.baseFeeRowLayoutAppearance({
            value0: `${Math.max(props.width, 3)}%`,
            className: ` ${ui.baseFeeRowLayout4().className} ${props.tone === 'before' ? ui.baseFeeRowLayout5().className : ui.baseFeeRowLayout6().className}`,
          })}
        />
      </div>
    </div>
  )
}

function GasSnapshotRow(props: { label: string; value: number }) {
  return (
    <div {...ui.baseFeeRowLayout()}>
      <div {...ui.gasSnapshotRowLayout()}>
        <span {...ui.gasSnapshotRowText()}>{props.label}</span>
        <strong {...ui.strong2()}>{formatGas(props.value)}</strong>
      </div>
      <div {...ui.baseFeeRowLayout3()} aria-hidden="true">
        <div
          {...ui.gasSnapshotRowLayoutAppearance({
            className: ui.gasSnapshotRowLayout2().className,
          })}
        />
      </div>
    </div>
  )
}

export function T7BenchmarkVisual() {
  return (
    <Container
      headerLeft={<h4 {...ui.t7BenchmarkVisualHeading()}>Fee impact at a glance</h4>}
      footer={
        <span>
          Bars are normalized within each comparison. Exact benchmark numbers are listed below.
        </span>
      }
    >
      <div {...ui.t7BenchmarkVisualLayout()}>
        <section {...ui.t7BenchmarkVisualSection()}>
          <div>
            <h5 {...ui.t7BenchmarkVisualH5()}>Base fee</h5>
            <p {...ui.t7BenchmarkVisualDescription()}>Example cost for a 50,000 gas transfer.</p>
          </div>
          <BaseFeeRow label="Today fixed fee" value="$0.0010" width={100} tone="before" />
          <BaseFeeRow label="New fee cap" value="$0.0006" width={60} tone="after" />
          <BaseFeeRow label="Quiet-period floor" value="$0.00003" width={3} tone="after" />
        </section>

        <section {...ui.t7BenchmarkVisualSection()}>
          <div>
            <h5 {...ui.t7BenchmarkVisualH5()}>Payment channels</h5>
            <p {...ui.t7BenchmarkVisualDescription()}>
              Credited reopen path for payer-scoped channel savings.
            </p>
          </div>
          <GasSnapshotRow label="Open new channel with storage credit" value={60_225} />
        </section>
      </div>
    </Container>
  )
}
