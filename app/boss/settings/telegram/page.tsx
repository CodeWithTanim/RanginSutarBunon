'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Send, CheckCircle2, AlertCircle, Save, HelpCircle, Bell, Users, ExternalLink } from 'lucide-react';
import { SiteSettings, DEFAULT_SETTINGS } from '@/lib/initialData';

export default function TelegramSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Failed to fetch settings:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramEnabled: Boolean(settings.telegramEnabled),
          telegramBotToken: settings.telegramBotToken?.trim() || '',
          telegramChatIds: settings.telegramChatIds?.trim() || '',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save Telegram settings');
      }

      const msg = 'Telegram Bot settings saved successfully! All configured admins will receive real-time alerts.';
      setStatusMessage({
        type: 'success',
        text: msg,
      });
      toast.success(msg);
    } catch (err: any) {
      const errMsg = err.message || 'Error saving settings.';
      setStatusMessage({ type: 'error', text: errMsg });
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!settings.telegramBotToken?.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a Telegram Bot Token first.' });
      toast.error('Please enter a Telegram Bot Token first.');
      return;
    }
    if (!settings.telegramChatIds?.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter at least one Telegram Admin Chat ID.' });
      toast.error('Please enter at least one Telegram Admin Chat ID.');
      return;
    }

    setTesting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: settings.telegramBotToken.trim(),
          chatIds: settings.telegramChatIds.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send test message');
      }

      if (data.sentCount > 0) {
        const msg = `Test notification sent successfully to ${data.sentCount} of ${data.totalCount} admin(s)!`;
        setStatusMessage({
          type: 'success',
          text: `✅ ${msg} Check your Telegram app.`,
        });
        toast.success(msg);
      } else {
        const errorDetails = data.errors?.map((e: any) => `${e.chatId}: ${e.error}`).join(', ');
        const errMsg = `Could not deliver to admins: ${errorDetails || 'Unknown error'}`;
        setStatusMessage({
          type: 'error',
          text: `❌ ${errMsg}. Make sure admins have clicked "Start" in the bot.`,
        });
        toast.error(errMsg);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to communicate with Telegram API.';
      setStatusMessage({ type: 'error', text: errMsg });
      toast.error(errMsg);
    } finally {
      setTesting(false);
    }
  };

  const chatIdsArray = (settings.telegramChatIds || '')
    .split(/[\n,;]+/)
    .map((id) => id.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex items-center gap-2.5 text-amber-400 mb-1">
          <Send className="w-6 h-6" />
          <h1 className="font-serif text-2xl font-bold text-stone-100">Telegram Store Notifications &amp; Alerts</h1>
        </div>
        <p className="text-xs text-stone-400">
          Receive instant real-time Telegram notifications for all store events: New Orders, Order Status Changes, Admin Sign-Ins &amp; Security Alerts, Contact Form Inquiries, and Customer Registrations. Supports multiple administrators.
        </p>
      </div>

      {/* Covered Notification Channels Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3">
        <h2 className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" /> Supported Instant Telegram Notifications:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-stone-300">
          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
            <span className="font-bold text-stone-100">🛍️ New Customer Orders</span>
            <p className="text-[11px] text-stone-400">Complete items list, customer phone, delivery address &amp; COD total.</p>
          </div>
          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
            <span className="font-bold text-stone-100">🔄 Order Status Changes</span>
            <p className="text-[11px] text-stone-400">Live alerts when orders are Confirmed, Shipped, Delivered, or Cancelled.</p>
          </div>
          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
            <span className="font-bold text-stone-100">🔐 Admin Sign-Ins &amp; Security</span>
            <p className="text-[11px] text-stone-400">Instant alerts on admin logins and failed password attempts with IP &amp; device.</p>
          </div>
          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
            <span className="font-bold text-stone-100">📩 Contact Form Messages</span>
            <p className="text-[11px] text-stone-400">Visitor message body, sender name, email, and phone number.</p>
          </div>
          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
            <span className="font-bold text-stone-100">🎉 Customer Sign-Ups</span>
            <p className="text-[11px] text-stone-400">Alerts when new buyers register an account on the store.</p>
          </div>
          <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
            <span className="font-bold text-stone-100">🛡️ Admin Profile Updates</span>
            <p className="text-[11px] text-stone-400">Security warnings whenever admin username or password is modified.</p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-800 text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Enable / Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-stone-950 border border-stone-800 rounded-2xl">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-stone-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Enable All Telegram Store Notifications
            </span>
            <p className="text-xs text-stone-400">
              When enabled, instant alerts for Orders, Status Updates, Admin Logins, Security Events, Contact Form Messages, and Customer Registrations will be sent to all configured admin chats.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(settings.telegramEnabled)}
              onChange={(e) => setSettings({ ...settings, telegramEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* Bot Token Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-200 flex items-center justify-between">
            <span>Telegram Bot Token</span>
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1 font-normal"
            >
              Get Token from @BotFather <ExternalLink className="w-3 h-3" />
            </a>
          </label>
          <input
            type="text"
            value={settings.telegramBotToken || ''}
            onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
            placeholder="e.g. 1234567890:ABCDefGhIJklMnOpQrStUvWxYz"
            className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none font-mono transition-colors"
          />
          <p className="text-[11px] text-stone-400">
            Create a bot using Telegram&apos;s official <b>@BotFather</b> and copy the API token provided.
          </p>
        </div>

        {/* Multiple Chat IDs Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" /> Multiple Admin Telegram Chat IDs
            </label>
            <span className="text-[11px] text-amber-400/90 font-mono font-semibold">
              {chatIdsArray.length} Admin(s) Configured
            </span>
          </div>

          <textarea
            rows={3}
            value={settings.telegramChatIds || ''}
            onChange={(e) => setSettings({ ...settings, telegramChatIds: e.target.value })}
            placeholder="Enter Telegram Chat IDs separated by commas or new lines, e.g.&#10;123456789, 987654321&#10;554433221"
            className="w-full p-4 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none font-mono transition-colors"
          />

          <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl space-y-2 text-[11px] text-stone-400">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-stone-300 font-semibold">How to get Admin Chat IDs:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-stone-400">
                  <li>Each admin should open Telegram and search for <b>@userinfobot</b> or <b>@raw_data_bot</b> to get their numeric Chat ID (e.g., <code>123456789</code>).</li>
                  <li><b>CRITICAL:</b> Each admin MUST open your bot in Telegram and press <b>&quot;Start&quot;</b> once so the bot has permission to message them.</li>
                  <li>Paste the IDs above, separated by commas or newlines.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSendTest}
            disabled={testing || saving || loading}
            className="w-full sm:w-auto px-5 py-3 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 text-xs font-bold rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testing ? 'Sending Test...' : 'Send Test Notification to All Admins'}</span>
          </button>

          <button
            type="submit"
            disabled={saving || loading}
            className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Telegram Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

