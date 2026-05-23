'use client'
// src/app/market/page.tsx — The Market: Gear Marketplace

import { useState } from 'react'
import Link from 'next/link'
import { REGIONS } from '@/lib/types'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }

const CATEGORIES = [
  { id: 'all',         label: 'ALL GEAR',      icon: '🏕️' },
  { id: 'rods_reels',  label: 'RODS & REELS',  icon: '🎣' },
  { id: 'firearms',    label: 'FIREARMS',       icon: '🔫' },
  { id: 'archery',     label: 'ARCHERY',        icon: '🏹' },
  { id: 'boats',       label: 'BOATS',          icon: '⛵' },
  { id: 'optics',      label: 'OPTICS',         icon: '🔭' },
  { id: 'clothing',    label: 'CLOTHING',       icon: '🥾' },
  { id: 'electronics', label: 'ELECTRONICS',    icon: '📡' },
  { id: 'other',       label: 'OTHER',          icon: '📦' },
]

const MOCK_LISTINGS = [
  { id: 1, title: 'Shimano Stradic 3000 FL — Like New', price: 185, category: 'rods_reels', condition: 'Like New', region: 'panhandle', region_icon: '🏖️', region_label: 'Panhandle', user: 'RiverRoller88', shipping: 'both', is_firearm: false, icon: '🎣', bg: '#1A2A3A', days_listed: 2 },
  { id: 2, title: 'Ruger 10/22 Takedown — Excellent', price: 420, category: 'firearms', condition: 'Excellent', region: 'northfl', region_icon: '🌲', region_label: 'North Florida', user: 'SwampBuck', shipping: 'local_only', is_firearm: true, icon: '🔫', bg: '#2A1A1A', days_listed: 1 },
  { id: 3, title: '17ft Tracker Pro 170 + 60hp Merc', price: 8500, category: 'boats', condition: 'Good', region: 'swfl', region_icon: '🐚', region_label: 'SW Florida', user: 'GulfCoastGary', shipping: 'local_only', is_firearm: false, icon: '⛵', bg: '#0A1A2A', days_listed: 5 },
  { id: 4, title: 'Leupold VX-3HD 4-12x40 — New', price: 550, category: 'optics', condition: 'New', region: 'centralfl', region_icon: '🐊', region_label: 'Central Florida', user: 'CentralFLHunter', shipping: 'both', is_firearm: false, icon: '🔭', bg: '#1A1A2A', days_listed: 3 },
  { id: 5, title: 'Simms G3 Guide Waders Size Large', price: 280, category: 'clothing', condition: 'Good', region: 'keys', region_icon: '🦐', region_label: 'The Keys', user: 'FlatsDrifter', shipping: 'shipping_only', is_firearm: false, icon: '🥾', bg: '#0A2A2A', days_listed: 7 },
  { id: 6, title: 'Hoyt Carbon RX-7 Bow + Accessories', price: 1800, category: 'archery', condition: 'Like New', region: 'northfl', region_icon: '🌲', region_label: 'North Florida', user: 'ArcherMike', shipping: 'local_only', is_firearm: false, icon: '🏹', bg: '#1A2A1A', days_listed: 1 },
]

const CONDITION_COLOR: Record<string, string> = {
  'New': '#7AE07A', 'Like New': '#7AE07A', 'Excellent': '#C8922A',
  'Good': '#C8922A', 'Fair': '#B8AE98', 'For Parts': '#6B6358',
}

