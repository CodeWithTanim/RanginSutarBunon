'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ProductItem } from '@/lib/initialData';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(80);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then((res) => (res.ok ? res.json() : null)),
      fetch('/api/settings').then((res) => res.json()),
    ])
      .then(([prodData, settingsData]) => {
        if (prodData) {
          setProduct(prodData);
          setActiveImage(prodData.imageUrl);
        }
        if (settingsData && typeof settingsData.deliveryCharge === 'number') {
          setDeliveryCharge(settingsData.deliveryCharge);
        }
      })
      .catch((err) => console.error('Failed to load product detail:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-6 w-32 bg-gray-200 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-96 bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-gray-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-gray-900">Product Not Found</h2>
        <p className="text-xs text-gray-500">The product you are looking for may have been removed or is unavailable.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 bg-[#003d29] text-white font-bold text-xs rounded-full shadow-md"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const effectivePrice = product.discountPrice ?? product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const imageGallery = [product.imageUrl, ...(product.images || [])].filter(Boolean);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#003d29] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full bg-[#f5f5f5] rounded-3xl overflow-hidden border border-gray-200 shadow-sm p-6 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage || product.imageUrl}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {imageGallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {imageGallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all p-2 bg-[#f5f5f5] ${
                    activeImage === img ? 'border-[#003d29]' : 'border-gray-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003d29]">
              {product.categoryName}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing (Requirement 9: Taka ৳ Symbol) */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">৳{effectivePrice}</span>
              {hasDiscount && (
                <span className="text-base text-gray-400 line-through">৳{product.price}</span>
              )}
            </div>
            {hasDiscount && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Save ৳{product.price - product.discountPrice!}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold">
            {product.stock > 0 ? (
              <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock} units available)
              </span>
            ) : (
              <span className="text-rose-600 flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4" /> Out of Stock
              </span>
            )}
          </div>

          <div className="space-y-2 border-t border-b border-gray-200 py-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Product Description</h3>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {product.stock > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-full bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 text-sm font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2.5 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-full border border-gray-300 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <ShoppingBag className="w-5 h-5 text-[#003d29]" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="px-6 py-4 bg-[#003d29] hover:bg-[#00281b] text-white font-extrabold rounded-full shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
                >
                  Buy Now (COD)
                </button>
              </div>
            </div>
          )}

          <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 text-xs text-gray-700">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#003d29] shrink-0" />
              <div>
                <span className="font-bold text-gray-900">Standard Delivery Charge: ৳{deliveryCharge}</span>
                <p className="text-gray-500">Delivered within 3-5 business days across Bangladesh.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold text-gray-900">Cash on Delivery (COD) Payment</span>
                <p className="text-gray-500">Pay cash upon delivery. Inspect your package at arrival.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
