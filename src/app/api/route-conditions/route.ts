// src/app/api/route-conditions/route.ts
// Takes a list of waypoints (lat/lon pins dropped on the map)
// Returns conditions at EACH leg + NWS marine warnings + timing of when it turns bad
// + an overall trip verdict keyed on the worst leg

import { NextRequest, NextResponse } from 'next/server'
import { ZONES, getVerdict, getMoonPhase, type FishingZone } from '@/lib/marine'

export const dynamic = 'force-dynamic'

interface Waypoint { lat: number; lon: number }

// Classify a waypoint as inshore/nearshore/offshore by distance from shore.
// Rough heuristic using distance from the launch point (first pin).
function classifyZone(distFromLaunchMi: number): FishingZone {
  if (distFromLaunchMi < 3) return 'inshore'
  if (distFromLaunchMi < 12) return 'nearshore'
  return 'offshore'
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

async function getMarineForecast(lat: number, lon: number) {
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}` +
    `&hourly=wave_height,wave_period,wind_wave_height&timezone=America%2FNew_York&forecast_days=1`
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

async function getWindForecast(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation_probability` +
    `&wind_speed_unit=kn&timezone=America%2FNew_York&forecast_days=1`
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

// NWS marine zone forecast + active warnings (small craft advisory etc.)
async function getNWSAlerts(lat: number, lon: number) {
  try {
    const res = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
      headers: { 'User-Agent': 'Saltgrass/1.0 (saltgrass.app)' },
      next: { revalidate: 900 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.features ?? [])
      .map((f: any) => ({
        event: f.properties?.event,
        severity: f.properties?.severity,
        headline: f.properties?.headline,
        ends: f.properties?.ends,
      }))
      .filter((a: any) =>
        /marine|small craft|gale|storm|hurricane|wind|hazardous/i.test(a.event ?? '')
      )
  } catch { return [] }
}

const degToCompass = (deg: number) => {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

const m2ft = (m: number) => Math.round(m * 3.28084 * 10) / 10

export async function POST(req: NextRequest) {
  const { waypoints, boatType = 'center_console' } = await req.json() as {
    waypoints: Waypoint[]; boatType: string
  }

  if (!waypoints?.length || waypoints.length < 1) {
    return NextResponse.json({ error: 'Need at least one waypoint' }, { status: 400 })
  }

  const launch = waypoints[0]
  const nowHour = new Date().getHours()

  // Analyze each waypoint as a "leg"
  const legs = await Promise.all(waypoints.map(async (wp, i) => {
    const distFromLaunch = haversine(launch.lat, launch.lon, wp.lat, wp.lon)
    const zone = classifyZone(distFromLaunch)

    const [marine, wind, alerts] = await Promise.all([
      getMarineForecast(wp.lat, wp.lon),
      getWindForecast(wp.lat, wp.lon),
      getNWSAlerts(wp.lat, wp.lon),
    ])

    // Current conditions (this hour)
    const idx = nowHour
    const waveFt = marine?.hourly?.wave_height?.[idx] != null ? m2ft(marine.hourly.wave_height[idx]) : null
    const windKts = wind?.hourly?.wind_speed_10m?.[idx] != null ? Math.round(wind.hourly.wind_speed_10m[idx]) : null
    const gustKts = wind?.hourly?.wind_gusts_10m?.[idx] != null ? Math.round(wind.hourly.wind_gusts_10m[idx]) : null
    const windDir = wind?.hourly?.wind_direction_10m?.[idx] != null ? degToCompass(wind.hourly.wind_direction_10m[idx]) : ''

    // When does it turn bad? Scan forward through the day.
    let turnsBadAt: string | null = null
    if (wind?.hourly && marine?.hourly) {
      const zoneConfig = ZONES[zone]
      const maxWind = zoneConfig.max_wind_kts[boatType] ?? 20
      const maxWave = zoneConfig.max_wave_ft[boatType] ?? 3
      for (let h = nowHour; h < 24; h++) {
        const w = wind.hourly.wind_speed_10m?.[h] ?? 0
        const wv = marine.hourly.wave_height?.[h] != null ? m2ft(marine.hourly.wave_height[h]) : 0
        if (w > maxWind || wv > maxWave) {
          const ampm = h >= 12 ? 'PM' : 'AM'
          const h12 = h % 12 || 12
          turnsBadAt = `${h12}:00 ${ampm}`
          break
        }
      }
    }

    const verdict = (waveFt != null && windKts != null)
      ? getVerdict(windKts, waveFt, boatType, zone)
      : 'CAUTION'

    return {
      index: i,
      lat: wp.lat,
      lon: wp.lon,
      distFromLaunchMi: Math.round(distFromLaunch * 10) / 10,
      zone,
      zoneLabel: ZONES[zone].label,
      zoneIcon: ZONES[zone].icon,
      conditions: {
        wind_kts: windKts,
        gust_kts: gustKts,
        wind_dir: windDir,
        wave_ft: waveFt,
        rain_pct: wind?.hourly?.precipitation_probability?.[idx] ?? 0,
      },
      verdict,
      turnsBadAt,
      alerts,
    }
  }))

  // Trip verdict = worst leg
  const order = { 'NO-GO': 3, 'CAUTION': 2, 'GO': 1 }
  const worstLeg = legs.reduce((worst, leg) =>
    order[leg.verdict] > order[worst.verdict] ? leg : worst, legs[0])

  // Earliest "turns bad" across all legs
  const allTurnBad = legs.map(l => l.turnsBadAt).filter(Boolean) as string[]
  const earliestBad = allTurnBad.length ? allTurnBad[0] : null

  // Dedupe alerts across legs
  const allAlerts = legs.flatMap(l => l.alerts)
  const uniqueAlerts = Array.from(
    new Map(allAlerts.map((a: any) => [a.event + a.headline, a])).values()
  )

  // Total route distance
  let totalDist = 0
  for (let i = 1; i < waypoints.length; i++) {
    totalDist += haversine(waypoints[i-1].lat, waypoints[i-1].lon, waypoints[i].lat, waypoints[i].lon)
  }

  const moon = getMoonPhase(new Date())

  return NextResponse.json({
    trip_verdict: worstLeg.verdict,
    worst_leg_index: worstLeg.index,
    total_distance_mi: Math.round(totalDist * 10) / 10,
    earliest_turns_bad: earliestBad,
    legs,
    alerts: uniqueAlerts,
    moon: { phase: moon.phase, emoji: moon.emoji, illumination: moon.illumination },
    generated_at: new Date().toISOString(),
  })
}
