'use client'
// src/components/StripePaymentForm.tsx
// Run first: npm install @stripe/stripe-js @stripe/react-stripe-js

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? 'pk_test_REPLACE_ME'
)

function centsToDisplay(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

interface Props {
  listingId: string
  buyerId: string
  totalCents: number
  listingTitle: string
  onSuccess: () => void
  onCancel: () => void
}

function CheckoutForm({ totalCents, listingTitle, onSuccess, onCancel }: Omit<Props, 'listingId' | 'buyerId'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/marketplace/purchase-success` },
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message ?? 'Payment failed')
      setProcessing(false)
    } else {
      toast.success('Payment successful! 🌿')
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1C3A2A', marginBottom: 4 }}>{listingTitle}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#1C3A2A' }}>{centsToDisplay(totalCents)}</div>
        <div style={{ fontSize: 12, color: '#aaa' }}>Held in escrow until delivery confirmed</div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {errorMessage && (
        <div style={{ background: '#C8522A18', color: '#C8522A', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button type="submit" disabled={!stripe || processing} style={{ width: '100%', padding: '14px', background: processing ? '#aaa' : '#1C3A2A', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: processing ? 'not-allowed' : 'pointer' }}>
          {processing ? '⏳ Processing...' : `🛒 Pay ${centsToDisplay(totalCents)}`}
        </button>
        <button type="button" onClick={onCancel} style={{ width: '100%', padding: '12px', background: '#fff', color: '#888', border: '1.5px solid #E8DFC8', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: '#aaa', textAlign: 'center' }}>
        🔒 Secured by Stripe · Your card is never stored on SaltGrass
      </div>
    </form>
  )
}

export default function StripePaymentForm(props: Props) {
  const { listingId, buyerId, totalCents, listingTitle, onSuccess, onCancel } = props
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId, buyer_id: buyerId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setClientSecret(data.client_secret)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [listingId])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: '#aaa' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
      <div style={{ fontSize: 14 }}>Preparing secure checkout...</div>
    </div>
  )

  if (error) return (
    <div style={{ background: '#C8522A18', color: '#C8522A', borderRadius: 12, padding: 20, textAlign: 'center' }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>⚠️ Checkout Error</div>
      <div style={{ fontSize: 13 }}>{error}</div>
      <button onClick={onCancel} style={{ marginTop: 14, background: '#C8522A', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 20px', fontWeight: 700, cursor: 'pointer' }}>
        Go Back
      </button>
    </div>
  )

  if (!clientSecret) return null

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#1C3A2A', fontFamily: 'Inter, system-ui, sans-serif' } } }}>
      <CheckoutForm totalCents={totalCents} listingTitle={listingTitle} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  )
}
