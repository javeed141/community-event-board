'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import AdminNavbar from '@/components/admin/AdminNavbar';
import CreateEventModal from '@/components/admin/CreateEventModal';
import AdminEventsTable from '@/components/admin/AdminEventsTable';
import { AdminEvent } from '@/components/admin/types';

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

  // 3. Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // Handle Event Created
  const handleEventCreated = (newEvent: AdminEvent) => {
    setEvents((prev) => [newEvent, ...prev]);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* 1. ADMIN NAVBAR */}
      <AdminNavbar
        adminEmail={adminEmail}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. CREATE EVENT MODAL */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEventCreated={handleEventCreated}
      />

      {/* 3. MAIN CONTENT: EVENTS DIRECTORY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        <AdminEventsTable
          events={events}
          loading={loading}
          actionLoadingId={actionLoadingId}
          onToggleStatus={handleToggleStatus}
          now={now}
        />
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
