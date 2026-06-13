'use client'
// src/app/guides/join/page.tsx
// List a guide business + submit licenses for verification.
// Flow: create guide row (is_active:false, pending) -> call /api/guides/verify ->
// auto-path (license found -> identity_pending -> Stripe ID when live) OR manual_review.
// Listing stays HIDDEN (is_active:false) until verified/approved.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#C4BFA6', dust:'#9A9580' }
const O = { fontFamily:'Oswald, sans-serif' }

// guide_type values must match FWC_FILES keys in src/lib/fwc-verify.ts
const CATEGORIES = [
  { id:'fishing_guide', label:'🎣 Fishing Guide', needsLicense:true,  licenseKind:'fwc' },
  { id:'hunting_guide', label:'🏹 Hunting Guide / Outfitter', needsLicense:true, licenseKind:'fwc' },
  { id:'outfitter', label:'🎒 Outfitter', needsLicense:false, licenseKind:null },
  { id:'taxidermist', label:'🦌 Taxidermist', needsLicense:false, licenseKind:null },
  { id:'boat_repair', label:'⚙️ Boat Repair', needsLicense:false, licenseKind:null },
  { id:'fly_shop', label:'🪰 Fly Shop', needsLicense:false, licenseKind:null },
]

export default function GuideJoinPage() {
  const router = useRouter()
  const supabase = createClient()
  const [f, setF] = useState({
    business_name:'', name:'', last_name:'', category:'fishing_guide', region:'panhandle', city:'',
    phone:'', email:'', website:'', bio:'', tags:'', price_from:'',
    fwc_license_number:'', uscg_credential_number:'',
  })
  const [plan, setPlan] = useState<'free'|'pro'|'elite'>('pro')
  const [tos, setTos] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [doneStatus, setDoneStatus] = useState<string | null>(null)
  const set = (k:string,v:string)=>setF(p=>({...p,[k]:v}))

  const cat = CATEGORIES.find(c => c.id === f.category)!

  async function submit() {
    setErr('')
    if (!f.business_name.trim() || !f.bio.trim()) { setErr('Business name and bio are required'); return }
    if (!f.last_name.trim()) { setErr('Last name is required (for license verification)'); return }
    if (!tos) { setErr('Please accept the terms to continue'); return }
    if (cat.needsLicense && !f.fwc_license_number.trim() && !f.uscg_credential_number.trim()) {
      setErr('A license or credential number is required for guides. Enter your FWC license and/or USCG credential.')
      return
    }
    setBusy(true)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // 1) Create guide row — HIDDEN until verified/approved
      const { data: guide, error } = await supabase.from('guides').insert({
        user_id: user.id,
        business_name: f.business_name.trim(),
        name: f.name.trim() || f.business_name.trim(),
        category: f.category, region: f.region, city: f.city.trim()||null,
        phone: f.phone.trim()||null, email: f.email.trim()||user.email, website: f.website.trim()||null,
        bio: f.bio.trim(),
        tags: f.tags.split(',').map(t=>t.trim()).filter(Boolean),
        price_from: f.price_from ? parseInt(f.price_from) : null,
        plan,
        trial_started_at: plan!=='free' ? new Date().toISOString() : null,
        is_active: false,                 // hidden until approved
        is_verified: false,
        verification_status: 'submitted',
        tos_accepted: true,
        tos_accepted_at: new Date().toISOString(),
      }).select().single()
      if (error) { setErr(error.message); setBusy(false); return }

      // 2) Submit for verification (auto-checks FWC/USCG; falls to manual_review if not found)
      let status = 'manual_review'
      try {
        const res = await fetch('/api/guides/verify', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            guide_id: guide.id,
            last_name: f.last_name.trim(),
            fwc_license_number: f.fwc_license_number.trim() || null,
            guide_type: f.category,            // matches FWC_FILES key
            uscg_credential_number: f.uscg_credential_number.trim() || null,
          }),
        })
        if (res.ok) { const j = await res.json(); status = j.status ?? 'manual_review' }
      } catch { /* verify endpoint hiccup -> stays manual_review */ }

      setDoneStatus(status)
      setBusy(false)
    } catch(e:any){ setErr(e.message); setBusy(false) }
  }

  // Confirmation screen
  if (doneStatus) {
    const niceMsg =
      doneStatus === 'identity_pending'
        ? "Your license checked out. The last step is a quick ID verification — we'll email you the link. Once that's done, your listing goes live with a Verified badge."
        : doneStatus === 'license_issue'
        ? "We couldn't match that license number automatically. No worries — we'll review it by hand and reach out within 2 business days."
        : "Application received! We review each guide by hand to keep Saltgrass trusted. We'll be in touch within 2 business days, and your listing goes live once you're approved."
    return (
      <div style={{ maxWidth:500, margin:'40px auto', textAlign:'center', padding:'0 16px' }}>
        <div style={{ fontSize:44, marginBottom:12 }}>🛡️</div>
        <div style={{ ...O, fontSize:22, letterSpacing:1, color:B.bone, marginBottom:10 }}>APPLICATION RECEIVED</div>
        <p style={{ fontSize:14, color:B.parchment, lineHeight:1.7, marginBottom:20 }}>{niceMsg}</p>
        <button onClick={()=>router.push('/guides')} style={{ ...O, background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'12px 26px', fontSize:13, letterSpacing:2, cursor:'pointer' }}>BACK TO GUIDES</button>
      </div>
    )
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
      <div style={{ fontSize:13, color:B.parchment, marginBottom:6, lineHeight:1.6 }}>Reach Florida outdoorsmen looking for exactly what you offer. Every guide is verified — that's what makes a Saltgrass listing worth something.</div>
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
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1 }}>{I('name','YOUR NAME','Capt. Mike Fricks')}</div>
        <div style={{ flex:1 }}>{I('last_name','LAST NAME','Fricks', true)}</div>
      </div>

      <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>CATEGORY</div>
      <select value={f.category} onChange={e=>set('category',e.target.value)} style={{ width:'100%', background:B.forest, border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, color:B.bone, padding:'11px 13px', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:12, fontFamily:'Inter,sans-serif' }}>
        {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
      </select>

      {/* License section — only for guide categories */}
      {cat.needsLicense && (
        <div style={{ background:B.moss, border:`1px solid ${B.canopy}`, borderRadius:8, padding:'14px 16px', marginBottom:14 }}>
          <div style={{ ...O, fontSize:10, letterSpacing:1, color:B.copper, marginBottom:8 }}>🛡️ LICENSE VERIFICATION</div>
          <div style={{ fontSize:11, color:B.dust, marginBottom:12, lineHeight:1.5 }}>
            We verify every guide against state and federal license records. Enter the license(s) that apply to you — we check automatically.
          </div>
          {I('fwc_license_number', f.category==='hunting_guide' ? 'FWC HUNTING GUIDE LICENSE #' : 'FWC FISHING GUIDE LICENSE #', 'e.g. FL-12345')}
          {I('uscg_credential_number','USCG CAPTAIN CREDENTIAL # (if you run charters)','e.g. 1234567')}
          <div style={{ fontSize:10, color:B.dust, lineHeight:1.5 }}>Enter at least one. Charter captains: include your USCG credential. We match it to your last name.</div>
        </div>
      )}

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

      {/* TOS */}
      <button onClick={()=>setTos(!tos)} style={{ width:'100%', textAlign:'left', background:'transparent', border:'none', padding:'8px 0', cursor:'pointer', display:'flex', alignItems:'flex-start', gap:10, marginBottom:8 }}>
        <span style={{ fontSize:18, color:tos?B.copper:B.dust }}>{tos?'☑':'☐'}</span>
        <span style={{ fontSize:11, color:B.parchment, lineHeight:1.5 }}>I confirm I'm a licensed guide/operator and the information above is accurate. I understand Saltgrass verifies licenses and that false info means removal.</span>
      </button>

      {err && <div style={{ fontSize:12, color:'#E07A7A', margin:'4px 0 12px', textAlign:'center' }}>{err}</div>}
      <button onClick={submit} disabled={busy} style={{ width:'100%', background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'14px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', opacity:busy?0.7:1, marginTop:6 }}>{busy?'SUBMITTING...':'SUBMIT FOR VERIFICATION'}</button>
      <div style={{ fontSize:11, color:B.dust, textAlign:'center', marginTop:10, lineHeight:1.5 }}>
        Your listing goes live once you're verified. {plan!=='free' ? 'Card collected at checkout when payments are live. Founding guides ride free for 90 days.' : ''}
      </div>
    </div>
  )
}
