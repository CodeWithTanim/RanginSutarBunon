'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2, ArrowLeft, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, deliveryCharge, grandTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-gray-200 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-gray-500">Explore our handcrafted textiles, terracotta pottery, and organic teas.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 bg-[#003d29] hover:bg-[#00281b] text-white font-bold text-xs rounded-full shadow-md transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900">Shopping Cart</h1>
          <p className="text-xs text-gray-500 mt-1">Review your selected items before checkout</p>
        </div>
        <Link
          href="/shop"
          className="text-xs font-bold text-[#003d29] hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const price = item.product.discountPrice ?? item.product.price;
            return (
              <div
                key={item.product.id}
                className="p-4 sm:p-5 bg-white border border-gray-200 rounded-3xl flex flex-col sm:flex-row gap-5 items-center justify-between shadow-sm"
              >
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-2xl object-contain bg-[#f5f5f5] p-2 border border-gray-200 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{item.product.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.product.categoryName}</p>
                    <span className="text-sm font-extrabold text-[#003d29] sm:hidden mt-2 block">
                      ৳{price}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-0 border-gray-100 pt-3 sm:pt-0">
                  <div className="flex items-center border border-gray-300 rounded-full bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="hidden sm:block text-base font-extrabold text-[#003d29] w-24 text-right">
                    ৳{price * item.quantity}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-6 space-y-6 shadow-sm sticky top-28">
          <h2 className="font-serif text-xl font-bold text-gray-900 pb-4 border-b border-gray-200">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span className="font-bold text-gray-900">৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#003d29]" /> Delivery Charge
              </span>
              <span className="font-bold text-gray-900">৳{deliveryCharge}</span>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-between text-base font-extrabold text-gray-900">
              <span>Total Payable</span>
              <span className="text-2xl text-[#003d29]">৳{grandTotal}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 bg-[#003d29] hover:bg-[#00281b] text-white font-extrabold rounded-full shadow-lg flex items-center justify-center gap-2 text-sm transition-all hover:scale-[1.02]"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
