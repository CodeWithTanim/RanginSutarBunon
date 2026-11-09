import { NextResponse } from 'next/server';
import { getAdminSession, getBetterAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const adminSession = await getAdminSession();
  if (adminSession) {
    return NextResponse.json(
      { authenticated: true, user: adminSession, role: 'ADMIN' },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }

  const betterSession = await getBetterAuthSession();
  if (betterSession && betterSession.user) {
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          username: betterSession.user.name || betterSession.user.email,
          role: (betterSession.user as any).role || 'USER',
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-Content-Type-Options': 'nosniff',
        },
      }
    );
  }

  return NextResponse.json(
    { authenticated: false },
    {
      status: 401,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
