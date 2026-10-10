import { NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';

// 1. GET user's favorite categories
export async function GET(request: Request) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      favoriteCategories: user.favoriteCategories || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch favorites';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 2. PUT update user's favorite categories
export async function PUT(request: Request) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { categories } = body;

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'Categories must be an array' },
        { status: 400 }
      );
    }

    // Update user document
    const user = await User.findByIdAndUpdate(
      auth.userId,
      { favoriteCategories: categories },
      { new: true }
    );

    return NextResponse.json({
      message: 'Favorites updated successfully',
      favoriteCategories: user?.favoriteCategories || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update favorites';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
