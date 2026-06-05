'use client'
// src/app/auth/update-password/page.tsx
// Where the reset-email link lands. Exchanges the recovery token for a session,
// then lets the user set a new password.

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const B = { midnight:'#0A0C08', forest:'#141F14', canopy:'#243824', copper:'#C8922A', bone:'#E8DFC8', parchment:'#C4BFA6', dust:'#9A9580' }
const O = { fontFamily:'Oswald, sans-serif' }

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(true)

  // On load, establish the recovery session from the link.
  useEffect(() => {
    let done = false
    // Supabase fires PASSWORD_RECOVERY when it parses the recovery token from the URL
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        done = true; setReady(true); setChecking(false)
      }
    })
    // Also try the PKCE code exchange (newer reset links use ?code=)
    ;(async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) { done = true; setReady(true); setChecking(false); return }
      }
      // Fallback: do we already have a session?
      const { data } = await supabase.auth.getSession()
      if (data.session) { setReady(true) }
      // give the auth listener a moment, then stop the spinner regardless
      setTimeout(() => { if (!done) setChecking(false) }, 1500)
    })()
    return () => { sub.subscription.unsubscribe() }
  }, [])

  async function submit() {
    setErr('')
    if (pw.length < 8) { setErr('Password must be at least 8 characters'); return }
    if (pw !== pw2) { setErr('Passwords do not match'); return }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: pw })
    if (error) { setErr(error.message); setBusy(false); return }
    // success → send them in
    router.push('/')
  }

  return (
    <div style={{ maxWidth:400, margin:'40px auto', padding:'0 16px' }}>
      <div style={{ ...O, fontSize:24, letterSpacing:1, color:B.bone, marginBottom:8 }}>NEW PASSWORD</div>

      {checking ? (
        <p style={{ fontSize:13, color:B.dust }}>Verifying your reset link...</p>
      ) : !ready ? (
        <div style={{ background:B.forest, border:`1px solid ${B.canopy}`, borderRadius:8, padding:18 }}>
          <p style={{ fontSize:13, color:B.parchment, lineHeight:1.7, margin:0 }}>
            This reset link is invalid or expired. Request a new one from the
            <a href="/auth/reset-password" style={{ color:B.copper, textDecoration:'none' }}> reset password page</a>.
          </p>
        </div>
      ) : (
        <>
          <p style={{ fontSize:13, color:B.dust, lineHeight:1.6, marginBottom:16 }}>Set a new password for your account.</p>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="New password" style={{ width:'100%', background:B.forest, border:`1px solid ${B.canopy}`, borderRadius:6, color:B.bone, padding:'12px 14px', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:10, fontFamily:'Inter,sans-serif' }} />
          <input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="Confirm new password" style={{ width:'100%', background:B.forest, border:`1px solid ${B.canopy}`, borderRadius:6, color:B.bone, padding:'12px 14px', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:12, fontFamily:'Inter,sans-serif' }} />
          {err && <div style={{ fontSize:12, color:'#E07A7A', marginBottom:12 }}>{err}</div>}
          <button onClick={submit} disabled={busy} style={{ width:'100%', background:B.copper, color:B.midnight, border:'none', borderRadius:6, padding:'13px', ...O, fontSize:13, letterSpacing:2, cursor:'pointer', opacity:busy?0.7:1 }}>{busy?'SAVING...':'SET NEW PASSWORD'}</button>
        </>
      )}
    </div>
  )
}
