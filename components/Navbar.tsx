'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, Phone, Mail, User, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/initialData';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({ ...DEFAULT_SETTINGS });
  const [customerLoggedIn, setCustomerLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});

    fetch('/api/customer/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated) setCustomerLoggedIn(true);
      })
      .catch(() => {});
  }, [pathname]);

  // Hide Main Header in Admin Panel (/boss)
  if (pathname.startsWith('/boss')) {
    return null;
  }

  // Requirement 5: Only Home, Shop, About, Contact
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const brandMode = settings.brandDisplayMode || 'both';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Banner (Left Mobile | Center Discount Text | Right Support Email) */}
      <div className="bg-[#003d29] text-white text-xs py-2 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-3 items-center font-medium gap-2">
        {/* Left: Phone */}
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <Phone className="w-3.5 h-3.5 text-emerald-300" />
          <span>{settings.topBannerPhone || '+880 1712-345678'}</span>
        </div>

        {/* Center: Discount Text (Show/Hide controlled from Admin) */}
        {settings.showTopBannerText !== false ? (
          <div className="hidden md:flex items-center justify-center gap-2 text-emerald-100 text-center">
            <span>{settings.topBannerText || 'Welcome to Rangin Sutar Bunon'}</span>
            {settings.topBannerLinkText && (
              <>
                <span>|</span>
                <Link href={settings.topBannerLinkUrl || '/shop'} className="underline font-bold text-white hover:text-emerald-200">
                  {settings.topBannerLinkText}
                </Link>
              </>
            )}
          </div>
        ) : <div className="hidden md:block" />}

        {/* Right: Support Email (Show only if provided) */}
        <div className="hidden md:flex items-center justify-end gap-2 text-emerald-100">
          {settings.topBannerEmail && (
            <>
              <Mail className="w-3.5 h-3.5 text-emerald-300" />
              <a href={`mailto:${settings.topBannerEmail}`} className="hover:text-white transition">
                {settings.topBannerEmail}
              </a>
            </>
          )}
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Requirement 6 & 7: Left Side Logo + Website Name (Supporting Only Logo / Only Name / Both) */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {/* Logo Image */}
            {settings.logoUrl && (brandMode === 'both' || brandMode === 'logo_only') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt="Store Logo" className="h-10 w-auto object-contain rounded" />
            )}

            {/* Fallback Icon if no logo image exists and mode is not text_only */}
            {!settings.logoUrl && brandMode !== 'text_only' && (
              <div className="w-10 h-10 rounded-xl bg-[#003d29] flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
                RS
              </div>
            )}

            {/* Website Name Text */}
            {(brandMode === 'both' || brandMode === 'text_only' || !settings.logoUrl) && (
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                {settings.siteTitle ? settings.siteTitle.split('|')[0].trim() : 'Rangin Sutar Bunon'}
              </span>
            )}
          </Link>

          {/* Navigation Links (Only Home, Shop, About, Contact) */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors py-1 ${
                    isActive ? 'text-[#003d29] font-bold border-b-2 border-[#003d29]' : 'text-gray-700 hover:text-[#003d29]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Requirement 6: Right Side Login & Cart Only */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Account / Login */}
            <Link
              href={customerLoggedIn ? '/account' : '/account/login'}
              className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#003d29] transition-colors"
            >
              <User className="w-5 h-5 text-gray-700" />
              <span className="hidden sm:inline">{customerLoggedIn ? 'Account' : 'Login'}</span>
            </Link>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#003d29] transition-colors relative"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-gray-800" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#003d29] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">Cart</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-[#003d29]"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-semibold ${
                pathname === link.href
                  ? 'bg-[#003d29] text-white'
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href={customerLoggedIn ? '/account' : '/account/login'}
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-base font-bold text-[#003d29] hover:bg-gray-100"
          >
            {customerLoggedIn ? 'My Account' : 'Login / Register'}
          </Link>
        </div>
      )}
    </header>
  );
}
