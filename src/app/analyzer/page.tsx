'use client'
// src/app/analyzer/page.tsx
// The Rundown — two modes:
//   QUICK CHECK: pick region/zone/boat, get conditions (the existing flow)
//   PLAN MY RUN: drop pins on a map, get per-leg breakdown + trip verdict
// RouteMap is dynamically imported (Leaflet can't SSR).

import { useState } from 'react'
import dynamic from 'next/dynamic'

const RouteMap = dynamic(() => import('@/components/RouteMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height:380, borderRadius:8, background:'#14263F', display:'flex', alignItems:'center', justifyContent:'center', color:'#6B6358', fontFamily:'Impact, sans-serif', letterSpacing:2 }}>
      LOADING MAP...
    </div>
  ),
})

// Import the existing quick-check UI as its own component.
// (This is the zone/region/boat flow from the previous analyzer-v2.tsx —
//  paste that JSX into QuickCheck below, OR keep your current page as QuickCheck.)
import QuickCheck from '@/components/RundownQuickCheck'

const B = { blue:'#0B1626', blueSurf:'#14263F', blueCard:'#1B2F4A', blueAcc:'#5BA3E0', bone:'#E8DFC8', parchment:'#C4BFA6', forest:'#14263F', copper:'#C8922A', dust:'#9A9580' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

export default function RundownPage() {
  const [mode, setMode] = useState<'quick'|'route'>('quick')

  return (
    <div style={{ maxWidth:780, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(160deg, ${B.blue}, #1B2F4A)`, borderRadius:8, padding:'24px 26px', marginBottom:10, border:`1px solid rgba(91,163,224,0.25)` }}>
        <div style={{ ...O, fontSize:12, letterSpacing:4, color:B.blueAcc, marginBottom:6 }}>SALTGRASS</div>
        <div style={{ ...O, fontSize:30, color:B.bone, marginBottom:6, letterSpacing:1 }}>THE RUNDOWN</div>
        <div style={{ fontSize:13, color:B.parchment, lineHeight:1.7 }}>
          Know before you go. Quick conditions check, or plan your whole run pin by pin.
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        <button onClick={() => setMode('quick')} style={{ flex:1, padding:'12px', borderRadius:6, border:`2px solid ${mode==='quick' ? B.copper : 'rgba(255,255,255,0.08)'}`, background:mode==='quick' ? 'rgba(200,146,42,0.15)' : B.forest, color:mode==='quick' ? B.copper : B.parchment, cursor:'pointer', ...O, fontSize:12, letterSpacing:2 }}>
          ⚡ QUICK CHECK
        </button>
        <button onClick={() => setMode('route')} style={{ flex:1, padding:'12px', borderRadius:6, border:`2px solid ${mode==='route' ? B.copper : 'rgba(255,255,255,0.08)'}`, background:mode==='route' ? 'rgba(200,146,42,0.15)' : B.forest, color:mode==='route' ? B.copper : B.parchment, cursor:'pointer', ...O, fontSize:12, letterSpacing:2 }}>
          📍 PLAN MY RUN
        </button>
      </div>

      {mode === 'quick' ? <QuickCheck /> : <RouteMap />}
    </div>
  )
}
