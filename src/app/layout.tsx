// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Nav from '@/components/Nav'
import MobileNav from '@/components/MobileNav'
import FeedbackWidget from '@/components/FeedbackWidget'

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className} style={{ background: 'var(--background)', minHeight: '100vh' }}>
        <Nav />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 20px 80px' }}>
          {children}
        </main>
        <MobileNav />
        <FeedbackWidget />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              fontWeight: 600,
              borderRadius: 4,
              border: '1px solid var(--border)',
              fontFamily: 'Oswald, sans-serif',
              letterSpacing: '1px',
            },
          }}
        />
      </body>
    </html>
  )
}
