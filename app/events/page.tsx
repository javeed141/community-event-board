'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard, { EventItem } from '@/components/EventCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';

const CATEGORIES = ['All', 'Music', 'Workshop', 'Food', 'Sports', 'Kids'];
const CITIES = ['All', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Coimbatore', 'Pune'];

function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Filter states from URL or defaults
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // 2. Data states
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  // 3. User session & Reminders
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reminderEventIds, setReminderEventIds] = useState<string[]>([]);
  const [reminderLoading, setReminderLoading] = useState<Set<string>>(new Set());

  // Check auth & existing reminders
  useEffect(() => {
    async function checkAuthAndReminders() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          setIsLoggedIn(true);
          const remRes = await fetch('/api/reminders');
          if (remRes.ok) {
            const remData = await remRes.json();
            setReminderEventIds(remData.reminderEventIds || []);
          }
        }
      } catch {
        // Guest mode
      }
    }
    checkAuthAndReminders();
  }, []);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch events when filters or page changes
  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '6',
        });
        if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
        if (category !== 'All') params.append('category', category);
        if (city !== 'All') params.append('city', city);

        // Synchronize browser URL query
        const urlParams = new URLSearchParams();
        if (debouncedSearch.trim()) urlParams.set('search', debouncedSearch.trim());
        if (category !== 'All') urlParams.set('category', category);
        if (city !== 'All') urlParams.set('city', city);
        if (page > 1) urlParams.set('page', page.toString());

        const queryString = urlParams.toString();
        window.history.replaceState(
          null,
          '',
          queryString ? `?${queryString}` : window.location.pathname
        );

        const res = await fetch(`/api/events?${params.toString()}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setEvents(data.events || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalEvents(data.pagination?.total || 0);
        }
      } catch {
        // Network error handling
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, city, page]);

  // Toggle Reminder with Optimistic UI & Rollback on failure
  const handleToggleReminder = async (eventId: string) => {
    if (!isLoggedIn) {
      toast.add({
        title: 'Sign in required',
        description: 'Please log in to save event reminders.',
        type: 'warning',
      });
      router.push(`/login?redirect=/events`);
      return;
    }

    const hasReminder = reminderEventIds.includes(eventId);
    const previousReminders = [...reminderEventIds];

    // Optimistic UI update
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
        // Rollback
        setReminderEventIds(previousReminders);
        toast.add({
          title: 'Action failed',
          description: 'Could not update reminder. Action was rolled back.',
          type: 'error',
        });
      } else {
        toast.add({
          title: hasReminder ? 'Reminder removed' : 'Reminder saved',
          description: hasReminder
            ? 'Event removed from your saved reminders.'
            : 'Event reminder saved successfully!',
          type: 'success',
        });
      }
    } catch {
      // Rollback on network error
      setReminderEventIds(previousReminders);
      toast.add({
        title: 'Network error',
        description: 'Could not reach server. Action was rolled back.',
        type: 'error',
      });
    } finally {
      setReminderLoading((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('All');
    setCity('All');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || category !== 'All' || city !== 'All');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
        {/* Page Banner */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active & Upcoming Happenings</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Community Events Board
            </h1>
            <Badge variant="outline" className="w-fit text-xs text-zinc-400 border-zinc-800 bg-zinc-900/60">
              {totalEvents} {totalEvents === 1 ? 'event found' : 'events found'} &bull; Sorted nearest date first
            </Badge>
          </div>
          <p className="text-zinc-400 text-sm max-w-2xl">
            Browse upcoming workshops, concerts, food festivals, and sports. Filter by category, location, or search keywords.
          </p>
        </div>

        {/* ── FILTERS BAR ─────────────────────────────────────────────────── */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-4 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search events by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-950/60 border-zinc-800 h-10 text-sm"
              />
            </div>

            {/* City Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-zinc-400 whitespace-nowrap">City:</span>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPage(1);
                }}
                className="bg-zinc-950/60 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none w-full md:w-auto cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900 text-zinc-200">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filters button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-zinc-400 hover:text-white gap-1 w-full md:w-auto cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </Button>
            )}
          </div>

          <Separator className="bg-zinc-800/80" />

          {/* Category Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className="cursor-pointer"
                >
                  <Badge
                    variant={active ? 'default' : 'outline'}
                    className={`px-3 py-1 text-xs transition-colors ${
                      active
                        ? 'bg-rose-500 hover:bg-rose-600 text-white border-transparent'
                        : 'border-zinc-700/80 text-zinc-400 hover:text-white hover:border-zinc-600 bg-zinc-900/40'
                    }`}
                  >
                    {cat}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EVENTS GRID ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
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
                  <Separator className="bg-zinc-800/60 my-2" />
                  <div className="flex justify-between items-center pt-1">
                    <Skeleton className="h-4 w-14 bg-zinc-800/60" />
                    <Skeleton className="h-8 w-24 bg-zinc-800/60 rounded-md" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-zinc-800/80 rounded-2xl bg-zinc-900/30">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
              <Inbox className="w-8 h-8 text-zinc-500" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-white">No upcoming events found</h3>
              <p className="text-sm text-zinc-400">
                {hasActiveFilters
                  ? 'No events match your selected combination of category, city, or search keywords. Try adjusting your filters.'
                  : 'There are currently no active upcoming events scheduled.'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs gap-1.5">
                <X className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </Button>
            )}
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                hasReminder={reminderEventIds.includes(event._id)}
                isReminderLoading={reminderLoading.has(event._id)}
                onToggleReminder={handleToggleReminder}
                showReminder={true}
              />
            ))}
          </div>
        )}

        {/* ── PAGINATION CONTROLS ─────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(Math.max(1, page - 1))}
              className="gap-1 text-xs cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <span className="text-xs text-zinc-400">
              Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              className="gap-1 text-xs cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function PublicEventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}

