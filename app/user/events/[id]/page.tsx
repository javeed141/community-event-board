'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Tag,
  Clock,
  Bell,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { formatEventDate, formatEventPrice } from '@/components/EventCard';
import { toast } from '@/components/ui/toast';

type EventDetail = {
  _id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  dateTime: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
};

export default function SingleEventDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reminder status
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadEvent() {
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          setError('Event not found');
          return;
        }
        const data = await res.json();
        setEvent(data.event);
      } catch {
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    async function checkReminder() {
      try {
        const res = await fetch('/api/reminders');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.reminderEventIds)) {
            setHasReminder(data.reminderEventIds.includes(id));
          }
        }
      } catch {
        // Silently catch
      }
    }

    loadEvent();
    checkReminder();
  }, [id]);

  // Toggle Reminder
  async function toggleReminder() {
    if (!id) return;
    setReminderLoading(true);
    try {
      const method = hasReminder ? 'DELETE' : 'PUT';
      const res = await fetch(`/api/events/${id}/reminder`, { method });

      if (res.ok) {
        setHasReminder(!hasReminder);
        toast.add({
          title: hasReminder ? 'Reminder removed' : 'Reminder saved',
          description: hasReminder
            ? 'You will no longer receive notifications for this event.'
            : 'You will be notified for this event.',
          type: 'success',
        });
      } else {
        toast.add({
          title: 'Action failed',
          description: 'Could not update reminder. Make sure you are signed in.',
          type: 'error',
        });
      }
    } catch {
      toast.add({
        title: 'Network error',
        description: 'Failed to communicate with server.',
        type: 'error',
      });
    } finally {
      setReminderLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-white">Event Not Found</h2>
          <p className="text-sm text-zinc-400">
            {error || "The event you're looking for doesn't exist or has been removed."}
          </p>
          <Link href="/user/events">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Events</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/user/events">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Events</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={toggleReminder}
            disabled={reminderLoading}
            className={`gap-1.5 text-xs transition-colors ${
              hasReminder
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            {reminderLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : hasReminder ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-200" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            <span>{hasReminder ? 'Reminder Set' : 'Remind Me'}</span>
          </Button>
        </div>
      </header>

      {/* ── MAIN DETAIL BODY ────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
        {/* Hero Card */}
        <Card className="border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-2xl">
          {/* Big Header Image */}
          <div className="h-64 sm:h-80 md:h-96 w-full relative overflow-hidden bg-zinc-900">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                No Preview Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

            {/* Badges on Hero */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="bg-rose-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur">
                {event.category}
              </span>
              <span className="bg-zinc-900/90 text-zinc-300 border border-zinc-700/60 text-xs px-2.5 py-1 rounded-full backdrop-blur">
                {event.city}
              </span>
            </div>

            {/* Bottom Title Bar on Hero */}
            <div className="absolute bottom-4 left-4 right-4 space-y-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60">
              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Date & Time</div>
                  <div className="text-sm font-semibold text-white">
                    {formatEventDate(event.dateTime)}
                  </div>
                </div>
              </div>

              {/* City / Location */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Location</div>
                  <div className="text-sm font-semibold text-white">{event.city}</div>
                </div>
              </div>

              {/* Entry Price */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Entry Fee</div>
                  <div className="text-sm font-bold text-white">
                    {formatEventPrice(event.price)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white">About This Event</h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
