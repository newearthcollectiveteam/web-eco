"use client";

import { useState, Suspense } from "react";
import { createClient } from "~/lib/supabase/client";
import Image from "next/image";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { api } from "~/trpc/react";

type Mode = "signin" | "claim-form" | "claim-check" | "email-sent";

function ShaderBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <iframe
        src="/admin/shaders/flower-of-life/embed"
        className="h-full w-full border-0 opacity-20"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}

function NecLogo() {
  return (
    <div className="mb-6 inline-flex items-center justify-center">
      <div className="relative h-14 w-14">
        <Image
          src="/brand/symbol.svg"
          alt="New Earth Collective"
          fill
          className="object-contain drop-shadow-lg"
        />
      </div>
    </div>
  );
}

function LoginPageContent() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [claimName, setClaimName] = useState<string | null>(null);

  const checkEmailQuery = api.auth.checkEmailForClaim.useQuery(
    { email },
    { enabled: false }
  );

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      // Full page navigation ensures auth cookies are sent with the request
      window.location.href = "/admin";
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
      } else {
        setMode("email-sent");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setIsLoading(true);
    setError(null);
    const { data } = await checkEmailQuery.refetch();
    setIsLoading(false);
    if (data?.canClaim) {
      setClaimName(data.name ?? null);
      setMode("claim-check");
    } else if (data?.exists) {
      setError("This account is already active. Please sign in.");
    } else {
      setError(
        "No account found for this email. Contact the team to get added."
      );
    }
  };

  const handleClaimAccount = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
        },
      });

      if (otpError) {
        setError(otpError.message);
        setIsLoading(false);
        return;
      }

      setMode("email-sent");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Email sent confirmation (shared by forgot-password and claim flows)
  if (mode === "email-sent") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
        <ShaderBackground />
        <div className="relative z-10 w-full max-w-md">
          <div
            className="rounded-xl border bg-white/5 p-8 backdrop-blur-md"
            style={{
              borderColor: "rgba(250, 207, 57, 0.3)",
            }}
          >
            <div className="text-center">
              <NecLogo />
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(250, 207, 57, 0.1)" }}
              >
                <Mail className="h-8 w-8 text-[#FACF39]" />
              </div>
              <h1
                className="mb-2 text-2xl font-bold text-white"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Check Your Email
              </h1>
              <p className="mb-6 text-sm text-neutral-400">
                We sent a link to <span className="text-white">{email}</span>.
                Open it on this device to continue.
              </p>
              <button
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className="text-sm font-medium text-[#FACF39] transition-colors hover:text-[#ffe067] hover:underline"
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Claim account confirmation — "Welcome, {name}!"
  if (mode === "claim-check") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
        <ShaderBackground />
        <div className="relative z-10 w-full max-w-md">
          <div
            className="rounded-xl border bg-white/5 p-8 backdrop-blur-md"
            style={{
              borderColor: "rgba(250, 207, 57, 0.3)",
            }}
          >
            <div className="text-center">
              <NecLogo />
              <h1
                className="mb-2 text-2xl font-bold text-white"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Welcome{claimName ? `, ${claimName}` : ""}!
              </h1>
              <p className="mb-6 text-sm text-neutral-400">
                Your account is ready to be activated. We&apos;ll send you a
                magic link to set up your password.
              </p>

              {error && (
                <div className="mb-4 rounded-md border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                onClick={handleClaimAccount}
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-md bg-[#FACF39] px-4 py-3 text-sm font-semibold text-black shadow-sm transition-all hover:bg-[#ffe067] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Magic Link
              </button>

              <div className="mt-4">
                <button
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                  }}
                  className="text-sm text-neutral-400 transition-colors hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Claim account form — email only
  if (mode === "claim-form") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
        <ShaderBackground />
        <div className="relative z-10 w-full max-w-md">
          <div
            className="rounded-xl border bg-white/5 p-8 backdrop-blur-md"
            style={{
              borderColor: "rgba(250, 207, 57, 0.3)",
            }}
          >
            <div className="text-center">
              <NecLogo />
              <h1
                className="mb-2 text-2xl font-bold text-white"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Claim Your Account
              </h1>
              <p className="mb-8 text-sm text-neutral-400">
                Enter the email address your account was created with
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckEmail} className="space-y-4">
              <div>
                <label
                  htmlFor="claim-email"
                  className="mb-2 block text-sm font-medium text-neutral-300"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-neutral-500" />
                  </div>
                  <input
                    type="email"
                    id="claim-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border bg-white/5 py-3 pr-4 pl-10 text-white placeholder-neutral-500 transition-colors focus:border-[#FACF39] focus:ring-2 focus:ring-[#FACF39]/20 focus:outline-none"
                    style={{ borderColor: "rgba(250, 207, 57, 0.3)" }}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-md bg-[#FACF39] px-4 py-3 text-sm font-semibold text-black shadow-sm transition-all hover:bg-[#ffe067] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-neutral-400">
              Already have a password?{" "}
              <button
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className="font-medium text-[#FACF39] transition-colors hover:text-[#ffe067] hover:underline"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sign in form (default)
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <ShaderBackground />
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-xl border bg-white/5 p-8 backdrop-blur-md"
          style={{
            borderColor: "rgba(250, 207, 57, 0.3)",
          }}
        >
          <div className="mb-8 text-center">
            <NecLogo />
            <h1
              className="text-2xl font-bold text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Team Login
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Sign in to access the admin hub
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="block w-full rounded-md border bg-white/5 py-3 pr-4 pl-10 text-white placeholder-neutral-500 transition-colors focus:border-[#FACF39] focus:ring-2 focus:ring-[#FACF39]/20 focus:outline-none"
                  style={{ borderColor: "rgba(250, 207, 57, 0.3)" }}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="block w-full rounded-md border bg-white/5 py-3 pr-12 pl-10 text-white placeholder-neutral-500 transition-colors focus:border-[#FACF39] focus:ring-2 focus:ring-[#FACF39]/20 focus:outline-none"
                  style={{ borderColor: "rgba(250, 207, 57, 0.3)" }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-[#FACF39] transition-colors hover:text-[#ffe067] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-md bg-[#FACF39] px-4 py-3 text-sm font-semibold text-black shadow-sm transition-all hover:bg-[#ffe067] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-400">
            First time here?{" "}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode("claim-form");
              }}
              className="font-medium text-[#FACF39] transition-colors hover:text-[#ffe067] hover:underline"
            >
              Claim your account
            </button>
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
