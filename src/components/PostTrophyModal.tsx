'use client'
// src/components/PostTrophyModal.tsx
// The "post a trophy" flow for The Wall.
// Photo goes through SecurePhotoUpload → GPS scrubbed before it ever uploads.

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'
import SecurePhotoUpload from '@/components/SecurePhotoUpload'

const B = {
  midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824',
  copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358',
}
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

const CATEGORIES = [
  { id:'fish', label:'FISH', icon:'🎣' }, { id:'deer', label:'DEER', icon:'🦌' },
  { id:'hog', label:'HOG', icon:'🐗' }, { id:'turkey', label:'TURKEY', icon:'🦃' },
  { id:'waterfowl', label:'WATERFOWL', icon:'🦆' }, { id:'other', label:'OTHER', icon:'🏕️' },
]

export default function PostTrophyModal({ onClose, onPosted }: { onClose: () => void; onPosted: () => void }) {
  const supabase = createClient()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [form, setForm] = useState({ category:'fish', title:'', species:'', weight:'', method:'', region:'panhandle' })
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const set = (k:string, v:string) => setForm(f => ({ ...f, [k]: v }))

  async function submit() {
    setError('')
    if (!photoFile) { setError('Add a photo of your trophy'); return }
    if (!form.title.trim()) { setError('Give it a title'); return }
    setPosting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Sign in to post'); setPosting(false); return }

      // Upload the already-scrubbed photo to the user's folder
      const ext = 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('wall-photos').upload(path, photoFile, { contentType: 'image/jpeg' })
      if (upErr) { setError('Photo upload failed: ' + upErr.message); setPosting(false); return }

      const { data: urlData } = supabase.storage.from('wall-photos').getPublicUrl(path)

      // Get username
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()

      const { error: insErr } = await supabase.from('wall_posts').insert({
        user_id: user.id,
        username: profile?.username ?? 'angler',
        category: form.category,
        title: form.title.trim(),
        species: form.species.trim() || null,
        weight: form.weight.trim() || null,
        method: form.method.trim() || null,
        region: form.region,
        photo_url: urlData.publicUrl,
      })
      if (insErr) { setError(insErr.message); setPosting(false); return }

      onPosted()
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
      setPosting(false)
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:800, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:16, overflowY:'auto' }}>
      <div style={{ background:B.forest, borderRadius:10, padding:24, maxWidth:480, width:'100%', border:`1px solid ${B.canopy}`, marginTop:20, marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div style={{ ...O, fontSize:20, letterSpacing:2, color:B.bone }}>POST YOUR TROPHY</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:B.dust, fontSize:22, cursor:'pointer' }}>✕</button>
        </div>

        {/* Photo — scrubbed automatically */}
        <div style={{ marginBottom:16 }}>
          <SecurePhotoUpload onPhotoReady={setPhotoFile} label="ADD TROPHY PHOTO" />
        </div>

        {/* Category */}
        <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>CATEGORY</div>
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => set('category', c.id)} style={{ padding:'7px 12px', borderRadius:16, border:`1.5px solid ${form.category===c.id ? B.copper : 'rgba(255,255,255,0.1)'}`, background:form.category===c.id ? 'rgba(200,146,42,0.15)' : 'transparent', color:form.category===c.id ? B.copper : B.parchment, cursor:'pointer', fontSize:12, fontFamily:'Inter,sans-serif' }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>

        {/* Fields */}
        {[
          { k:'title', label:'TITLE', ph:'28lb Redfish on the flats', req:true },
          { k:'species', label:'SPECIES', ph:'Redfish', req:false },
          { k:'weight', label:'WEIGHT / SIZE', ph:'28 lbs or 32"', req:false },
          { k:'method', label:'METHOD', ph:'Fly rod, live bait, jigging...', req:false },
        ].map(f => (
          <div key={f.k} style={{ marginBottom:12 }}>
            <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>{f.label}{f.req && <span style={{ color:B.copper }}> *</span>}</div>
            <input value={(form as any)[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={{ width:'100%', background:B.midnight, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:5, color:B.bone, padding:'11px 13px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }} />
          </div>
        ))}

        {/* Region */}
        <div style={{ marginBottom:16 }}>
          <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:5 }}>REGION</div>
          <select value={form.region} onChange={e => set('region', e.target.value)} style={{ width:'100%', background:B.midnight, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:5, color:B.bone, padding:'11px 13px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }}>
            {REGIONS.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
          </select>
        </div>

        {error && <div style={{ fontSize:12, color:'#E07A7A', marginBottom:12, textAlign:'center' }}>{error}</div>}

        <button onClick={submit} disabled={posting} style={{ width:'100%', background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'14px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', opacity:posting?0.7:1 }}>
          {posting ? 'POSTING...' : 'POST TO THE WALL'}
        </button>

        <div style={{ fontSize:11, color:B.dust, textAlign:'center', marginTop:10, lineHeight:1.5 }}>
          🔒 GPS location is stripped from your photo automatically. Your spot stays yours.
        </div>
      </div>
    </div>
  )
}
