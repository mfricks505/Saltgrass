'use client'
// src/app/auth/reset-password/page.tsx
// Sends a password-reset email via Supabase.

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const B = { midnight:'#0A0C08', forest:'#141F14', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#B8AE98', dust:'#6B6358' }
const O = { fontFamily:'Impact, Arial Black, sans-serif' }

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    setErr('')
    if (!email.trim()) { setErr('Enter your email'); return }
    setBusy(true)
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/update-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo })
    if (error) { setErr(error.message); setBusy(false); return }
    setSent(true); setBusy(false)
  }

  return (
    <div style={{ maxWidth:400, margin:'40px auto', padding:'0 16px' }}>
      <div style={{ ...O, fontSize:24, letterSpacing:1, color:B.bone, marginBottom:8 }}>RESET PASSWORD</div>
      {sent ? (
        <div style={{ background:B.forest, border:`1px solid ${B.canopy}`, borderRadius:8, padding:20, textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:10 }}>✉️</div>
          <div style={{ fontSize:14, color:B.parchment, lineHeight:1.7 }}>If an account exists for <strong style={{color:B.bone}}>{email}</strong>, a reset link is on its way. Check your inbox.</div>
          <Link href="/auth/login" style={{ display:'inline-block', marginTop:16, color:B.copper, textDecoration:'none', ...O, fontSize:12, letterSpacing:1 }}>← BACK TO LOGIN</Link>
        </div>
      ) : (
        <>
          <p style={{ fontSize:13, color:B.dust, lineHeight:1.6, marginBottom:16 }}>Enter your email and we'll send a link to set a new password.</p>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" style={{ width:'100%', background:B.forest, border:`1px solid ${B.canopy}`, borderRadius:6, color:B.bone, padding:'12px 14px', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:12, fontFamily:'Inter,sans-serif' }} />
          {err && <div style={{ fontSize:12, color:'#E07A7A', marginBottom:12 }}>{err}</div>}
          <button onClick={submit} disabled={busy} style={{ width:'100%', background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'13px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', opacity:busy?0.7:1 }}>{busy?'SENDING...':'SEND RESET LINK'}</button>
          <Link href="/auth/login" style={{ display:'block', textAlign:'center', marginTop:14, color:B.dust, textDecoration:'none', fontSize:13 }}>← Back to login</Link>
        </>
      )}
    </div>
  )
}
