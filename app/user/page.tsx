'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Heart, ArrowLeft, LogOut, User, Tag, Inbox } from 'lucide-react';
import EventCard, { EventItem } from '@/components/EventCard';
import FavoritesPicker from '@/components/FavoritesPicker';
import { toast } from "@/components/ui/toast"

type UserProfile = {
  id: string;
  email: string;
  role: string;
  favoriteCategories: string[];
};

export default function UserDashboardPage() {
  const router = useRouter();

  // ── Auth State ─────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Feed State ─────────────────────────────────────────────────────────────
  const [feedEvents, setFeedEvents] = useState<EventItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedMessage, setFeedMessage] = useState('');
  const [userCategories, setUserCategories] = useState<string[]>([]);

  // ── Reminders State ────────────────────────────────────────────────────────
  const [reminderEventIds, setReminderEventIds] = useState<string[]>([]);
  const [reminderLoading, setReminderLoading] = useState<Set<string>>(new Set());

  // Check auth & initial user on mount
  useEffect(() => {
    
    async function initUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.status === 401) {
          router.replace('/login');
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
        setUserCategories(data.user?.favoriteCategories || []);
      } catch {
        router.replace('/login');
      } finally {
        setAuthLoading(false);
      }
    }
    initUser();
  }, [router]);

  // Fetch feed events
  const fetchFeed = async () => {
    setFeedLoading(true);
    try {
      const res = await fetch('/api/feed');
      if (!res.ok) return;
      const data = await res.json();
      setFeedEvents(data.events || []);
      setFeedMessage(data.message || '');
      if (data.favoriteCategories) {
        setUserCategories(data.favoriteCategories);
      }
    } catch {
      // Silently catch
    } finally {
      setFeedLoading(false);
    }
  };

  // Load feed and reminders once auth completes
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    async function loadData() {
      setFeedLoading(true);
      try {
        const [feedRes, remindersRes] = await Promise.all([
          fetch('/api/feed'),
          fetch('/api/reminders'),
        ]);

        if (feedRes.ok && !cancelled) {
          const feedData = await feedRes.json();
          setFeedEvents(feedData.events || []);
          setFeedMessage(feedData.message || '');
          if (feedData.favoriteCategories) {
            setUserCategories(feedData.favoriteCategories);
          }
        }

        if (remindersRes.ok && !cancelled) {
          const remindersData = await remindersRes.json();
          setReminderEventIds(remindersData.reminderEventIds || []);
        }
      } catch {
        // Silently catch
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // Logout handler
  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
    }
  }

  // Toggle Reminder handler with Optimistic UI & Rollback on failure
  async function toggleReminder(eventId: string) {
    const hasReminder = reminderEventIds.includes(eventId);
    const previousReminders = [...reminderEventIds];

    // 1. Optimistic immediate update
    if (hasReminder) {
      setReminderEventIds((prev) => prev.filter((id) => id !== eventId));
    } else {
      setReminderEventIds((prev) => [...prev, eventId]);
    }

    setReminderLoading((prev) => new Set(prev).add(eventId));

    try {
      const method = hasReminder ? 'DELETE' : 'PUT';
      const res = await fetch(`/api/events/${eventId}/reminder`, { method });

      if (!res.ok) {
        // Rollback on failure
        setReminderEventIds(previousReminders);
        toast.add({
          title: 'Reminder failed',
          description: 'Could not update reminder. Action was rolled back.',
          type: 'error',
        });
      } else {
        toast.add({
          title: hasReminder ? 'Reminder removed' : 'Reminder saved',
          description: hasReminder
            ? 'Event removed from your reminders.'
            : 'Event saved! You will receive a reminder.',
          type: 'success',
        });
      }
    } catch {
      // Rollback on network error
      setReminderEventIds(previousReminders);
      toast.add({
        title: 'Network error',
        description: 'Could not reach the server. Reminder change was rolled back.',
        type: 'error',
      });
    } finally {
      setReminderLoading((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-tight">My Dashboard</h1>
              <p className="text-xs text-zinc-400">Personalized community events</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-300 font-medium">{currentUser.email}</span>
            </div>

            <Link href="/user/events">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">All Events</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="gap-1.5 text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
            >
              {loggingOut ? <Spinner /> : <LogOut className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
        {/* 1. Category Preferences Component */}
        <FavoritesPicker
          initialCategories={currentUser.favoriteCategories}
          onSaved={(newCategories) => {
            setUserCategories(newCategories);
            fetchFeed();
          }}
        />

        {/* 2. My Feed Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Your Feed</h2>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-medium">
                Upcoming & Active
              </Badge>
            </div>
            <span className="text-xs text-zinc-400">Nearest date first</span>
          </div>

          {/* Loading Skeleton */}
          {feedLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="overflow-hidden border-zinc-800 bg-zinc-900/60 flex flex-col p-0">
                  <Skeleton className="h-44 w-full bg-zinc-800/60 rounded-none" />
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-28 bg-zinc-800/60" />
                      <Skeleton className="h-4 w-20 bg-zinc-800/60" />
                    </div>
                    <Skeleton className="h-5 w-3/4 bg-zinc-800/60" />
                    <Skeleton className="h-3 w-full bg-zinc-800/60" />
                    <Skeleton className="h-3 w-2/3 bg-zinc-800/60" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state: No categories selected */}
          {!feedLoading && userCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 border border-zinc-800/60 rounded-xl bg-zinc-900/30">
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
                <Tag className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-zinc-300 font-medium">No categories selected</p>
              <p className="text-zinc-500 text-sm max-w-xs">
                Pick your favourite categories above and save to see personalised events here.
              </p>
            </div>
          )}

          {/* Empty state: Categories saved but no upcoming matching events */}
          {!feedLoading && userCategories.length > 0 && feedEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 border border-zinc-800/60 rounded-xl bg-zinc-900/30">
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
                <Inbox className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="text-zinc-300 font-medium">No upcoming events found</p>
              <p className="text-zinc-500 text-sm max-w-xs">
                {feedMessage || 'There are no active upcoming events matching your favourite categories right now. Check back soon!'}
              </p>
            </div>
          )}

          {/* Events Grid using modular EventCard component */}
          {!feedLoading && feedEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  hasReminder={reminderEventIds.includes(event._id)}
                  isReminderLoading={reminderLoading.has(event._id)}
                  onToggleReminder={toggleReminder}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
