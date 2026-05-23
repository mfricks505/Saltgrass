'use client'
// src/components/Nav.tsx

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/lib/types'
import toast from 'react-hot-toast'

function SaltgrassLogo() {
  return (
    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="20" r="13" fill="#C8922A" opacity="0.88"/>
        <rect x="5" y="33" width="34" height="2" rx="1" fill="#3D5C2A"/>
        <path d="M9 33 Q10 28 11 33" stroke="#3D5C2A" strokeWidth="1.5" fill="none"/>
        <path d="M33 33 Q34 28 35 33" stroke="#3D5C2A" strokeWidth="1.5" fill="none"/>
        {/* Hunter - left */}
        <circle cx="16" cy="13" r="2" fill="#0A0C08"/>
        <rect x="13.5" y="11.8" width="5" height="0.9" rx="0.4" fill="#0A0C08"/>
        <rect x="14.5" y="10" width="3.5" height="2.2" rx="1" fill="#0A0C08"/>
        <path d="M16 15.5 L16 23" stroke="#0A0C08" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M16 18 L11 17" stroke="#0A0C08" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M11 17 L7.5 16.5" stroke="#0A0C08" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M16 23 L13.5 33" stroke="#0A0C08" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 23 L18 33" stroke="#0A0C08" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Angler - right */}
        <circle cx="28" cy="13" r="2" fill="#0A0C08"/>
        <rect x="25.5" y="11.8" width="5" height="0.9" rx="0.4" fill="#0A0C08"/>
        <rect x="26" y="10" width="3.5" height="2.2" rx="1" fill="#0A0C08"/>
        <path d="M28 15.5 L28 23" stroke="#0A0C08" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M28 18 L33 17" stroke="#0A0C08" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M33 17 L38 12" stroke="#0A0C08" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M38 12 Q40 17 37 20" stroke="#0A0C08" strokeWidth="1" fill="none"/>
        <path d="M28 23 L25.5 33" stroke="#0A0C08" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M28 23 L30 33" stroke="#0A0C08" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Birds */}
        <path d="M13 8 Q14 6.5 15 8" stroke="#0A0C08" strokeWidth="0.9" fill="none"/>
        <path d="M11 6 Q12 4.5 13 6" stroke="#0A0C08" strokeWidth="0.9" fill="none"/>
      </svg>
      <div>
        <div style={{ color: '#E8DFC8', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 18, letterSpacing: 3, textTransform: 'uppercase', lineHeight: 1 }}>
          SALTGRASS
        </div>
        <div style={{ color: '#C8922A', fontSize: 7, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>
          FLORIDA OUTDOORS
        </div>
      </div>
    </Link>
  )
}

export default function Nav() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const menuRef = useRef<HTMLDivElement>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notifCount, setNotifCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
    const { count } = await supabase
      .from('notifications').select('*', { count: 'exact', head: true })
      .eq('user_id', userId).eq('read', false)
    setNotifCount(count ?? 0)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('SIGNED OUT')
    router.push('/')
    setMenuOpen(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
  }

  const navLinks = [
    { href: '/',          label: 'THE BOARD',   sub: 'Reports & Forum'   },
    { href: '/wall',      label: 'THE WALL',    sub: 'Trophies & Catches' },
    { href: '/market',    label: 'THE MARKET',  sub: 'Gear Marketplace'  },
    { href: '/guides',    label: 'GUIDES',      sub: 'Verified Services' },
    { href: '/crewup',    label: 'CREW UP',     sub: 'Share a Trip'      },
    { href: '/rundown',   label: 'THE RUNDOWN', sub: 'Conditions'        },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav style={{
      background: '#0F1A0F',
      borderBottom: '2px solid #C8922A',
      position: 'sticky', top: 0, zIndex: 200,
      boxShadow: '0 4px 30px rgba(0,0,0,0.8)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 6, height: 62 }}>

        <SaltgrassLogo />

        <div style={{ width: 1, height: 28, background: '#243824', margin: '0 8px', flexShrink: 0 }} />

        {/* Nav links */}
        <div style={{ display: 'flex', flex: 1 }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} style={{
              textDecoration: 'none',
              padding: '0 10px',
              height: 62,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              borderBottom: isActive(link.href) ? '3px solid #C8922A' : '3px solid transparent',
              borderTop: '3px solid transparent',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 2, color: isActive(link.href) ? '#C8922A' : 'rgba(232,223,200,0.55)', lineHeight: 1 }}>
                {link.label}
              </div>
              <div style={{ fontSize: 8, letterSpacing: 0.5, color: isActive(link.href) ? 'rgba(200,146,42,0.65)' : 'rgba(107,99,88,0.7)', marginTop: 3 }}>
                {link.sub}
              </div>
            </Link>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ maxWidth: 170, margin: '0 6px' }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search..."
            style={{ padding: '7px 12px', borderRadius: 4, border: '1px solid #243824', background: 'rgba(255,255,255,0.04)', color: '#E8DFC8', fontSize: 12, outline: 'none', width: '100%' }}
          />
        </form>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {user ? (
            <>
              <Link href="/post/new" style={{ background: '#C8922A', color: '#0F1A0F', borderRadius: 4, padding: '8px 14px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 1, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                + POST
              </Link>
              <Link href="/messages" style={{ color: '#B8AE98', fontSize: 17, padding: '4px' }}>💬</Link>
              <Link href="/notifications" style={{ position: 'relative', color: '#B8AE98', fontSize: 17, padding: '4px' }}>
                🔔
                {notifCount > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, background: '#C8452A', color: '#fff', borderRadius: '50%', width: 14, height: 14, fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #0F1A0F' }}>
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </Link>
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: '#1C2E1C', border: '1.5px solid #243824', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: 34, height: 34, objectFit: 'cover' }} /> : <span style={{ fontSize: 15 }}>🧑</span>}
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 42, background: '#141F14', border: '1px solid #243824', borderRadius: 6, minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.8)', overflow: 'hidden', zIndex: 300 }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #243824' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#E8DFC8' }}>@{profile?.username}</div>
                      <div style={{ fontSize: 11, color: '#6B6358' }}>{user.email}</div>
                    </div>
                    {[
                      { href: `/profile/${profile?.username}`, label: '👤 My Profile' },
                      { href: '/bookmarks',                    label: '🔖 Saved' },
                      { href: '/market/dashboard',             label: '🏕️ My Listings' },
                      { href: '/crewup',                       label: '⛵ My Trips' },
                      { href: '/guides/dashboard',             label: '📊 Vendor Dashboard' },
                      { href: '/settings',                     label: '⚙️ Settings' },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                        style={{ display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#B8AE98', fontSize: 13 }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#1C2E1C'; e.currentTarget.style.color = '#E8DFC8' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B8AE98' }}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button onClick={handleSignOut} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', borderTop: '1px solid #243824', color: '#C8452A', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ color: 'rgba(232,223,200,0.5)', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 1, padding: '8px 6px' }}>LOG IN</Link>
              <Link href="/auth/signup" style={{ background: '#C8922A', color: '#0F1A0F', borderRadius: 4, padding: '8px 16px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 1, whiteSpace: 'nowrap' }}>
                JOIN FREE
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
