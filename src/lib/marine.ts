// src/lib/marine.ts — v2
// Added: launch points, zones, solunar times, species conditions, inlet warnings

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── ZONES ────────────────────────────────────────────────────
export type FishingZone = 'inshore' | 'nearshore' | 'offshore'

export const ZONES: Record<FishingZone, {
  label: string; miles: string; icon: string
  max_wind_kts: Record<string, number>
  max_wave_ft: Record<string, number>
  description: string
  target_species: string[]
}> = {
  inshore: {
    label: 'Inshore',
    miles: 'Bay, flats, backwater — 0 to 3 miles',
    icon: '🌿',
    description: 'Bays, grass flats, rivers, backwater creeks',
    target_species: ['Redfish', 'Speckled Trout', 'Snook', 'Flounder', 'Sheepshead'],
    max_wind_kts: { kayak:10, jon_boat:15, center_console:20, bay_boat:18, offshore:25, pontoon:16, atv_truck:999 },
    max_wave_ft:  { kayak:1,  jon_boat:1.5,center_console:2,  bay_boat:2,  offshore:3,  pontoon:1.5,atv_truck:999 },
  },
  nearshore: {
    label: 'Nearshore',
    miles: '3 to 15 miles out',
    icon: '⚓',
    description: 'Gulf passes, nearshore reefs, artificial reefs',
    target_species: ['Cobia', 'Amberjack', 'Spanish Mackerel', 'King Mackerel', 'Sheepshead'],
    max_wind_kts: { kayak:8,  jon_boat:12, center_console:20, bay_boat:16, offshore:28, pontoon:14, atv_truck:999 },
    max_wave_ft:  { kayak:0.5,jon_boat:1,  center_console:3,  bay_boat:2.5,offshore:5,  pontoon:1,  atv_truck:999 },
  },
  offshore: {
    label: 'Offshore',
    miles: '15+ miles out',
    icon: '🌊',
    description: 'Deep Gulf, ledges, rigs, blue water',
    target_species: ['Grouper', 'Snapper', 'Mahi', 'Tuna', 'Wahoo', 'Marlin'],
    max_wind_kts: { kayak:0,  jon_boat:0,  center_console:18, bay_boat:15, offshore:28, pontoon:0,  atv_truck:999 },
    max_wave_ft:  { kayak:0,  jon_boat:0,  center_console:3,  bay_boat:2.5,offshore:6,  pontoon:0,  atv_truck:999 },
  },
}

