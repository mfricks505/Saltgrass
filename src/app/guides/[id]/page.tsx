'use client'
// src/app/guides/[id]/page.tsx
// Guide profile + booking request + reviews.

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'

const B = { midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }
const PLATFORM_FEE_PCT = 0.10

export default function GuideDetail() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [guide, setGuide] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<any>(null)
  const [showBook, setShowBook] = useState(false)
  const [showReview, setShowReview] = useState(false)

  useEffect(()=>{ load() },[id])
  async function load() {
    setLoading(true)
    const { data:{ user } } = await supabase.auth.getUser()
    setMe(user)
    const { data:g } = await supabase.from('guides').select('*').eq('id',id).single()
    setGuide(g)
    const { data:r } = await supabase.from('guide_reviews').select('*').eq('guide_id',id).order('created_at',{ascending:false})
    setReviews(r ?? [])
    setLoading(false)
  }

  if (loading) return <div style={{ ...O, color:B.dust, letterSpacing:2, padding:40, textAlign:'center' }}>LOADING...</div>
  if (!guide) return <div style={{ color:B.dust, padding:40, textAlign:'center' }}>Guide not found.</div>

  const rm = REGIONS.find(r=>r.id===guide.region) ?? { icon:'📍', label:guide.region }
  const isMine = me?.id === guide.user_id

  return (
    <div style={{ maxWidth:720, margin:'0 auto' }}>
      <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:B.dust, cursor:'pointer', fontSize:13, marginBottom:12 }}>← Back to Guides</button>

      {/* Hero */}
      <div style={{ background:'linear-gradient(160deg,#0F1A0F,#141F14)', border:'1px solid #243824', borderRadius:10, padding:'28px 30px', marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            {guide.is_verified && <div style={{ ...O, fontSize:9, letterSpacing:2, color:'#5C8A4A', marginBottom:6 }}>✓ VERIFIED GUIDE</div>}
            <h1 style={{ ...O, fontSize:30, letterSpacing:0.5, color:B.bone, margin:'0 0 8px', lineHeight:1.1 }}>{guide.business_name || guide.name}</h1>
            <div style={{ fontSize:13, color:B.dust }}>{rm.icon} {rm.label}{guide.city?` · ${guide.city}, FL`:''}</div>
            <div style={{ marginTop:8, fontSize:13 }}>
              <span style={{ color:B.copper }}>{'★'.repeat(Math.floor(guide.rating||0))}{'☆'.repeat(5-Math.floor(guide.rating||0))}</span>
              <span style={{ color:B.dust, marginLeft:6 }}>{guide.rating?guide.rating.toFixed(1):'New'} {guide.review_count?`(${guide.review_count})`:''}</span>
            </div>
          </div>
          {guide.price_from && (
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:10, color:B.dust }}>FROM</div>
              <div style={{ ...O, fontSize:28, color:B.copper }}>${guide.price_from}</div>
            </div>
          )}
        </div>
        {guide.bio && <p style={{ fontSize:14, color:B.parchment, lineHeight:1.7, margin:'16px 0 0' }}>{guide.bio}</p>}
        {guide.tags?.length>0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:14 }}>
            {guide.tags.map((t:string)=><span key={t} style={{ background:B.moss, color:B.parchment, borderRadius:4, padding:'3px 10px', fontSize:11 }}>#{t}</span>)}
          </div>
        )}
        {!isMine && (
          <button onClick={()=>{ if(!me){router.push('/auth/login');return} setShowBook(true) }} style={{ marginTop:18, background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'13px 30px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer' }}>REQUEST A BOOKING</button>
        )}
      </div>

      {/* Contact (L2+ can see) */}
      {(guide.phone || guide.email || guide.website) && (
        <div style={{ background:B.forest, borderRadius:8, padding:'14px 18px', marginBottom:10, border:'1px solid #243824', display:'flex', gap:18, flexWrap:'wrap', fontSize:13 }}>
          {guide.phone && <span style={{ color:B.parchment }}>📞 {guide.phone}</span>}
          {guide.email && <span style={{ color:B.parchment }}>✉️ {guide.email}</span>}
          {guide.website && <a href={guide.website} target="_blank" rel="noopener noreferrer" style={{ color:B.copper, textDecoration:'none' }}>🌐 Website</a>}
        </div>
      )}

      {/* Reviews */}
      <div id="reviews" style={{ background:B.forest, borderRadius:8, padding:'18px 20px', border:'1px solid #243824' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ ...O, fontSize:14, letterSpacing:1, color:B.bone }}>REVIEWS ({reviews.length})</div>
          {me && !isMine && <button onClick={()=>setShowReview(true)} style={{ background:'transparent', color:B.copper, border:`1.5px solid ${B.copper}`, borderRadius:5, padding:'7px 14px', ...O, fontSize:10, letterSpacing:1, cursor:'pointer' }}>+ WRITE REVIEW</button>}
        </div>
        {reviews.length===0 ? <div style={{ fontSize:13, color:B.dust }}>No reviews yet. Booked with them? Be the first.</div> :
          reviews.map(r=>(
            <div key={r.id} style={{ padding:'12px 0', borderBottom:'1px solid #243824' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:13, color:B.bone, fontWeight:600 }}>@{r.username}</span>
                <span style={{ color:B.copper, fontSize:12 }}>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)}</span>
              </div>
              {r.body && <div style={{ fontSize:13, color:B.parchment, lineHeight:1.6 }}>{r.body}</div>}
            </div>
          ))}
      </div>

      {showBook && <BookModal guide={guide} me={me} onClose={()=>setShowBook(false)} onBooked={()=>{ setShowBook(false); alert('Booking request sent! The guide will confirm. Payment activates with Stripe.') }} />}
      {showReview && <ReviewModal guide={guide} me={me} onClose={()=>setShowReview(false)} onDone={()=>{ setShowReview(false); load() }} />}
    </div>
  )
}

