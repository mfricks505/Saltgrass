'use client'
// src/app/market/page.tsx — The Market (real listings, search, no firearms)

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'
import LocationRadiusFilter from '@/components/LocationRadiusFilter'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

const CATEGORIES = [
  { id:'all', label:'ALL GEAR', icon:'🏕️' },
  { id:'rods_reels', label:'RODS & REELS', icon:'🎣' },
  { id:'boats', label:'BOATS', icon:'⛵' },
  { id:'optics', label:'OPTICS', icon:'🔭' },
  { id:'archery', label:'ARCHERY', icon:'🏹' },
  { id:'electronics', label:'ELECTRONICS', icon:'📡' },
  { id:'clothing', label:'CLOTHING', icon:'🥾' },
  { id:'other', label:'OTHER', icon:'📦' },
]
const COND: Record<string,string> = { 'New':'#7AE07A','Like New':'#7AE07A','Excellent':'#C8922A','Good':'#C8922A','Fair':'#B8AE98','For Parts':'#6B6358' }

export default function MarketPage() {
  const supabase = createClient()
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('all')
  const [sort, setSort] = useState('newest')
  const [search, setSearch] = useState('')
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [radiusListings, setRadiusListings] = useState<any[] | null>(null)  // null = radius filter off

  useEffect(()=>{ load() },[category, region, sort])
  async function load() {
    setLoading(true)
    let q = supabase.from('listings').select('*').eq('status','active')
    if (category!=='all') q = q.eq('category',category)
    if (region!=='all') q = q.eq('region',region)
    if (sort==='price_low') q = q.order('price',{ascending:true})
    else if (sort==='price_high') q = q.order('price',{ascending:false})
    else q = q.order('is_featured',{ascending:false}).order('created_at',{ascending:false})
    const { data } = await q.limit(80)
    setListings(data ?? [])
    setLoading(false)
  }

  const source = radiusListings !== null ? radiusListings : listings
  const filtered = source.filter(l =>
    !search.trim() || l.title.toLowerCase().includes(search.toLowerCase()) ||
    (l.description?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#0F1A0F,#141F14)', border:'1px solid #243824', borderRadius:8, padding:'40px 36px', marginBottom:10, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-60, top:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,146,42,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:620 }}>
          <div style={{ ...O, fontSize:11, letterSpacing:4, color:B.copper, marginBottom:8 }}>SALTGRASS</div>
          <h1 style={{ ...O, fontSize:44, letterSpacing:1, color:B.bone, margin:'0 0 14px', textTransform:'uppercase', lineHeight:1 }}>THE MARKET</h1>
          <p style={{ fontSize:15, color:B.parchment, margin:'0 0 6px', lineHeight:1.7, maxWidth:540 }}>
            Buy and sell gear with verified Florida outdoorsmen. Real names, real accounts, real history.
          </p>
          <p style={{ fontSize:13, color:B.dust, margin:'0 0 24px', lineHeight:1.6 }}>
            No scammers. No lowballers from Ohio. $4.99 to list — and what it sells for is yours.
          </p>
          <div style={{ display:'flex', gap:10 }}>
            <Link href="/market/sell" style={{ background:B.copper, color:'#0A0C08', padding:'12px 26px', borderRadius:4, ...O, fontSize:13, letterSpacing:2, textDecoration:'none' }}>+ LIST GEAR</Link>
            <Link href="/market/dashboard" style={{ background:'transparent', color:B.parchment, padding:'12px 22px', borderRadius:4, border:`2px solid ${B.canopy}`, ...O, fontSize:12, letterSpacing:2, textDecoration:'none' }}>MY LISTINGS</Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search gear — Stradic, kayak, waders..." style={{ width:'100%', background:B.forest, border:'1px solid #243824', borderRadius:8, color:B.bone, padding:'12px 16px', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:10, fontFamily:'Inter,sans-serif' }} />

      {/* Near Me radius filter */}
      <LocationRadiusFilter category={category} onResults={setRadiusListings} onClear={()=>setRadiusListings(null)} />

      {/* Category filter */}
      <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:10 }}>
        {CATEGORIES.map(c=>(
          <button key={c.id} onClick={()=>setCategory(c.id)} style={{ flexShrink:0, padding:'7px 14px', borderRadius:4, ...O, fontSize:10, letterSpacing:2, cursor:'pointer', border:`2px solid ${category===c.id?B.copper:B.canopy}`, background:category===c.id?'rgba(200,146,42,0.12)':'transparent', color:category===c.id?B.copper:B.parchment }}>{c.icon} {c.label}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 220px', gap:10, alignItems:'start' }}>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div style={{ ...O, fontSize:10, letterSpacing:3, color:B.dust }}>{filtered.length} LISTING{filtered.length!==1?'S':''}</div>
            <select value={sort} onChange={e=>setSort(e.target.value)} style={{ background:'#1A1208', border:`1.5px solid ${B.canopy}`, borderRadius:4, color:B.parchment, fontSize:11, padding:'6px 10px', outline:'none', cursor:'pointer', ...O, letterSpacing:1 }}>
              <option value="newest">NEWEST</option>
              <option value="price_low">PRICE: LOW→HIGH</option>
              <option value="price_high">PRICE: HIGH→LOW</option>
            </select>
          </div>

          {loading ? (
            <div style={{ ...O, color:B.dust, letterSpacing:2, padding:40, textAlign:'center' }}>LOADING...</div>
          ) : filtered.length===0 ? (
            <div style={{ background:B.forest, borderRadius:8, padding:48, textAlign:'center', border:'1px solid #243824' }}>
              <div style={{ fontSize:44, marginBottom:12 }}>🏕️</div>
              <div style={{ ...O, fontSize:16, letterSpacing:2, color:B.bone, marginBottom:8 }}>NO LISTINGS YET</div>
              <div style={{ color:B.dust, fontSize:13, marginBottom:20 }}>Be the first to list gear in this category.</div>
              <Link href="/market/sell" style={{ background:B.copper, color:'#0A0C08', padding:'11px 22px', borderRadius:4, ...O, fontSize:12, letterSpacing:2, textDecoration:'none' }}>LIST YOUR GEAR</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filtered.map(l=>(
                <Link key={l.id} href={`/market/${l.id}`} style={{ textDecoration:'none' }}>
                  <div style={{ background:B.forest, borderRadius:8, overflow:'hidden', border:`1px solid ${l.is_featured?'rgba(200,146,42,0.4)':'#243824'}`, display:'flex' }}>
                    <div style={{ width:140, background:B.midnight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative' }}>
                      {l.photos?.[0] ? <img src={l.photos[0]} alt={l.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:40 }}>📦</span>}
                      {l.is_featured && <span style={{ position:'absolute', top:6, left:6, background:B.copper, color:B.midnight, borderRadius:3, padding:'1px 6px', fontSize:8, ...O, letterSpacing:1 }}>⭐ FEATURED</span>}
                    </div>
                    <div style={{ padding:'14px 16px', flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                        <div style={{ ...O, fontSize:14, color:B.bone, lineHeight:1.3, flex:1, marginRight:12 }}>{l.title}</div>
                        <div style={{ ...O, fontSize:22, color:B.copper, flexShrink:0 }}>${l.price.toLocaleString()}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', fontSize:10, color:B.dust }}>
                        <span style={{ ...O, color:COND[l.condition]??B.dust }}>{l.condition.toUpperCase()}</span>
                        <span>·</span><span>@{l.seller_username}</span>
                        {l.city && (<><span>·</span><span>{l.city}</span></>)}
                        <span>·</span>
                        <span style={{ color:B.parchment }}>{l.shipping==='local_only'?'📍 LOCAL':l.shipping==='both'?'📍+📦':'📦 SHIPS'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position:'sticky', top:72, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ background:B.forest, borderRadius:8, padding:16, border:'1px solid #243824' }}>
            <div style={{ ...O, fontSize:10, letterSpacing:3, color:B.copper, marginBottom:10 }}>FILTER BY REGION</div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              <button onClick={()=>setRegion('all')} style={{ padding:'8px 10px', borderRadius:4, border:`1.5px solid ${region==='all'?B.copper:B.canopy}`, background:region==='all'?'rgba(200,146,42,0.1)':'transparent', color:region==='all'?B.copper:B.parchment, ...O, fontSize:10, letterSpacing:1, cursor:'pointer', textAlign:'left' }}>🌴 ALL FLORIDA</button>
              {REGIONS.map(r=>(
                <button key={r.id} onClick={()=>setRegion(r.id)} style={{ padding:'8px 10px', borderRadius:4, border:`1.5px solid ${region===r.id?B.copper:B.canopy}`, background:region===r.id?'rgba(200,146,42,0.1)':'transparent', color:region===r.id?B.copper:B.parchment, ...O, fontSize:10, letterSpacing:1, cursor:'pointer', textAlign:'left' }}>{r.icon} {r.label.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div style={{ background:B.forest, borderRadius:8, padding:16, border:'1px solid #243824' }}>
            <div style={{ ...O, fontSize:10, letterSpacing:3, color:B.copper, marginBottom:10 }}>HOW IT WORKS</div>
            {['$4.99 to list — no sale commission','Local pickup or shipping — your choice','Message sellers in-app, safely','Optional secure pay + buyer protection','Every member is verified'].map((r,i)=>(
              <div key={i} style={{ fontSize:11, color:B.parchment, padding:'5px 0', borderBottom:i<4?`1px solid ${B.canopy}`:'none', display:'flex', gap:8 }}>
                <span style={{ color:B.copper, ...O, fontSize:10, flexShrink:0 }}>0{i+1}</span><span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
