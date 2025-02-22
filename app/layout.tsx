import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import InterfaceProvider from '@/components/providers/InterfaceProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gemini Stream',
  description: 'Real-time Streaming Interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <InterfaceProvider>
          {children}
        </InterfaceProvider>
      </body>
    </html>
  )
}