// ── LAUNCH POINTS ────────────────────────────────────────────
// Specific boat ramps and marinas by region
export const LAUNCH_POINTS: Record<string, {
  id: string; name: string; lat: number; lon: number
  region: string; type: string
  inlet_warning?: string
  zones_available: FishingZone[]
}[]> = {
  panhandle: [
    { id:'bayou_chico',     name:'Bayou Chico Boat Ramp',      lat:30.400, lon:-87.268, region:'panhandle', type:'ramp',   zones_available:['inshore','nearshore'] },
    { id:'pensacola_beach', name:'Pensacola Beach Boat Ramp',  lat:30.335, lon:-87.133, region:'panhandle', type:'ramp',   zones_available:['inshore','nearshore','offshore'], inlet_warning:'Big Lagoon Pass can get rough on outgoing tide with S wind' },
    { id:'navarre_beach',   name:'Navarre Beach Ramp',         lat:30.377, lon:-86.862, region:'panhandle', type:'ramp',   zones_available:['inshore','nearshore','offshore'] },
    { id:'fort_pickens',    name:'Fort Pickens Area',          lat:30.328, lon:-87.298, region:'panhandle', type:'shore',  zones_available:['inshore','nearshore'] },
    { id:'destin_harbor',   name:'Destin Harbor',              lat:30.393, lon:-86.495, region:'panhandle', type:'marina', zones_available:['nearshore','offshore'], inlet_warning:'East Pass inlet — strong current on tidal changes' },
    { id:'pcb_ramp',        name:'Panama City Beach Ramp',     lat:30.213, lon:-85.878, region:'panhandle', type:'ramp',   zones_available:['inshore','nearshore','offshore'] },
  ],
  northfl: [
    { id:'cedar_key',       name:'Cedar Key Marina',           lat:29.137, lon:-83.031, region:'northfl',  type:'marina', zones_available:['inshore','nearshore'] },
    { id:'steinhatchee',    name:'Steinhatchee Ramp',          lat:29.672, lon:-83.386, region:'northfl',  type:'ramp',   zones_available:['inshore','nearshore'] },
    { id:'apalachicola',    name:'Apalachicola Marina',        lat:29.726, lon:-84.991, region:'northfl',  type:'marina', zones_available:['inshore','nearshore','offshore'] },
    { id:'st_marks',        name:'St. Marks River Ramp',       lat:30.159, lon:-84.203, region:'northfl',  type:'ramp',   zones_available:['inshore'] },
  ],
  centralfl: [
    { id:'tampa_bay_north', name:'Upper Tampa Bay Ramp',       lat:27.978, lon:-82.573, region:'centralfl',type:'ramp',   zones_available:['inshore','nearshore'] },
    { id:'tampa_bay_south', name:'Egmont Key Area',            lat:27.599, lon:-82.762, region:'centralfl',type:'ramp',   zones_available:['nearshore','offshore'] },
    { id:'crystal_river',   name:'Crystal River Ramp',         lat:28.903, lon:-82.594, region:'centralfl',type:'ramp',   zones_available:['inshore','nearshore'] },
  ],
  swfl: [
    { id:'fort_myers_beach',name:'Fort Myers Beach Marina',    lat:26.454, lon:-81.952, region:'swfl',     type:'marina', zones_available:['inshore','nearshore','offshore'] },
    { id:'naples_pier',     name:'Naples City Dock',           lat:26.135, lon:-81.795, region:'swfl',     type:'marina', zones_available:['nearshore','offshore'] },
    { id:'everglades_city', name:'Everglades City Ramp',       lat:25.860, lon:-81.386, region:'swfl',     type:'ramp',   zones_available:['inshore','nearshore'] },
    { id:'marco_island',    name:'Marco Island Marina',        lat:25.926, lon:-81.718, region:'swfl',     type:'marina', zones_available:['inshore','nearshore','offshore'] },
  ],
  sefl: [
    { id:'miami_beach',     name:'Miami Beach Marina',         lat:25.773, lon:-80.131, region:'sefl',     type:'marina', zones_available:['nearshore','offshore'] },
    { id:'haulover',        name:'Haulover Inlet',             lat:25.901, lon:-80.122, region:'sefl',     type:'ramp',   zones_available:['nearshore','offshore'], inlet_warning:'Haulover Inlet — one of the most dangerous inlets in FL on NE swell' },
    { id:'lake_worth',      name:'Lake Worth Inlet',           lat:26.613, lon:-80.034, region:'sefl',     type:'ramp',   zones_available:['nearshore','offshore'], inlet_warning:'Lake Worth Inlet — rough on outgoing tide with E wind over 15kts' },
  ],
  keys: [
    { id:'islamorada',      name:'Islamorada Ramp',            lat:24.930, lon:-80.650, region:'keys',     type:'ramp',   zones_available:['inshore','nearshore','offshore'] },
    { id:'marathon',        name:'Marathon Boat Ramp',         lat:24.721, lon:-81.049, region:'keys',     type:'ramp',   zones_available:['inshore','nearshore','offshore'] },
    { id:'key_west',        name:'Key West Bight Marina',      lat:24.561, lon:-81.803, region:'keys',     type:'marina', zones_available:['inshore','nearshore','offshore'] },
    { id:'big_pine',        name:'Big Pine Key Ramp',          lat:24.688, lon:-81.356, region:'keys',     type:'ramp',   zones_available:['inshore','nearshore'] },
  ],
}

