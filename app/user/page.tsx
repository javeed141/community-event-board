'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Bell, 
  Palette, 
  Calendar, 
  MapPin, 
  Sparkles, 
  SlidersHorizontal, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const ALL_CATEGORIES = ['Music', 'Workshop', 'Food', 'Sports', 'Kids'];

export default function UserPersonalizedPage() {
  // State for user's selected favourite categories
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(['Music', 'Food']);
  const [reminders, setReminders] = useState<string[]>(['1']); // event IDs with reminder set

  const toggleCategory = (cat: string) => {
    if (favoriteCategories.includes(cat)) {
      setFavoriteCategories(favoriteCategories.filter((c) => c !== cat));
    } else {
      setFavoriteCategories([...favoriteCategories, cat]);
    }
  };

  const toggleReminder = (eventId: string) => {
    if (reminders.includes(eventId)) {
      setReminders(reminders.filter((id) => id !== eventId));
    } else {
      setReminders([...reminders, eventId]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* 1. TOP HEADER */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-tight">My Feed & Dashboard</h1>
              <p className="text-xs text-zinc-400">Personalized community events for you</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Explore All Events</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
        {/* 2. FAVOURITE CATEGORIES SELECTOR */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-rose-400">
              <Sparkles className="w-4 h-4" />
              <CardTitle className="text-base font-semibold">Favourite Event Categories</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Select your favourite categories below. Your feed will automatically adapt to show upcoming events matching these categories.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {ALL_CATEGORIES.map((category) => {
                const isSelected = favoriteCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold shadow-sm'
                        : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <span>{category}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              {favoriteCategories.length > 0
                ? `Showing events for: ${favoriteCategories.join(', ')}`
                : 'No categories selected. Pick at least one to personalize your feed!'}
            </p>
          </CardContent>
        </Card>

        {/* 3. MY FEED (MATCHING EVENTS) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Your Tailored Feed</h2>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                Upcoming & Active
              </span>
            </div>
            <span className="text-xs text-zinc-400">Sorted nearest date first</span>
          </div>

          {/* Events matching user's selected favorites */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((item) => {
              const hasReminder = reminders.includes(item.toString());
              return (
                <Card key={item} className="overflow-hidden border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all flex flex-col">
                  <div className="h-44 bg-zinc-800/60 relative">
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur px-2.5 py-1 rounded text-xs font-medium text-rose-400 border border-zinc-800">
                      {item === 1 ? 'Music' : 'Food'}
                    </div>
                    {/* Instant Remind Me Action */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleReminder(item.toString())}
                        title={hasReminder ? 'Remove reminder' : 'Set reminder'}
                        className={`p-2 rounded-full backdrop-blur border transition-colors cursor-pointer ${
                          hasReminder
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-zinc-950/80 text-zinc-400 hover:text-emerald-400 border-zinc-800'
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <CardHeader className="p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Calendar className="w-3.5 h-3.5" /> Sat, 18 Oct, 6:30 PM
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Bangalore
                      </span>
                    </div>
                    <CardTitle className="text-base text-white pt-1">
                      {item === 1 ? 'Indie Rock Night Live' : 'Bangalore Food Truck Fiesta'}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      Curated specifically because you selected {item === 1 ? 'Music' : 'Food'} as your favourite.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 mt-auto flex items-center justify-between border-t border-zinc-800/60 pt-3">
                    <div className="text-sm font-bold text-white">{item === 1 ? '₹499' : 'Free'}</div>
                    <div className="flex items-center gap-2">
                      <Link href={`/events/${item}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                          <Palette className="w-3.5 h-3.5" />
                          <span>Design Card</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

