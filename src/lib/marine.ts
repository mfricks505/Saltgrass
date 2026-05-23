// src/lib/marine.ts
// All Florida NOAA buoys + marine utility functions

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// All active Florida NOAA NDBC buoys
export const FLORIDA_BUOYS = [
  // Panhandle / NW Gulf
  { id: '42039', name: 'Pensacola Offshore',    lat: 28.77,  lon: -86.01, region: 'panhandle' },
  { id: '42040', name: 'Dauphin Island',         lat: 29.21,  lon: -88.27, region: 'panhandle' },
  { id: '42012', name: 'Orange Beach',           lat: 30.07,  lon: -87.55, region: 'panhandle' },
  { id: 'PCBF1', name: 'Panama City Beach',      lat: 30.213, lon: -85.878, region: 'panhandle' },
  // Big Bend / Nature Coast
  { id: '42036', name: 'West Tampa Bay',         lat: 28.50,  lon: -84.52, region: 'northfl' },
  { id: 'CDRF1', name: 'Cedar Key',              lat: 29.137, lon: -83.031, region: 'northfl' },
  { id: 'CWBF1', name: 'Clearwater Beach',       lat: 27.978, lon: -82.832, region: 'northfl' },
  // Tampa Bay / SW Gulf
  { id: '42099', name: 'Tampa Bay Offshore',     lat: 25.97,  lon: -86.00, region: 'swfl' },
  { id: 'SAUF1', name: 'St. Augustine',          lat: 29.86,  lon: -81.26, region: 'northfl' },
  { id: 'LKWF1', name: 'Lake Worth',             lat: 26.613, lon: -80.034, region: 'sefl' },
  // SE Florida / Miami
  { id: '41047', name: 'SE Florida Offshore',    lat: 27.47,  lon: -71.49, region: 'sefl' },
  { id: '41044', name: 'NE Florida Offshore',    lat: 31.00,  lon: -73.00, region: 'sefl' },
  { id: 'MLRF1', name: 'Molasses Reef',          lat: 25.012, lon: -80.376, region: 'keys' },
  // Keys
  { id: '41043', name: 'NE Keys',                lat: 21.03,  lon: -64.79, region: 'keys' },
  { id: 'SMKF1', name: 'Sombrero Key',           lat: 24.627, lon: -81.113, region: 'keys' },
  { id: 'SANF1', name: 'Sand Key',               lat: 24.454, lon: -81.877, region: 'keys' },
  // Gulf far offshore
  { id: '42003', name: 'East Gulf Offshore',     lat: 25.94,  lon: -85.55, region: 'swfl' },
  { id: '42001', name: 'Mid Gulf',               lat: 25.90,  lon: -89.67, region: 'panhandle' },
]

// NOAA tide stations by region
export const TIDE_STATIONS: Record<string, { id: string; name: string }> = {
  panhandle:  { id: '8729840', name: 'Pensacola' },
  northfl:    { id: '8727520', name: 'Cedar Key' },
  centralfl:  { id: '8726520', name: 'Tampa Bay' },
  swfl:       { id: '8725110', name: 'Naples' },
  sefl:       { id: '8722670', name: 'Lake Worth Pier' },
  keys:       { id: '8724580', name: 'Key West' },
}

export function getNearestBuoy(lat: number, lon: number) {
  let closest = FLORIDA_BUOYS[0]
  let minDist = Infinity
  for (const buoy of FLORIDA_BUOYS) {
    const dist = haversine(lat, lon, buoy.lat, buoy.lon)
    if (dist < minDist) { minDist = dist; closest = buoy }
  }
  return { ...closest, distanceMiles: Math.round(minDist) }
}

// Region center coordinates
export const REGION_COORDS: Record<string, { lat: number; lon: number; label: string; icon: string }> = {
  panhandle: { lat: 30.40, lon: -86.90, label: 'Panhandle',      icon: '🏖️' },
  northfl:   { lat: 29.65, lon: -82.80, label: 'North Florida',  icon: '🌲' },
  centralfl: { lat: 28.20, lon: -82.40, label: 'Central Florida',icon: '🐊' },
  swfl:      { lat: 26.50, lon: -81.80, label: 'SW Florida',     icon: '🐚' },
  sefl:      { lat: 26.00, lon: -80.10, label: 'SE Florida',     icon: '🦈' },
  keys:      { lat: 24.70, lon: -81.20, label: 'The Keys',       icon: '🦐' },
}

// Boat thresholds — used to calculate go/no-go per vessel
export const BOAT_TYPES: Record<string, { label: string; max_wind_kts: number; max_wave_ft: number; icon: string }> = {
  kayak:          { label: 'Kayak / Paddleboard', max_wind_kts: 10, max_wave_ft: 1.0, icon: '🛶' },
  jon_boat:       { label: 'Jon Boat (< 16ft)',    max_wind_kts: 15, max_wave_ft: 1.5, icon: '🚤' },
  center_console: { label: 'Center Console',       max_wind_kts: 22, max_wave_ft: 4.0, icon: '⛵' },
  bay_boat:       { label: 'Bay Boat',              max_wind_kts: 20, max_wave_ft: 3.0, icon: '🛥️' },
  offshore:       { label: 'Offshore (25ft+)',      max_wind_kts: 30, max_wave_ft: 7.0, icon: '🚢' },
  pontoon:        { label: 'Pontoon Boat',          max_wind_kts: 18, max_wave_ft: 2.0, icon: '🛳️' },
  atv_truck:      { label: 'ATV / Truck (Hunting)', max_wind_kts: 999, max_wave_ft: 999, icon: '🚜' },
}

// Verdict logic — accounts for boat type
export function getVerdict(windKts: number, waveFt: number, boatType: string): 'GO' | 'CAUTION' | 'NO-GO' {
  const boat = BOAT_TYPES[boatType] ?? BOAT_TYPES.center_console
  if (waveFt > boat.max_wave_ft || windKts > boat.max_wind_kts) return 'NO-GO'
  if (waveFt > boat.max_wave_ft * 0.75 || windKts > boat.max_wind_kts * 0.75) return 'CAUTION'
  return 'GO'
}

// Moon phase calculation
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
  else if (cycle < 23.99) { phase = 'Last Quarter';    emoji = '🌗' }
  else if (cycle < 29.53) { phase = 'Waning Crescent'; emoji = '🌘' }

  return { phase, emoji, illumination }
}
