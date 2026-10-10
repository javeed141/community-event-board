import { NextResponse } from 'next/server';
import Event from '@/lib/models/Event';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthUser(request);
    // Server-side admin authorization
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id: eventId } = await params;
    const body = await request.json().catch(() => ({}));
    const { isActive } = body;

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // If isActive boolean is sent, set it; otherwise toggle current status
    event.isActive = typeof isActive === 'boolean' ? isActive : !event.isActive;
    await event.save();

    return NextResponse.json({
      message: `Event marked as ${event.isActive ? 'Active' : 'Inactive'}`,
      event,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update event status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
