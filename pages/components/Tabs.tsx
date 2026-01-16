import { Tabs as VocsTabs } from 'vocs/components'
import { useQueryState } from 'nuqs'
import type { ReactNode, ReactElement } from 'react'
import { Children, isValidElement } from 'react'

interface TabsProps {
  items: string[]
  children: ReactNode
  queryKey?: string
  defaultValue?: string
}

export function Tabs({ items, children, queryKey = 'tab', defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useQueryState(queryKey, {
    defaultValue: defaultValue || items[0],
  })

  const childArray = Children.toArray(children).filter(isValidElement) as ReactElement[]

  return (
    <VocsTabs.Root value={activeTab || items[0]} onValueChange={setActiveTab} className="tabs-container">
      <VocsTabs.List>
        {items.map((item) => (
          <VocsTabs.Trigger key={item} value={item}>
            {item}
          </VocsTabs.Trigger>
        ))}
      </VocsTabs.List>
      {items.map((item, index) => (
        <VocsTabs.Content key={item} value={item}>
          {childArray[index]}
        </VocsTabs.Content>
      ))}
    </VocsTabs.Root>
  )
}

interface TabProps {
  children: ReactNode
}

export function Tab({ children }: TabProps) {
  return <div>{children}</div>
}

export default Tabs