export default function MarketPage() {
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('all')
  const [sort, setSort] = useState('newest')

  const filtered = MOCK_LISTINGS
    .filter(l => category === 'all' || l.category === category)
    .filter(l => region === 'all' || l.region === region)

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg, #0F1A0F, #141F14)', border: '1px solid #243824', borderRadius: 8, padding: '44px 40px 40px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,146,42,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 620 }}>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 4, color: B.copper, marginBottom: 8 }}>SALTGRASS</div>
          <h1 style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 44, letterSpacing: 1, color: B.bone, margin: '0 0 14px', textTransform: 'uppercase', lineHeight: 1 }}>THE MARKET</h1>
          <p style={{ fontSize: 15, color: B.parchment, margin: '0 0 6px', lineHeight: 1.7, maxWidth: 540 }}>
            Buy and sell gear with verified Florida outdoorsmen. Real names, real accounts, real history on the platform.
          </p>
          <p style={{ fontSize: 13, color: B.dust, margin: '0 0 28px', lineHeight: 1.6 }}>
            No scammers. No lowballers from Ohio. 8% only when it sells — free to list.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/market/sell" style={{ background: B.copper, color: '#0A0C08', padding: '12px 26px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, letterSpacing: 2, textDecoration: 'none' }}>+ LIST GEAR</Link>
            <Link href="/market/dashboard" style={{ background: 'transparent', color: B.parchment, padding: '12px 22px', borderRadius: 4, border: `2px solid ${B.canopy}`, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 12, letterSpacing: 2, textDecoration: 'none' }}>MY LISTINGS</Link>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 10 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 4, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 2, cursor: 'pointer', border: `2px solid ${category === c.id ? B.copper : B.canopy}`, background: category === c.id ? 'rgba(200,146,42,0.12)' : 'transparent', color: category === c.id ? B.copper : B.parchment }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 10, alignItems: 'start' }}>
        {/* Listings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.dust }}>{filtered.length} LISTINGS</div>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: '#1A1208', border: `1.5px solid ${B.canopy}`, borderRadius: 4, color: B.parchment, fontSize: 11, padding: '6px 10px', outline: 'none', cursor: 'pointer', fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: 1 }}>
              <option value="newest">NEWEST FIRST</option>
              <option value="price_low">PRICE: LOW TO HIGH</option>
              <option value="price_high">PRICE: HIGH TO LOW</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(l => (
              <div key={l.id} style={{ background: B.forest, borderRadius: 8, overflow: 'hidden', border: '1px solid #243824', display: 'flex' }}>
                {/* Photo */}
                <div style={{ width: 140, background: l.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, flexShrink: 0 }}>
                  {l.icon}
                </div>
                <div style={{ padding: '14px 16px', flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 14, color: B.bone, lineHeight: 1.3, flex: 1, marginRight: 12 }}>{l.title}</div>
                    <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 22, color: B.copper, flexShrink: 0 }}>${l.price.toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 1, color: CONDITION_COLOR[l.condition] ?? B.dust }}>{l.condition.toUpperCase()}</span>
                    <span style={{ fontSize: 10, color: B.dust }}>·</span>
                    <span style={{ fontSize: 10, color: B.dust }}>{l.region_icon} {l.region_label}</span>
                    <span style={{ fontSize: 10, color: B.dust }}>·</span>
                    <span style={{ fontSize: 10, color: B.dust }}>@{l.user}</span>
                    <span style={{ fontSize: 10, color: B.dust }}>·</span>
                    <span style={{ fontSize: 10, color: B.dust }}>{l.days_listed}d ago</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ background: B.moss, color: B.parchment, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: 1 }}>
                      {l.shipping === 'local_only' ? '📍 LOCAL ONLY' : l.shipping === 'both' ? '📍 LOCAL + 📦 SHIPS' : '📦 SHIPS'}
                    </span>
                    {l.is_firearm && <span style={{ background: 'rgba(200,69,42,0.15)', color: '#E07A7A', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: 1 }}>🔫 FFL REQUIRED</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: 72, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: B.forest, borderRadius: 8, padding: 16, border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.copper, marginBottom: 10 }}>FILTER BY REGION</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={() => setRegion('all')} style={{ padding: '8px 10px', borderRadius: 4, border: `1.5px solid ${region === 'all' ? B.copper : B.canopy}`, background: region === 'all' ? 'rgba(200,146,42,0.1)' : 'transparent', color: region === 'all' ? B.copper : B.parchment, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1, cursor: 'pointer', textAlign: 'left' }}>
                🌴 ALL FLORIDA
              </button>
              {REGIONS.map(r => (
                <button key={r.id} onClick={() => setRegion(r.id)} style={{ padding: '8px 10px', borderRadius: 4, border: `1.5px solid ${region === r.id ? B.copper : B.canopy}`, background: region === r.id ? 'rgba(200,146,42,0.1)' : 'transparent', color: region === r.id ? B.copper : B.parchment, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1, cursor: 'pointer', textAlign: 'left' }}>
                  {r.icon} {r.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: B.forest, borderRadius: 8, padding: 16, border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 3, color: B.copper, marginBottom: 10 }}>HOW IT WORKS</div>
            {['List for free — 8% only when it sells', 'Local pickup or shipping — your choice', 'Buyer protection on every transaction', 'Firearms: local only + FFL transfer', 'All buyers are verified members'].map((r, i) => (
              <div key={i} style={{ fontSize: 11, color: B.parchment, padding: '5px 0', borderBottom: i < 4 ? `1px solid ${B.canopy}` : 'none', display: 'flex', gap: 8 }}>
                <span style={{ color: B.copper, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, flexShrink: 0 }}>0{i+1}</span>
                <span>{r}</span>
              </div>
            ))}
          </div>

          <Link href="/market/sell" style={{ display: 'block', textAlign: 'center', background: 'transparent', color: B.copper, padding: '12px', borderRadius: 4, border: `2px solid ${B.copper}`, fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, letterSpacing: 2, textDecoration: 'none' }}>
            + LIST YOUR GEAR
          </Link>
        </div>
      </div>
    </div>
  )
}
