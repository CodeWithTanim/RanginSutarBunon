import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const success = await updateOrderStatus(id, status);
    if (!success) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, orderId: id, newStatus: status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}
