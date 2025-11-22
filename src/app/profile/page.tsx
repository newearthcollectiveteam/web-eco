"use client";

import { useAuth } from "~/lib/auth/hooks";
import { ProtectedRoute } from "~/components/auth/protected-route";
import { SignOutButton } from "~/components/auth/signout-button";
import Image from "next/image";
import { Mail, IdCard, Calendar, Shield, LogIn } from "lucide-react";
import { Badge } from "~/components/ui/badge";

function ProfileContent() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white px-4 py-12 dark:from-black dark:via-neutral-950 dark:to-black">
      <div className="mx-auto max-w-3xl">
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
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-800 dark:bg-black">
          <div className="mb-8 flex items-center justify-between border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <h2
              className="text-2xl font-bold text-black dark:text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Account Information
            </h2>
            <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
              {user.email_confirmed_at ? "Verified" : "Pending"}
            </Badge>
          </div>

          <div className="space-y-6">
            {/* Email */}
            <div className="flex items-start rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#facf39] to-[#f59e0b] shadow-sm">
                <Mail className="h-5 w-5 text-black" />
              </div>
              <div className="ml-4 flex-1">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Email Address
                </label>
                <p className="mt-1 text-base font-semibold text-black dark:text-white">
                  {user.email}
                </p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm">
                <IdCard className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  User ID
                </label>
                <p className="mt-1 font-mono text-sm text-neutral-600 dark:text-neutral-400">
                  {user.id}
                </p>
              </div>
            </div>

            {/* Account Created */}
            <div className="flex items-start rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Account Created
                </label>
                <p className="mt-1 text-base font-semibold text-black dark:text-white">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Last Sign In */}
            <div className="flex items-start rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
                <LogIn className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Last Sign In
                </label>
                <p className="mt-1 text-base font-semibold text-black dark:text-white">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "Never"}
                </p>
              </div>
            </div>

            {/* Email Verified Status */}
            {user.email_confirmed_at && (
              <div className="flex items-start rounded-lg border border-[#facf39]/20 bg-[#facf39]/5 p-4 dark:border-[#facf39]/30 dark:bg-[#facf39]/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#facf39] to-[#f59e0b] shadow-sm">
                  <Shield className="h-5 w-5 text-black" />
                </div>
                <div className="ml-4 flex-1">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Email Verified
                  </label>
                  <p className="mt-1 text-base font-semibold text-[#facf39]">
                    {new Date(user.email_confirmed_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Authentication Provider */}
          {user.app_metadata.provider && (
            <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Authentication Provider
              </h3>
              <Badge className="bg-[#facf39]/10 text-[#facf39] dark:bg-[#facf39]/20">
                {user.app_metadata.provider}
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
