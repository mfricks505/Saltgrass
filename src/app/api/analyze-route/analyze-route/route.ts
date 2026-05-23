import { NextRequest, NextResponse } from 'next/server';
import { getNearestBuoy } from '../../../../lib/marine';

export async function POST(req: NextRequest) {
  try {
    const { boatId, waypoints = [], departureTime = new Date().toISOString() } = await req.json();

    // For demo - hardcode a boat (replace with real Supabase fetch later)
    const boat = { type: 'center_console', length_ft: 22, max_wind_kts: 22, max_wave_ft: 5 };

    const segments = [
      { name: "Dock to Pass", center: { lat: 30.42, lon: -87.22 } },
      { name: "Inlet Crossing", center: { lat: 30.35, lon: -87.15 } },
      ...waypoints.map((wp: any, i: number) => ({ 
        name: `Leg ${i+1}`, 
        center: wp 
      }))
    ];

    const results = [];

    for (const seg of segments) {
      const { lat, lon } = seg.center;
      const marineRes = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_period,wind_speed_10m`);
      const marine = await marineRes.json();

      const hourly = marine.hourly || {};
      const windSpeed = hourly.wind_speed_10m?.[0] || 12;
      const waveHeight = hourly.wave_height?.[0] || 2;
      const wavePeriod = hourly.wave_period?.[0] || 8;

      const buoy = getNearestBuoy(lat, lon);

      let verdict = 'Go';
      let color = 'emerald';
      const risks: string[] = [];

      if (windSpeed > 20) { verdict = 'Caution'; color = 'yellow'; risks.push('Strong Wind'); }
      if (waveHeight > 4) { verdict = 'No-Go'; color = 'red'; risks.push('Rough Seas'); }

      results.push({
        segment: seg.name,
        windSpeed: Math.round(windSpeed),
        waveHeight: Number(waveHeight.toFixed(1)),
        wavePeriod: Math.round(wavePeriod),
        buoy: buoy.name,
        verdict,
        color,
        risks
      });
    }

    return NextResponse.json({
      segments: results,
      overall: { recommendation: 'Good to Go', confidence: 78 }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 });
  }
}