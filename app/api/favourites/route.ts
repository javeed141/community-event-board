import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/User';
import { getAuthUser } from '@/lib/auth';

// 1. GET user's favorite categories
export async function GET(request: Request) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();
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

const ALLOWED_CATEGORIES = ['Music', 'Workshop', 'Food', 'Sports', 'Kids'];

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

    // Validate that all categories belong to ALLOWED_CATEGORIES
    const invalidCategories = categories.filter((cat) => !ALLOWED_CATEGORIES.includes(cat));
    if (invalidCategories.length > 0) {
      return NextResponse.json(
        {
          error: `Invalid category: ${invalidCategories.join(', ')}. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Deduplicate categories
    const sanitizedCategories = Array.from(new Set(categories));

    // Update user document
    await connectDb();
    const user = await User.findByIdAndUpdate(
      auth.userId,
      { favoriteCategories: sanitizedCategories },
      { new: true, runValidators: true }
    );
    // Without new: true, the API would return the old categories that were in the database before the update, confusing the frontend!
    // Option	Without it (Default)	With it (true)
    // new: true	Returns the old data before update	Returns the new, freshly updated data
    // runValidators: true	Bypasses schema validation rules	Enforces schema validation rules during update


    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Favorites updated successfully',
      favoriteCategories: user.favoriteCategories || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update favorites';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
