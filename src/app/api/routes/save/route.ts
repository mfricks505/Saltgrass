// src/app/api/routes/save/route.ts
// Save a planned route + register for morning notifications

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const { name, waypoints, boatType } = await req.json()
  if (!name || !waypoints?.length) {
    return NextResponse.json({ error: 'Name and waypoints required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('saved_routes')
    .insert({ user_id: user.id, name, waypoints, boat_type: boatType })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ route: data })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ routes: [] })

  const { data } = await supabase
    .from('saved_routes').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ routes: data ?? [] })
}
