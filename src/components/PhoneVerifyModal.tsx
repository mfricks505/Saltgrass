'use client'
// src/components/PhoneVerifyModal.tsx
// Uses Supabase built-in email OTP — completely free, no Twilio needed
// Replaces the SMS version

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

const B = {
  surf:'#3D4535', card:'#333B2C', sil:'#1A1E14',
  sun:'#E8DFC8', sub:'#B8B49A', dust:'#8A866E',
  border:'rgba(232,223,200,0.10)', accent:'#D4982E',
}
const O = { fontFamily:"'Oswald', sans-serif" }

interface Props {
  userId: string
  email: string
  onVerified: () => void
  onSkip?: () => void
}

export default function PhoneVerifyModal({ userId, email, onVerified, onSkip }: Props) {
  const supabase = createClient()
  const [step,    setStep]    = useState<'intro'|'code'>('intro')
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function sendOTP() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    })
    if (error) { setError('Could not send code. Try again.'); setLoading(false); return }
    setStep('code')
    setLoading(false)
  }

  async function verifyOTP() {
    if (code.length !== 6) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email'
    })
    if (error) { setError('Invalid or expired code. Try again.'); setLoading(false); return }

    // Mark user as verified in profiles (Level 2)
    await supabase.from('profiles').update({
      phone_verified: true,
      phone_verified_at: new Date().toISOString(),
      level: 2,
    }).eq('id', userId)

    setLoading(false)
    onVerified()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ background:B.surf, borderRadius:8, padding:32, maxWidth:420, width:'100%', border:`1px solid ${B.border}` }}>

        {step === 'intro' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:22 }}>
              <div style={{ fontSize:44, marginBottom:10 }}>✉️</div>
              <div style={{ ...O, fontSize:20, letterSpacing:2, color:B.sun, marginBottom:6 }}>VERIFY YOUR EMAIL</div>
              <p style={{ fontSize:13, color:B.sub, lineHeight:1.75, margin:0 }}>
                We'll send a 6-digit code to <strong style={{ color:B.sun }}>{email}</strong> to confirm it's you.
              </p>
            </div>

            <div style={{ background:B.card, borderRadius:6, padding:'12px 14px', marginBottom:18, border:`1px solid ${B.border}` }}>
              {[
                { icon:'📋', text:'Post to The Board' },
                { icon:'💬', text:'Message other members' },
                { icon:'🔍', text:'See guide contact info' },
              ].map((f,i) => (
                <div key={f.text} style={{ display:'flex', gap:10, padding:'5px 0', borderBottom:i<2?`1px solid ${B.border}`:'none', fontSize:12, color:B.sub }}>
                  <span>{f.icon}</span><span>{f.text}</span>
                </div>
              ))}
            </div>

            {error && <div style={{ fontSize:12, color:'#E07A7A', marginBottom:10, textAlign:'center' }}>{error}</div>}

            <button onClick={sendOTP} disabled={loading} style={{ width:'100%', background:B.accent, color:B.sil, border:'none', borderRadius:4, padding:'13px', ...O, fontSize:13, fontWeight:600, letterSpacing:2, cursor:'pointer', opacity:loading?0.7:1, marginBottom:10 }}>
              {loading ? 'SENDING...' : 'SEND CODE →'}
            </button>
            {onSkip && (
              <button onClick={onSkip} style={{ width:'100%', background:'none', border:'none', color:B.dust, fontSize:12, cursor:'pointer', ...O, letterSpacing:1 }}>
                SKIP FOR NOW
              </button>
            )}
          </div>
        )}

        {step === 'code' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:22 }}>
              <div style={{ fontSize:44, marginBottom:10 }}>📬</div>
              <div style={{ ...O, fontSize:20, letterSpacing:2, color:B.sun, marginBottom:6 }}>CHECK YOUR EMAIL</div>
              <p style={{ fontSize:13, color:B.sub, lineHeight:1.75, margin:0 }}>
                Sent to <strong style={{ color:B.sun }}>{email}</strong>.<br/>Valid for 10 minutes.
              </p>
            </div>

            <input
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
              onKeyDown={e => e.key === 'Enter' && verifyOTP()}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              style={{ background:B.sil, border:`1.5px solid ${B.border}`, borderRadius:4, color:B.accent, fontSize:36, fontWeight:700, padding:'14px', width:'100%', outline:'none', boxSizing:'border-box' as any, textAlign:'center', letterSpacing:14, marginBottom:12, fontFamily:'Inter,sans-serif' }}
            />

            {error && <div style={{ fontSize:12, color:'#E07A7A', marginBottom:10, textAlign:'center' }}>{error}</div>}

            <button onClick={verifyOTP} disabled={loading || code.length !== 6} style={{ width:'100%', background:code.length===6?B.accent:B.border, color:code.length===6?B.sil:B.dust, border:'none', borderRadius:4, padding:'13px', ...O, fontSize:13, fontWeight:600, letterSpacing:2, cursor:code.length===6?'pointer':'not-allowed', opacity:loading?0.7:1, marginBottom:10 }}>
              {loading ? 'VERIFYING...' : 'CONFIRM'}
            </button>
            <button onClick={() => { setStep('intro'); setCode(''); setError('') }} style={{ width:'100%', background:'none', border:'none', color:B.dust, fontSize:12, cursor:'pointer' }}>
              ← Resend code
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
