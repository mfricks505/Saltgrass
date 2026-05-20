'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    } else {
      router.push('/analyzer');
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Check your email for confirmation link!");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 p-10 rounded-3xl">
        <h1 className="text-4xl font-bold text-center mb-10">Saltgrass</h1>
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 bg-zinc-800 rounded-2xl mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 bg-zinc-800 rounded-2xl mb-8"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-emerald-600 rounded-2xl font-semibold text-lg mb-4"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full py-4 bg-zinc-700 hover:bg-zinc-600 rounded-2xl font-semibold"
        >
          Create New Account
        </button>

        <p className="text-center text-sm text-zinc-500 mt-8">
          Demo: Use any email + password (Supabase will handle it)
        </p>
      </div>
    </div>
  );
}