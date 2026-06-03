'use client'
// src/components/RundownQuickCheck.tsx
// The quick conditions check — region, launch point, zone, boat → verdict.
// Lifted from the Rundown so the analyzer page can toggle between this and the route map.

import { useState, useEffect } from 'react'
import { REGION_COORDS, BOAT_TYPES, ZONES, LAUNCH_POINTS, SPECIES_CONDITIONS, getSolunarTimes, getBestWindow, getInletWarning } from '@/lib/marine'

const B = {
  forest:'#14263F', moss:'#1B2F4A', copper:'#C8922A', bone:'#E8DFC8',
  parchment:'#C4BFA6', dust:'#9A9580',
  go:'#1A3A1A', caution:'#2A2210', nogo:'#2A1010',
  goText:'#7AE07A', cautionText:'#E0C06A', nogoText:'#E07A7A',
  goBorder:'#3D7A3D', cautionBorder:'#8A6A1A', nogoBorder:'#8A1A1A',
}
type Zone = 'inshore'|'nearshore'|'offshore'
const O = { fontFamily:'Impact, Arial Black, sans-serif' }
const VERDICT_CONFIG = {
  'GO':      { bg:B.go,      border:B.goBorder,      text:B.goText,      label:'🟢 GO',      sub:'Conditions look good for your vessel and zone' },
  'CAUTION': { bg:B.caution, border:B.cautionBorder, text:B.cautionText, label:'🟡 CAUTION', sub:'Marginal — use your own judgment' },
  'NO-GO':   { bg:B.nogo,    border:B.nogoBorder,    text:B.nogoText,    label:'🔴 NO-GO',   sub:"Exceeds your vessel's limits for this zone" },
}

