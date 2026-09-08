'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { ProductItem } from '@/lib/initialData';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }: { product: ProductItem }) {
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const effectivePrice = product.discountPrice ?? product.price;

  return (
    <div className="group bg-white border border-gray-100 hover:border-gray-300 rounded-3xl p-4 transition-all duration-300 flex flex-col justify-between hover:shadow-xl">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-[#f5f5f5] rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Right Heart Wishlist Icon */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`absolute top-3 right-3 p-2 rounded-full bg-white shadow-md transition-colors ${
            isLiked ? 'text-rose-500 fill-rose-500' : 'text-gray-400 hover:text-gray-700'
          }`}
          title="Add to Wishlist"
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>

      </div>

      {/* Product Content */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Price Line (Requirement 9: Taka ৳ Symbol) */}
          <div className="flex items-start justify-between gap-2">
            <Link href={`/product/${product.id}`}>
              <h3 className="font-bold text-gray-900 text-base line-clamp-1 hover:text-[#003d29] transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="text-right shrink-0">
              <span className="font-extrabold text-gray-900 text-base">৳{effectivePrice}</span>
              {hasDiscount && (
                <span className="block text-[11px] text-gray-400 line-through">৳{product.price}</span>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</p>
        </div>

        <div className="pt-2">
          {product.stock > 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="w-full py-2.5 px-4 rounded-full border border-[#003d29] hover:bg-[#003d29] text-[#003d29] hover:text-white font-bold text-xs transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
            >
              Add to Cart
            </button>
          ) : (
            <span className="block text-center py-2 text-xs font-bold text-rose-500 bg-rose-50 rounded-full">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
