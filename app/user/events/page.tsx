'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Calendar,
  MapPin,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { formatEventDate, formatEventPrice } from '@/components/EventCard';

type EventItem = {
  _id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  dateTime: string;
  price: number;
  imageUrl: string;
};

const CATEGORIES = ['All', 'Music', 'Workshop', 'Food', 'Sports', 'Kids'];
const CITIES = ['All', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Coimbatore'];

function EventsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read current filters directly from URL
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const cityParam = searchParams.get('city') || 'All';
  const pageParam = parseInt(searchParams.get('page') || '1', 10) || 1;

  // Local state for search text input so typing remains smooth and responsive
  const [searchInput, setSearchInput] = useState(searchParam);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  // Sync local search input if URL changes (e.g. browser back/forward or Reset)
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Helper to update URL search parameters
  const updateQueryParams = useCallback(
    (updates: { search?: string; category?: string; city?: string; page?: number }) => {
      const current = new URLSearchParams(searchParams.toString());

      const nextSearch = updates.search !== undefined ? updates.search : (current.get('search') || '');
      if (nextSearch.trim()) {
        current.set('search', nextSearch.trim());
      } else {
        current.delete('search');
      }

      const nextCategory = updates.category !== undefined ? updates.category : (current.get('category') || 'All');
      if (nextCategory && nextCategory !== 'All') {
        current.set('category', nextCategory);
      } else {
        current.delete('category');
      }

      const nextCity = updates.city !== undefined ? updates.city : (current.get('city') || 'All');
      if (nextCity && nextCity !== 'All') {
        current.set('city', nextCity);
      } else {
        current.delete('city');
      }

      const nextPage = updates.page !== undefined ? updates.page : 1;
      if (nextPage > 1) {
        current.set('page', nextPage.toString());
      } else {
        current.delete('page');
      }

      const queryString = current.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // Debounce search input changes into the URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== searchParam.trim()) {
        updateQueryParams({ search: searchInput, page: 1 });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, searchParam, updateQueryParams]);

  // Fetch events whenever URL query parameters change
  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pageParam.toString(),
          limit: '6',
        });
        if (searchParam.trim()) params.append('search', searchParam.trim());
        if (categoryParam !== 'All') params.append('category', categoryParam);
        if (cityParam !== 'All') params.append('city', cityParam);

        const res = await fetch(`/api/events?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalEvents(data.pagination?.total || 0);
        }
      } catch {
        // Silently catch
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [searchParam, categoryParam, cityParam, pageParam]);

  const clearFilters = () => {
    setSearchInput('');
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters = Boolean(searchParam || categoryParam !== 'All' || cityParam !== 'All');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/user">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <h1 className="font-bold text-base text-white">Upcoming Community Events</h1>
          </div>

          <span className="text-xs text-zinc-400">
            {totalEvents} {totalEvents === 1 ? 'event' : 'events'} found
          </span>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
        {/* ── FILTERS BAR ─────────────────────────────────────────────────── */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search events by title or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 bg-zinc-950/60 border-zinc-800 h-10 text-sm"
              />
            </div>

            {/* City Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-zinc-400 whitespace-nowrap">City:</span>
              <select
                value={cityParam}
                onChange={(e) => updateQueryParams({ city: e.target.value, page: 1 })}
                className="bg-zinc-950/60 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-200 outline-none w-full md:w-auto"
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
                className="text-xs text-zinc-400 hover:text-white gap-1 w-full md:w-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-zinc-800/60">
            <span className="text-xs text-zinc-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {CATEGORIES.map((cat) => {
              const active = categoryParam === cat;
              return (
                <button
                  key={cat}
                  onClick={() => updateQueryParams({ category: cat, page: 1 })}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EVENTS LIST / GRID ──────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden animate-pulse"
              >
                <div className="h-44 bg-zinc-800" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="py-20 text-center border border-zinc-800/80 rounded-xl bg-zinc-900/40 space-y-3">
            <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No upcoming events found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Try adjusting your search query, selecting another category, or resetting filters.
            </p>
            {hasActiveFilters && (
              <Button size="sm" variant="outline" onClick={clearFilters} className="text-xs">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event._id}
                className="overflow-hidden border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all flex flex-col"
              >
                {/* Image & Category */}
                <div className="h-44 bg-zinc-800 relative overflow-hidden">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur px-2.5 py-1 rounded text-xs font-medium text-rose-400 border border-zinc-800">
                    {event.category}
                  </div>
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

                {/* Price & View Event Link */}
                <CardContent className="p-4 pt-3 mt-auto flex items-center justify-between border-t border-zinc-800/60">
                  <div className="text-sm font-bold text-white">
                    {formatEventPrice(event.price)}
                  </div>
                  <Link href={`/user/events/${event._id}`}>
                    <Button size="sm" className="h-8 text-xs">
                      View Event
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── PAGINATION ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={pageParam <= 1}
              onClick={() => updateQueryParams({ page: Math.max(1, pageParam - 1) })}
              className="gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <span className="text-xs text-zinc-400">
              Page {pageParam} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pageParam >= totalPages}
              onClick={() => updateQueryParams({ page: Math.min(totalPages, pageParam + 1) })}
              className="gap-1 text-xs"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function UserEventsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
          <Spinner className="w-8 h-8 text-rose-500" />
        </div>
      }
    >
      <EventsContent />
    </Suspense>
  );
}

