'use client'
// src/app/analyzer/page.tsx — The Rundown with hourly expand

import { useState, useEffect, useCallback } from 'react'
import { REGION_COORDS, BOAT_TYPES } from '@/lib/marine'

const B = {
  midnight: '#0A0C08', forest: '#141F14', moss: '#1C2E1C',
  canopy: '#243824', copper: '#C8922A', bone: '#E8DFC8',
  parchment: '#B8AE98', dust: '#6B6358', bark: '#1A1208',
  go: '#1A3A1A', caution: '#2A2210', nogo: '#2A1010',
  goText: '#7AE07A', cautionText: '#E0C06A', nogoText: '#E07A7A',
  goBorder: '#3D7A3D', cautionBorder: '#8A6A1A', nogoBorder: '#8A1A1A',
}

type Verdict = 'GO' | 'CAUTION' | 'NO-GO'

interface HourlyRow {
  iso: string; label: string
  wind_kts: number; gust_kts: number; dir: string
  wave_ft: number; period_s: number; swell_ft: number
  rain_pct: number; temp_f: number
  verdict: Verdict
}

interface RundownData {
  region: string; regionLabel: string; boatType: string; verdict: Verdict
  wind: { speed_kts: number; gusts_kts: number; direction: string; max_today_kts: number }
  waves: { height_ft: number; period_s: number; swell_ft: number; direction: string }
  water: { temp_f: number | null }
  tides: { time: string; height: string; type: string }[]
  sun: { sunrise: string; sunset: string }
  moon: { phase: string; emoji: string; illumination: number }
  rain_pct: number; risks: string[]
  buoy: { id: string; name: string; dist: number }
  tide_station: string
  hourly: HourlyRow[]
  generated_at: string
}

const VERDICT_CONFIG = {
  'GO':      { bg: B.go,      border: B.goBorder,      text: B.goText,      label: '🟢 GO',      sub: 'Conditions look good for your vessel' },
  'CAUTION': { bg: B.caution, border: B.cautionBorder, text: B.cautionText, label: '🟡 CAUTION', sub: 'Marginal — use your own judgment' },
  'NO-GO':   { bg: B.nogo,    border: B.nogoBorder,    text: B.nogoText,    label: '🔴 NO-GO',   sub: "Conditions exceed your vessel's limits" },
}

const VERDICT_DOT: Record<Verdict, string> = { 'GO': '🟢', 'CAUTION': '🟡', 'NO-GO': '🔴' }

function ExpandButton({ expanded, onToggle, label }: { expanded: boolean; onToggle: () => void; label: string }) {
  return (
    <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', marginTop: 10, color: B.copper }}>
      <span style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2 }}>{label}</span>
      <span style={{ fontSize: 11, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
    </button>
  )
}

