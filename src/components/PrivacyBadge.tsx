'use client'
// src/components/PrivacyBadge.tsx
// Small reusable trust badge. Drop it on the catch log, photo upload, routes.
// <PrivacyBadge text="Zone only — your exact spot is never stored" />

const B = { goText:'#7AE07A', goBorder:'#3D7A3D', dust:'#6B6358' }

export default function PrivacyBadge({ text }: { text: string }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(26,58,26,0.3)', border:`1px solid ${B.goBorder}55`, borderRadius:20, padding:'4px 12px', fontSize:11, color:B.goText }}>
      <span>🔒</span><span>{text}</span>
    </div>
  )
}
