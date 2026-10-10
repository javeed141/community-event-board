import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // 1. Get token from cookie or Authorization header
    const cookieStore = await cookies();
    let token = cookieStore.get('auth_token')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // 2. Verify token
    const decoded = verifyToken(token) as { userId: string } | null;
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // 3. Find user in database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        favoriteCategories: user.favoriteCategories || [],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
