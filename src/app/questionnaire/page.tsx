"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { TextareaWithCounter } from "~/components/ui/textarea-with-counter";
import { DateTimePicker } from "~/components/ui/date-time-picker";
import { BirthTimePicker } from "~/components/ui/birth-time-picker";
import { LocationAutocomplete } from "~/components/ui/location-autocomplete";
import { Checkbox } from "~/components/ui/checkbox";
import Image from "next/image";
import { Button } from "~/components/ui/button";

const checkboxOption = (
  id: string,
  label: string
): { id: string; label: string } => ({ id, label });

const inputClass =
  "bg-black/40 text-white border border-white/30 focus:border-[#facf39] placeholder:text-neutral-400";
const textareaClass =
  "bg-black/40 text-white border border-white/30 focus:border-[#facf39] placeholder:text-neutral-400";
const checkboxClass =
  "h-5 w-5 border-white/80 bg-white/10 ring-[1.5px] ring-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black data-[state=checked]:ring-white/60";

const innerWorkOptions = [
  "Therapy or coaching",
  "Somatic/body-based practices",
  "Shadow work/parts work",
  "Meditation or breathwork",
  "Plant medicine/psychedelic integration",
  "Journaling or creative expression",
  "Nervous system regulation practices",
  "I'm not currently doing inner work but want to start",
].map((text, idx) => checkboxOption(`inner-${idx}`, text));

const discoveryOptions = [
  "Through social media content",
  "Referred by a current member",
  "Through a festival/event/retreat",
  "Through mutual friends/community",
  "Other",
].map((text, idx) => checkboxOption(`discover-${idx}`, text));

const intentionOptions = [
  "To find my soul family and experience deep authentic connection",
  "To do my inner work alongside others committed to growth",
  "To learn practical tools for building New Earth consciousness",
  "To contribute my gifts and be in service to the collective",
  "To network/promote my business or brand",
  "To take on a leadership role and serve",
  "Other",
].map((text, idx) => checkboxOption(`intent-${idx}`, text));

const accountabilityOptions = [
  "1-3: I'm not sure I'm ready for that level of accountability",
  "4-6: I'm open to it but it makes me nervous",
  "7-9: I welcome it and see it as growth",
  "10: I actively seek accountability as a path to sovereignty",
].map((text, idx) => checkboxOption(`account-${idx}`, text));

const commitmentOptions = [
  "High commitment — I'll be an active participant, attend most gatherings, engage regularly",
  "Moderate commitment — I'll show up when I can, life permitting",
  "Low commitment — I'm mostly here to observe and learn",
  "I'm not sure yet",
].map((text, idx) => checkboxOption(`commit-${idx}`, text));

const participationOptions = [
  'Yes, I understand and commit to this',
  "I'll try my best but it's hard for me",
  "I'm not sure what this means",
  'No, I like to lead most conversations',
].map((text, idx) => checkboxOption(`participate-${idx}`, text));

const safetyOptions = [
  "Yes, I fully commit",
  "I commit and request grace as I learn",
  "I'm not sure I can commit to all of these",
  "No, these feel too restrictive",
].map((text, idx) => checkboxOption(`safety-${idx}`, text));

function QuestionnaireForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Pre-fill data from URL parameters
  const [preFillData, setPreFillData] = useState({
    name: "",
    email: "",
    phone: "",
    contactId: "",
    source: "",
  });

  // Extract URL parameters on mount
  useEffect(() => {
    const name = searchParams.get("name") || "";
    const email = searchParams.get("email") || "";
    const phone = searchParams.get("phone") || "";
    const contactId = searchParams.get("contactId") || "";
    const source = searchParams.get("source") || "";

    setPreFillData({ name, email, phone, contactId, source });
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget; // Store form reference before async
    const formData = new FormData(form);

    // Validate checkbox groups - at least one must be selected
    const checkboxGroups = [
      { name: 'discovery', label: 'How did you find us' },
      { name: 'intention', label: 'Primary intention' },
      { name: 'innerWork', label: 'Inner work practices' },
      { name: 'accountability', label: 'Accountability readiness' },
      { name: 'commitment', label: 'Commitment level' },
      { name: 'participation', label: 'Participation agreement' },
      { name: 'safety', label: 'Safety agreements' },
    ];

    for (const group of checkboxGroups) {
      const values = formData.getAll(group.name);
      if (values.length === 0) {
        setError(`Please select at least one option for: ${group.label}`);
        setStatus("idle");
        // Scroll to the first error
        const firstCheckbox = form.querySelector(`[name="${group.name}"]`);
        firstCheckbox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    setStatus("submitting");
    setError(null);

    const getText = (key: string): string => {
      const value = formData.get(key);
      return typeof value === "string" ? value : "";
    };

    const getAllText = (key: string): string[] =>
      formData.getAll(key).map((item) => (typeof item === "string" ? item : ""));

    const payload = {
      name: getText("fullName"),
      email: getText("email"),
      phone: getText("phone"),
      contactId: preFillData.contactId, // Include contactId for tracking
      source: preFillData.source || "questionnaire",
      discovery: getAllText("discovery"),
      discoveryDetails: getText("discoveryDetails"),
      intention: getAllText("intention"),
      intentionDetails: getText("intentionDetails"),
      newEarthMeaning: getText("newEarthMeaning"),
      nervousSystems: getText("nervousSystems"),
      sovereignty: getText("sovereignty"),
      innerWork: getAllText("innerWork"),
      innerWorkOther: getText("innerWorkOther"),
      authenticityStory: getText("authenticityStory"),
      triggerResponse: getText("triggerResponse"),
      activeWound: getText("activeWound"),
      accountability: getText("accountability"),
      gift: getText("gift"),
      commitment: getText("commitment"),
      participation: getText("participation"),
      safety: getText("safety"),
      additionalInfo: getText("additionalInfo"),
      birthDate: getText("birthDate"),
      birthTime: getText("birthTime"),
      birthLocation: getText("birthLocation"),
    };

    try {
      const res = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Failed to submit");
      }

      setStatus("success");
      form.reset();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit questionnaire";
      setError(message);
      setStatus("error");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black dark:from-black dark:via-neutral-950 dark:to-black">
      <div className="absolute inset-x-0 top-0 h-screen opacity-30 dark:opacity-25">
        <iframe
          src="/shaders/flower-of-life/embed?domain=test.joinnewearthcollective.com"
          className="h-full w-full border-0"
          style={{ pointerEvents: "none" }}
          title="Sacred Geometry Background"
        />
      </div>
      <div className="absolute inset-x-0 top-0 h-screen bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      <div className="relative z-10 px-4 py-16">
        <div className="container mx-auto max-w-5xl">
          <header className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center justify-center">
              <div className="relative h-16 w-16 drop-shadow-2xl">
                <Image
                  src="/brand/symbol.svg"
                  alt="New Earth Collective"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h1
              className="mb-3 text-5xl font-bold md:text-6xl"
              style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
            >
              <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
                NEW EARTH COLLECTIVE
              </span>
            </h1>
            <h2
              className="mb-4 mx-auto max-w-xl text-2xl font-semibold text-white md:text-3xl"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              Community Alignment Survey
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-neutral-300">
              We protect the coherence of this community by inviting aligned, self-aware members
              who are ready to show up. Please answer honestly and with heart.
            </p>
          </header>

          <form className="space-y-10" onSubmit={handleSubmit}>
            <Card className="border-2 border-[#facf39]/20 bg-black/70 shadow-2xl backdrop-blur">
              <CardContent className="space-y-4 p-8 md:p-10">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-sm text-neutral-300" htmlFor="full-name">
                      Full Name
                    </label>
                    <Input
                      id="full-name"
                      name="fullName"
                      className={inputClass}
                      placeholder="Your name"
                      defaultValue={preFillData.name}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-neutral-300" htmlFor="email">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className={inputClass}
                      placeholder="you@example.com"
                      defaultValue={preFillData.email}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-neutral-300" htmlFor="phone">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      className={inputClass}
                      placeholder="(555) 123-4567"
                      defaultValue={preFillData.phone}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#facf39]/20 bg-black/70 shadow-2xl backdrop-blur">
              <CardContent className="space-y-6 p-8 md:p-10">
                <div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "Bourton, sans-serif" }}>
                    Section 1: Foundational Alignment
                  </h3>
                  <p className="text-sm text-neutral-400">Questions 1–5</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">1. How did you find the New Earth Collective?</p>
                    <div className="space-y-2">
                      {discoveryOptions.map((opt) => (
                        <label key={opt.id} className="flex items-start gap-2 text-white">
                          <Checkbox
                            id={opt.id}
                            name="discovery"
                            value={opt.label}
                            className={checkboxClass}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    <Input
                      placeholder="If referral or other, share details"
                      className={`mt-2 ${inputClass}`}
                      name="discoveryDetails"
                    />
                  </div>
                </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      2. In your own words, what does &quot;New Earth&quot; mean to you?
                    </p>
                    <TextareaWithCounter
                      rows={4}
                      className={textareaClass}
                      placeholder="Share your understanding..."
                      minLength={250}
                      minWords={50}
                      required
                      name="newEarthMeaning"
                      helperText="Minimum 50 words"
                    />
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">3. What is your primary intention for joining?</p>
                    <div className="space-y-2">
                      {intentionOptions.map((opt) => (
                        <label key={opt.id} className="flex items-start gap-2 text-white">
                          <Checkbox
                            id={opt.id}
                            name="intention"
                            value={opt.label}
                            className={checkboxClass}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                      <Input
                        placeholder="If other, share details"
                        className={`mt-2 ${inputClass}`}
                        name="intentionDetails"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      4. "Regulated nervous systems create collective intelligence." What does this mean to you, and why does it matter?
                    </p>
                    <TextareaWithCounter
                      rows={4}
                      className={textareaClass}
                      placeholder="Share your perspective..."
                      minLength={250}
                      minWords={50}
                      required
                      name="nervousSystems"
                      helperText="Minimum 50 words"
                    />
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">5. What does &quot;sovereignty&quot; mean to you?</p>
                    <TextareaWithCounter
                      rows={3}
                      className={textareaClass}
                      placeholder="Share your understanding..."
                      minLength={150}
                      minWords={30}
                      required
                      name="sovereignty"
                      helperText="Minimum 30 words"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#facf39]/20 bg-black/70 shadow-2xl backdrop-blur">
              <CardContent className="space-y-6 p-8 md:p-10">
                <div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "Bourton, sans-serif" }}>
                    Section 2: Inner Work &amp; Readiness
                  </h3>
                  <p className="text-sm text-neutral-400">Questions 6–10</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      6. What does &quot;doing your inner work&quot; currently look like for you? (check all that apply)
                    </p>
                    <div className="space-y-2">
                      {innerWorkOptions.map((opt) => (
                        <label key={opt.id} className="flex items-start gap-2 text-white">
                          <Checkbox
                            id={opt.id}
                            name="innerWork"
                            value={opt.label}
                            className={checkboxClass}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                      <Input
                        placeholder="Other (if applicable)"
                        className={`mt-2 ${inputClass}`}
                        name="innerWorkOther"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      7. Describe a recent moment when you chose authenticity over performance, even though it was uncomfortable.
                    </p>
                    <TextareaWithCounter
                      rows={4}
                      className={textareaClass}
                      placeholder="Share a specific example..."
                      minLength={375}
                      minWords={75}
                      required
                      name="authenticityStory"
                      helperText="Minimum 75 words"
                    />
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      8. How do you typically respond when you&apos;re triggered or dysregulated in community spaces?
                    </p>
                    <TextareaWithCounter
                      rows={4}
                      className={textareaClass}
                      placeholder="Describe your typical response..."
                      minLength={250}
                      minWords={50}
                      required
                      name="triggerResponse"
                      helperText="Minimum 50 words"
                    />
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      9. What&apos;s one wound or pattern you&apos;re actively working to heal right now?
                    </p>
                    <TextareaWithCounter
                      rows={4}
                      className={textareaClass}
                      placeholder="Share what you're working on..."
                      minLength={250}
                      minWords={50}
                      required
                      name="activeWound"
                      helperText="Minimum 50 words"
                    />
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      10. On a scale of 1-10, how ready are you to be held accountable by this community when you&apos;re out of alignment?
                    </p>
                    <div className="space-y-2">
                      {accountabilityOptions.map((opt) => (
                        <label key={opt.id} className="flex items-start gap-2 text-white">
                          <Checkbox
                            id={opt.id}
                            name="accountability"
                            value={opt.label}
                            className={checkboxClass}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#facf39]/20 bg-black/70 shadow-2xl backdrop-blur">
              <CardContent className="space-y-6 p-8 md:p-10">
                <div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "Bourton, sans-serif" }}>
                    Section 3: Contribution &amp; Commitment
                  </h3>
                  <p className="text-sm text-neutral-400">Questions 11–13</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      11. What unique gift, skill, or perspective do you bring to this community?
                    </p>
                    <TextareaWithCounter
                      rows={4}
                      className={textareaClass}
                      placeholder="Share your unique gifts..."
                      minLength={250}
                      minWords={50}
                      required
                      name="gift"
                      helperText="Minimum 50 words"
                    />
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      12. How much time and energy can you realistically commit to showing up in this community?
                    </p>
                    <div className="space-y-2">
                      {commitmentOptions.map((opt) => (
                        <label key={opt.id} className="flex items-start gap-2 text-white">
                          <Checkbox
                            id={opt.id}
                            name="commitment"
                            value={opt.label}
                            className={checkboxClass}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      13. This community operates on the principle of &quot;equal participation creates collective intelligence.&quot;
                      Are you willing to share space and not dominate conversations?
                    </p>
                    <div className="space-y-2">
                      {participationOptions.map((opt) => (
                        <label key={opt.id} className="flex items-start gap-2 text-white">
                          <Checkbox
                            id={opt.id}
                            name="participation"
                            value={opt.label}
                            className={checkboxClass}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#facf39]/20 bg-black/70 shadow-2xl backdrop-blur">
              <CardContent className="space-y-6 p-8 md:p-10">
                <div>
                  <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "Bourton, sans-serif" }}>
                    Section 4: Boundaries &amp; Safety
                  </h3>
                  <p className="text-sm text-neutral-400">Questions 14–16</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      14. We prioritize psychological safety. Can you commit to these agreements?
                    </p>
                    <div className="space-y-2">
                      {safetyOptions.map((opt) => (
                        <label key={opt.id} className="flex items-start gap-2 text-white">
                          <Checkbox id={opt.id} name="safety" value={opt.label} className={checkboxClass} />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      15. Is there anything else you want us to know about you, your journey, or why this community is calling to you
                      right now?
                    </p>
                    <Textarea rows={4} className={textareaClass} placeholder="Optional" name="additionalInfo" />
                  </div>

                  <div>
                    <p className="mb-3 text-lg font-semibold text-white">
                      16. Optional: Birth date, exact time (am/pm), and birth city/state
                    </p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-sm text-neutral-300" htmlFor="birth-date">
                          Birth date
                        </label>
                        <DateTimePicker
                          id="birth-date"
                          name="birthDate"
                          placeholder="Select your birth date"
                          className={inputClass}
                          showYearDropdown={true}
                          showMonthDropdown={true}
                          dropdownMode="select"
                          yearDropdownItemNumber={100}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm text-neutral-300" htmlFor="birth-time">
                          Birth time
                        </label>
                        <BirthTimePicker
                          id="birth-time"
                          name="birthTime"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-1">
                        <label className="text-sm text-neutral-300" htmlFor="birth-city">
                          Birth city/state
                        </label>
                        <LocationAutocomplete
                          id="birth-city"
                          name="birthLocation"
                          className={inputClass}
                          placeholder="Start typing city name..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                disabled={status === "submitting"}
                className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-10 py-6 text-lg font-bold text-black shadow-2xl transition-all hover:scale-105 hover:shadow-[#facf39]/50"
                style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
              >
                {status === "submitting" ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
            {status === "success" && (
              <p className="text-center text-sm text-green-300">Thanks! Your application has been submitted.</p>
            )}
            {status === "error" && error && (
              <p className="text-center text-sm text-red-300">Submission failed: {error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuestionnaireForm />
    </Suspense>
  );
}
