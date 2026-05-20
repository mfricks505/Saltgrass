'use client'
// src/components/Nav.tsx — Dark mode rebrand
import { useState, useEffect, useRef, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/lib/types'
import toast from 'react-hot-toast'

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
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    setNotifCount(count ?? 0)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/')
    setMenuOpen(false)
  }

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const term = searchQuery.trim()
    if (!term) return

    router.push(`/search?q=${encodeURIComponent(term)}`)
    setSearchQuery('')
  }

  const navLinks = [
    { href: '/', label: 'Feed', icon: '🌊' },
    { href: '/regions', label: 'Regions', icon: '📍' },
    { href: '/people', label: 'People', icon: '👥' },
    { href: '/vendors', label: 'Find Guides', icon: '🔭' },
    { href: '/marketplace', label: 'Gear', icon: '🏷️' },
  ]

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  return (
    <nav
      style={{
        background: '#1A2B1A',
        borderBottom: '1px solid #2C4A2C',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px 10px 0',
            flexShrink: 0,
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="16" r="11" fill="#C8924A" opacity="0.9" />
            <path d="M8 26 Q10 20 11 26" stroke="#3D6B3D" strokeWidth="1.5" fill="none" />
            <path d="M25 26 Q27 19 28 26" stroke="#3D6B3D" strokeWidth="1.5" fill="none" />
            <line x1="6" y1="26" x2="30" y2="26" stroke="#3D6B3D" strokeWidth="1.5" />
          </svg>
          <div>
            <div
              style={{
                color: '#E8DFC8',
                fontWeight: 900,
                fontSize: 18,
                letterSpacing: 2,
                textTransform: 'uppercase',
                lineHeight: 1,
                fontFamily: 'Georgia, serif',
              }}
            >
              Saltgrass
            </div>
            <div
              style={{
                color: '#C8924A',
                fontSize: 8,
                letterSpacing: 3,
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Florida Outdoors
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: 0 }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '16px 12px 12px',
                color: isActive(link.href) ? '#E8DFC8' : 'rgba(232,223,200,0.45)',
                fontWeight: 600,
                fontSize: 12,
                borderBottom: isActive(link.href) ? '3px solid #C8924A' : '3px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: 14 }}>{link.icon}</span>
              <span className="desktop-nav-label">{link.label}</span>
            </Link>
          ))}
        </div>

        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 220, margin: '0 8px' }}>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search..."
            style={{
              width: '100%',
              padding: '7px 14px',
              borderRadius: 20,
              border: '1px solid #2C4A2C',
              background: 'rgba(255,255,255,0.06)',
              color: '#E8DFC8',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {user ? (
            <>
              <Link
                href="/post/new"
                style={{
                  background: '#C8924A',
                  color: '#fff',
                  borderRadius: 20,
                  padding: '7px 16px',
                  fontWeight: 700,
                  fontSize: 12,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                + Post
              </Link>
              <Link
                href="/messages"
                style={{
                  fontSize: 18,
                  textDecoration: 'none',
                  padding: '4px 6px',
                  color: '#E8DFC8',
                }}
              >
                💬
              </Link>
              <div style={{ position: 'relative' }}>
                <Link
                  href="/notifications"
                  style={{
                    position: 'relative',
                    fontSize: 18,
                    textDecoration: 'none',
                    padding: '4px 6px',
                    color: '#E8DFC8',
                  }}
                >
                  🔔
                  {notifCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: '#C8452A',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 15,
                        height: 15,
                        fontSize: 8,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1.5px solid #1A2B1A',
                      }}
                    >
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Link>
              </div>
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(prev => !prev)}
                  style={{
                    background: '#2C4A2C',
                    border: '1.5px solid #3D6B3D',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                  }}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: 16 }}>🧑</span>
                  )}
                </button>

                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 44,
                      background: '#1E2E1E',
                      border: '1px solid #2C4A2C',
                      borderRadius: 14,
                      minWidth: 200,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                      overflow: 'hidden',
                      zIndex: 300,
                    }}
                  >
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #2C4A2C' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#E8DFC8' }}>
                        @{profile?.username ?? 'user'}
                      </div>
                      <div style={{ fontSize: 12, color: '#887E6E' }}>{user.email}</div>
                    </div>
                    {[
                      { href: `/profile/${profile?.username ?? ''}`, label: '👤 My Profile' },
                      { href: '/bookmarks', label: '🔖 Bookmarks' },
                      { href: '/marketplace/dashboard', label: '🏕️ My Listings' },
                      { href: '/vendors/dashboard', label: '📊 Vendor Dashboard' },
                      { href: '/settings', label: '⚙️ Settings' },
                    ].map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '11px 16px',
                          textDecoration: 'none',
                          color: '#C8BEA8',
                          fontSize: 14,
                          fontWeight: 500,
                          transition: 'background 0.1s, color 0.1s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#2C4A2C'
                          e.currentTarget.style.color = '#E8DFC8'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#C8BEA8'
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '11px 16px',
                        background: 'none',
                        border: 'none',
                        borderTop: '1px solid #2C4A2C',
                        color: '#C8452A',
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                style={{
                  color: 'rgba(232,223,200,0.7)',
                  fontWeight: 600,
                  fontSize: 13,
                  textDecoration: 'none',
                  padding: '8px 10px',
                }}
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                style={{
                  background: '#C8924A',
                  color: '#fff',
                  borderRadius: 20,
                  padding: '8px 18px',
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Join Free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
