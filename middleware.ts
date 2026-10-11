import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Extract auth token from cookie or Authorization header
  const token =
    request.cookies.get('auth_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // 2. Protect Server API Routes (/api/*)
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' },
        { status: 401 }
      );
    }

    // Check admin secret key for /api/admin/*
    if (pathname.startsWith('/api/admin')) {
      const adminKey = request.headers.get('x-admin-key');
      const expectedKey = process.env.ADMIN_API_KEY || 'admin_super_secret_key_2026';
      if (!adminKey || adminKey !== expectedKey) {
        return NextResponse.json(
          { error: 'Forbidden: Valid x-admin-key required' },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  }

  // 3. Protect Frontend UI Pages (/admin, /user)
  // Any visitor without a token is immediately redirected to /login
  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/user'))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Specify exactly which routes the middleware guards
export const config = {
  matcher: [
    // Frontend Protected Pages
    '/admin/:path*',
    '/user/:path*',
    // Protected API Routes
    '/api/auth/me',
    '/api/favourites/:path*',
    '/api/feed/:path*',
    '/api/reminders/:path*',
    '/api/admin/:path*',
    '/api/events/:id/reminder',
    '/api/events/:id/card-design',
  ],
};