// ── SPECIES CONDITIONS ───────────────────────────────────────
export const SPECIES_CONDITIONS: Record<string, {
  ideal_wind_max: number
  ideal_wave_max: number
  ideal_water_temp: [number, number] // min, max F
  tide_preference: string
  moon_boost: boolean // does full/new moon help?
  tip: (conditions: any) => string
}> = {
  'Redfish': {
    ideal_wind_max: 15,
    ideal_wave_max: 1,
    ideal_water_temp: [60, 85],
    tide_preference: 'incoming',
    moon_boost: true,
    tip: (c) => {
      if (c.tide_direction === 'incoming') return 'Incoming tide pushing bait onto flats — redfish should be actively feeding'
      if (c.water_temp_f < 65) return 'Water temp below 65° — fish deeper holes and channels, reds will be sluggish'
      if (c.wind_kts < 10) return 'Light wind — sight fishing conditions excellent, look for wakes and tails on flats'
      return 'Target oyster bars and grass edges on tide changes'
    },
  },
  'Speckled Trout': {
    ideal_wind_max: 12,
    ideal_wave_max: 1,
    ideal_water_temp: [58, 82],
    tide_preference: 'outgoing',
    moon_boost: false,
    tip: (c) => {
      if (c.water_temp_f < 60) return 'Cold water — trout stacked in deep holes, slow your presentation way down'
      if (c.wind_kts > 15) return 'Choppy conditions — fish leeward shorelines with wind-blown bait'
      return 'Early morning topwater bite until the sun gets high — switch to soft plastics midday'
    },
  },
  'Grouper': {
    ideal_wind_max: 20,
    ideal_wave_max: 4,
    ideal_water_temp: [65, 82],
    tide_preference: 'any',
    moon_boost: false,
    tip: (c) => {
      if (c.wave_ft > 3) return 'Rough conditions — grouper will be less active but if you can get offshore they\'re still catchable'
      if (c.moon_phase?.includes('Full') || c.moon_phase?.includes('New')) return 'New/full moon — grouper feeding actively around structure at night, morning bite should be good'
      return 'Work the bottom hard around structure — ledges, rocks, artificial reefs'
    },
  },
  'Cobia': {
    ideal_wind_max: 18,
    ideal_wave_max: 3,
    ideal_water_temp: [68, 85],
    tide_preference: 'any',
    moon_boost: true,
    tip: (c) => {
      const month = new Date().getMonth()
      if (month >= 2 && month <= 4) return 'Peak cobia migration season — look for them following rays and sharks nearshore'
      return 'Cobia love structure — buoys, crab trap floats, floating debris'
    },
  },
  'Snook': {
    ideal_wind_max: 12,
    ideal_wave_max: 1,
    ideal_water_temp: [68, 88],
    tide_preference: 'outgoing',
    moon_boost: true,
    tip: (c) => {
      if (c.water_temp_f < 65) return 'Cold water kills snook — they\'ll be in warm water discharge areas or very deep'
      const month = new Date().getMonth()
      if (month >= 5 && month <= 7) return 'Snook spawn season — work the passes and inlets on the outgoing tide at night'
      return 'Work dock lights at night, mangrove points on outgoing tide during the day'
    },
  },
}

