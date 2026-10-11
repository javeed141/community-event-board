import { NextResponse } from 'next/server';
import connectDb from '@/lib/db';
import Reminder from '@/lib/models/Reminder';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find all reminders for this user
    await connectDb();
    const reminders = await Reminder.find({ user: auth.userId }).select('event');
    const reminderEventIds = reminders.map((r) => r.event.toString());

    return NextResponse.json({
      reminderEventIds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reminders';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
