'use client'
// src/app/crewup/page.tsx — Crew Up (wired to real trips/bookings/float_plans)

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'
import Link from 'next/link'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358', bark:'#1A1208' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }
const PLATFORM_FEE_PCT = 0.10

export default function CrewUpPage() {
  const supabase = createClient()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'fishing'|'hunting'>('all')
  const [region, setRegion] = useState('all')
  const [showPost, setShowPost] = useState(false)
  const [me, setMe] = useState<any>(null)

  useEffect(()=>{ load() },[filter, region])
  async function load() {
    setLoading(true)
    const { data:{ user } } = await supabase.auth.getUser()
    setMe(user)
    let q = supabase.from('trips').select('*').in('status',['open','full']).gte('trip_date', new Date().toISOString().slice(0,10))
    if (filter!=='all') q = q.eq('type', filter)
    if (region!=='all') q = q.eq('region', region)
    const { data } = await q.order('trip_date',{ascending:true})
    setTrips(data ?? [])
    setLoading(false)
  }

  async function openPost() {
    const { data:{ user } } = await supabase.auth.getUser()
    if (!user) { window.location.href='/auth/login'; return }
    setShowPost(true)
  }

  async function book(trip:any) {
    if (!me) { window.location.href='/auth/login'; return }
    if (me.id === trip.captain_id) { alert("That's your own trip."); return }
    const { data:profile } = await supabase.from('profiles').select('username').eq('id',me.id).single()
    const { error } = await supabase.from('trip_bookings').insert({
      trip_id: trip.id, crew_id: me.id, crew_username: profile?.username ?? 'crew', status:'confirmed', paid:false,
    })
    if (error) { alert(error.message.includes('duplicate') ? "You've already claimed a seat on this trip." : error.message); return }
    // Stripe checkout for fee + cost would fire here when live
    alert('Seat claimed! Message the captain to coordinate. (Payment activates with Stripe.)')
    load()
  }

  const regionMeta = (id:string)=>REGIONS.find(r=>r.id===id) ?? { icon:'📍', label:id }

  return (
    <div>
      {/* Header */}
      <div style={{ background:'linear-gradient(160deg,#0F1A0F,#141F14)', border:'1px solid #243824', borderRadius:8, padding:'40px 36px', marginBottom:10, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-60, top:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,146,42,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:600 }}>
          <div style={{ ...O, fontSize:11, letterSpacing:4, color:B.copper, marginBottom:8 }}>SALTGRASS</div>
          <h1 style={{ ...O, fontSize:44, letterSpacing:1, color:B.bone, margin:'0 0 14px', textTransform:'uppercase', lineHeight:1 }}>CREW UP</h1>
          <p style={{ fontSize:15, color:B.parchment, margin:'0 0 6px', lineHeight:1.7, maxWidth:520 }}>
            Got an empty seat? Split the fuel. Find a verified member headed your way.
          </p>
          <p style={{ fontSize:13, color:B.dust, margin:'0 0 24px', lineHeight:1.6 }}>
            Every trip auto-generates a float plan you can share with someone on shore.
          </p>
          <button onClick={openPost} style={{ background:B.copper, color:'#0A0C08', border:'none', borderRadius:4, padding:'13px 26px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer' }}>+ POST A TRIP</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
        {([['all','ALL'],['fishing','🎣 FISHING'],['hunting','🏹 HUNTING']] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setFilter(id)} style={{ padding:'7px 16px', borderRadius:4, ...O, fontSize:10, letterSpacing:2, cursor:'pointer', border:`2px solid ${filter===id?B.copper:B.canopy}`, background:filter===id?'rgba(200,146,42,0.12)':'transparent', color:filter===id?B.copper:B.parchment }}>{label}</button>
        ))}
        <select value={region} onChange={e=>setRegion(e.target.value)} style={{ background:B.bark, border:`1.5px solid ${B.canopy}`, borderRadius:4, color:B.parchment, fontSize:11, padding:'7px 12px', outline:'none', cursor:'pointer', ...O, letterSpacing:1 }}>
          <option value="all">ALL REGIONS</option>
          {REGIONS.map(r=><option key={r.id} value={r.id}>{r.label.toUpperCase()}</option>)}
        </select>
      </div>

      {loading ? <div style={{ ...O, color:B.dust, letterSpacing:2, padding:40, textAlign:'center' }}>LOADING TRIPS...</div> :
       trips.length===0 ? (
        <div style={{ background:B.forest, borderRadius:8, padding:48, textAlign:'center', border:'1px solid #243824' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>⛵</div>
          <div style={{ ...O, fontSize:18, letterSpacing:2, color:B.bone, marginBottom:8 }}>NO TRIPS POSTED YET</div>
          <div style={{ color:B.dust, fontSize:13, marginBottom:20 }}>Be the first to post a trip and find your crew.</div>
          <button onClick={openPost} style={{ background:B.copper, color:'#0A0C08', border:'none', padding:'11px 22px', borderRadius:4, ...O, fontSize:12, letterSpacing:2, cursor:'pointer' }}>POST A TRIP</button>
        </div>
      ) : (
        <div>
          {trips.map(trip=>{
            const seatsLeft = trip.seats_total - trip.seats_filled
            const fee = Math.round(trip.cost_per_person * PLATFORM_FEE_PCT)
            const total = trip.cost_per_person + fee
            const rm = regionMeta(trip.region)
            return (
              <div key={trip.id} style={{ background:B.forest, border:'1px solid #243824', borderRadius:8, overflow:'hidden', marginBottom:10 }}>
                <div style={{ background:trip.type==='fishing'?'#0F1A2A':'#1A2B1A', padding:'8px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ ...O, fontSize:10, letterSpacing:3, color:trip.type==='fishing'?'#5A9FD4':B.copper }}>{trip.type==='fishing'?'🎣 FISHING':'🏹 HUNTING'}</span>
                  <span style={{ fontSize:10, color:B.dust }}>{rm.icon} {rm.label}</span>
                </div>
                <div style={{ padding:'16px 18px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:B.bone, fontWeight:700 }}>@{trip.captain_username}</div>
                      <div style={{ ...O, fontSize:15, letterSpacing:1, color:B.bone, marginTop:4 }}>{trip.title}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ ...O, fontSize:20, color:B.copper }}>${total}</div>
                      <div style={{ fontSize:9, color:B.dust }}>per person (incl. ${fee} fee)</div>
                    </div>
                  </div>
                  {trip.description && <div style={{ fontSize:12, color:B.parchment, lineHeight:1.7, marginBottom:12 }}>{trip.description}</div>}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:12 }}>
                    {[['📅','DATE',trip.trip_date],['⏰','DEPARTS',trip.depart_time||'TBD'],['📍','MEET AT',trip.departure],['⛵','VESSEL',trip.vessel||'—']].map(([icon,label,val])=>(
                      <div key={String(label)} style={{ background:B.moss, borderRadius:4, padding:'8px 10px' }}>
                        <div style={{ ...O, fontSize:8, letterSpacing:2, color:B.dust, marginBottom:2 }}>{icon} {label}</div>
                        <div style={{ fontSize:11, color:B.bone, fontWeight:600 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                    <span style={{ fontSize:11, color:seatsLeft>0?B.parchment:B.dust }}>{seatsLeft>0?`${seatsLeft} of ${trip.seats_total} seats open`:'FULL'}</span>
                    {trip.cost_covers && <span style={{ fontSize:10, color:B.dust }}>Covers: {trip.cost_covers}</span>}
                  </div>
                  <button onClick={()=>book(trip)} disabled={seatsLeft===0} style={{ width:'100%', background:seatsLeft===0?B.canopy:B.copper, color:seatsLeft===0?B.dust:'#0A0C08', border:'none', borderRadius:4, padding:'11px', ...O, fontSize:12, letterSpacing:1, cursor:seatsLeft===0?'not-allowed':'pointer' }}>
                    {seatsLeft===0?'TRIP FULL':'CLAIM A SEAT'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showPost && <PostTripModal onClose={()=>setShowPost(false)} onPosted={load} />}
    </div>
  )
}

function PostTripModal({ onClose, onPosted }:{ onClose:()=>void; onPosted:()=>void }) {
  const supabase = createClient()
  const [f, setF] = useState({ type:'fishing', title:'', description:'', region:'panhandle', departure:'', destination:'', trip_date:'', depart_time:'', return_time:'', seats_total:'2', cost_per_person:'', cost_covers:'', vessel:'' })
  const [floatContact, setFloatContact] = useState({ name:'', phone:'' })
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const set = (k:string,v:string)=>setF(p=>({...p,[k]:v}))

  async function submit() {
    setError('')
    if (!f.title.trim()||!f.departure.trim()||!f.trip_date) { setError('Title, meet-up point, and date are required'); return }
    setPosting(true)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { window.location.href='/auth/login'; return }
      const { data:profile } = await supabase.from('profiles').select('username').eq('id',user.id).single()
      const { data:trip, error:insErr } = await supabase.from('trips').insert({
        captain_id:user.id, captain_username:profile?.username??'captain',
        type:f.type, title:f.title.trim(), description:f.description.trim()||null,
        region:f.region, departure:f.departure.trim(), destination:f.destination.trim()||null,
        trip_date:f.trip_date, depart_time:f.depart_time||null, return_time:f.return_time||null,
        seats_total:Math.max(1,parseInt(f.seats_total)||1), cost_per_person:Math.round(Number(f.cost_per_person)||0),
        cost_covers:f.cost_covers.trim()||null, vessel:f.vessel.trim()||null,
      }).select().single()
      if (insErr) { setError(insErr.message); setPosting(false); return }

      // Auto-create the float plan if a shore contact was given
      if (floatContact.name.trim() || floatContact.phone.trim()) {
        await supabase.from('float_plans').insert({
          trip_id: trip.id, user_id: user.id,
          contact_name: floatContact.name.trim()||null, contact_phone: floatContact.phone.trim()||null,
          expected_return: f.return_time ? null : null, notes:`${f.title} — depart ${f.departure} ${f.depart_time}`,
        })
      }
      onPosted(); onClose()
    } catch(e:any){ setError(e.message); setPosting(false) }
  }

  const I = (k:string,label:string,ph:string,type='text')=>(
    <div style={{ marginBottom:10 }}>
      <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:4 }}>{label}</div>
      <input type={type} value={(f as any)[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{ width:'100%', background:B.midnight, border:'1px solid rgba(255,255,255,0.15)', borderRadius:5, color:B.bone, padding:'10px 12px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }} />
    </div>
  )

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:800, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:16, overflowY:'auto' }}>
      <div style={{ background:B.forest, borderRadius:10, padding:24, maxWidth:480, width:'100%', border:`1px solid ${B.canopy}`, margin:'20px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ ...O, fontSize:20, letterSpacing:2, color:B.bone }}>POST A TRIP</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:B.dust, fontSize:22, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          {(['fishing','hunting'] as const).map(t=>(
            <button key={t} onClick={()=>set('type',t)} style={{ flex:1, padding:'12px', borderRadius:4, border:`2px solid ${f.type===t?B.copper:B.canopy}`, background:f.type===t?'rgba(200,146,42,0.12)':'transparent', color:f.type===t?B.copper:B.parchment, ...O, fontSize:13, letterSpacing:2, cursor:'pointer' }}>{t==='fishing'?'🎣 FISHING':'🏹 HUNTING'}</button>
          ))}
        </div>
        {I('title','TITLE','Inshore Redfish — Pensacola Bay')}
        <div style={{ marginBottom:10 }}>
          <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:4 }}>DESCRIPTION</div>
          <textarea value={f.description} onChange={e=>set('description',e.target.value)} rows={3} placeholder="What you're targeting, experience level, what's provided..." style={{ width:'100%', background:B.midnight, border:'1px solid rgba(255,255,255,0.15)', borderRadius:5, color:B.bone, padding:'10px 12px', fontSize:14, outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:'Inter,sans-serif', lineHeight:1.5 }} />
        </div>
        <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:4 }}>REGION</div>
        <select value={f.region} onChange={e=>set('region',e.target.value)} style={{ width:'100%', background:B.midnight, border:'1px solid rgba(255,255,255,0.15)', borderRadius:5, color:B.bone, padding:'10px 12px', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:10, fontFamily:'Inter,sans-serif' }}>
          {REGIONS.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        {I('departure','MEET-UP POINT (public ramp/lot)','Bayou Chico Boat Ramp, Pensacola')}
        {I('destination','GENERAL AREA (not your exact spot)','Pensacola Bay flats')}
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1 }}>{I('trip_date','DATE','', 'date')}</div>
          <div style={{ flex:1 }}>{I('depart_time','DEPART','5:00 AM')}</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1 }}>{I('seats_total','SEATS','2','number')}</div>
          <div style={{ flex:1 }}>{I('cost_per_person','COST/PERSON ($)','45','number')}</div>
        </div>
        {I('cost_covers','COST COVERS','Fuel + ramp fee')}
        {I('vessel','VESSEL / RIG','2021 Pathfinder 22')}

        {/* Float plan */}
        <div style={{ background:B.bark, borderRadius:6, padding:'12px 14px', margin:'8px 0 14px', border:`1px solid ${B.canopy}` }}>
          <div style={{ ...O, fontSize:10, letterSpacing:1, color:B.copper, marginBottom:8 }}>📋 FLOAT PLAN (optional but smart)</div>
          <div style={{ fontSize:11, color:B.dust, marginBottom:10, lineHeight:1.5 }}>Someone on shore who should know your plan. Auto-saved and shareable.</div>
          <input value={floatContact.name} onChange={e=>setFloatContact(c=>({...c,name:e.target.value}))} placeholder="Contact name" style={{ width:'100%', background:B.midnight, border:'1px solid rgba(255,255,255,0.15)', borderRadius:5, color:B.bone, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:8, fontFamily:'Inter,sans-serif' }} />
          <input value={floatContact.phone} onChange={e=>setFloatContact(c=>({...c,phone:e.target.value}))} placeholder="Contact phone" style={{ width:'100%', background:B.midnight, border:'1px solid rgba(255,255,255,0.15)', borderRadius:5, color:B.bone, padding:'9px 12px', fontSize:13, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }} />
        </div>

        {error && <div style={{ fontSize:12, color:'#E07A7A', marginBottom:12, textAlign:'center' }}>{error}</div>}
        <button onClick={submit} disabled={posting} style={{ width:'100%', background:B.copper, color:'#0A0C08', border:'none', borderRadius:6, padding:'13px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', opacity:posting?0.7:1 }}>{posting?'POSTING...':'POST TRIP'}</button>
      </div>
    </div>
  )
}
