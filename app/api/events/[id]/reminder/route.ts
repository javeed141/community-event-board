import { NextResponse } from 'next/server';
import Reminder from '@/lib/models/Reminder';
import { getAuthUser } from '@/lib/auth';

// PUT: Save reminder idempotently
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Please log in to set reminders' }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Idempotent upsert: create if doesn't exist
    await Reminder.findOneAndUpdate(
      { user: auth.userId, event: eventId },
      { user: auth.userId, event: eventId },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: 'Reminder saved successfully',
      eventId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save reminder';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove reminder
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Please log in to manage reminders' }, { status: 401 });
    }

    const { id: eventId } = await params;

    await Reminder.findOneAndDelete({
      user: auth.userId,
      event: eventId,
    });

    return NextResponse.json({
      message: 'Reminder removed successfully',
      eventId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove reminder';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
