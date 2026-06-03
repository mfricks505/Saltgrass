'use client'
// src/app/crewup/mine/page.tsx
// Crew Up — trips I'm captaining + seats I've claimed.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358', go:'#7AE07A' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

export default function MyTripsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [captaining, setCaptaining] = useState<any[]>([])
  const [crewing, setCrewing] = useState<any[]>([])
  const [tab, setTab] = useState<'captaining'|'crewing'>('captaining')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data:mine } = await supabase.from('trips').select('*').eq('captain_id',user.id).order('trip_date',{ascending:false})
    // bookings on my trips
    const withCrew = await Promise.all((mine??[]).map(async t=>{
      const { data:bookings } = await supabase.from('trip_bookings').select('*').eq('trip_id',t.id).eq('status','confirmed')
      return { ...t, crew: bookings ?? [] }
    }))
    setCaptaining(withCrew)

    const { data:myBookings } = await supabase.from('trip_bookings').select('*, trips(*)').eq('crew_id',user.id).eq('status','confirmed')
    setCrewing(myBookings ?? [])
    setLoading(false)
  }

  async function cancelSeat(bookingId:string) {
    await supabase.from('trip_bookings').update({ status:'cancelled' }).eq('id',bookingId)
    load()
  }
  async function cancelTrip(tripId:string) {
    await supabase.from('trips').update({ status:'cancelled' }).eq('id',tripId)
    load()
  }

  return (
    <div style={{ maxWidth:680, margin:'0 auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'8px 0 16px' }}>
        <div style={{ ...O, fontSize:24, letterSpacing:1, color:B.bone }}>MY TRIPS</div>
        <Link href="/crewup" style={{ background:B.copper, color:B.midnight, padding:'10px 18px', borderRadius:6, ...O, fontSize:12, letterSpacing:1, textDecoration:'none' }}>+ POST A TRIP</Link>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        {(['captaining','crewing'] as const).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 18px', borderRadius:6, ...O, fontSize:11, letterSpacing:2, cursor:'pointer', border:`2px solid ${tab===t?B.copper:B.canopy}`, background:tab===t?'rgba(200,146,42,0.12)':'transparent', color:tab===t?B.copper:B.parchment }}>
            {t==='captaining'?`CAPTAINING (${captaining.length})`:`CREWING (${crewing.length})`}
          </button>
        ))}
      </div>

      {loading ? <div style={{ ...O, color:B.dust, letterSpacing:2, padding:40, textAlign:'center' }}>LOADING...</div> :
       tab==='captaining' ? (
        captaining.length===0 ? <Empty msg="You haven't posted any trips." /> :
        captaining.map(t=>(
          <div key={t.id} style={{ background:B.forest, borderRadius:8, border:'1px solid #243824', padding:'16px 18px', marginBottom:8, opacity:t.status==='cancelled'?0.5:1 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ ...O, fontSize:14, color:B.bone }}>{t.title}</div>
                <div style={{ fontSize:11, color:B.dust, marginTop:3 }}>{t.trip_date} · {t.seats_filled}/{t.seats_total} seats filled{t.status==='cancelled'?' · CANCELLED':''}</div>
              </div>
              {t.status!=='cancelled' && <button onClick={()=>cancelTrip(t.id)} style={{ background:'transparent', color:B.dust, border:'1px solid rgba(255,255,255,0.12)', borderRadius:5, padding:'6px 10px', fontSize:11, cursor:'pointer' }}>Cancel</button>}
            </div>
            {t.crew.length>0 && (
              <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid #243824' }}>
                <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>CREW</div>
                {t.crew.map((c:any)=>(
                  <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0' }}>
                    <span style={{ fontSize:13, color:B.parchment }}>@{c.crew_username}</span>
                    <Link href={`/messages?to=${c.crew_id}&trip=${t.id}&label=${encodeURIComponent(t.title)}`} style={{ color:B.copper, fontSize:11, textDecoration:'none' }}>Message →</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        crewing.length===0 ? <Empty msg="You haven't claimed any seats yet." /> :
        crewing.map(b=>(
          <div key={b.id} style={{ background:B.forest, borderRadius:8, border:'1px solid #243824', padding:'16px 18px', marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ ...O, fontSize:14, color:B.bone }}>{b.trips?.title}</div>
                <div style={{ fontSize:11, color:B.dust, marginTop:3 }}>{b.trips?.trip_date} · Capt. @{b.trips?.captain_username} · meet {b.trips?.departure}</div>
              </div>
              <button onClick={()=>cancelSeat(b.id)} style={{ background:'transparent', color:B.dust, border:'1px solid rgba(255,255,255,0.12)', borderRadius:5, padding:'6px 10px', fontSize:11, cursor:'pointer' }}>Drop</button>
            </div>
            <Link href={`/messages?to=${b.trips?.captain_id}&trip=${b.trip_id}&label=${encodeURIComponent(b.trips?.title||'Trip')}`} style={{ display:'inline-block', marginTop:8, color:B.copper, fontSize:12, textDecoration:'none' }}>💬 Message the captain →</Link>
          </div>
        ))
      )}
    </div>
  )
}

function Empty({ msg }:{ msg:string }) {
  return (
    <div style={{ background:B.forest, borderRadius:8, padding:40, textAlign:'center', border:'1px solid #243824' }}>
      <div style={{ fontSize:40, marginBottom:10 }}>⛵</div>
      <div style={{ color:B.dust, fontSize:13 }}>{msg}</div>
    </div>
  )
}
