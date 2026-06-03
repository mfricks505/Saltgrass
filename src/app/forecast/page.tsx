'use client'
// src/app/forecast/page.tsx
// 7-Day Bite Forecast — star-rated days, personalized from the catch log.

import { useState, useEffect } from 'react'
import { REGION_COORDS } from '@/lib/marine'
import RundownNav from '@/components/RundownNav'

const B = {
  midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', copper:'#C8922A',
  bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358', blue:'#4A8EC2',
}
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

const stars = (n:number) => '★'.repeat(n) + '☆'.repeat(5-n)
const starColor = (n:number) => n>=5?'#7AE07A':n>=4?'#A8D86A':n>=3?'#E0C06A':n>=2?'#E0926A':'#E07A7A'

export default function ForecastPage() {
  const [region, setRegion] = useState('panhandle')
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [region])
  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/bite-forecast?region=${region}`)
      setData(await res.json())
    } catch {}
    setLoading(false)
  }

  return (
    <div style={{ maxWidth:680, margin:'0 auto' }}>
      <div style={{ padding:'8px 4px 14px' }}>
        <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.copper }}>PLAN AHEAD</div>
        <div style={{ ...O, fontSize:28, color:B.bone, letterSpacing:1, lineHeight:1.1, marginTop:2 }}>7-DAY BITE FORECAST</div>
        <div style={{ fontSize:13, color:B.parchment, marginTop:6, lineHeight:1.6 }}>
          {data?.personalized
            ? 'Personalized to your catch log — scored against the conditions that actually produce for you.'
            : 'Star-rated fishing days. Log catches to personalize this to your bite.'}
        </div>
      </div>

      {/* Region selector */}
      <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:10 }}>
        {Object.entries(REGION_COORDS).map(([id, r]) => (
          <button key={id} onClick={() => setRegion(id)} style={{ flexShrink:0, padding:'8px 14px', borderRadius:4, border:`2px solid ${region===id ? B.copper : 'rgba(255,255,255,0.08)'}`, background:region===id ? 'rgba(200,146,42,0.15)' : 'transparent', color:region===id ? B.copper : B.parchment, cursor:'pointer', ...O, fontSize:10, letterSpacing:1, whiteSpace:'nowrap' }}>
            {r.icon} {r.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Best day callout */}
      {data?.best_day && (
        <div style={{ background:`linear-gradient(160deg, #1E2A40, #243252)`, borderRadius:8, padding:'16px 18px', marginBottom:10, border:`1px solid rgba(74,142,194,0.25)` }}>
          <div style={{ ...O, fontSize:10, letterSpacing:2, color:B.blue, marginBottom:4 }}>⭐ YOUR BEST WINDOW THIS WEEK</div>
          <div style={{ ...O, fontSize:22, color:B.bone, letterSpacing:1 }}>
            {data.best_day.label.toUpperCase()} <span style={{ color:starColor(data.best_day.stars) }}>{stars(data.best_day.stars)}</span>
          </div>
          <div style={{ fontSize:12, color:B.parchment, marginTop:3 }}>Best feeding window: {data.best_day.window}</div>
        </div>
      )}

      {loading ? (
        <div style={{ background:B.forest, borderRadius:8, padding:30, textAlign:'center', color:B.dust, ...O, letterSpacing:2 }}>FORECASTING...</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {data?.days?.map((d:any) => (
            <div key={d.date} style={{ background:B.forest, borderRadius:8, padding:'14px 16px', border:`1px solid ${d.stars>=4 ? starColor(d.stars)+'44' : 'rgba(255,255,255,0.05)'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <div style={{ ...O, fontSize:15, color:B.bone, letterSpacing:1 }}>
                  {d.day_label.toUpperCase()}
                  <span style={{ fontSize:18, marginLeft:8 }}>{d.moon.emoji}</span>
                </div>
                <div style={{ ...O, fontSize:18, color:starColor(d.stars), letterSpacing:2 }}>{stars(d.stars)}</div>
              </div>
              <div style={{ display:'flex', gap:12, fontSize:11, color:B.parchment, flexWrap:'wrap', marginBottom: d.personal_note || d.reasons.length ? 6 : 0 }}>
                <span>💨 {d.wind_max_kts}kt</span>
                <span>🌊 {d.wave_max_ft}ft</span>
                {d.sea_temp_f && <span>🌡 {d.sea_temp_f}°F</span>}
                <span>🌧 {d.rain_pct}%</span>
                <span>🎯 {d.best_window}</span>
              </div>
              {d.personal_note && (
                <div style={{ fontSize:12, color:B.blue, marginTop:4 }}>🧠 {d.personal_note}</div>
              )}
              {d.reasons.length > 0 && !d.personal_note && (
                <div style={{ fontSize:11, color:B.dust, marginTop:2 }}>{d.reasons.join(' · ')}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {!data?.personalized && !loading && (
        <div style={{ textAlign:'center', padding:'16px', marginTop:10, fontSize:12, color:B.dust, lineHeight:1.6 }}>
          📖 Log 4+ catches of a species and this forecast learns to score days against <em>your</em> proven conditions.
        </div>
      )}
    </div>
  )
}
