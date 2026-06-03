'use client'
// src/app/market/sell/page.tsx
// List gear. Photos GPS-scrubbed. $4.99 listing fee via Stripe (paywall built,
// activates when Stripe is live). No firearms.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'
import SecurePhotoUpload from '@/components/SecurePhotoUpload'

const B = { midnight:'#0A0C08', forest:'#141F14', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

const CATEGORIES = [
  { id:'rods_reels', label:'Rods & Reels', icon:'🎣' },
  { id:'boats', label:'Boats', icon:'⛵' },
  { id:'optics', label:'Optics', icon:'🔭' },
  { id:'archery', label:'Archery', icon:'🏹' },
  { id:'electronics', label:'Electronics', icon:'📡' },
  { id:'clothing', label:'Clothing & Waders', icon:'🥾' },
  { id:'other', label:'Other Gear', icon:'📦' },
]
const CONDITIONS = ['New','Like New','Excellent','Good','Fair','For Parts']
const LISTING_FEE = 4.99

export default function SellPage() {
  const router = useRouter()
  const supabase = createClient()
  const [photos, setPhotos] = useState<File[]>([])
  const [f, setF] = useState({ title:'', description:'', price:'', category:'rods_reels', condition:'Good', region:'panhandle', city:'', shipping:'local_only', featured:false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const set = (k:string,v:any)=>setF(p=>({...p,[k]:v}))

  const total = LISTING_FEE + (f.featured ? 2.99 : 0)

  async function submit() {
    setError('')
    if (!f.title.trim()) return setError('Add a title')
    if (!f.price || isNaN(Number(f.price))) return setError('Add a valid price')
    if (photos.length === 0) return setError('Add at least one photo')
    setSubmitting(true)
    try {
      const { data:{ user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      // Upload scrubbed photos
      const urls: string[] = []
      for (const photo of photos) {
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
        const { error:upErr } = await supabase.storage.from('wall-photos').upload(path, photo, { contentType:'image/jpeg' })
        if (!upErr) urls.push(supabase.storage.from('wall-photos').getPublicUrl(path).data.publicUrl)
      }

      const { data:profile } = await supabase.from('profiles').select('username').eq('id',user.id).single()

      const { data:listing, error:insErr } = await supabase.from('listings').insert({
        seller_id: user.id,
        seller_username: profile?.username ?? 'seller',
        title: f.title.trim(),
        description: f.description.trim() || null,
        price: Math.round(Number(f.price)),
        category: f.category,
        condition: f.condition,
        region: f.region,
        city: f.city.trim() || null,
        shipping: f.shipping,
        photos: urls,
        is_featured: f.featured,
        paid: false,       // flips true after Stripe payment succeeds
        status: 'active',  // visible immediately; gated on payment once Stripe live
      }).select().single()
      if (insErr) { setError(insErr.message); setSubmitting(false); return }

      // ── Stripe checkout for the listing fee ──
      // When Stripe is live, this redirects to checkout. Until then, the
      // listing is already created above so the flow works end-to-end.
      try {
        const res = await fetch('/api/stripe/create-checkout-session', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            type:'market_listing',
            listingId: listing.id,
            featured: f.featured,
          }),
        })
        if (res.ok) {
          const { url } = await res.json()
          if (url) { window.location.href = url; return }   // → Stripe checkout
        }
      } catch {}

      // Stripe not live yet — listing is up, continue to dashboard
      router.push('/market/dashboard')
    } catch (e:any) {
      setError(e.message ?? 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth:600, margin:'0 auto' }}>
      <div style={{ ...O, fontSize:24, letterSpacing:2, color:B.bone, margin:'8px 0 4px' }}>LIST YOUR GEAR</div>
      <div style={{ fontSize:13, color:B.dust, marginBottom:18 }}>Sell to verified Florida outdoorsmen. No scammers, no lowballers.</div>

      <div style={{ marginBottom:16 }}>
        <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>PHOTOS</div>
        <SecurePhotoUpload onPhotoReady={(file)=>setPhotos(p=>[...p,file])} label="ADD PHOTO" />
        {photos.length > 0 && <div style={{ fontSize:11, color:B.copper, marginTop:6 }}>{photos.length} photo{photos.length>1?'s':''} added · location data stripped</div>}
      </div>

      {[
        { k:'title', label:'TITLE', ph:'Shimano Stradic 3000 — Like New' },
        { k:'price', label:'PRICE ($)', ph:'185', type:'number' },
        { k:'city', label:'CITY (for local search)', ph:'Pensacola' },
      ].map(field => (
        <div key={field.k} style={{ marginBottom:12 }}>
          <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>{field.label}</div>
          <input type={field.type||'text'} value={(f as any)[field.k]} onChange={e=>set(field.k,e.target.value)} placeholder={field.ph} style={{ width:'100%', background:B.forest, border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, color:B.bone, padding:'12px 14px', fontSize:15, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }} />
        </div>
      ))}

      <div style={{ marginBottom:12 }}>
        <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>DESCRIPTION</div>
        <textarea value={f.description} onChange={e=>set('description',e.target.value)} rows={4} placeholder="Condition details, age, why you're selling, what's included..." style={{ width:'100%', background:B.forest, border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, color:B.bone, padding:'12px 14px', fontSize:15, outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:'Inter,sans-serif', lineHeight:1.6 }} />
      </div>

      <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>CATEGORY</div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
        {CATEGORIES.map(c=>(
          <button key={c.id} onClick={()=>set('category',c.id)} style={{ padding:'8px 12px', borderRadius:16, border:`1.5px solid ${f.category===c.id?B.copper:'rgba(255,255,255,0.1)'}`, background:f.category===c.id?'rgba(200,146,42,0.15)':'transparent', color:f.category===c.id?B.copper:B.parchment, cursor:'pointer', fontSize:12, fontFamily:'Inter,sans-serif' }}>{c.icon} {c.label}</button>
        ))}
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        <div style={{ flex:1 }}>
          <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>CONDITION</div>
          <select value={f.condition} onChange={e=>set('condition',e.target.value)} style={{ width:'100%', background:B.forest, border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, color:B.bone, padding:'12px', fontSize:14, outline:'none', fontFamily:'Inter,sans-serif' }}>
            {CONDITIONS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>REGION</div>
          <select value={f.region} onChange={e=>set('region',e.target.value)} style={{ width:'100%', background:B.forest, border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, color:B.bone, padding:'12px', fontSize:14, outline:'none', fontFamily:'Inter,sans-serif' }}>
            {REGIONS.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>SHIPPING</div>
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[{id:'local_only',l:'📍 Local Only'},{id:'both',l:'📍 Local + 📦 Ships'},{id:'shipping_only',l:'📦 Ships Only'}].map(s=>(
          <button key={s.id} onClick={()=>set('shipping',s.id)} style={{ flex:1, padding:'10px', borderRadius:6, border:`1.5px solid ${f.shipping===s.id?B.copper:'rgba(255,255,255,0.1)'}`, background:f.shipping===s.id?'rgba(200,146,42,0.12)':'transparent', color:f.shipping===s.id?B.copper:B.parchment, cursor:'pointer', fontSize:11, fontFamily:'Inter,sans-serif' }}>{s.l}</button>
        ))}
      </div>

      {/* Featured bump */}
      <button onClick={()=>set('featured',!f.featured)} style={{ width:'100%', textAlign:'left', background:f.featured?'rgba(200,146,42,0.12)':B.forest, border:`1.5px solid ${f.featured?B.copper:'rgba(255,255,255,0.1)'}`, borderRadius:8, padding:'14px', marginBottom:16, cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ fontSize:20 }}>{f.featured?'⭐':'☆'}</span>
        <div style={{ flex:1 }}>
          <div style={{ ...O, fontSize:12, letterSpacing:1, color:f.featured?B.copper:B.bone }}>FEATURE THIS LISTING (+$2.99)</div>
          <div style={{ fontSize:11, color:B.dust, marginTop:2 }}>Pinned to the top of its category for 7 days</div>
        </div>
      </button>

      {/* Fee summary */}
      <div style={{ background:B.midnight, border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'14px 16px', marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:B.parchment, marginBottom:6 }}>
          <span>Listing fee</span><span>${LISTING_FEE.toFixed(2)}</span>
        </div>
        {f.featured && (
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:B.parchment, marginBottom:6 }}>
            <span>Featured bump</span><span>$2.99</span>
          </div>
        )}
        <div style={{ display:'flex', justifyContent:'space-between', ...O, fontSize:14, letterSpacing:1, color:B.copper, borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:8, marginTop:4 }}>
          <span>TOTAL</span><span>${total.toFixed(2)}</span>
        </div>
        <div style={{ fontSize:11, color:B.dust, marginTop:8, lineHeight:1.5 }}>
          One-time fee to list. No commission on the sale — what you sell it for is yours. Secure pay with buyer protection optional at checkout (5%).
        </div>
      </div>

      {error && <div style={{ fontSize:12, color:'#E07A7A', marginBottom:12, textAlign:'center' }}>{error}</div>}

      <button onClick={submit} disabled={submitting} style={{ width:'100%', background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'14px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', opacity:submitting?0.7:1 }}>
        {submitting?'POSTING...':`POST LISTING · $${total.toFixed(2)}`}
      </button>
      <div style={{ fontSize:11, color:B.dust, textAlign:'center', marginTop:10 }}>🔒 GPS location is stripped from every photo automatically.</div>
    </div>
  )
}
