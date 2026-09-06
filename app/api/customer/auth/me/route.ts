import { NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    let customer: any = null;
    let orders: any[] = [];

    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your-tenant-ref')) {
      customer = await prisma.customer.findUnique({ where: { mobile: session.mobile } });
      const rawOrders = await prisma.order.findMany({
        where: { mobile: session.mobile },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      orders = rawOrders.map((o: any) => ({
        id: o.id,
        customerName: o.customerName,
        mobile: o.mobile,
        address: o.address,
        city: o.city,
        state: o.state,
        pincode: o.pincode,
        note: o.note,
        subtotal: o.subtotal,
        deliveryCharge: o.deliveryCharge,
        totalAmount: o.totalAmount,
        status: o.status,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i: any) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
          total: i.total,
        })),
      }));
    }

    return NextResponse.json({
      authenticated: true,
      customer: customer
        ? {
            id: customer.id,
            name: customer.name,
            mobile: customer.mobile,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            pincode: customer.pincode,
            extraMobiles: customer.extraMobiles ? JSON.parse(customer.extraMobiles) : [],
            extraAddresses: customer.extraAddresses ? JSON.parse(customer.extraAddresses) : [],
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
