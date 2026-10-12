'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatEventDate, formatEventPrice } from '@/components/EventCard';
import { AdminEvent } from './types';

interface AdminEventsTableProps {
  events: AdminEvent[];
  loading: boolean;
  actionLoadingId: string | null;
  onToggleStatus: (eventId: string, currentStatus: boolean) => void;
  now: number | null;
}

export default function AdminEventsTable({
  events,
  loading,
  actionLoadingId,
  onToggleStatus,
  now,
}: AdminEventsTableProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter events by status & search query
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

  return (
    <div className="space-y-6">
      {/* ── 1. HEADER & CONTROLS TOOLBAR ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">All Events Directory</h2>
          <p className="text-xs text-zinc-400">
            Admins can view all events (including past and inactive ones) and toggle their Active status.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs w-full sm:w-60 bg-zinc-900 border-zinc-800 placeholder:text-zinc-500 rounded-lg focus:ring-emerald-500/20 focus:border-emerald-500/50"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            {(['all', 'active', 'inactive'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`text-xs px-3.5 py-1.5 rounded-md font-medium capitalize cursor-pointer transition-colors ${
                  filterStatus === tab
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. DATA TABLE WITH SENIOR-LEVEL SPACING & PADDING ─────────── */}
      <div className="border border-zinc-800/90 rounded-2xl overflow-hidden bg-zinc-900/40 shadow-xl">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Spinner />
            <span className="text-xs text-zinc-400">Loading admin events directory...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-16 text-center space-y-2.5">
            <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
            <div className="text-sm font-semibold text-zinc-200">No events found</div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? 'No events match your current filter criteria. Try resetting your search or tabs.'
                : 'Get started by creating your first community event using the "Create Event" button above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table Header */}
              <thead className="bg-zinc-900/90 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                <tr>
                  <th scope="col" className="py-4 px-6 min-w-[280px]">
                    Event Details
                  </th>
                  <th scope="col" className="py-4 px-5 hidden sm:table-cell min-w-[120px]">
                    Category
                  </th>
                  <th scope="col" className="py-4 px-5 hidden md:table-cell min-w-[120px]">
                    City
                  </th>
                  <th scope="col" className="py-4 px-5 hidden lg:table-cell min-w-[160px]">
                    Date & Time
                  </th>
                  <th scope="col" className="py-4 px-5 min-w-[100px]">
                    Price
                  </th>
                  <th scope="col" className="py-4 px-5 min-w-[110px]">
                    Status
                  </th>
                  <th scope="col" className="py-4 px-6 text-right min-w-[140px]">
                    Action
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-zinc-800/70 text-sm">
                {filteredEvents.map((ev) => {
                  const isPending = actionLoadingId === ev._id;
                  const isPast = now ? new Date(ev.dateTime).getTime() < now : false;

                  return (
                    <tr
                      key={ev._id}
                      className={`hover:bg-zinc-850/60 transition-colors group ${
                        !ev.isActive ? 'bg-zinc-950/30' : ''
                      }`}
                    >
                      {/* Event Details Cell */}
                      <td className="py-5 px-6 align-middle">
                        <div className="space-y-1.5 max-w-md">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                              {ev.title}
                            </span>
                            {isPast && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/30 font-medium shrink-0"
                              >
                                Past
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-1 leading-relaxed">
                            {ev.description}
                          </p>
                        </div>
                      </td>

                      {/* Category Cell */}
                      <td className="py-5 px-5 hidden sm:table-cell align-middle">
                        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-md bg-zinc-800/90 text-rose-300 border border-zinc-700/70 whitespace-nowrap">
                          {ev.category}
                        </span>
                      </td>

                      {/* City Cell */}
                      <td className="py-5 px-5 hidden md:table-cell text-zinc-300 text-xs font-medium align-middle whitespace-nowrap">
                        {ev.city}
                      </td>

                      {/* Date & Time Cell */}
                      <td className="py-5 px-5 hidden lg:table-cell text-zinc-400 text-xs align-middle whitespace-nowrap">
                        {formatEventDate(ev.dateTime)}
                      </td>

                      {/* Price Cell */}
                      <td className="py-5 px-5 align-middle whitespace-nowrap">
                        <span className="font-semibold text-white text-sm">
                          {formatEventPrice(ev.price)}
                        </span>
                      </td>

                      {/* Status Cell */}
                      <td className="py-5 px-5 align-middle whitespace-nowrap">
                        {ev.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 font-medium bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Action Cell */}
                      <td className="py-5 px-6 text-right align-middle whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => onToggleStatus(ev._id, ev.isActive)}
                          className={`h-8 px-3.5 text-xs font-medium cursor-pointer transition-all inline-flex items-center justify-center ${
                            ev.isActive
                              ? 'text-zinc-300 border-zinc-700 hover:text-rose-400 hover:border-rose-900 hover:bg-rose-950/20'
                              : 'text-emerald-400 border-emerald-900/80 hover:bg-emerald-950/40 hover:border-emerald-700'
                          }`}
                        >
                          {isPending ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                              <span>Updating...</span>
                            </div>
                          ) : ev.isActive ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                              <span>Activate</span>
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
  );
}
