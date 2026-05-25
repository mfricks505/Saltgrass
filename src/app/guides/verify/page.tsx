'use client'
// src/app/guides/verify/page.tsx — Guide license + identity verification flow

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const O = { fontFamily: "'Oswald', sans-serif" }
const B = {
  bg: '#2C3025', surf: '#3D4535', card: '#333B2C', sil: '#1A1E14',
  sun: '#E8DFC8', sub: '#B8B49A', dust: '#8A866E',
  border: 'rgba(232,223,200,0.10)', accent: '#D4982E', green: '#7AE07A',
}

type Step = 'intro' | 'licenses' | 'tos' | 'submitting' | 'pending' | 'complete'

const TOS_TEXT = `SALTGRASS GUIDE TERMS OF SERVICE

Last updated: May 2026

1. ELIGIBILITY
You must hold a valid FWC fishing guide license, USCG captain credential, or applicable state hunting guide license to list on Saltgrass as a verified guide.

2. ACCURACY
You warrant that all information provided — including license numbers, credentials, insurance, and business details — is accurate and current. Providing false information results in immediate removal and may be reported to FWC or USCG.

3. BOOKINGS AND FEES
Saltgrass facilitates bookings between guides and members. A 10% platform fee applies to confirmed bookings. Guides receive payment within 2 business days of trip completion.

4. CANCELLATIONS
Guides who cancel confirmed bookings without 48 hours notice may receive negative platform metrics. Repeated cancellations may result in listing suspension.

5. CONDUCT
Guides are independent contractors, not employees of Saltgrass. You are responsible for your own safety equipment, insurance, licenses, and compliance with all federal, state, and local regulations.

6. IDENTITY VERIFICATION
All verified guides must complete Stripe Identity verification. This is a one-time process. Your documents are processed by Stripe and not stored by Saltgrass.

7. TERMINATION
You may cancel your listing at any time. Saltgrass reserves the right to remove listings that violate these terms or applicable law.

By checking the box below, you agree to these terms and certify that all information provided is accurate.`

