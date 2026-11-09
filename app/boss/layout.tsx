'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Truck,
  Globe,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Send,
  KeyRound,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<{ logoUrl?: string; siteTitle?: string }>({
    logoUrl: '',
    siteTitle: 'Rangin Sutar Bunon',
  });

  // Skip auth check if on login page
  const isLoginPage = pathname === '/boss/login';

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('rsb_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      }
    } catch {}

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setAuthenticated(true);
      return;
    }

    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          router.push('/boss/login');
        }
      })
      .catch(() => {
        router.push('/boss/login');
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/boss/login');
    router.refresh();
  };

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-amber-300 font-serif">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-sans tracking-widest text-stone-400 uppercase">Verifying Admin Privileges...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  const sidebarLinks = [
    { name: 'Dashboard Overview', href: '/boss', icon: LayoutDashboard },
    { name: 'Orders Management', href: '/boss/orders', icon: ShoppingBag },
    { name: 'Contact Form Messages', href: '/boss/messages', icon: MessageSquare },
    { name: 'Products Management', href: '/boss/products', icon: Package },
    { name: 'Customer Directory', href: '/boss/customers', icon: Users },
    { name: 'Delivery Charge Settings', href: '/boss/settings/delivery', icon: Truck },
    { name: 'SEO & Site Branding', href: '/boss/settings/seo', icon: Globe },
    { name: 'Telegram Order Alerts', href: '/boss/settings/telegram', icon: Send },
    { name: 'Admin Login Security', href: '/boss/settings/security', icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-stone-900 border-b border-stone-800 p-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/boss" className="flex items-center gap-2.5 min-w-0">
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logoUrl} alt="Store Logo" className="h-7 w-auto max-w-[110px] object-contain shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[#003d29] flex items-center justify-center text-white font-serif font-bold text-xs shadow-sm shrink-0">
              RS
            </div>
          )}
          <span className="bg-amber-500 text-stone-950 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-sm tracking-wider shrink-0">
            ADMIN
          </span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 shrink-0"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-stone-900 border-r border-stone-800 flex flex-col justify-between p-6 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          {/* Header Brand */}
          <Link href="/boss" className="flex items-center gap-2.5 group">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt="Store Logo"
                className="h-9 w-auto max-w-[130px] object-contain shrink-0 group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#003d29] flex items-center justify-center text-white font-serif font-bold text-base shadow-sm shrink-0">
                RS
              </div>
            )}
            <span className="bg-amber-500 text-stone-950 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded shadow-sm tracking-wider shrink-0">
              ADMIN
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="space-y-3 pt-6 border-t border-stone-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 bg-stone-950 border border-stone-800 hover:border-amber-700/50 rounded-xl text-xs text-amber-300 transition-colors"
          >
            <span>View Live Customer Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-stone-950 hover:bg-rose-950/60 border border-stone-800 hover:border-rose-800 text-stone-300 hover:text-rose-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
