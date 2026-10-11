import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Look for token in Cookies or Authorization Bearer header
  const token =
    request.cookies.get('auth_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // 2. If no token is provided, block the request immediately
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized: Please log in' },
      { status: 401 }
    );
  }

  // 3. If accessing Admin routes, check for the admin secret key
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const adminKey = request.headers.get('x-admin-key');
    const expectedKey = process.env.ADMIN_API_KEY || 'admin_super_secret_key_2026';

    if (!adminKey || adminKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Forbidden: Valid x-admin-key required' },
        { status: 403 }
      );
    }
  }

  // 4. Token is present, allow request to continue to the API route
  return NextResponse.next();
}

// 5. Specify which routes this middleware protects
export const config = {
  matcher: [
    '/api/auth/me',
    '/api/favourites/:path*',
    '/api/feed/:path*',
    '/api/reminders/:path*',
    '/api/admin/:path*',
    '/api/events/:id/reminder',
    '/api/events/:id/card-design',
  ],
};