function HourlyWindTable({ rows, boatType }: { rows: HourlyRow[]; boatType: string }) {
  const boat = BOAT_TYPES[boatType]
  const now = new Date().getHours()
  // Show next 24 hours starting from current hour
  const filtered = rows.filter(r => new Date(r.iso) >= new Date(new Date().setMinutes(0,0,0))).slice(0, 24)

  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 480 }}>
        <thead>
          <tr>
            {['TIME', 'VERDICT', 'WIND', 'GUSTS', 'DIR', 'RAIN'].map(h => (
              <th key={h} style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 8, letterSpacing: 2, color: B.dust, padding: '6px 10px', textAlign: 'left', borderBottom: `1px solid ${B.canopy}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => {
            const isNow = new Date(r.iso).getHours() === now
            const vc = VERDICT_CONFIG[r.verdict]
            return (
              <tr key={r.iso} style={{ background: isNow ? 'rgba(200,146,42,0.08)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '8px 10px', color: isNow ? B.copper : B.parchment, fontWeight: isNow ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {isNow ? '▶ ' : ''}{r.label}
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <span style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1, color: vc.text }}>
                    {VERDICT_DOT[r.verdict]} {r.verdict}
                  </span>
                </td>
                <td style={{ padding: '8px 10px', color: r.wind_kts > (boat?.max_wind_kts ?? 22) * 0.75 ? B.cautionText : B.bone, fontWeight: 700 }}>
                  {r.wind_kts} kts
                </td>
                <td style={{ padding: '8px 10px', color: r.gust_kts > (boat?.max_wind_kts ?? 22) ? B.nogoText : B.parchment }}>
                  {r.gust_kts} kts
                </td>
                <td style={{ padding: '8px 10px', color: B.dust }}>{r.dir}</td>
                <td style={{ padding: '8px 10px', color: r.rain_pct > 60 ? '#5A9FD4' : B.dust }}>
                  {r.rain_pct}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function HourlyWaveTable({ rows, boatType }: { rows: HourlyRow[]; boatType: string }) {
  const boat = BOAT_TYPES[boatType]
  const now = new Date().getHours()
  const filtered = rows.filter(r => new Date(r.iso) >= new Date(new Date().setMinutes(0,0,0))).slice(0, 24)

  return (
    <div style={{ overflowX: 'auto', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 480 }}>
        <thead>
          <tr>
            {['TIME', 'VERDICT', 'WAVES', 'PERIOD', 'SWELL', 'DIR'].map(h => (
              <th key={h} style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 8, letterSpacing: 2, color: B.dust, padding: '6px 10px', textAlign: 'left', borderBottom: `1px solid ${B.canopy}`, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, i) => {
            const isNow = new Date(r.iso).getHours() === now
            const vc = VERDICT_CONFIG[r.verdict]
            return (
              <tr key={r.iso} style={{ background: isNow ? 'rgba(200,146,42,0.08)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <td style={{ padding: '8px 10px', color: isNow ? B.copper : B.parchment, fontWeight: isNow ? 700 : 400, whiteSpace: 'nowrap' }}>
                  {isNow ? '▶ ' : ''}{r.label}
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <span style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 1, color: vc.text }}>
                    {VERDICT_DOT[r.verdict]} {r.verdict}
                  </span>
                </td>
                <td style={{ padding: '8px 10px', color: r.wave_ft > (boat?.max_wave_ft ?? 4) * 0.75 ? B.cautionText : B.bone, fontWeight: 700 }}>
                  {r.wave_ft} ft
                </td>
                <td style={{ padding: '8px 10px', color: B.dust }}>{r.period_s}s</td>
                <td style={{ padding: '8px 10px', color: B.dust }}>{r.swell_ft} ft</td>
                <td style={{ padding: '8px 10px', color: B.dust }}>{r.dir}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function WindBar({ speed, gusts, boatMax }: { speed: number; gusts: number; boatMax: number }) {
  const max = Math.max(boatMax * 1.2, gusts + 5, 5)
  const speedPct = Math.min((speed / max) * 100, 100)
  const gustPct  = Math.min((gusts / max) * 100, 100)
  const limitPct = Math.min((boatMax / max) * 100, 100)
  return (
    <div>
      <div style={{ height: 8, background: '#243824', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${gustPct}%`, background: 'rgba(200,146,42,0.25)', borderRadius: 4 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${speedPct}%`, background: '#C8922A', borderRadius: 4 }} />
        <div style={{ position: 'absolute', top: 0, left: `${limitPct}%`, width: 2, height: '100%', background: '#C8452A' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ fontSize: 9, color: B.dust }}>0 kts</div>
        <div style={{ fontSize: 9, color: '#C8452A' }}>Limit {boatMax} kts</div>
      </div>
    </div>
  )
}

function WaveBar({ height, boatMax }: { height: number; boatMax: number }) {
  const max = Math.max(boatMax * 1.2, height + 1, 1)
  const heightPct = Math.min((height / max) * 100, 100)
  const limitPct  = Math.min((boatMax / max) * 100, 100)
  return (
    <div>
      <div style={{ height: 8, background: '#243824', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${heightPct}%`, background: '#5A9FD4', borderRadius: 4 }} />
        <div style={{ position: 'absolute', top: 0, left: `${limitPct}%`, width: 2, height: '100%', background: '#C8452A' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ fontSize: 9, color: B.dust }}>0 ft</div>
        <div style={{ fontSize: 9, color: '#C8452A' }}>Limit {boatMax} ft</div>
      </div>
    </div>
  )
}

