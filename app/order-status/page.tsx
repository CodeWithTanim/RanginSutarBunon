'use client';

import React, { useState } from 'react';
import { Search, CheckCircle2, AlertCircle, MapPin, CreditCard } from 'lucide-react';
import { OrderRecord } from '@/lib/initialData';

const STATUS_STEPS = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export default function OrderStatusPage() {
  const [orderIdInput, setOrderIdInput] = useState<string>('');
  const [mobileInput, setMobileInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState<string>('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!orderIdInput.trim() || !mobileInput.trim()) {
      setError('Please provide both Order ID and Mobile Number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderIdInput.trim(),
          mobile: mobileInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not find matching order');
      }
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'We couldn’t find an order matching these details.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    if (status === 'Cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  const activeStepIdx = order ? getStepIndex(order.status) : -1;

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900">Track Order Status</h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto">
          Enter your unique Order ID and registered mobile number to view real-time shipping progress.
        </p>
      </div>

      <form onSubmit={handleTrack} className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-gray-700">Order ID *</label>
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="e.g. ORD-20260906-001"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none font-mono uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-gray-700">Mobile Number *</label>
            <input
              type="tel"
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              placeholder="e.g. 01712345678"
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#003d29] hover:bg-[#00281b] text-white font-extrabold rounded-full shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <Search className="w-4 h-4" /> {loading ? 'Searching Record...' : 'Check Order Status'}
        </button>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {order && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
            <div>
              <span className="text-xs text-gray-500 font-medium">Order Record</span>
              <h2 className="font-mono text-2xl font-bold text-[#003d29]">{order.id}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString()} by <strong className="text-gray-900">{order.customerName}</strong></p>
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold ${
                  order.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'Cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                Current Status: {order.status}
              </span>
            </div>
          </div>

          {order.status === 'Cancelled' ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
              <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
              <h3 className="text-lg font-bold text-rose-900">Order Cancelled</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                This order was cancelled. Please contact customer support for details.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">Order Progress Tracker</h3>

              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                <div className="hidden md:block absolute top-4 left-6 right-6 h-1 bg-gray-200 z-0" />
                <div
                  className="hidden md:block absolute top-4 left-6 h-1 bg-[#003d29] z-0 transition-all duration-500"
                  style={{
                    width: `${(activeStepIdx / (STATUS_STEPS.length - 1)) * 90}%`,
                  }}
                />

                {STATUS_STEPS.map((stepName, idx) => {
                  const isCompleted = idx <= activeStepIdx;
                  const isCurrent = idx === activeStepIdx;

                  return (
                    <div key={stepName} className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center w-full md:w-auto">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-[#003d29] text-white shadow-md scale-110'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-400 border border-gray-300'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold ${isCurrent ? 'text-[#003d29] font-extrabold' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {stepName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-xs">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-[#003d29]" /> Delivery Address
              </h4>
              <p className="text-gray-900 font-bold">{order.customerName}</p>
              <p className="text-gray-600">{order.address}</p>
              <p className="text-gray-600">{order.city}, {order.state} - {order.pincode}</p>
              <p className="text-gray-600">Mobile: {order.mobile}</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-xs">
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                <CreditCard className="w-4 h-4 text-[#003d29]" /> Payment Breakdown
              </h4>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">৳{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className="text-gray-900 font-bold">৳{order.deliveryCharge}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-[#003d29] text-sm">
                <span>Total Payable (COD)</span>
                <span>৳{order.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
