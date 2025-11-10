'use client';

import { useAuth } from '~/lib/auth/hooks';
import { ProtectedRoute } from '~/components/auth/protected-route';
import { SignOutButton } from '~/components/auth/signout-button';
import Link from 'next/link';
import Image from 'next/image';
import { User, Shield, Clock, Key, Home } from 'lucide-react';
import { Badge } from '~/components/ui/badge';

function AdminContent() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white px-4 py-12 dark:from-black dark:via-neutral-950 dark:to-black">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center justify-center">
            <div className="relative h-20 w-20">
              <Image
                src="/brand/symbol.svg"
                alt="New Earth Collective"
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <h1
            className="mb-4 text-4xl font-bold text-black dark:text-white"
            style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}
          >
            Admin Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Welcome back, <strong>{user.email}</strong>
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
              {user.email_confirmed_at ? 'Verified Account' : 'Pending Verification'}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#facf39]/10 dark:border-neutral-800 dark:bg-black">
            <div className="flex items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#facf39] to-[#f59e0b] shadow-lg">
                <User className="h-7 w-7 text-black" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Account
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Active
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#facf39]/10 dark:border-neutral-800 dark:bg-black">
            <div className="flex items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Status
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {user.email_confirmed_at ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className="group rounded-xl border border-neutral-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#facf39]/10 dark:border-neutral-800 dark:bg-black">
            <div className="flex items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  Last Sign In
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-800 dark:bg-black">
          <h2
            className="mb-6 text-2xl font-bold text-black dark:text-white"
            style={{ fontFamily: 'Airwaves, sans-serif', letterSpacing: '0.05em' }}
          >
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/profile"
              className="group flex items-center rounded-lg border border-[#facf39]/20 bg-[#facf39]/5 p-4 transition-all hover:border-[#facf39] hover:bg-[#facf39]/10 dark:bg-[#facf39]/10 dark:hover:bg-[#facf39]/20"
            >
              <User className="h-6 w-6 text-[#facf39]" />
              <span className="ml-3 text-sm font-medium text-black dark:text-white">
                View Profile
              </span>
            </Link>

            <Link
              href="/auth/reset-password"
              className="group flex items-center rounded-lg border border-neutral-200 p-4 transition-all hover:border-[#facf39] hover:bg-[#facf39]/5 dark:border-neutral-700 dark:hover:border-[#facf39]"
            >
              <Key className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              <span className="ml-3 text-sm font-medium text-black dark:text-white">
                Change Password
              </span>
            </Link>

            <Link
              href="/"
              className="group flex items-center rounded-lg border border-neutral-200 p-4 transition-all hover:border-[#facf39] hover:bg-[#facf39]/5 dark:border-neutral-700 dark:hover:border-[#facf39]"
            >
              <Home className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              <span className="ml-3 text-sm font-medium text-black dark:text-white">
                Go to Homepage
              </span>
            </Link>
          </div>

          <div className="mt-6 flex justify-end">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  );
}
