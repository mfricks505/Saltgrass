'use client';

import { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/routes')
      .then(res => res.json())
      .then(setRoutes);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-10">Trip History</h1>

        <div className="space-y-6">
          {routes.length === 0 && <p className="text-zinc-400">No saved routes yet.</p>}

          {routes.map((route) => (
            <div key={route.id} className="bg-zinc-900 p-6 rounded-3xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-xl">{route.name}</h3>
                <p className="text-sm text-zinc-400">
                  {new Date(route.created_at).toLocaleDateString()}
                </p>
              </div>
              <a
                href={`/report/${route.id}`}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-medium"
              >
                View Report
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}