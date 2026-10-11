'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from "@/components/ui/toast"
export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Quick fill for testing predefined admin
    const handleFillAdmin = () => {
        setEmail('admin@community.com');
        setPassword('adminpassword123');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Simple validation
        if (!email.trim() || !password.trim()) {
            setError('Please fill in both email and password.');
            return;
        }

        setLoading(true);

        try {
            // Direct call to login API (sets httpOnly cookie automatically)
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed. Please check your credentials.');
                return;
            }
            toast.add({
                title: "Success",
                description: "Login successful! Redirecting...",
            })
            // Route based on role returned from API
            if (data.user?.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/user');
            }
            router.refresh();
        } catch {
            setError('Network error. Please try again.');
            toast.add({
                title: "Network error",
                description: "Network error. Please try again",
            })
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
                            <LogIn className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white tracking-tight">Welcome Back</CardTitle>
                        <CardDescription className="text-zinc-400 text-sm">
                            Enter your email and password to log in
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
                                    placeholder="••••••••"
                                    className="h-11 px-3.5 text-sm"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold mt-2">
                                {loading ? <Spinner /> : 'Log In'}
                            </Button>
                        </form>

                        {/* Quick helper for reviewer */}
                        <div className="mt-6 pt-5 border-t border-zinc-800/80">
                            <button
                                type="button"
                                onClick={handleFillAdmin}
                                className="w-full flex items-center justify-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 py-2.5 px-3 rounded-lg border border-emerald-900/60 transition-colors cursor-pointer"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>Fill Admin Credentials (Demo)</span>
                            </button>
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-center border-t border-zinc-800/80 p-5 text-sm text-zinc-400">
                        <span>Don&apos;t have an account?</span>{' '}
                        <Link href="/signup" className="ml-1 text-emerald-400 hover:underline font-medium">
                            Sign up
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
