'use client'
// src/app/guides/join/page.tsx
// List your guide business. Founding-guide logic lives in the DB trigger.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

const CATEGORIES = [
  { id:'fishing_guide', label:'🎣 Fishing Guide' },
  { id:'hunting_guide', label:'🏹 Hunting Guide / Outfitter' },
  { id:'outfitter', label:'🎒 Outfitter' },
  { id:'taxidermist', label:'🦌 Taxidermist' },
  { id:'boat_repair', label:'⚙️ Boat Repair' },
  { id:'fly_shop', label:'🪰 Fly Shop' },
]

export default function GuideJoinPage() {
  const router = useRouter()
  const supabase = createClient()
  const [f, setF] = useState({ business_name:'', name:'', category:'fishing_guide', region:'panhandle', city:'', phone:'', email:'', website:'', bio:'', tags:'', price_from:'' })
  const [plan, setPlan] = useState<'free'|'pro'|'elite'>('pro')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k:string,v:string)=>setF(p=>({...p,[k]:v}))

  async function submit() {
    setErr('')
    if (!f.business_name.trim()||!f.bio.trim()) { setErr('Business name and bio are required'); return }
    setBusy(true)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { error } = await supabase.from('guides').insert({
        user_id: user.id,
        business_name: f.business_name.trim(),
        name: f.name.trim() || f.business_name.trim(),
        category: f.category, region: f.region, city: f.city.trim()||null,
        phone: f.phone.trim()||null, email: f.email.trim()||user.email, website: f.website.trim()||null,
        bio: f.bio.trim(),
        tags: f.tags.split(',').map(t=>t.trim()).filter(Boolean),
        price_from: f.price_from ? parseInt(f.price_from) : null,
        plan,
        trial_started_at: plan!=='free' ? new Date().toISOString() : null,  // triggers founding-slot logic
        is_active: true,
      })
      if (error) { setErr(error.message); setBusy(false); return }
      router.push('/guides')
    } catch(e:any){ setErr(e.message); setBusy(false) }
  }

  const I = (k:string,label:string,ph:string,req=false)=>(
    <div style={{ marginBottom:12 }}>
      <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>{label}{req&&<span style={{color:B.copper}}> *</span>}</div>
      <input value={(f as any)[k]} onChange={e=>set(k,e.target.value)} placeholder={ph} style={{ width:'100%', background:B.forest, border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, color:B.bone, padding:'11px 13px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }} />
    </div>
  )

  return (
    <div style={{ maxWidth:580, margin:'0 auto' }}>
      <div style={{ ...O, fontSize:26, letterSpacing:1, color:B.bone, margin:'8px 0 4px' }}>LIST YOUR BUSINESS</div>
      <div style={{ fontSize:13, color:B.parchment, marginBottom:6, lineHeight:1.6 }}>Reach thousands of Florida outdoorsmen looking for exactly what you offer.</div>
      <div style={{ fontSize:12, color:B.copper, marginBottom:18 }}>🏆 First 50 guides get Founding Guide status — 90 days free + a permanent badge.</div>

      {/* Plan picker */}
      <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>PLAN</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
        {([
          { id:'pro', name:'PRO', price:'$19.99/mo', desc:'Featured placement, unlimited leads, booking tools' },
          { id:'elite', name:'ELITE', price:'$99/yr', desc:'Everything in Pro, top placement, save vs monthly' },
          { id:'free', name:'FREE', price:'$0', desc:'Basic listing, appears below Pro/Elite guides' },
        ] as const).map(p=>(
          <button key={p.id} onClick={()=>setPlan(p.id)} style={{ textAlign:'left', background:plan===p.id?'rgba(200,146,42,0.12)':B.forest, border:`1.5px solid ${plan===p.id?B.copper:'rgba(255,255,255,0.1)'}`, borderRadius:8, padding:'13px 16px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ ...O, fontSize:13, letterSpacing:1, color:plan===p.id?B.copper:B.bone }}>{p.name}</div>
              <div style={{ fontSize:11, color:B.dust, marginTop:2 }}>{p.desc}</div>
            </div>
            <div style={{ ...O, fontSize:14, color:plan===p.id?B.copper:B.parchment }}>{p.price}</div>
          </button>
        ))}
      </div>

      {I('business_name','BUSINESS NAME','Pensacola Bay Charters', true)}
      {I('name','YOUR NAME','Capt. Mike Fricks')}
      <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>CATEGORY</div>
      <select value={f.category} onChange={e=>set('category',e.target.value)} style={{ width:'100%', background:B.forest, border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, color:B.bone, padding:'11px 13px', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12, fontFamily:'Inter,sans-serif' }}>
        {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
      </select>
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>REGION</div>
          <select value={f.region} onChange={e=>set('region',e.target.value)} style={{ width:'100%', background:B.forest, border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, color:B.bone, padding:'11px 13px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }}>
            {REGIONS.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
        <div style={{ flex:1 }}>{I('city','CITY','Pensacola')}</div>
      </div>
      <div style={{ marginBottom:12 }}>
        <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>BIO <span style={{color:B.copper}}>*</span></div>
        <textarea value={f.bio} onChange={e=>set('bio',e.target.value)} rows={4} placeholder="What you offer, your experience, what makes your trips worth booking..." style={{ width:'100%', background:B.forest, border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, color:B.bone, padding:'11px 13px', fontSize:14, outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:'Inter,sans-serif', lineHeight:1.6 }} />
      </div>
      {I('tags','TAGS (comma separated)','Redfish, Inshore, Fly Fishing')}
      {I('price_from','STARTING PRICE ($)','350')}
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1 }}>{I('phone','PHONE','(850) 555-0100')}</div>
        <div style={{ flex:1 }}>{I('website','WEBSITE','yoursite.com')}</div>
      </div>

      {err && <div style={{ fontSize:12, color:'#E07A7A', margin:'4px 0 12px', textAlign:'center' }}>{err}</div>}
      <button onClick={submit} disabled={busy} style={{ width:'100%', background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'14px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', opacity:busy?0.7:1, marginTop:6 }}>{busy?'SUBMITTING...':'LIST MY BUSINESS'}</button>
      <div style={{ fontSize:11, color:B.dust, textAlign:'center', marginTop:10, lineHeight:1.5 }}>
        {plan!=='free' ? 'Card collected at checkout when Stripe is live. Founding guides ride free for 90 days.' : 'Free listing — upgrade anytime for featured placement.'}
      </div>
    </div>
  )
}
