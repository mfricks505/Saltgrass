'use client'
// src/components/MobileNav.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const pathname = usePathname()
  const tabs = [
    { href: '/',        label: 'BOARD'   },
    { href: '/wall',    label: 'WALL'    },
    { href: '/market',  label: 'MARKET'  },
    { href: '/crewup',  label: 'CREW UP' },
    { href: '/rundown', label: 'RUNDOWN' },
  ]
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <nav className="mobile-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300, background: '#0F1A0F', borderTop: '2px solid #C8922A', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div style={{ display: 'flex' }}>
        {tabs.map(tab => (
          <Link key={tab.href} href={tab.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 4px 8px', textDecoration: 'none', borderTop: isActive(tab.href) ? '2px solid #C8922A' : '2px solid transparent', marginTop: -2 }}>
            <span style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 1.5, color: isActive(tab.href) ? '#C8922A' : 'rgba(232,223,200,0.4)' }}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
