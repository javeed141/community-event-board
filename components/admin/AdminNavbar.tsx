'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, PlusCircle, ArrowLeft, LogOut } from 'lucide-react';

interface AdminNavbarProps {
  adminEmail: string;
  onOpenCreateModal: () => void;
  onLogout: () => void;
}

export default function AdminNavbar({
  adminEmail,
  onOpenCreateModal,
  onLogout,
}: AdminNavbarProps) {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Admin Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-base text-white leading-tight">Admin Portal</h1>
              {adminEmail && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-medium"
                >
                  {adminEmail}
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              Manage community events and active status
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <Link href="/user">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Visitor Site</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={onOpenCreateModal}
            className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Event</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
