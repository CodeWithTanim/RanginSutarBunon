'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [settings, setSettings] = useState<{ logoUrl?: string; siteTitle?: string }>({
    logoUrl: '',
    siteTitle: 'Rangin Sutar Bunon',
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('rsb_settings');
      if (stored) setSettings(JSON.parse(stored));
    } catch {}

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/boss');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-3">
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt="Store Logo"
              className="h-12 w-auto max-w-[160px] object-contain mx-auto rounded-xl"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#003d29] flex items-center justify-center text-white font-serif font-bold text-2xl mx-auto shadow-lg">
              RS
            </div>
          )}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="font-serif text-2xl font-bold text-stone-100">
              {settings.siteTitle ? settings.siteTitle.split('|')[0].trim() : 'Rangin Sutar Bunon'}
            </h1>
            <span className="bg-amber-500 text-stone-950 text-xs font-extrabold uppercase px-2 py-0.5 rounded shadow-sm tracking-wider">
              ADMIN
            </span>
          </div>
          <p className="text-xs text-stone-400">Management Dashboard Portal</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">Admin Username</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your admin username"
                required
                autoComplete="username"
                className="w-full pl-11 pr-4 py-3.5 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 placeholder-stone-600 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                required
                autoComplete="current-password"
                className="w-full pl-11 pr-4 py-3.5 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 placeholder-stone-600 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-extrabold rounded-2xl shadow-xl shadow-amber-950/40 text-sm transition-all disabled:opacity-50 cursor-pointer active:scale-[0.99]"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
