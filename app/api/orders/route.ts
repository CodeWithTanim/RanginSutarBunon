import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access to order records' }, { status: 401 });
  }

  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, mobile, address, city, state, pincode, items, note } = body;

    // Mobile Validation (11-digit Bangladesh check)
    const cleanMobile = mobile ? String(mobile).trim() : '';
    if (!/^01\d{9}$/.test(cleanMobile)) {
      return NextResponse.json(
        { error: 'Please enter a valid 11-digit Bangladesh mobile number starting with 01 (e.g., 01712345678)' },
        { status: 400 }
      );
    }

    if (!customerName || !address || !city || !state || !pincode || !items || !items.length) {
      return NextResponse.json(
        { error: 'Please fill in all required customer and delivery details' },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customerName: customerName.trim(),
      mobile: cleanMobile,
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      note: note ? note.trim() : null,
      items,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}
