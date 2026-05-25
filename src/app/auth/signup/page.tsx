'use client'
// src/app/auth/signup/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { REGIONS } from '@/lib/types'
import toast from 'react-hot-toast'
import PhoneVerifyModal from '@/components/PhoneVerifyModal'

const O = { fontFamily:"'Oswald', sans-serif" }

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form,     setForm]     = useState({ email:'', password:'', username:'', full_name:'', home_region:'' })
  const [loading,  setLoading]  = useState(false)
  const [userId,   setUserId]   = useState<string|null>(null)
  const [showPhone,setShowPhone] = useState(false)
  const set = (k:string,v:string) => setForm(f=>({...f,[k]:v}))

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!form.username.trim())  { toast.error('Username required'); return }
    if (form.password.length<6) { toast.error('Password must be 6+ characters'); return }
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email, password: form.password,
    })
    if (authError) { toast.error(authError.message); setLoading(false); return }
    if (!authData.user) { toast.error('Signup failed — try again'); setLoading(false); return }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: authData.user.id,
      username: form.username.toLowerCase().trim(),
      full_name: form.full_name.trim() || null,
      home_region: form.home_region || null,
      level: 1,
    })
    if (profileError) {
      toast.error(profileError.message.includes('unique') ? 'Username already taken' : profileError.message)
      setLoading(false); return
    }

    // Account created — now prompt phone verify
    setUserId(authData.user.id)
    setShowPhone(true)
    setLoading(false)
  }

  function handlePhoneVerified() {
    setShowPhone(false)
    toast.success('Phone verified! Level 2 unlocked.')
    router.push('/')
  }

  function handlePhoneSkip() {
    setShowPhone(false)
    toast.success('Welcome to Saltgrass!')
    router.push('/')
  }

  const inputStyle = {
    background: 'rgba(26,30,20,0.6)',
    border: '1.5px solid rgba(232,223,200,0.12)',
    borderRadius: 4, color: 'var(--text)',
    fontSize: 15, padding: '11px 14px',
    width: '100%', outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'Inter, sans-serif',
    marginBottom: 14,
  }

  return (
    <>
      <div style={{ maxWidth: 480, margin: '40px auto 0' }}>
        <div style={{ background:'var(--surface)', borderRadius:6, border:'1px solid var(--border)', boxShadow:'0 8px 40px rgba(0,0,0,0.4)', overflow:'hidden' }}>

          <div style={{ background:'var(--card)', padding:'24px', textAlign:'center', borderBottom:'1px solid var(--border)' }}>
            <div style={{ ...O, fontWeight:700, fontSize:28, letterSpacing:'4px', color:'var(--sun)', textTransform:'uppercase', marginBottom:4 }}>SALTGRASS</div>
            <div style={{ fontSize:13, color:'var(--sub)' }}>Join Florida's outdoors community</div>
          </div>

          {/* Level preview */}
          <div style={{ background:'var(--card)', borderTop:'none', padding:'12px 24px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              {[
                { level:'L1', label:'Browse & Read', color:'#8A866E',  active:true  },
                { level:'L2', label:'Post & Message', color:'#D4982E', active:false },
                { level:'L3', label:'Buy · Sell · Book', color:'#7AE07A', active:false },
              ].map(l => (
                <div key={l.level} style={{ flex:1, textAlign:'center', padding:'8px 6px', borderRadius:4, background: l.active ? 'rgba(212,152,46,0.08)' : 'transparent', border:`1px solid ${l.active ? 'rgba(212,152,46,0.2)' : 'rgba(232,223,200,0.06)'}` }}>
                  <div style={{ ...O, fontSize:10, letterSpacing:1, color:l.active?l.color:'var(--dust)', marginBottom:2 }}>{l.level}</div>
                  <div style={{ fontSize:9, color:'var(--dust)', lineHeight:1.4 }}>{l.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:10, color:'var(--dust)', textAlign:'center', marginTop:8, lineHeight:1.6 }}>
              Signing up unlocks Level 1. Phone verify = Level 2. $2.99 ID check = Level 3.
            </div>
          </div>

          <div style={{ padding:'22px 28px' }}>
            <form onSubmit={handleSignup} style={{ display:'flex', flexDirection:'column' }}>
              {[
                { key:'full_name', label:'FULL NAME',  placeholder:'Wild Bill',      type:'text',     required:false },
                { key:'username',  label:'USERNAME',   placeholder:'riverroller88',  type:'text',     required:true  },
                { key:'email',     label:'EMAIL',      placeholder:'you@email.com',  type:'email',    required:true  },
                { key:'password',  label:'PASSWORD',   placeholder:'6+ characters',  type:'password', required:true  },
              ].map(({ key, label, placeholder, type, required }) => (
                <div key={key}>
                  <label style={{ ...O, fontSize:10, letterSpacing:'2px', color:'var(--dust)', textTransform:'uppercase', display:'block', marginBottom:6 }}>
                    {label} {required && <span style={{ color:'var(--accent)' }}>*</span>}
                  </label>
                  <input type={type} value={(form as any)[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder} required={required} style={inputStyle} />
                </div>
              ))}

              <div style={{ marginBottom:20 }}>
                <label style={{ ...O, fontSize:10, letterSpacing:'2px', color:'var(--dust)', textTransform:'uppercase', display:'block', marginBottom:10 }}>HOME REGION</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
                  {REGIONS.map(r => (
                    <button key={r.id} type="button" onClick={() => set('home_region', r.id)} style={{ padding:'9px 12px', borderRadius:4, cursor:'pointer', border:`1.5px solid ${form.home_region===r.id?'var(--accent)':'rgba(232,223,200,0.12)'}`, background:form.home_region===r.id?'rgba(212,152,46,0.15)':'transparent', color:form.home_region===r.id?'var(--accent)':'var(--sub)', display:'flex', alignItems:'center', gap:8, fontFamily:'Inter,sans-serif', fontSize:12 }}>
                      <span style={{ fontSize:16 }}>{r.icon}</span><span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ ...O, background:'var(--accent)', color:'var(--silhouette)', border:'none', borderRadius:4, padding:'13px', fontSize:14, fontWeight:600, letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', opacity:loading?0.7:1 }}>
                {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT — FREE'}
              </button>
            </form>

            <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--dust)' }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color:'var(--accent)', fontWeight:600 }}>Sign In</Link>
            </div>
          </div>
        </div>
      </div>

      {showPhone && userId && (
        <PhoneVerifyModal
          userId={userId}
          onVerified={handlePhoneVerified}
          onSkip={handlePhoneSkip}
        />
      )}
    </>
  )
}
