'use client'
// src/app/guides/bookings/page.tsx
// Member's guide bookings (client side) + guide's incoming bookings (if they're a guide).

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358', go:'#7AE07A' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }
const STATUS_COLOR: Record<string,string> = { inquiry:'#C8922A', confirmed:'#7AE07A', completed:'#6B6358', declined:'#E07A7A', cancelled:'#6B6358' }

export default function MyBookingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [asClient, setAsClient] = useState<any[]>([])
  const [asGuide, setAsGuide] = useState<any[]>([])
  const [myGuideId, setMyGuideId] = useState<string|null>(null)
  const [tab, setTab] = useState<'client'|'guide'>('client')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // bookings I made as a client
    const { data:client } = await supabase.from('guide_bookings').select('*, guides(business_name, name)').eq('user_id',user.id).order('created_at',{ascending:false})
    setAsClient(client ?? [])

    // if I'm a guide, bookings on my listing
    const { data:myGuide } = await supabase.from('guides').select('id').eq('user_id',user.id).maybeSingle()
    if (myGuide) {
      setMyGuideId(myGuide.id)
      const { data:incoming } = await supabase.from('guide_bookings').select('*').eq('guide_id',myGuide.id).order('created_at',{ascending:false})
      setAsGuide(incoming ?? [])
    }
    setLoading(false)
  }

  async function setStatus(id:string, status:string) {
    const ts = status==='confirmed' ? { confirmed_at:new Date().toISOString() } : status==='completed' ? { completed_at:new Date().toISOString() } : {}
    await supabase.from('guide_bookings').update({ status, ...ts }).eq('id',id)
    load()
  }

  return (
    <div style={{ maxWidth:680, margin:'0 auto' }}>
      <div style={{ ...O, fontSize:24, letterSpacing:1, color:B.bone, margin:'8px 0 16px' }}>MY BOOKINGS</div>

      {myGuideId && (
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          {(['client','guide'] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 18px', borderRadius:6, ...O, fontSize:11, letterSpacing:2, cursor:'pointer', border:`2px solid ${tab===t?B.copper:B.canopy}`, background:tab===t?'rgba(200,146,42,0.12)':'transparent', color:tab===t?B.copper:B.parchment }}>
              {t==='client'?`I BOOKED (${asClient.length})`:`MY CLIENTS (${asGuide.length})`}
            </button>
          ))}
        </div>
      )}

      {loading ? <div style={{ ...O, color:B.dust, letterSpacing:2, padding:40, textAlign:'center' }}>LOADING...</div> :
       (tab==='client' || !myGuideId) ? (
        asClient.length===0 ? <Empty msg="You haven't booked any guides yet." cta /> :
        asClient.map(b=>(
          <div key={b.id} style={{ background:B.forest, borderRadius:8, border:'1px solid #243824', padding:'16px 18px', marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ ...O, fontSize:14, color:B.bone }}>{b.guides?.business_name || b.guides?.name || 'Guide'}</div>
                <div style={{ fontSize:11, color:B.dust, marginTop:3 }}>{b.trip_date} · party of {b.party_size} · ${(b.total/100).toFixed(0)}</div>
              </div>
              <span style={{ ...O, fontSize:10, letterSpacing:1, color:STATUS_COLOR[b.status] }}>{b.status.toUpperCase()}</span>
            </div>
          </div>
        ))
      ) : (
        asGuide.length===0 ? <Empty msg="No booking requests yet." /> :
        asGuide.map(b=>(
          <div key={b.id} style={{ background:B.forest, borderRadius:8, border:'1px solid #243824', padding:'16px 18px', marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:b.status==='inquiry'?10:0 }}>
              <div>
                <div style={{ ...O, fontSize:14, color:B.bone }}>{b.trip_date} · party of {b.party_size}</div>
                <div style={{ fontSize:11, color:B.dust, marginTop:3 }}>${(b.total/100).toFixed(0)} total{b.note?` · "${b.note}"`:''}</div>
              </div>
              <span style={{ ...O, fontSize:10, letterSpacing:1, color:STATUS_COLOR[b.status] }}>{b.status.toUpperCase()}</span>
            </div>
            {b.status==='inquiry' && (
              <div style={{ display:'flex', gap:8, marginTop:6 }}>
                <button onClick={()=>setStatus(b.id,'confirmed')} style={{ flex:1, background:'rgba(122,224,122,0.12)', color:B.go, border:`1px solid ${B.go}44`, borderRadius:5, padding:'8px', ...O, fontSize:11, letterSpacing:1, cursor:'pointer' }}>CONFIRM</button>
                <button onClick={()=>setStatus(b.id,'declined')} style={{ flex:1, background:'transparent', color:B.dust, border:'1px solid rgba(255,255,255,0.12)', borderRadius:5, padding:'8px', fontSize:11, cursor:'pointer' }}>Decline</button>
              </div>
            )}
            {b.status==='confirmed' && (
              <button onClick={()=>setStatus(b.id,'completed')} style={{ width:'100%', marginTop:8, background:'transparent', color:B.copper, border:`1px solid ${B.copper}44`, borderRadius:5, padding:'8px', ...O, fontSize:11, letterSpacing:1, cursor:'pointer' }}>MARK COMPLETED</button>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function Empty({ msg, cta }:{ msg:string; cta?:boolean }) {
  return (
    <div style={{ background:B.forest, borderRadius:8, padding:40, textAlign:'center', border:'1px solid #243824' }}>
      <div style={{ fontSize:40, marginBottom:10 }}>🔭</div>
      <div style={{ color:B.dust, fontSize:13, marginBottom:cta?18:0 }}>{msg}</div>
      {cta && <Link href="/guides" style={{ background:B.copper, color:B.midnight, padding:'10px 20px', borderRadius:5, ...O, fontSize:12, letterSpacing:1, textDecoration:'none' }}>FIND A GUIDE</Link>}
    </div>
  )
}
