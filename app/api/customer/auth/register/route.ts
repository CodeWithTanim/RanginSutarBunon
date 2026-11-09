import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { sendTelegramCustomerRegistrationNotification } from '@/lib/telegram';
import bcrypt from 'bcryptjs';
import { createCustomerToken, setCustomerSessionCookie } from '@/lib/customerAuth';

export async function POST(request: Request) {
  try {
    const { name, mobile, password, address, city, state, pincode } = await request.json();

    const cleanMobile = mobile ? String(mobile).trim() : '';
    if (!/^01\d{9}$/.test(cleanMobile)) {
      return NextResponse.json(
        { error: 'Please enter a valid 11-digit Bangladesh mobile number starting with 01 (e.g., 01712345678)' },
        { status: 400 }
      );
    }

    if (!name || !password || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Please fill in all required registration fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const db = await getDb();

    // Check if customer already registered with password
    const existing = await db.collection('customers').findOne({ mobile: cleanMobile });
    if (existing && existing.passwordHash) {
      return NextResponse.json(
        { error: 'An account with this mobile number already exists. Please log in.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const customerId = existing?.id || `cust-${Date.now()}`;

    await db.collection('customers').updateOne(
      { mobile: cleanMobile },
      {
        $set: {
          name: name.trim(),
          passwordHash,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          updatedAt: now,
        },
        $setOnInsert: {
          id: customerId,
          mobile: cleanMobile,
          createdAt: now,
          totalOrders: 0,
          totalSpent: 0,
          extraMobiles: [],
          extraAddresses: [],
        },
      },
      { upsert: true }
    );

    const token = await createCustomerToken({
      id: customerId,
      mobile: cleanMobile,
      name: name.trim(),
    });
    await setCustomerSessionCookie(token);

    // Non-blocking Telegram notification to admins
    sendTelegramCustomerRegistrationNotification({
      name: name.trim(),
      mobile: cleanMobile,
      address: address.trim(),
      city: city.trim(),
    }).catch((err) => console.error('[Customer Register Alert] Telegram warning:', err));

    return NextResponse.json({
      success: true,
      customer: { id: customerId, name: name.trim(), mobile: cleanMobile },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
