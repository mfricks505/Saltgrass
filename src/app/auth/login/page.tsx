'use client'
// src/app/auth/login/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back! 🎣')
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 420, margin: '60px auto 0' }}>
      <div style={{ background: '#1E2E1E', borderRadius: 20, padding: 36, border: '1px solid #3D6B3D', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌿</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#E8DFC8', fontFamily: 'Georgia, serif' }}>Welcome back</div>
          <div style={{ fontSize: 14, color: '#887E6E', marginTop: 4 }}>Sign in to Saltgrass</div>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#887E6E', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#887E6E', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link href="/auth/reset-password" style={{ fontSize: 13, color: '#C8924A' }}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} style={{
            background: '#C8924A', color: '#fff', border: 'none',
            borderRadius: 12, padding: '13px', fontWeight: 800,
            fontSize: 15, cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Signing in...' : 'Sign In 🎣'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#887E6E' }}>
          Don't have an account?{' '}
          <Link href="/auth/signup" style={{ color: '#C8924A', fontWeight: 700 }}>Join Free</Link>
        </div>
      </div>
    </div>
  )
}
