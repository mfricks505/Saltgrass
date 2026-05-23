import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Nav from '@/components/Nav'
import MobileNav from '@/components/MobileNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Saltgrass — Florida Outdoors',
  description: 'Florida\'s community for hunters, anglers, and outdoor enthusiasts.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: '#141210', minHeight: '100vh' }}>
        <Nav />
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 80px' }}>
          {children}
        </main>
        <MobileNav />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1E2E1E',
              color: '#E8DFC8',
              fontWeight: 600,
              borderRadius: 12,
              border: '1px solid #2C4A2C',
            },
          }}
        />
      </body>
    </html>
  )
}