export default function GuideVerifyPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('intro')
  const [guideId, setGuideId] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null)
  const [tosAccepted, setTosAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [licenses, setLicenses] = useState({
    last_name: '',
    guide_type: 'fishing_guide',
    fwc_license_number: '',
    uscg_credential_number: '',
  })

  useEffect(() => {
    async function loadGuide() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: guide } = await supabase
        .from('guides')
        .select('id, verification_status')
        .eq('user_id', user.id)
        .single()

      if (guide) {
        setGuideId(guide.id)
        setVerificationStatus(guide.verification_status)
        if (['pending', 'identity_pending', 'manual_review', 'verified'].includes(guide.verification_status)) {
          setStep('pending')
        }
      }
    }
    loadGuide()

    // Check if returning from Stripe Identity
    const params = new URLSearchParams(window.location.search)
    if (params.get('status') === 'complete') {
      setStep('pending')
      toast.success('ID submission received — verification in progress')
    }
  }, [])

  function setLic(k: string, v: string) {
    setLicenses(l => ({ ...l, [k]: v }))
  }

  async function submitLicenses() {
    if (!guideId) { toast.error('Guide profile not found'); return }
    if (!licenses.last_name) { toast.error('Last name is required'); return }
    if (!tosAccepted) { toast.error('Please accept the terms of service'); return }

    setLoading(true)
    setStep('submitting')

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/guides/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guide_id: guideId,
        ...licenses,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      toast.error('Verification failed — please try again')
      setStep('licenses')
      return
    }

    const data = await res.json()
    setVerificationStatus(data.status)

    if (data.stripe_identity_url) {
      window.location.href = data.stripe_identity_url
    } else {
      setStep('pending')
    }
  }

  const STATUS_ITEMS = [
    { label: 'Application received',  done: true },
    { label: 'FWC license check',     done: verificationStatus !== 'pending' },
    { label: 'Identity verification', done: verificationStatus === 'verified' },
    { label: 'Listing live',          done: verificationStatus === 'verified' },
  ]

  const input = (placeholder: string, key: string, type = 'text') => (
    <input
      type={type}
      value={(licenses as any)[key]}
      onChange={e => setLic(key, e.target.value)}
      placeholder={placeholder}
      style={{ background: B.sil, border: `1.5px solid ${B.border}`, borderRadius: 4, color: B.sun, fontSize: 14, padding: '11px 13px', width: '100%', outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'Inter, sans-serif' }}
    />
  )

  return (
    <div style={{ background: B.bg, minHeight: '100vh', color: B.sun, padding: '32px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        <div style={{ ...O, fontSize: 11, letterSpacing: 4, color: B.dust, marginBottom: 8 }}>SALTGRASS GUIDES</div>
        <h1 style={{ ...O, fontSize: 26, letterSpacing: 2, color: B.sun, marginBottom: 24 }}>GUIDE VERIFICATION</h1>

        {/* Step: Intro */}
        {step === 'intro' && (
          <div>
            <p style={{ fontSize: 14, color: B.sub, lineHeight: 1.8, marginBottom: 24 }}>
              To go live as a verified guide on Saltgrass, we check your fishing or hunting license
              against FWC public records and verify your identity via Stripe. Takes about 5 minutes.
            </p>

            <div style={{ background: B.card, border: `1px solid ${B.border}`, borderRadius: 8, padding: '18px 20px', marginBottom: 28 }}>
              <div style={{ ...O, fontSize: 10, letterSpacing: 2, color: B.dust, marginBottom: 12 }}>WHAT WE VERIFY</div>
              {[
                'FWC fishing or hunting guide license (public records)',
                'USCG captain credential (if applicable)',
                'Government-issued photo ID via Stripe Identity',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13, color: B.sub }}>
                  <span style={{ color: B.green }}>+</span> {item}
                </div>
              ))}
            </div>

            {!guideId ? (
              <div style={{ background: 'rgba(212,152,46,0.08)', border: `1px solid rgba(212,152,46,0.2)`, borderRadius: 6, padding: '12px 16px', fontSize: 13, color: B.accent }}>
                You need a guide application first. <a href="/guides/join" style={{ color: B.accent, textDecoration: 'underline' }}>Apply as a Founding Guide</a>
              </div>
            ) : (
              <button
                onClick={() => setStep('licenses')}
                style={{ background: B.accent, color: B.sil, border: 'none', borderRadius: 4, padding: '13px 32px', ...O, fontSize: 13, letterSpacing: 2, cursor: 'pointer' }}
              >
                START VERIFICATION
              </button>
            )}
          </div>
        )}

        {/* Step: Licenses */}
        {step === 'licenses' && (
          <div>
            <div style={{ ...O, fontSize: 12, letterSpacing: 2, color: B.dust, marginBottom: 18 }}>STEP 1 OF 2 — LICENSE INFO</div>

            <label style={{ ...O, fontSize: 9, letterSpacing: 2, color: B.dust, display: 'block', marginBottom: 6 }}>GUIDE TYPE</label>
            <select
              value={licenses.guide_type}
              onChange={e => setLic('guide_type', e.target.value)}
              style={{ background: B.sil, border: `1.5px solid ${B.border}`, borderRadius: 4, color: B.sun, fontSize: 14, padding: '11px 13px', width: '100%', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
            >
              <option value="fishing_guide">Fishing guide (FWC)</option>
              <option value="hunting_guide">Hunting guide (FWC)</option>
              <option value="freshwater">Freshwater guide (FWC)</option>
            </select>

            {input('Last name (as on license) *', 'last_name')}
            {input('FWC license number (optional — speeds up check)', 'fwc_license_number')}

            <div style={{ borderTop: `1px solid ${B.border}`, margin: '18px 0', paddingTop: 18 }}>
              <div style={{ ...O, fontSize: 9, letterSpacing: 2, color: B.dust, marginBottom: 10 }}>CAPTAIN LICENSE (OPTIONAL)</div>
              {input('USCG credential number', 'uscg_credential_number')}
            </div>

            <button onClick={() => setStep('tos')} style={{ width: '100%', background: B.accent, color: B.sil, border: 'none', borderRadius: 4, padding: '13px', ...O, fontSize: 13, letterSpacing: 2, cursor: 'pointer' }}>
              REVIEW TERMS
            </button>
          </div>
        )}

        {/* Step: TOS */}
        {step === 'tos' && (
          <div>
            <div style={{ ...O, fontSize: 12, letterSpacing: 2, color: B.dust, marginBottom: 18 }}>STEP 2 OF 2 — TERMS OF SERVICE</div>

            <div style={{
              background: B.sil, border: `1px solid ${B.border}`, borderRadius: 6,
              padding: '14px 16px', height: 280, overflowY: 'auto',
              fontSize: 11, color: B.sub, lineHeight: 1.8,
              whiteSpace: 'pre-wrap', marginBottom: 16,
              fontFamily: 'Inter, sans-serif',
            }}>
              {TOS_TEXT}
            </div>

            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 24 }}>
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={e => setTosAccepted(e.target.checked)}
                style={{ marginTop: 2, accentColor: B.accent }}
              />
              <span style={{ fontSize: 12, color: B.sub, lineHeight: 1.6 }}>
                I have read and agree to the Saltgrass Guide Terms of Service. I certify that all license information I provided is accurate.
              </span>
            </label>

            <button
              onClick={submitLicenses}
              disabled={!tosAccepted || loading}
              style={{ width: '100%', background: tosAccepted ? B.accent : B.border, color: tosAccepted ? B.sil : B.dust, border: 'none', borderRadius: 4, padding: '13px', ...O, fontSize: 13, letterSpacing: 2, cursor: tosAccepted ? 'pointer' : 'not-allowed', marginBottom: 8 }}
            >
              SUBMIT AND VERIFY ID
            </button>

            <button onClick={() => setStep('licenses')} style={{ width: '100%', background: 'none', border: 'none', color: B.dust, fontSize: 12, cursor: 'pointer' }}>
              Back
            </button>
          </div>
        )}

        {/* Step: Submitting */}
        {step === 'submitting' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ ...O, fontSize: 14, letterSpacing: 2, color: B.sun, marginBottom: 8 }}>CHECKING RECORDS...</div>
            <div style={{ fontSize: 12, color: B.sub }}>Verifying with FWC and USCG public records</div>
          </div>
        )}

        {/* Step: Pending / Complete */}
        {(step === 'pending' || step === 'complete') && (
          <div>
            <div style={{ marginBottom: 28 }}>
              {STATUS_ITEMS.map((item, i) => (
                <div key={item.label} style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: item.done ? B.green : B.border,
                    border: `2px solid ${item.done ? B.green : B.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: item.done ? B.sil : B.dust, flexShrink: 0,
                  }}>
                    {item.done ? '+' : (i + 1)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: item.done ? B.sun : B.sub }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {verificationStatus === 'verified' ? (
              <div style={{ background: 'rgba(122,224,122,0.08)', border: `1px solid rgba(122,224,122,0.2)`, borderRadius: 6, padding: '14px 18px', fontSize: 13, color: B.green }}>
                Your listing is live. Welcome to Saltgrass Guides.
              </div>
            ) : verificationStatus === 'license_issue' ? (
              <div style={{ background: 'rgba(212,152,46,0.08)', border: `1px solid rgba(212,152,46,0.2)`, borderRadius: 6, padding: '14px 18px' }}>
                <div style={{ ...O, fontSize: 12, letterSpacing: 1, color: B.accent, marginBottom: 6 }}>LICENSE NOT FOUND IN PUBLIC RECORDS</div>
                <div style={{ fontSize: 12, color: B.sub, lineHeight: 1.7 }}>
                  We couldn't find your license in FWC public records. This can happen if your license was recently renewed or is under a different name. We'll review manually and contact you within 2 business days.
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '14px 18px', fontSize: 13, color: B.sub, lineHeight: 1.7 }}>
                Verification in progress. We'll email you when your listing goes live — usually within 1-2 business days.
              </div>
            )}

            <a href="/guides" style={{ display: 'block', marginTop: 24, textAlign: 'center', ...O, fontSize: 12, letterSpacing: 2, color: B.dust, textDecoration: 'none' }}>
              VIEW GUIDES DIRECTORY
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
