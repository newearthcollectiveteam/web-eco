"use client";

import { useState, Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { BackButton } from "~/components/back-button";
import Image from "next/image";
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";

const emailSubjects = [
  "Test Email #1 - Immediate",
  "Test Email #2 - 2.5 Minutes",
  "Test Email #3 - 5 Minutes",
  "Test Email #4 - 7.5 Minutes",
  "Test Email #5 - 24 Hours",
  "Test Email #6 - 36 Hours",
];

export default function FormBuilderPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedEmailPreview, setSelectedEmailPreview] = useState(1);

  // Quick test email state
  const [testEmail, setTestEmail] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [testError, setTestError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/form-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          phone,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data as { error?: string }).error || "Failed to submit form");
      }

      setSuccess(true);
      setEmail("");
      setName("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit form. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    setTestError("");
    setTestSuccess(false);

    try {
      const response = await fetch("/api/send-test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          emailNumber: selectedEmailPreview,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data as { error?: string }).error || "Failed to send test email");
      }

      setTestSuccess(true);
    } catch (err) {
      setTestError(
        err instanceof Error
          ? err.message
          : "Failed to send test email. Please try again."
      );
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-white dark:from-black dark:via-neutral-950 dark:to-black">
      <div className="container mx-auto px-4 py-16">
        {/* Back Button (shared styling) */}
        <Suspense fallback={null}>
          <BackButton label="Back to Hub" />
        </Suspense>

        {/* Header */}
        <section className="mb-12 text-center">
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
            className="mb-4 text-5xl font-bold text-black dark:text-white"
            style={{
              fontFamily: "Airwaves, sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            Email Sequence Tester
          </h1>
          <p className="mx-auto mb-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Test automated email sequences and timing
          </p>
          <Badge className="bg-[#06b6d4]/10 text-[#06b6d4] dark:bg-[#06b6d4]/20">
            Testing Environment
          </Badge>
        </section>

        {/* Quick Test Email Section */}
        <section className="mx-auto mb-12 max-w-2xl">
          <Card className="border-2 border-[#facf39]/30 bg-gradient-to-br from-[#facf39]/5 to-transparent shadow-xl dark:border-[#facf39]/40">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#facf39] to-[#f59e0b] shadow-lg">
                  <Send className="h-6 w-6 text-black" />
                </div>
                <div>
                  <CardTitle
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Quick Test Email
                  </CardTitle>
                  <CardDescription>
                    Send Email #{selectedEmailPreview} instantly to test
                    rendering
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickTest} className="space-y-4">
                {testSuccess && (
                  <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-50 p-4 dark:bg-green-900/20">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Test email sent successfully! Check your inbox.
                    </p>
                  </div>
                )}

                {testError && (
                  <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-50 p-4 dark:bg-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {testError}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      required
                      className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 transition-colors focus:border-[#facf39] focus:ring-2 focus:ring-[#facf39]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={testLoading}
                    className="gap-2 bg-gradient-to-r from-[#facf39] to-[#f59e0b] text-black hover:from-[#f5c62c] hover:to-[#facf39]"
                  >
                    {testLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Sends the currently previewed email (Email #
                  {selectedEmailPreview}) immediately - no scheduling, no CRM
                  entry
                </p>
              </form>
            </CardContent>
          </Card>
        </section>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          {/* Form Card */}
          <Card className="border-2 border-[#06b6d4]/20 shadow-xl dark:border-[#06b6d4]/30">
            <CardHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#0891b2] to-[#06b6d4] shadow-lg">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <CardTitle
                className="text-2xl font-bold"
                style={{
                  fontFamily: "Airwaves, sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Test Form Submission
              </CardTitle>
              <CardDescription>
                Submit to test the 6-email automated sequence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {success && (
                  <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-50 p-4 dark:bg-green-900/20">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Added to Waitlist! 6-email sequence initiated (4 in next
                      10min, then 24h & 36h).
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-50 p-4 dark:bg-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {error}
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 transition-colors focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    placeholder="Enter your message..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-2 bg-gradient-to-r from-[#0891b2] to-[#06b6d4] hover:from-[#0e7490] hover:to-[#0891b2]"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Form
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <div className="space-y-6">
            <Card className="border-2 border-[#facf39]/20 shadow-xl dark:border-[#facf39]/30">
              <CardHeader>
                <CardTitle
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Automated Sequence Timing
                </CardTitle>
                <CardDescription>
                  6 emails sent automatically after form submission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#06b6d4]/10 text-sm font-bold text-[#06b6d4]">
                    1
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-black dark:text-white">
                      Email 1
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Sent immediately (0 minutes)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#06b6d4]/10 text-sm font-bold text-[#06b6d4]">
                    2
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-black dark:text-white">
                      Email 2
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Sent after ~2.5 minutes
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#06b6d4]/10 text-sm font-bold text-[#06b6d4]">
                    3
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-black dark:text-white">
                      Email 3
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Sent after ~5 minutes
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#06b6d4]/10 text-sm font-bold text-[#06b6d4]">
                    4
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-black dark:text-white">
                      Email 4
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Sent after ~7.5 minutes
                    </p>
                  </div>
                </div>

                <div className="my-3 border-t border-neutral-200 dark:border-neutral-700"></div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#facf39]/10 text-sm font-bold text-[#facf39]">
                    5
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-black dark:text-white">
                      Email 5
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Sent after 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#facf39]/10 text-sm font-bold text-[#facf39]">
                    6
                  </div>
                  <div>
                    <h4 className="mb-1 font-semibold text-black dark:text-white">
                      Email 6
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Sent after 36 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-200 shadow-xl dark:border-neutral-800">
              <CardHeader>
                <CardTitle
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "Airwaves, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-start gap-2">
                  <span className="text-[#06b6d4]">•</span>
                  <span>6-email sequence over 36 hours</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#06b6d4]">•</span>
                  <span>4 rapid onboarding emails (10 minutes)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#06b6d4]">•</span>
                  <span>2 follow-up emails (24h & 36h)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#06b6d4]">•</span>
                  <span>Custom email templates supported</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#06b6d4]">•</span>
                  <span>Form validation and error handling</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Email Preview Section */}
        <section className="mx-auto mt-12 max-w-6xl">
          <Card className="border-2 border-[#facf39]/20 shadow-xl dark:border-[#facf39]/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#facf39] to-[#f59e0b] shadow-lg">
                  <Eye className="h-6 w-6 text-black" />
                </div>
                <div>
                  <CardTitle
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "Airwaves, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Email Preview
                  </CardTitle>
                  <CardDescription>
                    See what each email in the sequence looks like
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Email Selector Tabs */}
              <div className="mb-4 flex flex-wrap gap-2">
                {emailSubjects.map((subject, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedEmailPreview(index + 1)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      selectedEmailPreview === index + 1
                        ? "bg-[#facf39] text-black shadow-md"
                        : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    Email {index + 1}
                  </button>
                ))}
              </div>

              {/* Current Subject */}
              <div className="mb-4 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                  Subject:{" "}
                  <span className="text-black dark:text-white">
                    {emailSubjects[selectedEmailPreview - 1]}
                  </span>
                </p>
              </div>

              {/* Email Preview Iframe */}
              <div className="overflow-hidden rounded-lg border-2 border-neutral-200 bg-white dark:border-neutral-700">
                <iframe
                  src={`/api/email-preview?emailNumber=${selectedEmailPreview}&name=${encodeURIComponent(name || "Friend")}`}
                  className="h-[700px] w-full border-none"
                  title={`Email ${selectedEmailPreview} Preview`}
                  key={`${selectedEmailPreview}-${name}`}
                  sandbox="allow-same-origin"
                />
              </div>

              {/* Open in New Tab Button */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    const win = window.open(
                      `/api/email-preview?emailNumber=${selectedEmailPreview}&name=${name || "Friend"}`,
                      "_blank"
                    );
                    if (win) win.focus();
                  }}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
