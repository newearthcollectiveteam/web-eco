"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [unsubscribeType, setUnsubscribeType] = useState<string>("all");
  const [homeLink, setHomeLink] = useState("/global");

  // Set correct home link based on environment
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hostname = window.location.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocal) {
      setHomeLink("/global?domain=launch.joinnewearthcollective.com");
    } else {
      setHomeLink("/global");
    }
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");
    const type = searchParams.get("type") || "all";
    setUnsubscribeType(type);

    if (!token) {
      setStatus("error");
      setMessage(
        "Invalid unsubscribe link. Please use the link from your email."
      );
      return;
    }

    // Call unsubscribe API
    fetch(`/api/unsubscribe?token=${token}&type=${type}`)
      .then(async (response) => {
        if (response.ok) {
          setStatus("success");
          setMessage(getSuccessMessage(type));
        } else {
          setStatus("error");
          const data = await response.json().catch(() => ({}));
          setMessage(
            (data as { error?: string }).error ||
              "Failed to process your request. Please try again."
          );
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage(
          "Network error. Please check your connection and try again."
        );
      });
  }, [searchParams]);

  const getSuccessMessage = (type: string) => {
    if (type === "email") {
      return "You've successfully unsubscribed from our email communications.";
    } else if (type === "sms") {
      return "You've successfully unsubscribed from our text messages.";
    } else {
      return "You've successfully unsubscribed from all communications.";
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black">
      {/* Flower of Life Background */}
      <div className="absolute inset-x-0 top-0 h-screen opacity-20">
        <iframe
          src="/admin/shaders/flower-of-life/embed"
          className="h-full w-full border-0"
          style={{ pointerEvents: "none" }}
          title="Sacred Geometry Background"
        />
      </div>
      <div className="absolute inset-x-0 top-0 h-screen bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative h-16 w-16 drop-shadow-2xl">
              <Image
                src="/brand/symbol.svg"
                alt="New Earth Collective"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <Card className="border-2 border-[#facf39]/20 bg-black/70 shadow-2xl backdrop-blur">
            <CardContent className="p-8 text-center">
              {status === "loading" && (
                <div className="space-y-4">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#facf39]" />
                  <h1 className="text-xl font-bold text-white">
                    Processing your request...
                  </h1>
                </div>
              )}

              {status === "success" && (
                <div className="space-y-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f3a51c] via-[#f6c43f] to-[#f6e45b]">
                    <CheckCircle2 className="h-8 w-8 text-black" />
                  </div>

                  <div className="space-y-2">
                    <h1
                      className="text-2xl font-bold text-white"
                      style={{
                        fontFamily: "Bourton, sans-serif",
                      }}
                    >
                      You've Been Unsubscribed
                    </h1>
                    <p className="text-neutral-300">{message}</p>
                  </div>

                  <div className="space-y-3 text-sm text-neutral-400">
                    <p>
                      We're sorry to see you go. If you change your mind, you
                      can always re-subscribe by joining our waitlist again.
                    </p>
                    {unsubscribeType !== "all" && (
                      <p className="text-[#facf39]">
                        Note: You are still subscribed to{" "}
                        {unsubscribeType === "email"
                          ? "text messages"
                          : "emails"}
                        .
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => (window.location.href = homeLink)}
                      className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] font-bold text-black hover:opacity-90"
                    >
                      Return to Home
                    </Button>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="space-y-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                    <XCircle className="h-8 w-8 text-red-400" />
                  </div>

                  <div className="space-y-2">
                    <h1
                      className="text-2xl font-bold text-white"
                      style={{
                        fontFamily: "Bourton, sans-serif",
                      }}
                    >
                      Oops! Something Went Wrong
                    </h1>
                    <p className="text-neutral-300">{message}</p>
                  </div>

                  <div className="space-y-3 text-sm text-neutral-400">
                    <p>
                      If you continue to have issues, please contact us at{" "}
                      <a
                        href="mailto:community@joinnewearthcollective.com"
                        className="text-[#facf39] underline hover:text-[#f6c43f]"
                      >
                        community@joinnewearthcollective.com
                      </a>
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={() => (window.location.href = homeLink)}
                      variant="outline"
                      className="border-[#facf39]/30 text-[#facf39] hover:bg-[#facf39]/10"
                    >
                      Return to Home
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-xs text-neutral-500">
            <p>New Earth Collective</p>
            <p className="mt-1">
              For support, email us at{" "}
              <a
                href="mailto:community@joinnewearthcollective.com"
                className="text-[#facf39] hover:underline"
              >
                community@joinnewearthcollective.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
