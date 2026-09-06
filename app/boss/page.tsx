'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
  Users,
  IndianRupee,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { OrderRecord, ProductItem, CustomerRecord } from '@/lib/initialData';

export default function AdminDashboardOverview() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then((res) => (res.ok ? res.json() : [])),
      fetch('/api/products').then((res) => (res.ok ? res.json() : [])),
      fetch('/api/customers').then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([ordersData, productsData, customersData]) => {
        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(productsData)) setProducts(productsData);
        if (Array.isArray(customersData)) setCustomers(customersData);
      })
      .catch((err) => console.error('Error fetching admin overview metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  // Compute Metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Order Placed' || o.status === 'Processing').length;
  const confirmedOrders = orders.filter((o) => o.status === 'Confirmed').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;

  const totalSalesRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-extrabold text-stone-100">Dashboard Overview</h1>
        <p className="text-xs text-stone-400">Key metrics, sales performance, and recent orders</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-300">৳{totalSalesRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-stone-400">Excluding cancelled orders</p>
        </div>

        {/* Total Orders */}
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-100">{totalOrders}</p>
          <p className="text-[11px] text-stone-400">Placed customer orders</p>
        </div>

        {/* Pending Orders */}
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Pending Orders</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-300">{pendingOrders}</p>
          <p className="text-[11px] text-stone-400">Awaiting processing</p>
        </div>

        {/* Delivered Orders */}
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Delivered</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">{deliveredOrders}</p>
          <p className="text-[11px] text-stone-400">Completed deliveries</p>
        </div>

        {/* Confirmed Orders */}
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Confirmed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-100">{confirmedOrders}</p>
          <p className="text-[11px] text-stone-400">Ready for dispatch</p>
        </div>

        {/* Cancelled Orders */}
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Cancelled</span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400">{cancelledOrders}</p>
          <p className="text-[11px] text-stone-400">Cancelled by store/user</p>
        </div>

        {/* Total Products */}
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Products</span>
            <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-100">{totalProducts}</p>
          <p className="text-[11px] text-stone-400">Active catalog items</p>
        </div>

        {/* Total Customers */}
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-100">{totalCustomers}</p>
          <p className="text-[11px] text-stone-400">Unique buyer profiles</p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-amber-100">Recent Customer Orders</h2>
            <p className="text-xs text-stone-400 mt-0.5">Latest order arrivals requiring action</p>
          </div>
          <Link
            href="/boss/orders"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            Manage All Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-stone-400">Loading order records...</div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">No orders recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 font-bold uppercase tracking-wider border-b border-stone-800">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-amber-300">{ord.id}</td>
                    <td className="px-4 py-3 font-semibold text-stone-100">{ord.customerName}</td>
                    <td className="px-4 py-3">{ord.mobile}</td>
                    <td className="px-4 py-3 font-bold text-amber-200">৳{ord.totalAmount}</td>
                    <td className="px-4 py-3">{ord.paymentMethod}</td>
                    <td className="px-4 py-3 text-stone-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders?id=${ord.id}`}
                        className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-300 rounded-lg inline-block transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
