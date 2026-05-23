'use client'
// src/app/analyzer/page.tsx

import { useState, useEffect, useCallback } from 'react'

const B = {
  midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C',
  canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8',
  parchment:'#B8AE98', dust:'#6B6358', bark:'#1A1208',
}

const REGIONS = [
  { id:'panhandle', label:'Panhandle',       icon:'🏖️' },
  { id:'northfl',   label:'North Florida',   icon:'🌲' },
  { id:'centralfl', label:'Central Florida', icon:'🐊' },
  { id:'swfl',      label:'SW Florida',      icon:'🐚' },
  { id:'sefl',      label:'SE Florida',      icon:'🦈' },
  { id:'keys',      label:'The Keys',        icon:'🦐' },
]

const BOATS = [
  { id:'kayak',          label:'Kayak',              icon:'🛶', max_wind:10, max_wave:1.0 },
  { id:'jon_boat',       label:'Jon Boat',            icon:'🚤', max_wind:15, max_wave:1.5 },
  { id:'bay_boat',       label:'Bay Boat',            icon:'🛥️', max_wind:20, max_wave:3.0 },
  { id:'center_console', label:'Center Console',      icon:'⛵', max_wind:22, max_wave:4.0 },
  { id:'pontoon',        label:'Pontoon',             icon:'🛳️', max_wind:18, max_wave:2.0 },
  { id:'offshore',       label:'Offshore 25ft+',      icon:'🚢', max_wind:30, max_wave:7.0 },
  { id:'atv_truck',      label:'ATV/Truck (Hunting)', icon:'🚜', max_wind:999, max_wave:999 },
]

const VERDICT_STYLE = {
  'GO':      { bg:'#1A3A1A', border:'#3D7A3D', text:'#7AE07A', label:'🟢 GO',      sub:'Conditions look good for your vessel' },
  'CAUTION': { bg:'#2A2210', border:'#8A6A1A', text:'#E0C06A', label:'🟡 CAUTION', sub:'Marginal — use your own judgment' },
  'NO-GO':   { bg:'#2A1010', border:'#8A1A1A', text:'#E07A7A', label:'🔴 NO-GO',   sub:"Conditions exceed your vessel's limits" },
}

const VERDOT: Record<string,string> = { 'GO':'🟢', 'CAUTION':'🟡', 'NO-GO':'🔴' }

