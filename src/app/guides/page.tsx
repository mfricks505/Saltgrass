'use client'
// src/app/guides/page.tsx — Verified Guides (wired to the real `guides` table)

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

const CATEGORIES = [
  { id:'all', label:'ALL', icon:'🔭' },
  { id:'fishing_guide', label:'FISHING GUIDES', icon:'🎣' },
  { id:'hunting_guide', label:'HUNTING GUIDES', icon:'🏹' },
  { id:'outfitter', label:'OUTFITTERS', icon:'🎒' },
  { id:'taxidermist', label:'TAXIDERMISTS', icon:'🦌' },
  { id:'boat_repair', label:'BOAT REPAIR', icon:'⚙️' },
  { id:'fly_shop', label:'FLY SHOPS', icon:'🪰' },
]
const CAT_ICON: Record<string,string> = { fishing_guide:'🎣', hunting_guide:'🏹', outfitter:'🎒', taxidermist:'🦌', boat_repair:'⚙️', fly_shop:'🪰' }

// Tier badge derived from the guide's plan + founding status
function tierBadge(g:any): { label:string; color:string } | null {
  if (g.plan === 'elite' || g.is_founding_guide) return { label:'⭐ PRO PARTNER', color:'#D4A832' }
  if (g.plan === 'pro') return { label:'✦ FEATURED', color:'#38A89D' }
  if (g.is_verified) return { label:'✓ VERIFIED', color:'#5C8A4A' }
  return null
}

function Stars({ rating, count }:{ rating:number; count:number }) {
  const r = Math.floor(rating || 0)
  return <span><span style={{ color:B.copper }}>{'★'.repeat(r)}{'☆'.repeat(5-r)}</span><span style={{ color:B.dust, fontSize:11, marginLeft:5 }}>{rating?rating.toFixed(1):'New'} {count?`(${count} reviews)`:''}</span></span>
}

