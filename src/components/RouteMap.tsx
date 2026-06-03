'use client'
// src/components/RouteMap.tsx — v2
// Drop pins for your route. Get conditions at each leg + trip verdict + NWS warnings.

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'
import { BOAT_TYPES } from '@/lib/marine'

const B = {
  forest:'#141F14', moss:'#1C2E1C', copper:'#C8922A', bone:'#E8DFC8',
  parchment:'#B8AE98', dust:'#6B6358',
  go:'#1A3A1A', caution:'#2A2210', nogo:'#2A1010',
  goText:'#7AE07A', cautionText:'#E0C06A', nogoText:'#E07A7A',
  goBorder:'#3D7A3D', cautionBorder:'#8A6A1A', nogoBorder:'#8A1A1A',
}
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

const VERDICT = {
  'GO':      { bg:B.go,      border:B.goBorder,      text:B.goText,      dot:'🟢', label:'GO' },
  'CAUTION': { bg:B.caution, border:B.cautionBorder, text:B.cautionText, dot:'🟡', label:'CAUTION' },
  'NO-GO':   { bg:B.nogo,    border:B.nogoBorder,    text:B.nogoText,    dot:'🔴', label:'NO-GO' },
}

function LocationMarkers({ positions, setPositions }: any) {
  useMapEvents({
    click(e: any) {
      setPositions([...positions, { lat: e.latlng.lat, lon: e.latlng.lng }])
    },
  })
  return (
    <>
      {positions.map((pos: any, i: number) => (
        <Marker key={i} position={[pos.lat, pos.lon]} />
      ))}
      {positions.length > 1 && (
        <Polyline positions={positions.map((p: any) => [p.lat, p.lon])} color="#C8922A" weight={3} />
      )}
    </>
  )
}

