'use client'
// src/app/auth/signup/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ email: '', password: '', username: '', full_name: '', home_region: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { username: form.username, full_name: form.full_name }
      }
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome to Saltgrass! 🌿')
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto 0' }}>
      <div style={{ background: '#1E2E1E', borderRadius: 20, padding: 36, border: '1px solid #3D6B3D', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🌿</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#E8DFC8', fontFamily: 'Georgia, serif' }}>
            Join Saltgrass
          </div>
          <div style={{ fontSize: 14, color: '#887E6E', marginTop: 4 }}>
            Florida's outdoors community
          </div>
        </div>

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'full_name', label: 'Full Name',  placeholder: 'Jake Moreno',         type: 'text' },
            { key: 'username',  label: 'Username',   placeholder: 'flatsdrifter88',       type: 'text' },
            { key: 'email',     label: 'Email',      placeholder: 'you@example.com',      type: 'email' },
            { key: 'password',  label: 'Password',   placeholder: '8+ characters',        type: 'password' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#887E6E', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 5 }}>
                {label}
              </label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                required
              />
            </div>
          ))}

          {/* Region picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#887E6E', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>
              Your Home Region
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {REGIONS.map(r => (
                <button key={r.id} type="button" onClick={() => set('home_region', r.id)} style={{
                  padding: '10px 12px', borderRadius: 12, fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  border: `2px solid ${form.home_region === r.id ? r.color : '#3D6B3D'}`,
                  background: form.home_region === r.id ? `${r.color}25` : 'transparent',
                  color: form.home_region === r.id ? r.color : '#887E6E',
                  display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left',
                }}>
                  <span style={{ fontSize: 16 }}>{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            background: '#C8924A', color: '#fff', border: 'none',
            borderRadius: 12, padding: '13px', fontWeight: 800,
            fontSize: 15, cursor: 'pointer', marginTop: 4,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Creating account...' : 'Create Account 🌿'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#887E6E' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: '#C8924A', fontWeight: 700 }}>Sign In</Link>
        </div>
      </div>
    </div>
  )
}
