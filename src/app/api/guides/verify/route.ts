// src/app/api/guides/verify/route.ts
// Guide license verification: FWC + USCG + Stripe Identity

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'
import { verifyFWCLicense, verifyUSCGLicense } from '@/lib/fwc-verify'

async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'guides@saltgrass.app', to, subject, text }),
  }).catch(() => {})
}

// POST — submit licenses for verification
export async function POST(req: NextRequest) {
  const {
    guide_id,
    last_name,
    fwc_license_number,
    guide_type,
    uscg_credential_number,
  } = await req.json()

  if (!guide_id) {
    return NextResponse.json({ error: 'Missing guide_id' }, { status: 400 })
  }

  const supabase = createAdminSupabase()

  const { data: guide } = await supabase
    .from('guides')
    .select('*')
    .eq('id', guide_id)
    .single()

  if (!guide) {
    return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
  }

  let fwcResult = null
  let uscgResult = null
  let verificationStatus: string = 'manual_review'

  // FWC check (fishing guides)
  if (last_name && guide_type) {
    fwcResult = await verifyFWCLicense(last_name, fwc_license_number, guide_type)
  }

  // USCG check (captains)
  if (uscg_credential_number && last_name) {
    uscgResult = await verifyUSCGLicense(uscg_credential_number, last_name)
  }

  // Determine status
  if (fwcResult?.found || uscgResult?.found) {
    verificationStatus = 'identity_pending'
  } else if (fwcResult && !fwcResult.found && fwcResult.error) {
    verificationStatus = 'manual_review'
  } else if (fwc_license_number && !fwcResult?.found) {
    verificationStatus = 'license_issue'
  }

  // Update guide with license check results
  await supabase.from('guides').update({
    verification_status: verificationStatus,
    fwc_verified: fwcResult?.found ?? false,
    uscg_verified: uscgResult?.found ?? false,
    fwc_license_number: fwc_license_number ?? null,
    uscg_credential_number: uscg_credential_number ?? null,
  }).eq('id', guide_id)

  // If identity pending, create Stripe Identity session
  let stripeSessionUrl: string | null = null
  if (verificationStatus === 'identity_pending') {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (stripeKey) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://saltgrass-3scu.vercel.app'
      const res = await fetch('https://api.stripe.com/v1/identity/verification_sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          type: 'document',
          'metadata[guide_id]': guide_id,
          'options[document][require_matching_selfie]': 'true',
          'return_url': `${appUrl}/guides/verify?status=complete`,
        }).toString(),
      })
      if (res.ok) {
        const session = await res.json()
        stripeSessionUrl = session.url
      }
    }
  }

  // Send welcome email
  if (guide.email && verificationStatus !== 'license_issue') {
    await sendEmail(
      guide.email,
      'Saltgrass guide application received',
      `Hi ${guide.name ?? ''},\n\nWe've received your guide application for ${guide.business_name}.\n\nStatus: ${verificationStatus === 'identity_pending' ? 'License verified — complete ID verification to go live.' : 'Under manual review — we\'ll be in touch within 2 business days.'}\n\n— Saltgrass`
    )
  }

  return NextResponse.json({
    status: verificationStatus,
    fwc: fwcResult,
    uscg: uscgResult,
    stripe_identity_url: stripeSessionUrl,
  })
}

// PUT — Stripe Identity callback (also handled via webhook, this is backup)
export async function PUT(req: NextRequest) {
  const { guide_id, session_id } = await req.json()
  if (!guide_id || !session_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  // Retrieve session status from Stripe
  const res = await fetch(`https://api.stripe.com/v1/identity/verification_sessions/${session_id}`, {
    headers: { 'Authorization': `Bearer ${stripeKey}` },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Could not retrieve session' }, { status: 502 })
  }

  const session = await res.json()
  const supabase = createAdminSupabase()

  if (session.status === 'verified') {
    await supabase.from('guides').update({
      is_verified: true,
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
    }).eq('id', guide_id)

    const { data: guide } = await supabase.from('guides').select('email, business_name').eq('id', guide_id).single()
    if (guide?.email) {
      await sendEmail(
        guide.email,
        "You're verified — your listing is live on Saltgrass",
        `Your identity has been verified. ${guide.business_name} is now live on Saltgrass with a Verified Guide badge.\n\nView your listing: ${process.env.NEXT_PUBLIC_APP_URL}/guides\n\n— Saltgrass`
      )
    }
  }

  return NextResponse.json({ status: session.status })
}
