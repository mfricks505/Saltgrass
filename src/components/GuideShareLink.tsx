'use client'
// src/components/GuideShareLink.tsx
// Gives a guide a copyable booking link for their IG bio / texts.
// <GuideShareLink guideId={guide.id} businessName={guide.business_name} />

import { useState } from 'react'

const O = { fontFamily: "'Oswald', sans-serif" }

export default function GuideShareLink({ guideId, businessName = '' }: { guideId: string; businessName?: string }) {
  const [copied, setCopied] = useState(false)
  const url = `https://saltgrass.app/guides/${guideId}`

  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  async function share() {
    const text = `Book a trip with ${businessName || 'me'} on Saltgrass:`
    if (navigator.share) { try { await navigator.share({ title: businessName || 'Saltgrass Guide', text, url }); return } catch {} }
    copy()
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
      <div style={{ ...O, fontSize: 11, letterSpacing: 2, color: 'var(--accent)', marginBottom: 8 }}>YOUR BOOKING LINK</div>
      <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 10, lineHeight: 1.5 }}>Put this in your Instagram bio, texts, or website. Customers book you directly.</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ flex: 1, background: 'var(--silhouette)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', fontSize: 13, color: 'var(--sun)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</div>
        <button onClick={copy} style={{ ...O, background: copied ? '#7AE07A' : 'var(--accent)', color: 'var(--silhouette)', border: 'none', borderRadius: 6, padding: '10px 14px', fontSize: 11, letterSpacing: 1, cursor: 'pointer', flexShrink: 0 }}>{copied ? '✓ COPIED' : 'COPY'}</button>
      </div>
      <button onClick={share} style={{ ...O, width: '100%', marginTop: 8, background: 'transparent', color: 'var(--accent)', border: '1.5px solid var(--accent)', borderRadius: 6, padding: '10px', fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>📤 SHARE</button>
    </div>
  )
}
