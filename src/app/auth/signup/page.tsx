'use client';

import { useState } from 'react';
import { createClient } from '~/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, CheckCircle } from 'lucide-react';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push('/admin');
        router.refresh();
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-white px-4 py-12 dark:from-black dark:via-neutral-950 dark:to-black">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-800 dark:bg-black">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#facf39]/10">
                <CheckCircle className="h-8 w-8 text-[#facf39]" />
              </div>
              <h2
                className="text-2xl font-bold text-black dark:text-white"
                style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}
              >
                Check your email
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                We&apos;ve sent you a confirmation link to <strong>{email}</strong>.
                Please check your email and click the link to verify your account.
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/login"
                  className="text-sm font-medium text-[#facf39] transition-colors hover:text-[#ffe067]"
                >
                  Return to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-white px-4 py-12 dark:from-black dark:via-neutral-950 dark:to-black">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-800 dark:bg-black">
          <div className="mb-8 text-center">
            <div className="mb-6 inline-flex items-center justify-center">
              <div className="relative h-16 w-16">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </div>
            <h1
              className="text-3xl font-bold text-black dark:text-white"
              style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}
            >
              Create an account
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Sign up to get started
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-500/20 bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 shadow-sm transition-colors focus:border-[#facf39] focus:outline-none focus:ring-2 focus:ring-[#facf39]/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-[#facf39] sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 shadow-sm transition-colors focus:border-[#facf39] focus:outline-none focus:ring-2 focus:ring-[#facf39]/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-[#facf39] sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Confirm password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border border-neutral-300 bg-white py-2 pl-10 pr-3 shadow-sm transition-colors focus:border-[#facf39] focus:outline-none focus:ring-2 focus:ring-[#facf39]/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-[#facf39] sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#facf39] px-4 py-2 text-sm font-semibold text-black shadow-sm transition-all hover:bg-[#ffe067] focus:outline-none focus:ring-2 focus:ring-[#facf39]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-black"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Already have an account?{' '}
              <Link
                href="/admin/login"
                className="font-medium text-[#facf39] transition-colors hover:text-[#ffe067]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
