'use client'
// src/components/MobileNav.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const pathname = usePathname()

  const tabs = [
    { href: '/',            icon: '🌊', label: 'Feed'     },
    { href: '/regions',     icon: '📍', label: 'Regions'  },
    { href: '/search',      icon: '🔍', label: 'Search'   },
    { href: '/marketplace', icon: '🏕️', label: 'Gear'     },
    { href: '/analyzer',    icon: '🌤️', label: 'Go/No-Go' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="mobile-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
      background: '#1A2B1A',
      borderTop: '1px solid #2C4A2C',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {tabs.map(tab => (
          <Link key={tab.href} href={tab.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 16px 8px', textDecoration: 'none',
            borderTop: isActive(tab.href) ? '2px solid #C8924A' : '2px solid transparent',
            flex: 1,
          }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{
              fontSize: 9, marginTop: 2, fontWeight: 600,
              color: isActive(tab.href) ? '#C8924A' : 'rgba(232,223,200,0.4)',
            }}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
