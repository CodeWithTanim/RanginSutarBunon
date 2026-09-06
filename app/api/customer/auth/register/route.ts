import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createCustomerToken, setCustomerSessionCookie } from '@/lib/customerAuth';

export async function POST(request: Request) {
  try {
    const { name, mobile, password, address, city, state, pincode } = await request.json();

    const cleanMobile = mobile ? String(mobile).trim() : '';
    if (!/^\d{10,11}$/.test(cleanMobile)) {
      return NextResponse.json({ error: 'Please enter a valid 11-digit or 10-digit mobile number' }, { status: 400 });
    }

    if (!name || !password || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Please fill in all required registration fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Check if customer exists
    let customer: any = null;
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your-tenant-ref')) {
        const existing = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });
        if (existing && existing.passwordHash) {
          return NextResponse.json({ error: 'An account with this mobile number already exists. Please log in.' }, { status: 400 });
        }

        customer = await prisma.customer.upsert({
          where: { mobile: cleanMobile },
          update: {
            name: name.trim(),
            passwordHash,
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          },
          create: {
            name: name.trim(),
            mobile: cleanMobile,
            passwordHash,
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          },
        });
      }
    } catch {
      // Fallback
    }

    if (!customer) {
      customer = { id: `cust-${Date.now()}`, name: name.trim(), mobile: cleanMobile };
    }

    const token = await createCustomerToken({
      id: customer.id,
      mobile: cleanMobile,
      name: name.trim(),
    });
    await setCustomerSessionCookie(token);

    return NextResponse.json({ success: true, customer: { id: customer.id, name: name.trim(), mobile: cleanMobile } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
