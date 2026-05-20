'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { Anchor, LogOut, Map, History } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Anchor className="text-emerald-500" size={32} />
          <span className="text-2xl font-bold">Saltgrass</span>
        </Link>

        {user && (
          <div className="flex items-center gap-8">
            <Link href="/analyzer" className="flex items-center gap-2 hover:text-emerald-400 transition">
              <Map size={20} /> Analyzer
            </Link>
            <Link href="/history" className="flex items-center gap-2 hover:text-emerald-400 transition">
              <History size={20} /> History
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-500 transition"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}