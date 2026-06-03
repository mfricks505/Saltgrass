// src/app/api/bite-forecast/route.ts
// 7-day bite forecast. Scores each day 1-5 stars by blending:
//   - solunar (moon-based feeding periods)
//   - tide movement
//   - weather quality (wind/seas for getting out)
//   - PERSONAL MATCH: how well each day matches the user's proven catch patterns
// If the user has a catch log, the forecast is personalized. If not, it's generic.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'
import { getMoonPhase, getSolunarTimes, REGION_COORDS } from '@/lib/marine'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get('region') ?? 'panhandle'
  const species = req.nextUrl.searchParams.get('species') ?? null
  const coords = REGION_COORDS[region] ?? REGION_COORDS.panhandle

  // Pull the user's catch patterns (if signed in + has log)
  let userProfile: any = null
  try {
const supabase = createAdminSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      let q = supabase.from('catch_log').select('*').eq('user_id', user.id)
      if (species) q = q.eq('species', species)
      const { data: catches } = await q
      if (catches && catches.length >= 4) {
        userProfile = buildProfile(catches)
      }
    }
  } catch {}

  // 7-day weather + marine forecast
  const [wx, marine] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,wind_speed_10m_max,precipitation_probability_max&hourly=wind_speed_10m,cloud_cover&wind_speed_unit=kn&timezone=America%2FNew_York&forecast_days=7`).then(r=>r.json()).catch(()=>null),
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${coords.lat}&longitude=${coords.lon}&daily=wave_height_max&hourly=sea_surface_temperature&timezone=America%2FNew_York&forecast_days=7`).then(r=>r.json()).catch(()=>null),
  ])

  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(); date.setDate(date.getDate() + i)
    const moon = getMoonPhase(date)
    const solunar = getSolunarTimes(date, coords.lat, coords.lon)

    const windMax = wx?.daily?.wind_speed_10m_max?.[i] ?? 12
    const waveMax = marine?.daily?.wave_height_max?.[i] != null ? marine.daily.wave_height_max[i]*3.28 : 2
    const rainPct = wx?.daily?.precipitation_probability_max?.[i] ?? 0
    const seaTemp = marine?.hourly?.sea_surface_temperature?.[i*24+12] != null
      ? Math.round(marine.hourly.sea_surface_temperature[i*24+12]*9/5+32) : null
    const cloudMid = wx?.hourly?.cloud_cover?.[i*24+8] ?? 50
    const sky = cloudMid < 25 ? 'clear' : cloudMid < 60 ? 'partly' : 'overcast'

    // ── Base score (everyone gets this) ──
    let score = 0
    // Solunar weight
    score += solunar.rating === 'excellent' ? 35 : solunar.rating === 'good' ? 25 : solunar.rating === 'fair' ? 15 : 8
    // Weather window (can you even get out + comfortable)
    if (windMax < 12) score += 25
    else if (windMax < 18) score += 15
    else if (windMax < 22) score += 7
    if (waveMax < 2) score += 15
    else if (waveMax < 3) score += 8
    // Light rain/overcast often helps the bite
    if (rainPct > 20 && rainPct < 60) score += 5

    const reasons: string[] = []
    if (solunar.rating === 'excellent') reasons.push(`${moon.phase} — peak solunar`)
    else if (solunar.rating === 'good') reasons.push('strong solunar periods')
    if (windMax < 12) reasons.push('light wind')
    else if (windMax >= 22) reasons.push('windy — tough to get out')
    if (waveMax >= 3) reasons.push(`${Math.round(waveMax)}ft seas`)

    // ── Personal match (the moat) ──
    let personalBoost = 0
    let personalNote: string | null = null
    if (userProfile) {
      const match = scorePersonalMatch(userProfile, { seaTemp, sky, windMax })
      personalBoost = match.boost
      if (match.note) personalNote = match.note
    }
    score = Math.min(100, score + personalBoost)

    // Convert to 1-5 stars
    const stars = score >= 80 ? 5 : score >= 64 ? 4 : score >= 46 ? 3 : score >= 28 ? 2 : 1

    days.push({
      date: date.toISOString().slice(0,10),
      day_label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday:'short' }),
      stars,
      score,
      moon: { phase: moon.phase, emoji: moon.emoji },
      solunar_rating: solunar.rating,
      best_window: solunar.best_window,
      wind_max_kts: Math.round(windMax),
      wave_max_ft: Math.round(waveMax*10)/10,
      sea_temp_f: seaTemp,
      sky,
      rain_pct: rainPct,
      reasons,
      personal_note: personalNote,
      personalized: !!userProfile,
    })
  }

  // Best day callout
  const best = days.reduce((b, d) => d.score > b.score ? d : b, days[0])

  return NextResponse.json({
    days,
    best_day: { label: best.day_label, stars: best.stars, window: best.best_window },
    personalized: !!userProfile,
    species: species,
  })
}

// Build a profile of the conditions where this user catches fish
function buildProfile(catches: any[]) {
  const temps = catches.map(c => c.water_temp_f).filter((t:any)=>t!=null)
  const skies = catches.map(c => c.sky).filter(Boolean)
  const skyCounts: Record<string,number> = {}
  for (const s of skies) skyCounts[s] = (skyCounts[s]??0)+1
  const favSky = Object.entries(skyCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]

  return {
    tempAvg: temps.length ? temps.reduce((a:number,b:number)=>a+b,0)/temps.length : null,
    tempMin: temps.length ? Math.min(...temps) : null,
    tempMax: temps.length ? Math.max(...temps) : null,
    favSky,
    sampleSize: catches.length,
  }
}

// Score how well a forecast day matches the user's catch profile
function scorePersonalMatch(profile: any, day: any): { boost: number; note: string|null } {
  let boost = 0
  const notes: string[] = []

  // Water temp match
  if (profile.tempAvg != null && day.seaTemp != null) {
    const inRange = day.seaTemp >= profile.tempMin - 2 && day.seaTemp <= profile.tempMax + 2
    if (inRange) {
      boost += 15
      notes.push(`${day.seaTemp}° water is in your strike zone`)
    }
  }
  // Sky match
  if (profile.favSky && day.sky === profile.favSky) {
    boost += 8
    notes.push(`${day.sky} skies — your best conditions`)
  }

  return { boost, note: notes[0] ?? null }
}
