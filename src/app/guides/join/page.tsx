'use client'
// src/app/guides/join/page.tsx — Founding Guide signup

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const O  = { fontFamily: "'Oswald', sans-serif" }
const B  = {
  bg: '#2C3025', surf: '#3D4535', card: '#333B2C', sil: '#1A1E14',
  sun: '#E8DFC8', sub: '#B8B49A', dust: '#8A866E',
  border: 'rgba(232,223,200,0.10)', accent: '#D4982E',
}

const TOTAL_SLOTS = 50
const TAKEN_SLOTS = 31

interface Plan {
  id:    string
  label: string
  price: string
  per:   string
  trial: string
  badge: string
}

const PLANS: Plan[] = [
  { id: 'pro',   label: 'Pro',   price: '$19.99', per: '/mo', trial: '90 days free',  badge: 'Founding Guide' },
  { id: 'elite', label: 'Elite', price: '$99',    per: '/yr', trial: '90 days free',  badge: 'Founding Guide + Elite' },
]

function SlotCounter() {
  const pct = (TAKEN_SLOTS / TOTAL_SLOTS) * 100
  return (
    <div style={{ background: B.card, border: `1px solid ${B.border}`, borderRadius: 8, padding: '16px 20px', marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ ...O, fontSize: 11, letterSpacing: 2, color: B.dust }}>FOUNDING GUIDE SLOTS</span>
        <span style={{ ...O, fontSize: 13, color: B.accent }}>{TOTAL_SLOTS - TAKEN_SLOTS} remaining</span>
      </div>
      <div style={{ height: 6, background: 'rgba(0,0,0,0.4)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: B.accent, borderRadius: 3, transition: 'width 0.6s' }} />
      </div>
      <div style={{ fontSize: 11, color: B.sub }}>{TAKEN_SLOTS} of {TOTAL_SLOTS} spots claimed — permanent Founding Guide badge for all early members</div>
    </div>
  )
}

interface SignupModalProps {
  plan: Plan
  onClose: () => void
}

function SignupModal({ plan, onClose }: SignupModalProps) {
  const supabase = createClient()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', business_name: '',
    guide_type: 'fishing', years_experience: '', bio: '',
    card_name: '', card_number: '', card_exp: '', card_cvc: '',
  })
  const [loading, setLoading] = useState(false)

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function submitStep1() {
    if (!form.name || !form.email || !form.business_name) {
      toast.error('Please fill in all required fields')
      return
    }
    setStep(2)
  }

  async function submitStep2() {
    if (!form.card_number || !form.card_exp || !form.card_cvc) {
      toast.error('Please enter card details')
      return
    }
    setLoading(true)
    // In production: tokenize card via Stripe.js and create subscription
    // Card is collected but not charged until after 90-day trial
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Please sign in first'); setLoading(false); return }

    const { error } = await supabase.from('guides').insert({
      user_id: user.id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      business_name: form.business_name,
      guide_type: form.guide_type,
      years_experience: parseInt(form.years_experience) || null,
      bio: form.bio,
      plan: plan.id,
      is_founding: true,
      trial_started_at: new Date().toISOString(),
      trial_ends_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      verification_status: 'pending',
    })

    setLoading(false)
    if (error) { toast.error('Something went wrong — try again'); return }
    setStep(3)
  }

  const input = (placeholder: string, key: string, type = 'text') => (
    <input
      type={type}
      value={(form as any)[key]}
      onChange={e => set(key, e.target.value)}
      placeholder={placeholder}
      style={{ background: B.sil, border: `1.5px solid ${B.border}`, borderRadius: 4, color: B.sun, fontSize: 14, padding: '11px 13px', width: '100%', outline: 'none', boxSizing: 'border-box', marginBottom: 10, fontFamily: 'Inter, sans-serif' }}
    />
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
      <div style={{ background: B.surf, borderRadius: 8, padding: 28, maxWidth: 480, width: '100%', border: `1px solid ${B.border}`, margin: 'auto' }}>

        {step === 3 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>+</div>
            <div style={{ ...O, fontSize: 20, letterSpacing: 2, color: B.sun, marginBottom: 8 }}>YOU'RE A FOUNDING GUIDE</div>
            <p style={{ fontSize: 13, color: B.sub, lineHeight: 1.7, marginBottom: 20 }}>
              Your application is in. We'll verify your license and reach out within 2 business days.
              Your 90-day free trial begins today — {plan.label} plan, {plan.price}{plan.per} after trial.
            </p>
            <div style={{ background: 'rgba(212,152,46,0.1)', border: `1px solid ${B.accent}`, borderRadius: 6, padding: '12px 16px', marginBottom: 24, fontSize: 12, color: B.accent }}>
              Next step: Complete identity verification to go live
            </div>
            <button onClick={onClose} style={{ ...O, fontSize: 13, letterSpacing: 2, background: B.accent, color: B.sil, border: 'none', borderRadius: 4, padding: '12px 28px', cursor: 'pointer' }}>
              CONTINUE TO VERIFY
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ ...O, fontSize: 16, letterSpacing: 2, color: B.sun }}>JOIN AS FOUNDING GUIDE</div>
                <div style={{ fontSize: 12, color: B.dust, marginTop: 2 }}>{plan.label} — {plan.price}{plan.per} · {plan.trial}</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: B.dust, fontSize: 20, cursor: 'pointer' }}>x</button>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
              {(['Guide Info', 'Billing', 'Confirmed'] as const).map((label, i) => (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{ height: 3, borderRadius: 2, background: step > i ? B.accent : B.border, marginBottom: 4, transition: 'background 0.3s' }} />
                  <div style={{ ...O, fontSize: 8, letterSpacing: 1, color: step > i ? B.accent : B.dust }}>{label}</div>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div>
                {input('Full name *', 'name')}
                {input('Email *', 'email', 'email')}
                {input('Phone', 'phone', 'tel')}
                {input('Business / guide name *', 'business_name')}
                <select value={form.guide_type} onChange={e => set('guide_type', e.target.value)} style={{ background: B.sil, border: `1.5px solid ${B.border}`, borderRadius: 4, color: B.sun, fontSize: 14, padding: '11px 13px', width: '100%', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}>
                  <option value="fishing">Fishing guide</option>
                  <option value="hunting">Hunting guide</option>
                  <option value="captain">Charter captain</option>
                  <option value="eco">Eco / nature guide</option>
                </select>
                {input('Years of experience', 'years_experience', 'number')}
                <textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Short bio — what makes your trips special?" rows={3} style={{ background: B.sil, border: `1.5px solid ${B.border}`, borderRadius: 4, color: B.sun, fontSize: 14, padding: '11px 13px', width: '100%', outline: 'none', boxSizing: 'border-box', marginBottom: 14, resize: 'none', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }} />
                <button onClick={submitStep1} style={{ width: '100%', background: B.accent, color: B.sil, border: 'none', borderRadius: 4, padding: '13px', ...O, fontSize: 13, letterSpacing: 2, cursor: 'pointer' }}>
                  CONTINUE TO BILLING
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ background: 'rgba(212,152,46,0.08)', border: `1px solid rgba(212,152,46,0.2)`, borderRadius: 6, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: B.accent }}>
                  Card collected now — you will not be charged until after your 90-day free trial ends.
                </div>
                {input('Name on card', 'card_name')}
                {input('Card number', 'card_number', 'text')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {input('MM / YY', 'card_exp')}
                  {input('CVC', 'card_cvc')}
                </div>
                <div style={{ fontSize: 11, color: B.dust, marginBottom: 14 }}>
                  Secured by Stripe. Saltgrass does not store card data.
                </div>
                <button onClick={submitStep2} disabled={loading} style={{ width: '100%', background: B.accent, color: B.sil, border: 'none', borderRadius: 4, padding: '13px', ...O, fontSize: 13, letterSpacing: 2, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 8 }}>
                  {loading ? 'SUBMITTING...' : `START 90-DAY FREE TRIAL`}
                </button>
                <button onClick={() => setStep(1)} style={{ width: '100%', background: 'none', border: 'none', color: B.dust, fontSize: 12, cursor: 'pointer' }}>
                  Back
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const VS = [
  { feat: 'Founding Guide badge', sg: true,  fb: false },
  { feat: '90-day free trial',    sg: true,  fb: false },
  { feat: 'No per-booking fee',   sg: true,  fb: false },
  { feat: 'Local Florida focus',  sg: true,  fb: false },
  { feat: 'Community directory',  sg: true,  fb: false },
  { feat: 'Direct booking',       sg: true,  fb: true  },
  { feat: 'Online payment',       sg: true,  fb: true  },
]

const FAQ = [
  { q: 'What happens after 90 days?', a: 'Your card is charged the plan rate. You can cancel anytime before then at no cost.' },
  { q: 'Do I need to be FWC licensed?', a: 'Yes — we verify all guides against FWC and USCG records. License numbers are required at signup.' },
  { q: 'What is the booking fee?', a: 'Saltgrass takes 10% on confirmed bookings. You keep 90%.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Your Founding Guide badge is permanent even if you downgrade to free later.' },
]

export default function GuidesJoinPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  return (
    <div style={{ background: B.bg, minHeight: '100vh', color: B.sun, padding: '32px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ ...O, fontSize: 11, letterSpacing: 4, color: B.dust, marginBottom: 8 }}>SALTGRASS GUIDES</div>
          <h1 style={{ ...O, fontSize: 32, letterSpacing: 2, color: B.sun, margin: '0 0 12px' }}>BECOME A FOUNDING GUIDE</h1>
          <p style={{ fontSize: 14, color: B.sub, lineHeight: 1.8, maxWidth: 520, margin: '0 auto' }}>
            Get listed on Florida's local outdoor platform before the crowd.
            50 founding spots. 90 days free. Permanent badge.
          </p>
        </div>

        <SlotCounter />

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{ background: B.card, border: `1.5px solid ${B.border}`, borderRadius: 8, padding: 24 }}>
              <div style={{ ...O, fontSize: 14, letterSpacing: 2, color: B.dust, marginBottom: 4 }}>{plan.label.toUpperCase()}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ ...O, fontSize: 28, color: B.sun }}>{plan.price}</span>
                <span style={{ fontSize: 12, color: B.dust }}>{plan.per}</span>
              </div>
              <div style={{ fontSize: 12, color: B.accent, marginBottom: 16 }}>{plan.trial}</div>
              <div style={{ fontSize: 12, color: B.sub, marginBottom: 20 }}>{plan.badge} badge</div>
              <button
                onClick={() => setSelectedPlan(plan)}
                style={{ width: '100%', background: B.accent, color: B.sil, border: 'none', borderRadius: 4, padding: '12px', ...O, fontSize: 12, letterSpacing: 2, cursor: 'pointer' }}
              >
                CLAIM SPOT
              </button>
            </div>
          ))}
        </div>

        {/* VS comparison */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ ...O, fontSize: 11, letterSpacing: 3, color: B.dust, marginBottom: 16, textAlign: 'center' }}>HOW WE COMPARE</div>
          <div style={{ background: B.card, borderRadius: 8, overflow: 'hidden', border: `1px solid ${B.border}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', padding: '12px 16px', borderBottom: `1px solid ${B.border}` }}>
              <span style={{ ...O, fontSize: 10, letterSpacing: 2, color: B.dust }}>FEATURE</span>
              <span style={{ ...O, fontSize: 10, letterSpacing: 2, color: B.accent, textAlign: 'center' }}>SALTGRASS</span>
              <span style={{ ...O, fontSize: 10, letterSpacing: 2, color: B.dust, textAlign: 'center' }}>FISHINGBOOKER</span>
            </div>
            {VS.map((row, i) => (
              <div key={row.feat} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', padding: '11px 16px', borderBottom: i < VS.length - 1 ? `1px solid ${B.border}` : 'none', fontSize: 12 }}>
                <span style={{ color: B.sub }}>{row.feat}</span>
                <span style={{ textAlign: 'center', color: row.sg ? '#7AE07A' : '#888', fontWeight: 700 }}>{row.sg ? '+' : '-'}</span>
                <span style={{ textAlign: 'center', color: row.fb ? '#7AE07A' : '#888', fontWeight: 700 }}>{row.fb ? '+' : '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ ...O, fontSize: 11, letterSpacing: 3, color: B.dust, marginBottom: 16, textAlign: 'center' }}>FAQ</div>
          {FAQ.map(item => (
            <div key={item.q} style={{ background: B.card, border: `1px solid ${B.border}`, borderRadius: 6, padding: '14px 18px', marginBottom: 8 }}>
              <div style={{ ...O, fontSize: 12, letterSpacing: 1, color: B.sun, marginBottom: 6 }}>{item.q}</div>
              <div style={{ fontSize: 12, color: B.sub, lineHeight: 1.7 }}>{item.a}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', paddingBottom: 40 }}>
          <button
            onClick={() => setSelectedPlan(PLANS[0])}
            style={{ background: B.accent, color: B.sil, border: 'none', borderRadius: 4, padding: '14px 40px', ...O, fontSize: 14, letterSpacing: 2, cursor: 'pointer' }}
          >
            CLAIM YOUR FOUNDING SPOT
          </button>
          <div style={{ fontSize: 11, color: B.dust, marginTop: 8 }}>{TOTAL_SLOTS - TAKEN_SLOTS} of {TOTAL_SLOTS} slots remaining</div>
        </div>
      </div>

      {selectedPlan && (
        <SignupModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  )
}
