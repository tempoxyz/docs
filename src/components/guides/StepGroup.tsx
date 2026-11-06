'use client'

import * as React from 'react'

type Entry = { completed: boolean; failed: boolean; number: number }

type StepGroup = {
  collapsed: (id: string) => boolean
  remove: (id: string) => void
  report: (id: string, entry: Entry) => void
}

const Context = React.createContext<StepGroup | null>(null)

/**
 * Tracks the demo steps rendered inside one demo container. A finished step folds to its header
 * once a later step finishes, so long demos stay about one screen tall. The step that finished last
 * and steps showing an error stay open.
 */
export function StepGroupProvider(props: React.PropsWithChildren) {
  const [entries, setEntries] = React.useState<Record<string, Entry>>({})
  const [latest, setLatest] = React.useState<string | null>(null)

  const report = React.useCallback((id: string, entry: Entry) => {
    setEntries((current) => {
      const previous = current[id]
      if (
        previous?.completed === entry.completed &&
        previous.failed === entry.failed &&
        previous.number === entry.number
      )
        return current
      if (entry.completed && !previous?.completed) setLatest(id)
      return { ...current, [id]: entry }
    })
  }, [])

  const remove = React.useCallback((id: string) => {
    setEntries((current) => {
      if (!(id in current)) return current
      const { [id]: _, ...rest } = current
      return rest
    })
  }, [])

  const value = React.useMemo<StepGroup>(
    () => ({
      collapsed(id) {
        const entry = entries[id]
        if (!entry?.completed || entry.failed || id === latest) return false
        return Object.values(entries).some(
          (other) => other.completed && other.number > entry.number,
        )
      },
      remove,
      report,
    }),
    [entries, latest, remove, report],
  )

  return <Context.Provider value={value}>{props.children}</Context.Provider>
}

/** Whether the step should fold, or false outside a demo container. */
export function useStepGroupCollapsed(entry: Entry) {
  const group = React.useContext(Context)
  const id = React.useId()
  const { completed, failed, number } = entry

  React.useEffect(() => {
    group?.report(id, { completed, failed, number })
  }, [group, id, completed, failed, number])

  const remove = group?.remove
  React.useEffect(() => () => remove?.(id), [remove, id])

  return group ? group.collapsed(id) : false
}
