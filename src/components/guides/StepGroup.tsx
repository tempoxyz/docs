'use client'

import * as React from 'react'

/** pinned: the step holds controls readers keep using, so it never folds on its own. */
type Entry = { completed: boolean; failed: boolean; number: number; pinned: boolean }

type State = { entries: Record<string, Entry>; latest: string | null }

type StepGroup = {
  collapsed: (id: string) => boolean
  remove: (id: string) => void
  report: (id: string, entry: Entry) => void
}

const Context = React.createContext<StepGroup | null>(null)

/**
 * Tracks the demo steps rendered inside one demo container. A finished step folds to its header
 * once two later steps finish, so long demos stay short while the last two results stay readable.
 * The step that finished last, steps showing an error and steps with form fields stay open.
 */
export function StepGroupProvider(props: React.PropsWithChildren) {
  const [state, setState] = React.useState<State>({ entries: {}, latest: null })

  const report = React.useCallback((id: string, entry: Entry) => {
    setState((current) => {
      const previous = current.entries[id]
      if (
        previous?.completed === entry.completed &&
        previous.failed === entry.failed &&
        previous.number === entry.number &&
        previous.pinned === entry.pinned
      )
        return current
      return {
        entries: { ...current.entries, [id]: entry },
        latest: entry.completed && !previous?.completed ? id : current.latest,
      }
    })
  }, [])

  const remove = React.useCallback((id: string) => {
    setState((current) => {
      if (!(id in current.entries)) return current
      const { [id]: _, ...entries } = current.entries
      return { entries, latest: current.latest === id ? null : current.latest }
    })
  }, [])

  const value = React.useMemo<StepGroup>(
    () => ({
      collapsed(id) {
        const entry = state.entries[id]
        if (!entry?.completed || entry.failed || entry.pinned || id === state.latest) return false
        // Fold only once two later steps finished, so the step that just finished and the one
        // before it stay open beside the step the reader is on.
        const laterFinished = Object.values(state.entries).filter(
          (other) => other.completed && other.number > entry.number,
        ).length
        return laterFinished >= 2
      },
      remove,
      report,
    }),
    [state, remove, report],
  )

  return <Context.Provider value={value}>{props.children}</Context.Provider>
}

/** Whether the step should fold, or false outside a demo container. */
export function useStepGroupCollapsed(entry: Entry) {
  const group = React.useContext(Context)
  const id = React.useId()
  const { completed, failed, number, pinned } = entry
  const report = group?.report
  const remove = group?.remove

  React.useEffect(() => {
    report?.(id, { completed, failed, number, pinned })
  }, [report, id, completed, failed, number, pinned])

  React.useEffect(() => () => remove?.(id), [remove, id])

  return group ? group.collapsed(id) : false
}
