'use client'
import { createContext, useState } from 'react'

type InterfaceContext = {
  leftDrawerOpen: boolean
  rightDrawerOpen: boolean
  toggleLeftDrawer: () => void
  toggleRightDrawer: () => void
}

export const InterfaceContext = createContext<InterfaceContext>({
  leftDrawerOpen: false,
  rightDrawerOpen: false,
  toggleLeftDrawer: () => {},
  toggleRightDrawer: () => {}
})

export default function InterfaceProvider({ 
  children 
}: {
  children: React.ReactNode
}) {
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)

  return (
    <InterfaceContext.Provider value={{
      leftDrawerOpen: leftOpen,
      rightDrawerOpen: rightOpen,
      toggleLeftDrawer: () => setLeftOpen(!leftOpen),
      toggleRightDrawer: () => setRightOpen(!rightOpen)
    }}>
      {children}
    </InterfaceContext.Provider>
  )
}