export default function RundownPage() {
  const [region,   setRegion]   = useState('panhandle')
  const [boatType, setBoatType] = useState('center_console')
  const [data,     setData]     = useState<any>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string|null>(null)
  const [windOpen, setWindOpen] = useState(false)
  const [waveOpen, setWaveOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch(`/api/rundown?region=${region}&boatType=${boatType}`)
      if (!r.ok) throw new Error(`Server error ${r.status}`)
      setData(await r.json())
    } catch(e:any) { setError(e.message) }
    setLoading(false)
  }, [region, boatType])

  useEffect(() => { load() }, [load])
  useEffect(() => { setWindOpen(false); setWaveOpen(false) }, [region, boatType])

  const boat = BOATS.find(b => b.id === boatType)
  const vc   = data ? VERDICT_STYLE[data.verdict as keyof typeof VERDICT_STYLE] : null

  function Bar({ val, max, color }: { val:number; max:number; color:string }) {
    const pct = Math.min((val/Math.max(max*1.2, val+1))*100, 100)
    const lim = Math.min((max/Math.max(max*1.2, val+1))*100, 100)
    return (
      <div style={{ height:6, background:B.canopy, borderRadius:3, position:'relative', overflow:'hidden', margin:'8px 0 2px' }}>
        <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${pct}%`, background:color, borderRadius:3 }} />
        <div style={{ position:'absolute', top:0, left:`${lim}%`, width:2, height:'100%', background:'#C8452A' }} />
      </div>
    )
  }

  function HourlyTable({ field }: { field:'wind'|'wave' }) {
    if (!data?.hourly) return null
    const now  = new Date()
    const rows = data.hourly.filter((r:any) => new Date(r.iso) >= new Date(now.setMinutes(0,0,0))).slice(0,24)
    const cols = field === 'wind'
      ? ['TIME','VERDICT','WIND','GUSTS','DIR','RAIN']
      : ['TIME','VERDICT','WAVES','PERIOD','SWELL']

    return (
      <div style={{ overflowX:'auto', marginTop:10 }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, minWidth:400 }}>
          <thead>
            <tr>{cols.map(c => <th key={c} style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:8, letterSpacing:2, color:B.dust, padding:'5px 10px', textAlign:'left', borderBottom:`1px solid ${B.canopy}`, whiteSpace:'nowrap' }}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r:any, i:number) => {
              const isNow = new Date(r.iso).getHours() === new Date().getHours()
              const v     = VERDICT_STYLE[r.verdict as keyof typeof VERDICT_STYLE]
              const overWind = r.wind_kts > (boat?.max_wind ?? 22) * 0.75
              const overWave = r.wave_ft  > (boat?.max_wave ?? 4)  * 0.75
              return (
                <tr key={r.iso} style={{ background: isNow ? 'rgba(200,146,42,0.1)' : i%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding:'7px 10px', color: isNow ? B.copper : B.parchment, whiteSpace:'nowrap', fontWeight: isNow ? 700 : 400 }}>{isNow ? '▶ ' : ''}{r.label}</td>
                  <td style={{ padding:'7px 10px' }}><span style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:9, letterSpacing:1, color:v.text }}>{VERDOT[r.verdict]} {r.verdict}</span></td>
                  {field==='wind' ? <>
                    <td style={{ padding:'7px 10px', color: overWind ? '#E0C06A' : B.bone, fontWeight:700 }}>{r.wind_kts} kts</td>
                    <td style={{ padding:'7px 10px', color: r.gust_kts > (boat?.max_wind??22) ? '#E07A7A' : B.parchment }}>{r.gust_kts} kts</td>
                    <td style={{ padding:'7px 10px', color:B.dust }}>{r.dir}</td>
                    <td style={{ padding:'7px 10px', color: r.rain_pct>60 ? '#5A9FD4' : B.dust }}>{r.rain_pct}%</td>
                  </> : <>
                    <td style={{ padding:'7px 10px', color: overWave ? '#E0C06A' : B.bone, fontWeight:700 }}>{r.wave_ft} ft</td>
                    <td style={{ padding:'7px 10px', color:B.dust }}>{r.period_s}s</td>
                    <td style={{ padding:'7px 10px', color:B.dust }}>{r.swell_ft} ft</td>
                  </>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div style={{ maxWidth:860, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:10, letterSpacing:4, color:B.copper, marginBottom:5 }}>SALTGRASS</div>
        <h1 style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:32, letterSpacing:2, color:B.bone, margin:'0 0 5px' }}>THE RUNDOWN</h1>
        <p style={{ fontSize:12, color:B.dust, margin:0 }}>Real data from NOAA buoys · Open-Meteo marine forecasts · NOAA tide predictions</p>
      </div>

      {/* Selectors */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>

        {/* Region */}
        <div>
          <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:9, letterSpacing:3, color:B.dust, marginBottom:7 }}>YOUR REGION</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:5 }}>
            {REGIONS.map(r => (
              <button key={r.id} onClick={() => setRegion(r.id)} style={{ padding:'8px 4px', borderRadius:4, cursor:'pointer', textAlign:'center', border:`2px solid ${region===r.id ? B.copper : B.canopy}`, background: region===r.id ? 'rgba(200,146,42,0.1)' : 'transparent' }}>
                <div style={{ fontSize:18, marginBottom:2 }}>{r.icon}</div>
                <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:8, letterSpacing:1, color: region===r.id ? B.copper : B.dust }}>{r.label.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Boat */}
        <div>
          <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:9, letterSpacing:3, color:B.dust, marginBottom:7 }}>YOUR VESSEL</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {BOATS.map(b => (
              <button key={b.id} onClick={() => setBoatType(b.id)} style={{ padding:'7px 10px', borderRadius:4, cursor:'pointer', border:`2px solid ${boatType===b.id ? B.copper : B.canopy}`, background: boatType===b.id ? 'rgba(200,146,42,0.1)' : 'transparent', display:'flex', alignItems:'center', gap:8, textAlign:'left' }}>
                <span style={{ fontSize:14 }}>{b.icon}</span>
                <span style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:9, letterSpacing:1, color: boatType===b.id ? B.copper : B.bone, flex:1 }}>{b.label.toUpperCase()}</span>
                {boatType===b.id && b.max_wind < 999 && <span style={{ fontSize:9, color:B.dust }}>{b.max_wind}kt / {b.max_wave}ft</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Refresh */}
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:10 }}>
        <button onClick={load} disabled={loading} style={{ background:B.canopy, color:B.parchment, border:'none', borderRadius:4, padding:'6px 14px', fontFamily:'Impact,Arial Black,sans-serif', fontSize:9, letterSpacing:2, cursor:'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'LOADING...' : '↺ REFRESH'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:'rgba(200,69,42,0.1)', border:'1px solid rgba(200,69,42,0.4)', borderRadius:6, padding:'12px 16px', marginBottom:12, color:'#E07A7A', fontSize:13 }}>
          ⚠️ {error} — <button onClick={load} style={{ background:'none', border:'none', color:B.copper, cursor:'pointer', fontWeight:700 }}>Try again</button>
        </div>
      )}

      {/* Skeleton */}
      {loading && !data && [100,180,140,90].map((h,i) => <div key={i} className="skeleton" style={{ height:h, borderRadius:8, marginBottom:8 }} />)}

      {/* Data */}
      {data && vc && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>

          {/* Verdict */}
          <div style={{ background:vc.bg, borderRadius:8, padding:'20px 24px', border:`1px solid ${vc.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:30, letterSpacing:3, color:vc.text, lineHeight:1 }}>{vc.label}</div>
                <div style={{ fontSize:13, color:vc.text, opacity:0.8, marginTop:5 }}>{vc.sub}</div>
                {data.risks.length > 0 && (
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:8 }}>
                    {data.risks.map((r:string) => (
                      <span key={r} style={{ background:'rgba(0,0,0,0.35)', color:vc.text, borderRadius:4, padding:'2px 8px', fontSize:10, fontFamily:'Impact,Arial Black,sans-serif', letterSpacing:1 }}>⚠️ {r.toUpperCase()}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:11, color:vc.text, opacity:0.7 }}>{REGIONS.find(r=>r.id===region)?.icon} {REGIONS.find(r=>r.id===region)?.label.toUpperCase()}</div>
                <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:10, color:vc.text, opacity:0.5, marginTop:3 }}>{boat?.icon} {boat?.label.toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* Wind */}
          <div style={{ background:B.forest, borderRadius:8, padding:'16px 20px', border:'1px solid #243824' }}>
            <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:9, letterSpacing:3, color:B.copper, marginBottom:10 }}>💨 WIND</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:8 }}>
              <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:42, color:B.bone, lineHeight:1 }}>{data.wind.speed_kts}</div>
              <div style={{ marginBottom:4 }}>
                <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:13, color:B.parchment }}>KTS {data.wind.direction}</div>
                <div style={{ fontSize:11, color:B.dust }}>Gusts {data.wind.gusts_kts} kts · Max today {data.wind.max_today_kts} kts</div>
              </div>
            </div>
            <Bar val={data.wind.speed_kts} max={boat?.max_wind??22} color="#C8922A" />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:B.dust }}><span>0 kts</span><span style={{ color:'#C8452A' }}>Your limit: {boat?.max_wind===999 ? 'N/A' : (boat?.max_wind??22)+' kts'}</span></div>
            <button onClick={() => setWindOpen(v=>!v)} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:B.copper, marginTop:10, padding:'4px 0' }}>
              <span style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:9, letterSpacing:2 }}>HOURLY WIND FORECAST</span>
              <span style={{ fontSize:10, transform: windOpen?'rotate(180deg)':'none', transition:'transform 0.2s', display:'inline-block' }}>▼</span>
            </button>
            {windOpen && <HourlyTable field="wind" />}
          </div>

          {/* Waves */}
          <div style={{ background:B.forest, borderRadius:8, padding:'16px 20px', border:'1px solid #243824' }}>
            <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:9, letterSpacing:3, color:B.copper, marginBottom:10 }}>🌊 WAVES</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:8 }}>
              <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:42, color:B.bone, lineHeight:1 }}>{data.waves.height_ft}</div>
              <div style={{ marginBottom:4 }}>
                <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:13, color:B.parchment }}>FT {data.waves.direction}</div>
                <div style={{ fontSize:11, color:B.dust }}>Period {data.waves.period_s}s · Swell {data.waves.swell_ft} ft</div>
              </div>
            </div>
            <Bar val={data.waves.height_ft} max={boat?.max_wave??4} color="#5A9FD4" />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:B.dust }}><span>0 ft</span><span style={{ color:'#C8452A' }}>Your limit: {boat?.max_wave===999 ? 'N/A' : (boat?.max_wave??4)+' ft'}</span></div>
            <button onClick={() => setWaveOpen(v=>!v)} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:B.copper, marginTop:10, padding:'4px 0' }}>
              <span style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:9, letterSpacing:2 }}>HOURLY WAVE FORECAST</span>
              <span style={{ fontSize:10, transform: waveOpen?'rotate(180deg)':'none', transition:'transform 0.2s', display:'inline-block' }}>▼</span>
            </button>
            {waveOpen && <HourlyTable field="wave" />}
          </div>

          {/* Tides */}
          <div style={{ background:B.forest, borderRadius:8, padding:'16px 20px', border:'1px solid #243824' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:9, letterSpacing:3, color:B.copper }}>🌊 TIDES — {data.tide_station?.toUpperCase()}</div>
              <a href="https://tidesandcurrents.noaa.gov" target="_blank" rel="noopener noreferrer" style={{ fontSize:9, color:B.dust }}>NOAA →</a>
            </div>
            {data.tides.length > 0 ? (
              <div style={{ display:'flex', overflowX:'auto' }}>
                {data.tides.map((t:any, i:number) => (
                  <div key={i} style={{ flex:'0 0 auto', minWidth:100, padding:'8px', textAlign:'center', borderRight: i<data.tides.length-1 ? `1px solid ${B.canopy}` : 'none' }}>
                    <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:10, letterSpacing:2, color: t.type==='HIGH' ? B.copper : '#5A9FD4', marginBottom:3 }}>{t.type==='HIGH' ? '▲ HIGH' : '▼ LOW'}</div>
                    <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:18, color:B.bone, lineHeight:1, marginBottom:2 }}>{t.height}ft</div>
                    <div style={{ fontSize:10, color:B.dust }}>{t.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize:12, color:B.dust }}>Tide data unavailable — <a href="https://tidesandcurrents.noaa.gov" target="_blank" rel="noopener noreferrer" style={{ color:B.copper }}>view on NOAA →</a></div>
            )}
          </div>

          {/* Sun / Moon / Water / Rain */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8 }}>
            {[
              { label:'☀️ SUN',   content: <><div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:13, color:B.bone, marginBottom:3 }}>{data.sun.sunrise}</div><div style={{ fontSize:9, color:B.dust, marginBottom:8 }}>SUNRISE</div><div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:13, color:B.bone, marginBottom:3 }}>{data.sun.sunset}</div><div style={{ fontSize:9, color:B.dust }}>SUNSET</div></> },
              { label:'MOON',     content: <><div style={{ fontSize:26, marginBottom:4 }}>{data.moon.emoji}</div><div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:10, color:B.bone, marginBottom:2 }}>{data.moon.phase.toUpperCase()}</div><div style={{ fontSize:10, color:B.dust }}>{data.moon.illumination}%</div></> },
              { label:'🌡️ WATER', content: data.water.temp_f ? <><div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:30, color:B.bone, lineHeight:1 }}>{data.water.temp_f}°</div><div style={{ fontSize:9, color:B.dust, marginTop:3 }}>FAHRENHEIT</div></> : <div style={{ fontSize:11, color:B.dust }}>Not available</div> },
              { label:'🌧️ RAIN',  content: <><div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:30, color: data.rain_pct>60 ? '#5A9FD4' : B.bone, lineHeight:1 }}>{data.rain_pct}%</div><div style={{ fontSize:9, color:B.dust, marginTop:3 }}>CHANCE TODAY</div></> },
            ].map(card => (
              <div key={card.label} style={{ background:B.forest, borderRadius:8, padding:'14px 16px', border:'1px solid #243824' }}>
                <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:8, letterSpacing:3, color:B.copper, marginBottom:10 }}>{card.label}</div>
                {card.content}
              </div>
            ))}
          </div>

          {/* Red tide + sources */}
          <div style={{ background:B.forest, borderRadius:8, padding:'12px 16px', border:'1px solid #243824', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:16 }}>🦠</span>
            <div style={{ flex:1, fontSize:11, color:B.dust }}>
              <strong style={{ color:B.bone }}>Red Tide: </strong>
              <a href="https://myfwc.com/research/redtide/statewide/" target="_blank" rel="noopener noreferrer" style={{ color:B.copper }}>Check FWC Red Tide Map →</a>
            </div>
          </div>

          <div style={{ background:B.forest, borderRadius:8, padding:'12px 16px', border:'1px solid #243824' }}>
            <div style={{ fontFamily:'Impact,Arial Black,sans-serif', fontSize:8, letterSpacing:3, color:B.dust, marginBottom:7 }}>DATA SOURCES</div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:10 }}>
              <span><span style={{ color:B.dust }}>Marine: </span><a href="https://marine-api.open-meteo.com" target="_blank" rel="noopener noreferrer" style={{ color:B.copper }}>Open-Meteo Marine</a></span>
              <span><span style={{ color:B.dust }}>Weather: </span><a href="https://api.open-meteo.com" target="_blank" rel="noopener noreferrer" style={{ color:B.copper }}>Open-Meteo</a></span>
              <span><span style={{ color:B.dust }}>Tides: </span><a href="https://tidesandcurrents.noaa.gov" target="_blank" rel="noopener noreferrer" style={{ color:B.copper }}>NOAA — {data.tide_station}</a></span>
              <span><span style={{ color:B.dust }}>Buoy: </span><a href={`https://www.ndbc.noaa.gov/station_page.php?station=${data.buoy?.id}`} target="_blank" rel="noopener noreferrer" style={{ color:B.copper }}>NDBC #{data.buoy?.id} — {data.buoy?.name} ({data.buoy?.dist}mi)</a></span>
            </div>
            <div style={{ fontSize:9, color:B.dust, marginTop:8 }}>Always use your own judgment. This is a decision aid, not a substitute for official marine forecasts.</div>
          </div>

        </div>
      )}
    </div>
  )
}
