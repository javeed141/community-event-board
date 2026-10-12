'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Bell, Palette, Loader2 } from 'lucide-react';

export type EventItem = {
  _id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  dateTime: string;
  price: number;
  imageUrl: string;
};

type EventCardProps = {
  event: EventItem;
  hasReminder?: boolean;
  isReminderLoading?: boolean;
  onToggleReminder?: (eventId: string) => void;
  showReminder?: boolean;
};

// Helper: Format date → "Sat, 18 Oct, 6:30 PM"
export function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Helper: Format price → "₹1,50,000" or "Free"
export function formatEventPrice(price: number) {
  if (price === 0) return 'Free';
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function EventCard({
  event,
  hasReminder = false,
  isReminderLoading = false,
  onToggleReminder,
  showReminder = true,
}: EventCardProps) {
  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all flex flex-col">
      {/* Event Image & Badges */}
      <div className="h-44 bg-zinc-800 relative overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
            No Image Available
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-zinc-950/80 backdrop-blur border-zinc-800 text-rose-400 font-medium">
            {event.category}
          </Badge>
        </div>

        {/* Bell / Remind Me button */}
        {showReminder && onToggleReminder && (
          <button
            onClick={() => onToggleReminder(event._id)}
            disabled={isReminderLoading}
            title={hasReminder ? 'Remove reminder' : 'Set reminder'}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur border transition-colors cursor-pointer ${
              hasReminder
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-emerald-400 border-zinc-800'
            }`}
          >
            {isReminderLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Details */}
      <CardHeader className="p-4 pb-2 space-y-1">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatEventDate(event.dateTime)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {event.city}
          </span>
        </div>
        <CardTitle className="text-base text-white pt-1 leading-snug">
          {event.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs">
          {event.description}
        </CardDescription>
      </CardHeader>

      {/* Price + Design Card */}
      <CardContent className="p-4 pt-3 mt-auto flex items-center justify-between border-t border-zinc-800/60">
        <div className="text-sm font-bold text-white">
          {formatEventPrice(event.price)}
        </div>
        <Link href={`/user/events/${event._id}`}>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