export default function RouteMap() {
  const [positions, setPositions] = useState<any[]>([])
  const [boatType, setBoatType]   = useState('center_console')
  const [data, setData]           = useState<any>(null)
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [routeName, setRouteName] = useState('')
  const [showSave, setShowSave]   = useState(false)

  async function analyze() {
    if (positions.length < 1) return
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/route-conditions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waypoints: positions, boatType }),
      })
      setData(await res.json())
    } catch {}
    setLoading(false)
  }

  async function saveRoute() {
    if (!routeName.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/routes/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: routeName.trim(), waypoints: positions, boatType }),
      })
      if (res.ok) { setSaved(true); setShowSave(false) }
      else if (res.status === 401) { alert('Sign in to save routes and get morning alerts') }
    } catch {}
    setSaving(false)
  }

  const tv = data ? VERDICT[data.trip_verdict as keyof typeof VERDICT] : null

  return (
    <div>
      {/* Instructions */}
      <div style={{ background:B.forest, borderRadius:8, padding:'14px 18px', marginBottom:8, border:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ ...O, fontSize:11, letterSpacing:2, color:B.copper, marginBottom:4 }}>📍 PLAN YOUR RUN</div>
        <div style={{ fontSize:13, color:B.parchment, lineHeight:1.6 }}>
          Tap the map to drop pins along your route — start at the ramp, then each spot you'll run to.
          We'll break down conditions at every leg so you know if it's fine inshore but snotty where you're actually fishing.
        </div>
      </div>

      {/* Boat selector */}
      <div style={{ background:B.forest, borderRadius:8, padding:'12px 18px', marginBottom:8, border:`1px solid rgba(255,255,255,0.05)` }}>
        <div className="no-scrollbar" style={{ display:'flex', gap:6, overflowX:'auto' }}>
          {Object.entries(BOAT_TYPES).filter(([id]) => id !== 'atv_truck').map(([id, bt]) => (
            <button key={id} onClick={() => setBoatType(id)} style={{ flexShrink:0, padding:'7px 13px', borderRadius:4, border:`2px solid ${boatType===id ? B.copper : 'rgba(255,255,255,0.08)'}`, background:boatType===id ? 'rgba(200,146,42,0.15)' : 'transparent', color:boatType===id ? B.copper : B.parchment, cursor:'pointer', ...O, fontSize:10, letterSpacing:1, whiteSpace:'nowrap' }}>
              {bt.icon} {bt.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ borderRadius:8, overflow:'hidden', marginBottom:8, border:`1px solid rgba(255,255,255,0.08)` }}>
        <MapContainer center={[30.40, -87.20]} zoom={10} style={{ height:380, width:'100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarkers positions={positions} setPositions={setPositions} />
        </MapContainer>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:8, marginBottom:10 }}>
        <button onClick={analyze} disabled={positions.length < 1 || loading} style={{ flex:1, background:positions.length ? B.copper : 'rgba(255,255,255,0.08)', color:positions.length ? '#1A1208' : B.dust, border:'none', borderRadius:6, padding:'13px', ...O, fontSize:13, letterSpacing:2, cursor:positions.length ? 'pointer' : 'not-allowed', opacity:loading ? 0.7 : 1 }}>
          {loading ? 'CHECKING ROUTE...' : `CHECK ROUTE (${positions.length} ${positions.length === 1 ? 'PIN' : 'PINS'})`}
        </button>
        {positions.length > 0 && (
          <button onClick={() => { setPositions([]); setData(null) }} style={{ background:'transparent', color:B.parchment, border:`1px solid rgba(255,255,255,0.15)`, borderRadius:6, padding:'13px 18px', ...O, fontSize:12, letterSpacing:1, cursor:'pointer' }}>
            CLEAR
          </button>
        )}
      </div>

      {/* NWS Warnings — show first, most important */}
      {data?.alerts?.length > 0 && (
        <div style={{ marginBottom:10 }}>
          {data.alerts.map((a: any, i: number) => (
            <div key={i} style={{ background:'rgba(200,69,42,0.15)', border:`1px solid #C8452A`, borderRadius:8, padding:'12px 16px', marginBottom:6 }}>
              <div style={{ ...O, fontSize:12, letterSpacing:1, color:'#E07A7A', marginBottom:3 }}>⚠️ {a.event?.toUpperCase()}</div>
              <div style={{ fontSize:12, color:B.parchment, lineHeight:1.6 }}>{a.headline}</div>
            </div>
          ))}
        </div>
      )}

      {/* Trip verdict */}
      {data && tv && (
        <>
          <div style={{ background:tv.bg, borderRadius:8, padding:'18px 20px', marginBottom:8, border:`1px solid ${tv.border}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ ...O, fontSize:32, color:tv.text, letterSpacing:2, lineHeight:1 }}>{tv.dot} {tv.label}</div>
                <div style={{ fontSize:12, color:B.parchment, marginTop:5 }}>
                  Trip verdict for your {data.total_distance_mi}mi run — keyed on the toughest leg
                </div>
              </div>
              {data.earliest_turns_bad && (
                <div style={{ background:'rgba(0,0,0,0.25)', borderRadius:6, padding:'10px 14px', textAlign:'right' }}>
                  <div style={{ ...O, fontSize:8, letterSpacing:2, color:B.cautionText, marginBottom:3 }}>WEATHER WINDOW</div>
                  <div style={{ ...O, fontSize:15, color:B.bone }}>Back by {data.earliest_turns_bad}</div>
                  <div style={{ fontSize:10, color:B.dust, marginTop:2 }}>conditions deteriorate</div>
                </div>
              )}
            </div>
          </div>

          {/* Save route bar */}
          {!saved ? (
            !showSave ? (
              <button onClick={() => setShowSave(true)} style={{ width:'100%', background:'transparent', color:B.copper, border:`1.5px solid ${B.copper}66`, borderRadius:6, padding:'12px', ...O, fontSize:12, letterSpacing:2, cursor:'pointer', marginBottom:8 }}>
                ⭐ SAVE THIS RUN — GET MORNING ALERTS
              </button>
            ) : (
              <div style={{ background:B.forest, borderRadius:8, padding:'14px 16px', marginBottom:8, border:`1px solid ${B.copper}44` }}>
                <div style={{ ...O, fontSize:10, letterSpacing:2, color:B.copper, marginBottom:8 }}>NAME THIS RUN</div>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={routeName} onChange={e => setRouteName(e.target.value)} placeholder="e.g. Bay flats run" onKeyDown={e => e.key==='Enter' && saveRoute()} style={{ flex:1, background:'#0A0C08', border:`1px solid rgba(255,255,255,0.15)`, borderRadius:5, color:B.bone, padding:'10px 12px', fontSize:14, outline:'none', fontFamily:'Inter,sans-serif' }} />
                  <button onClick={saveRoute} disabled={!routeName.trim() || saving} style={{ background:B.copper, color:'#1A1208', border:'none', borderRadius:5, padding:'10px 18px', ...O, fontSize:12, letterSpacing:1, cursor:'pointer', opacity:saving?0.7:1 }}>
                    {saving ? '...' : 'SAVE'}
                  </button>
                </div>
                <div style={{ fontSize:11, color:B.dust, marginTop:8, lineHeight:1.5 }}>
                  We'll check this run every morning and ping you when it's a GO.
                </div>
              </div>
            )
          ) : (
            <div style={{ background:'rgba(26,58,26,0.4)', borderRadius:8, padding:'12px 16px', marginBottom:8, border:`1px solid ${B.goBorder}`, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>✅</span>
              <div style={{ fontSize:13, color:B.goText }}>Saved! Check <a href="/today" style={{ color:B.copper }}>Today at a Glance</a> each morning.</div>
            </div>
          )}

          {/* Per-leg breakdown */}
          <div style={{ background:B.forest, borderRadius:8, padding:'16px 18px', marginBottom:10, border:`1px solid rgba(255,255,255,0.05)` }}>
            <div style={{ ...O, fontSize:9, letterSpacing:3, color:B.dust, marginBottom:12 }}>LEG-BY-LEG BREAKDOWN</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {data.legs.map((leg: any, i: number) => {
                const lv = VERDICT[leg.verdict as keyof typeof VERDICT]
                const isWorst = leg.index === data.worst_leg_index
                const legName = i === 0 ? 'Launch' : i === data.legs.length - 1 ? 'Destination' : `Waypoint ${i}`
                return (
                  <div key={i} style={{ background:'rgba(0,0,0,0.2)', borderRadius:6, padding:'12px 14px', border:`1px solid ${isWorst ? lv.border : 'rgba(255,255,255,0.05)'}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:18 }}>{leg.zoneIcon}</span>
                        <div>
                          <div style={{ ...O, fontSize:13, color:B.bone, letterSpacing:1 }}>
                            {legName.toUpperCase()} <span style={{ color:B.dust, fontSize:10 }}>· {leg.zoneLabel} · {leg.distFromLaunchMi}mi out</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ ...O, fontSize:14, color:lv.text }}>{lv.dot} {lv.label}</div>
                    </div>
                    <div style={{ display:'flex', gap:14, fontSize:12, color:B.parchment, flexWrap:'wrap' }}>
                      <span>💨 {leg.conditions.wind_kts ?? '–'} kts {leg.conditions.wind_dir} {leg.conditions.gust_kts ? `(g${leg.conditions.gust_kts})` : ''}</span>
                      <span>🌊 {leg.conditions.wave_ft ?? '–'} ft</span>
                      <span>🌧 {leg.conditions.rain_pct}%</span>
                      {leg.turnsBadAt && <span style={{ color:B.cautionText }}>⏰ turns rough ~{leg.turnsBadAt}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ fontSize:10, color:B.dust, textAlign:'center', padding:'0 0 14px' }}>
            Conditions: Open-Meteo marine + wind · Warnings: NWS api.weather.gov · {data.moon?.emoji} {data.moon?.phase}
          </div>
        </>
      )}
    </div>
  )
}
