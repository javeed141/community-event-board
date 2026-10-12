'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Compass,
  Heart,
  ShieldCheck,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';

type UserSession = {
  id: string;
  email: string;
  role: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      router.push('/login');
      router.refresh();
    }
  };

  const navLinks = [
    { label: 'Discover Events', href: '/events', icon: Compass },
    { label: 'My Feed', href: user ? '/user' : '/login', icon: Heart },
    ...(user?.role === 'admin'
      ? [{ label: 'Admin Portal', href: '/admin', icon: ShieldCheck }]
      : []),
  ];

  return (
    <nav className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo - clean flex alignment and no text breaking on mobile */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm sm:text-base text-white tracking-tight leading-none">
            Community Events
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1.5 text-xs font-medium ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-950/30'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth Actions (Right) */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/user">
                <Badge
                  variant="outline"
                  className="bg-zinc-900 border-zinc-700 text-zinc-300 gap-1.5 py-1 px-2.5 hover:border-zinc-600 cursor-pointer"
                >
                  <User className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs truncate max-w-[140px]">{user.email}</span>
                </Badge>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Join Free</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg"
            aria-label="Toggle mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Perfectly Aligned Text & Items */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="leading-none">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2.5">
            {user ? (
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs text-zinc-300 font-medium truncate">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-xs text-rose-400 border-rose-500/30 hover:bg-rose-500/10 shrink-0 h-8 gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-xs h-9 justify-center gap-1.5 cursor-pointer">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full text-xs h-9 bg-emerald-600 hover:bg-emerald-500 text-white justify-center gap-1.5 cursor-pointer">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Join Free</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
