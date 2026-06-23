import * as React from 'react'

export function useStickyStepCompletion(isComplete: boolean) {
  const [isStickyComplete, setIsStickyComplete] = React.useState(isComplete)

  React.useEffect(() => {
    if (isComplete) setIsStickyComplete(true)
  }, [isComplete])

  return isStickyComplete
}
