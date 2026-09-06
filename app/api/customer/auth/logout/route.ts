import { NextResponse } from 'next/server';
import { clearCustomerSessionCookie } from '@/lib/customerAuth';

export async function POST() {
  await clearCustomerSessionCookie();
  return NextResponse.json({ success: true });
}
