'use client'
// src/components/BadgeRack.tsx
// Shows a member's earned badges + reputation title. Drop on profiles.
// <BadgeRack inputs={{ catchCount, speciesCount, slamsComplete, ... }} />

import { computeBadges, reputationTitle, type BadgeInputs } from '@/lib/badges'

const B = { forest:'#141F14', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

export default function BadgeRack({ inputs, showLocked = false }: { inputs: BadgeInputs; showLocked?: boolean }) {
  const badges = computeBadges(inputs)
  const rep = reputationTitle(inputs)
  const shown = showLocked ? badges : badges.filter(b=>b.earned)

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
        <span style={{ fontSize:22 }}>{rep.icon}</span>
        <div>
          <div style={{ fontSize:9, ...O, letterSpacing:2, color:B.dust }}>REPUTATION</div>
          <div style={{ ...O, fontSize:15, letterSpacing:0.5, color:B.copper }}>{rep.title}</div>
        </div>
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        {shown.map(b=>(
          <div key={b.id} title={b.desc} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:14, background:b.earned?'rgba(200,146,42,0.12)':'rgba(255,255,255,0.03)', border:b.earned?`1px solid ${B.copper}44`:'1px solid transparent', opacity:b.earned?1:0.4 }}>
            <span style={{ fontSize:14 }}>{b.icon}</span>
            <span style={{ fontSize:11, color:b.earned?B.bone:B.dust }}>{b.label}</span>
          </div>
        ))}
        {shown.length===0 && <div style={{ fontSize:12, color:B.dust }}>No badges yet — get out there.</div>}
      </div>
    </div>
  )
}
