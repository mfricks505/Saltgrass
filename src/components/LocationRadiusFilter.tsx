'use client'
// src/components/LocationRadiusFilter.tsx
// "Near Me" radius filter for The Market. Uses browser geolocation +
// the listings_within_radius() SQL function.
//
// Usage in market/page.tsx:
//   const [radiusListings, setRadiusListings] = useState<any[] | null>(null)
//   <LocationRadiusFilter category={category} onResults={setRadiusListings} onClear={()=>setRadiusListings(null)} />
//   // then if radiusListings !== null, render those instead of the normal list

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const B = { forest:'#141F14', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }
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
  const [error, setError] = useState('')

  async function search(miles: number) {
    setError(''); setLoading(true)
    if (!navigator.geolocation) { setError('Location not available on this device'); setLoading(false); return }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const { data, error } = await supabase.rpc('listings_within_radius', {
          center_lat: latitude,
          center_lng: longitude,
          radius_miles: miles,
          filter_category: category === 'all' ? null : category,
        })
        if (error) { setError('Search failed — try again'); setLoading(false); return }
        setActive(miles)
        onResults(data ?? [])
        setLoading(false)
      },
      () => { setError('Location permission denied'); setLoading(false) },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  function clear() { setActive(null); onClear() }

  return (
    <div style={{ background:B.forest, border:'1px solid #243824', borderRadius:8, padding:'12px 14px', marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ ...O, fontSize:10, letterSpacing:2, color:B.copper }}>📍 NEAR ME</div>
        {active && <button onClick={clear} style={{ background:'none', border:'none', color:B.dust, fontSize:11, cursor:'pointer' }}>✕ clear</button>}
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {RADII.map(m=>(
          <button key={m} onClick={()=>search(m)} disabled={loading} style={{ flex:1, padding:'8px', borderRadius:5, ...O, fontSize:11, letterSpacing:1, cursor:'pointer', border:`1.5px solid ${active===m?B.copper:B.canopy}`, background:active===m?'rgba(200,146,42,0.15)':'transparent', color:active===m?B.copper:B.parchment }}>
            {m}mi
          </button>
        ))}
      </div>
      {loading && <div style={{ fontSize:11, color:B.dust, marginTop:8 }}>Finding gear near you...</div>}
      {error && <div style={{ fontSize:11, color:'#E07A7A', marginTop:8 }}>{error}</div>}
      {active && !loading && !error && <div style={{ fontSize:11, color:B.parchment, marginTop:8 }}>Showing gear within {active} miles, closest first.</div>}
    </div>
  )
}
