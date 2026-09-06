import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.contactMessage.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: body.isRead },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating message status:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
