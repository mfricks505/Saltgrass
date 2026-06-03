'use client'
// src/app/wall/page.tsx — The Wall (real posts + secure posting)

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'
import PostTrophyModal from '@/components/PostTrophyModal'

const B = {
  midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C',
  canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8',
  parchment:'#B8AE98', dust:'#6B6358',
}
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

const CATEGORIES = [
  { id:'all', label:'ALL', icon:'🏆' }, { id:'fish', label:'FISH', icon:'🎣' },
  { id:'deer', label:'DEER', icon:'🦌' }, { id:'hog', label:'HOG', icon:'🐗' },
  { id:'turkey', label:'TURKEY', icon:'🦃' }, { id:'waterfowl', label:'WATERFOWL', icon:'🦆' },
  { id:'other', label:'OTHER', icon:'🏕️' },
]

const regionMeta = (id: string) => REGIONS.find(r => r.id === id) ?? { icon:'📍', label:id }

export default function WallPage() {
  const supabase = createClient()
  const [category, setCategory] = useState('all')
  const [region, setRegion]     = useState('all')
  const [posts, setPosts]       = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showPost, setShowPost] = useState(false)
  const [liked, setLiked]       = useState<Record<string, boolean>>({})

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('wall_posts').select('*').order('created_at', { ascending: false }).limit(60)
    setPosts(data ?? [])
    setLoading(false)
  }

  async function openPost() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    setShowPost(true)
  }

  async function toggleLike(postId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    const isLiked = liked[postId]
    setLiked(l => ({ ...l, [postId]: !isLiked }))
    if (isLiked) {
      await supabase.from('wall_likes').delete().match({ post_id: postId, user_id: user.id })
    } else {
      await supabase.from('wall_likes').insert({ post_id: postId, user_id: user.id })
    }
  }

  const filtered = posts
    .filter(p => category === 'all' || p.category === category)
    .filter(p => region === 'all' || p.region === region)

  return (
    <div>
      {/* Header */}
      <div style={{ background:'linear-gradient(160deg, #0F1A0F, #141F14)', border:'1px solid #243824', borderRadius:8, padding:'44px 40px 40px', marginBottom:10, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-60, top:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(200,146,42,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:600 }}>
          <div style={{ ...O, fontSize:11, letterSpacing:4, color:B.copper, marginBottom:8 }}>SALTGRASS</div>
          <h1 style={{ ...O, fontSize:44, letterSpacing:1, color:B.bone, margin:'0 0 14px', textTransform:'uppercase', lineHeight:1 }}>THE WALL</h1>
          <p style={{ fontSize:15, color:B.parchment, margin:'0 0 6px', lineHeight:1.7, maxWidth:520 }}>
            Trophies, big catches, and personal bests from Florida hunters and anglers.
          </p>
          <p style={{ fontSize:13, color:B.dust, margin:'0 0 28px', lineHeight:1.6 }}>
            No lifestyle photos. No food pics. Just kills and catches from guys who were actually out there.
          </p>
          <button onClick={openPost} style={{ background:B.copper, color:'#0A0C08', padding:'12px 26px', borderRadius:4, ...O, fontSize:13, letterSpacing:2, border:'none', cursor:'pointer' }}>
            + POST YOUR TROPHY
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} style={{ padding:'7px 14px', borderRadius:4, ...O, fontSize:10, letterSpacing:2, cursor:'pointer', border:`2px solid ${category===c.id ? B.copper : B.canopy}`, background:category===c.id ? 'rgba(200,146,42,0.12)' : 'transparent', color:category===c.id ? B.copper : B.parchment }}>
            {c.icon} {c.label}
          </button>
        ))}
        <div style={{ width:1, background:B.canopy, margin:'0 4px' }} />
        <select value={region} onChange={e => setRegion(e.target.value)} style={{ background:'#1A1208', border:`1.5px solid ${B.canopy}`, borderRadius:4, color:B.parchment, fontSize:11, padding:'7px 12px', outline:'none', cursor:'pointer', ...O, letterSpacing:1 }}>
          <option value="all">ALL REGIONS</option>
          {REGIONS.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ background:B.forest, borderRadius:8, padding:48, textAlign:'center', color:B.dust, ...O, letterSpacing:2 }}>LOADING THE WALL...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background:B.forest, borderRadius:8, padding:48, textAlign:'center', border:'1px solid #243824' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🏆</div>
          <div style={{ ...O, fontSize:18, letterSpacing:2, color:B.bone, marginBottom:8 }}>NOTHING HERE YET</div>
          <div style={{ color:B.dust, fontSize:13, marginBottom:20 }}>Be the first to post a trophy in this category.</div>
          <button onClick={openPost} style={{ background:B.copper, color:'#0A0C08', padding:'11px 22px', borderRadius:4, ...O, fontSize:12, letterSpacing:2, border:'none', cursor:'pointer' }}>
            POST YOUR TROPHY
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {filtered.map(post => {
            const rm = regionMeta(post.region)
            return (
              <div key={post.id} style={{ background:B.forest, borderRadius:8, overflow:'hidden', border:'1px solid #243824' }}>
                <div style={{ height:200, position:'relative', background:B.midnight }}>
                  <img src={post.photo_url} alt={post.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <div style={{ position:'absolute', top:10, left:10 }}>
                    <span style={{ background:'rgba(0,0,0,0.6)', color:B.copper, borderRadius:4, padding:'2px 8px', fontSize:9, ...O, letterSpacing:1 }}>
                      {rm.icon} {rm.label.toUpperCase()}
                    </span>
                  </div>
                  {post.weight && (
                    <div style={{ position:'absolute', top:10, right:10 }}>
                      <span style={{ background:'rgba(0,0,0,0.6)', color:B.bone, borderRadius:4, padding:'2px 8px', fontSize:10, fontWeight:700 }}>{post.weight}</span>
                    </div>
                  )}
                </div>
                <div style={{ padding:'12px 14px' }}>
                  <div style={{ ...O, fontSize:13, letterSpacing:1, color:B.bone, marginBottom:4 }}>{post.title}</div>
                  <div style={{ fontSize:11, color:B.dust, marginBottom:8 }}>
                    {[post.species, post.method].filter(Boolean).join(' · ')}{post.username ? ` · @${post.username}` : ''}
                  </div>
                  <div style={{ display:'flex', gap:12 }}>
                    <button onClick={() => toggleLike(post.id)} style={{ background:'none', border:'none', cursor:'pointer', color:liked[post.id] ? '#E86A4A' : B.dust, ...O, fontSize:10, letterSpacing:1 }}>
                      {liked[post.id] ? '❤️' : '🤍'} {post.likes + (liked[post.id] ? 1 : 0)}
                    </button>
                    <button style={{ background:'none', border:'none', cursor:'pointer', color:B.dust, ...O, fontSize:10, letterSpacing:1 }}>
                      💬 {post.comment_count ?? 0}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showPost && <PostTrophyModal onClose={() => setShowPost(false)} onPosted={load} />}
    </div>
  )
}
