// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Nav from '@/components/Nav'
import MobileNav from '@/components/MobileNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Saltgrass — Florida Outdoors',
  description: "Florida's community for hunters, anglers, and boaters. Real people. Real intel. No BS.",
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: '#0A0C08', minHeight: '100vh' }}>
        <Nav />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 80px' }}>
          {children}
        </main>
        <MobileNav />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141F14',
              color: '#E8DFC8',
              fontWeight: 600,
              borderRadius: 6,
              border: '1px solid #243824',
              fontFamily: 'Impact, Arial Black, sans-serif',
              letterSpacing: 1,
            },
          }}
        />
      </body>
    </html>
  )
}
