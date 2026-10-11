import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Event from '@/lib/models/Event';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDb();
    const { id } = await params;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid event ID';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
