'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, PlusCircle, ArrowLeft, LogOut, Menu, X, User } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-900/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand / Admin Portal Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base text-white leading-none whitespace-nowrap truncate">
                Admin Portal
              </h1>
              {adminEmail && (
                <Badge
                  variant="outline"
                  className="hidden md:inline-flex text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-medium py-0 px-2 h-5"
                >
                  {adminEmail}
                </Badge>
              )}
            </div>
            <p className="hidden sm:block text-[11px] text-zinc-400 truncate mt-0.5">
              Manage community events and active status
            </p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <Link href="/user">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Visitor Site</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={onOpenCreateModal}
            className="gap-1.5 text-xs h-9 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm font-medium"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Event</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-1.5 text-xs h-9 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Mobile Actions: "Create" Button + Hamburger Menu */}
        <div className="flex sm:hidden items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={onOpenCreateModal}
            className="gap-1.5 text-xs h-8 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm font-medium"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg h-8 w-8"
            aria-label="Toggle admin navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-zinc-800 bg-zinc-950/98 px-4 py-3.5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-xl">
          {/* Admin Email Card */}
          {adminEmail && (
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs">
              <User className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Logged in as</span>
                <span className="text-zinc-200 font-medium truncate block">{adminEmail}</span>
              </div>
              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shrink-0">
                Admin
              </Badge>
            </div>
          )}

          {/* Action Links */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/user"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-center gap-1.5 cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Visitor Site</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="w-full text-xs h-9 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
