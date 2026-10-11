'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  PlusCircle,
  Calendar,
  MapPin,
  Tag,
  IndianRupee,
  Eye,
  EyeOff,
  Search,
  ArrowLeft,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const CATEGORIES = ['Music', 'Workshop', 'Food', 'Sports', 'Kids'];

export default function AdminPage() {
  // Show / Hide create event form modal or section
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // New Event Form State Skeleton
  const [formData, setFormData] = useState({
    title: '',
    category: 'Music',
    city: '',
    dateTime: '',
    price: '',
    description: '',
    imageUrl: '',
    isActive: true,
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* 1. ADMIN HEADER */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-zinc-400">Manage community events and statuses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Visitor Site</span>
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="gap-1.5 text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{showCreateForm ? 'Close Form' : 'Create New Event'}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1 space-y-8">
        {/* 2. CREATE EVENT SECTION (TOGGLEABLE) */}
        {showCreateForm && (
          <Card className="border-emerald-500/30 bg-zinc-900/90 shadow-2xl animate-in fade-in duration-200">
            <CardHeader className="border-b border-zinc-800/80 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                <PlusCircle className="w-5 h-5" />
                <span>Create a New Community Event</span>
              </CardTitle>
              <CardDescription>
                Fill in the details below. Required fields include Title, Category, City, Date & Time, Price, Image URL, and Description.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Event Title *
                  </label>
                  <Input
                    placeholder="e.g. Coimbatore Traditional Food Carnival"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-zinc-700 bg-zinc-900 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    City *
                  </label>
                  <Input
                    placeholder="e.g. Coimbatore"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                {/* Date & Time Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Date & Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Price (₹ INR) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0 for Free event"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Banner Image URL *
                  </label>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                    Event Description *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details about the event, what visitors can expect, venue instructions, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Active Status Switch */}
                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm text-zinc-300 cursor-pointer select-none">
                    Publish as <strong>Active</strong> immediately (uncheck to save as Inactive draft)
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>Save Event</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 3. EVENT MANAGEMENT & STATUS TOGGLE TABLE */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">All Events Directory</h2>
              <p className="text-xs text-zinc-400">
                Admins can view all events (including past and inactive ones) and toggle their Active status.
              </p>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
              {(['all', 'active', 'inactive'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterStatus(tab)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium capitalize cursor-pointer transition-colors ${
                    filterStatus === tab
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Events Table Skeleton */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-4">Event Details</th>
                  <th className="p-4 hidden sm:table-cell">Category</th>
                  <th className="p-4 hidden md:table-cell">City</th>
                  <th className="p-4 hidden lg:table-cell">Date & Time</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {/* Row 1 - Active Event */}
                <tr className="hover:bg-zinc-900/60 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-white">Indie Rock Night Live</div>
                    <div className="text-xs text-zinc-400 line-clamp-1">Bangalore &bull; Top indie band concert</div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-xs px-2.5 py-1 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                      Music
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-zinc-300">Bangalore</td>
                  <td className="p-4 hidden lg:table-cell text-zinc-300 text-xs">Sat, 18 Oct, 6:30 PM</td>
                  <td className="p-4 font-medium text-white">₹499</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-zinc-300 hover:text-rose-400 hover:border-rose-900"
                    >
                      <EyeOff className="w-3.5 h-3.5 mr-1" /> Deactivate
                    </Button>
                  </td>
                </tr>

                {/* Row 2 - Inactive Event */}
                <tr className="hover:bg-zinc-900/60 transition-colors bg-zinc-950/30">
                  <td className="p-4">
                    <div className="font-semibold text-zinc-400">Clay Pottery Masterclass</div>
                    <div className="text-xs text-zinc-500 line-clamp-1">Coimbatore &bull; Inactive draft</div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-xs px-2.5 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Workshop
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-zinc-400">Coimbatore</td>
                  <td className="p-4 hidden lg:table-cell text-zinc-500 text-xs">Sun, 19 Oct, 10:00 AM</td>
                  <td className="p-4 font-medium text-zinc-400">₹850</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                      <XCircle className="w-3.5 h-3.5" /> Inactive
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-emerald-400 border-emerald-900 hover:bg-emerald-950/40"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Activate
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

