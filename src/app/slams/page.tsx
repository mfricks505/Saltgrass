'use client'
// src/app/slams/page.tsx
// Florida Slams + life list. Reads the user's catch log. The "come back" hook.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { SLAMS, LIFE_LIST_SPECIES, computeSlamProgress } from '@/lib/slams'
import RundownNav from '@/components/RundownNav'

const B = { midnight:'#0A0C08', forest:'#141F14', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358', go:'#7AE07A' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }
const TIER = { classic:'#4A8EC2', challenge:'#C8922A', legend:'#D4982E' }

export default function SlamsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [caught, setCaught] = useState<string[]>([])
  const [bests, setBests] = useState<Record<string,any>>({})
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{ load() },[])
  async function load() {
    setLoading(true)
    const { data:{ user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const { data } = await supabase.from('catch_log').select('species, weight_lb, length_in, caught_at').eq('user_id', user.id)
      if (data) {
        setCaught([...new Set(data.map(c=>c.species))])
        // personal best per species (by weight, fallback length)
        const pb: Record<string,any> = {}
        for (const c of data) {
          const key = c.species.toLowerCase().trim()
          const metric = c.weight_lb ?? c.length_in ?? 0
          if (!pb[key] || metric > (pb[key].metric ?? 0)) pb[key] = { ...c, metric }
        }
        setBests(pb)
      }
    }
    setLoading(false)
  }

  const slamProgress = computeSlamProgress(caught)
  const completedCount = slamProgress.filter(s=>s.complete).length
  const lifeListCaught = LIFE_LIST_SPECIES.filter(s => caught.some(c => c.toLowerCase().includes(s) || s.includes(c.toLowerCase())))

  if (!loading && !user) {
    return (
      <div style={{ maxWidth:560, margin:'0 auto', textAlign:'center', padding:'40px 20px' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🏆</div>
        <div style={{ ...O, fontSize:24, letterSpacing:1, color:B.bone, marginBottom:10 }}>FLORIDA SLAMS</div>
        <p style={{ fontSize:14, color:B.parchment, lineHeight:1.7, marginBottom:20 }}>
          Track your slams and build your life list. Log your catches and watch the Inshore Slam, Flats Slam, and the Florida Big Five fill in.
        </p>
        <Link href="/auth/signup" style={{ background:B.copper, color:B.midnight, padding:'12px 26px', borderRadius:6, ...O, fontSize:13, letterSpacing:2, textDecoration:'none' }}>JOIN FREE</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth:720, margin:'0 auto' }}>
      <div style={{ padding:'8px 2px 16px' }}>
        <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.copper }}>YOUR TROPHY ROOM</div>
        <div style={{ ...O, fontSize:28, letterSpacing:1, color:B.bone, lineHeight:1.1, marginTop:2 }}>FLORIDA SLAMS</div>
        <div style={{ fontSize:13, color:B.parchment, marginTop:8 }}>
          {completedCount > 0
            ? <>You've completed <strong style={{color:B.go}}>{completedCount}</strong> slam{completedCount!==1?'s':''} and logged <strong>{lifeListCaught.length}</strong> species. Keep at it.</>
            : <>Log your catches and your slams fill in automatically. {lifeListCaught.length} species on your life list so far.</>}
        </div>
      </div>

      {loading ? <div style={{ ...O, color:B.dust, letterSpacing:2, padding:40, textAlign:'center' }}>LOADING YOUR LOG...</div> : (
        <>
          {/* Slam cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
            {slamProgress.map(s=>(
              <div key={s.id} style={{ background:B.forest, borderRadius:10, padding:'16px 18px', border:`1px solid ${s.complete?B.go+'66':'#243824'}`, position:'relative', overflow:'hidden' }}>
                {s.complete && <div style={{ position:'absolute', top:10, right:12, ...O, fontSize:9, letterSpacing:1, color:B.go }}>✓ COMPLETE</div>}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <span style={{ fontSize:22 }}>{s.icon}</span>
                  <div>
                    <div style={{ ...O, fontSize:13, letterSpacing:0.5, color:B.bone }}>{s.name}</div>
                    <div style={{ fontSize:9, ...O, letterSpacing:1, color:TIER[s.tier] }}>{s.tier.toUpperCase()}</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:B.dust, marginBottom:10, lineHeight:1.5 }}>{s.blurb}</div>
                {/* progress bar */}
                <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:3, overflow:'hidden', marginBottom:8 }}>
                  <div style={{ width:`${s.progress*100}%`, height:'100%', background:s.complete?B.go:B.copper, borderRadius:3 }} />
                </div>
                {/* species checklist */}
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {s.species.map(sp=>{
                    const got = s.caught.includes(sp)
                    return <span key={sp} style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:got?'rgba(122,224,122,0.15)':'rgba(255,255,255,0.04)', color:got?B.go:B.dust, textTransform:'capitalize' }}>{got?'✓ ':''}{sp}</span>
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Life list */}
          <div style={{ background:B.forest, borderRadius:10, padding:'18px 20px', border:'1px solid #243824' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:12 }}>
              <div style={{ ...O, fontSize:14, letterSpacing:1, color:B.bone }}>LIFE LIST</div>
              <div style={{ ...O, fontSize:12, color:B.copper }}>{lifeListCaught.length} / {LIFE_LIST_SPECIES.length}</div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {LIFE_LIST_SPECIES.map(sp=>{
                const got = caught.some(c => c.toLowerCase().includes(sp) || sp.includes(c.toLowerCase()))
                const best = bests[sp]
                return (
                  <span key={sp} title={best?`PB: ${best.weight_lb?best.weight_lb+' lbs':best.length_in?best.length_in+'"':''}`:''} style={{ fontSize:11, padding:'4px 10px', borderRadius:12, background:got?'rgba(200,146,42,0.15)':'rgba(255,255,255,0.03)', color:got?B.copper:B.dust, textTransform:'capitalize', border:got?`1px solid ${B.copper}44`:'1px solid transparent' }}>
                    {got?'✓ ':''}{sp}{got && best?.metric ? ` · ${best.weight_lb?best.weight_lb+'lb':best.length_in+'"'}` : ''}
                  </span>
                )
              })}
            </div>
            <div style={{ fontSize:11, color:B.dust, marginTop:14, paddingTop:12, borderTop:'1px solid #243824' }}>
              Every catch you log fills this in. <Link href="/log" style={{ color:B.copper, textDecoration:'none' }}>Log a catch →</Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
