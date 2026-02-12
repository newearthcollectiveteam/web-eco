"use client";

import { useAuth } from "~/lib/auth/hooks";
import { createClient } from "~/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { Clock, XCircle, Mail } from "lucide-react";
import { useEffect, useState } from "react";

export default function PendingApprovalPage() {
  const { user, signOut } = useAuth();
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void checkApprovalStatus();
  }, [user]);

  const checkApprovalStatus = async () => {
    if (!user) return;

    const supabase = createClient();
    const { data: profile } = await supabase
      .from("web-eco_user_profile")
      .select("approval_status")
      .eq("id", user.id)
      .single();

    setApprovalStatus((profile?.approval_status as string | null) ?? null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const isPending = approvalStatus === "pending";
  const isRejected = approvalStatus === "rejected";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-neutral-50 to-white px-4 py-12 dark:from-black dark:via-neutral-950 dark:to-black">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-lg dark:border-neutral-800 dark:bg-black">
          <div className="text-center">
            {/* Logo */}
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

            {/* Icon */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-50 dark:bg-yellow-900/20">
              {isPending ? (
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
            </div>

            {/* Title */}
            <h1
              className="text-3xl font-bold text-black dark:text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {isPending ? "Awaiting Approval" : "Application Rejected"}
            </h1>

            {/* Message */}
            {isPending && (
              <>
                <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                  Your account is currently pending admin approval.
                </p>

                <div className="mt-6 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    What&apos;s Next?
                  </h3>
                  <ul className="mt-3 space-y-2 text-left text-xs text-yellow-700 dark:text-yellow-300">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        An admin will review your request within 1-2 business
                        days
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        You&apos;ll receive an email when your account is
                        approved
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Click the verification link to activate your account
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Complete your profile and start exploring</span>
                    </li>
                  </ul>
                </div>

                <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                  Signed in as: <strong>{user?.email}</strong>
                </p>
              </>
            )}

            {isRejected && (
              <>
                <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                  Unfortunately, your application has been rejected.
                </p>

                <div className="mt-6 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-xs text-red-700 dark:text-red-300">
                    If you believe this was a mistake, please contact support at{" "}
                    <a
                      href="mailto:newearthcollectiveteam@gmail.com"
                      className="font-semibold underline"
                    >
                      newearthcollectiveteam@gmail.com
                    </a>
                  </p>
                </div>

                <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                  Signed in as: <strong>{user?.email}</strong>
                </p>
              </>
            )}

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => {
                  void signOut();
                }}
                className="w-full rounded-md bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
              >
                Sign Out
              </button>

              {isPending && (
                <button
                  onClick={checkApprovalStatus}
                  className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
                >
                  Check Status
                </button>
              )}
            </div>

            {/* Contact */}
            <div className="mt-6">
              <a
                href="mailto:newearthcollectiveteam@gmail.com"
                className="inline-flex items-center text-xs text-neutral-500 transition-colors hover:text-[#facf39] dark:text-neutral-400"
              >
                <Mail className="mr-1 h-3 w-3" />
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
