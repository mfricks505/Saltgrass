'use client'
// src/app/market/[id]/page.tsx
// Listing detail — photo gallery, seller info + rating, watch button, message seller.

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'

const B = { midnight:'#0A0C08', forest:'#141F14', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }
const COND: Record<string,string> = { 'New':'#7AE07A','Like New':'#7AE07A','Excellent':'#C8922A','Good':'#C8922A','Fair':'#B8AE98','For Parts':'#6B6358' }

export default function ListingDetail() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [listing, setListing] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [watching, setWatching] = useState(false)
  const [me, setMe] = useState<any>(null)

  useEffect(()=>{ load() },[id])
  async function load() {
    setLoading(true)
    const { data:{ user } } = await supabase.auth.getUser()
    setMe(user)
    const { data } = await supabase.from('listings').select('*').eq('id', id).single()
    setListing(data)
    if (data) {
      supabase.from('listings').update({ view_count:(data.view_count??0)+1 }).eq('id',id).then(()=>{})
      const { data:stats } = await supabase.from('seller_stats').select('*').eq('seller_id',data.seller_id).single()
      const { data:ratings } = await supabase.from('seller_ratings').select('stars').eq('seller_id',data.seller_id)
      const avg = ratings?.length ? (ratings.reduce((s,r)=>s+r.stars,0)/ratings.length) : null
      setSeller({ ...stats, avg, count:ratings?.length??0 })
      if (user) {
        const { data:w } = await supabase.from('listing_watches').select('*').match({ user_id:user.id, listing_id:id }).maybeSingle()
        setWatching(!!w)
      }
    }
    setLoading(false)
  }

  async function toggleWatch() {
    if (!me) { router.push('/auth/login'); return }
    if (watching) { await supabase.from('listing_watches').delete().match({ user_id:me.id, listing_id:id }); setWatching(false) }
    else { await supabase.from('listing_watches').insert({ user_id:me.id, listing_id:id, last_seen_price:listing.price }); setWatching(true) }
  }

  async function messageSeller() {
    if (!me) { router.push('/auth/login'); return }
    // Route into the existing DM system, seeded with this listing
    router.push(`/messages?to=${listing.seller_id}&listing=${listing.id}&label=${encodeURIComponent(listing.title)}`)
  }

  if (loading) return <div style={{ ...O, color:B.dust, letterSpacing:2, padding:40, textAlign:'center' }}>LOADING...</div>
  if (!listing) return <div style={{ color:B.dust, padding:40, textAlign:'center' }}>Listing not found.</div>

  const region = REGIONS.find(r=>r.id===listing.region)
  const isMine = me?.id === listing.seller_id

  return (
    <div style={{ maxWidth:760, margin:'0 auto' }}>
      <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:B.dust, cursor:'pointer', fontSize:13, marginBottom:12 }}>← Back to Market</button>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, alignItems:'start' }}>
        {/* Photos + description */}
        <div>
          <div style={{ background:B.midnight, borderRadius:10, overflow:'hidden', marginBottom:8, aspectRatio:'4/3' }}>
            {listing.photos?.[activePhoto]
              ? <img src={listing.photos[activePhoto]} alt={listing.title} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
              : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:64 }}>📦</div>}
          </div>
          {listing.photos?.length > 1 && (
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {listing.photos.map((p:string,i:number)=>(
                <button key={i} onClick={()=>setActivePhoto(i)} style={{ width:64, height:64, borderRadius:6, overflow:'hidden', border:`2px solid ${i===activePhoto?B.copper:'transparent'}`, padding:0, cursor:'pointer', background:B.midnight }}>
                  <img src={p} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </button>
              ))}
            </div>
          )}
          {listing.description && (
            <div style={{ background:B.forest, borderRadius:8, padding:'16px 18px', border:'1px solid #243824' }}>
              <div style={{ ...O, fontSize:10, letterSpacing:2, color:B.dust, marginBottom:8 }}>DESCRIPTION</div>
              <div style={{ fontSize:14, color:B.parchment, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{listing.description}</div>
            </div>
          )}
        </div>

        {/* Sidebar: price, seller, actions */}
        <div style={{ position:'sticky', top:72, display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ background:B.forest, borderRadius:10, padding:18, border:'1px solid #243824' }}>
            <div style={{ ...O, fontSize:32, color:B.copper, lineHeight:1 }}>${listing.price.toLocaleString()}</div>
            <div style={{ ...O, fontSize:16, letterSpacing:0.5, color:B.bone, margin:'10px 0 8px', lineHeight:1.3 }}>{listing.title}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', fontSize:11, color:B.dust, marginBottom:14 }}>
              <span style={{ ...O, color:COND[listing.condition]??B.dust }}>{listing.condition.toUpperCase()}</span>
              <span>·</span><span>{region?.icon} {region?.label}</span>
              {listing.city && (<><span>·</span><span>{listing.city}</span></>)}
            </div>

            {!isMine ? (
              <>
                <button onClick={messageSeller} style={{ width:'100%', background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'13px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', marginBottom:8 }}>💬 MESSAGE SELLER</button>
                <button onClick={toggleWatch} style={{ width:'100%', background:'transparent', color:watching?B.copper:B.parchment, border:`1.5px solid ${watching?B.copper:'rgba(255,255,255,0.15)'}`, borderRadius:6, padding:'11px', ...O, fontSize:12, letterSpacing:1, cursor:'pointer' }}>
                  {watching?'★ WATCHING — NOTIFY ON PRICE DROP':'☆ WATCH THIS ITEM'}
                </button>
              </>
            ) : (
              <button onClick={()=>router.push('/market/dashboard')} style={{ width:'100%', background:'transparent', color:B.copper, border:`1.5px solid ${B.copper}`, borderRadius:6, padding:'11px', ...O, fontSize:12, letterSpacing:1, cursor:'pointer' }}>MANAGE LISTING</button>
            )}
          </div>

          {/* Seller card */}
          <div style={{ background:B.forest, borderRadius:10, padding:16, border:'1px solid #243824' }}>
            <div style={{ ...O, fontSize:10, letterSpacing:2, color:B.dust, marginBottom:8 }}>SELLER</div>
            <div style={{ ...O, fontSize:14, color:B.bone }}>@{listing.seller_username}</div>
            <div style={{ fontSize:12, color:B.parchment, marginTop:6, lineHeight:1.6 }}>
              {seller?.avg ? <div>⭐ {seller.avg.toFixed(1)} ({seller.count} rating{seller.count!==1?'s':''})</div> : <div style={{ color:B.dust }}>No ratings yet</div>}
              {seller?.completed_sales > 0 && <div>✓ {seller.completed_sales} completed sale{seller.completed_sales!==1?'s':''}</div>}
            </div>
            <div style={{ fontSize:11, color:B.dust, marginTop:10, paddingTop:10, borderTop:'1px solid #243824', lineHeight:1.5 }}>
              🛡️ Verified member. Meet in a public place for local deals.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
