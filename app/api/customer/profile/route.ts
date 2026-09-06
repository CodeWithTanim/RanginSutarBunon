import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

    // Check if mobile changed and is taken by another customer
    if (cleanMobile !== sessionCustomer.mobile) {
      const existing = await prisma.customer.findUnique({ where: { mobile: cleanMobile } });
      if (existing && existing.id !== sessionCustomer.id) {
        return NextResponse.json({ error: 'This mobile number is already in use by another account' }, { status: 400 });
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: sessionCustomer.id },
      data: {
        name: name.trim(),
        mobile: cleanMobile,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        extraMobiles: Array.isArray(extraMobiles) ? JSON.stringify(extraMobiles) : '[]',
        extraAddresses: Array.isArray(extraAddresses) ? JSON.stringify(extraAddresses) : '[]',
      },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        mobile: updatedCustomer.mobile,
        address: updatedCustomer.address,
        city: updatedCustomer.city,
        state: updatedCustomer.state,
        pincode: updatedCustomer.pincode,
        extraMobiles: updatedCustomer.extraMobiles ? JSON.parse(updatedCustomer.extraMobiles) : [],
        extraAddresses: updatedCustomer.extraAddresses ? JSON.parse(updatedCustomer.extraAddresses) : [],
      },
    });
  } catch (error: any) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
