'use client'
// src/app/profile/[username]/page.tsx
// Public profile: header, badges, their posts + catches.

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'
import BadgeRack from '@/components/BadgeRack'

const O = { fontFamily: "'Oswald', sans-serif" }
const B = { surface:'var(--surface)', card:'var(--card)', sun:'var(--sun)', sub:'var(--sub)', dust:'var(--dust)', accent:'var(--accent)', border:'var(--border)' }

export default function ProfilePage() {
  const { username } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [catchCount, setCatchCount] = useState(0)
  const [speciesCount, setSpeciesCount] = useState(0)
  const [isMe, setIsMe] = useState(false)
  const [tab, setTab] = useState<'posts'|'catches'>('posts')
  const [catches, setCatches] = useState<any[]>([])

  useEffect(() => { load() }, [username])
  async function load() {
    setLoading(true)
    const uname = String(username).toLowerCase()
    const { data: p } = await supabase.from('profiles').select('*').eq('username', uname).single()
    if (!p) { setLoading(false); return }
    setProfile(p)

    const { data: { user } } = await supabase.auth.getUser()
    setIsMe(user?.id === p.id)

    // their posts (via the view if present, else raw)
    const { data: pp } = await supabase.from('posts').select('*').eq('user_id', p.id).order('created_at', { ascending: false }).limit(30)
    setPosts(pp ?? [])

    // their catch stats (only show counts publicly, not spots)
    const { data: c } = await supabase.from('catch_log').select('species').eq('user_id', p.id)
    if (c) { setCatchCount(c.length); setSpeciesCount(new Set(c.map((x:any)=>x.species)).size) }

    setLoading(false)
  }

  if (loading) return <div style={{ ...O, color: B.dust, letterSpacing: 2, padding: 40, textAlign: 'center' }}>LOADING...</div>
  if (!profile) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>🤷</div>
      <div style={{ ...O, fontSize: 18, color: B.sun, letterSpacing: 1 }}>USER NOT FOUND</div>
      <Link href="/" style={{ color: B.accent, fontSize: 13, textDecoration: 'none', marginTop: 12, display: 'inline-block' }}>← Back home</Link>
    </div>
  )

  const region = REGIONS.find(r => r.id === profile.home_region)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,var(--card),var(--surface))', border: '1px solid var(--border)', borderRadius: 10, padding: '24px 26px', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--silhouette)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${B.accent}` }}>
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 30 }}>🎣</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...O, fontSize: 22, color: B.sun, lineHeight: 1.1 }}>{profile.full_name || `@${profile.username}`}</div>
            <div style={{ fontSize: 13, color: B.dust, marginTop: 2 }}>@{profile.username}{region ? ` · ${region.icon} ${region.label}` : ''}</div>
          </div>
          {isMe && <Link href="/settings" style={{ ...O, flexShrink: 0, background: 'transparent', color: B.accent, border: `1.5px solid ${B.accent}`, borderRadius: 5, padding: '8px 14px', fontSize: 11, letterSpacing: 1, textDecoration: 'none' }}>EDIT</Link>}
        </div>
        {profile.bio && <p style={{ fontSize: 14, color: B.sub, lineHeight: 1.6, margin: '14px 0 0' }}>{profile.bio}</p>}
        {profile.website && <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: B.accent, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>🌐 {profile.website}</a>}

        {/* stats */}
        <div style={{ display: 'flex', gap: 22, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <Stat n={posts.length} label="POSTS" />
          <Stat n={catchCount} label="CATCHES" />
          <Stat n={speciesCount} label="SPECIES" />
        </div>
      </div>

      {/* Badges */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 18, marginBottom: 12 }}>
        <BadgeRack inputs={{
          userLevel: profile.level ?? (profile.is_verified ? 3 : 2),
          catchCount, speciesCount,
          memberSince: profile.created_at,
          completedSales: 0,
        }} />
      </div>

      {/* Posts */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 18 }}>
        <div style={{ ...O, fontSize: 12, letterSpacing: 2, color: B.accent, marginBottom: 12 }}>RECENT POSTS</div>
        {posts.length === 0 ? <div style={{ fontSize: 13, color: B.dust }}>No posts yet.</div> :
          posts.map(p => (
            <Link key={p.id} href={`/report/${p.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, color: B.sun, marginBottom: 3 }}>{p.title || p.body?.slice(0, 80) || '(post)'}</div>
                <div style={{ fontSize: 11, color: B.dust }}>{new Date(p.created_at).toLocaleDateString()}</div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  )
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div style={{ ...O, fontSize: 20, color: 'var(--sun)' }}>{n}</div>
      <div style={{ ...O, fontSize: 9, letterSpacing: 2, color: 'var(--dust)' }}>{label}</div>
    </div>
  )
}
