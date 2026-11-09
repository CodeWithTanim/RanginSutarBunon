import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const db = await getDb();
    const [customer, rawOrders] = await Promise.all([
      db.collection('customers').findOne({ mobile: session.mobile }),
      db.collection('orders').find({ mobile: session.mobile }).sort({ createdAt: -1 }).toArray(),
    ]);

    const orders = rawOrders.map((o: any) => ({
      id: o.id,
      customerName: o.customerName,
      mobile: o.mobile,
      address: o.address,
      city: o.city,
      state: o.state,
      pincode: o.pincode,
      note: o.note || null,
      subtotal: Number(o.subtotal),
      deliveryCharge: Number(o.deliveryCharge),
      totalAmount: Number(o.totalAmount),
      status: o.status,
      paymentMethod: o.paymentMethod || 'Cash on Delivery',
      createdAt: typeof o.createdAt === 'string' ? o.createdAt : (o.createdAt?.toISOString?.() || new Date().toISOString()),
      items: Array.isArray(o.items) ? o.items : [],
    }));

    return NextResponse.json({
      authenticated: true,
      customer: customer
        ? {
            id: customer.id || String(customer._id),
            name: customer.name,
            mobile: customer.mobile,
            address: customer.address || '',
            city: customer.city || '',
            state: customer.state || '',
            pincode: customer.pincode || '',
            extraMobiles: Array.isArray(customer.extraMobiles) ? customer.extraMobiles : [],
            extraAddresses: Array.isArray(customer.extraAddresses) ? customer.extraAddresses : [],
          }
        : {
            name: session.name,
            mobile: session.mobile,
            extraMobiles: [],
            extraAddresses: [],
          },
      orders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching customer data' }, { status: 500 });
  }
}
