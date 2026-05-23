'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { REGIONS, type PostWithProfile } from '@/lib/types'
import PostCard from '@/components/Postcard'
import Link from 'next/link'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }

export default function HomePage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [regionFilter, setRegionFilter] = useState('all')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    loadPosts()
  }, [regionFilter])

  async function loadPosts() {
    setLoading(true)
    let query = supabase.from('posts_with_profiles').select('*').order('created_at', { ascending: false }).limit(30)
    if (regionFilter !== 'all') query = query.eq('region_id', regionFilter)
    const { data, error } = await query
    if (!error && data) setPosts(data as PostWithProfile[])
    setLoading(false)
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #0F1A0F, #141F14)', border: '1px solid #243824', borderRadius: 8, padding: '52px 44px 48px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,146,42,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 640 }}>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 4, color: B.copper, marginBottom: 14 }}>BUILT FOR FLORIDA OUTDOORSMEN</div>
          <h1 style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 50, lineHeight: 1.0, letterSpacing: 1, color: B.bone, margin: '0 0 20px', textTransform: 'uppercase' }}>
            THE PEOPLE YOU TRUST.<br />THE GEAR YOU NEED.<br /><span style={{ color: B.copper }}>THE SPOTS YOU'VE EARNED.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: B.parchment, margin: '0 0 10px', maxWidth: 560 }}>
            Real names. Real reviews. Real reports. No algorithms, no bots, no political garbage.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: B.dust, margin: '0 0 32px', maxWidth: 540 }}>
            Florida hunters, anglers, and boaters — sharing intel, finding vetted guides, buying gear from people they trust, and sharing the ride out.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/post/new" style={{ background: B.copper, color: '#0A0C08', padding: '13px 28px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 14, letterSpacing: 2, textDecoration: 'none' }}>+ POST A REPORT</Link>
            ) : (
              <>
                <Link href="/auth/signup" style={{ background: B.copper, color: '#0A0C08', padding: '13px 30px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 14, letterSpacing: 2, textDecoration: 'none' }}>JOIN FREE</Link>
                <Link href="/auth/login" style={{ background: 'transparent', color: B.parchment, padding: '13px 22px', borderRadius: 4, border: '2px solid #243824', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, letterSpacing: 2, textDecoration: 'none' }}>LOG IN</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5 pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 10 }}>
        {[
          { href: '/',        icon: '📋', title: 'THE BOARD',   desc: 'Reports, intel, and forum posts from guys who were actually out this morning.' },
          { href: '/wall',    icon: '🏆', title: 'THE WALL',    desc: 'Trophies, big catches, and personal bests. Instagram for outdoorsmen.' },
          { href: '/market',  icon: '🏕️', title: 'THE MARKET',  desc: 'Buy and sell gear locally. Real accounts. No scammers. No lowballers.' },
          { href: '/guides',  icon: '🔭', title: 'GUIDES',      desc: 'Verified guides and outfitters. Reviews from members who actually booked them.' },
          { href: '/crewup',  icon: '⛵', title: 'CREW UP',     desc: 'Empty seat in the boat? Split fuel costs with a verified member going your way.' },
        ].map(p => (
          <Link key={p.href} href={p.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: B.forest, border: '1px solid #243824', borderRadius: 8, padding: '20px 16px', height: '100%', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = B.copper)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#243824')}
            >
              <div style={{ fontSize: 26, marginBottom: 10 }}>{p.icon}</div>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 2, color: B.copper, marginBottom: 8 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: B.parchment, lineHeight: 1.7 }}>{p.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Trust bar */}
      <div style={{ background: B.forest, border: '1px solid #243824', borderRadius: 8, padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center' }}>
        {[
          { val: 'ZERO', label: 'Anonymous Accounts' },
          { val: 'ZERO', label: 'Paid Ads' },
          { val: 'ZERO', label: 'Political Posts' },
          { val: 'ZERO', label: 'AI Bots' },
          { val: '100%', label: 'Real People' },
          { val: '100%', label: 'Verified Vendors' },
          { val: 'FREE', label: 'Always' },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center', borderRight: i < 6 ? '1px solid #243824' : 'none', padding: '0 8px' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 16, color: B.copper, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 9, color: B.dust, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rundown strip */}
      <Link href="/rundown" style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
        <div style={{ background: B.forest, border: '1px solid #243824', borderLeft: `4px solid ${B.copper}`, borderRadius: 8, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
          onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = B.moss)}
          onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = B.forest)}
        >
          <span style={{ fontSize: 24 }}>🌤️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 2, color: B.bone }}>THE RUNDOWN — CONDITIONS & TOOLS</div>
            <div style={{ fontSize: 11, color: B.dust, marginTop: 2 }}>Wind, tide, weather — check before you load the truck</div>
          </div>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 2, color: B.copper }}>CHECK NOW →</div>
        </div>
      </Link>

      {/* Feed + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 10, alignItems: 'start' }}>
        <div>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 4, color: B.copper, marginBottom: 10 }}>LATEST FROM THE BOARD</div>
          <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 }}>
            <button onClick={() => setRegionFilter('all')} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, cursor: 'pointer', border: `2px solid ${regionFilter === 'all' ? B.copper : '#243824'}`, background: regionFilter === 'all' ? B.copper : 'transparent', color: regionFilter === 'all' ? '#0A0C08' : B.parchment }}>
              ALL FLORIDA
            </button>
            {REGIONS.map(r => (
              <button key={r.id} onClick={() => setRegionFilter(r.id)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 1, cursor: 'pointer', border: `2px solid ${regionFilter === r.id ? B.copper : '#243824'}`, background: regionFilter === r.id ? 'rgba(200,146,42,0.15)' : 'transparent', color: regionFilter === r.id ? B.copper : B.parchment, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>{r.icon}</span><span>{r.label.toUpperCase()}</span>
              </button>
            ))}
          </div>
          {loading ? [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 8, marginBottom: 10 }} />) :
           posts.length === 0 ? (
            <div style={{ background: B.forest, borderRadius: 8, padding: 48, textAlign: 'center', border: '1px solid #243824' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎣</div>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 16, letterSpacing: 2, color: B.bone, marginBottom: 8 }}>NO POSTS YET</div>
              <div style={{ color: B.dust, fontSize: 13, marginBottom: 20 }}>Be the first to post a report.</div>
              <Link href={user ? '/post/new' : '/auth/signup'} style={{ background: B.copper, color: '#0A0C08', padding: '11px 22px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 2, textDecoration: 'none' }}>
                {user ? 'POST A REPORT' : 'JOIN & POST'}
              </Link>
            </div>
          ) : posts.map(post => <PostCard key={post.id} post={post} onUpdate={loadPosts} />)}
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 72, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!user && (
            <div style={{ background: B.forest, borderRadius: 8, padding: 18, border: '1px solid #243824' }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, letterSpacing: 2, color: B.bone, marginBottom: 8 }}>JOIN THE COMMUNITY</div>
              <p style={{ fontSize: 12, color: B.parchment, lineHeight: 1.7, margin: '0 0 14px' }}>Free. No ads. No subscription. Saltgrass makes money when vendors list and gear sells — not from you.</p>
              <Link href="/auth/signup" style={{ display: 'block', textAlign: 'center', background: B.copper, color: '#0A0C08', padding: '11px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 2, textDecoration: 'none', marginBottom: 7 }}>JOIN FREE</Link>
              <Link href="/auth/login" style={{ display: 'block', textAlign: 'center', color: B.dust, padding: '9px', borderRadius: 4, border: '1px solid #243824', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 2, textDecoration: 'none' }}>ALREADY A MEMBER</Link>
            </div>
          )}
          <div style={{ background: B.forest, borderRadius: 8, overflow: 'hidden', border: '1px solid #243824' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #243824' }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.copper }}>FLORIDA REGIONS</div>
            </div>
            {REGIONS.map((r, i) => (
              <Link key={r.id} href={`/regions/${r.id}`} style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', borderBottom: i < REGIONS.length - 1 ? '1px solid #1C2E1C' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1C2E1C')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: 15 }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1, color: B.bone }}>{r.label.toUpperCase()}</div>
                  <div style={{ fontSize: 9, color: B.dust, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.sub}</div>
                </div>
                <span style={{ color: '#243824' }}>›</span>
              </Link>
            ))}
          </div>
          <div style={{ background: B.forest, borderRadius: 8, padding: 16, border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.copper, marginBottom: 8 }}>GUIDES & OUTFITTERS</div>
            <p style={{ fontSize: 12, color: B.parchment, lineHeight: 1.7, margin: '0 0 12px' }}>Every guide verified before listing. Reviews from members who actually booked them.</p>
            <Link href="/guides" style={{ display: 'block', textAlign: 'center', color: B.copper, padding: '9px', borderRadius: 4, border: `2px solid ${B.copper}`, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 2, textDecoration: 'none' }}>FIND A GUIDE</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
