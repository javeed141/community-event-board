'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShieldCheck,
  PlusCircle,
  Eye,
  EyeOff,
  Search,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  LogOut,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatEventDate, formatEventPrice } from '@/components/EventCard';
import { toast } from '@/components/ui/toast';

type AdminEvent = {
  _id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  dateTime: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
};

const CATEGORIES = ['Music', 'Workshop', 'Food', 'Sports', 'Kids'];

function AdminContent() {
  const router = useRouter();

  // 1. Auth & Admin Verification
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  // 2. Events & Loading State
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // 3. Filters & UI State
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 4. Form State
  const initialFormState = {
    title: '',
    category: 'Music',
    city: '',
    dateTime: '',
    price: '',
    description: '',
    imageUrl: '',
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  // Check admin auth on mount
  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        const data = await res.json();
        if (data.user?.role !== 'admin') {
          router.replace('/user');
          return;
        }
        setAdminEmail(data.user.email);
        setCheckingAuth(false);
      } catch {
        router.replace('/login');
      }
    }

    checkAdminAuth();
  }, [router]);

  // Load events once authenticated
  useEffect(() => {
    if (checkingAuth) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/admin/events');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setEvents(data.events || []);
            setNow(Date.now());
          }
        } else {
          toast.add({
            title: 'Error',
            description: 'Failed to fetch admin events',
            type: 'error',
          });
        }
      } catch {
        toast.add({
          title: 'Error',
          description: 'Network error fetching events',
          type: 'error',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [checkingAuth]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/login');
    }
  };

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (eventId: string, currentStatus: boolean) => {
    setActionLoadingId(eventId);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? { ...e, isActive: !currentStatus } : e))
        );
        toast.add({
          title: 'Status Updated',
          description: data.message || `Event set to ${!currentStatus ? 'Active' : 'Inactive'}`,
          type: 'success',
        });
      } else {
        const err = await res.json();
        toast.add({
          title: 'Action Failed',
          description: err.error || 'Failed to update event status',
          type: 'error',
        });
      }
    } catch {
      toast.add({
        title: 'Network Error',
        description: 'Could not contact server to update status',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Create Event Submission
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate
    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      !formData.city.trim() ||
      !formData.dateTime.trim() ||
      formData.price === '' ||
      !formData.imageUrl.trim() ||
      !formData.description.trim()
    ) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const numPrice = Number(formData.price);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError('Price must be a valid non-negative number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: numPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to create event');
        return;
      }

      toast.add({
        title: 'Event Created',
        description: `"${formData.title}" was created successfully.`,
        type: 'success',
      });

      // Reset form and add new event to list
      setFormData(initialFormState);
      setIsCreateModalOpen(false);
      setEvents((prev) => [data.event, ...prev]);
    } catch {
      setFormError('Network error while creating event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered events
  const filteredEvents = events.filter((ev) => {
    // Status tab filter
    if (filterStatus === 'active' && !ev.isActive) return false;
    if (filterStatus === 'inactive' && ev.isActive) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchCity = ev.city.toLowerCase().includes(q);
      const matchCat = ev.category.toLowerCase().includes(q);
      const matchDesc = ev.description.toLowerCase().includes(q);
      return matchTitle || matchCity || matchCat || matchDesc;
    }

    return true;
  });

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* 1. ADMIN HEADER */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-base text-white leading-tight">Admin Portal</h1>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-medium">
                  {adminEmail}
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 truncate">Manage community events and active status</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <Link href="/user">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Visitor Site</span>
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => {
                setFormError(null);
                setIsCreateModalOpen(true);
              }}
              className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 2. CREATE EVENT MODAL (SHADCN DIALOG) */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 text-zinc-100 p-6 shadow-2xl">
          <DialogHeader className="pb-2 border-b border-zinc-800/80">
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-emerald-400">
              <PlusCircle className="w-5 h-5" />
              <span>Create a New Community Event</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Fill in the details below. Required fields include Title, Category, City, Date & Time, Price, Image URL, and Description.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="my-2 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Event Title *
              </label>
              <Input
                placeholder="e.g. Coimbatore Traditional Food Carnival"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
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
                className="w-full h-10 px-3 rounded-lg border border-zinc-700 bg-zinc-950 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
                required
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
                required
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
                required
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
                required
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
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
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
                onClick={() => setIsCreateModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Save Event</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* 3. EVENT MANAGEMENT & STATUS TOGGLE TABLE */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">All Events Directory</h2>
              <p className="text-xs text-zinc-400">
                Admins can view all events (including past and inactive ones) and toggle their Active status.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search in Admin */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs w-full sm:w-56 bg-zinc-900 border-zinc-800"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
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
          </div>

          {/* Events Table */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
                <Spinner />
                <span className="text-xs">Loading admin events directory...</span>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
                <div className="text-sm font-semibold text-zinc-300">No events found</div>
                <p className="text-xs text-zinc-500">
                  {searchQuery || filterStatus !== 'all'
                    ? 'No events match your current filter criteria.'
                    : 'Get started by creating your first community event above.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                    {filteredEvents.map((ev) => {
                      const isPending = actionLoadingId === ev._id;
                      const isPast = now ? new Date(ev.dateTime).getTime() < now : false;

                      return (
                        <tr
                          key={ev._id}
                          className={`hover:bg-zinc-900/60 transition-colors ${
                            !ev.isActive ? 'bg-zinc-950/40 text-zinc-400' : ''
                          }`}
                        >
                          <td className="p-4">
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{ev.title}</span>
                              {isPast && (
                                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                                  Past
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-zinc-400 line-clamp-1">{ev.description}</div>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            <span className="text-xs px-2.5 py-1 rounded bg-zinc-800 text-rose-400 border border-zinc-700">
                              {ev.category}
                            </span>
                          </td>
                          <td className="p-4 hidden md:table-cell text-zinc-300">{ev.city}</td>
                          <td className="p-4 hidden lg:table-cell text-zinc-300 text-xs">
                            {formatEventDate(ev.dateTime)}
                          </td>
                          <td className="p-4 font-medium text-white">{formatEventPrice(ev.price)}</td>
                          <td className="p-4">
                            {ev.isActive ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                                <XCircle className="w-3.5 h-3.5" /> Inactive
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleToggleStatus(ev._id, ev.isActive)}
                              className={`h-8 w-28 text-xs cursor-pointer justify-center transition-all ${
                                ev.isActive
                                  ? 'text-zinc-300 hover:text-rose-400 hover:border-rose-900'
                                  : 'text-emerald-400 border-emerald-900 hover:bg-emerald-950/40'
                              }`}
                            >
                              {isPending ? (
                                <div className="flex items-center justify-center w-full gap-1.5">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                                  <span>{ev.isActive ? 'Updating...' : 'Updating...'}</span>
                                </div>
                              ) : ev.isActive ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 mr-1" /> Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 mr-1" /> Activate
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
