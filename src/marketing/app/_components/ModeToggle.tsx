'use client'

export type ShowcaseMode = 'visual' | 'code'

export default function ModeToggle({
  mode,
  setMode,
}: {
  mode: ShowcaseMode
  setMode: (mode: ShowcaseMode) => void
}) {
  const labels = {
    visual: 'Diagram',
    code: 'Code',
  } satisfies Record<ShowcaseMode, string>

  return (
    <div className="flex justify-end">
      <span className="flex border border-line bg-surface-shell">
        {(['visual', 'code'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            aria-pressed={mode === option}
            className={`h-8 border-line border-r px-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors last:border-r-0 ${
              mode === option
                ? 'bg-surface-card-elev text-foreground'
                : 'text-foreground/55 hover:bg-surface-block hover:text-foreground/70'
            }`}
          >
            {labels[option]}
          </button>
        ))}
      </span>
    </div>
  )
}
