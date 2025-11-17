import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { Address, TransactionReceipt } from 'viem'
import { useAccount } from 'wagmi'

// Define your allowed keys and their types here
interface DemoData {
  tokenAddress: Address
  tokenReceipt: TransactionReceipt
}

interface DemoContextValue {
  setData: <K extends keyof DemoData>(key: K, value: DemoData[K]) => void
  getData: <K extends keyof DemoData>(key: K) => DemoData[K] | undefined
  clearData: <K extends keyof DemoData>(key?: K) => void
  data: Partial<DemoData>
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined)

interface DemoContextProviderProps {
  children: ReactNode
}

const STORAGE_KEY = 'demoContext'

// Helper functions for localStorage serialization
function loadFromStorage(): Record<Address, Partial<DemoData>> {
  if (typeof window === 'undefined') return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to load demo context from storage:', error)
    return {}
  }
}

function saveToStorage(data: Record<Address, Partial<DemoData>>) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save demo context to storage:', error)
  }
}

export function DemoContextProvider({ children }: DemoContextProviderProps) {
  const { address } = useAccount()

  // State now stores data per account
  const [allData, setAllData] = useState<Record<Address, Partial<DemoData>>>(
    () => loadFromStorage(),
  )

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(allData)
  }, [allData])

  const setData = useCallback(
    <K extends keyof DemoData>(key: K, value: DemoData[K]) => {
      if (!address) return

      setAllData((prev) => ({
        ...prev,
        [address]: {
          ...prev[address],
          [key]: value,
        },
      }))
    },
    [address],
  )

  const getData = useCallback(
    <K extends keyof DemoData>(key: K): DemoData[K] | undefined => {
      if (!address) return undefined
      return allData[address]?.[key]
    },
    [address, allData],
  )

  const clearData = useCallback(
    <K extends keyof DemoData>(key?: K) => {
      if (!address) return

      setAllData((prev) => {
        if (!prev[address]) return prev

        if (key === undefined) {
          // Clear all data for this account
          const { [address]: _, ...rest } = prev
          return rest
        }

        // Clear specific key for this account
        const { [key]: _, ...accountRest } = prev[address]

        // If account data is now empty, remove the account entry
        if (Object.keys(accountRest).length === 0) {
          const { [address]: __, ...rest } = prev
          return rest
        }

        return {
          ...prev,
          [address]: accountRest,
        }
      })
    },
    [address],
  )

  const value: DemoContextValue = {
    setData,
    getData,
    clearData,
    data: address ? allData[address] || {} : {},
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
