'use client'
// src/app/auth/signup/page.tsx
// Email-verified signup with a 6-digit OTP code. Stops casual bots/fake signups.
// Flow: fill form → signUp → 6-digit code emailed → enter code → verifyOtp → profile created → in.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'
import toast from 'react-hot-toast'

const O = { fontFamily: "'Oswald', sans-serif" }

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ email: '', password: '', username: '', full_name: '', home_region: '' })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [code, setCode] = useState('')
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  // STEP 1 — create the auth user; Supabase emails a 6-digit code
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!form.username.trim()) { toast.error('Username is required'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { username: form.username.toLowerCase().trim(), full_name: form.full_name.trim(), home_region: form.home_region } },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    // If email confirmation is ON, there's no session yet — go to code entry.
    setStep('verify')
    setLoading(false)
    toast.success('Code sent — check your email')
  }

  // STEP 2 — verify the 6-digit code, then create the profile row
  async function verifyCode() {
    const token = code.trim()
    if (token.length < 6) { toast.error('Enter the code from your email'); return }
    setLoading(true)

    const { data, error } = await supabase.auth.verifyOtp({
      email: form.email.trim(),
      token,
      type: 'signup',
    })
    if (error) { toast.error(error.message || 'Invalid or expired code'); setLoading(false); return }

    const user = data.user
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        username: form.username.toLowerCase().trim(),
        full_name: form.full_name.trim() || null,
        home_region: form.home_region || null,
      })
    }
    toast.success('Welcome to Saltgrass!')
    router.push('/')
    setLoading(false)
  }

  async function resend() {
    const { error } = await supabase.auth.resend({ type: 'signup', email: form.email.trim() })
    if (error) toast.error(error.message); else toast.success('New code sent')
  }

  const inputStyle = {
    background: 'rgba(26,30,20,0.6)', border: '1.5px solid rgba(232,223,200,0.12)',
    borderRadius: 4, color: 'var(--text)', fontSize: 15, padding: '11px 14px',
    width: '100%', outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'Inter, sans-serif', marginBottom: 14,
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto 0' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 6, border: '1px solid var(--border)', boxShadow: '0 8px 40px rgba(0,0,0,0.4)', overflow: 'hidden' }}>

        <div style={{ background: 'var(--card)', padding: '24px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ ...O, fontWeight: 700, fontSize: 28, letterSpacing: '4px', color: 'var(--sun)', textTransform: 'uppercase', marginBottom: 4 }}>SALTGRASS</div>
          <div style={{ fontSize: 13, color: 'var(--sub)' }}>Join Florida's outdoors community</div>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {step === 'form' ? (
            <>
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { key: 'full_name', label: 'FULL NAME',  placeholder: 'Wild Bill',      type: 'text',     required: false },
                  { key: 'username',  label: 'USERNAME',   placeholder: 'riverroller88',  type: 'text',     required: true  },
                  { key: 'email',     label: 'EMAIL',      placeholder: 'you@email.com',  type: 'email',    required: true  },
                  { key: 'password',  label: 'PASSWORD',   placeholder: '6+ characters',  type: 'password', required: true  },
                ].map(({ key, label, placeholder, type, required }) => (
                  <div key={key}>
                    <label style={{ ...O, fontSize: 10, fontWeight: 500, letterSpacing: '2px', color: 'var(--dust)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
                    </label>
                    <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} required={required} style={inputStyle} />
                  </div>
                ))}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ ...O, fontSize: 10, fontWeight: 500, letterSpacing: '2px', color: 'var(--dust)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>HOME REGION</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                    {REGIONS.map(r => (
                      <button key={r.id} type="button" onClick={() => set('home_region', r.id)} style={{
                        padding: '10px 12px', borderRadius: 4, cursor: 'pointer',
                        border: `1.5px solid ${form.home_region === r.id ? 'var(--accent)' : 'rgba(232,223,200,0.12)'}`,
                        background: form.home_region === r.id ? 'rgba(212,152,46,0.15)' : 'transparent',
                        color: form.home_region === r.id ? 'var(--accent)' : 'var(--sub)',
                        display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 12,
                      }}>
                        <span style={{ fontSize: 16 }}>{r.icon}</span><span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ ...O, background: 'var(--accent)', color: 'var(--silhouette)', border: 'none', borderRadius: 4, padding: '13px', fontSize: 14, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'SENDING CODE...' : 'CREATE ACCOUNT'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--dust)' }}>
                Already have an account? <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>📬</div>
              <div style={{ ...O, fontSize: 20, letterSpacing: 1, color: 'var(--sun)', marginBottom: 6 }}>CHECK YOUR EMAIL</div>
              <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 4 }}>We sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{form.email}</strong></div>
              <div style={{ fontSize: 12, color: 'var(--dust)', marginBottom: 20 }}>Enter it below to verify you're a real one.</div>
              <input
                value={code}
                onChange={e => setCode(e.target.value.replace(/\s/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') verifyCode() }}
                inputMode="numeric"
                autoFocus
                placeholder="Enter code"
                style={{ width: '100%', height: 56, textAlign: 'center', fontSize: 28, letterSpacing: 8, ...O, background: 'rgba(26,30,20,0.6)', border: '1.5px solid rgba(232,223,200,0.18)', borderRadius: 8, color: 'var(--sun)', outline: 'none', marginBottom: 20, boxSizing: 'border-box' }}
              />

              <button onClick={verifyCode} disabled={loading} style={{ ...O, width: '100%', background: 'var(--accent)', color: 'var(--silhouette)', border: 'none', borderRadius: 4, padding: '13px', fontSize: 14, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'VERIFYING...' : 'CONFIRM'}
              </button>
              <button onClick={resend} style={{ background: 'none', border: 'none', color: 'var(--dust)', fontSize: 13, cursor: 'pointer', marginTop: 14 }}>← Resend code</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