export default function GuidesPage() {
  const supabase = createClient()
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('all')
  const [guides, setGuides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ load() },[category, region])
  async function load() {
    setLoading(true)
    let q = supabase.from('guides').select('*').eq('is_active', true)
    if (category!=='all') q = q.eq('category', category)
    if (region!=='all') q = q.eq('region', region)
    // Pro/elite/founding surface first, then by rating
    const { data } = await q.order('plan',{ascending:false}).order('rating',{ascending:false})
    setGuides(data ?? [])
    setLoading(false)
  }

  const regionMeta = (id:string)=>REGIONS.find(r=>r.id===id) ?? { icon:'📍', label:id }

  return (
    <div>
      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#0F1A0F,#141F14)', border:'1px solid #243824', borderRadius:8, padding:'44px 40px 40px', marginBottom:10, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-60, top:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,146,42,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:620 }}>
          <div style={{ ...O, fontSize:11, letterSpacing:4, color:B.copper, marginBottom:8 }}>SALTGRASS</div>
          <h1 style={{ ...O, fontSize:44, letterSpacing:1, color:B.bone, margin:'0 0 14px', textTransform:'uppercase', lineHeight:1 }}>GUIDES</h1>
          <p style={{ fontSize:15, color:B.parchment, margin:'0 0 6px', lineHeight:1.7, maxWidth:540 }}>
            Verified fishing guides, hunting outfitters, and outdoor services across Florida.
          </p>
          <p style={{ fontSize:13, color:B.dust, margin:'0 0 24px', lineHeight:1.6 }}>
            Every guide is verified. Reviews come from members who actually booked them.
          </p>
          <Link href="/guides/join" style={{ background:B.copper, color:'#0A0C08', padding:'12px 26px', borderRadius:4, ...O, fontSize:13, letterSpacing:2, textDecoration:'none' }}>LIST YOUR BUSINESS</Link>
        </div>
      </div>

      {/* Category filter */}
      <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:10 }}>
        {CATEGORIES.map(c=>(
          <button key={c.id} onClick={()=>setCategory(c.id)} style={{ flexShrink:0, padding:'7px 14px', borderRadius:4, ...O, fontSize:10, letterSpacing:2, cursor:'pointer', border:`2px solid ${category===c.id?B.copper:B.canopy}`, background:category===c.id?'rgba(200,146,42,0.12)':'transparent', color:category===c.id?B.copper:B.parchment }}>{c.icon} {c.label}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 220px', gap:10, alignItems:'start' }}>
        <div>
          {loading ? <div style={{ ...O, color:B.dust, letterSpacing:2, padding:40, textAlign:'center' }}>LOADING GUIDES...</div> :
           guides.length===0 ? (
            <div style={{ background:B.forest, borderRadius:8, padding:48, textAlign:'center', border:'1px solid #243824' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔭</div>
              <div style={{ ...O, fontSize:18, letterSpacing:2, color:B.bone, marginBottom:8 }}>NO GUIDES LISTED YET</div>
              <div style={{ color:B.dust, fontSize:13, marginBottom:20 }}>Be the first to list your guide service in this area.</div>
              <Link href="/guides/join" style={{ background:B.copper, color:'#0A0C08', padding:'11px 22px', borderRadius:4, ...O, fontSize:12, letterSpacing:2, textDecoration:'none' }}>LIST YOUR BUSINESS</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {guides.map(g=>{
                const tier = tierBadge(g)
                const rm = regionMeta(g.region)
                return (
                  <div key={g.id} style={{ background:B.forest, border:'1px solid #243824', borderRadius:8, padding:'18px 20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                          <span style={{ fontSize:24 }}>{g.avatar_url ? '🏞️' : (CAT_ICON[g.category]??'🔭')}</span>
                          <div>
                            <div style={{ ...O, fontSize:16, color:B.bone }}>{g.business_name || g.name}</div>
                            <div style={{ fontSize:11, color:B.dust }}>{rm.icon} {rm.label}{g.city?` · ${g.city}, FL`:''}</div>
                          </div>
                        </div>
                        <div style={{ marginBottom:8 }}><Stars rating={g.rating} count={g.review_count} /></div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        {tier && <div style={{ background:`${tier.color}22`, color:tier.color, border:`1px solid ${tier.color}55`, borderRadius:4, padding:'3px 10px', fontSize:9, ...O, letterSpacing:1, marginBottom:6 }}>{tier.label}</div>}
                        {g.price_from && <div style={{ ...O, fontSize:18, color:B.copper }}>From ${g.price_from}</div>}
                      </div>
                    </div>
                    {g.bio && <div style={{ fontSize:13, color:B.parchment, lineHeight:1.7, marginBottom:10 }}>{g.bio}</div>}
                    {g.tags?.length > 0 && (
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                        {g.tags.map((t:string)=><span key={t} style={{ background:B.moss, color:B.parchment, borderRadius:4, padding:'2px 8px', fontSize:10 }}>#{t}</span>)}
                      </div>
                    )}
                    <div style={{ display:'flex', gap:8 }}>
                      <Link href={`/guides/${g.id}`} style={{ flex:2, background:B.copper, color:'#0A0C08', border:'none', borderRadius:4, padding:'10px', ...O, fontSize:11, letterSpacing:1, cursor:'pointer', textAlign:'center', textDecoration:'none' }}>VIEW PROFILE & BOOK</Link>
                      <Link href={`/guides/${g.id}#reviews`} style={{ flex:1, background:'transparent', color:B.parchment, border:`1.5px solid ${B.canopy}`, borderRadius:4, padding:'10px', ...O, fontSize:10, letterSpacing:1, cursor:'pointer', textAlign:'center', textDecoration:'none' }}>REVIEWS</Link>
                    </div>
                  </div>
                )
              })}
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
            <div style={{ ...O, fontSize:10, letterSpacing:3, color:B.copper, marginBottom:10 }}>ARE YOU A GUIDE?</div>
            <p style={{ fontSize:12, color:B.parchment, lineHeight:1.7, margin:'0 0 12px' }}>Get verified and reach thousands of Florida outdoorsmen looking for exactly what you offer.</p>
            <Link href="/guides/join" style={{ display:'block', textAlign:'center', background:'transparent', color:B.copper, padding:'10px', borderRadius:4, border:`2px solid ${B.copper}`, ...O, fontSize:11, letterSpacing:2, textDecoration:'none' }}>LIST YOUR BUSINESS</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
