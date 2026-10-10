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
    // If not logged in, there is no saved design
    if (!auth) {
      return NextResponse.json({ design: null });
    }

    const { id: eventId } = await params;

    const savedDesign = await CardDesign.findOne({
      user: auth.userId,
      event: eventId,
    });

    // If no design saved yet in DB, return null so UI shows "Create your design" empty state
    if (!savedDesign) {
      return NextResponse.json({
        design: null,
        message: 'No saved design found for this event',
      });
    }

    return NextResponse.json({
      design: {
        theme: savedDesign.theme,
        stickers: savedDesign.stickers,
      },
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

    // Enforce max 3 stickers constraint from specification
    const validStickers = Array.isArray(stickers) ? stickers.slice(0, 3) : [];

    const savedDesign = await CardDesign.findOneAndUpdate(
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
      design: {
        theme: savedDesign.theme,
        stickers: savedDesign.stickers,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save card design';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
