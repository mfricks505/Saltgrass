'use client'
// src/components/ReportButton.tsx
// Reusable report control. Drop onto any post/listing/wall item/guide/trip.
// <ReportButton itemType="listing" itemId={listing.id} />

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const O = { fontFamily: "'Oswald', sans-serif" }
const REASONS = [
  { id: 'spam', label: 'Spam' },
  { id: 'scam', label: 'Scam / fraud' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'other', label: 'Something else' },
]

export default function ReportButton({ itemType, itemId, compact = false }: { itemType: string; itemId: string; compact?: boolean }) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [detail, setDetail] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit() {
    if (!reason) return
    setBusy(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth/login'; return }
    await supabase.from('reports').insert({
      reporter_id: user.id, item_type: itemType, item_id: itemId, reason, detail: detail.trim() || null,
    })
    setBusy(false); setDone(true)
    setTimeout(() => { setOpen(false); setDone(false); setReason(''); setDetail('') }, 1800)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} title="Report" style={{ background: 'none', border: 'none', color: 'var(--dust)', cursor: 'pointer', fontSize: compact ? 13 : 12, padding: compact ? 2 : '4px 8px', opacity: 0.7 }}>
        {compact ? '⚐' : '⚐ Report'}
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 22, maxWidth: 380, width: '100%' }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>✓</div>
                <div style={{ ...O, fontSize: 15, color: 'var(--sun)', letterSpacing: 1 }}>REPORT SENT</div>
                <div style={{ fontSize: 12, color: 'var(--dust)', marginTop: 6 }}>Thanks for keeping Saltgrass clean. We'll review it.</div>
              </div>
            ) : (
              <>
                <div style={{ ...O, fontSize: 16, letterSpacing: 1, color: 'var(--sun)', marginBottom: 14 }}>REPORT THIS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {REASONS.map(r => (
                    <button key={r.id} onClick={() => setReason(r.id)} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 6, cursor: 'pointer', border: `1.5px solid ${reason === r.id ? 'var(--accent)' : 'var(--border)'}`, background: reason === r.id ? 'rgba(212,152,46,0.12)' : 'transparent', color: reason === r.id ? 'var(--accent)' : 'var(--sub)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                      {r.label}
                    </button>
                  ))}
                </div>
                <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={2} placeholder="Add detail (optional)" style={{ width: '100%', background: 'var(--silhouette)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'Inter, sans-serif', marginBottom: 12 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setOpen(false)} style={{ flex: 1, background: 'transparent', color: 'var(--sub)', border: '1px solid var(--border)', borderRadius: 6, padding: '11px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={submit} disabled={!reason || busy} style={{ ...O, flex: 1, background: 'var(--accent)', color: 'var(--silhouette)', border: 'none', borderRadius: 6, padding: '11px', fontSize: 12, letterSpacing: 1, cursor: reason ? 'pointer' : 'not-allowed', opacity: reason ? 1 : 0.5 }}>{busy ? 'SENDING...' : 'SUBMIT'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
