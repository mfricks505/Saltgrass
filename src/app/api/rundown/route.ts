// src/app/api/rundown/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getNearestBuoy, TIDE_STATIONS, getMoonPhase, getVerdict, REGION_COORDS } from '@/lib/marine'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const region   = searchParams.get('region')   ?? 'panhandle'
  const boatType = searchParams.get('boatType') ?? 'center_console'

  const coords = REGION_COORDS[region] ?? REGION_COORDS.panhandle
  const { lat, lon } = coords
  const buoy = getNearestBuoy(lat, lon)
  const tideStation = TIDE_STATIONS[region] ?? TIDE_STATIONS.panhandle

  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const [marineRes, weatherRes, tidesRes, noaaRes] = await Promise.allSettled([
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period&timezone=America%2FChicago&forecast_days=2`),
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m,visibility,precipitation_probability&daily=sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&timezone=America%2FChicago&forecast_days=2`),
    fetch(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${dateStr}&end_date=${tomorrowStr}&station=${tideStation.id}&product=predictions&datum=MLLW&time_zone=lst_ldt&interval=hilo&units=english&application=saltgrass&format=json`),
    fetch(`https://www.ndbc.noaa.gov/data/realtime2/${buoy.id}.txt`),
  ])

  // Parse marine hourly
  let marineHourly: any[] = []
  let waveHeight = 0, wavePeriod = 0, waveDirection = 0, swellHeight = 0
  if (marineRes.status === 'fulfilled' && marineRes.value.ok) {
    try {
      const m = await marineRes.value.json()
      const h = m.hourly
      const now = new Date().getHours()
      waveHeight    = h.wave_height?.[now]    ?? 0
      wavePeriod    = h.wave_period?.[now]    ?? 0
      waveDirection = h.wave_direction?.[now] ?? 0
      swellHeight   = h.swell_wave_height?.[now] ?? 0

      // Build hourly array for today (next 24 hours)
      const times = h.time ?? []
      for (let i = 0; i < Math.min(times.length, 48); i++) {
        const dt = new Date(times[i])
        const hr = dt.getHours()
        marineHourly.push({
          iso:        times[i],
          hour:       hr,
          label:      dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          wave_ft:    Math.round((h.wave_height?.[i] ?? 0) * 3.281 * 10) / 10,
          period_s:   Math.round(h.wave_period?.[i] ?? 0),
          swell_ft:   Math.round((h.swell_wave_height?.[i] ?? 0) * 3.281 * 10) / 10,
        })
      }
    } catch {}
  }

  // Parse weather hourly
  let weatherHourly: any[] = []
  let windSpeed = 0, windGusts = 0, windDirection = 0
  let sunrise = '', sunset = '', maxRainPct = 0, maxWind = 0
  if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
    try {
      const w = await weatherRes.value.json()
      const h = w.hourly
      const d = w.daily
      const now = new Date().getHours()
      windSpeed     = h.wind_speed_10m?.[now]    ?? 0
      windGusts     = h.wind_gusts_10m?.[now]    ?? 0
      windDirection = h.wind_direction_10m?.[now] ?? 0
      sunrise       = d.sunrise?.[0]  ?? ''
      sunset        = d.sunset?.[0]   ?? ''
      maxRainPct    = d.precipitation_probability_max?.[0] ?? 0
      maxWind       = d.wind_speed_10m_max?.[0]   ?? windSpeed

      const times = h.time ?? []
      for (let i = 0; i < Math.min(times.length, 48); i++) {
        const dt = new Date(times[i])
        const windKts = Math.round((h.wind_speed_10m?.[i] ?? 0) * 0.539957)
        const gustKts = Math.round((h.wind_gusts_10m?.[i] ?? 0) * 0.539957)
        const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
        const dirLabel = dirs[Math.round((h.wind_direction_10m?.[i] ?? 0) / 22.5) % 16]
        weatherHourly.push({
          iso:       times[i],
          label:     dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          wind_kts:  windKts,
          gust_kts:  gustKts,
          dir:       dirLabel,
          rain_pct:  h.precipitation_probability?.[i] ?? 0,
          temp_f:    Math.round((h.temperature_2m?.[i] ?? 0) * 9/5 + 32),
        })
      }
    } catch {}
  }

  // Merge marine + weather into combined hourly forecast
  const hourlyForecast = weatherHourly.slice(0, 48).map((w, i) => {
    const m = marineHourly[i] ?? {}
    const waveFt   = m.wave_ft   ?? 0
    const windKts  = w.wind_kts  ?? 0
    const verdict  = getVerdict(windKts, waveFt, boatType)
    return {
      ...w,
      wave_ft:   waveFt,
      period_s:  m.period_s ?? 0,
      swell_ft:  m.swell_ft ?? 0,
      verdict,
    }
  })

  // Parse tides
  let tides: { t: string; v: string; type: string }[] = []
  if (tidesRes.status === 'fulfilled' && tidesRes.value.ok) {
    try {
      const t = await tidesRes.value.json()
      tides = (t.predictions ?? []).slice(0, 6)
    } catch {}
  }

  // Parse NOAA buoy
  let waterTempF = 0, buoyWindKts = 0, buoyWaveHt = 0
  if (noaaRes.status === 'fulfilled' && noaaRes.value.ok) {
    try {
      const txt = await noaaRes.value.text()
      const dataLine = txt.split('\n')[2]?.split(/\s+/) ?? []
      buoyWindKts = Math.round((parseFloat(dataLine[6]) || 0) * 1.944)
      buoyWaveHt  = Math.round((parseFloat(dataLine[8]) || 0) * 3.281 * 10) / 10
      const wtmpC = parseFloat(dataLine[14]) || 0
      waterTempF  = wtmpC ? Math.round(wtmpC * 9/5 + 32) : 0
    } catch {}
  }

  const finalWindKts = buoyWindKts > 0 ? buoyWindKts : Math.round(windSpeed * 0.539957)
  const finalWaveHt  = buoyWaveHt  > 0 ? buoyWaveHt  : Math.round(waveHeight * 3.281 * 10) / 10
  const gustKts      = Math.round(windGusts * 0.539957)
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
  const windDirLabel = dirs[Math.round(windDirection / 22.5) % 16]
  const verdict      = getVerdict(finalWindKts, finalWaveHt, boatType)
  const moon         = getMoonPhase(today)

  const tidesFormatted = tides.map(t => ({
    time:   new Date(t.t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    height: parseFloat(t.v).toFixed(1),
    type:   t.type === 'H' ? 'HIGH' : 'LOW',
  }))

  const fmtTime = (iso: string) => {
    if (!iso) return '--'
    try { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
    catch { return '--' }
  }

  const risks: string[] = []
  if (finalWindKts > 25)  risks.push('High winds')
  if (gustKts > 30)       risks.push(`Gusts to ${gustKts} kts`)
  if (finalWaveHt > 5)    risks.push('Rough seas')
  if (wavePeriod < 5 && wavePeriod > 0) risks.push('Short choppy period')
  if (maxRainPct > 60)    risks.push(`${maxRainPct}% chance of rain`)

  return NextResponse.json({
    region, regionLabel: coords.label, boatType, verdict,
    wind: { speed_kts: finalWindKts, gusts_kts: gustKts, direction: windDirLabel, max_today_kts: Math.round(maxWind * 0.539957) },
    waves: { height_ft: finalWaveHt, period_s: Math.round(wavePeriod), swell_ft: Math.round(swellHeight * 3.281 * 10) / 10, direction: dirs[Math.round(waveDirection / 22.5) % 16] },
    water: { temp_f: waterTempF || null },
    tides: tidesFormatted,
    sun: { sunrise: fmtTime(sunrise), sunset: fmtTime(sunset) },
    moon, rain_pct: maxRainPct, risks,
    buoy: { id: buoy.id, name: buoy.name, dist: buoy.distanceMiles },
    tide_station: tideStation.name,
    hourly: hourlyForecast,
    generated_at: new Date().toISOString(),
  })
}
