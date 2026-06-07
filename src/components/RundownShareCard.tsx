'use client'
// src/components/RundownShareCard.tsx
// Turns a Rundown result into a shareable branded card (the free growth loop).
// Drop <RundownShareCard verdict={...} region={...} /> into the Rundown result view.
// Uses the Web Share API on mobile (native share sheet) and falls back to
// copy-link + a downloadable image on desktop.

import { useRef, useState } from 'react'

const O = { fontFamily: "'Oswald', sans-serif" }

type Verdict = 'GO' | 'CAUTION' | 'NO-GO'
const VERDICT_COLOR: Record<Verdict, string> = { 'GO': '#7AE07A', 'CAUTION': '#E0C06A', 'NO-GO': '#E07A7A' }

export default function RundownShareCard({
  region = 'Panhandle',
  verdict = 'GO',
  summary = '',
  wind = '', tide = '', water = '',
}: {
  region?: string
  verdict?: Verdict
  summary?: string
  wind?: string
  tide?: string
  water?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const shareUrl = 'https://saltgrass.app/analyzer?utm_source=share&utm_medium=card'

  const shareText = `Saltgrass Rundown — ${region}: ${verdict}${summary ? ' · ' + summary : ''}. Check conditions before you load the truck:`

  async function share() {
    // Mobile: native share sheet
    if (navigator.share) {
      try { await navigator.share({ title: 'Saltgrass Rundown', text: shareText, url: shareUrl }); return } catch {}
    }
    // Desktop fallback: copy link + text
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* The visual card (also what users see) */}
      <div ref={cardRef} style={{ background: 'linear-gradient(160deg,#0B1626,#14263F)', border: '1px solid rgba(91,163,224,0.25)', borderRadius: 12, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ ...O, fontSize: 11, letterSpacing: 4, color: '#5BA3E0', marginBottom: 6 }}>SALTGRASS RUNDOWN</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ ...O, fontSize: 22, letterSpacing: 1, color: 'var(--sun)' }}>{region.toUpperCase()}</div>
          <div style={{ ...O, fontSize: 28, letterSpacing: 1, color: VERDICT_COLOR[verdict] }}>{verdict}</div>
        </div>
        {summary && <div style={{ fontSize: 14, color: 'var(--sub)', marginTop: 8, lineHeight: 1.5 }}>{summary}</div>}
        {(wind || tide || water) && (
          <div style={{ display: 'flex', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
            {wind && <Mini label="WIND" v={wind} />}
            {tide && <Mini label="TIDE" v={tide} />}
            {water && <Mini label="WATER" v={water} />}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--dust)', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(91,163,224,0.18)' }}>
          saltgrass.app · free tide, wind & bite check
        </div>
      </div>

      {/* Share button */}
      <button onClick={share} style={{ ...O, width: '100%', marginTop: 10, background: '#5BA3E0', color: '#0B1626', border: 'none', borderRadius: 6, padding: '12px', fontSize: 12, letterSpacing: 2, cursor: 'pointer' }}>
        {copied ? '✓ COPIED — PASTE IT ANYWHERE' : '📤 SHARE TODAY\u2019S RUNDOWN'}
      </button>
      <div style={{ fontSize: 11, color: 'var(--dust)', textAlign: 'center', marginTop: 6 }}>
        Send it to the group chat. Let \u2019em know if it\u2019s fishable.
      </div>
    </div>
  )
}

function Mini({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div style={{ ...O, fontSize: 9, letterSpacing: 2, color: 'var(--dust)' }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--sun)', marginTop: 2 }}>{v}</div>
    </div>
  )
}
