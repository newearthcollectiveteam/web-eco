"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProgressBar } from "~/components/questionnaire/progress-bar";
import { QuestionScreen } from "~/components/questionnaire/question-screen";
import { screens } from "~/components/questionnaire/screens";
import { initialFormData } from "~/components/questionnaire/types";
import { mapFormToPayload } from "~/components/questionnaire/data-mapper";
import type { FormData } from "~/components/questionnaire/types";

/** Horizontal swipe detection hook */
function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]!;
    touchRef.current = { x: touch.clientX, y: touch.clientY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchRef.current) return;
      const touch = e.changedTouches[0]!;
      const dx = touch.clientX - touchRef.current.x;
      const dy = touch.clientY - touchRef.current.y;
      const dt = Date.now() - touchRef.current.t;
      touchRef.current = null;

      // Must be horizontal, fast enough, and long enough
      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.7 || dt > 500)
        return;

      if (dx < 0) onSwipeLeft(); // swipe left = forward
      else onSwipeRight(); // swipe right = back
    },
    [onSwipeLeft, onSwipeRight]
  );

  return { onTouchStart, onTouchEnd };
}

function QuestionnaireFlow() {
  const searchParams = useSearchParams();
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [data, setData] = useState<FormData>(initialFormData);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const abandonSentRef = useRef(false);

  const totalScreens = screens.length;
  const screen = screens[idx]!;
  const isLast = idx === totalScreens - 1;

  // Reset scroll position on every screen change
  useEffect(() => {
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
  }, [idx]);

  // Keyboard-aware scroll: when an input gets focus on mobile,
  // scroll it into view so the keyboard doesn't cover it
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA") return;
      // Small delay lets the keyboard finish appearing
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, []);

  // Abandon detection: fire when user leaves after providing email but before submitting.
  // Uses a 60s debounce on visibilitychange so brief app-switches (checking a text)
  // don't trigger a premature reminder. beforeunload fires immediately.
  const abandonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const buildPayload = () => ({
      email: data.email,
      name: data.fullName || undefined,
      preferredName: data.preferredName || undefined,
      screenIndex: idx,
      referrer: searchParams.get("referrer") || undefined,
      refSource: searchParams.get("refSource") || undefined,
    });

    const fireAbandon = () => {
      if (abandonSentRef.current || submittingRef.current) return;
      if (idx < 2 || !data.email.includes("@")) return;
      abandonSentRef.current = true;

      navigator.sendBeacon(
        "/api/questionnaire/abandon",
        new Blob([JSON.stringify(buildPayload())], { type: "application/json" })
      );
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Start 60s timer — only fire if they don't come back
        abandonTimerRef.current = setTimeout(fireAbandon, 60_000);
      } else {
        // Came back — cancel the timer
        if (abandonTimerRef.current) {
          clearTimeout(abandonTimerRef.current);
          abandonTimerRef.current = null;
        }
      }
    };

    // beforeunload = actually leaving the page, fire immediately
    const onBeforeUnload = () => fireAbandon();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (abandonTimerRef.current) clearTimeout(abandonTimerRef.current);
    };
  }, [idx, data.email, data.fullName, data.preferredName, searchParams]);

  // Pre-fill from URL params (name/email/phone + referrer)
  useEffect(() => {
    const name = searchParams.get("name") ?? "";
    const email = searchParams.get("email") ?? "";
    const phone = searchParams.get("phone") ?? "";
    const referrer = searchParams.get("referrer") ?? "";
    const refSource = searchParams.get("refSource") ?? "";

    setData((prev) => {
      const updates: Partial<FormData> = {};
      if (name) updates.fullName = name;
      if (email) updates.email = email;
      if (phone) updates.phone = phone;

      // Referral pre-fill: set found-us based on referrer param
      if (referrer) {
        if (refSource === "event") {
          updates.howFoundUs = "event";
          updates.howFoundUsDetail = referrer;
        } else {
          updates.howFoundUs = "invitation";
          updates.howFoundUsDetail = referrer;
        }
      }

      return Object.keys(updates).length > 0
        ? { ...prev, ...updates }
        : prev;
    });
  }, [searchParams]);

  const update = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleArray = useCallback((field: keyof FormData, value: string) => {
    setData((prev) => {
      const current = prev[field] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  }, []);

  // Validation
  const validate = (): boolean => {
    switch (screen.id) {
      case "name":
        return data.fullName.trim().length > 0;
      case "contact":
        return data.email.includes("@");
      case "location":
        return data.currentLocation.trim().length > 0 || data.isNomadic;
      case "birth-info":
        return (
          data.birthDate.trim().length > 0 &&
          (data.unknownBirthTime || data.birthTime.trim().length > 0) &&
          data.birthLocation.trim().length > 0
        );
      case "your-role":
        return data.identityRoles.length > 0 || data.primaryRole.trim().length > 0;
      case "new-earth": {
        const words = data.newEarthMeaning.trim().split(/\s+/).filter(Boolean);
        return words.length >= 10;
      }
      case "intention":
        return data.primaryIntention.length > 0;
      case "give-receive":
        return data.uniqueGift.length >= 1 && data.receiveFromCommunity.length >= 1;
      case "found-us":
        return data.howFoundUs.length > 0;
      case "engage":
        return data.engagementStyles.length > 0;
      case "preferences":
        return (
          data.profileVisibility.length > 0 &&
          data.communicationPrefs.length > 0
        );
      default:
        return true;
    }
  };

  const goForward = () => {
    if (!validate()) {
      if (screen.id === "new-earth") {
        const wc = data.newEarthMeaning.trim().split(/\s+/).filter(Boolean).length;
        setError(`Please write at least 10 words (currently ${wc}).`);
      } else {
        setError("Please complete this step before continuing.");
      }
      return;
    }
    setError(null);
    setAnimKey((k) => k + 1);
    setIdx((i) => Math.min(i + 1, totalScreens - 1));
  };

  const goBack = () => {
    setError(null);
    setAnimKey((k) => k + 1);
    setIdx((i) => Math.max(i - 1, 0));
  };

  // Refs so swipe callbacks always use latest goForward/goBack
  const goForwardRef = useRef(goForward);
  const goBackRef = useRef(goBack);
  goForwardRef.current = goForward;
  goBackRef.current = goBack;

  const swipeHandlers = useSwipe(
    useCallback(() => goForwardRef.current(), []),
    useCallback(() => goBackRef.current(), [])
  );

  // Enter key advances on text-input screens
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const tag = (e.target as HTMLElement).tagName;
      // Only trigger on input fields (not textareas or buttons)
      if (tag !== "INPUT") return;
      e.preventDefault();
      goForwardRef.current();
    },
    []
  );

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    setStatus("submitting");
    setError(null);

    const referrerContactIdRaw = searchParams.get("referrerContactId");
    const referrerContactId = referrerContactIdRaw
      ? parseInt(referrerContactIdRaw, 10)
      : undefined;

    const payload = mapFormToPayload(data, {
      source: searchParams.get("source") || "questionnaire",
      contactId: searchParams.get("contactId") || "",
      referrerContactId:
        referrerContactId && referrerContactId > 0
          ? referrerContactId
          : undefined,
    });

    try {
      const res = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resBody = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        contactId?: number;
        error?: string;
        details?: string;
      };

      if (!res.ok) {
        throw new Error(resBody.details || resBody.error || "Failed to submit");
      }

      // Prevent abandon beacon from firing during redirect
      abandonSentRef.current = true;

      // Store name + contactId for thank-you page QR code
      try {
        sessionStorage.setItem(
          "nec_referrer",
          JSON.stringify({
            name: data.fullName,
            preferredName: data.preferredName,
            contactId: resBody.contactId,
          })
        );
      } catch {
        // sessionStorage unavailable — non-critical
      }

      window.location.href = "/thank-you";
    } catch (err: unknown) {
      submittingRef.current = false;
      const message =
        err instanceof Error ? err.message : "Failed to submit questionnaire";
      setError(message);
      setStatus("error");
    }
  };

  return (
    <div
      className="min-h-[100dvh] max-w-[100vw] overflow-x-hidden bg-black"
      onKeyDown={handleKeyDown}
      {...swipeHandlers}
    >
      <ProgressBar current={idx} total={totalScreens} />

      {/* Screen content — natural page scroll, no inner scroll container */}
      <div className={`mx-auto max-w-lg px-4 pt-14 ${isLast ? "pb-44" : "pb-28"}`}>
        <div key={animKey} data-q-dir="fade">
          <QuestionScreen
            screen={screen}
            data={data}
            update={update}
            toggleArray={toggleArray}
            referrer={searchParams.get("referrer") ?? undefined}
            onAutoAdvance={goForward}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="fixed bottom-20 left-0 right-0 z-40 text-center pointer-events-none">
          <span className="pointer-events-auto inline-block rounded-lg bg-red-900/80 px-4 py-2 text-sm text-red-200">
            {error}
          </span>
        </div>
      )}

      {/* Bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto max-w-lg px-4 py-3">
          {isLast ? (
            /* Review screen: full-width submit with back above */
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === "submitting"}
                className="min-h-[48px] w-full rounded-xl bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-6 py-3 text-base font-bold text-black transition-shadow hover:shadow-lg hover:shadow-[#f6c43f]/30 disabled:opacity-50"
                style={{ fontFamily: "Bourton, sans-serif", touchAction: "manipulation" }}
              >
                {status === "submitting" ? "Submitting..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={goBack}
                className="min-h-[36px] text-center text-sm text-white/50 transition-colors hover:text-white"
                style={{ touchAction: "manipulation" }}
              >
                Go back and edit
              </button>
            </div>
          ) : (
            /* Normal screens: back + counter + continue */
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={idx === 0}
                className="flex min-h-[44px] items-center gap-1 rounded-xl px-3 py-2 text-sm text-white/60 transition-colors hover:text-white disabled:invisible"
                style={{ touchAction: "manipulation" }}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <span className="text-xs text-white/30">
                {idx + 1} / {totalScreens}
              </span>
              <button
                type="button"
                onClick={goForward}
                className="min-h-[44px] rounded-xl bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-6 py-2 text-sm font-bold text-black transition-shadow hover:shadow-lg hover:shadow-[#f6c43f]/30"
                style={{ fontFamily: "Bourton, sans-serif", touchAction: "manipulation" }}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <QuestionnaireFlow />
    </Suspense>
  );
}
