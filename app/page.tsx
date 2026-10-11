'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Sparkles,
  Heart,
  Palette,
  Bell,
  ShieldCheck,
  ArrowRight,
  LogIn,
  UserPlus,
  Compass,
  CheckCircle2,
  Users,
} from 'lucide-react';

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500/30">
      {/* 1. NAVIGATION HEADER */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">Community Events</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/30">
                Local Discoveries
              </span>
            </div>
          </div>

          {/* Quick Direct Actions */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-300 hover:text-white">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50">
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden py-20 px-4 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-900/40 via-zinc-950 to-zinc-950">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Local Community Happenings</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Connect, Discover & Personalize{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Community Events
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Your neighborhood hub for music festivals, skill workshops, food popups, sports matches, and kids activities. Set reminders and design customized event passes in seconds.
          </p>

          {/* Primary Call-to-Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-500 text-base shadow-xl shadow-emerald-950/50 h-12 px-6">
                <span>Join Community Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 border-zinc-700 hover:bg-zinc-800 text-base h-12 px-6">
                <LogIn className="w-4 h-4" />
                <span>Sign In to Your Account</span>
              </Button>
            </Link>
          </div>

          {/* Quick Direct Links for Easy Review Navigation */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
            <span>Quick review access:</span>
            <Link href="/user" className="text-zinc-400 hover:text-emerald-400 flex items-center gap-1 underline underline-offset-4">
              <Heart className="w-3 h-3 text-rose-400" />
              User Dashboard (/user)
            </Link>
            <span className="text-zinc-700">&bull;</span>
            <Link href="/admin" className="text-zinc-400 hover:text-emerald-400 flex items-center gap-1 underline underline-offset-4">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Admin Portal (/admin)
            </Link>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM HIGHLIGHTS / VALUE PROPOSITION */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Everything You Need to Never Miss Out
          </h2>
          <p className="text-sm text-zinc-400">
            Engineered for clean, fast community interaction with real-time feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 transition-all">
            <CardHeader className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Compass className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg text-white">Smart Discovery & Filters</CardTitle>
              <CardDescription className="text-sm text-zinc-400">
                Combine categories like Music and Food with cities and keywords. Always sorted nearest date first, excluding expired events automatically.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 2 */}
          <Card className="border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 transition-all">
            <CardHeader className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Heart className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg text-white">Personalized My Feed</CardTitle>
              <CardDescription className="text-sm text-zinc-400">
                Pick your favourite categories once. Your personalized feed keeps you updated only on the events that match what you love.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 3 */}
          <Card className="border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 transition-all">
            <CardHeader className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Palette className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg text-white">Interactive Card Designer</CardTitle>
              <CardDescription className="text-sm text-zinc-400">
                Design custom event cards with unique background themes and expressive stickers. Saved live to your profile across device refreshes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="max-w-5xl mx-auto px-4 pb-20 w-full">
        <div className="rounded-2xl border border-zinc-800 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 p-8 sm:p-12 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to explore what&apos;s happening around you?
          </h3>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto">
            Create an account in less than 30 seconds or sign in with the pre-seeded admin credentials to manage events.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-zinc-700">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-8 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Community Events Board &copy; 2026. Next.js App Router & Tailwind CSS.</span>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/login" className="hover:text-emerald-400">Login</Link>
            <Link href="/signup" className="hover:text-emerald-400">Register</Link>
            <Link href="/user" className="hover:text-emerald-400">User Hub</Link>
            <Link href="/admin" className="hover:text-emerald-400">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
