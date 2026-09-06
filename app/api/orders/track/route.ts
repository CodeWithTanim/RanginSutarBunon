import { NextResponse } from 'next/server';
import { getOrderByIdAndMobile } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, mobile } = body;

    if (!orderId || !mobile) {
      return NextResponse.json(
        { error: 'Please provide both Order ID and Mobile number' },
        { status: 400 }
      );
    }

    const order = await getOrderByIdAndMobile(orderId, mobile);

    if (!order) {
      return NextResponse.json(
        { error: 'We couldn’t find an order matching the provided Order ID and mobile number.' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error tracking order' }, { status: 500 });
  }
}
