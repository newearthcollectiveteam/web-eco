"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";
import { SiteLayout } from "~/components/layouts/site-layout";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

export default function EmergenceLiabilityPage() {
  const router = useRouter();
  const signatureRef = useRef<SignatureCanvas>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPhotoVideo, setAgreedToPhotoVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!agreedToTerms) {
      setError(
        "Please agree to the Event Release of Liability & Assumption of Risk"
      );
      return;
    }
    if (!agreedToPhotoVideo) {
      setError("Please agree to the Photo & Video Consent");
      return;
    }
    if (signatureRef.current?.isEmpty()) {
      setError("Please provide your signature");
      return;
    }

    setIsSubmitting(true);

    try {
      const signatureData = signatureRef.current?.toDataURL("image/png");

      const response = await fetch("/api/waiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: formData.name.trim(),
          signerEmail: formData.email.trim(),
          eventName: "New Earth Collective Presents: The Emergence",
          eventDate: "January 17, 2026",
          eventLocation: "Boulder Circus Center, Boulder, CO",
          signatureData,
          agreedToTerms,
          agreedToPhotoVideo,
          waiverVersion: "1.0",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          (data as { error?: string }).error || "Failed to submit waiver"
        );
      }

      router.push("/EmergenceLiability/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <div className="relative bg-black">
        {/* Shared button styles */}
        <style jsx global>{`
          .btn-golden {
            background: linear-gradient(to right, #f3a51c, #f6c43f, #f6e45b);
            color: #000;
            font-weight: bold;
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          .btn-golden:hover {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(246, 196, 63, 0.4);
          }
          .btn-golden:disabled {
            opacity: 0.6;
            transform: none;
            box-shadow: none;
          }
          .waiver-section {
            border: 1px solid rgba(250, 207, 57, 0.3);
            background: rgba(0, 0, 0, 0.6);
          }
        `}</style>

        {/* Hero Section */}
        <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden pt-20">
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

          {/* Hero Content */}
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <h1
              className="mb-4 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl"
              style={{
                fontFamily: "Airwaves, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
                The Emergence
              </span>
            </h1>
            <div className="mt-6 space-y-1 text-white/80">
              <p className="text-lg font-semibold text-[#FACF39]">
                Event Release & Assumption of Risk
              </p>
              <p>January 17, 2026</p>
              <p>Boulder Circus Center, Boulder, CO</p>
              <p className="text-sm text-white/60">Organizer: Austin Terry</p>
            </div>
          </div>
        </section>

        {/* Waiver Content */}
        <section className="bg-[#0A0A0A] px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Please Read Carefully */}
              <div className="waiver-section rounded-lg p-6">
                <h2
                  className="mb-4 text-2xl font-bold text-[#FACF39]"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Please Read Carefully
                </h2>
                <div className="space-y-4 text-white/80">
                  <p>
                    By signing below, I confirm that I am voluntarily attending
                    and participating in this Event and assume all risks
                    associated with my participation, whether known or unknown.
                  </p>
                  <p>
                    I understand the Event includes live music, dancing,
                    movement classes, breathwork, somatic practices, flow arts,
                    and circus-style performances, and may involve stages,
                    platforms, loud sound, low lighting, nighttime conditions,
                    and physical exertion.
                  </p>
                  <p>
                    I acknowledge that risks may include slips, falls,
                    collisions, injury, emotional or physical responses,
                    illness, property damage, or medical emergencies.
                  </p>
                </div>
              </div>

              {/* Release of Liability */}
              <div className="waiver-section rounded-lg p-6">
                <h2
                  className="mb-4 text-2xl font-bold text-[#FACF39]"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Release of Liability
                </h2>
                <div className="space-y-4 text-white/80">
                  <p>
                    In consideration for being allowed to attend, I release and
                    waive all claims against Austin Terry and all associated
                    parties, including the venue, performers, instructors,
                    volunteers, contractors, and media personnel, for any
                    injury, loss, or damage, including those caused by ordinary
                    negligence, to the fullest extent permitted by Colorado law.
                  </p>
                  <p className="font-semibold text-white/90">
                    This release does not apply to gross negligence or
                    intentional misconduct.
                  </p>
                </div>
              </div>

              {/* Medical & Personal Responsibility */}
              <div className="waiver-section rounded-lg p-6">
                <h2
                  className="mb-4 text-2xl font-bold text-[#FACF39]"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Medical & Personal Responsibility
                </h2>
                <div className="space-y-4 text-white/80">
                  <p>
                    I understand that no onsite medical staff or security are
                    provided. I am responsible for my own health, safety, and
                    medical costs. I confirm I am physically and mentally
                    capable of participating and will act within my limits.
                  </p>
                  <p className="font-semibold text-[#FACF39]">
                    This is a substance-free event.
                  </p>
                </div>
              </div>

              {/* Photo & Video Consent */}
              <div className="waiver-section rounded-lg p-6">
                <h2
                  className="mb-4 text-2xl font-bold text-[#FACF39]"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Photo & Video Consent
                </h2>
                <p className="text-white/80">
                  I consent to photography and video recording during the Event
                  and allow use of my image for marketing, social media,
                  documentation, and future events, without compensation.
                </p>
              </div>

              {/* Acknowledgment */}
              <div className="waiver-section rounded-lg p-6">
                <h2
                  className="mb-4 text-2xl font-bold text-[#FACF39]"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Acknowledgment
                </h2>
                <p className="mb-4 text-white/80">
                  By signing, I confirm that:
                </p>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FACF39]/60" />
                    I am 18 years of age or older
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FACF39]/60" />
                    I have read and understand this waiver
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FACF39]/60" />
                    I am signing voluntarily
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FACF39]/60" />
                    I understand I am giving up certain legal rights
                  </li>
                </ul>
              </div>

              {/* Form Fields */}
              <div className="waiver-section rounded-lg p-6">
                <h2
                  className="mb-6 text-2xl font-bold text-[#FACF39]"
                  style={{ fontFamily: "Bourton, sans-serif" }}
                >
                  Sign Below
                </h2>

                <div className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="signer-name"
                      className="mb-2 block text-sm font-medium text-white/80"
                    >
                      Participant Name (Print){" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="signer-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#FACF39]/30 bg-black/60 px-4 py-3 text-white placeholder-white/40 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39] focus:outline-none"
                      placeholder="Enter your full legal name"
                      aria-required="true"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="signer-email"
                      className="mb-2 block text-sm font-medium text-white/80"
                    >
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="signer-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#FACF39]/30 bg-black/60 px-4 py-3 text-white placeholder-white/40 focus:border-[#FACF39] focus:ring-1 focus:ring-[#FACF39] focus:outline-none"
                      placeholder="your@email.com"
                      aria-required="true"
                    />
                  </div>

                  {/* Signature Canvas */}
                  <div>
                    <label
                      id="signature-label"
                      className="mb-2 block text-sm font-medium text-white/80"
                    >
                      Signature <span className="text-red-400">*</span>
                    </label>
                    <div className="rounded-lg border border-[#FACF39]/30 bg-white p-1">
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                          className: "w-full h-40 rounded",
                          style: { width: "100%", height: "160px" },
                          "aria-labelledby": "signature-label",
                          role: "img",
                        }}
                        backgroundColor="white"
                        penColor="black"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="mt-2 text-sm text-[#FACF39]/80 transition-colors hover:text-[#FACF39]"
                    >
                      Clear Signature
                    </button>
                  </div>

                  {/* Date (Auto-filled) */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/80">
                      Date
                    </label>
                    <input
                      type="text"
                      value={new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      disabled
                      className="w-full rounded-lg border border-[#FACF39]/20 bg-black/40 px-4 py-3 text-white/60"
                    />
                  </div>

                  {/* Agreement Checkboxes */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) =>
                          setAgreedToTerms(checked === true)
                        }
                        className="mt-1 border-[#FACF39]/50 data-[state=checked]:bg-[#FACF39] data-[state=checked]:text-black"
                      />
                      <label
                        htmlFor="terms"
                        className="cursor-pointer text-sm text-white/80"
                      >
                        I agree to the Event Release of Liability & Assumption
                        of Risk <span className="text-red-400">*</span>
                      </label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="photoVideo"
                        checked={agreedToPhotoVideo}
                        onCheckedChange={(checked) =>
                          setAgreedToPhotoVideo(checked === true)
                        }
                        className="mt-1 border-[#FACF39]/50 data-[state=checked]:bg-[#FACF39] data-[state=checked]:text-black"
                      />
                      <label
                        htmlFor="photoVideo"
                        className="cursor-pointer text-sm text-white/80"
                      >
                        I consent to Photo & Video recording{" "}
                        <span className="text-red-400">*</span>
                      </label>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div
                      role="alert"
                      className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400"
                    >
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-golden w-full py-4 text-lg"
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    {isSubmitting ? "Submitting..." : "Sign & Submit Waiver"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
