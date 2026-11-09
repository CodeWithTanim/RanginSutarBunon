import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getCustomerSession } from '@/lib/customerAuth';

export async function PUT(request: Request) {
  try {
    const sessionCustomer = await getCustomerSession();
    if (!sessionCustomer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, mobile, address, city, state, pincode, extraMobiles, extraAddresses } = body;

    if (!name || !mobile || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: 'Please fill in all required primary profile fields' }, { status: 400 });
    }

    const cleanMobile = String(mobile).trim();
    if (!/^\d{10,11}$/.test(cleanMobile)) {
      return NextResponse.json({ error: 'Please enter a valid 10 or 11 digit mobile number' }, { status: 400 });
    }

    const db = await getDb();

    // Check if mobile changed and is taken by another customer
    if (cleanMobile !== sessionCustomer.mobile) {
      const existing = await db.collection('customers').findOne({ mobile: cleanMobile });
      if (existing && existing.id !== sessionCustomer.id && String(existing._id) !== sessionCustomer.id) {
        return NextResponse.json({ error: 'This mobile number is already in use by another account' }, { status: 400 });
      }
    }

    const now = new Date().toISOString();
    await db.collection('customers').updateOne(
      { $or: [{ id: sessionCustomer.id }, { mobile: sessionCustomer.mobile }] },
      {
        $set: {
          name: name.trim(),
          mobile: cleanMobile,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          extraMobiles: Array.isArray(extraMobiles) ? extraMobiles : [],
          extraAddresses: Array.isArray(extraAddresses) ? extraAddresses : [],
          updatedAt: now,
        },
      }
    );

    const updated = await db.collection('customers').findOne({ mobile: cleanMobile });

    return NextResponse.json({
      success: true,
      customer: {
        id: updated?.id || sessionCustomer.id,
        name: updated?.name || name.trim(),
        mobile: updated?.mobile || cleanMobile,
        address: updated?.address || address.trim(),
        city: updated?.city || city.trim(),
        state: updated?.state || state.trim(),
        pincode: updated?.pincode || pincode.trim(),
        extraMobiles: Array.isArray(updated?.extraMobiles) ? updated.extraMobiles : [],
        extraAddresses: Array.isArray(updated?.extraAddresses) ? updated.extraAddresses : [],
      },
    });
  } catch (error: any) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
