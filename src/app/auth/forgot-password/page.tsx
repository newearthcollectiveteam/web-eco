'use client';

import { useState } from 'react';
import { createClient } from '~/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
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
                We&apos;ve sent a password reset link to <strong>{email}</strong>.
                Please check your email and follow the instructions to reset your password.
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
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Enter your email address and we&apos;ll send you a link to reset your password
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#facf39] px-4 py-2 text-sm font-semibold text-black shadow-sm transition-all hover:bg-[#ffe067] focus:outline-none focus:ring-2 focus:ring-[#facf39]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-black"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/admin/login"
              className="text-sm font-medium text-[#facf39] transition-colors hover:text-[#ffe067]"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
