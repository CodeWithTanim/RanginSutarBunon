'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Truck, Clock, RefreshCw, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/initialData';

export default function Footer() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings>({ ...DEFAULT_SETTINGS });

  // Requirement 8: Hide Footer in Admin Panel (/boss)
  if (pathname.startsWith('/boss')) {
    return null;
  }

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <footer className="bg-white text-gray-700 pt-16 pb-8 border-t border-gray-200">
      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003d29] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Nationwide COD</h4>
              <p className="text-xs text-gray-500 mt-0.5">Pay conveniently upon package arrival</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003d29] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">100% Authentic</h4>
              <p className="text-xs text-gray-500 mt-0.5">Directly sourced from verified weavers</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003d29] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Fast Dispatch</h4>
              <p className="text-xs text-gray-500 mt-0.5">Orders processed within 24-48 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003d29] flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Easy Tracking</h4>
              <p className="text-xs text-gray-500 mt-0.5">Check order progress anytime with Order ID</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand & About (Requirement 2: Fully customizable from Admin) */}
        <div className="space-y-4">
          <h3 className="font-serif text-2xl font-bold text-[#003d29]">
            {settings.siteTitle ? settings.siteTitle.split('|')[0].trim() : 'Rangin Sutar Bunon'}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {settings.footerAboutText || 'Celebrating the rich heritage of handcrafted textiles, terracotta pottery, organic teas, and brassware.'}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Explore Store</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-[#003d29] transition-colors">Home Page</Link></li>
            <li><Link href="/shop" className="hover:text-[#003d29] transition-colors">All Products</Link></li>
            <li><Link href="/order-status" className="hover:text-[#003d29] transition-colors">Track Order Status</Link></li>
            <li><Link href="/about" className="hover:text-[#003d29] transition-colors">Artisan Story</Link></li>
            <li><Link href="/contact" className="hover:text-[#003d29] transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Customer Care (Requirement 2: Dynamic Contact info from Admin) */}
        <div>
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Customer Support</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2.5 text-gray-700">
              <Phone className="w-4 h-4 text-[#003d29] shrink-0" />
              <span>{settings.footerPhone || '+880 1712-345678'}</span>
            </li>
            <li className="flex items-center gap-2.5 text-gray-700">
              <Mail className="w-4 h-4 text-[#003d29] shrink-0" />
              <span>{settings.footerEmail || 'support@ranginsutarbunon.com'}</span>
            </li>
            <li className="flex items-start gap-2.5 text-gray-700">
              <MapPin className="w-4 h-4 text-[#003d29] shrink-0 mt-0.5" />
              <span>{settings.footerAddress || 'Heritage Craft Cluster, Lake Road, Dhaka - 1209'}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>{settings.footerCopyright || `© ${new Date().getFullYear()} Rangin Sutar Bunon. All rights reserved.`}</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for artisanal craftsmanship
        </p>
      </div>
    </footer>
  );
}
