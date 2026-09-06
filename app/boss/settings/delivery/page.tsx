'use client';

import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminDeliverySettingsPage() {
  const [deliveryCharge, setDeliveryCharge] = useState<string>('80');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.deliveryCharge === 'number') {
          setDeliveryCharge(String(data.deliveryCharge));
        }
      })
      .catch((err) => console.error('Error fetching delivery settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const chargeVal = parseFloat(deliveryCharge);
      if (isNaN(chargeVal) || chargeVal < 0) {
        throw new Error('Please enter a valid non-negative delivery charge');
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryCharge: chargeVal }),
      });

      if (!res.ok) {
        throw new Error('Failed to update delivery settings');
      }

      setSuccessMsg('Default delivery charge updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Save error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-extrabold text-stone-100">Delivery Charge Settings</h1>
        <p className="text-xs text-stone-400">Configure the default delivery fee applied automatically at customer checkout</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-amber-100">Default Shipping Fee</h2>
            <p className="text-xs text-stone-400">Standard rate added to every new customer order subtotal</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-300">
            Delivery Charge Amount (৳) *
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-stone-400 text-sm">৳</span>
            <input
              type="number"
              step="1"
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(e.target.value)}
              required
              disabled={loading}
              className="w-full pl-9 pr-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-amber-300 font-extrabold text-lg rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Business Rule Guarantee Callout */}
        <div className="p-4 bg-amber-950/40 border border-amber-800/40 rounded-2xl space-y-1 text-xs text-amber-200/90">
          <p className="font-bold flex items-center gap-1.5 text-amber-300">
            <ShieldCheck className="w-4 h-4" /> Snapshot Business Logic Guaranteed
          </p>
          <p className="text-stone-300 leading-relaxed">
            When an order is created, the delivery charge active at that exact moment is permanently stored inside that order record. Changing this value (e.g. from ₹80 to ₹100) will affect only new orders. Historical orders will strictly retain their original delivery fee.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 text-xs disabled:opacity-50"
        >
          {saving ? 'Updating Settings...' : 'Save Delivery Settings'}
        </button>
      </form>
    </div>
  );
}
