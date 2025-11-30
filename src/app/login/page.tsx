"use client";

import { useState, Suspense } from "react";
import { createClient } from "~/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        const domainParam = searchParams.get("domain")?.toLowerCase() || "";
        const nextParam = searchParams.get("next");
        const hostname =
          typeof window !== "undefined"
            ? window.location.hostname.toLowerCase()
            : "";

        const isTest =
          hostname.includes("test.joinnewearthcollective.com") ||
          domainParam.includes("test.joinnewearthcollective.com") ||
          domainParam === "test";

        // Always return to the test hub unless an explicit next is provided
        const redirectTarget =
          nextParam || "/?domain=test.joinnewearthcollective.com";

        router.push(redirectTarget);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

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
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Sign in to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
                  className="block w-full rounded-md border border-neutral-300 bg-white py-2 pr-3 pl-10 shadow-sm transition-colors focus:border-[#facf39] focus:ring-2 focus:ring-[#facf39]/20 focus:outline-none sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-[#facf39]"
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-neutral-300 bg-white py-2 pr-3 pl-10 shadow-sm transition-colors focus:border-[#facf39] focus:ring-2 focus:ring-[#facf39]/20 focus:outline-none sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-[#facf39]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-[#facf39] transition-colors hover:text-[#ffe067]"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#facf39] px-4 py-2 text-sm font-semibold text-black shadow-sm transition-all hover:bg-[#ffe067] focus:ring-2 focus:ring-[#facf39]/50 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-black"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-[#facf39] transition-colors hover:text-[#ffe067]"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
