// src/app/api/verify/phone/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// POST — send verification code
export async function POST(req: NextRequest) {
  const { phone, user_id } = await req.json()

  if (!phone || !user_id) {
    return NextResponse.json({ error: 'Missing phone or user_id' }, { status: 400 })
  }

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const supabase = createAdminSupabase()

  // Invalidate any existing codes for this user
  await supabase
    .from('phone_verifications')
    .update({ used: true })
    .eq('user_id', user_id)
    .eq('used', false)

  // Store new code
  const { error: insertError } = await supabase.from('phone_verifications').insert({
    user_id,
    phone,
    code,
    expires_at: expiresAt,
    used: false,
  })

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create verification' }, { status: 500 })
  }

  // Send via Twilio if configured
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken  = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (accountSid && authToken && fromNumber) {
    const body = `Your Saltgrass verification code is: ${code}. Expires in 10 minutes.`
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: phone, From: fromNumber, Body: body }).toString(),
      }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Twilio error:', err)
      return NextResponse.json({ error: 'Failed to send SMS' }, { status: 502 })
    }
  } else {
    // Dev mode — log code to console
    console.log(`[DEV] Phone verification code for ${phone}: ${code}`)
  }

  return NextResponse.json({ sent: true })
}

// PUT — confirm code
export async function PUT(req: NextRequest) {
  const { phone, code, user_id } = await req.json()

  if (!phone || !code || !user_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createAdminSupabase()

  const { data: verification, error } = await supabase
    .from('phone_verifications')
    .select('*')
    .eq('user_id', user_id)
    .eq('phone', phone)
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .single()

  if (error || !verification) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  // Mark as used
  await supabase.from('phone_verifications').update({ used: true }).eq('id', verification.id)

  // Update profile — level auto-bumped to 2 by DB trigger
  await supabase.from('profiles').update({
    phone,
    phone_verified: true,
    phone_verified_at: new Date().toISOString(),
  }).eq('id', user_id)

  return NextResponse.json({ verified: true })
}
