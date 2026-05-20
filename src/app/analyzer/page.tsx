'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import BoatProfiles from '@/components/BoatProfiles';
import { Anchor, Save, Share2 } from 'lucide-react';

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false });

export default function AnalyzerPage() {
  const [selectedBoatId, setSelectedBoatId] = useState('');
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const analyze = async () => {
    if (!selectedBoatId) {
      alert("Please select or create a boat first");
      return;
    }
    setLoading(true);
    const res = await fetch('/api/analyze-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boatId: selectedBoatId, waypoints })
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const saveRoute = async () => {
    if (!result) return;
    setSaving(true);

    const routeName = prompt("Name this route:", `Trip from Pensacola - ${new Date().toLocaleDateString()}`);

    const res = await fetch('/api/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: routeName || "Untitled Route",
        start_lat: 30.42,
        start_lon: -87.22,
        waypoints: waypoints,
        analysis_result: result,
      })
    });

    const saved = await res.json();
    alert(`Route saved!\n\nYou can view the full report at: /report/${saved.id}`);
    setSaving(false);
  };

  const shareReport = () => {
    if (!result) return;
    const shareText = `Saltgrass Go/No-Go Report: ${result.overall.recommendation}\n\nCheck conditions before heading out!`;
    navigator.clipboard.writeText(shareText);
    alert("Report summary copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 flex items-center gap-4">
          <Anchor className="text-emerald-500" /> Saltgrass Go/No-Go Analyzer
        </h1>

        {/* Step 12 - History Link */}
        <div className="flex justify-end mb-8">
          <a 
            href="/history" 
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl flex items-center gap-2 text-sm font-medium"
          >
            View Trip History →
          </a>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - Inputs */}
          <div className="xl:col-span-5 space-y-8">
            <BoatProfiles onBoatSelect={setSelectedBoatId} />
            <RouteMap onWaypointsChange={setWaypoints} />
            
            <button
              onClick={analyze}
              disabled={loading}
              className="w-full py-6 text-xl font-bold bg-emerald-600 hover:bg-emerald-700 rounded-3xl disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze Full Route'}
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="xl:col-span-7">
            {result ? (
              <div className="space-y-6">
                <div className="bg-emerald-900/80 p-8 rounded-3xl text-center">
                  <h2 className="text-3xl font-bold">{result.overall.recommendation}</h2>
                </div>

                {result.segments.map((seg: any, i: number) => (
                  <div key={i} className="bg-zinc-900 p-8 rounded-3xl">
                    <h3 className="text-2xl font-bold mb-6">{seg.segment}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-lg">
                      <div>Wind: <strong>{seg.windSpeed} kts</strong></div>
                      <div>Waves: <strong>{seg.waveHeight} ft</strong></div>
                      <div>Period: <strong>{seg.wavePeriod} s</strong></div>
                      <div className={`font-bold ${seg.color === 'red' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {seg.verdict}
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-zinc-400">Nearest Buoy: {seg.buoy}</p>
                  </div>
                ))}

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={saveRoute}
                    disabled={saving}
                    className="flex-1 py-5 bg-zinc-700 hover:bg-zinc-600 rounded-2xl font-semibold flex items-center justify-center gap-3"
                  >
                    <Save size={24} /> Save Route
                  </button>
                  <button
                    onClick={shareReport}
                    className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-semibold flex items-center justify-center gap-3"
                  >
                    <Share2 size={24} /> Share Report
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xl py-20 border border-dashed border-zinc-700 rounded-3xl">
                Select a boat, set your route on the map, then click Analyze
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}