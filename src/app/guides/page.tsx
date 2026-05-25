'use client'
// src/app/guides/page.tsx

import { useState } from 'react'
import Link from 'next/link'
import { REGIONS } from '@/lib/types'

const B = {
  bg:'#4A5240', surf:'#3D4535', card:'#333B2C',
  sun:'#E8DFC8', sil:'#1A1E14', sub:'#B8B49A',
  dust:'#8A866E', border:'rgba(232,223,200,0.10)',
  accent:'#D4982E', danger:'#C8452A',
}
const O = { fontFamily:"'Oswald', sans-serif" }

const CATEGORIES = [
  { id:'all',           label:'ALL',            icon:'🔭' },
  { id:'fishing_guide', label:'FISHING GUIDES',  icon:'🎣' },
  { id:'hunting_guide', label:'HUNTING GUIDES',  icon:'🏹' },
  { id:'outfitter',     label:'OUTFITTERS',      icon:'🎒' },
  { id:'taxidermist',   label:'TAXIDERMISTS',    icon:'🦌' },
  { id:'boat_repair',   label:'BOAT REPAIR',     icon:'⚙️' },
  { id:'fly_shop',      label:'FLY SHOPS',       icon:'🪰' },
]

const GUIDES = [
  {
    id:1, name:'Pensacola Bay Charters', category:'fishing_guide',
    region:'panhandle', region_icon:'🏖️', region_label:'Panhandle',
    rating:4.9, reviews:87, city:'Pensacola',
    bio:'Full-time inshore guide targeting redfish, speckled trout, and flounder in Pensacola Bay. 15 years on these flats. Half and full day trips available year round.',
    tags:['Redfish','Speckled Trout','Inshore','Fly Fishing'],
    tier:'featured', verified:true, price_from:350, icon:'🎣',
    bookable:true, commission_note:'10% platform fee added at checkout',
  },
  {
    id:2, name:'Osceola Hunting Outfitters', category:'hunting_guide',
    region:'northfl', region_icon:'🌲', region_label:'North Florida',
    rating:5.0, reviews:43, city:'Gainesville',
    bio:'Private land access for whitetail, turkey, and hog hunts across 6,000 acres. All-inclusive packages. Guided and self-guided options.',
    tags:['Whitetail','Turkey','Hog','Private Land'],
    tier:'featured', verified:true, price_from:500, icon:'🏹',
    bookable:true, commission_note:'10% platform fee added at checkout',
  },
  {
    id:3, name:'Keys Flats Co.', category:'fishing_guide',
    region:'keys', region_icon:'🦐', region_label:'The Keys',
    rating:4.8, reviews:122, city:'Islamorada',
    bio:'Permit, bonefish, and tarpon on fly. Backcountry and flats fishing in the Florida Keys. USCG licensed, 20 years experience.',
    tags:['Permit','Tarpon','Bonefish','Fly Fishing','Flats'],
    tier:'featured', verified:true, price_from:600, icon:'🎣',
    bookable:true, commission_note:'10% platform fee added at checkout',
  },
  {
    id:4, name:'Gulf Coast Trophy Taxidermy', category:'taxidermist',
    region:'swfl', region_icon:'🐚', region_label:'SW Florida',
    rating:4.7, reviews:31, city:'Fort Myers',
    bio:'Full-service fish and game taxidermy. Fish mounts, shoulder mounts, and European mounts. Average 4-month turnaround.',
    tags:['Fish Mounts','Shoulder Mounts','European Mounts'],
    tier:'free', verified:false, price_from:150, icon:'🦌',
    bookable:false, commission_note:'',
  },
  {
    id:5, name:'Big Bend Kayak Fishing', category:'fishing_guide',
    region:'northfl', region_icon:'🌲', region_label:'North Florida',
    rating:4.6, reviews:18, city:'Cedar Key',
    bio:'Kayak fishing guide on the Nature Coast. Redfish, snook, and trout in the grass flats. All gear provided. Great for beginners.',
    tags:['Redfish','Snook','Kayak','Nature Coast'],
    tier:'free', verified:false, price_from:200, icon:'🎣',
    bookable:false, commission_note:'',
  },
]

