'use client'
import { useContext } from 'react'
import { InterfaceContext } from '@/components/providers/InterfaceProvider'

export const useInterface = () => {
  const context = useContext(InterfaceContext)
  if (!context) {
    throw new Error('useInterface must be used within InterfaceProvider')
  }
  return context
}
