// src/app/api/catch/route.ts
// POST: log a catch (auto-snapshots current conditions)
// GET:  fetch the user's catch log + detected patterns

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'
import { getMoonPhase, getSolunarTimes, REGION_COORDS } from '@/lib/marine'

// Pull current conditions for the region to snapshot with the catch
async function snapshotConditions(region: string, zone: string) {
  const coords = REGION_COORDS[region] ?? REGION_COORDS.panhandle
  const snap: any = {
    moon_phase: getMoonPhase(new Date()).phase,
    solunar_rating: getSolunarTimes(new Date(), coords.lat, coords.lon).rating,
  }
  try {
    const hr = new Date().getHours()
    const [wind, marine] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=wind_speed_10m,wind_direction_10m,temperature_2m,surface_pressure,cloud_cover&wind_speed_unit=kn&timezone=America%2FNew_York&forecast_days=1`).then(r=>r.json()).catch(()=>null),
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${coords.lat}&longitude=${coords.lon}&hourly=wave_height,sea_surface_temperature&timezone=America%2FNew_York&forecast_days=1`).then(r=>r.json()).catch(()=>null),
    ])
    if (wind?.hourly) {
      snap.wind_kts = Math.round(wind.hourly.wind_speed_10m?.[hr] ?? 0)
      const deg = wind.hourly.wind_direction_10m?.[hr]
      if (deg != null) {
        const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
        snap.wind_dir = dirs[Math.round(deg/22.5)%16]
      }
      const cloud = wind.hourly.cloud_cover?.[hr] ?? 0
      snap.sky = cloud < 25 ? 'clear' : cloud < 60 ? 'partly' : 'overcast'
      // barometric trend: compare now vs 3 hours ago
      const pNow = wind.hourly.surface_pressure?.[hr]
      const pPrev = wind.hourly.surface_pressure?.[Math.max(0,hr-3)]
      if (pNow != null && pPrev != null) {
        const d = pNow - pPrev
        snap.baro_trend = d > 0.5 ? 'rising' : d < -0.5 ? 'falling' : 'steady'
      }
    }
    if (marine?.hourly) {
      snap.wave_ft = marine.hourly.wave_height?.[hr] != null ? Math.round(marine.hourly.wave_height[hr]*3.28*10)/10 : null
      snap.water_temp_f = marine.hourly.sea_surface_temperature?.[hr] != null ? Math.round(marine.hourly.sea_surface_temperature[hr]*9/5+32) : null
    }
  } catch {}
  return snap
}

export async function POST(req: NextRequest) {
  const supabase = createAdminSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in to log catches' }, { status: 401 })

  const body = await req.json()
  const { species, length_in, weight_lb, released, count, region, zone, launch_point, notes, tide_stage, photo_url } = body
  if (!species) return NextResponse.json({ error: 'Species required' }, { status: 400 })

  const conditions = await snapshotConditions(region ?? 'panhandle', zone ?? 'inshore')

  const { data, error } = await supabase.from('catch_log').insert({
    user_id: user.id,
    species, length_in, weight_lb, released, count: count ?? 1,
    region, zone, launch_point, notes, tide_stage, photo_url,
    ...conditions,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ catch: data })
}

export async function GET() {
  const supabase = createAdminSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ catches: [], patterns: [], stats: null })

  const { data: catches } = await supabase
    .from('catch_log').select('*').eq('user_id', user.id)
    .order('caught_at', { ascending: false }).limit(200)

  const { data: stats } = await supabase
    .from('catch_stats').select('*').eq('user_id', user.id).single()

  const patterns = detectPatterns(catches ?? [])
  return NextResponse.json({ catches: catches ?? [], patterns, stats })
}

// Pattern detection — find what conditions correlate with the user's catches
function detectPatterns(catches: any[]): string[] {
  if (catches.length < 5) return []  // need data first
  const patterns: string[] = []

  // Group by species, find dominant conditions
  const bySpecies: Record<string, any[]> = {}
  for (const c of catches) {
    if (!bySpecies[c.species]) bySpecies[c.species] = []
    bySpecies[c.species].push(c)
  }

  for (const [species, list] of Object.entries(bySpecies)) {
    if (list.length < 4) continue  // need enough of this species

    // Tide pattern
    const tides = list.map(c => c.tide_stage).filter(Boolean)
    const tideCounts = countMost(tides)
    if (tideCounts && tideCounts.pct >= 60) {
      patterns.push(`${tideCounts.pct}% of your ${species.toLowerCase()} came on a ${tideCounts.value} tide`)
    }

    // Water temp range
    const temps = list.map(c => c.water_temp_f).filter((t): t is number => t != null)
    if (temps.length >= 4) {
      const min = Math.min(...temps), max = Math.max(...temps)
      const avg = Math.round(temps.reduce((a,b)=>a+b,0)/temps.length)
      if (max - min <= 12) {
        patterns.push(`Your ${species.toLowerCase()} bite clusters around ${avg}°F water (${min}–${max}°)`)
      }
    }

    // Sky pattern
    const skies = list.map(c => c.sky).filter(Boolean)
    const skyCounts = countMost(skies)
    if (skyCounts && skyCounts.pct >= 60) {
      patterns.push(`${species} has favored ${skyCounts.value} skies for you`)
    }

    // Time of day
    const morningCount = list.filter(c => new Date(c.caught_at).getHours() < 10).length
    if (morningCount / list.length >= 0.7) {
      patterns.push(`${Math.round(morningCount/list.length*100)}% of your ${species.toLowerCase()} hit before 10am`)
    }
  }

  return patterns.slice(0, 6)  // top insights only
}

function countMost(arr: string[]): { value: string; pct: number } | null {
  if (!arr.length) return null
  const counts: Record<string, number> = {}
  for (const v of arr) counts[v] = (counts[v] ?? 0) + 1
  let best = '', bestN = 0
  for (const [v, n] of Object.entries(counts)) if (n > bestN) { best = v; bestN = n }
  return { value: best, pct: Math.round(bestN / arr.length * 100) }
}
