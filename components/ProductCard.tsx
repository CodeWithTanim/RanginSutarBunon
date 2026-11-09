'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { ProductItem } from '@/lib/initialData';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProductCard({ product }: { product: ProductItem }) {
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const effectivePrice = product.discountPrice ?? product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  return (
    <div className="group bg-white border border-gray-100 hover:border-gray-300 rounded-3xl p-4 transition-all duration-300 flex flex-col justify-between hover:shadow-xl relative">
      {/* Top Image Container */}
      <div className="relative aspect-square w-full bg-[#f8f7f5] rounded-2xl overflow-hidden mb-4 flex items-center justify-center p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive" className="text-[10px] px-2 py-0.5 font-bold shadow-sm">
              -{discountPercent}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-bold shadow-sm">
              Featured
            </Badge>
          )}
        </div>

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
          {/* Category Tag */}
          <span className="text-[11px] font-semibold text-[#003d29] uppercase tracking-wider block mb-1">
            {product.categoryName || 'Handcrafted'}
          </span>

          {/* Title & Price Line */}
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

          <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-2">
          {product.stock > 0 ? (
            <Button
              onClick={() => addToCart(product)}
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold border-[#003d29] text-[#003d29] hover:bg-[#003d29] hover:text-white"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Add to Cart
            </Button>
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