// ── SOLUNAR TIMES ────────────────────────────────────────────
// Simplified solunar calculation based on moon position
export function getSolunarTimes(date: Date, lat: number, lon: number): {
  major: { start: string; end: string }[]
  minor: { start: string; end: string }[]
  rating: 'excellent' | 'good' | 'fair' | 'poor'
  best_window: string
} {
  // Moon transit calculation (simplified)
  const synodicMonth = 29.53058867
  const known = new Date(2000, 0, 6, 18, 14)
  const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24)
  const cycle = ((diff % synodicMonth) + synodicMonth) % synodicMonth

  // Estimate moon transit time based on longitude and moon age
  const moonAge = cycle
  const transitHour = (12 + (lon / 15) + (moonAge * 0.8)) % 24

  // Major periods: moon overhead and underfoot (2 hours each)
  const major1Start = ((transitHour - 1) + 24) % 24
  const major2Start = ((transitHour + 11) + 24) % 24

  // Minor periods: moon rise and set (1 hour each)
  const minor1Start = ((transitHour + 5.5) + 24) % 24
  const minor2Start = ((transitHour + 17.5) + 24) % 24

  const fmt = (h: number) => {
    const hour = Math.floor(h)
    const min = Math.round((h - hour) * 60)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const h12 = hour % 12 || 12
    return `${h12}:${min.toString().padStart(2,'0')} ${ampm}`
  }

  // Rating based on moon phase
  const isNewMoon = moonAge < 2 || moonAge > 27.5
  const isFullMoon = moonAge > 13.5 && moonAge < 15.5
  const isQuarter = (moonAge > 6.5 && moonAge < 8.5) || (moonAge > 21 && moonAge < 23)

  const rating = isNewMoon || isFullMoon ? 'excellent' : isQuarter ? 'good' : 'fair'

  // Best window is earliest major period during daylight
  const daylightMajor = major1Start >= 5 && major1Start <= 19
    ? fmt(major1Start)
    : fmt(major2Start)

  return {
    major: [
      { start: fmt(major1Start), end: fmt(major1Start + 2) },
      { start: fmt(major2Start), end: fmt(major2Start + 2) },
    ],
    minor: [
      { start: fmt(minor1Start), end: fmt(minor1Start + 1) },
      { start: fmt(minor2Start), end: fmt(minor2Start + 1) },
    ],
    rating,
    best_window: daylightMajor,
  }
}

// ── BEST WINDOW ──────────────────────────────────────────────
// Given hourly forecast, find the best 2-hour fishing window today
export function getBestWindow(hourly: any[], zone: FishingZone, boatType: string): {
  time: string; reason: string; score: number
} | null {
  if (!hourly?.length) return null
  const zoneConfig = ZONES[zone]
  const maxWind = zoneConfig.max_wind_kts[boatType] ?? 20
  const maxWave = zoneConfig.max_wave_ft[boatType] ?? 3

  let bestScore = -1
  let bestHour: any = null

  for (const hour of hourly) {
    const h = new Date(hour.iso).getHours()
    if (h < 5 || h > 19) continue // daylight only

    let score = 100
    score -= (hour.wind_kts / maxWind) * 40
    score -= (hour.wave_ft / maxWave) * 30
    score -= hour.rain_pct * 0.2
    // Bonus for dawn/dusk
    if (h >= 5 && h <= 8) score += 15
    if (h >= 17 && h <= 19) score += 10

    if (score > bestScore) { bestScore = score; bestHour = hour }
  }

  if (!bestHour) return null

  const h = new Date(bestHour.iso).getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  const timeStr = `${h12}:00 ${ampm} – ${(h12 % 12) + 1}:00 ${ampm}`

  const reasons = []
  if (h <= 8) reasons.push('early morning bite')
  if (bestHour.wind_kts < 10) reasons.push('light wind')
  if (bestHour.wave_ft < 1.5) reasons.push('calm water')
  if (bestHour.rain_pct < 20) reasons.push('dry conditions')

  return {
    time: timeStr,
    reason: reasons.join(' · ') || 'best available window',
    score: Math.round(bestScore),
  }
}

