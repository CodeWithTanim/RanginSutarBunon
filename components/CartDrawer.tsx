'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryCharge,
    grandTotal,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-gray-900 shadow-2xl flex flex-col border-l border-gray-200">
          <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#003d29] flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-gray-900">Shopping Cart</h2>
                <p className="text-xs text-gray-500">{cart.length} item(s) selected</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Your cart is empty</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Discover our handcrafted textiles, artisan pottery, and heritage collections.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-6 py-2.5 bg-[#003d29] hover:bg-[#00281b] text-white font-bold rounded-full text-sm transition-colors shadow-md"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const effectivePrice = item.product.discountPrice ?? item.product.price;
                return (
                  <div
                    key={item.product.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex gap-4 items-center"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-200 p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{item.product.categoryName}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-extrabold text-[#003d29]">
                          ৳{effectivePrice * item.quantity}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#003d29]" /> Delivery Charge
                  </span>
                  <span className="text-gray-900 font-bold">৳{deliveryCharge}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-xl text-[#003d29]">৳{grandTotal}</span>
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-full transition-colors text-center"
                >
                  Continue Shopping
                </button>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-3 bg-[#003d29] hover:bg-[#00281b] text-white text-xs font-bold rounded-full transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
