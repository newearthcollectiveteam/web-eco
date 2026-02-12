"use client";

/**
 * Client-side tracking hook
 * Uses sendBeacon for non-blocking event tracking from the browser
 */
export function useTracking() {
  const track = (
    eventType: string,
    eventName?: string,
    properties?: Record<string, unknown>
  ) => {
    const payload = JSON.stringify({
      eventType,
      eventName,
      properties,
      path: window.location.pathname,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", payload);
    } else {
      void fetch("/api/track", {
        method: "POST",
        body: payload,
        keepalive: true,
      });
    }
  };

  return { track };
}
