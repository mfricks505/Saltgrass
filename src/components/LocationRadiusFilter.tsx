'use client'
// src/components/LocationRadiusFilter.tsx
// "Near Me" radius filter. Degrades gracefully if location is denied/unavailable —
// shows a clear message and the user can just keep using the region filter instead.

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const B = { forest:'var(--surface)', canopy:'var(--border)', copper:'var(--accent)', bone:'var(--sun)', parchment:'var(--sub)', dust:'var(--dust)' }
const O = { fontFamily: "'Oswald', sans-serif" }
const RADII = [10, 25, 50, 100]

export default function LocationRadiusFilter({
  category, onResults, onClear,
}: {
  category: string
  onResults: (listings: any[]) => void
  onClear: () => void
}) {
  const supabase = createClient()
  const [active, setActive] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<'idle'|'denied'|'unavailable'|'error'|'ok'>('idle')

  async function search(miles: number) {
    setState('idle'); setLoading(true)
    if (!('geolocation' in navigator)) { setState('unavailable'); setLoading(false); return }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const { data, error } = await supabase.rpc('listings_within_radius', {
            center_lat: latitude, center_lng: longitude,
            radius_miles: miles, filter_category: category === 'all' ? null : category,
          })
          if (error) { setState('error'); setLoading(false); return }
          setActive(miles); setState('ok'); onResults(data ?? []); setLoading(false)
        } catch { setState('error'); setLoading(false) }
      },
      (err) => {
        // 1 = permission denied, 2 = position unavailable, 3 = timeout
        setState(err.code === 1 ? 'denied' : 'unavailable')
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  function clear() { setActive(null); setState('idle'); onClear() }

  return (
    <div style={{ background: B.forest, border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ ...O, fontSize: 11, letterSpacing: 2, color: B.copper }}>📍 NEAR ME</div>
        {active && <button onClick={clear} style={{ background: 'none', border: 'none', color: B.dust, fontSize: 12, cursor: 'pointer' }}>✕ clear</button>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {RADII.map(m => (
          <button key={m} onClick={() => search(m)} disabled={loading} style={{ flex: 1, padding: '8px', borderRadius: 5, ...O, fontSize: 12, letterSpacing: 1, cursor: loading ? 'wait' : 'pointer', border: `1.5px solid ${active === m ? B.copper : 'var(--border)'}`, background: active === m ? 'rgba(212,152,46,0.15)' : 'transparent', color: active === m ? B.copper : B.parchment }}>
            {m}mi
          </button>
        ))}
      </div>

      {loading && <div style={{ fontSize: 12, color: B.dust, marginTop: 8 }}>Finding gear near you...</div>}
      {state === 'ok' && active && !loading && <div style={{ fontSize: 12, color: B.parchment, marginTop: 8 }}>Showing gear within {active} miles, closest first.</div>}

      {/* Graceful fallbacks — never a dead end */}
      {state === 'denied' && (
        <div style={{ fontSize: 12, color: B.parchment, marginTop: 8, lineHeight: 1.5 }}>
          Location is turned off for this site, so distance search isn't available. You can turn it on in your browser's site settings — or just use the <strong style={{ color: B.copper }}>region filter</strong> below to browse by area.
        </div>
      )}
      {state === 'unavailable' && (
        <div style={{ fontSize: 12, color: B.parchment, marginTop: 8, lineHeight: 1.5 }}>
          Couldn't get your location right now. No problem — use the <strong style={{ color: B.copper }}>region filter</strong> below to browse by area instead.
        </div>
      )}
      {state === 'error' && (
        <div style={{ fontSize: 12, color: B.parchment, marginTop: 8, lineHeight: 1.5 }}>
          Something went wrong with the search. Try again, or use the <strong style={{ color: B.copper }}>region filter</strong> below.
        </div>
      )}
    </div>
  )
}
