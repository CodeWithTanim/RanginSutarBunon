'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, KeyRound, User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export default function AdminSecurityPage() {
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCurrentUsername(data.username || '');
          setNewUsername(data.username || '');
          setNewName(data.name || '');
        }
      })
      .catch((err) => console.error('Failed to load admin profile:', err))
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Please enter your current password to authorize changes.' });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim(),
          newName: newName.trim(),
          newPassword: newPassword ? newPassword.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update credentials');
      }

      setMessage({ type: 'success', text: data.message || 'Credentials updated successfully!' });
      setCurrentUsername(data.username || newUsername);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred while updating.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex items-center gap-2.5 text-amber-400 mb-1">
          <KeyRound className="w-6 h-6" />
          <h1 className="font-serif text-2xl font-bold text-stone-100">Admin Login & Security Settings</h1>
        </div>
        <p className="text-xs text-stone-400">
          Update your store admin username, display name, and login password.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
              : 'bg-rose-950/80 border border-rose-800 text-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Profile Info Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
            <User className="w-4 h-4" /> Account Identification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Admin Display Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Store Manager"
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">
                Admin Username <span className="text-amber-400 font-normal">(Used for Login)</span>
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                placeholder="admin"
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-4 pt-4 border-t border-stone-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Change Login Password
          </h2>
          <p className="text-[11px] text-stone-400">
            Leave the new password fields blank if you only want to change your username or display name.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave empty to keep current password"
                  className="w-full pl-4 pr-11 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Verification Section */}
        <div className="space-y-4 pt-4 border-t border-stone-800 bg-amber-950/20 p-4 rounded-2xl border border-amber-900/30">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Enter Current Password to Confirm
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password"
                className="w-full pl-4 pr-11 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-stone-400">
              For security, any changes to your username or password require verification with your current password.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading || fetching}
            className="flex items-center gap-2 px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Changes...' : 'Save Admin Credentials'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

