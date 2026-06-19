'use client'

import { useMemo, useState } from 'react'
import {
  buildBarChartSvg,
  buildLaneDiagramSvg,
  DEFAULT_STYLE,
  type DiagramStyle,
} from '../_lib/diagramSvg'

const DEFAULT_CHART = {
  title: 'Sustained TPS by release',
  subtitle: 'Live network, continuous load — perf.tempo.xyz',
  values: '8700, 12800, 17000, 21200',
  labels: 'v1.5, v1.6, v1.7, v1.8',
}

const fieldLabel = 'font-mono text-[11px] tracking-[0.02em] text-white/40 uppercase'
const textInput =
  'h-9 w-full border border-line bg-surface-input px-3 font-mono text-[12px] text-foreground outline-none focus:border-line-strong'

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={fieldLabel}>{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer border border-line bg-surface-input p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className={textInput}
        />
      </span>
    </label>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between">
        <span className={fieldLabel}>{label}</span>
        <span className="font-mono text-[11px] text-white/60">{value}</span>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-white"
      />
    </label>
  )
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 border border-line px-3 font-mono text-[11px] text-white/60 uppercase tracking-[0.02em] transition-colors hover:bg-surface-block hover:text-white"
    >
      {label}
    </button>
  )
}

function downloadSvg(filename: string, svg: string) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Playground() {
  const [style, setStyle] = useState<DiagramStyle>(DEFAULT_STYLE)
  const [chart, setChart] = useState(DEFAULT_CHART)
  const [copied, setCopied] = useState<string | null>(null)

  const set = <K extends keyof DiagramStyle>(key: K, value: DiagramStyle[K]) =>
    setStyle((s) => ({ ...s, [key]: value }))

  const values = useMemo(
    () =>
      chart.values
        .split(',')
        .map((v) => Number(v.trim()))
        .filter((v) => Number.isFinite(v) && v > 0),
    [chart.values],
  )
  const labels = useMemo(() => chart.labels.split(',').map((l) => l.trim()), [chart.labels])

  const barSvg = useMemo(
    () =>
      buildBarChartSvg(style, {
        title: chart.title,
        subtitle: chart.subtitle,
        values,
        labels,
        accentIndex: values.length - 1,
      }),
    [style, chart.title, chart.subtitle, values, labels],
  )
  const laneSvg = useMemo(() => buildLaneDiagramSvg(style), [style])

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const tokensJson = JSON.stringify(style, null, 2)

  return (
    <div className="grid gap-10 px-5 lg:grid-cols-[320px_1fr] lg:items-start lg:gap-12 lg:px-8">
      {/* Controls */}
      <div className="flex flex-col gap-8 lg:sticky lg:top-8">
        <section className="flex flex-col gap-3">
          <h2 className="font-sans text-[14px] text-foreground">Colors</h2>
          <ColorField
            label="Background"
            value={style.background}
            onChange={(v) => set('background', v)}
          />
          <ColorField label="Box fill" value={style.boxFill} onChange={(v) => set('boxFill', v)} />
          <ColorField
            label="Box stroke"
            value={style.boxStroke}
            onChange={(v) => set('boxStroke', v)}
          />
          <ColorField
            label="Gridline"
            value={style.gridline}
            onChange={(v) => set('gridline', v)}
          />
          <ColorField
            label="Baseline"
            value={style.baseline}
            onChange={(v) => set('baseline', v)}
          />
          <ColorField
            label="Accent stroke"
            value={style.accentStroke}
            onChange={(v) => set('accentStroke', v)}
          />
          <ColorField
            label="Accent fill"
            value={style.accentFill}
            onChange={(v) => set('accentFill', v)}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-sans text-[14px] text-foreground">Text opacities</h2>
          <SliderField
            label="Primary"
            value={style.textPrimary}
            min={0.2}
            max={1}
            step={0.05}
            onChange={(v) => set('textPrimary', v)}
          />
          <SliderField
            label="Secondary"
            value={style.textSecondary}
            min={0.1}
            max={1}
            step={0.05}
            onChange={(v) => set('textSecondary', v)}
          />
          <SliderField
            label="Box labels"
            value={style.textLabel}
            min={0.1}
            max={1}
            step={0.05}
            onChange={(v) => set('textLabel', v)}
          />
          <SliderField
            label="Muted"
            value={style.textMuted}
            min={0.1}
            max={1}
            step={0.05}
            onChange={(v) => set('textMuted', v)}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-sans text-[14px] text-foreground">Type & shape</h2>
          <SliderField
            label="Title size"
            value={style.titleSize}
            min={10}
            max={20}
            step={1}
            onChange={(v) => set('titleSize', v)}
          />
          <SliderField
            label="Subtitle size"
            value={style.subtitleSize}
            min={9}
            max={16}
            step={1}
            onChange={(v) => set('subtitleSize', v)}
          />
          <SliderField
            label="Label size"
            value={style.labelSize}
            min={9}
            max={16}
            step={1}
            onChange={(v) => set('labelSize', v)}
          />
          <SliderField
            label="Letter spacing (em)"
            value={style.letterSpacing}
            min={0}
            max={0.2}
            step={0.01}
            onChange={(v) => set('letterSpacing', v)}
          />
          <SliderField
            label="Stroke width"
            value={style.strokeWidth}
            min={0.5}
            max={3}
            step={0.5}
            onChange={(v) => set('strokeWidth', v)}
          />
          <SliderField
            label="Corner radius"
            value={style.cornerRadius}
            min={0}
            max={12}
            step={1}
            onChange={(v) => set('cornerRadius', v)}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-sans text-[14px] text-foreground">Chart data</h2>
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>Title</span>
            <input
              type="text"
              value={chart.title}
              onChange={(e) => setChart((c) => ({ ...c, title: e.target.value }))}
              className={textInput}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>Subtitle</span>
            <input
              type="text"
              value={chart.subtitle}
              onChange={(e) => setChart((c) => ({ ...c, subtitle: e.target.value }))}
              className={textInput}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>Values (comma-separated)</span>
            <input
              type="text"
              value={chart.values}
              onChange={(e) => setChart((c) => ({ ...c, values: e.target.value }))}
              spellCheck={false}
              className={textInput}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>Labels (comma-separated)</span>
            <input
              type="text"
              value={chart.labels}
              onChange={(e) => setChart((c) => ({ ...c, labels: e.target.value }))}
              spellCheck={false}
              className={textInput}
            />
          </label>
          <p className="font-sans text-[12px] text-white/40 leading-[1.5]">
            The last bar takes the accent — the diagram&apos;s one highlighted idea.
          </p>
        </section>

        <section className="flex flex-wrap gap-2">
          <ActionButton
            label={copied === 'tokens' ? 'Copied' : 'Copy tokens JSON'}
            onClick={() => copy('tokens', tokensJson)}
          />
          <ActionButton label="Reset to house style" onClick={() => setStyle(DEFAULT_STYLE)} />
        </section>
      </div>

      {/* Previews */}
      <div className="flex min-w-0 flex-col gap-12">
        {[
          { id: 'bar', name: 'bar-chart', heading: 'Bar chart', svg: barSvg },
          { id: 'lane', name: 'lane-diagram', heading: 'Box / lane diagram', svg: laneSvg },
        ].map((preview) => (
          <section key={preview.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-sans text-[14px] text-foreground">{preview.heading}</h2>
              <div className="flex gap-2">
                <ActionButton
                  label={copied === preview.id ? 'Copied' : 'Copy SVG'}
                  onClick={() => copy(preview.id, preview.svg)}
                />
                <ActionButton
                  label="Download"
                  onClick={() => downloadSvg(`${preview.name}.svg`, preview.svg)}
                />
              </div>
            </div>
            <div className="overflow-x-auto border border-line">
              <div dangerouslySetInnerHTML={{ __html: preview.svg }} />
            </div>
            <details>
              <summary className="cursor-pointer font-mono text-[11px] text-white/40 uppercase tracking-[0.02em] transition-colors hover:text-white">
                View SVG source
              </summary>
              <pre className="code-scroll mt-2 max-h-[320px] overflow-auto border border-line bg-surface-block p-4 font-mono text-[11px] text-white/60 leading-[1.6]">
                {preview.svg}
              </pre>
            </details>
          </section>
        ))}

        <section className="flex flex-col gap-3">
          <h2 className="font-sans text-[14px] text-foreground">Style tokens</h2>
          <p className="font-sans text-[13px] text-white/50 leading-[1.5]">
            Tweak until it looks right, then copy this block alongside the exported SVG.
          </p>
          <pre className="code-scroll overflow-auto border border-line bg-surface-block p-4 font-mono text-[11px] text-white/60 leading-[1.6]">
            {tokensJson}
          </pre>
        </section>
      </div>
    </div>
  )
}
