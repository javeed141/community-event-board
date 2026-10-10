import { NextResponse } from 'next/server';
import CardDesign from '@/lib/models/CardDesign';
import { getAuthUser } from '@/lib/auth';

// GET: Retrieve user's saved card design for this event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthUser(request);
    // If visitor is not logged in, return default design
    if (!auth) {
      return NextResponse.json({
        theme: 'default',
        stickers: [],
      });
    }

    const { id: eventId } = await params;

    const design = await CardDesign.findOne({
      user: auth.userId,
      event: eventId,
    });

    if (!design) {
      return NextResponse.json({
        theme: 'default',
        stickers: [],
      });
    }

    return NextResponse.json({
      theme: design.theme,
      stickers: design.stickers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch card design';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Save or update card design for this event
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Please log in to save your customized card design' },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;
    const body = await request.json();
    const { theme, stickers } = body;

    // Validate stickers (max 3 allowed)
    const validStickers = Array.isArray(stickers) ? stickers.slice(0, 3) : [];

    const design = await CardDesign.findOneAndUpdate(
      { user: auth.userId, event: eventId },
      {
        user: auth.userId,
        event: eventId,
        theme: theme || 'default',
        stickers: validStickers,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: 'Card design saved successfully',
      theme: design.theme,
      stickers: design.stickers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save card design';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