// ── INLET CONDITIONS ─────────────────────────────────────────
export function getInletWarning(
  launchPointId: string,
  windKts: number,
  windDir: string,
  waveHt: number,
  tideType: string
): string | null {
  const allPoints = Object.values(LAUNCH_POINTS).flat()
  const point = allPoints.find(p => p.id === launchPointId)
  if (!point?.inlet_warning) return null

  // Conditions that make inlets dangerous
  const dangerousConditions = []
  if (windKts > 18 && (windDir.includes('S') || windDir.includes('E'))) {
    dangerousConditions.push('onshore wind over 18kts')
  }
  if (waveHt > 3) dangerousConditions.push(`${waveHt}ft seas`)
  if (tideType === 'outgoing' && windKts > 12) {
    dangerousConditions.push('outgoing tide with wind opposition')
  }

  if (dangerousConditions.length === 0) return null
  return `⚠️ ${point.inlet_warning} — ${dangerousConditions.join(', ')}`
}

// ── EXISTING FUNCTIONS (unchanged) ───────────────────────────
export const FLORIDA_BUOYS = [
  { id: '42039', name: 'Pensacola Offshore',   lat: 28.77,  lon: -86.01,  region: 'panhandle' },
  { id: '42040', name: 'Dauphin Island',        lat: 29.21,  lon: -88.27,  region: 'panhandle' },
  { id: '42012', name: 'Orange Beach',          lat: 30.07,  lon: -87.55,  region: 'panhandle' },
  { id: 'PCBF1', name: 'Panama City Beach',     lat: 30.213, lon: -85.878, region: 'panhandle' },
  { id: '42036', name: 'West Tampa Bay',        lat: 28.50,  lon: -84.52,  region: 'northfl'   },
  { id: 'CDRF1', name: 'Cedar Key',             lat: 29.137, lon: -83.031, region: 'northfl'   },
  { id: 'CWBF1', name: 'Clearwater Beach',      lat: 27.978, lon: -82.832, region: 'northfl'   },
  { id: '42099', name: 'Tampa Bay Offshore',    lat: 25.97,  lon: -86.00,  region: 'swfl'      },
  { id: 'SAUF1', name: 'St. Augustine',         lat: 29.86,  lon: -81.26,  region: 'northfl'   },
  { id: 'LKWF1', name: 'Lake Worth',            lat: 26.613, lon: -80.034, region: 'sefl'      },
  { id: '41047', name: 'SE Florida Offshore',   lat: 27.47,  lon: -71.49,  region: 'sefl'      },
  { id: 'MLRF1', name: 'Molasses Reef',         lat: 25.012, lon: -80.376, region: 'keys'      },
  { id: 'SMKF1', name: 'Sombrero Key',          lat: 24.627, lon: -81.113, region: 'keys'      },
  { id: 'SANF1', name: 'Sand Key',              lat: 24.454, lon: -81.877, region: 'keys'      },
  { id: '42003', name: 'East Gulf Offshore',    lat: 25.94,  lon: -85.55,  region: 'swfl'      },
  { id: '42001', name: 'Mid Gulf',              lat: 25.90,  lon: -89.67,  region: 'panhandle' },
]

export const TIDE_STATIONS: Record<string, { id: string; name: string }> = {
  panhandle: { id: '8729840', name: 'Pensacola'     },
  northfl:   { id: '8727520', name: 'Cedar Key'     },
  centralfl: { id: '8726520', name: 'Tampa Bay'     },
  swfl:      { id: '8725110', name: 'Naples'        },
  sefl:      { id: '8722670', name: 'Lake Worth'    },
  keys:      { id: '8724580', name: 'Key West'      },
}

export function getNearestBuoy(lat: number, lon: number) {
  let closest = FLORIDA_BUOYS[0]; let minDist = Infinity
  for (const buoy of FLORIDA_BUOYS) {
    const dist = haversine(lat, lon, buoy.lat, buoy.lon)
    if (dist < minDist) { minDist = dist; closest = buoy }
  }
  return { ...closest, distanceMiles: Math.round(minDist) }
}

