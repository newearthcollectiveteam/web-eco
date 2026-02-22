"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import QRCode from "qrcode";

const QR_URL =
  "https://joinnewearthcollective.com/questionnaire?referrer=NEC+x+Envision&refSource=event";
const QR_SIZE = 300;
const LOGO_RATIO = 0.22; // logo takes ~22% of QR width

/** Convert a data URL to a File object */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",") as [string, string];
  const mime = /:(.*?);/.exec(header)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

export default function QRQuestionnairePage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, QR_URL, {
      width: QR_SIZE,
      margin: 2,
      errorCorrectionLevel: "H", // high error correction for logo overlay
      color: { dark: "#000000", light: "#FFFFFF" },
    }).then(() => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw the NEC symbol in the center
      const logo = new window.Image();
      logo.onload = () => {
        const logoSize = QR_SIZE * LOGO_RATIO;
        const padding = 6;
        const x = (QR_SIZE - logoSize) / 2;
        const y = (QR_SIZE - logoSize) / 2;

        // White circle background behind logo
        ctx.beginPath();
        ctx.arc(QR_SIZE / 2, QR_SIZE / 2, logoSize / 2 + padding, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        // Gold border ring
        ctx.beginPath();
        ctx.arc(QR_SIZE / 2, QR_SIZE / 2, logoSize / 2 + padding, 0, Math.PI * 2);
        ctx.strokeStyle = "#FACF39";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.drawImage(logo, x, y, logoSize, logoSize);
        setQrDataUrl(canvas.toDataURL("image/png"));
      };
      logo.src = "/brand/symbol.png";
    }).catch(() => undefined);
  }, []);

  // Detect Web Share API file support once QR is ready
  useEffect(() => {
    if (!qrDataUrl) return;
    try {
      const file = dataUrlToFile(qrDataUrl, "nec-team-qr.png");
      if (navigator.canShare?.({ files: [file] })) {
        setCanShare(true);
      }
    } catch {
      // canShare not supported
    }
  }, [qrDataUrl]);

  const shareOrDownloadQr = async () => {
    if (!qrDataUrl) return;

    if (canShare) {
      try {
        const file = dataUrlToFile(qrDataUrl, "nec-team-qr.png");
        await navigator.share({
          files: [file],
          title: "New Earth Collective QR",
        });
        return;
      } catch {
        // User cancelled or share failed — fall through
      }
    }

    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "nec-team-qr.png";
    a.click();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hidden canvas for QR generation */}
      <canvas ref={canvasRef} width={QR_SIZE} height={QR_SIZE} className="invisible absolute -left-[9999px]" />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Flower of Life Shader Background — gold-amber tinted */}
        <div className="absolute inset-0 opacity-50">
          <iframe
            src="/admin/shaders/flower-of-life/embed"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>
        {/* Gold-amber tint overlay on the shader */}
        <div className="absolute inset-0 bg-[#FACF39]/15 mix-blend-overlay" />

        {/* Gradient Overlay — vignette edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)]" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          {/* Logo — golden version */}
          <Image
            src="/brand/Logo Files/svg/Color logo - no background.svg"
            alt="New Earth Collective"
            width={240}
            height={72}
            className="mx-auto mb-8 drop-shadow-[0_0_20px_rgba(250,207,57,0.3)]"
            priority
          />

          <h1
            className="mb-3 text-5xl font-bold drop-shadow-[0_0_30px_rgba(250,207,57,0.4)] md:text-6xl lg:text-7xl"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Join the Collective
            </span>
          </h1>

          <p className="mb-10 text-lg text-white/80">
            Scan to fill out our community alignment questionnaire.
          </p>

          {/* QR Code with embedded symbol */}
          <div
            className="mb-6 inline-block cursor-pointer rounded-2xl border-2 border-[#FACF39]/40 bg-white p-6 shadow-[0_0_40px_rgba(250,207,57,0.2)] transition-transform active:scale-95"
            onClick={shareOrDownloadQr}
          >
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Scan to access questionnaire"
                width={260}
                height={260}
                className="rounded-lg"
              />
            ) : (
              <div className="flex h-[260px] w-[260px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FACF39] border-t-transparent" />
              </div>
            )}
          </div>

          <p className="text-sm text-white/50">
            {canShare ? "Tap QR to save or share" : "Tap QR to download"}
          </p>
        </div>
      </section>
    </div>
  );
}
