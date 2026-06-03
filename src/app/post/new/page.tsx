'use client'
// src/app/post/new/page.tsx
// The Board composer — pick a type, write it, optionally tag conditions, post.
// Photos run through the GPS scrubber.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'
import { POST_TYPES, getPostType } from '@/lib/post-types'
import SecurePhotoUpload from '@/components/SecurePhotoUpload'

const B = {
  midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', canopy:'#243824',
  copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358',
}
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

export default function NewPostPage() {
  const router = useRouter()
  const supabase = createClient()
  const [type, setType]       = useState('report')
  const [title, setTitle]     = useState('')
  const [body, setBody]       = useState('')
  const [region, setRegion]   = useState('panhandle')
  const [photo, setPhoto]     = useState<File | null>(null)
  const [tagConditions, setTagConditions] = useState(false)
  const [conditions, setConditions] = useState<any>(null)
  const [posting, setPosting] = useState(false)
  const [error, setError]     = useState('')

  // recipe-specific
  const [ingredients, setIngredients] = useState('')
  const [steps, setSteps] = useState('')

  const pt = getPostType(type)

  async function pullConditions() {
    setTagConditions(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/rundown?region=${region}&boatType=center_console&zone=inshore`)
      const d = await res.json()
      setConditions({
        wind: `${d.wind?.speed_kts ?? '–'}kt ${d.wind?.direction ?? ''}`,
        waves: `${d.waves?.height_ft ?? '–'}ft`,
        water_temp: d.water?.temp_f ? `${d.water.temp_f}°F` : null,
        moon: d.moon?.phase,
        tide: d.tides?.[0] ? `${d.tides[0].type === 'H' ? 'High' : 'Low'} ${d.tides[0].time}` : null,
      })
    } catch {}
  }

  async function submit() {
    setError('')
    if (!body.trim() && type !== 'recipe') { setError('Write something first'); return }
    if (type === 'recipe' && (!title.trim() || !ingredients.trim())) { setError('Recipe needs a title and ingredients'); return }
    setPosting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      let photo_url = null
      if (photo) {
        const path = `${user.id}/${Date.now()}.jpg`
        const { error: upErr } = await supabase.storage.from('wall-photos').upload(path, photo, { contentType: 'image/jpeg' })
        if (!upErr) {
          photo_url = supabase.storage.from('wall-photos').getPublicUrl(path).data.publicUrl
        }
      }

      const insert: any = {
        user_id: user.id,
        post_type: type,
        body: body.trim(),
        region_id: region,
        photo_url,
      }
      if (title.trim()) insert.title = title.trim()
      if (tagConditions && conditions) insert.conditions = conditions
      if (type === 'recipe') {
        insert.recipe_data = {
          ingredients: ingredients.split('\n').filter(Boolean),
          steps: steps.split('\n').filter(Boolean),
        }
      }

      const { error: insErr } = await supabase.from('posts').insert(insert)
      if (insErr) { setError(insErr.message); setPosting(false); return }

      router.push('/')
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
      setPosting(false)
    }
  }

  return (
    <div style={{ maxWidth:600, margin:'0 auto' }}>
      <div style={{ ...O, fontSize:24, letterSpacing:2, color:B.bone, margin:'8px 0 16px' }}>POST TO THE BOARD</div>

      {/* Type picker */}
      <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:8 }}>WHAT KIND OF POST?</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:18 }}>
        {POST_TYPES.map(t => (
          <button key={t.id} onClick={() => setType(t.id)} style={{ padding:'12px 8px', borderRadius:6, border:`2px solid ${type===t.id ? t.color : 'rgba(255,255,255,0.08)'}`, background:type===t.id ? `${t.color}22` : 'transparent', color:type===t.id ? t.color : B.parchment, cursor:'pointer', textAlign:'center' }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{t.icon}</div>
            <div style={{ ...O, fontSize:10, letterSpacing:1 }}>{t.label.toUpperCase()}</div>
          </button>
        ))}
      </div>

      {/* Title (recipes + optional for others) */}
      {(type === 'recipe' || type === 'alert' || type === 'question') && (
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder={type==='recipe' ? 'Recipe name — Blackened Redfish' : type==='alert' ? 'Alert headline' : 'Your question in one line'} style={{ width:'100%', background:B.forest, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:6, color:B.bone, padding:'12px 14px', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:10, fontFamily:'Inter,sans-serif' }} />
      )}

      {/* Body */}
      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder={pt.placeholder} rows={5} style={{ width:'100%', background:B.forest, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:6, color:B.bone, padding:'12px 14px', fontSize:15, outline:'none', boxSizing:'border-box', resize:'vertical', marginBottom:12, fontFamily:'Inter,sans-serif', lineHeight:1.6 }} />

      {/* Recipe fields */}
      {type === 'recipe' && (
        <>
          <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>INGREDIENTS (one per line)</div>
          <textarea value={ingredients} onChange={e => setIngredients(e.target.value)} placeholder={"2 redfish fillets\n1 tbsp blackening seasoning\n..."} rows={4} style={{ width:'100%', background:B.forest, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:6, color:B.bone, padding:'12px 14px', fontSize:14, outline:'none', boxSizing:'border-box', resize:'vertical', marginBottom:12, fontFamily:'Inter,sans-serif', lineHeight:1.6 }} />
          <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>STEPS (one per line)</div>
          <textarea value={steps} onChange={e => setSteps(e.target.value)} placeholder={"Season the fillets\nHeat the skillet...\n..."} rows={4} style={{ width:'100%', background:B.forest, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:6, color:B.bone, padding:'12px 14px', fontSize:14, outline:'none', boxSizing:'border-box', resize:'vertical', marginBottom:12, fontFamily:'Inter,sans-serif', lineHeight:1.6 }} />
        </>
      )}

      {/* Photo */}
      {pt.hasPhoto && (
        <div style={{ marginBottom:12 }}>
          <SecurePhotoUpload onPhotoReady={setPhoto} label="ADD PHOTO" />
        </div>
      )}

      {/* Region */}
      <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>REGION</div>
      <select value={region} onChange={e => setRegion(e.target.value)} style={{ width:'100%', background:B.forest, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:6, color:B.bone, padding:'12px 14px', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:14, fontFamily:'Inter,sans-serif' }}>
        {REGIONS.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
      </select>

      {/* Conditions tag (reports only) */}
      {pt.hasConditions && (
        <div style={{ marginBottom:16 }}>
          {!tagConditions ? (
            <button onClick={pullConditions} style={{ width:'100%', background:'transparent', border:`1.5px solid rgba(74,142,194,0.4)`, borderRadius:6, padding:'12px', color:'#4A8EC2', ...O, fontSize:11, letterSpacing:2, cursor:'pointer' }}>
              🌤️ TAG TODAY'S CONDITIONS
            </button>
          ) : conditions ? (
            <div style={{ background:'rgba(30,42,64,0.5)', border:`1px solid rgba(74,142,194,0.3)`, borderRadius:6, padding:'12px 14px' }}>
              <div style={{ ...O, fontSize:9, letterSpacing:2, color:'#4A8EC2', marginBottom:6 }}>CONDITIONS ATTACHED</div>
              <div style={{ fontSize:12, color:B.parchment, display:'flex', gap:12, flexWrap:'wrap' }}>
                <span>💨 {conditions.wind}</span>
                <span>🌊 {conditions.waves}</span>
                {conditions.water_temp && <span>🌡 {conditions.water_temp}</span>}
                {conditions.tide && <span>🌊 {conditions.tide}</span>}
                {conditions.moon && <span>🌙 {conditions.moon}</span>}
              </div>
            </div>
          ) : (
            <div style={{ fontSize:12, color:B.dust, textAlign:'center', padding:8 }}>Loading conditions...</div>
          )}
        </div>
      )}

      {error && <div style={{ fontSize:12, color:'#E07A7A', marginBottom:12, textAlign:'center' }}>{error}</div>}

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={submit} disabled={posting} style={{ flex:1, background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'14px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', opacity:posting?0.7:1 }}>
          {posting ? 'POSTING...' : 'POST TO THE BOARD'}
        </button>
        <button onClick={() => router.back()} style={{ background:'transparent', color:B.parchment, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:6, padding:'14px 20px', ...O, fontSize:12, letterSpacing:1, cursor:'pointer' }}>CANCEL</button>
      </div>
    </div>
  )
}
