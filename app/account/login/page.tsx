'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Phone, ArrowRight, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanMobile = mobile.trim();
    if (!/^01\d{9}$/.test(cleanMobile)) {
      setError('Please enter a valid 11-digit Bangladesh mobile number starting with 01');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/customer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/account');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid mobile number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 max-w-md mx-auto px-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-700/50 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
            <User className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-100">Customer Login</h1>
          <p className="text-xs text-stone-400">Sign in to view your orders and track live delivery status</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">Mobile Number *</label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                maxLength={10}
                placeholder="e.g. 9876543210"
                className="w-full pl-11 pr-4 py-3.5 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300">Password *</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-extrabold rounded-2xl shadow-xl shadow-amber-950/40 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone-800 text-center text-xs text-stone-400">
          <span>Don't have an account yet? </span>
          <Link href="/account/register" className="font-bold text-amber-300 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
