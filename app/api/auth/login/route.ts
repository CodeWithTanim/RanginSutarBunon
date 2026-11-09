import { NextResponse } from 'next/server';
import { createAdminToken, setAdminSessionCookie, getAdminUserFromDb } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    let isValid = false;

    // 1. Check MongoDB Users collection
    try {
      const user = await getAdminUserFromDb(username);
      if (user && user.passwordHash) {
        isValid = await bcrypt.compare(password, user.passwordHash);
      }
    } catch (err) {
      console.warn('MongoDB admin check warning:', err);
    }

    // 2. Optional Environment Variable Admin Check (only if explicitly configured)
    if (!isValid && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = await createAdminToken({ username, role: 'ADMIN' });
    await setAdminSessionCookie(token);

    return NextResponse.json({ success: true, username, role: 'ADMIN' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
