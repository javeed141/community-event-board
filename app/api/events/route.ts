import { NextResponse } from 'next/server';
import Event from '@/lib/models/Event';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Extract query params from URL
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const city = searchParams.get('city') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    // 2. Base rule: only active events that are in the future (exclude past & inactive)
    const query: Record<string, unknown> = {
      isActive: true,
      dateTime: { $gte: new Date() },
    };

    // 3. Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // 4. City filter (case-insensitive)
    if (city && city !== 'All') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    // 5. Keyword search (matches title or description)
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // 6. Pagination calculation
    const skip = (page - 1) * limit;

    // 7. Fetch events sorted by nearest date first (dateTime: 1)
    const [events, total] = await Promise.all([
      Event.find(query).sort({ dateTime: 1 }).skip(skip).limit(limit),
      Event.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch events';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
