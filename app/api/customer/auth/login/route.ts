import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createCustomerToken, setCustomerSessionCookie } from '@/lib/customerAuth';

export async function POST(request: Request) {
  try {
    const { mobile, password } = await request.json();

    const cleanMobile = mobile ? String(mobile).trim() : '';
    if (!cleanMobile || !password) {
      return NextResponse.json({ error: 'Please enter both mobile number and password' }, { status: 400 });
    }

    let customer: any = null;
    let isValid = false;

    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your-tenant-ref')) {
        customer = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });
        if (customer && customer.passwordHash) {
          isValid = await bcrypt.compare(password, customer.passwordHash);
        }
      }
    } catch {
      // Fallback
    }

    if (!customer || !isValid) {
      return NextResponse.json({ error: 'Invalid mobile number or password' }, { status: 401 });
    }

    const token = await createCustomerToken({
      id: customer.id,
      mobile: customer.mobile,
      name: customer.name,
    });
    await setCustomerSessionCookie(token);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
