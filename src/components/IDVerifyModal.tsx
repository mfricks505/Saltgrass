'use client'
// src/components/IDVerifyModal.tsx

import { useState } from 'react'
import toast from 'react-hot-toast'

const O = { fontFamily: "'Oswald', sans-serif" }
const B = {
  surf: '#3D4535', card: '#333B2C', sil: '#1A1E14',
  sun: '#E8DFC8', sub: '#B8B49A', dust: '#8A866E',
  border: 'rgba(232,223,200,0.10)', accent: '#D4982E', green: '#7AE07A',
}

const FEATURE_LABELS: Record<string, string> = {
  market_buy:  'Buy on The Market',
  market_sell: 'Sell on The Market',
  book_guide:  'Book a fishing guide',
  crewup_join: 'Join a Crew Up trip',
  crewup_post: 'Post a Crew Up trip',
}

interface Props {
  feature: string
  verifiedCount: number
  onSuccess: () => void
  onClose: () => void
}

export default function IDVerifyModal({ feature, verifiedCount, onSuccess, onClose }: Props) {
  const [loading, setLoading] = useState(false)

  const featureLabel = FEATURE_LABELS[feature] ?? 'access this feature'

  async function handleVerify() {
    setLoading(true)
    // In production: create Stripe Checkout session + Identity session
    // Then redirect to Stripe hosted page
    toast('Redirecting to secure ID verification...', { icon: 'ID' })
    // Placeholder — real implementation calls /api/stripe/identity-session
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    toast.error('Stripe Identity not yet configured. Contact support.')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: B.surf, borderRadius: 8, padding: 28, maxWidth: 440, width: '100%', border: `1px solid ${B.border}` }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ ...O, fontSize: 18, letterSpacing: 2, color: B.sun }}>ID VERIFICATION</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: B.dust, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>x</button>
        </div>

        <p style={{ fontSize: 12, color: B.sub, lineHeight: 1.7, marginBottom: 16 }}>
          To <strong style={{ color: B.sun }}>{featureLabel}</strong>, you need to verify your identity.
          This is a one-time step that unlocks all Level 3 features.
        </p>

        {/* Social proof */}
        <div style={{ background: 'rgba(122,224,122,0.08)', border: `1px solid rgba(122,224,122,0.2)`, borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: B.green }}>
          {verifiedCount.toLocaleString()} members are already ID-verified on Saltgrass
        </div>

        {/* Level 3 unlocks */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...O, fontSize: 9, letterSpacing: 2, color: B.dust, marginBottom: 10 }}>LEVEL 3 UNLOCKS EVERYTHING</div>
          {[
            'Buy & sell on The Market',
            'Book fishing guides',
            'Join & post Crew Up trips',
            'Trusted badge on your profile',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12, color: B.sun }}>
              <span style={{ color: B.green, fontSize: 14 }}>+</span> {f}
            </div>
          ))}
        </div>

        {/* Cost */}
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '12px 14px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: B.sub }}>ID verification</span>
            <span style={{ ...O, fontSize: 16, color: B.sun }}>$2.99</span>
          </div>
          <div style={{ fontSize: 11, color: B.dust }}>One-time fee. Powered by Stripe Identity — your documents are not stored by Saltgrass.</div>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          style={{ width: '100%', background: B.accent, color: B.sil, border: 'none', borderRadius: 4, padding: '13px', ...O, fontSize: 13, letterSpacing: 2, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10 }}
        >
          {loading ? 'REDIRECTING...' : 'VERIFY ID FOR $2.99'}
        </button>

        <button onClick={onClose} style={{ width: '100%', background: 'none', border: 'none', color: B.dust, fontSize: 12, cursor: 'pointer' }}>
          Not now
        </button>
      </div>
    </div>
  )
}
