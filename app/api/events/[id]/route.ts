import { NextResponse } from 'next/server';
import Event from '@/lib/models/Event';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid event ID';
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
