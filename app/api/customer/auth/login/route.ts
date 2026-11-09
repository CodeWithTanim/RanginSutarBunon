import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
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
      const db = await getDb();
      customer = await db.collection('customers').findOne({ mobile: cleanMobile });
      if (customer && customer.passwordHash) {
        isValid = await bcrypt.compare(password, customer.passwordHash);
      }
    } catch (err) {
      console.warn('Customer login query error:', err);
    }

    if (!customer || !isValid) {
      return NextResponse.json({ error: 'Invalid mobile number or password' }, { status: 401 });
    }

    const customerId = customer.id || String(customer._id);
    const token = await createCustomerToken({
      id: customerId,
      mobile: customer.mobile,
      name: customer.name,
    });
    await setCustomerSessionCookie(token);

    return NextResponse.json({
      success: true,
      customer: {
        id: customerId,
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        pincode: customer.pincode || '',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
