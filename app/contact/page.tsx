'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/initialData';

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings>({ ...DEFAULT_SETTINGS });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit message');

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Error submitting message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-gray-900">Contact Us</h1>
        <p className="text-gray-600 text-base max-w-xl mx-auto font-medium">
          Have questions about your order, custom weaving requests, or bulk inquiries? We are here to help!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-3xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003d29] flex items-center justify-center shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm block">Phone Support</span>
            <span className="text-gray-600">{settings.footerPhone || '+880 1712-345678'}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-3xl shadow-sm min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003d29] flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-gray-900 text-sm block">Email Inquiries</span>
            <span className="text-gray-600 break-all text-xs sm:text-sm">{settings.footerEmail || 'support@ranginsutarbunon.com'}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-3xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#003d29] flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm block">Office Address</span>
            <span className="text-gray-600">{settings.footerAddress || 'Lake Road, Dhaka - 1209'}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl p-8 space-y-6 shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-gray-900">Send Us a Direct Message</h2>

        {submitted && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Thank you! Your message has been received. Our team will contact you shortly.</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-gray-700">Your Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Ananya Roy"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-gray-700">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="ananya@example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-gray-700">Mobile Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="e.g. 01712345678"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-gray-700">Subject (Optional)</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Bulk Order Inquiry"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold uppercase tracking-wider text-gray-700">Message / Inquiry *</label>
            <textarea
              rows={4}
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Type your message here..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#003d29] text-gray-900 rounded-xl text-sm outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-[#003d29] hover:bg-[#00281b] text-white font-bold rounded-full shadow-md text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-105"
        >
          <Send className="w-4 h-4" /> {loading ? 'Sending Message...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
