import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // 1. Single unified auth extraction from cookie or Authorization header
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // 2. Fetch user from DB
    await connectDb();
    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // 3. Return user profile
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
