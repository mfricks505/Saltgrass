'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function MobileNav() {
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const tabs = [
    { href: '/',            icon: '🌊', label: 'Feed'    },
    { href: '/regions',     icon: '📍', label: 'Regions' },
    { href: '/search',      icon: '🔍', label: 'Search'  },
    { href: '/marketplace', icon: '🏕️', label: 'Gear'    },
    { href: user ? '/messages' : '/auth/login', icon: '💬', label: 'DMs' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="mobile-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
      background: '#1C3A2A', borderTop: '1px solid rgba(255,255,255,0.1)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        {tabs.map(tab => (
          <Link key={tab.href} href={tab.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '10px 16px 8px', textDecoration: 'none',
            borderTop: isActive(tab.href) ? '2px solid #8DBF6E' : '2px solid transparent',
          }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, color: isActive(tab.href) ? '#8DBF6E' : 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: 2 }}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
