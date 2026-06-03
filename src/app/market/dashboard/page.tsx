'use client'
// src/app/market/dashboard/page.tsx
// My Listings — manage your gear, mark sold, see watchers + views.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const B = { midnight:'#0A0C08', forest:'#141F14', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358', go:'#7AE07A' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

export default function MarketDashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [watching, setWatching] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'selling'|'watching'>('selling')

  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data:mine } = await supabase.from('listings').select('*').eq('seller_id',user.id).order('created_at',{ascending:false})
    // watcher counts
    const withCounts = await Promise.all((mine??[]).map(async l=>{
      const { count } = await supabase.from('listing_watches').select('*',{count:'exact',head:true}).eq('listing_id',l.id)
      return { ...l, watchers: count ?? 0 }
    }))
    setListings(withCounts)

    const { data:watches } = await supabase.from('listing_watches').select('listing_id, last_seen_price').eq('user_id',user.id)
    if (watches?.length) {
      const ids = watches.map(w=>w.listing_id)
      const { data:wl } = await supabase.from('listings').select('*').in('id',ids)
      // flag price drops
      const flagged = (wl??[]).map(l=>{
        const w = watches.find(x=>x.listing_id===l.id)
        return { ...l, priceDropped: w?.last_seen_price != null && l.price < w.last_seen_price, oldPrice: w?.last_seen_price }
      })
      setWatching(flagged)
    }
    setLoading(false)
  }

  async function markSold(id:string) {
    await supabase.from('listings').update({ status:'sold' }).eq('id',id)
    load()
  }
  async function removeListing(id:string) {
    await supabase.from('listings').update({ status:'removed' }).eq('id',id)
    load()
  }

  return (
    <div style={{ maxWidth:680, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'8px 0 16px' }}>
        <div style={{ ...O, fontSize:24, letterSpacing:1, color:B.bone }}>MY MARKET</div>
        <Link href="/market/sell" style={{ background:B.copper, color:B.midnight, padding:'10px 18px', borderRadius:6, ...O, fontSize:12, letterSpacing:1, textDecoration:'none' }}>+ LIST GEAR</Link>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {(['selling','watching'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 18px', borderRadius:6, ...O, fontSize:11, letterSpacing:2, cursor:'pointer', border:`2px solid ${tab===t?B.copper:B.canopy}`, background:tab===t?'rgba(200,146,42,0.12)':'transparent', color:tab===t?B.copper:B.parchment }}>
            {t==='selling'?`SELLING (${listings.filter(l=>l.status==='active').length})`:`WATCHING (${watching.length})`}
          </button>
        ))}
      </div>

      {loading ? <div style={{ ...O, color:B.dust, letterSpacing:2, padding:40, textAlign:'center' }}>LOADING...</div> :
       tab==='selling' ? (
        listings.length===0 ? <Empty msg="You haven't listed anything yet." cta /> :
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {listings.map(l=>(
            <div key={l.id} style={{ background:B.forest, borderRadius:8, border:'1px solid #243824', padding:'14px 16px', display:'flex', gap:14, alignItems:'center', opacity:l.status==='active'?1:0.55 }}>
              <div style={{ width:56, height:56, borderRadius:6, background:B.midnight, flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {l.photos?.[0]?<img src={l.photos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:24}}>📦</span>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ ...O, fontSize:13, color:B.bone }}>{l.title}</div>
                <div style={{ fontSize:11, color:B.dust, marginTop:3 }}>
                  ${l.price.toLocaleString()} · {l.view_count??0} views · {l.watchers} watching
                  {l.status==='sold' && <span style={{color:B.go}}> · SOLD</span>}
                  {l.status==='removed' && <span> · removed</span>}
                  {!l.paid && l.status==='active' && <span style={{color:B.copper}}> · fee pending</span>}
                </div>
              </div>
              {l.status==='active' && (
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={()=>markSold(l.id)} style={{ background:'rgba(122,224,122,0.12)', color:B.go, border:`1px solid ${B.go}44`, borderRadius:5, padding:'7px 12px', fontSize:11, ...O, letterSpacing:1, cursor:'pointer' }}>SOLD</button>
                  <button onClick={()=>removeListing(l.id)} style={{ background:'transparent', color:B.dust, border:'1px solid rgba(255,255,255,0.12)', borderRadius:5, padding:'7px 10px', fontSize:11, cursor:'pointer' }}>✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        watching.length===0 ? <Empty msg="You're not watching anything yet." /> :
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {watching.map(l=>(
            <Link key={l.id} href={`/market/${l.id}`} style={{ textDecoration:'none' }}>
              <div style={{ background:B.forest, borderRadius:8, border:`1px solid ${l.priceDropped?B.go+'66':'#243824'}`, padding:'14px 16px', display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ width:56, height:56, borderRadius:6, background:B.midnight, flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {l.photos?.[0]?<img src={l.photos[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:24}}>📦</span>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ ...O, fontSize:13, color:B.bone }}>{l.title}</div>
                  <div style={{ fontSize:11, color:B.dust, marginTop:3 }}>
                    {l.priceDropped
                      ? <span style={{color:B.go}}>↓ PRICE DROP — was ${l.oldPrice?.toLocaleString()}, now ${l.price.toLocaleString()}</span>
                      : <>${l.price.toLocaleString()} · @{l.seller_username}</>}
                    {l.status==='sold' && <span> · SOLD</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function Empty({ msg, cta }: { msg:string; cta?:boolean }) {
  return (
    <div style={{ background:B.forest, borderRadius:8, padding:40, textAlign:'center', border:'1px solid #243824' }}>
      <div style={{ fontSize:40, marginBottom:10 }}>🏕️</div>
      <div style={{ color:B.dust, fontSize:13, marginBottom:cta?18:0 }}>{msg}</div>
      {cta && <Link href="/market/sell" style={{ background:B.copper, color:B.midnight, padding:'10px 20px', borderRadius:5, ...O, fontSize:12, letterSpacing:1, textDecoration:'none' }}>LIST YOUR FIRST ITEM</Link>}
    </div>
  )
}
