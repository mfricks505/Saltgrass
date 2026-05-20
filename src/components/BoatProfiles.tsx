'use client';

import { useState, useEffect } from 'react';

export default function BoatProfiles({ onBoatSelect }: { onBoatSelect: (id: string) => void }) {
  const [boats, setBoats] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    type: 'center_console',
    length_ft: 22,
    draft_ft: 2.5
  });

  useEffect(() => {
    loadBoats();
  }, []);

  async function loadBoats() {
    const res = await fetch('/api/boats');
    const data = await res.json();
    setBoats(data);
  }

  async function saveBoat() {
    await fetch('/api/boats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ name: '', type: 'center_console', length_ft: 22, draft_ft: 2.5 });
    loadBoats();
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-3xl">
      <h3 className="text-2xl font-bold mb-6">Your Boats</h3>

      <div className="space-y-4 mb-8">
        {boats.map((boat) => (
          <div key={boat.id} className="flex justify-between bg-zinc-800 p-4 rounded-2xl">
            <div>
              <p className="font-semibold">{boat.name} — {boat.length_ft}ft</p>
              <p className="text-sm text-zinc-400">{boat.type}</p>
            </div>
            <button 
              onClick={() => onBoatSelect(boat.id)}
              className="px-5 py-2 bg-emerald-600 rounded-xl text-sm font-medium"
            >
              Use This Boat
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-700 pt-6">
        <h4 className="font-semibold mb-4">Add New Boat</h4>
        <input
          type="text"
          placeholder="Boat Name (e.g. Bluefin 22)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-4 bg-zinc-800 rounded-xl mb-3"
        />
        <select 
          value={form.type} 
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full p-4 bg-zinc-800 rounded-xl mb-3"
        >
          <option value="center_console">Center Console</option>
          <option value="bay_boat">Bay Boat</option>
          <option value="flats_skiff">Flats Skiff</option>
          <option value="offshore">Offshore</option>
        </select>
        <button 
          onClick={saveBoat}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-semibold"
        >
          Save Boat
        </button>
      </div>
    </div>
  );
}