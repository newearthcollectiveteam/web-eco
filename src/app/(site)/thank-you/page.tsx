"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Instagram, Home, Share2, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import QRCode from "qrcode";

/** Convert a data URL to a File object */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",") as [string, string];
  const mime = /:(.*?);/.exec(header)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

export default function ThankYouPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("nec_referrer");
      if (!raw) return;
      const { name, preferredName, contactId } = JSON.parse(raw) as {
        name: string;
        preferredName?: string;
        contactId?: number;
      };
      const referrerName = preferredName || name;
      if (!referrerName) return;
      setDisplayName(referrerName);

      // Build QR URL with contactId for DB linking + name for display
      const params = new URLSearchParams();
      params.set("referrer", referrerName);
      if (contactId) {
        params.set("referrerContactId", String(contactId));
      }
      const url = `https://joinnewearthcollective.com/questionnaire?${params.toString()}`;
      QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      })
        .then(setQrDataUrl)
        .catch(() => undefined);
    } catch {
      // sessionStorage unavailable or parse error — non-critical
    }
  }, []);

  // Detect Web Share API file support once QR is ready
  useEffect(() => {
    if (!qrDataUrl) return;
    try {
      const file = dataUrlToFile(qrDataUrl, "nec-referral-qr.png");
      if (navigator.canShare?.({ files: [file] })) {
        setCanShare(true);
      }
    } catch {
      // canShare not supported — stick with download
    }
  }, [qrDataUrl]);

  const shareOrDownloadQr = async () => {
    if (!qrDataUrl) return;

    // Try native share (mobile) — lets user "Save to Photos", AirDrop, text, etc.
    if (canShare) {
      try {
        const file = dataUrlToFile(qrDataUrl, "nec-referral-qr.png");
        await navigator.share({
          files: [file],
          title: "New Earth Collective Referral",
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to download
      }
    }

    // Fallback: traditional download (desktop)
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "nec-referral-qr.png";
    a.click();
  };

  return (
    <div className="bg-black">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Flower of Life Shader Background */}
        <div className="absolute inset-0 opacity-20">
          <iframe
            src="/admin/shaders/flower-of-life/embed"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h1
            className="mb-8 text-5xl font-bold text-[#FACF39] md:text-6xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            Thank You!
          </h1>
          <p className="mb-6 text-xl text-white/90">
            Your responses help us assess alignment and inform the building of
            our app.
          </p>
          <p className="mb-4 text-lg text-white/70">
            We'll connect soon via email or our network.
          </p>

          {/* QR Referral Section */}
          {qrDataUrl && (
            <div className="mb-8 rounded-2xl border border-[#FACF39]/20 bg-white/5 p-6">
              <p className="mb-4 text-lg font-medium text-[#FACF39]">
                Know someone who'd be a great fit?
              </p>
              <p className="mb-4 text-sm text-white/60">
                Share this QR code —<br />
                they'll be linked to you as their referrer.
              </p>
              <div className="mb-4 inline-block rounded-xl bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Referral QR code"
                  width={240}
                  height={240}
                />
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button
                  onClick={shareOrDownloadQr}
                  variant="outline"
                  className="border-[#FACF39]/50 bg-transparent text-[#FACF39] hover:border-[#FACF39] hover:bg-[#FACF39]/10"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  {canShare ? (
                    <>
                      <Share2 className="mr-2 h-4 w-4" />
                      Save & Share QR
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download QR
                    </>
                  )}
                </Button>
                <p className="text-xs text-white/40">
                  {canShare ? "save to photos or share directly" : "or screenshot to share"}
                </p>
              </div>
              {displayName && (
                <p className="mt-3 text-xs text-white/40">
                  Referrals will show &quot;Recommended by {displayName}&quot;
                </p>
              )}
            </div>
          )}

          <p className="mb-12 text-lg text-white/70">
            In the meantime, follow our journey on Instagram.
          </p>

          <div className="flex flex-col items-center gap-4 pb-16 sm:flex-row sm:justify-center sm:gap-6 sm:pb-0">
            <Button
              asChild
              className="bg-gradient-to-r from-[#FFD700] to-[#FACF39] px-8 py-4 font-bold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#FACF39]/30"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#FACF39]/50 bg-transparent px-8 py-4 font-bold text-[#FACF39] transition-all hover:border-[#FACF39] hover:bg-[#FACF39]/10"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              <a
                href="https://www.instagram.com/newearthcollectiveco/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="mr-2 h-5 w-5" />
                Follow on Instagram
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
