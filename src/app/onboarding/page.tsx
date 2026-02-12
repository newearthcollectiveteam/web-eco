"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/lib/auth/hooks";
import { createClient } from "~/lib/supabase/client";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auto-complete onboarding on page load
  useEffect(() => {
    const completeOnboarding = async () => {
      if (!user?.id) return;

      try {
        const supabase = createClient();

        // Just mark onboarding as completed
        const { error: updateError } = await supabase
          .from("web-eco_user_profile")
          .update({
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Profile update error:", updateError);
          setError("Failed to complete setup. Please try again.");
          setLoading(false);
          return;
        }

        // Redirect to home
        router.push("/");
        router.refresh();
      } catch (err) {
        console.error("Onboarding error:", err);
        setError("An unexpected error occurred. Please try again.");
        setLoading(false);
      }
    };

    void completeOnboarding();
  }, [user, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-8">
          <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Setup Error
              </h1>
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Setting up your account...
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            You'll be redirected to the hub in a moment
          </p>
        </div>
      </div>
    </div>
  );
}
