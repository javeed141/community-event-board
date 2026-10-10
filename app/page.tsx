'use client';

import React, { useState, useEffect, useCallback } from 'react';
import EventCard, { EventItem } from '@/components/EventCard';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['All', 'Music', 'Workshop', 'Food', 'Sports', 'Kids'];
const CITIES = ['All', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Coimbatore', 'Pune'];

export default function Home() {
  const { user } = useAuth();

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Data state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [reminderIds, setReminderIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);

  // Fetch reminders for logged in user
  useEffect(() => {
    let isMounted = true;
    if (!user) {
      return;
    }

    fetch('/api/reminders')
      .then((res) => (res.ok ? res.json() : { reminderEventIds: [] }))
      .then((data) => {
        if (isMounted) {
          setReminderIds(data.reminderEventIds || []);
        }
      })
      .catch(() => {
        if (isMounted) setReminderIds([]);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Fetch events based on active filters
  const fetchEvents = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedCity !== 'All') params.set('city', selectedCity);
      params.set('page', String(currentPage));
      params.set('limit', '6');

      const res = await fetch(`/api/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        if (data.pagination) setPagination(data.pagination);
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedCity, currentPage]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Reset page to 1 when changing search or filters
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEvents();
  };

  const handleReminderChange = (eventId: string, isReminded: boolean) => {
    setReminderIds((prev) =>
      isReminded ? [...prev, eventId] : prev.filter((id) => id !== eventId)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Discover Local{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Community Events
          </span>
        </h1>
        <p className="mt-3 text-base text-zinc-400 leading-relaxed">
          Explore upcoming live concerts, workshops, sports, and food carnivals in your city.
          Save instant reminders and personalize custom event cards.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-8 flex gap-2 max-w-xl mx-auto">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by event title or keyword..."
              className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filters Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 mb-10 backdrop-blur-sm space-y-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-2">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                  : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* City Filter & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/60">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-2">
              City:
            </span>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city === 'All' ? 'All Cities' : `📍 ${city}`}
                </option>
              ))}
            </select>
          </div>

          {(selectedCategory !== 'All' || selectedCity !== 'All' || search) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCity('All');
                setSearch('');
                setCurrentPage(1);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              ✕ Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Events Listing */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8">
          <span className="text-4xl">🎪</span>
          <h3 className="mt-4 text-lg font-bold text-white">No upcoming events found</h3>
          <p className="mt-1 text-sm text-zinc-400 max-w-md mx-auto">
            We couldn&apos;t find any events matching your selected search or filters. Try adjusting your keywords or clearing filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedCity('All');
              setSearch('');
              setCurrentPage(1);
            }}
            className="mt-6 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isReminded={reminderIds.includes(event._id)}
                onReminderChange={handleReminderChange}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={!pagination.hasPrevPage}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 text-xs font-semibold rounded-xl transition-colors"
              >
                ← Previous
              </button>

              <span className="text-xs text-zinc-400 font-medium px-2">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} events)
              </span>

              <button
                type="button"
                disabled={!pagination.hasNextPage}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
