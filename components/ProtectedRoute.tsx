'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // 1. If not logged in -> redirect to login
      if (!user) {
        router.push('/login');
      }
      // 2. If page requires admin and user is not admin -> redirect to home
      else if (adminOnly && user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, adminOnly, router]);

  // While checking session
  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not authorized (waiting for router.push to take effect)
  if (!user || (adminOnly && user.role !== 'admin')) {
    return null;
  }

  // Authorized: render the protected inner page content
  return <>{children}</>;
}
