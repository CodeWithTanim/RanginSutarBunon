'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { CheckCircle2, Copy, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { OrderRecord } from '@/lib/initialData';

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedParams = use(searchParams);
  const orderId = resolvedParams.id || '';
  const [copied, setCopied] = useState<boolean>(false);

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-950 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Order Successfully Placed!</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-100">Thank You for Shopping</h1>
          <p className="text-stone-300 text-sm max-w-lg mx-auto">
            Your order has been recorded and will be prepared by our artisan team.
          </p>
        </div>

        {/* Order ID Box */}
        {orderId && (
          <div className="p-6 bg-stone-950 border border-amber-800/40 rounded-2xl max-w-md mx-auto space-y-3 shadow-inner">
            <span className="text-xs text-stone-400 font-medium">Your Unique Order Identifier</span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-amber-300 tracking-wider">
                {orderId}
              </span>
              <button
                onClick={copyOrderId}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-300 rounded-lg transition-colors"
                title="Copy Order ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-[11px] font-semibold text-emerald-400 animate-fade-in">Copied to clipboard!</p>}
          </div>
        )}

        {/* Important Notice */}
        <div className="p-4 bg-amber-950/40 border border-amber-800/50 rounded-2xl text-left text-xs text-amber-200/90 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-300">
            <ShieldCheck className="w-4 h-4" /> Important Notice
          </p>
          <p className="text-stone-300 leading-relaxed">
            Please save or screenshot your <strong>Order ID ({orderId})</strong>. You can use this ID along with your mobile number anytime on our <strong>Order Status</strong> page to track package progress.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/order-status"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2 text-sm"
          >
            Track Order Status <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl border border-stone-700 transition-colors text-center text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
