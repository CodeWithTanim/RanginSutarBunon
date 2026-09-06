'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Phone, Mail, MapPin } from 'lucide-react';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/initialData';

export default function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error('Error loading settings:', err));
  }, []);

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-stone-900">{settings.aboutTitle || 'About Rangin Sutar Bunon'}</h1>
        <p className="text-stone-700 text-base max-w-2xl mx-auto leading-relaxed font-medium">
          {settings.aboutSubtitle || 'We are dedicated to preserving, celebrating, and delivering authentic Indian handcrafted textiles, unglazed terracotta pottery, organic teas, and heritage brassware.'}
        </p>
      </div>

      {/* Story Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-300">{settings.aboutStoryHeading || 'Our Weaving & Craft Legacy'}</h2>
        <p className="text-stone-200 text-sm sm:text-base leading-relaxed font-normal">
          {settings.aboutStoryContent || 'Every piece in our shop represents hours of patient craftsmanship on wooden looms, hand-spun clay pottery wheels, or brass engraving blocks. By eliminating middle traders, we guarantee fair compensation to artisan families while bringing you certified heirloom quality.'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-stone-800">
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-center space-y-1">
            <h4 className="text-3xl font-extrabold text-amber-400">{settings.aboutStat1Value || '50+'}</h4>
            <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider">{settings.aboutStat1Label || 'Master Artisan Guilds'}</p>
          </div>
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-center space-y-1">
            <h4 className="text-3xl font-extrabold text-amber-400">{settings.aboutStat2Value || '100%'}</h4>
            <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider">{settings.aboutStat2Label || 'Organic & Handcrafted'}</p>
          </div>
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-center space-y-1">
            <h4 className="text-3xl font-extrabold text-amber-400">{settings.aboutStat3Value || 'COD'}</h4>
            <p className="text-xs font-semibold text-stone-300 uppercase tracking-wider">{settings.aboutStat3Label || 'Nationwide Cash on Delivery'}</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12 space-y-6 shadow-2xl">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-300">Get in Touch</h2>
        <p className="text-stone-200 text-sm sm:text-base font-normal">
          Have questions about your order or want to inquire about bulk custom handwoven orders? Contact our team anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-3 p-4 bg-stone-950 border border-stone-800 rounded-2xl">
            <Phone className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-200 block">Phone / WhatsApp</span>
              <span className="text-stone-300">{settings.footerPhone || '+880 1712-345678'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-stone-950 border border-stone-800 rounded-2xl min-w-0">
            <Mail className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-amber-200 block">Email Support</span>
              <span className="text-stone-300 text-xs sm:text-sm break-all">{settings.footerEmail || 'support@ranginsutarbunon.com'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-stone-950 border border-stone-800 rounded-2xl">
            <MapPin className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-200 block">Store Office</span>
              <span className="text-stone-300">{settings.footerAddress || 'Heritage Craft Cluster, Lake Road, Dhaka - 1209'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