export const REGION_COORDS: Record<string, { lat: number; lon: number; label: string; icon: string }> = {
  panhandle: { lat: 30.40, lon: -86.90, label: 'Panhandle',       icon: '🏖️' },
  northfl:   { lat: 29.65, lon: -82.80, label: 'North Florida',   icon: '🌲' },
  centralfl: { lat: 28.20, lon: -82.40, label: 'Central Florida', icon: '🐊' },
  swfl:      { lat: 26.50, lon: -81.80, label: 'SW Florida',      icon: '🐚' },
  sefl:      { lat: 26.00, lon: -80.10, label: 'SE Florida',      icon: '🦈' },
  keys:      { lat: 24.70, lon: -81.20, label: 'The Keys',        icon: '🦐' },
}

export const BOAT_TYPES: Record<string, { label: string; max_wind_kts: number; max_wave_ft: number; icon: string }> = {
  kayak:          { label: 'Kayak / Paddleboard', max_wind_kts: 10,  max_wave_ft: 1.0, icon: '🛶' },
  jon_boat:       { label: 'Jon Boat (< 16ft)',   max_wind_kts: 15,  max_wave_ft: 1.5, icon: '🚤' },
  center_console: { label: 'Center Console',      max_wind_kts: 22,  max_wave_ft: 4.0, icon: '⛵' },
  bay_boat:       { label: 'Bay Boat',             max_wind_kts: 20,  max_wave_ft: 3.0, icon: '🛥️' },
  offshore:       { label: 'Offshore (25ft+)',     max_wind_kts: 30,  max_wave_ft: 7.0, icon: '🚢' },
  pontoon:        { label: 'Pontoon Boat',         max_wind_kts: 18,  max_wave_ft: 2.0, icon: '🛳️' },
  atv_truck:      { label: 'ATV / Truck (Hunting)',max_wind_kts: 999, max_wave_ft: 999, icon: '🚜' },
}

export function getVerdict(windKts: number, waveFt: number, boatType: string, zone: FishingZone = 'inshore'): 'GO' | 'CAUTION' | 'NO-GO' {
  const zoneConfig = ZONES[zone]
  const maxWind = zoneConfig.max_wind_kts[boatType] ?? BOAT_TYPES[boatType]?.max_wind_kts ?? 20
  const maxWave = zoneConfig.max_wave_ft[boatType]  ?? BOAT_TYPES[boatType]?.max_wave_ft ?? 3
  if (waveFt > maxWave || windKts > maxWind) return 'NO-GO'
  if (waveFt > maxWave * 0.75 || windKts > maxWind * 0.75) return 'CAUTION'
  return 'GO'
}

export function getMoonPhase(date: Date): { phase: string; emoji: string; illumination: number } {
  const synodicMonth = 29.53058867
  const known = new Date(2000, 0, 6, 18, 14)
  const diff = (date.getTime() - known.getTime()) / (1000 * 60 * 60 * 24)
  const cycle = ((diff % synodicMonth) + synodicMonth) % synodicMonth
  const illumination = Math.round((1 - Math.cos((cycle / synodicMonth) * 2 * Math.PI)) / 2 * 100)
  let phase = 'New Moon'; let emoji = '🌑'
  if (cycle < 1.85)       { phase = 'New Moon';        emoji = '🌑' }
  else if (cycle < 7.38)  { phase = 'Waxing Crescent'; emoji = '🌒' }
  else if (cycle < 9.22)  { phase = 'First Quarter';   emoji = '🌓' }
  else if (cycle < 14.77) { phase = 'Waxing Gibbous';  emoji = '🌔' }
  else if (cycle < 16.61) { phase = 'Full Moon';        emoji = '🌕' }
  else if (cycle < 22.15) { phase = 'Waning Gibbous';  emoji = '🌖' }
  else if (cycle < 23.99) { phase = 'Last Quarter';     emoji = '🌗' }
  else if (cycle < 29.53) { phase = 'Waning Crescent'; emoji = '🌘' }
  return { phase, emoji, illumination }
}
