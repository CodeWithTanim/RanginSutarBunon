'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  X,
} from 'lucide-react';
import { OrderRecord } from '@/lib/initialData';

const AVAILABLE_STATUSES = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch('/api/orders')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.error('Error fetching admin orders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (activeOrder && activeOrder.id === orderId) {
        setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Could not update status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatusFilter === 'all' || o.status === selectedStatusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.mobile.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-extrabold text-stone-100">Order Management</h1>
        <p className="text-xs text-stone-400">View customer orders, update dispatch status, and inspect address details</p>
      </div>

      {/* Toolbar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Name, or Mobile..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
            />
          </div>

          <div className="text-xs text-stone-400 font-semibold">
            Found <span className="text-amber-300 font-bold">{filteredOrders.length}</span> order(s)
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="pt-2 border-t border-stone-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              selectedStatusFilter === 'all'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            All ({orders.length})
          </button>
          {AVAILABLE_STATUSES.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedStatusFilter === st
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800">
              <tr>
                <th className="px-4 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Mobile</th>
                <th className="px-4 py-3.5">Total Amount</th>
                <th className="px-4 py-3.5">Delivery Fee</th>
                <th className="px-4 py-3.5">Order Date</th>
                <th className="px-4 py-3.5">Current Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">No orders matching selected criteria.</td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-amber-300">{o.id}</td>
                    <td className="px-4 py-3.5 font-semibold text-stone-100">{o.customerName}</td>
                    <td className="px-4 py-3.5">{o.mobile}</td>
                    <td className="px-4 py-3.5 font-extrabold text-amber-200">৳{o.totalAmount}</td>
                    <td className="px-4 py-3.5 text-stone-400">৳{o.deliveryCharge}</td>
                    <td className="px-4 py-3.5 text-stone-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                        className="bg-stone-950 border border-stone-700 text-amber-300 font-bold text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer"
                      >
                        {AVAILABLE_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setActiveOrder(o)}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-300 font-semibold rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <span className="text-xs text-stone-400">Detailed Order View</span>
                <h2 className="font-mono text-xl font-bold text-amber-300">{activeOrder.id}</h2>
              </div>
              <button onClick={() => setActiveOrder(null)} className="text-stone-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Status Update Control */}
            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">Update Order Status:</span>
              <select
                value={activeOrder.status}
                onChange={(e) => handleStatusUpdate(activeOrder.id, e.target.value)}
                className="bg-amber-500 text-stone-950 font-bold text-xs rounded-xl px-4 py-2 outline-none cursor-pointer shadow-md"
              >
                {AVAILABLE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Info & Shipping Address */}
            <div className="p-5 bg-stone-950 border border-stone-800 rounded-2xl space-y-3 text-xs">
              <h3 className="font-bold text-amber-200 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" /> Customer & Delivery Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-300">
                <div>
                  <span className="text-stone-400 block">Customer Name:</span>
                  <span className="font-bold text-stone-100">{activeOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Mobile Number:</span>
                  <span className="font-bold text-stone-100">{activeOrder.mobile}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-stone-400 block">Full Delivery Address:</span>
                  <span className="font-medium text-stone-200">
                    {activeOrder.address}, {activeOrder.city}, {activeOrder.state} - {activeOrder.pincode}
                  </span>
                </div>
                {activeOrder.note && (
                  <div className="sm:col-span-2 p-2.5 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-200">
                    <strong>Order Note:</strong> "{activeOrder.note}"
                  </div>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h3 className="font-bold text-stone-200 text-xs uppercase tracking-wider">Ordered Products</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {activeOrder.items.map((item) => (
                  <div key={item.id} className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-100 block">{item.productName}</span>
                      <span className="text-stone-400">Qty: {item.quantity} × ₹{item.price}</span>
                    </div>
                    <span className="font-extrabold text-amber-300">₹{item.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span className="text-stone-200">₹{activeOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Delivery Charge (Recorded Snapshot)</span>
                <span className="text-stone-200">₹{activeOrder.deliveryCharge}</span>
              </div>
              <div className="pt-2 border-t border-stone-800 flex justify-between font-extrabold text-amber-300 text-sm">
                <span>Grand Total (Cash on Delivery)</span>
                <span>₹{activeOrder.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
