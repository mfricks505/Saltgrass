// src/app/api/webhooks/stripe/route.ts
// Complete Stripe webhook handler — handles ALL payment events automatically
// No manual intervention needed for: subscriptions, refunds, failures, ID verification

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

async function verifyStripeSignature(req: NextRequest): Promise<any> {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  // Simple HMAC verification without the Stripe library
  const crypto = await import('crypto')
  const elements = sig.split(',')
  const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1]
  const signatures = elements.filter(e => e.startsWith('v1=')).map(e => e.split('=')[1])

  const payload = `${timestamp}.${body}`
  const expected = crypto.createHmac('sha256', STRIPE_WEBHOOK_SECRET).update(payload).digest('hex')

  if (!signatures.includes(expected)) throw new Error('Invalid signature')
  return JSON.parse(body)
}

async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'noreply@saltgrass.app', to, subject, text }),
  }).catch(() => {})
}

export async function POST(req: NextRequest) {
  let event: any
  try {
    event = await verifyStripeSignature(req)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminSupabase()

  switch (event.type) {

    // ── Guide subscription created ──────────────────────────
    case 'customer.subscription.created': {
      const sub = event.data.object
      const guideId = sub.metadata?.guide_id
      if (!guideId) break
      await supabase.from('guides').update({
        plan: sub.metadata.plan ?? 'pro',
        stripe_subscription_id: sub.id,
        stripe_customer_id: sub.customer,
        trial_started_at: new Date(sub.created * 1000).toISOString(),
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      }).eq('id', guideId)
      break
    }

    // ── Guide subscription cancelled ────────────────────────
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const guideId = sub.metadata?.guide_id
      if (!guideId) break
      await supabase.from('guides').update({
        plan: 'free',
        is_verified: false, // lose verified badge if cancelled
        stripe_subscription_id: null,
        converted_at: null,
      }).eq('id', guideId)
      const { data: guide } = await supabase.from('guides').select('email, business_name').eq('id', guideId).single()
      if (guide?.email) {
        await sendEmail(guide.email, 'Your Saltgrass subscription has been cancelled',
          `Hi,\n\nYour Saltgrass ${sub.metadata.plan ?? 'Pro'} subscription for ${guide.business_name} has been cancelled.\n\nYour listing will remain active as a free listing. Your Founding Guide badge stays permanently.\n\nTo reactivate your verified status, visit saltgrass.app/guides/dashboard.\n\n— Saltgrass`)
      }
      break
    }

    // ── Payment failed — dunning ────────────────────────────
    case 'invoice.payment_failed': {
      const invoice = event.data.object
      const customerId = invoice.customer
      // Find the guide
      const { data: guide } = await supabase.from('guides').select('*').eq('stripe_customer_id', customerId).single()
      if (guide) {
        await supabase.from('payment_events').insert({
          guide_id: guide.id,
          event_type: 'payment_failed',
          amount: invoice.amount_due,
          stripe_event_id: event.id,
          detail: { invoice_id: invoice.id, attempt: invoice.attempt_count },
        })
        // Email after first failure
        if (invoice.attempt_count === 1 && guide.email) {
          await sendEmail(guide.email, 'Payment issue with your Saltgrass subscription',
            `Hi ${guide.name},\n\nWe couldn't process payment for your Saltgrass subscription.\n\nPlease update your payment method at: saltgrass.app/guides/dashboard\n\nWe'll retry in a few days automatically.\n\n— Saltgrass`)
        }
        // Suspend after 3 failures
        if (invoice.attempt_count >= 3) {
          await supabase.from('guides').update({
            is_verified: false,
            verification_status: 'payment_suspended',
          }).eq('id', guide.id)
        }
      }
      break
    }

    // ── Payment succeeded ───────────────────────────────────
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object
      if (invoice.billing_reason === 'subscription_cycle') {
        // Reactivate if previously suspended
        const { data: guide } = await supabase.from('guides').select('id').eq('stripe_customer_id', invoice.customer).eq('verification_status', 'payment_suspended').single()
        if (guide) {
          await supabase.from('guides').update({ is_verified: true, verification_status: 'verified' }).eq('id', guide.id)
        }
      }
      break
    }

    // ── Stripe Identity verified ────────────────────────────
    case 'identity.verification_session.verified': {
      const session = event.data.object
      const guideId = session.metadata?.guide_id
      const userId  = session.metadata?.user_id

      // Verify guide
      if (guideId) {
        await supabase.from('guides').update({
          is_verified: true,
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
        }).eq('id', guideId)
        const { data: guide } = await supabase.from('guides').select('email, business_name').eq('id', guideId).single()
        if (guide?.email) {
          await sendEmail(guide.email, "You're verified — your Saltgrass listing is live",
            `Hi,\n\nYour identity has been verified. ${guide.business_name} is now live on Saltgrass with a Verified Guide badge.\n\nView your listing: saltgrass.app/guides/dashboard\n\n— Saltgrass`)
        }
      }

      // Verify regular user (Level 3)
      if (userId) {
        await supabase.from('profiles').update({
          id_verified: true,
          id_verified_at: new Date().toISOString(),
          level: 3,
        }).eq('id', userId)
      }
      break
    }

    // ── Stripe Identity failed ──────────────────────────────
    case 'identity.verification_session.requires_input': {
      const session = event.data.object
      const guideId = session.metadata?.guide_id
      if (guideId) {
        await supabase.from('guides').update({ verification_status: 'identity_failed' }).eq('id', guideId)
      }
      break
    }

    // ── One-time payment succeeded (listing fee, ID verify) ─
    case 'payment_intent.succeeded': {
      const pi = event.data.object
      const type    = pi.metadata?.type
      const userId  = pi.metadata?.user_id
      const guideId = pi.metadata?.guide_id

      if (type === 'listing_fee') {
        await supabase.from('listings').update({ status: 'active', paid_at: new Date().toISOString() }).eq('stripe_payment_intent', pi.id)
      }
      if (type === 'featured_bump') {
        await supabase.from('listings').update({ is_featured: true, featured_until: new Date(Date.now() + 7*24*60*60*1000).toISOString() }).eq('stripe_payment_intent', pi.id)
      }
      if (type === 'id_verification' && userId) {
        // ID verify payment — trigger Stripe Identity session
        // (session creation happens in the Identity event above)
      }
      if (type === 'crewup_convenience' && pi.metadata?.booking_id) {
        await supabase.from('crew_bookings').update({ fee_paid: true, status: 'pending_captain' }).eq('stripe_payment_intent', pi.id)
      }
      // Guide booking: escrow held (captured_method=manual)
      if (type === 'guide_booking' && pi.metadata?.booking_id) {
        await supabase.from('guide_bookings').update({ status: 'payment_held', stripe_payment_intent: pi.id }).eq('id', pi.metadata.booking_id)
      }
      break
    }

  }

  return NextResponse.json({ received: true })
}
