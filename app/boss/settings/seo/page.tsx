'use client';

import React, { useState, useEffect } from 'react';
import { Globe, CheckCircle2, Upload, Sparkles, Image as ImageIcon, Layout } from 'lucide-react';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/initialData';

export default function AdminSEOSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings & { brandDisplayMode?: string }>({
    ...DEFAULT_SETTINGS,
    brandDisplayMode: 'both',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [uploadingFavicon, setUploadingFavicon] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error('Error fetching SEO settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSettings((prev) => ({ ...prev, logoUrl: data.url }));
    } catch (err: any) {
      alert(err.message || 'Logo upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFavicon(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setSettings((prev) => ({ ...prev, faviconUrl: data.url }));
    } catch (err: any) {
      alert(err.message || 'Favicon upload failed');
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error('Failed to update SEO & Site Settings');
      }

      setSuccessMsg('SEO Metadata & Branding Settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Error saving SEO settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-extrabold text-stone-100">SEO & Branding Settings</h1>
        <p className="text-xs text-stone-400">Configure website metadata, logo image, brand display mode, and social sharing cards</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Logo & Display Mode */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100">Website Logo & Header Branding</h2>
              <p className="text-xs text-stone-400">Upload store logo and choose how to display brand in header</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold uppercase tracking-wider text-stone-300">Header Display Mode</label>
              <select
                name="brandDisplayMode"
                value={settings.brandDisplayMode || 'both'}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-amber-300 font-bold rounded-xl outline-none cursor-pointer"
              >
                <option value="both">Show Both Logo Image & Website Name</option>
                <option value="logo_only">Show Only Logo Image</option>
                <option value="text_only">Show Only Website Name Text</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Website Logo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="logoUrl"
                  value={settings.logoUrl}
                  onChange={handleChange}
                  placeholder="https://... or /uploads/logo.png"
                  className="flex-1 px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                />
                <label className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold rounded-xl cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-4 h-4" /> {uploadingLogo ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Browser Favicon URL / Icon</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="faviconUrl"
                  value={settings.faviconUrl}
                  onChange={handleChange}
                  placeholder="/favicon.ico or upload image"
                  className="flex-1 px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                />
                <label className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold rounded-xl cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-4 h-4" /> {uploadingFavicon ? 'Uploading...' : 'Upload'}
                  <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1.5: Top Announcement Banner */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100">Top Announcement Banner Setup</h2>
              <p className="text-xs text-stone-400">Configure phone (left), center discount text, and support email (right)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Left Phone Number</label>
              <input
                type="text"
                name="topBannerPhone"
                value={settings.topBannerPhone || ''}
                onChange={handleChange}
                placeholder="+880 1712-345678"
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Right Support Email</label>
              <input
                type="email"
                name="topBannerEmail"
                value={settings.topBannerEmail || ''}
                onChange={handleChange}
                placeholder="support@ranginsutarbunon.com"
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-stone-800">
              <div className="flex items-center justify-between">
                <label className="font-bold uppercase tracking-wider text-amber-300">Center Discount Text Visibility</label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-200">
                  <input
                    type="checkbox"
                    name="showTopBannerText"
                    checked={settings.showTopBannerText !== false}
                    onChange={(e) => setSettings({ ...settings, showTopBannerText: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span>Show Discount Text Banner in Header</span>
                </label>
              </div>
            </div>

            {settings.showTopBannerText !== false && (
              <>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold uppercase tracking-wider text-stone-300">Center Discount Text</label>
                  <input
                    type="text"
                    name="topBannerText"
                    value={settings.topBannerText || ''}
                    onChange={handleChange}
                    placeholder="Get 50% Off On Selected Artisanal Items"
                    className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-stone-300">Banner Link Text</label>
                  <input
                    type="text"
                    name="topBannerLinkText"
                    value={settings.topBannerLinkText || ''}
                    onChange={handleChange}
                    placeholder="Shop Now"
                    className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-stone-300">Banner Link URL</label>
                  <input
                    type="text"
                    name="topBannerLinkUrl"
                    value={settings.topBannerLinkUrl || ''}
                    onChange={handleChange}
                    placeholder="/shop"
                    className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 1.8: Footer Customization & Social Links */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100">Footer Customization & Social Links</h2>
              <p className="text-xs text-stone-400">Manage footer description, footer contact info, and social media profile URLs</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Footer Brand About Text</label>
              <textarea
                rows={2}
                name="footerAboutText"
                value={settings.footerAboutText || ''}
                onChange={handleChange}
                placeholder="Celebrating rich quality and design..."
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Footer Contact Phone</label>
                <input
                  type="text"
                  name="footerPhone"
                  value={settings.footerPhone || ''}
                  onChange={handleChange}
                  placeholder="+880 1700-000000"
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Footer Support Email</label>
                <input
                  type="email"
                  name="footerEmail"
                  value={settings.footerEmail || ''}
                  onChange={handleChange}
                  placeholder="Leave empty to hide email from footer"
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Footer Address</label>
              <input
                type="text"
                name="footerAddress"
                value={settings.footerAddress || ''}
                onChange={handleChange}
                placeholder="Dhaka, Bangladesh"
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Footer Copyright Text</label>
              <input
                type="text"
                name="footerCopyright"
                value={settings.footerCopyright || ''}
                onChange={handleChange}
                placeholder="© 2026 Rangin Sutar Bunon. All rights reserved."
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="pt-3 border-t border-stone-800 space-y-3">
              <label className="font-bold uppercase tracking-wider text-amber-300 block">Social Media Links (Leave empty to hide icon)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-stone-400">Facebook URL</label>
                  <input
                    type="text"
                    name="facebookUrl"
                    value={settings.facebookUrl || ''}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-stone-400">Instagram URL</label>
                  <input
                    type="text"
                    name="instagramUrl"
                    value={settings.instagramUrl || ''}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-stone-400">YouTube URL</label>
                  <input
                    type="text"
                    name="youtubeUrl"
                    value={settings.youtubeUrl || ''}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 text-xs rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Search Engine Metadata */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100">Search Engine Meta Tags</h2>
              <p className="text-xs text-stone-400">Title, description, and keywords indexed by search engines</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Website Title Tag</label>
              <input
                type="text"
                name="siteTitle"
                value={settings.siteTitle}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Meta Description</label>
              <textarea
                rows={2}
                name="metaDescription"
                value={settings.metaDescription}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Meta Keywords</label>
              <input
                type="text"
                name="metaKeywords"
                value={settings.metaKeywords}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Open Graph Social Sharing */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100">Open Graph Social Cards</h2>
              <p className="text-xs text-stone-400">Card title, summary, and preview banner when shared on WhatsApp/Facebook</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">OG Title</label>
              <input
                type="text"
                name="ogTitle"
                value={settings.ogTitle}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">OG Description</label>
              <textarea
                rows={2}
                name="ogDescription"
                value={settings.ogDescription}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">OG Image Banner URL</label>
              <input
                type="text"
                name="ogImage"
                value={settings.ogImage}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: About Page Customization */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100">About Us Page Customization</h2>
              <p className="text-xs text-stone-400">Manage headline, story paragraph, and stats shown on the About page</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Badge Label</label>
                <input
                  type="text"
                  name="aboutBadgeText"
                  value={settings.aboutBadgeText || ''}
                  onChange={handleChange}
                  placeholder="Artisanal Story"
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Main Title</label>
                <input
                  type="text"
                  name="aboutTitle"
                  value={settings.aboutTitle || ''}
                  onChange={handleChange}
                  placeholder="About Rangin Sutar Bunon"
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Subtitle Intro</label>
              <textarea
                rows={2}
                name="aboutSubtitle"
                value={settings.aboutSubtitle || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Story Box Heading</label>
              <input
                type="text"
                name="aboutStoryHeading"
                value={settings.aboutStoryHeading || ''}
                onChange={handleChange}
                placeholder="Our Weaving & Craft Legacy"
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-stone-300">Story Box Detailed Text</label>
              <textarea
                rows={4}
                name="aboutStoryContent"
                value={settings.aboutStoryContent || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
              />
            </div>

            <div className="pt-4 border-t border-stone-800 space-y-3">
              <label className="font-bold uppercase tracking-wider text-amber-300 block">3 Key Stat Cards</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2 p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <input
                    type="text"
                    name="aboutStat1Value"
                    value={settings.aboutStat1Value || ''}
                    onChange={handleChange}
                    placeholder="50+"
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 text-amber-300 font-bold rounded-lg text-center"
                  />
                  <input
                    type="text"
                    name="aboutStat1Label"
                    value={settings.aboutStat1Label || ''}
                    onChange={handleChange}
                    placeholder="Master Artisan Guilds"
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 text-stone-300 text-[11px] rounded-lg text-center"
                  />
                </div>

                <div className="space-y-2 p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <input
                    type="text"
                    name="aboutStat2Value"
                    value={settings.aboutStat2Value || ''}
                    onChange={handleChange}
                    placeholder="100%"
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 text-amber-300 font-bold rounded-lg text-center"
                  />
                  <input
                    type="text"
                    name="aboutStat2Label"
                    value={settings.aboutStat2Label || ''}
                    onChange={handleChange}
                    placeholder="Organic & Handcrafted"
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 text-stone-300 text-[11px] rounded-lg text-center"
                  />
                </div>

                <div className="space-y-2 p-3 bg-stone-950 rounded-xl border border-stone-800">
                  <input
                    type="text"
                    name="aboutStat3Value"
                    value={settings.aboutStat3Value || ''}
                    onChange={handleChange}
                    placeholder="COD"
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 text-amber-300 font-bold rounded-lg text-center"
                  />
                  <input
                    type="text"
                    name="aboutStat3Label"
                    value={settings.aboutStat3Label || ''}
                    onChange={handleChange}
                    placeholder="Nationwide Cash on Delivery"
                    className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 text-stone-300 text-[11px] rounded-lg text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 text-xs disabled:opacity-50"
        >
          {saving ? 'Saving Settings...' : 'Save SEO & Branding Settings'}
        </button>
      </form>
    </div>
  );
}