export default function RundownQuickCheck() {
  const [region, setRegion]           = useState('panhandle')
  const [boatType, setBoatType]       = useState('center_console')
  const [zone, setZone]               = useState<Zone>('inshore')
  const [launchPoint, setLaunchPoint] = useState('')
  const [species, setSpecies]         = useState<string[]>([])
  const [data, setData]               = useState<any>(null)
  const [loading, setLoading]         = useState(false)

  const launchPoints   = LAUNCH_POINTS[region] ?? []
  const selectedLaunch = launchPoints.find(p => p.id === launchPoint)
  const availableZones = selectedLaunch?.zones_available ?? ['inshore','nearshore','offshore']
  const zoneSpecies    = ZONES[zone]?.target_species ?? []

  async function fetchRundown() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ region, boatType, zone })
      if (launchPoint) params.set('launch_point', launchPoint)
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/rundown?${params}`)
      setData(await res.json())
    } catch {}
    setLoading(false)
  }
  useEffect(() => { fetchRundown() }, [region, boatType, zone, launchPoint])

  const coords     = REGION_COORDS[region]
  const solunar    = getSolunarTimes(new Date(), coords.lat, coords.lon)
  const bestWindow = data?.hourly ? getBestWindow(data.hourly, zone, boatType) : null
  const inletWarning = launchPoint && data ? getInletWarning(launchPoint, data.wind?.speed_kts ?? 0, data.wind?.direction ?? '', data.waves?.height_ft ?? 0, data.tides?.[0]?.type ?? '') : null
  const vc = data ? VERDICT_CONFIG[data.verdict as keyof typeof VERDICT_CONFIG] : null

  return (
    <div>
      {/* Region */}
      <div style={{ background:B.forest, borderRadius:8, padding:'14px 18px', marginBottom:8, border:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.dust, marginBottom:10 }}>REGION</div>
        <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto' }}>
          {Object.entries(REGION_COORDS).map(([id, r]) => (
            <button key={id} onClick={() => { setRegion(id); setLaunchPoint('') }} style={{ flexShrink:0, padding:'8px 14px', borderRadius:4, border:`2px solid ${region===id ? B.copper : 'rgba(255,255,255,0.08)'}`, background:region===id ? 'rgba(200,146,42,0.15)' : 'transparent', color:region===id ? B.copper : B.parchment, cursor:'pointer', ...O, fontSize:12, letterSpacing:1, whiteSpace:'nowrap' }}>
              {r.icon} {r.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Launch point */}
      <div style={{ background:B.forest, borderRadius:8, padding:'14px 18px', marginBottom:8, border:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.dust, marginBottom:10 }}>LAUNCH POINT</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:6 }}>
          <button onClick={() => setLaunchPoint('')} style={{ padding:'10px 12px', borderRadius:4, border:`2px solid ${!launchPoint ? B.copper : 'rgba(255,255,255,0.08)'}`, background:!launchPoint ? 'rgba(200,146,42,0.12)' : 'transparent', color:!launchPoint ? B.copper : B.parchment, cursor:'pointer', textAlign:'left', fontSize:12, fontFamily:'Inter,sans-serif' }}>
            📍 General {REGION_COORDS[region].label}
          </button>
          {launchPoints.map(lp => (
            <button key={lp.id} onClick={() => setLaunchPoint(lp.id)} style={{ padding:'10px 12px', borderRadius:4, border:`2px solid ${launchPoint===lp.id ? B.copper : 'rgba(255,255,255,0.08)'}`, background:launchPoint===lp.id ? 'rgba(200,146,42,0.12)' : 'transparent', color:launchPoint===lp.id ? B.copper : B.parchment, cursor:'pointer', textAlign:'left', fontSize:12, fontFamily:'Inter,sans-serif', display:'flex', alignItems:'center', gap:8 }}>
              <span>{lp.type === 'marina' ? '⚓' : '🚤'}</span><span>{lp.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zone */}
      <div style={{ background:B.forest, borderRadius:8, padding:'14px 18px', marginBottom:8, border:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.dust, marginBottom:10 }}>WHERE YOU'RE FISHING</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
          {(['inshore','nearshore','offshore'] as Zone[]).map(z => {
            const zc = ZONES[z]; const available = availableZones.includes(z)
            return (
              <button key={z} onClick={() => available && setZone(z)} disabled={!available} style={{ padding:'12px 10px', borderRadius:4, border:`2px solid ${zone===z ? B.copper : available ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}`, background:zone===z ? 'rgba(200,146,42,0.12)' : 'transparent', color:zone===z ? B.copper : available ? B.parchment : B.dust, cursor:available ? 'pointer' : 'not-allowed', textAlign:'center', opacity:available ? 1 : 0.4 }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{zc.icon}</div>
                <div style={{ ...O, fontSize:11, letterSpacing:1, marginBottom:2 }}>{zc.label.toUpperCase()}</div>
                <div style={{ fontSize:11, color:B.dust, lineHeight:1.4 }}>{zc.miles}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Boat */}
      <div style={{ background:B.forest, borderRadius:8, padding:'14px 18px', marginBottom:10, border:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.dust, marginBottom:10 }}>VESSEL</div>
        <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto' }}>
          {Object.entries(BOAT_TYPES).map(([id, bt]) => (
            <button key={id} onClick={() => setBoatType(id)} style={{ flexShrink:0, padding:'8px 14px', borderRadius:4, border:`2px solid ${boatType===id ? B.copper : 'rgba(255,255,255,0.08)'}`, background:boatType===id ? 'rgba(200,146,42,0.15)' : 'transparent', color:boatType===id ? B.copper : B.parchment, cursor:'pointer', ...O, fontSize:12, letterSpacing:1, whiteSpace:'nowrap' }}>
              {bt.icon} {bt.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {inletWarning && (
        <div style={{ background:'rgba(200,69,42,0.12)', border:`1px solid #C8452A66`, borderRadius:8, padding:'12px 16px', marginBottom:10, fontSize:13, color:'#E07A7A', lineHeight:1.7 }}>
          {inletWarning}
        </div>
      )}

      {loading ? (
        <div style={{ background:B.forest, borderRadius:8, padding:'40px', textAlign:'center', border:`1px solid rgba(255,255,255,0.05)` }}>
          <div style={{ ...O, fontSize:11, letterSpacing:3, color:'#4A8EC2' }}>PULLING CONDITIONS...</div>
        </div>
      ) : data && vc ? (
        <>
          <div style={{ background:vc.bg, borderRadius:8, padding:'18px 20px', marginBottom:10, border:`1px solid ${vc.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ ...O, fontSize:34, color:vc.text, letterSpacing:2, lineHeight:1 }}>{vc.label}</div>
                <div style={{ fontSize:12, color:B.parchment, marginTop:4 }}>{vc.sub}</div>
                <div style={{ fontSize:11, color:B.dust, marginTop:3 }}>
                  {ZONES[zone].icon} {ZONES[zone].label} · {selectedLaunch?.name ?? REGION_COORDS[region].label} · {BOAT_TYPES[boatType]?.icon} {BOAT_TYPES[boatType]?.label}
                </div>
              </div>
              {bestWindow && (
                <div style={{ background:'rgba(200,146,42,0.15)', border:`1px solid ${B.copper}44`, borderRadius:6, padding:'10px 14px', textAlign:'right', flexShrink:0, marginLeft:12 }}>
                  <div style={{ ...O, fontSize:11, letterSpacing:2, color:B.copper, marginBottom:3 }}>BEST WINDOW</div>
                  <div style={{ ...O, fontSize:14, color:B.bone }}>{bestWindow.time}</div>
                  <div style={{ fontSize:12, color:B.dust, marginTop:2 }}>{bestWindow.reason}</div>
                </div>
              )}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {[
                { label:'WIND', val:`${data.wind?.speed_kts ?? '–'} kts`, sub:data.wind?.direction ?? '' },
                { label:'GUSTS', val:`${data.wind?.gusts_kts ?? '–'} kts`, sub:`max ${data.wind?.max_today_kts ?? '–'}` },
                { label:'SEAS', val:`${data.waves?.height_ft ?? '–'} ft`, sub:`${data.waves?.period_s ?? '–'}s` },
                { label:'WATER', val:data.water?.temp_f ? `${data.water.temp_f}°F` : '–', sub:'' },
                { label:'RAIN', val:`${data.rain_pct ?? 0}%`, sub:'today' },
                { label:'SUNRISE', val:data.sun?.sunrise ?? '–', sub:'' },
                { label:'SUNSET', val:data.sun?.sunset ?? '–', sub:'' },
                { label:'MOON', val:data.moon?.emoji ?? '–', sub:data.moon?.phase ?? '' },
              ].map(card => (
                <div key={card.label} style={{ background:'rgba(0,0,0,0.2)', borderRadius:4, padding:'10px' }}>
                  <div style={{ ...O, fontSize:11, letterSpacing:2, color:B.dust, marginBottom:4 }}>{card.label}</div>
                  <div style={{ ...O, fontSize:18, color:B.bone, lineHeight:1 }}>{card.val}</div>
                  {card.sub && <div style={{ fontSize:12, color:B.dust, marginTop:3 }}>{card.sub}</div>}
                </div>
              ))}
            </div>

            {data.tides?.length > 0 && (
              <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
                {data.tides.map((t: any, i: number) => (
                  <div key={i} style={{ background:'rgba(0,0,0,0.2)', borderRadius:4, padding:'7px 12px', fontSize:12, color:B.parchment }}>
                    <span style={{ ...O, fontSize:11, letterSpacing:1, color:t.type==='H'?'#4A8EC2':B.copper, marginRight:6 }}>{t.type==='H'?'HIGH':'LOW'}</span>
                    {t.time} · {t.height}ft
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Solunar */}
          <div style={{ background:B.forest, borderRadius:8, padding:'14px 18px', marginBottom:10, border:`1px solid rgba(255,255,255,0.05)` }}>
            <div style={{ ...O, fontSize:11, letterSpacing:2, color:B.bone, marginBottom:4 }}>🌙 SOLUNAR — {solunar.rating.toUpperCase()} DAY</div>
            <div style={{ fontSize:12, color:B.parchment }}>
              Best feeding window: <span style={{ color:B.copper }}>{solunar.best_window}</span> · Major: {solunar.major.map(m=>m.start).join(', ')}
            </div>
          </div>

          {/* Species */}
          <div style={{ background:B.forest, borderRadius:8, padding:'14px 18px', marginBottom:10, border:`1px solid rgba(255,255,255,0.05)` }}>
            <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.dust, marginBottom:10 }}>WHAT'S BITING — {ZONES[zone].label.toUpperCase()}</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:species.length?12:0 }}>
              {zoneSpecies.map(s => (
                <button key={s} onClick={() => setSpecies(sp => sp.includes(s) ? sp.filter(x=>x!==s) : [...sp, s])} style={{ padding:'6px 14px', borderRadius:20, border:`1.5px solid ${species.includes(s) ? B.copper : 'rgba(255,255,255,0.1)'}`, background:species.includes(s) ? 'rgba(200,146,42,0.15)' : 'transparent', color:species.includes(s) ? B.copper : B.parchment, cursor:'pointer', fontSize:12, fontFamily:'Inter,sans-serif' }}>
                  {s}
                </button>
              ))}
            </div>
            {species.map(s => {
              const sc = SPECIES_CONDITIONS[s]; if (!sc || !data) return null
              const tip = sc.tip({
                tide_direction: data.tides?.[0]?.type === 'H' ? 'incoming' : 'outgoing',
                water_temp_f: data.water?.temp_f, wind_kts: data.wind?.speed_kts,
                wave_ft: data.waves?.height_ft, moon_phase: data.moon?.phase,
              })
              return (
                <div key={s} style={{ background:'rgba(0,0,0,0.2)', borderRadius:6, padding:'12px 14px', marginTop:8, border:`1px solid rgba(255,255,255,0.05)` }}>
                  <div style={{ ...O, fontSize:13, color:B.bone, letterSpacing:1, marginBottom:6 }}>{s.toUpperCase()}</div>
                  <div style={{ fontSize:12, color:B.parchment, lineHeight:1.7 }}>{tip}</div>
                </div>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}
