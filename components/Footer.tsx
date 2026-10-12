import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 py-8 px-4 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>Community Events Board &copy; 2026. Built with Next.js App Router, Tailwind CSS & MongoDB.</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <Link href="/events" className="hover:text-emerald-400 transition-colors">
            All Events
          </Link>
          <Link href="/user" className="hover:text-emerald-400 transition-colors">
            My Feed
          </Link>
          <Link href="/admin" className="hover:text-emerald-400 transition-colors">
            Admin
          </Link>
          <Link href="/login" className="hover:text-emerald-400 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}

