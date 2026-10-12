import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper to decode JWT payload
function getJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof Buffer !== 'undefined'
      ? Buffer.from(base64, 'base64').toString('utf-8')
      : atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get token from cookies or authorization header
  const token =
    request.cookies.get('auth_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // 2. Protect Server API Routes (/api/*)
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 3. Protect Frontend UI Pages (/admin, /user)
  if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
    // If not logged in, redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = getJwtPayload(token);
    const isAdmin = payload?.role === 'admin';

    // If admin visits /user -> redirect to /admin
    if (isAdmin && pathname.startsWith('/user')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // If regular user visits /admin -> redirect to /user
    if (!isAdmin && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/user', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected Frontend Pages
    '/admin/:path*',
    '/user/:path*',
    // Protected API Endpoints
    '/api/auth/me',
    '/api/favourites/:path*',
    '/api/feed/:path*',
    '/api/reminders/:path*',
    '/api/admin/:path*',
    '/api/events/:id/reminder',
    '/api/events/:id/card-design',
  ],
};
