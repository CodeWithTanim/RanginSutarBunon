import React from 'react';
import Link from 'next/link';
import { Home, ShoppingBag, ArrowLeft, Search, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#fcfcfc]">
      <div className="max-w-xl w-full text-center space-y-8">
        {/* Visual Badge & Icon */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-100/70 rounded-full blur-xl transform scale-125" />
          <div className="relative w-28 h-28 rounded-3xl bg-[#fbf0e4] border-2 border-amber-200/80 flex items-center justify-center text-[#003d29] shadow-inner">
            <span className="font-serif text-5xl font-black tracking-tight text-[#003d29]">404</span>
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <span className="inline-block px-3.5 py-1 bg-emerald-50 text-[#003d29] text-xs font-bold rounded-full uppercase tracking-wider border border-emerald-100">
            পৃষ্ঠাটি পাওয়া যায়নি • Page Not Found
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            অনুসন্ধানকৃত পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
            আপনি যে পৃষ্ঠাটি বা পণ্যটি খুঁজছেন তা হয়তো সরানো হয়েছে অথবা লিংকটি সঠিক নয়। নিচের অপশনগুলো থেকে প্রয়োজনীয় পেজে যেতে পারেন।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 px-7">
              <Home className="w-4 h-4" /> হোমপেজে ফিরুন
            </Button>
          </Link>
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-7 border-gray-300">
              <ShoppingBag className="w-4 h-4 text-[#003d29]" /> পণ্যসমূহ দেখুন
            </Button>
          </Link>
        </div>

        {/* Helpful Quick Links */}
        <div className="pt-8 border-t border-gray-200/80 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-gray-500">
          <Link href="/order-status" className="hover:text-[#003d29] transition-colors flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> অর্ডার ট্র্যাক করুন
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/contact" className="hover:text-[#003d29] transition-colors flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" /> কাস্টমার সাপোর্ট
          </Link>
          <span className="text-gray-300">•</span>
          <Link href="/about" className="hover:text-[#003d29] transition-colors">
            আমাদের সম্পর্কে
          </Link>
        </div>
      </div>
    </div>
  );
}

