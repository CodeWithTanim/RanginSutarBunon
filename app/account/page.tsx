'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  ShoppingBag,
  Clock,
  CheckCircle2,
  MapPin,
  LogOut,
  Package,
  ArrowRight,
  Plus,
  Trash2,
  Edit,
  Save,
  Phone,
  Settings,
  Truck,
} from 'lucide-react';
import { OrderRecord } from '@/lib/initialData';

const STATUS_STEPS = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

interface ExtraAddress {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function CustomerAccountDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Editable Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Multiple Mobile Numbers & Addresses
  const [extraMobiles, setExtraMobiles] = useState<string[]>([]);
  const [newMobile, setNewMobile] = useState<string>('');
  const [extraAddresses, setExtraAddresses] = useState<ExtraAddress[]>([]);
  const [newAddr, setNewAddr] = useState<ExtraAddress>({
    id: '',
    label: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    fetch('/api/customer/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthenticated');
        return res.json();
      })
      .then((data) => {
        if (data.authenticated && data.customer) {
          setCustomer(data.customer);
          setOrders(data.orders || []);
          setProfileForm({
            name: data.customer.name || '',
            mobile: data.customer.mobile || '',
            address: data.customer.address || '',
            city: data.customer.city || '',
            state: data.customer.state || '',
            pincode: data.customer.pincode || '',
          });
          setExtraMobiles(data.customer.extraMobiles || []);
          setExtraAddresses(data.customer.extraAddresses || []);
        } else {
          router.push('/account/login');
        }
      })
      .catch(() => {
        router.push('/account/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/customer/auth/logout', { method: 'POST' });
    router.push('/account/login');
    router.refresh();
  };

  const getStepIndex = (status: string) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  // Add Extra Mobile Number
  const handleAddMobile = () => {
    const clean = newMobile.trim();
    if (!/^\d{10,11}$/.test(clean)) {
      alert('Please enter a valid 10 or 11 digit mobile number');
      return;
    }
    if (clean === profileForm.mobile || extraMobiles.includes(clean)) {
      alert('This mobile number is already added');
      return;
    }
    setExtraMobiles((prev) => [...prev, clean]);
    setNewMobile('');
  };

  const handleRemoveMobile = (mobileToRemove: string) => {
    setExtraMobiles((prev) => prev.filter((m) => m !== mobileToRemove));
  };

  // Add Extra Address
  const handleAddAddress = () => {
    if (!newAddr.label || !newAddr.address || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      alert('Please fill out all fields for the new address');
      return;
    }
    const created: ExtraAddress = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    setExtraAddresses((prev) => [...prev, created]);
    setNewAddr({ id: '', label: '', address: '', city: '', state: '', pincode: '' });
  };

  const handleRemoveAddress = (id: string) => {
    setExtraAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileForm,
          extraMobiles,
          extraAddresses,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setCustomer(data.customer);
      setSuccessMsg('Profile setup and addresses updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 font-serif">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-sans tracking-widest uppercase">Loading Account Data...</p>
      </div>
    );
  }

  if (!customer) return null;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const totalSpent = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Profile Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-2xl shadow-lg shrink-0">
            {customer.name ? customer.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-100">
              Welcome back, {customer.name}!
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
              <span className="font-mono">Primary Mobile: {customer.mobile}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> {customer.address}, {customer.city}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/order-status"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-transform hover:scale-105 flex items-center gap-2 shadow-md"
          >
            <Truck className="w-4 h-4" />
            <span>Track Existing Order</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-stone-950 hover:bg-rose-950/60 border border-stone-800 hover:border-rose-800 text-stone-300 hover:text-rose-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Orders</span>
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-amber-300">{totalOrders}</p>
          <p className="text-[11px] text-stone-400">Placed from this account</p>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Active Shipments</span>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-stone-100">{pendingOrders}</p>
          <p className="text-[11px] text-stone-400">In-transit or processing</p>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Purchase Value</span>
            <span className="font-bold text-lg">৳</span>
          </div>
          <p className="text-3xl font-black text-emerald-400">৳{totalSpent.toLocaleString()}</p>
          <p className="text-[11px] text-stone-400">Delivered & confirmed orders</p>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-stone-800 text-sm font-semibold gap-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3.5 flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3.5 flex items-center gap-2 transition-all ${
            activeTab === 'profile'
              ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile & Address Settings</span>
        </button>
      </div>

      {/* TAB 1: ORDER HISTORY & STATUS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-stone-100">Order History & Track Progress</h2>
            <Link href="/shop" className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Shop More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
              <Package className="w-12 h-12 text-stone-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-stone-200">No Orders Yet</h3>
                <p className="text-stone-400 text-xs">You haven&apos;t placed any orders from this account yet.</p>
              </div>
              <Link
                href="/shop"
                className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-transform hover:scale-105"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((ord) => {
                const activeStepIdx = getStepIndex(ord.status);
                return (
                  <div key={ord.id} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
                      <div>
                        <span className="font-mono text-lg font-bold text-amber-300">{ord.id}</span>
                        <p className="text-xs text-stone-400">
                          Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} item(s)
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-base font-extrabold text-amber-200">৳{ord.totalAmount}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-950 border border-emerald-800/60 text-emerald-300'
                              : ord.status === 'Cancelled'
                              ? 'bg-rose-950 border border-rose-800/60 text-rose-300'
                              : 'bg-amber-950 border border-amber-800/60 text-amber-300'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Progress Steps */}
                    {ord.status === 'Cancelled' ? (
                      <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-xl text-center text-xs text-rose-300 font-bold">
                        Order Cancelled
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Live Delivery Progress</span>
                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
                          <div className="hidden md:block absolute top-3.5 left-4 right-4 h-1 bg-stone-800 z-0" />
                          <div
                            className="hidden md:block absolute top-3.5 left-4 h-1 bg-gradient-to-r from-amber-500 to-emerald-400 z-0 transition-all duration-500"
                            style={{
                              width: `${(activeStepIdx / (STATUS_STEPS.length - 1)) * 90}%`,
                            }}
                          />

                          {STATUS_STEPS.map((stepName, idx) => {
                            const isCompleted = idx <= activeStepIdx;
                            const isCurrent = idx === activeStepIdx;
                            return (
                              <div key={stepName} className="relative z-10 flex md:flex-col items-center gap-3 md:gap-1 text-left md:text-center w-full md:w-auto">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isCurrent
                                      ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/20 font-bold'
                                      : isCompleted
                                      ? 'bg-emerald-500 text-stone-950'
                                      : 'bg-stone-800 text-stone-500'
                                  }`}
                                >
                                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span className={`text-[11px] font-semibold ${isCurrent ? 'text-amber-300 font-extrabold' : isCompleted ? 'text-stone-200' : 'text-stone-500'}`}>
                                  {stepName}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="pt-2 border-t border-stone-800/80 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Order Items</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ord.items.map((i) => (
                          <div key={i.id} className="p-2.5 bg-stone-950 border border-stone-800/80 rounded-xl flex items-center justify-between text-xs">
                            <span className="font-semibold text-stone-200 truncate">{i.productName}</span>
                            <span className="text-stone-400 shrink-0 ml-2">Qty: {i.quantity} × ৳{i.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE & MULTIPLE ADDRESSES EDITING */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {successMsg && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs font-semibold rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold rounded-2xl">
              {errorMsg}
            </div>
          )}

          {/* Primary Profile Details */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-amber-100">Primary Profile Information</h2>
                <p className="text-xs text-stone-400">Update your primary full name, default mobile number, and primary shipping address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Full Name *</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Primary Mobile Number *</label>
                <input
                  type="tel"
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold uppercase tracking-wider text-stone-300">Primary Street Address *</label>
                <textarea
                  rows={2}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">City *</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">State / Division *</label>
                <input
                  type="text"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-stone-300">Postcode / ZIP *</label>
                <input
                  type="text"
                  value={profileForm.pincode}
                  onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Multiple Mobile Numbers */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-amber-100">Multiple Mobile Contact Numbers</h2>
                <p className="text-xs text-stone-400">Add alternative contact phone numbers for delivery updates</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="e.g. 01812345678"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  className="flex-1 px-4 py-3 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddMobile}
                  className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold rounded-xl flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Number
                </button>
              </div>

              {extraMobiles.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-stone-400 block uppercase tracking-wider">Additional Contact Numbers:</span>
                  <div className="flex flex-wrap gap-2">
                    {extraMobiles.map((m) => (
                      <div key={m} className="px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl flex items-center gap-3">
                        <span className="font-mono text-stone-200 font-bold">{m}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMobile(m)}
                          className="text-stone-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Multiple Delivery Addresses */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/40 text-amber-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-amber-100">Saved Multiple Delivery Addresses</h2>
                <p className="text-xs text-stone-400">Save office, home, or family addresses for quick checkout</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Form to Add Address */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                <span className="font-bold text-amber-300 block uppercase tracking-wider">Add New Alternate Address</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Address Label (e.g. Office, Home 2)"
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-stone-100 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="City (e.g. Dhaka)"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-stone-100 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State / Division"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-stone-100 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Pincode / ZIP"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-stone-100 rounded-lg outline-none font-mono"
                  />
                  <textarea
                    rows={2}
                    placeholder="Street Address details..."
                    value={newAddr.address}
                    onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                    className="sm:col-span-2 w-full px-3 py-2 bg-stone-900 border border-stone-800 text-stone-100 rounded-lg outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Save This Address
                </button>
              </div>

              {/* Saved Addresses List */}
              {extraAddresses.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="font-bold text-stone-400 block uppercase tracking-wider">Your Additional Saved Addresses:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {extraAddresses.map((addr) => (
                      <div key={addr.id} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-1 relative">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-300 uppercase text-[10px] tracking-wider">{addr.label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddress(addr.id)}
                            className="text-stone-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-stone-200 text-xs">{addr.address}</p>
                        <p className="text-stone-400 text-[11px] font-mono">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 text-xs disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving Profile Changes...' : 'Save Profile & Settings'}
          </button>
        </form>
      )}
    </div>
  );
}
