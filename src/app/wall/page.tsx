'use client'
// src/app/wall/page.tsx — The Wall: Trophy & Catch Gallery

import { useState } from 'react'
import Link from 'next/link'
import { REGIONS } from '@/lib/types'

const B = {
  midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C',
  canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8',
  parchment:'#B8AE98', dust:'#6B6358',
}

const CATEGORIES = [
  { id: 'all',        label: 'ALL',           icon: '🏆' },
  { id: 'fish',       label: 'FISH',          icon: '🎣' },
  { id: 'deer',       label: 'DEER',          icon: '🦌' },
  { id: 'hog',        label: 'HOG',           icon: '🐗' },
  { id: 'turkey',     label: 'TURKEY',        icon: '🦃' },
  { id: 'waterfowl',  label: 'WATERFOWL',     icon: '🦆' },
  { id: 'other',      label: 'OTHER',         icon: '🏕️' },
]

// Placeholder trophy posts — will pull from DB once Wall schema is set up
const MOCK_POSTS = [
  { id: 1, user: 'FlatsDrifter', avatar: '🎣', region: 'keys', region_icon: '🦐', region_label: 'The Keys', category: 'fish', title: '47lb Amberjack — Islamorada', weight: '47 lbs', species: 'Amberjack', method: 'Jigging', likes: 312, comments: 44, bg: '#1A2A3A' },
  { id: 2, user: 'SwampBuckHunter', avatar: '🦌', region: 'northfl', region_icon: '🌲', region_label: 'North Florida', category: 'deer', title: '12-Point Buck — Osceola', weight: '210 lbs', species: 'Whitetail', method: 'Rifle', likes: 521, comments: 78, bg: '#1A2A1A' },
  { id: 3, user: 'PanhandlePhil', avatar: '🏖️', region: 'panhandle', region_icon: '🏖️', region_label: 'Panhandle', category: 'fish', title: '28lb Redfish on the Flats', weight: '28 lbs', species: 'Redfish', method: 'Fly Rod', likes: 289, comments: 33, bg: '#1A2A3A' },
  { id: 4, user: 'EvergladesEddie', avatar: '🐊', region: 'swfl', region_icon: '🐚', region_label: 'SW Florida', category: 'hog', title: '320lb Boar — Private Ranch', weight: '320 lbs', species: 'Wild Hog', method: 'Rifle', likes: 198, comments: 55, bg: '#2A1A1A' },
  { id: 5, user: 'KeysKing', avatar: '🦐', region: 'keys', region_icon: '🦐', region_label: 'The Keys', category: 'fish', title: 'Permit on Fly — Lower Keys', weight: '22 lbs', species: 'Permit', method: 'Fly Rod', likes: 445, comments: 91, bg: '#1A2A3A' },
  { id: 6, user: 'NorthFLNate', avatar: '🌲', region: 'northfl', region_icon: '🌲', region_label: 'North Florida', category: 'turkey', title: 'Opening Day Osceola', weight: '19 lbs', species: 'Osceola Turkey', method: 'Shotgun', likes: 167, comments: 28, bg: '#1A2A1A' },
]

export default function WallPage() {
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('all')
  const [liked, setLiked] = useState<Record<number, boolean>>({})

  const filtered = MOCK_POSTS
    .filter(p => category === 'all' || p.category === category)
    .filter(p => region === 'all' || p.region === region)

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0F1A0F, #141F14)', border: '1px solid #243824', borderRadius: 8, padding: '44px 40px 40px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,146,42,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 600 }}>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 4, color: B.copper, marginBottom: 8 }}>SALTGRASS</div>
          <h1 style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 44, letterSpacing: 1, color: B.bone, margin: '0 0 14px', textTransform: 'uppercase', lineHeight: 1 }}>THE WALL</h1>
          <p style={{ fontSize: 15, color: B.parchment, margin: '0 0 6px', lineHeight: 1.7, maxWidth: 520 }}>
            Trophies, big catches, and personal bests from Florida hunters and anglers.
          </p>
          <p style={{ fontSize: 13, color: B.dust, margin: '0 0 28px', lineHeight: 1.6 }}>
            No lifestyle photos. No food pics. Just kills and catches from guys who were actually out there.
          </p>
          <Link href="/auth/signup" style={{ background: B.copper, color: '#0A0C08', padding: '12px 26px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, letterSpacing: 2, textDecoration: 'none' }}>
            + POST YOUR TROPHY
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} style={{ padding: '7px 14px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 2, cursor: 'pointer', border: `2px solid ${category === c.id ? B.copper : B.canopy}`, background: category === c.id ? 'rgba(200,146,42,0.12)' : 'transparent', color: category === c.id ? B.copper : B.parchment }}>
            {c.icon} {c.label}
          </button>
        ))}
        <div style={{ width: 1, background: B.canopy, margin: '0 4px' }} />
        <select value={region} onChange={e => setRegion(e.target.value)} style={{ background: '#1A1208', border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.parchment, fontSize: 11, padding: '7px 12px', outline: 'none', cursor: 'pointer', fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: 1 }}>
          <option value="all">ALL REGIONS</option>
          {REGIONS.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {filtered.map(post => (
          <div key={post.id} style={{ background: B.forest, borderRadius: 8, overflow: 'hidden', border: '1px solid #243824' }}>
            {/* Photo placeholder */}
            <div style={{ height: 200, background: post.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, position: 'relative' }}>
              {post.avatar}
              <div style={{ position: 'absolute', top: 10, left: 10 }}>
                <span style={{ background: 'rgba(0,0,0,0.6)', color: B.copper, borderRadius: 4, padding: '2px 8px', fontSize: 9, fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: 1 }}>
                  {post.region_icon} {post.region_label.toUpperCase()}
                </span>
              </div>
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <span style={{ background: 'rgba(0,0,0,0.6)', color: B.bone, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                  {post.weight}
                </span>
              </div>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, letterSpacing: 1, color: B.bone, marginBottom: 4 }}>{post.title}</div>
              <div style={{ fontSize: 11, color: B.dust, marginBottom: 8 }}>
                {post.species} · {post.method} · @{post.user}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setLiked(l => ({ ...l, [post.id]: !l[post.id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: liked[post.id] ? '#E86A4A' : B.dust, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1 }}>
                  {liked[post.id] ? '❤️' : '🤍'} {post.likes + (liked[post.id] ? 1 : 0)}
                </button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: B.dust, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1 }}>
                  💬 {post.comments}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background: B.forest, borderRadius: 8, padding: 48, textAlign: 'center', border: '1px solid #243824' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 18, letterSpacing: 2, color: B.bone, marginBottom: 8 }}>NOTHING HERE YET</div>
          <div style={{ color: B.dust, fontSize: 13, marginBottom: 20 }}>Be the first to post a trophy in this category.</div>
          <Link href="/auth/signup" style={{ background: B.copper, color: '#0A0C08', padding: '11px 22px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 2, textDecoration: 'none' }}>
            POST YOUR TROPHY
          </Link>
        </div>
      )}
    </div>
  )
}
