import { NextResponse } from 'next/server';
import Event from '@/lib/models/Event';
import { verifyAdmin } from '@/lib/auth';

const ALLOWED_CATEGORIES = ['Music', 'Workshop', 'Food', 'Sports', 'Kids'];

// 1. GET: List all events for the admin dashboard (including past & inactive)
export async function GET(request: Request) {
  try {
    // Dual protection: JWT admin role + custom 'x-admin-key' header
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access only' },
        { status: 403 }
      );
    }

    // Return all events, newest first
    const events = await Event.find().sort({ dateTime: 1 });

    return NextResponse.json({ events });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch admin events';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 2. POST: Create a new event
export async function POST(request: Request) {
  try {
    // Dual protection: JWT admin role + custom 'x-admin-key' header
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, city, dateTime, price, imageUrl, isActive } = body;

    // Validate required fields
    if (!title || !description || !category || !city || !dateTime || price === undefined || !imageUrl) {
      return NextResponse.json(
        { error: 'All fields (title, description, category, city, dateTime, price, imageUrl) are required' },
        { status: 400 }
      );
    }

    // Validate category enum
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate price
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json(
        { error: 'Price must be a valid non-negative number' },
        { status: 400 }
      );
    }

    // Create event document
    const newEvent = await Event.create({
      title: title.trim(),
      description: description.trim(),
      category,
      city: city.trim(),
      dateTime: new Date(dateTime),
      price: numPrice,
      imageUrl: imageUrl.trim(),
      isActive: typeof isActive === 'boolean' ? isActive : true,
      createdBy: admin.userId,
    });

    return NextResponse.json(
      {
        message: 'Event created successfully',
        event: newEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
