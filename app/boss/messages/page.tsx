'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, Trash2, CheckCircle2, Clock, Search, MessageSquare, AlertCircle } from 'lucide-react';

interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load contact messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !currentStatus }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, isRead: !currentStatus } : msg))
        );
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer message?')) return;
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(search.toLowerCase()) ||
      msg.email.toLowerCase().includes(search.toLowerCase()) ||
      msg.phone.includes(search) ||
      (msg.subject && msg.subject.toLowerCase().includes(search.toLowerCase())) ||
      msg.message.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-extrabold text-stone-100">Contact Form Messages</h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-amber-500 text-stone-950 font-bold text-xs rounded-full">
                {unreadCount} New Unread
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-1">Inquiries and messages submitted by customers through the website contact form</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md">
        <Search className="w-5 h-5 text-stone-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by customer name, email, phone number, or message text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-stone-100 placeholder-stone-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-400 text-xs font-mono">Loading Messages...</div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-stone-600 mx-auto" />
          <p className="text-stone-300 text-sm font-semibold">No Contact Messages Found</p>
          <p className="text-stone-500 text-xs">Customer messages sent via the contact page will be listed here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-stone-900 border rounded-3xl p-6 transition-all space-y-4 shadow-xl ${
                !msg.isRead ? 'border-amber-500/60 bg-stone-900/90' : 'border-stone-800 opacity-90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-800/40 text-amber-300 flex items-center justify-center font-bold text-sm">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-100 text-sm">{msg.name}</h3>
                      {!msg.isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-stone-500" /> {msg.email}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-500" /> {msg.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(msg.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <button
                    onClick={() => toggleReadStatus(msg.id, msg.isRead)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      msg.isRead
                        ? 'bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {msg.isRead ? 'Mark Unread' : 'Mark as Read'}
                  </button>

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {msg.subject && (
                <div className="text-xs font-bold text-amber-200">
                  Subject: <span className="text-stone-200 font-normal">{msg.subject}</span>
                </div>
              )}

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800/80 text-xs text-stone-200 leading-relaxed font-sans whitespace-pre-wrap">
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
