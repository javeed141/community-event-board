import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDb();
    // 1. Fetch user to get their favorite categories
    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const categories = user.favoriteCategories || [];

    // 2. If user hasn't selected any favorite categories yet
    if (categories.length === 0) {
      return NextResponse.json({
        events: [],
        favoriteCategories: [],
        message: 'No favorite categories selected yet. Pick categories to personalize your feed!',
      });
    }

    // 3. Find active, upcoming events matching user's favorite categories (sorted nearest first)
    const events = await Event.find({
      isActive: true,
      dateTime: { $gte: new Date() },
      category: { $in: categories },
    }).sort({ dateTime: 1 });

    return NextResponse.json({
      events,
      favoriteCategories: categories,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch feed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
