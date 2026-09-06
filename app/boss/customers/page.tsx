'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, MapPin, ShoppingBag, X, Trash2 } from 'lucide-react';
import { CustomerRecord, OrderRecord } from '@/lib/initialData';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/customers').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/orders').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([custData, ordersData]) => {
        if (Array.isArray(custData)) setCustomers(custData);
        if (Array.isArray(ordersData)) setOrders(ordersData);
      })
      .catch((err) => console.error('Error fetching customers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer profile?')) return;
    try {
      const res = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete customer');
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Error deleting customer');
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  const customerOrders = selectedCustomer
    ? orders.filter((o) => o.mobile === selectedCustomer.mobile)
    : [];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-extrabold text-stone-100">Customer Directory</h1>
        <p className="text-xs text-stone-400">View customer profiles, total order history, and spending metrics</p>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, mobile, or city..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 focus:border-amber-500 text-stone-100 rounded-xl text-xs outline-none"
          />
        </div>
        <span className="text-xs text-stone-400 font-semibold">{filteredCustomers.length} Customer(s)</span>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800">
              <tr>
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Mobile</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Total Orders</th>
                <th className="px-4 py-3.5">Total Value</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-4 py-3.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">Loading customer profiles...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">No customers found.</td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-stone-100">{c.name}</td>
                    <td className="px-4 py-3.5 font-mono">{c.mobile}</td>
                    <td className="px-4 py-3.5">{c.city}, {c.state}</td>
                    <td className="px-4 py-3.5 font-bold text-amber-300">{c.totalOrders} order(s)</td>
                    <td className="px-4 py-3.5 font-extrabold text-amber-200">৳{c.totalSpent}</td>
                    <td className="px-4 py-3.5 text-stone-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-300 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> History
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(c.id)}
                        className="p-1.5 bg-stone-800 hover:bg-rose-950/80 border border-stone-700 hover:border-rose-700 text-stone-400 hover:text-rose-400 font-semibold rounded-lg transition-colors"
                        title="Delete customer profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <span className="text-xs text-stone-400">Customer Profile</span>
                <h2 className="font-serif text-xl font-bold text-amber-300">{selectedCustomer.name}</h2>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-stone-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2 text-xs text-stone-300">
              <p><strong>Mobile:</strong> {selectedCustomer.mobile}</p>
              <p><strong>Address:</strong> {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}</p>
              <p><strong>Total Spending:</strong> <span className="text-amber-300 font-bold">₹{selectedCustomer.totalSpent}</span> ({selectedCustomer.totalOrders} orders)</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-stone-200 text-xs uppercase tracking-wider">Past Order History</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {customerOrders.length === 0 ? (
                  <p className="text-xs text-stone-500 py-4 text-center">No past orders found for this customer.</p>
                ) : (
                  customerOrders.map((o) => (
                    <div key={o.id} className="p-3 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-amber-300 block">{o.id}</span>
                        <span className="text-stone-400">{new Date(o.createdAt).toLocaleDateString()} • {o.items.length} item(s)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-stone-100 block">₹{o.totalAmount}</span>
                        <span className="text-[10px] font-bold text-amber-400">{o.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
