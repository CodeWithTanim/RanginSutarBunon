import { NextResponse } from 'next/server';
import { createAdminToken, setAdminSessionCookie, getAdminUserFromDb } from '@/lib/auth';
import { sendTelegramAdminLoginNotification } from '@/lib/telegram';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'Local / Unknown IP';
    const userAgent = request.headers.get('user-agent') || 'Browser Device';

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
      // Send Failed Login Attempt Security Alert (awaited for Vercel serverless)
      try {
        await sendTelegramAdminLoginNotification({
          username,
          ip,
          userAgent,
          success: false,
        });
      } catch (err) {
        console.error('[Login Security Alert] Telegram warning:', err);
      }

      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Send Successful Login Notification (awaited for Vercel serverless)
    try {
      await sendTelegramAdminLoginNotification({
        username,
        ip,
        userAgent,
        success: true,
      });
    } catch (err) {
      console.error('[Login Notification] Telegram warning:', err);
    }

    const token = await createAdminToken({ username, role: 'ADMIN' });
    await setAdminSessionCookie(token);

    return NextResponse.json({ success: true, username, role: 'ADMIN' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