const TIER_CONFIG: Record<string, { label:string; color:string; border:string }> = {
  featured: { label:'★ FEATURED',  color:'#D4982E', border:'rgba(212,152,46,0.3)' },
  free:     { label:'LISTED',       color:'#8A866E', border:'rgba(138,134,110,0.2)' },
}

// ── Book Modal ───────────────────────────────────────────────
function BookModal({ guide, onClose }: { guide: typeof GUIDES[0]; onClose: ()=>void }) {
  const [step, setStep]   = useState(1)
  const [date, setDate]   = useState('')
  const [party, setParty] = useState('2')
  const [note, setNote]   = useState('')

  const base    = guide.price_from
  const fee     = Math.round(base * 0.10)
  const total   = base + fee

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:B.surf, borderRadius:8, padding:28, maxWidth:460, width:'100%', border:`1px solid ${B.border}` }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ ...O, fontSize:16, letterSpacing:2, color:B.sun }}>BOOK THIS GUIDE</div>
          <button onClick={onClose} style={{ background:B.card, border:'none', borderRadius:4, color:B.dust, padding:'6px 12px', cursor:'pointer' }}>✕</button>
        </div>

        {step === 1 && (
          <div>
            <div style={{ background:B.card, borderRadius:6, padding:14, marginBottom:16, border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:16, marginBottom:6 }}>{guide.icon}</div>
              <div style={{ ...O, fontSize:14, color:B.sun, marginBottom:4 }}>{guide.name}</div>
              <div style={{ fontSize:11, color:B.dust }}>{guide.region_icon} {guide.region_label} · {guide.city}, FL</div>
              <div style={{ display:'flex', gap:4, marginTop:6 }}>
                <span style={{ color:B.accent, fontSize:12 }}>{'★'.repeat(Math.floor(guide.rating))}</span>
                <span style={{ fontSize:11, color:B.dust }}>{guide.rating} ({guide.reviews} reviews)</span>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
              <div>
                <label style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, display:'block', marginBottom:5 }}>TRIP DATE</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ background:B.sil, border:`1.5px solid ${B.border}`, borderRadius:4, color:B.sun, fontSize:13, padding:'10px 12px', width:'100%', outline:'none', boxSizing:'border-box' as any }} />
              </div>
              <div>
                <label style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, display:'block', marginBottom:5 }}>PARTY SIZE</label>
                <select value={party} onChange={e => setParty(e.target.value)} style={{ background:B.sil, border:`1.5px solid ${B.border}`, borderRadius:4, color:B.sun, fontSize:13, padding:'10px 12px', width:'100%', outline:'none', cursor:'pointer' }}>
                  {['1','2','3','4','5','6'].map(n => <option key={n} value={n}>{n} {Number(n)===1?'person':'people'}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, display:'block', marginBottom:5 }}>NOTE TO GUIDE (OPTIONAL)</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                placeholder="Experience level, what you're hoping to catch, any questions..."
                style={{ background:B.sil, border:`1.5px solid ${B.border}`, borderRadius:4, color:B.sun, fontSize:13, padding:'10px 12px', width:'100%', outline:'none', resize:'none' as any, boxSizing:'border-box' as any, fontFamily:'Inter,sans-serif', lineHeight:1.6 }} />
            </div>

            {/* Cost breakdown */}
            <div style={{ background:B.sil, borderRadius:4, padding:'12px 14px', marginBottom:16, border:`1px solid ${B.border}` }}>
              <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:8 }}>BOOKING BREAKDOWN</div>
              {[
                { label:`Guide rate (starting from)`, val:`$${base}` },
                { label:`Saltgrass booking fee (10%)`, val:`$${fee}` },
              ].map((r,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:`1px solid ${B.border}` }}>
                  <span style={{ fontSize:12, color:B.sub }}>{r.label}</span>
                  <span style={{ fontSize:12, color:B.sun, fontWeight:700 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:8 }}>
                <span style={{ ...O, fontSize:12, letterSpacing:1, color:B.sun }}>TOTAL DUE</span>
                <span style={{ ...O, fontSize:20, color:B.accent }}>${total}</span>
              </div>
              <div style={{ fontSize:10, color:B.dust, marginTop:8, lineHeight:1.6 }}>
                Payment held until 48hrs before trip. Full refund if guide cancels. 50% refund if you cancel 72hrs+ out.
              </div>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={onClose} style={{ flex:1, padding:'11px', background:'transparent', border:`1.5px solid ${B.border}`, borderRadius:4, color:B.sub, ...O, fontSize:11, letterSpacing:1, cursor:'pointer' }}>CANCEL</button>
              <button onClick={() => setStep(2)} style={{ flex:2, background:B.accent, color:B.sil, border:'none', borderRadius:4, padding:'12px', ...O, fontSize:12, fontWeight:600, letterSpacing:1, cursor:'pointer' }}>
                REQUEST BOOKING →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign:'center', padding:'10px 0' }}>
            <div style={{ fontSize:52, marginBottom:14 }}>🎣</div>
            <div style={{ ...O, fontSize:18, letterSpacing:2, color:B.sun, marginBottom:8 }}>REQUEST SENT!</div>
            <div style={{ fontSize:13, color:B.sub, lineHeight:1.8, marginBottom:20 }}>
              {guide.name} will confirm within 24 hours. Payment of ${total} is only charged after they confirm.
            </div>
            <div style={{ background:B.card, borderRadius:6, padding:14, marginBottom:20, textAlign:'left', border:`1px solid ${B.border}` }}>
              <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.accent, marginBottom:10 }}>WHAT HAPPENS NEXT</div>
              {[
                { n:'1️⃣', t:`${guide.name} reviews your request` },
                { n:'2️⃣', t:`They confirm — payment of $${total} charged` },
                { n:'3️⃣', t:'Guide contacts you with meeting details' },
                { n:'4️⃣', t:'Rate your guide after the trip' },
              ].map(s => (
                <div key={s.n} style={{ display:'flex', gap:10, padding:'5px 0', fontSize:12, color:B.sub }}>
                  <span>{s.n}</span><span>{s.t}</span>
                </div>
              ))}
            </div>
            <button onClick={onClose} style={{ background:B.accent, color:B.sil, border:'none', borderRadius:4, padding:'12px 28px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer' }}>
              DONE
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── List Your Business Modal ─────────────────────────────────
function ListModal({ onClose }: { onClose: ()=>void }) {
  const [plan, setPlan] = useState<'free'|'featured'>('free')
  const [form, setForm] = useState({ name:'', category:'', city:'', region:'', bio:'', website:'', price_from:'', phone:'' })
  const [step, setStep] = useState(1)
  const set = (k: string, v: string) => setForm(f => ({...f,[k]:v}))

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:B.surf, borderRadius:8, padding:28, maxWidth:520, width:'100%', border:`1px solid ${B.border}`, maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ ...O, fontSize:18, letterSpacing:2, color:B.sun }}>LIST YOUR BUSINESS</div>
          <button onClick={onClose} style={{ background:B.card, border:'none', borderRadius:4, color:B.dust, padding:'6px 12px', cursor:'pointer' }}>✕</button>
        </div>

        {step === 1 && (
          <div>
            {/* Plan picker */}
            <div style={{ ...O, fontSize:9, letterSpacing:3, color:B.dust, marginBottom:10 }}>CHOOSE YOUR PLAN</div>

            <div onClick={() => setPlan('free')} style={{ padding:'16px', borderRadius:6, border:`2px solid ${plan==='free' ? B.accent : B.border}`, background: plan==='free' ? 'rgba(212,152,46,0.08)' : 'transparent', cursor:'pointer', marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ ...O, fontSize:14, color:B.sun, letterSpacing:1, marginBottom:4 }}>FREE LISTING</div>
                  <div style={{ fontSize:12, color:B.sub, lineHeight:1.7 }}>
                    Listed in the directory · Contact info visible · Member reviews<br/>
                    No booking button · No verified badge
                  </div>
                </div>
                <div style={{ ...O, fontSize:26, color: plan==='free' ? B.accent : B.sub, flexShrink:0, marginLeft:12 }}>FREE</div>
              </div>
            </div>

            <div onClick={() => setPlan('featured')} style={{ padding:'16px', borderRadius:6, border:`2px solid ${plan==='featured' ? B.accent : B.border}`, background: plan==='featured' ? 'rgba(212,152,46,0.08)' : 'transparent', cursor:'pointer', marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <div style={{ ...O, fontSize:14, color:B.sun, letterSpacing:1 }}>FEATURED & VERIFIED</div>
                    <span style={{ background:B.accent, color:B.sil, borderRadius:3, padding:'1px 7px', ...O, fontSize:9, letterSpacing:1 }}>RECOMMENDED</span>
                  </div>
                  <div style={{ fontSize:12, color:B.sub, lineHeight:1.7 }}>
                    ★ Featured placement (top of results)<br/>
                    ✓ Verified badge on your listing<br/>
                    📅 Book Now button — take bookings through the app<br/>
                    10% commission on bookings made via Saltgrass
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0, marginLeft:12 }}>
                  <div style={{ ...O, fontSize:26, color: plan==='featured' ? B.accent : B.sub }}>$49</div>
                  <div style={{ fontSize:10, color:B.dust }}>/month</div>
                </div>
              </div>
            </div>

            {plan === 'featured' && (
              <div style={{ background:'rgba(212,152,46,0.08)', border:`1px solid ${B.accent}33`, borderRadius:6, padding:'10px 14px', marginBottom:16, fontSize:11, color:B.sub, lineHeight:1.7 }}>
                <strong style={{ color:B.sun }}>How the 10% works:</strong> When a member books through your Saltgrass page, we add a 10% fee to their total. You receive the full guide rate you set. No surprise deductions.
              </div>
            )}

            <button onClick={() => setStep(2)} style={{ width:'100%', background:B.accent, color:B.sil, border:'none', borderRadius:4, padding:'13px', ...O, fontSize:13, fontWeight:600, letterSpacing:2, cursor:'pointer' }}>
              CONTINUE — {plan === 'free' ? 'FREE' : '$49/MONTH'} →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { k:'name',     l:'BUSINESS NAME',    p:'Pensacola Bay Charters' },
                { k:'city',     l:'CITY',              p:'Pensacola' },
                { k:'website',  l:'WEBSITE (OPTIONAL)',p:'yoursite.com' },
                { k:'phone',    l:'PHONE NUMBER',      p:'(850) 555-0100' },
                { k:'price_from',l:'STARTING PRICE ($)',p:'350' },
              ].map(({ k,l,p }) => (
                <div key={k}>
                  <label style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, display:'block', marginBottom:5 }}>{l}</label>
                  <input value={(form as any)[k]} onChange={e => set(k,e.target.value)} placeholder={p}
                    style={{ background:B.sil, border:`1.5px solid ${B.border}`, borderRadius:4, color:B.sun, fontSize:13, padding:'10px 12px', width:'100%', outline:'none', boxSizing:'border-box' as any }} />
                </div>
              ))}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, display:'block', marginBottom:5 }}>SERVICE TYPE</label>
                  <select value={form.category} onChange={e => set('category',e.target.value)} style={{ background:B.sil, border:`1.5px solid ${B.border}`, borderRadius:4, color: form.category ? B.sun : B.dust, fontSize:12, padding:'10px 12px', width:'100%', outline:'none', cursor:'pointer' }}>
                    <option value="">Select...</option>
                    {CATEGORIES.filter(c=>c.id!=='all').map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, display:'block', marginBottom:5 }}>REGION</label>
                  <select value={form.region} onChange={e => set('region',e.target.value)} style={{ background:B.sil, border:`1.5px solid ${B.border}`, borderRadius:4, color: form.region ? B.sun : B.dust, fontSize:12, padding:'10px 12px', width:'100%', outline:'none', cursor:'pointer' }}>
                    <option value="">Select...</option>
                    {REGIONS.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, display:'block', marginBottom:5 }}>ABOUT YOUR BUSINESS</label>
                <textarea value={form.bio} onChange={e => set('bio',e.target.value)} rows={4}
                  placeholder="What you offer, your experience, target species or game, what's included..."
                  style={{ background:B.sil, border:`1.5px solid ${B.border}`, borderRadius:4, color:B.sun, fontSize:13, padding:'10px 12px', width:'100%', outline:'none', resize:'none' as any, boxSizing:'border-box' as any, fontFamily:'Inter,sans-serif', lineHeight:1.6 }} />
              </div>
            </div>

            <div style={{ display:'flex', gap:8, marginTop:18 }}>
              <button onClick={() => setStep(1)} style={{ flex:1, padding:'11px', background:'transparent', border:`1.5px solid ${B.border}`, borderRadius:4, color:B.sub, ...O, fontSize:11, letterSpacing:1, cursor:'pointer' }}>← BACK</button>
              <button onClick={onClose} style={{ flex:2, background:B.accent, color:B.sil, border:'none', borderRadius:4, padding:'12px', ...O, fontSize:12, fontWeight:600, letterSpacing:2, cursor:'pointer' }}>
                {plan === 'free' ? 'SUBMIT FREE LISTING' : 'SUBMIT & START $49/MO'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Guide Card ───────────────────────────────────────────────
function GuideCard({ g, onBook }: { g: typeof GUIDES[0]; onBook: ()=>void }) {
  const tier = TIER_CONFIG[g.tier]
  return (
    <div style={{ background:B.card, borderRadius:8, overflow:'hidden', border:`1px solid ${g.tier==='featured' ? 'rgba(212,152,46,0.25)' : B.border}` }}>
      <div style={{ height:2, background: g.tier==='featured' ? B.accent : B.border }} />
      <div style={{ padding:'16px 18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
          <div style={{ display:'flex', gap:12, alignItems:'flex-start', flex:1 }}>
            <span style={{ fontSize:26, flexShrink:0 }}>{g.icon}</span>
            <div>
              <div style={{ ...O, fontSize:16, color:B.sun, marginBottom:3 }}>{g.name}</div>
              <div style={{ fontSize:11, color:B.dust }}>{g.region_icon} {g.region_label} · {g.city}, FL</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                <span style={{ color:B.accent, fontSize:11 }}>{'★'.repeat(Math.floor(g.rating))}</span>
                <span style={{ fontSize:11, color:B.dust }}>{g.rating} ({g.reviews} reviews)</span>
                <span style={{ ...O, fontSize:9, letterSpacing:1, color:tier.color, background:`${tier.color}18`, border:`1px solid ${tier.border}`, borderRadius:3, padding:'1px 6px' }}>{tier.label}</span>
              </div>
            </div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ ...O, fontSize:20, color:B.accent }}>From ${g.price_from}</div>
            {g.bookable && <div style={{ fontSize:9, color:B.dust, marginTop:2 }}>+10% booking fee</div>}
          </div>
        </div>

        <div style={{ fontSize:13, color:B.sub, lineHeight:1.7, marginBottom:10 }}>{g.bio}</div>

        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          {g.tags.map(t => <span key={t} style={{ background:B.surf, color:B.sub, borderRadius:3, padding:'2px 8px', fontSize:10 }}>#{t}</span>)}
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button style={{ flex:1, background:'transparent', color:B.sub, border:`1.5px solid ${B.border}`, borderRadius:4, padding:'9px', ...O, fontSize:10, letterSpacing:1, cursor:'pointer' }}>
            VIEW PROFILE
          </button>
          {g.bookable ? (
            <button onClick={onBook} style={{ flex:2, background:B.accent, color:B.sil, border:'none', borderRadius:4, padding:'9px', ...O, fontSize:11, fontWeight:600, letterSpacing:1, cursor:'pointer' }}>
              BOOK NOW
            </button>
          ) : (
            <button style={{ flex:2, background:B.surf, color:B.sub, border:`1.5px solid ${B.border}`, borderRadius:4, padding:'9px', ...O, fontSize:11, letterSpacing:1, cursor:'pointer' }}>
              CONTACT GUIDE
            </button>
          )}
        </div>

        {g.bookable && (
          <div style={{ marginTop:8, fontSize:10, color:B.dust, textAlign:'center' }}>
            Secure booking · 10% fee · Full refund if guide cancels
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function GuidesPage() {
  const [category,  setCategory]  = useState('all')
  const [region,    setRegion]    = useState('all')
  const [bookGuide, setBookGuide] = useState<typeof GUIDES[0] | null>(null)
  const [showList,  setShowList]  = useState(false)

  const filtered = GUIDES
    .filter(g => category==='all' || g.category===category)
    .filter(g => region==='all'   || g.region===region)
    .sort((a,b) => (b.tier==='featured' ? 1 : 0) - (a.tier==='featured' ? 1 : 0))

  return (
    <div>
      {/* Header */}
      <div style={{ background:'linear-gradient(160deg, #333B2C, #3D4535)', border:`1px solid ${B.border}`, borderRadius:8, padding:'40px 38px 36px', marginBottom:10, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-60, top:-60, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,152,46,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', maxWidth:600 }}>
          <div style={{ ...O, fontSize:10, letterSpacing:4, color:B.accent, marginBottom:8 }}>SALTGRASS</div>
          <h1 style={{ ...O, fontSize:40, letterSpacing:1, color:B.sun, margin:'0 0 12px', textTransform:'uppercase', lineHeight:1 }}>GUIDES</h1>
          <p style={{ fontSize:14, color:B.sub, margin:'0 0 6px', lineHeight:1.8, maxWidth:520 }}>
            Verified fishing guides, hunting outfitters, and outdoor services across Florida. Reviews only from members who actually booked them.
          </p>
          <p style={{ fontSize:12, color:B.dust, margin:'0 0 24px', lineHeight:1.7 }}>
            Guides list free. Featured & verified placement is $49/month. We take 10% on bookings made through Saltgrass.
          </p>
          <button onClick={() => setShowList(true)} style={{ background:B.accent, color:B.sil, border:'none', borderRadius:4, padding:'11px 24px', ...O, fontSize:13, fontWeight:600, letterSpacing:2, cursor:'pointer' }}>
            LIST YOUR BUSINESS — FREE
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, marginBottom:10 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)} style={{ flexShrink:0, padding:'6px 12px', borderRadius:3, ...O, fontSize:10, letterSpacing:2, cursor:'pointer', border:`2px solid ${category===c.id ? B.accent : B.border}`, background: category===c.id ? 'rgba(212,152,46,0.12)' : 'transparent', color: category===c.id ? B.accent : B.sub }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 220px', gap:10, alignItems:'start' }}>

        {/* Guide list */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(g => <GuideCard key={g.id} g={g} onBook={() => setBookGuide(g)} />)}
          {filtered.length === 0 && (
            <div style={{ background:B.card, borderRadius:8, padding:48, textAlign:'center', border:`1px solid ${B.border}` }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🔭</div>
              <div style={{ ...O, fontSize:18, letterSpacing:2, color:B.sun, marginBottom:8 }}>NONE LISTED YET</div>
              <div style={{ color:B.dust, fontSize:13, marginBottom:20 }}>Be the first guide in this area.</div>
              <button onClick={() => setShowList(true)} style={{ background:B.accent, color:B.sil, border:'none', borderRadius:4, padding:'11px 22px', ...O, fontSize:12, letterSpacing:2, cursor:'pointer' }}>
                LIST FREE
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ position:'sticky', top:72, display:'flex', flexDirection:'column', gap:10 }}>

          {/* Region filter */}
          <div style={{ background:B.card, borderRadius:6, border:`1px solid ${B.border}`, overflow:'hidden' }}>
            <div style={{ background:B.surf, padding:'9px 13px', borderBottom:`1px solid ${B.border}` }}>
              <div style={{ ...O, fontSize:9, letterSpacing:3, color:B.accent }}>FILTER BY REGION</div>
            </div>
            <div style={{ padding:'8px 12px', display:'flex', flexDirection:'column', gap:4 }}>
              <button onClick={() => setRegion('all')} style={{ padding:'7px 10px', borderRadius:3, border:`1.5px solid ${region==='all' ? B.accent : B.border}`, background: region==='all' ? 'rgba(212,152,46,0.1)' : 'transparent', color: region==='all' ? B.accent : B.sub, ...O, fontSize:10, letterSpacing:1, cursor:'pointer', textAlign:'left' as any }}>
                ALL FLORIDA
              </button>
              {REGIONS.map(r => (
                <button key={r.id} onClick={() => setRegion(r.id)} style={{ padding:'7px 10px', borderRadius:3, border:`1.5px solid ${region===r.id ? B.accent : B.border}`, background: region===r.id ? 'rgba(212,152,46,0.1)' : 'transparent', color: region===r.id ? B.accent : B.sub, ...O, fontSize:10, letterSpacing:1, cursor:'pointer', textAlign:'left' as any }}>
                  {r.icon} {r.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* For guides CTA */}
          <div style={{ background:B.card, borderRadius:6, border:`1px solid ${B.border}`, padding:16 }}>
            <div style={{ ...O, fontSize:10, letterSpacing:3, color:B.accent, marginBottom:10 }}>ARE YOU A GUIDE?</div>

            {[
              { plan:'FREE', price:'$0', desc:'Listed in directory, contact info, reviews', highlight:false },
              { plan:'FEATURED', price:'$49/mo', desc:'Top placement, verified badge, Book Now button\n10% on bookings via Saltgrass', highlight:true },
            ].map(p => (
              <div key={p.plan} style={{ padding:'10px 12px', borderRadius:4, border:`1.5px solid ${p.highlight ? B.accent : B.border}`, background: p.highlight ? 'rgba(212,152,46,0.08)' : 'transparent', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ ...O, fontSize:11, color:B.sun, letterSpacing:1 }}>{p.plan}</span>
                  <span style={{ ...O, fontSize:14, color: p.highlight ? B.accent : B.sub }}>{p.price}</span>
                </div>
                <div style={{ fontSize:10, color:B.dust, lineHeight:1.6, whiteSpace:'pre-line' }}>{p.desc}</div>
              </div>
            ))}

            <button onClick={() => setShowList(true)} style={{ width:'100%', background:'transparent', color:B.accent, border:`2px solid ${B.accent}`, borderRadius:4, padding:'10px', ...O, fontSize:11, letterSpacing:2, cursor:'pointer', marginTop:4 }}>
              LIST YOUR BUSINESS
            </button>
          </div>
        </div>
      </div>

      {bookGuide && <BookModal guide={bookGuide} onClose={() => setBookGuide(null)} />}
      {showList  && <ListModal onClose={() => setShowList(false)} />}
    </div>
  )
}
