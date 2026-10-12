'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Tag,
  Bell,
  Loader2,
  CheckCircle,
  Sparkles,
  Palette,
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

const THEMES = [
  { id: 'default', label: 'Dark Charcoal', bg: 'bg-zinc-900 border-zinc-700', preview: 'bg-zinc-800' },
  { id: 'gradient', label: 'Sunset Glow', bg: 'bg-gradient-to-br from-rose-900 via-rose-800 to-amber-700 border-rose-500/30', preview: 'bg-gradient-to-br from-rose-500 to-amber-400' },
  { id: 'neon', label: 'Neon Cyber', bg: 'bg-gradient-to-br from-violet-900 via-purple-900 to-cyan-900 border-cyan-500/30', preview: 'bg-gradient-to-br from-violet-500 to-cyan-400' },
];

const STICKER_OPTIONS = ['⭐', '🎉', '🎵', '🍕', '🚀'];

function EventDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User session
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Reminder status
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  // Card Designer state
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [stickers, setStickers] = useState<string[]>([]);
  const [designSaving, setDesignSaving] = useState(false);
  const [designSaved, setDesignSaved] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadEventData() {
      setLoading(true);
      try {
        // 1. Fetch event
        const res = await fetch(`/api/events/${id}`);
        if (!res.ok) {
          setError('Event not found');
          return;
        }
        const data = await res.json();
        if (!cancelled) setEvent(data.event);

        // 2. Check auth
        const authRes = await fetch('/api/auth/me');
        if (authRes.ok) {
          if (!cancelled) setIsLoggedIn(true);

          // 3. Check reminders
          const remRes = await fetch('/api/reminders');
          if (remRes.ok) {
            const remData = await remRes.json();
            if (Array.isArray(remData.reminderEventIds) && !cancelled) {
              setHasReminder(remData.reminderEventIds.includes(id));
            }
          }

          // 4. Load saved card design
          const designRes = await fetch(`/api/events/${id}/card-design`);
          if (designRes.ok) {
            const designData = await designRes.json();
            if (designData.design && !cancelled) {
              setSelectedTheme(designData.design.theme || 'default');
              setStickers(designData.design.stickers || []);
              setDesignSaved(true);
            }
          }
        }
      } catch {
        if (!cancelled) setError('Failed to load event details');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEventData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Toggle Reminder with Optimistic UI & Rollback on failure
  async function toggleReminder() {
    if (!id) return;

    if (!isLoggedIn) {
      toast.add({
        title: 'Sign in required',
        description: 'Please sign in to save event reminders.',
        type: 'warning',
      });
      router.push(`/login?redirect=/events/${id}`);
      return;
    }

    const previousState = hasReminder;
    const nextState = !hasReminder;

    // 1. Immediate optimistic UI update
    setHasReminder(nextState);
    setReminderLoading(true);

    try {
      const method = previousState ? 'DELETE' : 'PUT';
      const res = await fetch(`/api/events/${id}/reminder`, { method });

      if (res.ok) {
        toast.add({
          title: nextState ? 'Reminder saved' : 'Reminder removed',
          description: nextState
            ? 'You will receive reminders for this event.'
            : 'Event removed from your reminders.',
          type: 'success',
        });
      } else {
        // Rollback
        setHasReminder(previousState);
        toast.add({
          title: 'Action failed',
          description: 'Could not update reminder. Action was rolled back.',
          type: 'error',
        });
      }
    } catch {
      // Rollback on network error
      setHasReminder(previousState);
      toast.add({
        title: 'Network error',
        description: 'Could not communicate with server. Reminder rolled back.',
        type: 'error',
      });
    } finally {
      setReminderLoading(false);
    }
  }

  // Card Designer helpers
  function addSticker(emoji: string) {
    if (stickers.length >= 3) {
      toast.add({
        title: 'Limit reached',
        description: 'You can add up to 3 stickers at a time.',
        type: 'warning',
      });
      return;
    }
    setStickers((prev) => [...prev, emoji]);
    setDesignSaved(false);
  }

  function removeSticker(index: number) {
    setStickers((prev) => prev.filter((_, i) => i !== index));
    setDesignSaved(false);
  }

  async function saveDesign() {
    if (!id) return;

    if (!isLoggedIn) {
      toast.add({
        title: 'Sign in required',
        description: 'Please log in to save your customized event card pass.',
        type: 'warning',
      });
      router.push(`/login?redirect=/events/${id}`);
      return;
    }

    setDesignSaving(true);
    try {
      const res = await fetch(`/api/events/${id}/card-design`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: selectedTheme, stickers }),
      });

      if (res.ok) {
        setDesignSaved(true);
        toast.add({
          title: 'Card design saved!',
          description: 'Your customized event pass has been persisted to your profile.',
          type: 'success',
        });
      } else {
        toast.add({
          title: 'Save failed',
          description: 'Could not save your design. Please try again.',
          type: 'error',
        });
      }
    } catch {
      toast.add({
        title: 'Network error',
        description: 'Failed to communicate with the server.',
        type: 'error',
      });
    } finally {
      setDesignSaving(false);
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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-xl font-bold text-white">Event Not Found</h2>
            <p className="text-sm text-zinc-400">
              {error || "The event you're looking for doesn't exist or is not available."}
            </p>
            <Link href="/events">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Events Board</span>
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const activeThemeObj = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      {/* ── SUB-HEADER NAVIGATION BAR ────────────────────────────────────── */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/events">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Events Board</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={toggleReminder}
            disabled={reminderLoading}
            className={`gap-1.5 text-xs transition-colors cursor-pointer ${
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
      </div>

      {/* ── MAIN CONTENT BODY ────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
        {/* Main Event Card */}
        <Card className="border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-2xl">
          {/* Hero Banner */}
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

            {/* Badges on Hero Banner */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-3 py-1 text-xs">
                {event.category}
              </Badge>
              <Badge variant="outline" className="bg-zinc-900/90 text-zinc-300 border-zinc-700/60 text-xs px-2.5 py-1 backdrop-blur">
                {event.city}
              </Badge>
            </div>

            {/* Title on Hero Banner */}
            <div className="absolute bottom-4 left-4 right-4 space-y-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Quick Highlights Grid */}
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

              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Location</div>
                  <div className="text-sm font-semibold text-white">{event.city}</div>
                </div>
              </div>

              {/* Price */}
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

            <Separator className="bg-zinc-800" />

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white">About This Event</h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── CARD DESIGNER SECTION (Section 3C Requirement) ──────────────── */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalize Your Experience</span>
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-400" />
                <span>Design Your Event Pass</span>
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Customize background themes and stickers. Saves live across browser refreshes!
            </p>
          </div>

          {/* Live Card Preview with Smooth Transition */}
          <div
            className={`relative rounded-2xl overflow-hidden p-6 sm:p-8 border transition-all duration-500 shadow-2xl ${activeThemeObj.bg}`}
          >
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-white/20 text-white font-semibold text-xs backdrop-blur border-transparent">
                {event.category}
              </Badge>
              <span className="text-xs font-mono text-white/70 uppercase tracking-widest">
                Community Pass
              </span>
            </div>

            <div className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
              {event.title}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/80 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatEventDate(event.dateTime)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.city}
              </span>
              <span className="font-bold text-white">
                {formatEventPrice(event.price)}
              </span>
            </div>

            {/* Stickers on the Live Card with Animation */}
            <div className="min-h-[44px] flex items-center gap-3 flex-wrap pt-2 border-t border-white/10">
              {stickers.length === 0 ? (
                <span className="text-xs text-white/50 italic">
                  Select up to 3 stickers below to decorate your pass...
                </span>
              ) : (
                stickers.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    className="text-3xl transition-transform duration-300 hover:scale-125 animate-bounce select-none"
                    style={{
                      animationDelay: `${i * 120}ms`,
                      animationDuration: '1s',
                      animationIterationCount: 1,
                    }}
                  >
                    {s}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Theme Picker */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              1. Choose Background Theme (3 Themes)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSelectedTheme(theme.id);
                      setDesignSaved(false);
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/30'
                        : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`w-full h-8 rounded-lg ${theme.preview} border border-white/20`} />
                    <span className={`text-xs font-medium ${isSelected ? 'text-emerald-400 font-bold' : 'text-zinc-400'}`}>
                      {theme.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticker Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                2. Add Stickers ({stickers.length}/3)
              </label>
              <span className="text-xs text-zinc-500">Click to add (max 3 at a time)</span>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {STICKER_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addSticker(emoji)}
                  disabled={stickers.length >= 3}
                  className="text-2xl p-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:border-emerald-500 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title={stickers.length >= 3 ? 'Remove a sticker first' : `Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Active Stickers (Removable) */}
          {stickers.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                3. Remove Stickers (Click ✕ to remove)
              </label>
              <div className="flex gap-2 flex-wrap">
                {stickers.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => removeSticker(i)}
                    className="flex items-center gap-1.5 text-xl px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer group"
                    title="Click to remove sticker"
                  >
                    <span>{s}</span>
                    <span className="text-xs text-zinc-500 group-hover:text-rose-400">✕</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save Design Button */}
          <div className="pt-2">
            <Button
              onClick={saveDesign}
              disabled={designSaving}
              className={`w-full h-11 text-sm font-semibold gap-2 transition-colors cursor-pointer ${
                designSaved
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {designSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Design...</span>
                </>
              ) : designSaved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Design Saved to Profile</span>
                </>
              ) : (
                <>
                  <Palette className="w-4 h-4" />
                  <span>{isLoggedIn ? 'Save Card Design' : 'Sign In to Save Design'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SingleEventDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <EventDetailContent />
    </Suspense>
  );
}
