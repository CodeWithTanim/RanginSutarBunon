'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Phone, Lock, User, MapPin, ArrowRight, AlertCircle } from 'lucide-react';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanMobile = formData.mobile.trim();
    if (!/^\d{10,11}$/.test(cleanMobile)) {
      setError('Please enter a valid 11-digit or 10-digit mobile number');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/customer/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, mobile: cleanMobile }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/account');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-lg mx-auto px-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-700/50 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
            <UserPlus className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-100">Create Customer Account</h1>
          <p className="text-xs text-stone-400">Save your delivery details and track all past orders automatically</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-stone-300">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Ananya Roy"
              className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-stone-300">10-Digit Mobile Number *</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              maxLength={10}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-stone-300">Account Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-stone-300">Full Address *</label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Flat / Building, Street Name..."
              className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Kolkata"
                className="w-full px-3 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="WB"
                className="w-full px-3 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">PIN *</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                maxLength={6}
                placeholder="700029"
                className="w-full px-3 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-extrabold rounded-2xl shadow-xl shadow-amber-950/40 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone-800 text-center text-xs text-stone-400">
          <span>Already registered? </span>
          <Link href="/account/login" className="font-bold text-amber-300 hover:underline">
            Login Here
          </Link>
        </div>
      </div>
    </div>
  );
}
