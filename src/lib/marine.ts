export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const FLORIDA_BUOYS = [
  { id: "42039", name: "Pensacola", lat: 28.77, lon: -86.02 },
  { id: "42040", name: "Dauphin Island", lat: 29.21, lon: -88.27 },
  { id: "42003", name: "East Gulf", lat: 25.94, lon: -85.55 },
];

export function getNearestBuoy(lat: number, lon: number) {
  let closest = FLORIDA_BUOYS[0];
  let minDist = Infinity;
  for (const buoy of FLORIDA_BUOYS) {
    const dist = haversine(lat, lon, buoy.lat, buoy.lon);
    if (dist < minDist) {
      minDist = dist;
      closest = buoy;
    }
  }
  return { ...closest, distanceMiles: Math.round(minDist) };
}