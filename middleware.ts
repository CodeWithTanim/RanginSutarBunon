import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'rangin-sutar-bunon-super-secret-jwt-key-2026'
);

async function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return verified.payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Customer Profile & Account routes
  if (pathname === '/account' || (pathname.startsWith('/account/') && pathname !== '/account/login' && pathname !== '/account/register')) {
    const customerToken = request.cookies.get('customer_session_token')?.value;
    const session = await verifyToken(customerToken);

    if (!session) {
      const loginUrl = new URL('/account/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      if (customerToken) {
        response.cookies.delete('customer_session_token');
      }
      return response;
    }
  }

  // Handle /profile shortcut - redirect to /account (or login if unauthenticated)
  if (pathname === '/profile') {
    const customerToken = request.cookies.get('customer_session_token')?.value;
    const session = await verifyToken(customerToken);

    if (!session) {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
    return NextResponse.redirect(new URL('/account', request.url));
  }

  // If already logged in as customer, redirect away from login/register to /account
  if (pathname === '/account/login' || pathname === '/account/register') {
    const customerToken = request.cookies.get('customer_session_token')?.value;
    const session = await verifyToken(customerToken);
    if (session) {
      const redirect = request.nextUrl.searchParams.get('redirect') || '/account';
      return NextResponse.redirect(new URL(redirect, request.url));
    }
  }

  // Protect Admin /boss routes
  if (pathname.startsWith('/boss') && pathname !== '/boss/login') {
    const adminToken = request.cookies.get('admin_session_token')?.value;
    const session = await verifyToken(adminToken);

    if (!session) {
      const adminLoginUrl = new URL('/boss/login', request.url);
      const response = NextResponse.redirect(adminLoginUrl);
      if (adminToken) {
        response.cookies.delete('admin_session_token');
      }
      return response;
    }
  }

  // If already logged in as admin, redirect from /boss/login to /boss
  if (pathname === '/boss/login') {
    const adminToken = request.cookies.get('admin_session_token')?.value;
    const session = await verifyToken(adminToken);
    if (session) {
      return NextResponse.redirect(new URL('/boss', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account',
    '/account/:path*',
    '/profile',
    '/boss',
    '/boss/:path*',
  ],
};

