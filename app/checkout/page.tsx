'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Truck, ArrowLeft, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, deliveryCharge, grandTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    note: '',
  });

  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-gray-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-[#003d29] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-[#003d29] hover:bg-[#00281b] text-white font-bold text-xs rounded-full shadow-md"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanMobile = formData.mobile.trim();
    if (!/^\d{10,11}$/.test(cleanMobile)) {
      setError('Please enter a valid mobile number (e.g., 01712345678)');
      return;
    }

    if (!formData.customerName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.address.trim()) {
      setError('Please enter your delivery street address');
      return;
    }
    if (!formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      setError('Please provide City, State, and PIN code');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          mobile: cleanMobile,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          note: formData.note,
          items: cart.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      router.push(`/order-success?id=${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while placing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#003d29] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900">Checkout</h1>
        <p className="text-xs text-gray-500">Complete your shipping information to place your Cash on Delivery order</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-gray-900 pb-4 border-b border-gray-200 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#003d29]" /> Delivery Address & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-gray-700">Customer Full Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="e.g. Ananya Roy"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-gray-700">Mobile Number *</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                placeholder="e.g. 01712345678"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none transition-colors"
              />
              <p className="text-[11px] text-gray-500">Required for delivery verification and checking order status.</p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-gray-700">Full House / Street Address *</label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="House / Flat No, Road Name, Area..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-gray-700">City / Town *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="e.g. Dhaka"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-gray-700">District / State *</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="e.g. Dhaka Division"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-gray-700">Postal / PIN Code *</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                placeholder="e.g. 1209"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-gray-700">Delivery Instructions / Note (Optional)</label>
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="e.g. Leave parcel at gate or call before arrival"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Payment Method</label>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#003d29]" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-gray-600">Pay cash right at your door upon package arrival</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-[#003d29] text-white px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#003d29] hover:bg-[#00281b] text-white font-extrabold rounded-full shadow-lg flex items-center justify-center gap-2 text-base transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {submitting ? 'Creating Order...' : 'Place Order (Cash on Delivery)'}
          </button>
        </form>

        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 space-y-6 shadow-sm sticky top-28">
          <h2 className="font-serif text-xl font-bold text-gray-900 pb-4 border-b border-gray-200 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#003d29]" /> Order Summary
          </h2>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => {
              const price = item.product.discountPrice ?? item.product.price;
              return (
                <div key={item.product.id} className="flex items-center justify-between text-xs py-2 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-10 h-10 rounded-lg object-contain bg-[#f5f5f5] p-1" />
                    <div>
                      <span className="font-bold text-gray-900 block line-clamp-1">{item.product.name}</span>
                      <span className="text-gray-500">Qty: {item.quantity} × ৳{price}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#003d29]">৳{price * item.quantity}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-2 text-sm pt-3 border-t border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="text-gray-900 font-bold">৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span className="text-gray-900 font-bold">৳{deliveryCharge}</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between text-base font-extrabold text-gray-900">
              <span>Total Payable</span>
              <span className="text-2xl text-[#003d29]">৳{grandTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