function Stat({ label, val }: { label: string; val: string }) {
  return (
    <div>
      <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 8, letterSpacing: 2, color: B.dust, marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, color: B.bone }}>{val}</div>
    </div>
  )
}

export default function RundownPage() {
  const [region,   setRegion]   = useState('panhandle')
  const [boatType, setBoatType] = useState('center_console')
  const [data,     setData]     = useState<RundownData | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  // Which sections are expanded
  const [windExpanded,  setWindExpanded]  = useState(false)
  const [waveExpanded,  setWaveExpanded]  = useState(false)

  const fetchRundown = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/rundown?region=${region}&boatType=${boatType}`)
      if (!res.ok) throw new Error('Failed to load conditions')
      setData(await res.json())
      setLastFetch(new Date())
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [region, boatType])

  useEffect(() => { fetchRundown() }, [fetchRundown])
  // Collapse hourly when region/boat changes
  useEffect(() => { setWindExpanded(false); setWaveExpanded(false) }, [region, boatType])

  const regions = Object.entries(REGION_COORDS)
  const boats   = Object.entries(BOAT_TYPES)
  const vc      = data ? VERDICT_CONFIG[data.verdict] : null
  const boat    = BOAT_TYPES[boatType]

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 4, color: B.copper, marginBottom: 5 }}>SALTGRASS</div>
        <h1 style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 34, letterSpacing: 2, color: B.bone, margin: '0 0 6px', textTransform: 'uppercase' }}>THE RUNDOWN</h1>
        <p style={{ fontSize: 13, color: B.dust, margin: 0, lineHeight: 1.6 }}>
          Real conditions from NOAA buoys · Open-Meteo marine & weather · NOAA tide predictions<br />
          Pick your region and vessel — we'll tell you if you should go.
        </p>
      </div>

      {/* Region + boat pickers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 3, color: B.dust, marginBottom: 7 }}>YOUR REGION</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
            {regions.map(([id, r]) => (
              <button key={id} onClick={() => setRegion(id)} style={{ padding: '8px 4px', borderRadius: 4, cursor: 'pointer', textAlign: 'center', border: `2px solid ${region === id ? B.copper : B.canopy}`, background: region === id ? 'rgba(200,146,42,0.1)' : 'transparent' }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{r.icon}</div>
                <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 8, letterSpacing: 1, color: region === id ? B.copper : B.dust, lineHeight: 1.2 }}>{r.label.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 3, color: B.dust, marginBottom: 7 }}>YOUR VESSEL</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {boats.map(([id, b]) => (
              <button key={id} onClick={() => setBoatType(id)} style={{ padding: '7px 10px', borderRadius: 4, cursor: 'pointer', border: `2px solid ${boatType === id ? B.copper : B.canopy}`, background: boatType === id ? 'rgba(200,146,42,0.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{b.icon}</span>
                <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 1, color: boatType === id ? B.copper : B.bone, flex: 1 }}>{b.label.toUpperCase()}</div>
                {boatType === id && <div style={{ fontSize: 9, color: B.dust, flexShrink: 0 }}>{b.max_wind_kts === 999 ? '' : `${b.max_wind_kts}kt / ${b.max_wave_ft}ft`}</div>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Refresh bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: B.dust }}>
          {lastFetch ? `Updated ${lastFetch.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}
        </div>
        <button onClick={fetchRundown} disabled={loading} style={{ background: B.canopy, color: B.parchment, border: 'none', borderRadius: 4, padding: '6px 14px', fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'LOADING...' : '↺ REFRESH'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(200,69,42,0.1)', border: '1px solid rgba(200,69,42,0.4)', borderRadius: 6, padding: '14px 18px', marginBottom: 14, color: '#E07A7A', fontSize: 13 }}>
          ⚠️ {error} — <button onClick={fetchRundown} style={{ background: 'none', border: 'none', color: B.copper, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Try again</button>
        </div>
      )}

      {loading && !data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[100, 180, 140, 90].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 8 }} />)}
        </div>
      )}

      {data && vc && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* ── Verdict banner ── */}
          <div style={{ background: vc.bg, borderRadius: 8, padding: '20px 24px', border: `1px solid ${vc.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 32, letterSpacing: 3, color: vc.text, lineHeight: 1 }}>{vc.label}</div>
                <div style={{ fontSize: 13, color: vc.text, opacity: 0.8, marginTop: 5 }}>{vc.sub}</div>
                {data.risks.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {data.risks.map(r => (
                      <span key={r} style={{ background: 'rgba(0,0,0,0.35)', color: vc.text, borderRadius: 4, padding: '2px 9px', fontSize: 10, fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: 1 }}>⚠️ {r.toUpperCase()}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 11, color: vc.text, opacity: 0.7, letterSpacing: 1 }}>{REGION_COORDS[data.region]?.icon} {data.regionLabel.toUpperCase()}</div>
                <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, color: vc.text, opacity: 0.5, marginTop: 3, letterSpacing: 1 }}>{boat?.icon} {boat?.label.toUpperCase()}</div>
              </div>
            </div>
          </div>

          {/* ── Wind card ── */}
          <div style={{ background: B.forest, borderRadius: 8, padding: '18px 20px', border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 3, color: B.copper, marginBottom: 12 }}>💨 WIND</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 44, color: B.bone, lineHeight: 1 }}>{data.wind.speed_kts}</div>
              <div>
                <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, color: B.parchment }}>KTS</div>
                <div style={{ fontSize: 12, color: B.dust }}>{data.wind.direction}</div>
              </div>
              <div style={{ marginLeft: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
                <Stat label="GUSTS"     val={`${data.wind.gusts_kts} kts`} />
                <Stat label="MAX TODAY" val={`${data.wind.max_today_kts} kts`} />
              </div>
            </div>
            <WindBar speed={data.wind.speed_kts} gusts={data.wind.gusts_kts} boatMax={boat?.max_wind_kts ?? 22} />
            {data.hourly.length > 0 && (
              <>
                <ExpandButton expanded={windExpanded} onToggle={() => setWindExpanded(v => !v)} label="HOURLY WIND FORECAST" />
                {windExpanded && <HourlyWindTable rows={data.hourly} boatType={boatType} />}
              </>
            )}
          </div>

          {/* ── Waves card ── */}
          <div style={{ background: B.forest, borderRadius: 8, padding: '18px 20px', border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 3, color: B.copper, marginBottom: 12 }}>🌊 WAVES</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 44, color: B.bone, lineHeight: 1 }}>{data.waves.height_ft}</div>
              <div>
                <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 13, color: B.parchment }}>FT</div>
                <div style={{ fontSize: 12, color: B.dust }}>{data.waves.direction}</div>
              </div>
              <div style={{ marginLeft: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px' }}>
                <Stat label="PERIOD" val={`${data.waves.period_s}s`} />
                <Stat label="SWELL"  val={`${data.waves.swell_ft} ft`} />
              </div>
            </div>
            <WaveBar height={data.waves.height_ft} boatMax={boat?.max_wave_ft ?? 4} />
            {data.hourly.length > 0 && (
              <>
                <ExpandButton expanded={waveExpanded} onToggle={() => setWaveExpanded(v => !v)} label="HOURLY WAVE FORECAST" />
                {waveExpanded && <HourlyWaveTable rows={data.hourly} boatType={boatType} />}
              </>
            )}
          </div>

          {/* ── Tides ── */}
          <div style={{ background: B.forest, borderRadius: 8, padding: '16px 20px', border: '1px solid #243824' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 3, color: B.copper }}>🌊 TIDES — {data.tide_station.toUpperCase()}</div>
              <div style={{ fontSize: 9, color: B.dust }}>NOAA Tides & Currents</div>
            </div>
            {data.tides.length > 0 ? (
              <div style={{ display: 'flex', overflowX: 'auto' }}>
                {data.tides.map((t, i) => (
                  <div key={i} style={{ flex: '0 0 auto', minWidth: 100, padding: '10px 8px', textAlign: 'center', borderRight: i < data.tides.length - 1 ? `1px solid ${B.canopy}` : 'none' }}>
                    <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, letterSpacing: 2, color: t.type === 'HIGH' ? B.copper : '#5A9FD4', marginBottom: 4 }}>
                      {t.type === 'HIGH' ? '▲ HIGH' : '▼ LOW'}
                    </div>
                    <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 18, color: B.bone, lineHeight: 1, marginBottom: 3 }}>{t.height}ft</div>
                    <div style={{ fontSize: 10, color: B.dust }}>{t.time}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: B.dust }}>
                Tide data unavailable —{' '}
                <a href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html" target="_blank" rel="noopener noreferrer" style={{ color: B.copper }}>view on NOAA →</a>
              </div>
            )}
          </div>

          {/* ── Sun / Moon / Water / Rain ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <div style={{ background: B.forest, borderRadius: 8, padding: '14px 16px', border: '1px solid #243824' }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 8, letterSpacing: 3, color: B.copper, marginBottom: 10 }}>☀️ SUN</div>
              <Stat label="SUNRISE" val={data.sun.sunrise} />
              <div style={{ marginTop: 8 }}><Stat label="SUNSET" val={data.sun.sunset} /></div>
            </div>
            <div style={{ background: B.forest, borderRadius: 8, padding: '14px 16px', border: '1px solid #243824' }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 8, letterSpacing: 3, color: B.copper, marginBottom: 10 }}>MOON</div>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{data.moon.emoji}</div>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 10, color: B.bone, marginBottom: 2 }}>{data.moon.phase.toUpperCase()}</div>
              <div style={{ fontSize: 10, color: B.dust }}>{data.moon.illumination}%</div>
            </div>
            <div style={{ background: B.forest, borderRadius: 8, padding: '14px 16px', border: '1px solid #243824' }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 8, letterSpacing: 3, color: B.copper, marginBottom: 10 }}>🌡️ WATER</div>
              {data.water.temp_f ? (
                <>
                  <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 32, color: B.bone, lineHeight: 1 }}>{data.water.temp_f}°</div>
                  <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, color: B.dust, marginTop: 3 }}>FAHRENHEIT</div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: B.dust, lineHeight: 1.6 }}>Not available from nearest buoy</div>
              )}
            </div>
            <div style={{ background: B.forest, borderRadius: 8, padding: '14px 16px', border: '1px solid #243824' }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 8, letterSpacing: 3, color: B.copper, marginBottom: 10 }}>🌧️ RAIN</div>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 32, color: data.rain_pct > 60 ? '#5A9FD4' : B.bone, lineHeight: 1 }}>{data.rain_pct}%</div>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, color: B.dust, marginTop: 3 }}>CHANCE TODAY</div>
            </div>
          </div>

          {/* ── Red Tide ── */}
          <div style={{ background: B.forest, borderRadius: 8, padding: '12px 16px', border: '1px solid #243824', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🦠</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 9, letterSpacing: 2, color: B.bone, marginBottom: 2 }}>RED TIDE STATUS</div>
              <div style={{ fontSize: 11, color: B.dust }}>Check FWC for current red tide conditions: <a href="https://myfwc.com/research/redtide/statewide/" target="_blank" rel="noopener noreferrer" style={{ color: B.copper }}>myfwc.com Red Tide Map →</a></div>
            </div>
          </div>

          {/* ── Data sources ── */}
          <div style={{ background: B.forest, borderRadius: 8, padding: '12px 16px', border: '1px solid #243824' }}>
            <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontSize: 8, letterSpacing: 3, color: B.dust, marginBottom: 8 }}>DATA SOURCES</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Marine',  src: 'Open-Meteo Marine',   url: 'https://marine-api.open-meteo.com' },
                { label: 'Weather', src: 'Open-Meteo Weather',  url: 'https://api.open-meteo.com' },
                { label: 'Tides',   src: `NOAA — ${data.tide_station}`, url: 'https://tidesandcurrents.noaa.gov' },
                { label: 'Buoy',    src: `NDBC #${data.buoy.id} (${data.buoy.dist}mi)`, url: `https://www.ndbc.noaa.gov/station_page.php?station=${data.buoy.id}` },
              ].map(s => (
                <div key={s.label} style={{ fontSize: 10 }}>
                  <span style={{ color: B.dust }}>{s.label}: </span>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: B.copper }}>{s.src}</a>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 9, color: B.dust, marginTop: 8, lineHeight: 1.6 }}>
              Always use your own judgment. Saltgrass is a decision aid, not a substitute for local knowledge or official marine forecasts.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
