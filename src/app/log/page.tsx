'use client'
// src/app/log/page.tsx
// The Catch Log — log a catch in seconds, conditions auto-snapshot.
// Shows detected patterns ("your moat") + season stats + history.

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { REGION_COORDS, ZONES } from '@/lib/marine'

const B = {
  midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', copper:'#C8922A',
  bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358',
}
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

const COMMON_SPECIES = ['Redfish','Speckled Trout','Snook','Flounder','Sheepshead','Tarpon','Cobia','Spanish Mackerel','King Mackerel','Grouper','Snapper','Mahi','Tripletail','Pompano','Black Drum']
const TIDE_STAGES = ['incoming','outgoing','high','low','slack']

export default function CatchLogPage() {
  const supabase = createClient()
  const [catches, setCatches]   = useState<any[]>([])
  const [patterns, setPatterns] = useState<string[]>([])
  const [stats, setStats]       = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)

  const [form, setForm] = useState({
    species:'', length_in:'', tide_stage:'', region:'panhandle', zone:'inshore', released:true, notes:'',
  })
  const set = (k:string, v:any) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/catch`)
      const json = await res.json()
      setCatches(json.catches ?? [])
      setPatterns(json.patterns ?? [])
      setStats(json.stats ?? null)
    } catch {}
    setLoading(false)
  }

  async function logCatch() {
    if (!form.species) return
    setSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/catch`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, length_in: form.length_in ? Number(form.length_in) : null }),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ species:'', length_in:'', tide_stage:'', region:'panhandle', zone:'inshore', released:true, notes:'' })
        load()
      } else if (res.status === 401) {
        alert('Sign in to log catches')
      }
    } catch {}
    setSaving(false)
  }

  return (
    <div style={{ maxWidth:680, margin:'0 auto' }}>
      {/* Header + stats */}
      <div style={{ padding:'8px 4px 14px' }}>
        <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.copper }}>YOUR MOAT</div>
        <div style={{ ...O, fontSize:28, color:B.bone, letterSpacing:1, lineHeight:1.1, marginTop:2 }}>THE CATCH LOG</div>
        <div style={{ fontSize:13, color:B.parchment, marginTop:6, lineHeight:1.6 }}>
          Log every catch. We save the conditions automatically. The more you log, the more it learns your bite.
        </div>
      </div>

      {/* Season stats */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:10 }}>
          {[
            { label:'TRIPS', val:stats.total_trips ?? 0 },
            { label:'FISH', val:stats.total_catches ?? 0 },
            { label:'SPECIES', val:stats.species_count ?? 0 },
            { label:'BIGGEST', val:stats.biggest_length ? `${stats.biggest_length}"` : '–' },
          ].map(s => (
            <div key={s.label} style={{ background:B.forest, borderRadius:6, padding:'12px 8px', textAlign:'center', border:`1px solid rgba(255,255,255,0.05)` }}>
              <div style={{ ...O, fontSize:22, color:B.copper, lineHeight:1 }}>{s.val}</div>
              <div style={{ ...O, fontSize:8, letterSpacing:2, color:B.dust, marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Log button */}
      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width:'100%', background:B.copper, color:'#1A1208', border:'none', borderRadius:8, padding:'15px', ...O, fontSize:14, letterSpacing:2, cursor:'pointer', marginBottom:10 }}>
          🎣 LOG A CATCH
        </button>
      )}

      {/* Log form */}
      {showForm && (
        <div style={{ background:B.forest, borderRadius:8, padding:'18px', marginBottom:10, border:`1px solid ${B.copper}44` }}>
          <div style={{ ...O, fontSize:12, letterSpacing:2, color:B.copper, marginBottom:14 }}>WHAT'D YOU GET?</div>

          {/* Species chips */}
          <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>SPECIES</div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
            {COMMON_SPECIES.map(s => (
              <button key={s} onClick={() => set('species', s)} style={{ padding:'6px 12px', borderRadius:16, border:`1.5px solid ${form.species===s ? B.copper : 'rgba(255,255,255,0.1)'}`, background:form.species===s ? 'rgba(200,146,42,0.15)' : 'transparent', color:form.species===s ? B.copper : B.parchment, cursor:'pointer', fontSize:12, fontFamily:'Inter,sans-serif' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Length + tide */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            <div>
              <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>LENGTH (IN)</div>
              <input value={form.length_in} onChange={e => set('length_in', e.target.value.replace(/[^0-9.]/g,''))} placeholder="27" inputMode="decimal" style={{ width:'100%', background:B.midnight, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:5, color:B.bone, padding:'10px 12px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }} />
            </div>
            <div>
              <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>TIDE</div>
              <select value={form.tide_stage} onChange={e => set('tide_stage', e.target.value)} style={{ width:'100%', background:B.midnight, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:5, color:form.tide_stage?B.bone:B.dust, padding:'10px 12px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }}>
                <option value="">Select...</option>
                {TIDE_STAGES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Region + zone */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            <div>
              <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>REGION</div>
              <select value={form.region} onChange={e => set('region', e.target.value)} style={{ width:'100%', background:B.midnight, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:5, color:B.bone, padding:'10px 12px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }}>
                {Object.entries(REGION_COORDS).map(([id, r]) => <option key={id} value={id}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <div style={{ ...O, fontSize:9, letterSpacing:2, color:B.dust, marginBottom:6 }}>ZONE</div>
              <select value={form.zone} onChange={e => set('zone', e.target.value)} style={{ width:'100%', background:B.midnight, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:5, color:B.bone, padding:'10px 12px', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'Inter,sans-serif' }}>
                {(['inshore','nearshore','offshore'] as const).map(z => <option key={z} value={z}>{ZONES[z].label}</option>)}
              </select>
            </div>
          </div>

          {/* Released toggle */}
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <button onClick={() => set('released', true)} style={{ flex:1, padding:'9px', borderRadius:5, border:`1.5px solid ${form.released ? B.copper : 'rgba(255,255,255,0.1)'}`, background:form.released ? 'rgba(200,146,42,0.12)' : 'transparent', color:form.released ? B.copper : B.parchment, cursor:'pointer', ...O, fontSize:11, letterSpacing:1 }}>RELEASED</button>
            <button onClick={() => set('released', false)} style={{ flex:1, padding:'9px', borderRadius:5, border:`1.5px solid ${!form.released ? B.copper : 'rgba(255,255,255,0.1)'}`, background:!form.released ? 'rgba(200,146,42,0.12)' : 'transparent', color:!form.released ? B.copper : B.parchment, cursor:'pointer', ...O, fontSize:11, letterSpacing:1 }}>KEPT</button>
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <button onClick={logCatch} disabled={!form.species || saving} style={{ flex:1, background:form.species ? B.copper : 'rgba(255,255,255,0.08)', color:form.species ? '#1A1208' : B.dust, border:'none', borderRadius:6, padding:'13px', ...O, fontSize:13, letterSpacing:2, cursor:form.species ? 'pointer' : 'not-allowed', opacity:saving?0.7:1 }}>
              {saving ? 'SAVING...' : 'SAVE CATCH'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background:'transparent', color:B.parchment, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:6, padding:'13px 18px', ...O, fontSize:12, letterSpacing:1, cursor:'pointer' }}>CANCEL</button>
          </div>
        </div>
      )}

      {/* PATTERNS — the wow */}
      {patterns.length > 0 && (
        <div style={{ background:`linear-gradient(160deg, #1E2A40, #243252)`, borderRadius:8, padding:'16px 18px', marginBottom:10, border:`1px solid rgba(74,142,194,0.25)` }}>
          <div style={{ ...O, fontSize:11, letterSpacing:2, color:'#4A8EC2', marginBottom:10 }}>🧠 YOUR BITE PATTERNS</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {patterns.map((p, i) => (
              <div key={i} style={{ fontSize:13, color:B.bone, lineHeight:1.6, paddingLeft:18, position:'relative' }}>
                <span style={{ position:'absolute', left:0, color:'#4A8EC2' }}>▸</span>{p}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {loading ? (
        <div style={{ background:B.forest, borderRadius:8, padding:30, textAlign:'center', color:B.dust, ...O, letterSpacing:2 }}>LOADING...</div>
      ) : catches.length === 0 ? (
        <div style={{ textAlign:'center', padding:'30px 20px', color:B.dust, fontSize:13 }}>
          No catches logged yet. Your patterns appear after about 5 catches.
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ ...O, fontSize:9, letterSpacing:3, color:B.dust, margin:'4px 4px 2px' }}>RECENT CATCHES</div>
          {catches.map(c => (
            <div key={c.id} style={{ background:B.forest, borderRadius:6, padding:'12px 14px', border:`1px solid rgba(255,255,255,0.05)` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <span style={{ ...O, fontSize:14, color:B.bone, letterSpacing:1 }}>{c.species.toUpperCase()}</span>
                  {c.length_in && <span style={{ fontSize:13, color:B.copper, marginLeft:8 }}>{c.length_in}"</span>}
                  {c.released && <span style={{ fontSize:10, color:B.dust, marginLeft:8 }}>↩ released</span>}
                </div>
                <div style={{ fontSize:11, color:B.dust }}>
                  {new Date(c.caught_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                </div>
              </div>
              <div style={{ fontSize:11, color:B.parchment, marginTop:6, display:'flex', gap:12, flexWrap:'wrap' }}>
                {c.tide_stage && <span>🌊 {c.tide_stage}</span>}
                {c.water_temp_f && <span>🌡 {c.water_temp_f}°F</span>}
                {c.wind_kts != null && <span>💨 {c.wind_kts}kt {c.wind_dir}</span>}
                {c.sky && <span>☁️ {c.sky}</span>}
                {c.moon_phase && <span>🌙 {c.moon_phase}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
