"use client"

import { useRef } from "react"
import { Provider } from "react-redux"
import { makeStore, type AppStore, type RootState } from "@/store"

export function StoreProvider({
  children,
  preloadedState,
}: Readonly<{
  children: React.ReactNode
  preloadedState?: Partial<RootState>
}>) {
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = makeStore(preloadedState)
  }
  return <Provider store={storeRef.current}>{children}</Provider>
}
