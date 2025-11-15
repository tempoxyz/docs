import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'
import type { Address } from 'viem'
import { useAccountEffect } from 'wagmi'

// Define your allowed keys and their types here
interface DemoData {
  tokenAddress: Address
}

interface DemoContextValue {
  setData: <K extends keyof DemoData>(key: K, value: DemoData[K]) => void
  getData: <K extends keyof DemoData>(key: K) => DemoData[K] | undefined
  clearData: <K extends keyof DemoData>(key?: K) => void
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined)

interface DemoContextProviderProps {
  children: ReactNode
}

export function DemoContextProvider({ children }: DemoContextProviderProps) {
  const [data, setDataState] = useState<
    Map<keyof DemoData, DemoData[keyof DemoData]>
  >(new Map())

  const setData = useCallback(
    <K extends keyof DemoData>(key: K, value: DemoData[K]) => {
      setDataState((prev) => {
        const next = new Map(prev)
        next.set(key, value)
        return next
      })
    },
    [],
  )

  const getData = useCallback(
    <K extends keyof DemoData>(key: K): DemoData[K] | undefined => {
      return data.get(key) as DemoData[K] | undefined
    },
    [data],
  )

  const clearData = useCallback(<K extends keyof DemoData>(key?: K) => {
    setDataState((prev) => {
      if (key === undefined) {
        return new Map()
      }
      const next = new Map(prev)
      next.delete(key)
      return next
    })
  }, [])

  // Clear all data when account disconnects
  useAccountEffect({
    onDisconnect() {
      setDataState(new Map())
    },
  })

  const value: DemoContextValue = {
    setData,
    getData,
    clearData,
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemoContext(): DemoContextValue {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error('useDemoContext must be used within a DemoContextProvider')
  }
  return context
}
