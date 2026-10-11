'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple validation checks
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Direct call to signup API (sets httpOnly cookie automatically)
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to register account.');
        return;
      }

      // Success -> navigate to user dashboard
      router.push('/user');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-zinc-950">
      <div className="w-full max-w-md">
        <Card className="border-zinc-800 bg-zinc-900/90 shadow-2xl">
          <CardHeader className="space-y-2 text-center p-6 sm:p-8 pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-1 text-emerald-400">
              <UserPlus className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold text-white tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              Sign up with your email to explore and personalize events
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 pt-2">
            {error && (
              <div className="mb-5 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field with clear label-to-input gap */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-medium text-zinc-200">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 px-3.5 text-sm"
                  required
                />
              </div>

              {/* Password Field with clear label-to-input gap */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-medium text-zinc-200">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="h-11 px-3.5 text-sm"
                  required
                />
              </div>

              {/* Confirm Password Field with clear label-to-input gap */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-medium text-zinc-200">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="h-11 px-3.5 text-sm"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold mt-2">
                {loading ? <Spinner />  : 'Create Account'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-zinc-800/80 p-5 text-sm text-zinc-400">
            <span>Already have an account?</span>{' '}
            <Link href="/login" className="ml-1 text-emerald-400 hover:underline font-medium">
              Log in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