function BookModal({ guide, me, onClose, onBooked }:{ guide:any; me:any; onClose:()=>void; onBooked:()=>void }) {
  const supabase = createClient()
  const [date, setDate] = useState('')
  const [party, setParty] = useState('2')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const rate = (guide.price_from || 0) * 100        // cents
  const fee = Math.round(rate * PLATFORM_FEE_PCT)
  const total = rate + fee

  async function submit() {
    setErr('')
    if (!date) { setErr('Pick a date'); return }
    setBusy(true)
    const { error } = await supabase.from('guide_bookings').insert({
      guide_id: guide.id, user_id: me.id, trip_date: date,
      party_size: parseInt(party)||1, note: note.trim()||null,
      guide_rate: rate, platform_fee: fee, total, status:'inquiry',
    })
    if (error) { setErr(error.message); setBusy(false); return }
    onBooked()
  }

  return (
    <Modal onClose={onClose} title="REQUEST A BOOKING">
      <Field label="TRIP DATE"><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp} /></Field>
      <Field label="PARTY SIZE"><input type="number" value={party} onChange={e=>setParty(e.target.value)} style={inp} /></Field>
      <Field label="NOTE TO GUIDE"><textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="What you're after, experience level, questions..." style={{...inp, resize:'vertical'}} /></Field>
      {guide.price_from ? (
        <div style={{ background:B.midnight, borderRadius:6, padding:'12px 14px', marginBottom:12, fontSize:13 }}>
          <Row l="Guide rate (from)" v={`$${guide.price_from}`} />
          <Row l="Platform fee (10%)" v={`$${(fee/100).toFixed(0)}`} />
          <div style={{ display:'flex', justifyContent:'space-between', ...O, fontSize:14, color:B.copper, borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:8, marginTop:6 }}>
            <span>EST. TOTAL</span><span>${(total/100).toFixed(0)}</span>
          </div>
          <div style={{ fontSize:11, color:B.dust, marginTop:8, lineHeight:1.5 }}>Final price confirmed by the guide. Fee covers secure payment + dispute resolution.</div>
        </div>
      ) : null}
      {err && <div style={{ fontSize:12, color:'#E07A7A', marginBottom:10, textAlign:'center' }}>{err}</div>}
      <button onClick={submit} disabled={busy} style={{ width:'100%', background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'13px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', opacity:busy?0.7:1 }}>{busy?'SENDING...':'SEND BOOKING REQUEST'}</button>
    </Modal>
  )
}

function ReviewModal({ guide, me, onClose, onDone }:{ guide:any; me:any; onClose:()=>void; onDone:()=>void }) {
  const supabase = createClient()
  const [stars, setStars] = useState(5)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    setErr(''); setBusy(true)
    const { data:profile } = await supabase.from('profiles').select('username').eq('id',me.id).single()
    const { error } = await supabase.from('guide_reviews').insert({
      guide_id: guide.id, user_id: me.id, username: profile?.username??'member', stars, body: body.trim()||null,
    })
    if (error) { setErr(error.message.includes('duplicate')?"You've already reviewed this guide.":error.message); setBusy(false); return }
    onDone()
  }

  return (
    <Modal onClose={onClose} title="WRITE A REVIEW">
      <div style={{ display:'flex', gap:6, marginBottom:14, justifyContent:'center' }}>
        {[1,2,3,4,5].map(s=>(
          <button key={s} onClick={()=>setStars(s)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:30, color:s<=stars?B.copper:B.dust, padding:0 }}>★</button>
        ))}
      </div>
      <Field label="YOUR REVIEW"><textarea value={body} onChange={e=>setBody(e.target.value)} rows={4} placeholder="How was the trip? Be honest and specific." style={{...inp, resize:'vertical'}} /></Field>
      {err && <div style={{ fontSize:12, color:'#E07A7A', marginBottom:10, textAlign:'center' }}>{err}</div>}
      <button onClick={submit} disabled={busy} style={{ width:'100%', background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'13px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', opacity:busy?0.7:1 }}>{busy?'POSTING...':'POST REVIEW'}</button>
    </Modal>
  )
}

// shared bits
const inp:any = { width:'100%', background:B.midnight, border:'1px solid rgba(255,255,255,0.15)', borderRadius:5, color:B.bone, padding:'10px 12px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }
function Field({ label, children }:{ label:string; children:any }) {
  return <div style={{ marginBottom:12 }}><div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>{label}</div>{children}</div>
}
function Row({ l, v }:{ l:string; v:string }) {
  return <div style={{ display:'flex', justifyContent:'space-between', color:B.parchment, marginBottom:5 }}><span>{l}</span><span>{v}</span></div>
}
function Modal({ title, children, onClose }:{ title:string; children:any; onClose:()=>void }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:800, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:16, overflowY:'auto' }}>
      <div style={{ background:B.forest, borderRadius:10, padding:24, maxWidth:440, width:'100%', border:`1px solid ${B.canopy}`, margin:'24px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div style={{ ...O, fontSize:18, letterSpacing:2, color:B.bone }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:B.dust, fontSize:22, cursor:'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
