import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Award, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { getProducts, getCategories, getSettings } from '@/lib/db';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const featuredProducts = await getProducts({ featuredOnly: true });
  const allProducts = await getProducts();
  const categories = await getCategories();
  const settings = await getSettings();

  return (
    <div className="space-y-12 pb-16">
      {/* Requirement 4: Dynamic Hero Section (Editable from Admin Panel) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-[#fbf0e4] rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-amber-100 shadow-sm">
          {/* Hero Left Content */}
          <div className="space-y-6 max-w-xl text-center lg:text-left z-10">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.15]">
              {settings.heroHeadline || 'Grab Upto 50% Off On Selected Handcrafted Items'}
            </h1>

            <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
              {settings.heroSubheadline || 'Authentic Jamdani textiles, unglazed terracotta pottery, organic Darjeeling teas, and antique brassware crafted by master weavers.'}
            </p>

            <div className="pt-2 flex justify-center lg:justify-start">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-[#003d29] hover:bg-[#00281b] text-[#ffffff] font-bold rounded-full shadow-lg text-base transition-all hover:scale-105"
              >
                {settings.heroCtaText || 'Buy Now'}
              </Link>
            </div>
          </div>

          {/* Hero Right Image Showcase */}
          <div className="relative w-full lg:w-1/2 aspect-[4/3] max-w-md lg:max-w-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.heroImageUrl || '/uploads/Items/Hero-Section.png'}
              alt="Artisanal Heritage Showcase"
              className="w-full h-full object-cover rounded-3xl shadow-xl border-4 border-white"
            />
          </div>
        </div>
      </section>

      {/* Filter Pills Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5"
            >
              {cat.name} <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </Link>
          ))}

          <Link
            href="/shop"
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5"
          >
            All Filters <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
          </Link>
        </div>
      </section>

      {/* Main Section Heading & Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl sm:text-3xl text-gray-900">
            Handcrafted Items For You!
          </h2>
          <Link href="/shop" className="text-xs sm:text-sm font-bold text-[#003d29] hover:underline flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Why Choose Us Showcase */}
      <section className="bg-gray-50 border-y border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-bold text-3xl text-gray-900">Why Choose Rangin Sutar Bunon?</h2>
            <p className="text-sm text-gray-600">
              We bridge the gap between traditional master artisans and lovers of authentic handcrafted heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-8 bg-white border border-gray-200 rounded-3xl space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003d29] flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Direct Artisan Sourcing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Sourced directly from certified artisan weavers, ensuring fair wages and preserving centuries-old craftsmanship.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-3xl space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003d29] flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Nationwide Cash on Delivery</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                No prepayment required. Inspect your package at your doorstep before paying Cash on Delivery.
              </p>
            </div>

            <div className="p-8 bg-white border border-gray-200 rounded-3xl space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003d29] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Live Order Tracking</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Track your package from dispatch to delivery in real time using your unique Order ID and mobile number.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl sm:text-3xl text-gray-900">
            Featured Collection
          </h2>
          <Link href="/shop" className="text-xs sm:text-sm font-bold text-[#003d29] hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
