import { NextResponse } from 'next/server';
import { deleteOrder } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const success = await deleteOrder(id);
    if (!success) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, orderId: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete order' }, { status: 500 });
  }
}
