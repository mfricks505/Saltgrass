// src/app/api/guides/booking/route.ts
// Guide booking: inquiry, payment hold (escrow), capture on completion

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

const PLATFORM_FEE_PCT = 0.10

async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'bookings@saltgrass.app', to, subject, text }),
  }).catch(() => {})
}

// POST — create booking inquiry
export async function POST(req: NextRequest) {
  const { guide_id, user_id, date, party_size, notes, trip_price_cents } = await req.json()

  if (!guide_id || !user_id || !date || !trip_price_cents) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createAdminSupabase()

  const platformFeeCents = Math.round(trip_price_cents * PLATFORM_FEE_PCT)
  const totalCents = trip_price_cents + platformFeeCents

  const { data: booking, error } = await supabase
    .from('guide_bookings')
    .insert({
      guide_id,
      user_id,
      date,
      party_size: party_size ?? 1,
      notes: notes ?? null,
      trip_price_cents,
      platform_fee_cents: platformFeeCents,
      total_cents: totalCents,
      status: 'inquiry',
    })
    .select()
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // Email guide
  const { data: guide } = await supabase
    .from('guides')
    .select('email, name, business_name')
    .eq('id', guide_id)
    .single()

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', user_id)
    .single()

  if (guide?.email) {
    await sendEmail(
      guide.email,
      `New booking inquiry — ${date}`,
      `Hi ${guide.name ?? ''},\n\nYou have a new booking inquiry on Saltgrass.\n\nDate: ${date}\nParty size: ${party_size ?? 1}\nNotes: ${notes ?? 'None'}\nFrom: ${userProfile?.name ?? 'A member'}\n\nTrip price: $${(trip_price_cents / 100).toFixed(2)}\nYou receive: $${((trip_price_cents - platformFeeCents) / 100).toFixed(2)} (after 10% platform fee)\n\nLog in to accept or decline: ${process.env.NEXT_PUBLIC_APP_URL}/guides/dashboard\n\n— Saltgrass`
    )
  }

  return NextResponse.json({ booking_id: booking.id, total_cents: totalCents })
}

// PUT — confirm booking and create Stripe PaymentIntent (manual capture / escrow)
export async function PUT(req: NextRequest) {
  const { booking_id, guide_id } = await req.json()

  if (!booking_id || !guide_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createAdminSupabase()
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const { data: booking } = await supabase
    .from('guide_bookings')
    .select('*, profiles(email, name)')
    .eq('id', booking_id)
    .eq('guide_id', guide_id)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Create PaymentIntent with manual capture (escrow)
  const res = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: booking.total_cents.toString(),
      currency: 'usd',
      capture_method: 'manual',
      'metadata[type]': 'guide_booking',
      'metadata[booking_id]': booking_id,
      'metadata[guide_id]': guide_id,
    }).toString(),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Stripe error' }, { status: 502 })
  }

  const pi = await res.json()

  await supabase.from('guide_bookings').update({
    status: 'confirmed',
    stripe_payment_intent: pi.id,
    confirmed_at: new Date().toISOString(),
  }).eq('id', booking_id)

  return NextResponse.json({
    client_secret: pi.client_secret,
    payment_intent_id: pi.id,
  })
}

// PATCH — trip complete, capture payment
export async function PATCH(req: NextRequest) {
  const { booking_id, guide_id } = await req.json()

  if (!booking_id || !guide_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createAdminSupabase()
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const { data: booking } = await supabase
    .from('guide_bookings')
    .select('*')
    .eq('id', booking_id)
    .eq('guide_id', guide_id)
    .single()

  if (!booking?.stripe_payment_intent) {
    return NextResponse.json({ error: 'No payment intent found' }, { status: 400 })
  }

  // Capture the held payment
  const res = await fetch(
    `https://api.stripe.com/v1/payment_intents/${booking.stripe_payment_intent}/capture`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Capture failed' }, { status: 502 })
  }

  await supabase.from('guide_bookings').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  }).eq('id', booking_id)

  // Increment guide revenue via RPC
  await supabase.rpc('increment_guide_revenue', {
    p_guide_id: guide_id,
    p_amount_cents: booking.trip_price_cents - booking.platform_fee_cents,
  })

  return NextResponse.json({ captured: true })
}
