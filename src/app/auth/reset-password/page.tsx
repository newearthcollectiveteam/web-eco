"use client";

import { useState, useEffect } from "react";
import { createClient } from "~/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

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
    <div className="mb-4 inline-flex items-center justify-center">
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email ?? null);
    };

    void checkSession();
  }, [router]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1500);
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
        <ShaderBackground />
        <div className="relative z-10 w-full max-w-md">
          <div
            className="rounded-xl border bg-white/5 p-8 text-center backdrop-blur-md"
            style={{ borderColor: "rgba(250, 207, 57, 0.3)" }}
          >
            <NecLogo />
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(250, 207, 57, 0.1)" }}
            >
              <CheckCircle className="h-8 w-8 text-[#FACF39]" />
            </div>
            <h1
              className="mb-2 text-2xl font-bold text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Password Set!
            </h1>
            <p className="text-sm text-neutral-400">
              Redirecting to the admin hub...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <ShaderBackground />
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-xl border bg-white/5 p-8 backdrop-blur-md"
          style={{ borderColor: "rgba(250, 207, 57, 0.3)" }}
        >
          <div className="text-center">
            <NecLogo />
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(250, 207, 57, 0.1)" }}
            >
              <Lock className="h-8 w-8 text-[#FACF39]" />
            </div>
            <h1
              className="mb-2 text-2xl font-bold text-white"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              Set Your Password
            </h1>
            <p className="mb-8 text-sm text-neutral-400">
              {userEmail ? (
                <>
                  Create a password for{" "}
                  <span className="text-white">{userEmail}</span>
                </>
              ) : (
                "Create a secure password for your account"
              )}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border bg-white/5 px-4 py-3 pr-12 text-white placeholder-neutral-500 transition-colors focus:border-[#FACF39] focus:ring-2 focus:ring-[#FACF39]/20 focus:outline-none"
                  style={{ borderColor: "rgba(250, 207, 57, 0.3)" }}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-neutral-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border bg-white/5 px-4 py-3 pr-12 text-white placeholder-neutral-500 transition-colors focus:border-[#FACF39] focus:ring-2 focus:ring-[#FACF39]/20 focus:outline-none"
                  style={{ borderColor: "rgba(250, 207, 57, 0.3)" }}
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
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
              Set Password
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
