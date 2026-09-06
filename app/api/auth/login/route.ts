import { NextResponse } from 'next/server';
import { createAdminToken, setAdminSessionCookie } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    let isValid = false;

    // Check DB Admin User if available
    try {
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your-tenant-ref')) {
        const user = await prisma.user.findUnique({ where: { username } });
        if (user) {
          isValid = await bcrypt.compare(password, user.passwordHash);
        }
      }
    } catch {
      // Fallback
    }

    // Default Fallback Admin Check if DB check did not pass
    if (!isValid) {
      const defaultUser = process.env.ADMIN_USERNAME || 'admin';
      const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';
      if (username === defaultUser && password === defaultPass) {
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
