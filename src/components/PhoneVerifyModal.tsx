'use client'
// src/components/PhoneVerifyModal.tsx — v2 (Twilio API)

import { useState } from 'react'
import toast from 'react-hot-toast'

const O = { fontFamily: "'Oswald', sans-serif" }
const B = {
  surf: '#3D4535', card: '#333B2C', sil: '#1A1E14',
  sun: '#E8DFC8', sub: '#B8B49A', dust: '#8A866E',
  border: 'rgba(232,223,200,0.10)', accent: '#D4982E',
}

interface Props {
  userId: string
  onVerified: () => void
  onSkip?: () => void
}

export default function PhoneVerifyModal({ userId, onVerified, onSkip }: Props) {
  const [step,    setStep]    = useState<'phone' | 'code'>('phone')
  const [phone,   setPhone]   = useState('')
  const [code,    setCode]    = useState('')
  const [sending, setSending] = useState(false)

  async function sendCode() {
    if (!phone.trim()) return
    setSending(true)
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/verify/phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim(), user_id: userId }),
    })
    setSending(false)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error ?? 'Failed to send code')
      return
    }
    setStep('code')
  }

  async function confirmCode() {
    if (code.length < 6) return
    setSending(true)
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/verify/phone`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim(), code: code.trim(), user_id: userId }),
    })
    setSending(false)
    if (!res.ok) {
      toast.error('Invalid code — try again')
      return
    }
    toast.success('Phone verified! You\'re now Level 2.')
    onVerified()
  }

  const UNLOCKS = [
    { icon: 'POST', label: 'Post to The Board' },
    { icon: 'MSG',  label: 'Message members' },
    { icon: 'VIEW', label: 'See guide contacts' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: B.surf, borderRadius: 8, padding: 28, maxWidth: 420, width: '100%', border: `1px solid ${B.border}` }}>

        <div style={{ ...O, fontSize: 18, letterSpacing: 2, color: B.sun, marginBottom: 4 }}>VERIFY YOUR PHONE</div>
        <p style={{ fontSize: 12, color: B.sub, lineHeight: 1.7, marginBottom: 16 }}>
          One-time step. Unlocks Level 2 — no spam, ever.
        </p>

        {/* Unlock list */}
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '12px 14px', marginBottom: 20 }}>
          {UNLOCKS.map(u => (
            <div key={u.icon} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, fontSize: 12, color: B.sun }}>
              <span style={{ ...O, fontSize: 9, letterSpacing: 1, color: B.accent, background: 'rgba(212,152,46,0.12)', borderRadius: 3, padding: '2px 5px' }}>{u.icon}</span>
              {u.label}
            </div>
          ))}
        </div>

        {step === 'phone' && (
          <div>
            <label style={{ ...O, fontSize: 9, letterSpacing: 2, color: B.dust, display: 'block', marginBottom: 6 }}>YOUR PHONE NUMBER</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (850) 555-0100"
              type="tel"
              style={{ background: B.sil, border: `1.5px solid ${B.border}`, borderRadius: 4, color: B.sun, fontSize: 16, padding: '12px 14px', width: '100%', outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
            />
            <button onClick={sendCode} disabled={sending || !phone.trim()} style={{ width: '100%', background: phone.trim() ? B.accent : B.border, color: phone.trim() ? B.sil : B.dust, border: 'none', borderRadius: 4, padding: '13px', ...O, fontSize: 13, letterSpacing: 2, cursor: phone.trim() ? 'pointer' : 'not-allowed' }}>
              {sending ? 'SENDING...' : 'SEND CODE'}
            </button>
          </div>
        )}

        {step === 'code' && (
          <div>
            <div style={{ ...O, fontSize: 12, letterSpacing: 2, color: B.sun, marginBottom: 4 }}>ENTER 6-DIGIT CODE</div>
            <div style={{ fontSize: 12, color: B.dust, marginBottom: 14 }}>Sent to {phone}</div>
            <input
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              style={{ background: B.sil, border: `1.5px solid ${B.border}`, borderRadius: 4, color: B.accent, fontSize: 28, fontWeight: 700, padding: '12px', width: '100%', outline: 'none', boxSizing: 'border-box', textAlign: 'center', letterSpacing: 10, marginBottom: 14 }}
            />
            <button onClick={confirmCode} disabled={sending || code.length < 6} style={{ width: '100%', background: code.length >= 6 ? B.accent : B.border, color: code.length >= 6 ? B.sil : B.dust, border: 'none', borderRadius: 4, padding: '13px', ...O, fontSize: 13, letterSpacing: 2, cursor: code.length >= 6 ? 'pointer' : 'not-allowed' }}>
              {sending ? 'VERIFYING...' : 'CONFIRM'}
            </button>
            <button onClick={() => { setStep('phone'); setCode('') }} style={{ width: '100%', background: 'none', border: 'none', color: B.dust, fontSize: 12, marginTop: 8, cursor: 'pointer' }}>
              Change number
            </button>
          </div>
        )}

        {onSkip && (
          <button onClick={onSkip} style={{ width: '100%', background: 'none', border: 'none', color: B.dust, fontSize: 12, marginTop: 16, cursor: 'pointer' }}>
            Skip for now — verify later
          </button>
        )}
      </div>
    </div>
  )
}
