'use client'
// src/app/regs/page.tsx
// Florida Regulations Quick-Check — "is gag grouper open?" answered instantly.
// The daily-utility hook. Searchable, shows season status front and center.

import { useState } from 'react'
import { FL_REGULATIONS, searchRegs, isInSeason, type Regulation } from '@/lib/regulations'
import RundownNav from '@/components/RundownNav'

const B = {
  midnight:'#0A0C08', forest:'#141F14', moss:'#1C2E1C', copper:'#C8922A',
  bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358',
  go:'#1A3A1A', goText:'#7AE07A', goBorder:'#3D7A3D',
  nogo:'#2A1010', nogoText:'#E07A7A', nogoBorder:'#8A1A1A',
}
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

export default function RegsPage() {
  const [query, setQuery] = useState('')
  const [coast, setCoast] = useState<'gulf'|'atlantic'>('gulf')
  const results = searchRegs(query)

  return (
    <div style={{ maxWidth:680, margin:'0 auto' }}>
      <div style={{ padding:'8px 4px 14px' }}>
        <div style={{ ...O, fontSize:11, letterSpacing:3, color:B.copper }}>KNOW BEFORE YOU KEEP</div>
        <div style={{ ...O, fontSize:28, color:B.bone, letterSpacing:1, lineHeight:1.1, marginTop:2 }}>FL REGULATIONS</div>
        <div style={{ fontSize:13, color:B.parchment, marginTop:6, lineHeight:1.6 }}>
          Size, bag, and season at a glance. Tap a species for the details.
        </div>
      </div>

      {/* Search */}
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="🔍 Search species — redfish, grouper, snook..."
        style={{ width:'100%', background:B.forest, border:`1px solid rgba(255,255,255,0.12)`, borderRadius:8, color:B.bone, padding:'13px 16px', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:8, fontFamily:'Inter,sans-serif' }}
      />

      {/* Coast toggle */}
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        {(['gulf','atlantic'] as const).map(c => (
          <button key={c} onClick={() => setCoast(c)} style={{ flex:1, padding:'9px', borderRadius:6, border:`1.5px solid ${coast===c ? B.copper : 'rgba(255,255,255,0.1)'}`, background:coast===c ? 'rgba(200,146,42,0.12)' : 'transparent', color:coast===c ? B.copper : B.parchment, cursor:'pointer', ...O, fontSize:11, letterSpacing:2 }}>
            {c === 'gulf' ? '🌅 GULF COAST' : '🌊 ATLANTIC COAST'}
          </button>
        ))}
      </div>

      {/* Results */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {results.map(reg => <RegCard key={reg.species} reg={reg} coast={coast} />)}
        {results.length === 0 && (
          <div style={{ textAlign:'center', padding:'30px', color:B.dust, fontSize:13 }}>
            No match for "{query}". Try redfish, trout, snook, grouper, snapper, cobia...
          </div>
        )}
      </div>

      {/* FWC disclaimer */}
      <div style={{ marginTop:16, padding:'14px 16px', background:B.forest, borderRadius:8, border:`1px solid rgba(255,255,255,0.05)` }}>
        <div style={{ fontSize:12, color:B.parchment, lineHeight:1.7 }}>
          ⚠️ Regulations change frequently — especially grouper and snapper seasons. Always confirm current rules at{' '}
          <a href="https://myfwc.com/fishing/saltwater/recreational/" target="_blank" rel="noopener noreferrer" style={{ color:B.copper }}>myfwc.com</a>
          {' '}before keeping any fish. This is a quick reference, not legal authority.
        </div>
      </div>
    </div>
  )
}

function RegCard({ reg, coast }: { reg: Regulation; coast: 'gulf'|'atlantic' }) {
  const [open, setOpen] = useState(false)
  const season = isInSeason(reg)

  // Pull coast-specific overrides if present
  const coastData = coast === 'gulf' ? reg.gulf : reg.atlantic
  const minSize = coastData?.minSize ?? reg.minSize
  const bag = coastData?.bag ?? reg.bagLimit

  const sizeLabel = reg.slotMin && reg.slotMax
    ? `${reg.slotMin}"–${reg.slotMax}" slot`
    : minSize ? `${minSize}" min` : '—'

  return (
    <div style={{ background:B.forest, borderRadius:8, border:`1px solid ${season.open ? 'rgba(122,224,122,0.2)' : 'rgba(224,122,122,0.2)'}`, overflow:'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width:'100%', background:'transparent', border:'none', padding:'14px 16px', cursor:'pointer', textAlign:'left' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ ...O, fontSize:16, color:B.bone, letterSpacing:1 }}>{reg.species.toUpperCase()}</div>
            <div style={{ fontSize:12, color:B.parchment, marginTop:4, display:'flex', gap:12 }}>
              <span>📏 {sizeLabel}</span>
              <span>🪣 {typeof bag === 'number' ? `${bag}/day` : bag}</span>
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ background: season.open ? B.go : B.nogo, color: season.open ? B.goText : B.nogoText, borderRadius:4, padding:'4px 10px', ...O, fontSize:10, letterSpacing:1, border:`1px solid ${season.open ? B.goBorder : B.nogoBorder}` }}>
              {season.open ? '● OPEN' : '● CLOSED'}
            </div>
          </div>
        </div>
      </button>
      {open && (
        <div style={{ padding:'0 16px 14px', borderTop:`1px solid rgba(255,255,255,0.05)`, marginTop:2, paddingTop:12 }}>
          {coastData?.seasonNote && (
            <div style={{ fontSize:12, color:B.copper, marginBottom:8 }}>📅 {coast === 'gulf' ? 'Gulf' : 'Atlantic'}: {coastData.seasonNote}</div>
          )}
          {reg.season.note && !coastData?.seasonNote && (
            <div style={{ fontSize:12, color:B.copper, marginBottom:8 }}>📅 {reg.season.note}</div>
          )}
          {reg.notes && <div style={{ fontSize:12, color:B.parchment, lineHeight:1.7 }}>{reg.notes}</div>}
        </div>
      )}
    </div>
  )
}
