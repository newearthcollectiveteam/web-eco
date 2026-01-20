"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { DateTimePicker } from "~/components/ui/date-time-picker";
import { BirthTimePicker } from "~/components/ui/birth-time-picker";
import { LocationAutocomplete } from "~/components/ui/location-autocomplete";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Slider } from "~/components/ui/slider";

const inputClass =
  "bg-black/40 text-white border border-[#FACF39]/30 focus:border-[#FACF39] focus:ring-[#FACF39]/20 placeholder:text-neutral-500";

const checkboxClass =
  "h-5 w-5 border-[#FACF39]/50 bg-black/40 data-[state=checked]:bg-[#FACF39] data-[state=checked]:text-black";

// Role options - Facilitators & Healers
const facilitatorRoles = [
  "Breathwork practitioner",
  "Meditation guide",
  "Somatic/bodywork practitioner",
  "Nervous system specialist",
  "Yoga instructor",
  "Sound healer",
  "Energy worker (Reiki, etc.)",
  "Medicine guide/shaman",
  "Psychic/intuitive",
];

// Role options - Creators & Builders
const creatorRoles = [
  "Community builder",
  "Conscious entrepreneur",
  "Decentralized tech/Web 5 activist",
  "Regenerative farmer/permaculturist",
  "Land developer",
  "Event/festival organizer",
  "Musician/DJ/producer",
  "Visual artist/designer",
  "Photographer/videographer",
  "Podcaster",
  "Content creator",
  "Developer/technologist",
];

// Resource options (interleaved: spaces in left column, equipment in right)
const resourceOptions = [
  // Row 1
  { id: "land", label: "Land for events/retreats", hasLocation: true },
  { id: "av", label: "Sound/AV equipment", hasLocation: false },
  // Row 2
  { id: "venue", label: "Event space/venue", hasLocation: false },
  { id: "projectors", label: "Projectors/screens", hasLocation: false },
  // Row 3
  { id: "housing", label: "Housing/accommodation", hasLocation: false },
  { id: "decor", label: "Decor, art, and lighting", hasLocation: false },
  // Row 4
  { id: "storage", label: "Storage space", hasLocation: false },
  { id: "instruments", label: "Musical instruments", hasLocation: false },
  // Row 5
  { id: "photo_video", label: "Photography/video equipment", hasLocation: false },
  { id: "kitchen", label: "Kitchen/catering equipment", hasLocation: false },
  // Row 6
  { id: "camping", label: "Camping gear/tents", hasLocation: false },
  { id: "furniture", label: "Furniture/seating", hasLocation: false },
  // Row 7
  { id: "generators", label: "Generators/power equipment", hasLocation: false },
  { id: "transport", label: "Transportation (van, bus)", hasLocation: false },
];

// How found us options
const discoveryOptions = [
  { id: "invitation", label: "Personal Invitation/Recommendation", detailPlaceholder: "From whom?" },
  { id: "social", label: "Social media", detailPlaceholder: "Which platform?" },
  { id: "event", label: "Event", detailPlaceholder: "Which event?" },
];

// Engagement options
const engagementOptions = [
  "Attend future events",
  "Facilitate workshops/experiences",
  "Collaborate on projects",
  "Help organize/produce events",
  "Contribute skills to the collective",
  "Find services/collaborators",
  "Just here for the experience",
];

// Ecosystem contribution options
const ecosystemContributionOptions = [
  { id: "dev", label: "Yes, I want to contribute to development" },
  { id: "beta", label: "Yes, I'll be a beta tester" },
  { id: "updates", label: "Just keep me updated" },
  { id: "not_interested", label: "Not interested in the tech side" },
];

// Contact method options
const contactMethodOptions = [
  { id: "email", label: "Email" },
  { id: "text", label: "Text" },
  { id: "whatsapp", label: "WhatsApp" },
];

// Profile visibility options
const visibilityOptions = [
  { id: "public", label: "Public to all members" },
  { id: "searchable", label: "Searchable, but contact requires permission" },
  { id: "private", label: "Private - admin introductions only" },
];

// Communication preferences
const communicationOptions = [
  { id: "all", label: "All updates and opportunities" },
  { id: "ai_intros", label: "AI-suggested introductions" },
  { id: "major", label: "Major developments only" },
  { id: "minimal", label: "Minimal contact" },
];

interface FormData {
  // Section 1: The Basics
  fullName: string;
  preferredName: string;
  email: string;
  phone: string;
  preferredContactMethods: string[];
  currentLocation: string;
  isNomadic: boolean;
  nomadicBaseLocation: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  unknownBirthTime: boolean;

  // Section 2: Gifts & Identity
  primaryRole: string;
  identityRoles: string[];
  identityRolesOther: string;
  skill1: string;
  skill2: string;
  skill3: string;
  website: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  tiktok: string;
  youtube: string;
  facebook: string;
  otherSocial: string;

  // Section 3: Alignment Check
  newEarthMeaning: string;
  primaryIntention: string;
  sovereigntyMeaning: string;

  // Section 4: Give & Receive
  uniqueGift: string;
  receiveFromCommunity: string;
  openToShareResources: string;
  physicalResources: string[];
  resourceLocation: string;
  resourceOther: string;
  sharingWillingness: string;

  // Section 5: Community & Connection
  howFoundUs: string;
  howFoundUsDetail: string;
  howFoundUsOther: string;
  existingConnections: string;
  otherCommunities: string;
  seekingConnections: string;

  // Section 6: Ecosystem Development
  engagementStyles: string[];
  techAIRelationship: string;
  improveSocialNetworks: string;
  ecosystemContribution: string;
  devSkills: string;
  excitementLevel: number;

  // Section 7: Preferences
  profileVisibility: string;
  communicationPrefs: string[];
}

const initialFormData: FormData = {
  fullName: "",
  preferredName: "",
  email: "",
  phone: "",
  preferredContactMethods: [],
  currentLocation: "",
  isNomadic: false,
  nomadicBaseLocation: "",
  birthDate: "",
  birthTime: "",
  birthLocation: "",
  unknownBirthTime: false,
  primaryRole: "",
  identityRoles: [],
  identityRolesOther: "",
  skill1: "",
  skill2: "",
  skill3: "",
  website: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  tiktok: "",
  youtube: "",
  facebook: "",
  otherSocial: "",
  newEarthMeaning: "",
  primaryIntention: "",
  sovereigntyMeaning: "",
  uniqueGift: "",
  receiveFromCommunity: "",
  openToShareResources: "",
  physicalResources: [],
  resourceLocation: "",
  resourceOther: "",
  sharingWillingness: "",
  howFoundUs: "",
  howFoundUsDetail: "",
  howFoundUsOther: "",
  existingConnections: "",
  otherCommunities: "",
  seekingConnections: "",
  engagementStyles: [],
  techAIRelationship: "",
  improveSocialNetworks: "",
  ecosystemContribution: "",
  devSkills: "",
  excitementLevel: 5,
  profileVisibility: "",
  communicationPrefs: [],
};

// Countdown timer end date: January 26, 2026 at 11:59 PM PST
const COUNTDOWN_END_DATE = new Date("2026-01-27T07:59:00Z"); // 11:59 PM PST = 7:59 AM UTC next day

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = COUNTDOWN_END_DATE.getTime() - now.getTime();

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false,
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft.expired) {
    return (
      <div className="text-white/60 text-sm">
        This offer has expired
      </div>
    );
  }

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-black/60 border border-[#FACF39]/40 rounded-lg px-3 py-2 min-w-[3.5rem]">
        <span className="text-2xl md:text-3xl font-bold text-[#FACF39]" style={{ fontFamily: "Bourton, sans-serif" }}>
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="text-xs text-white/60 mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2 md:gap-3">
      <TimeBlock value={timeLeft.days} label="DAYS" />
      <span className="text-[#FACF39] text-xl font-bold mb-5">:</span>
      <TimeBlock value={timeLeft.hours} label="HOURS" />
      <span className="text-[#FACF39] text-xl font-bold mb-5">:</span>
      <TimeBlock value={timeLeft.minutes} label="MINS" />
      <span className="text-[#FACF39] text-xl font-bold mb-5">:</span>
      <TimeBlock value={timeLeft.seconds} label="SECS" />
    </div>
  );
}

function WordCounter({ text, minWords }: { text: string; minWords: number }) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const isValid = wordCount >= minWords;

  return (
    <div className={`mt-1 text-xs ${isValid ? "text-green-400" : "text-white/50"}`}>
      {wordCount}/{minWords} words {isValid && <Check className="inline h-3 w-3" />}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2
        className="text-2xl font-bold text-[#FACF39]"
        style={{ fontFamily: "Bourton, sans-serif" }}
      >
        {title}
      </h2>
      {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
    </div>
  );
}

function EmergenceFollowupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 7;

  // Pre-fill from URL params
  useEffect(() => {
    const name = searchParams.get("name") || "";
    const email = searchParams.get("email") || "";
    const phone = searchParams.get("phone") || "";

    if (name || email || phone) {
      setFormData((prev) => ({
        ...prev,
        fullName: name || prev.fullName,
        email: email || prev.email,
        phone: phone || prev.phone,
      }));
    }
  }, [searchParams]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const current = prev[field] as string[];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const getWordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // The Basics
        const hasBirthTime = formData.unknownBirthTime || formData.birthTime.trim().length > 0;
        return (
          formData.fullName.trim().length > 0 &&
          formData.email.includes("@") &&
          formData.phone.trim().length > 0 &&
          formData.currentLocation.trim().length > 0 &&
          formData.birthDate.trim().length > 0 &&
          hasBirthTime &&
          formData.birthLocation.trim().length > 0
        );
      case 2: // Gifts & Identity
        return formData.primaryRole.trim().length > 0;
      case 3: // Alignment Check
        return (
          getWordCount(formData.newEarthMeaning) >= 20 &&
          getWordCount(formData.primaryIntention) >= 20 &&
          getWordCount(formData.sovereigntyMeaning) >= 20
        );
      case 4: // Give & Receive
        return (
          getWordCount(formData.uniqueGift) >= 20 &&
          getWordCount(formData.receiveFromCommunity) >= 20
        );
      case 5: // Community & Connection
        return formData.howFoundUs.trim().length > 0;
      case 6: // Ecosystem Development
        return (
          formData.engagementStyles.length > 0 &&
          getWordCount(formData.techAIRelationship) >= 20 &&
          getWordCount(formData.improveSocialNetworks) >= 20
        );
      case 7: // Preferences
        return (
          formData.profileVisibility.length > 0 &&
          formData.communicationPrefs.length > 0
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(7)) {
      setError("Please complete all required fields.");
      return;
    }

    setStatus("submitting");
    setError(null);

    const payload = {
      // Section 1
      name: formData.fullName,
      preferredName: formData.preferredName,
      email: formData.email,
      phone: formData.phone,
      preferredContactMethods: formData.preferredContactMethods,
      currentLocation: formData.currentLocation,
      isNomadic: formData.isNomadic,
      nomadicBaseLocation: formData.nomadicBaseLocation,
      birthDate: formData.birthDate,
      birthTime: formData.unknownBirthTime ? "unknown" : formData.birthTime,
      birthLocation: formData.birthLocation,

      // Section 2
      primaryRole: formData.primaryRole,
      identityRoles: formData.identityRoles,
      identityRolesOther: formData.identityRolesOther,
      skills: [formData.skill1, formData.skill2, formData.skill3].filter(Boolean),
      website: formData.website,
      instagram: formData.instagram,
      twitter: formData.twitter,
      linkedin: formData.linkedin,
      tiktok: formData.tiktok,
      youtube: formData.youtube,
      facebook: formData.facebook,
      otherSocial: formData.otherSocial,

      // Section 3
      newEarthMeaning: formData.newEarthMeaning,
      primaryIntention: formData.primaryIntention,
      sovereigntyMeaning: formData.sovereigntyMeaning,

      // Section 4
      uniqueGift: formData.uniqueGift,
      receiveFromCommunity: formData.receiveFromCommunity,
      openToShareResources: formData.openToShareResources,
      physicalResources: formData.physicalResources,
      resourceLocation: formData.resourceLocation,
      resourceOther: formData.resourceOther,
      sharingWillingness: formData.sharingWillingness,

      // Section 5
      howFoundUs: formData.howFoundUs,
      howFoundUsDetail: formData.howFoundUsDetail,
      howFoundUsOther: formData.howFoundUsOther,
      existingConnections: formData.existingConnections,
      otherCommunities: formData.otherCommunities,
      seekingConnections: formData.seekingConnections,

      // Section 6
      engagementStyles: formData.engagementStyles,
      techAIRelationship: formData.techAIRelationship,
      improveSocialNetworks: formData.improveSocialNetworks,
      ecosystemContribution: formData.ecosystemContribution,
      devSkills: formData.devSkills,
      excitementLevel: formData.excitementLevel,

      // Section 7
      profileVisibility: formData.profileVisibility,
      communicationPrefs: formData.communicationPrefs,

      // Meta
      source: "emergence-followup",
      contactId: searchParams.get("contactId") || "",
    };

    try {
      const res = await fetch("/api/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; details?: string };
        throw new Error(data.details || data.error || "Failed to submit");
      }

      setStatus("success");
      router.push("/emergence-followup/thank-you");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit questionnaire";
      setError(message);
      setStatus("error");
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError("Please complete all required fields before continuing.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepLabels = [
    "Basics",
    "Identity",
    "Alignment",
    "Give & Receive",
    "Community",
    "Ecosystem",
    "Preferences",
  ];

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden pt-24 pb-12">
        {/* Shader Background */}
        <div className="absolute inset-0 opacity-15">
          <iframe
            src="/shaders/flower-of-life/embed?domain=test.joinnewearthcollective.com"
            className="h-full w-full border-0"
            style={{ pointerEvents: "none" }}
            title="Sacred Geometry Background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center justify-center">
            <div className="relative h-16 w-16">
              <Image
                src="/brand/symbol.svg"
                alt="New Earth Collective"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1
            className="mb-4 text-4xl font-bold md:text-5xl"
            style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
          >
            <span className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] bg-clip-text text-transparent">
              Emergence Follow-Up
            </span>
          </h1>
          <p className="text-white/80">Thank you for attending The Emergence! Help us understand how we can best serve you and the collective.</p>
          <div className="mt-6 rounded-xl bg-[#FACF39]/10 border border-[#FACF39]/40 px-4 md:px-6 py-5">
            <div className="flex items-center mb-4">
              <div className="flex-1 flex justify-center">
                <span className="text-2xl md:text-2xl">✨</span>
              </div>
              <p className="text-[#FACF39] text-sm font-medium text-center px-2">
                <span className="md:hidden">Submit the questionnaire to unlock<br />an opportunity for free lifetime access<br />to our online platform!</span>
                <span className="hidden md:inline">Submit the questionnaire to unlock an opportunity to get free lifetime access to our online platform!</span>
              </p>
              <div className="flex-1 flex justify-center">
                <span className="text-2xl md:text-2xl">✨</span>
              </div>
            </div>
            <p className="text-white/70 text-xs mb-3 uppercase tracking-wider">Offer expires in:</p>
            <CountdownTimer />
          </div>
          <p className="text-white/50 text-sm mt-3">Estimated time: 12-15 minutes</p>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Mobile: Simple progress bar */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/80" style={{ fontFamily: "Bourton, sans-serif" }}>
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-[#FACF39]">{stepLabels[currentStep - 1]}</span>
          </div>
          <div className="h-2 bg-[#FACF39]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FACF39] rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop: Stepped circles */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between mb-2">
            {stepLabels.map((_, idx) => {
              const step = idx + 1;
              return (
                <div key={step} className="flex items-center flex-shrink-0">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                      currentStep >= step
                        ? "bg-[#FACF39] text-black"
                        : "border border-[#FACF39]/30 text-[#FACF39]/50"
                    }`}
                    style={{ fontFamily: "Bourton, sans-serif" }}
                  >
                    {currentStep > step ? <Check className="h-5 w-5" /> : step}
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`h-1 w-10 md:w-12 mx-2 rounded ${
                        currentStep > step ? "bg-[#FACF39]" : "bg-[#FACF39]/20"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-white/60">
            {stepLabels.map((label, idx) => (
              <span key={idx} className="text-center flex-1">{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="mx-auto max-w-3xl px-4 pb-24">
        <div className="rounded-lg border border-[#FACF39]/20 bg-black/60 p-6 md:p-10 backdrop-blur">

          {/* Step 1: The Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <SectionHeader
                title="Section 1: The Basics"
                subtitle="Contact information and birth data for your energetic blueprint"
              />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/90">Contact Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Full Name *</label>
                    <Input
                      className={inputClass}
                      placeholder="Your full name"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Preferred Name</label>
                    <Input
                      className={inputClass}
                      placeholder="If different from full name"
                      value={formData.preferredName}
                      onChange={(e) => updateField("preferredName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Email *</label>
                    <Input
                      type="email"
                      className={inputClass}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-white/80">Phone *</label>
                    <Input
                      type="tel"
                      className={inputClass}
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80">Preferred contact method</label>
                  <div className="flex flex-wrap gap-4">
                    {contactMethodOptions.map((option) => (
                      <label key={option.id} className="flex items-center gap-2 text-white/80 cursor-pointer">
                        <Checkbox
                          className={checkboxClass}
                          checked={formData.preferredContactMethods.includes(option.id)}
                          onCheckedChange={() => toggleArrayField("preferredContactMethods", option.id)}
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white/90">Location</h3>

                <div className="space-y-2">
                  <label className="text-sm text-white/80">Current city/region *</label>
                  <LocationAutocomplete
                    name="currentLocation"
                    className={inputClass}
                    placeholder="City, State/Country"
                    value={formData.currentLocation}
                    onSelect={(location) => updateField("currentLocation", location)}
                  />
                </div>

                <label className="flex items-center gap-3 text-white/80 cursor-pointer">
                  <Checkbox
                    className={checkboxClass}
                    checked={formData.isNomadic}
                    onCheckedChange={(checked) => updateField("isNomadic", !!checked)}
                  />
                  <span className="text-sm">I'm nomadic/location-flexible</span>
                </label>

                {formData.isNomadic && (
                  <div className="space-y-2 ml-8">
                    <label className="text-sm text-white/80">Where do you spend most time?</label>
                    <Input
                      className={inputClass}
                      placeholder="Primary base location"
                      value={formData.nomadicBaseLocation}
                      onChange={(e) => updateField("nomadicBaseLocation", e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Birth Information */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white/90">Birth Information</h3>
                <p className="text-sm italic text-white/50">For energetic blueprint calculations (Human Design, Astrology, Gene Keys)</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 relative z-30">
                    <label className="text-sm text-white/80">Birth Date *</label>
                    <DateTimePicker
                      name="birthDate"
                      placeholder="Select date"
                      className={inputClass}
                      showYearDropdown={true}
                      showMonthDropdown={true}
                      dropdownMode="select"
                      yearDropdownItemNumber={100}
                      value={formData.birthDate ? new Date(formData.birthDate) : null}
                      onChange={(date) => updateField("birthDate", date ? date.toISOString() : "")}
                    />
                  </div>
                  <div className="space-y-2 relative z-20">
                    <label className="text-sm text-white/80">Birth Time {!formData.unknownBirthTime && "*"}</label>
                    <BirthTimePicker
                      name="birthTime"
                      value={formData.birthTime}
                      onChange={(time) => updateField("birthTime", time)}
                      disabled={formData.unknownBirthTime}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 text-white/80 cursor-pointer">
                  <Checkbox
                    className={checkboxClass}
                    checked={formData.unknownBirthTime}
                    onCheckedChange={(checked) => {
                      updateField("unknownBirthTime", !!checked);
                      if (checked) updateField("birthTime", "");
                    }}
                  />
                  <span className="text-sm">I don't know my exact birth time</span>
                </label>

                <div className="space-y-2 relative z-10">
                  <label className="text-sm text-white/80">Birth Location *</label>
                  <LocationAutocomplete
                    name="birthLocation"
                    className={inputClass}
                    placeholder="City, State/Country"
                    value={formData.birthLocation}
                    onSelect={(location) => updateField("birthLocation", location)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Gifts & Identity */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <SectionHeader
                title="Section 2: Your Gifts & Identity"
                subtitle="Help us understand what you bring to the collective"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Primary Role/Calling *
                </label>
                <p className="text-xs text-white/50 mb-2">One sentence describing what you do</p>
                <Input
                  className={inputClass}
                  placeholder="e.g., Breathwork facilitator and conscious entrepreneur"
                  value={formData.primaryRole}
                  onChange={(e) => updateField("primaryRole", e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-white">
                  Do you identify with any of these? (check all that apply)
                </label>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-[#FACF39]/80 mb-2">Facilitators & Healers</h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {facilitatorRoles.map((role) => (
                        <label key={role} className="flex items-center gap-3 text-white/80 cursor-pointer">
                          <Checkbox
                            className={checkboxClass}
                            checked={formData.identityRoles.includes(role)}
                            onCheckedChange={() => toggleArrayField("identityRoles", role)}
                          />
                          <span className="text-sm">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[#FACF39]/80 mb-2">Creators & Builders</h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {creatorRoles.map((role) => (
                        <label key={role} className="flex items-center gap-3 text-white/80 cursor-pointer">
                          <Checkbox
                            className={checkboxClass}
                            checked={formData.identityRoles.includes(role)}
                            onCheckedChange={() => toggleArrayField("identityRoles", role)}
                          />
                          <span className="text-sm">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <Input
                  className={inputClass}
                  placeholder="Other (please specify)"
                  value={formData.identityRolesOther}
                  onChange={(e) => updateField("identityRolesOther", e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <label className="text-sm font-medium text-white">
                  Top 3 skills you could contribute to community projects
                </label>
                <div className="grid gap-3">
                  <Input
                    className={inputClass}
                    placeholder="Skill 1"
                    value={formData.skill1}
                    onChange={(e) => updateField("skill1", e.target.value)}
                  />
                  <Input
                    className={inputClass}
                    placeholder="Skill 2"
                    value={formData.skill2}
                    onChange={(e) => updateField("skill2", e.target.value)}
                  />
                  <Input
                    className={inputClass}
                    placeholder="Skill 3"
                    value={formData.skill3}
                    onChange={(e) => updateField("skill3", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <label className="text-sm font-medium text-white">Online Presence (optional)</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    className={inputClass}
                    placeholder="Website URL"
                    value={formData.website}
                    onChange={(e) => updateField("website", e.target.value)}
                  />
                  <Input
                    className={inputClass}
                    placeholder="Instagram handle"
                    value={formData.instagram}
                    onChange={(e) => updateField("instagram", e.target.value)}
                  />
                  <Input
                    className={inputClass}
                    placeholder="Twitter/X handle"
                    value={formData.twitter}
                    onChange={(e) => updateField("twitter", e.target.value)}
                  />
                  <Input
                    className={inputClass}
                    placeholder="LinkedIn URL"
                    value={formData.linkedin}
                    onChange={(e) => updateField("linkedin", e.target.value)}
                  />
                  <Input
                    className={inputClass}
                    placeholder="TikTok handle"
                    value={formData.tiktok}
                    onChange={(e) => updateField("tiktok", e.target.value)}
                  />
                  <Input
                    className={inputClass}
                    placeholder="YouTube channel"
                    value={formData.youtube}
                    onChange={(e) => updateField("youtube", e.target.value)}
                  />
                  <Input
                    className={inputClass}
                    placeholder="Facebook URL"
                    value={formData.facebook}
                    onChange={(e) => updateField("facebook", e.target.value)}
                  />
                  <Input
                    className={inputClass}
                    placeholder="Other social/portfolio link"
                    value={formData.otherSocial}
                    onChange={(e) => updateField("otherSocial", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Alignment Check */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <SectionHeader
                title="Section 3: Alignment Check"
                subtitle="Help us understand your values and vision"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  What does "New Earth" mean to you? *
                </label>
                <Textarea
                  className={inputClass}
                  rows={4}
                  placeholder="Share your understanding of New Earth..."
                  value={formData.newEarthMeaning}
                  onChange={(e) => updateField("newEarthMeaning", e.target.value)}
                />
                <WordCounter text={formData.newEarthMeaning} minWords={20} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  What is your primary intention for joining? *
                </label>
                <Textarea
                  className={inputClass}
                  rows={5}
                  placeholder="Share your intention..."
                  value={formData.primaryIntention}
                  onChange={(e) => updateField("primaryIntention", e.target.value)}
                />
                <WordCounter text={formData.primaryIntention} minWords={20} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  What does "sovereignty" mean to you? *
                </label>
                <Textarea
                  className={inputClass}
                  rows={4}
                  placeholder="Share your understanding of sovereignty..."
                  value={formData.sovereigntyMeaning}
                  onChange={(e) => updateField("sovereigntyMeaning", e.target.value)}
                />
                <WordCounter text={formData.sovereigntyMeaning} minWords={20} />
              </div>
            </div>
          )}

          {/* Step 4: Give & Receive */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <SectionHeader
                title="Section 4: Give & Receive"
                subtitle="What you offer and what you seek"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  What unique gift or perspective do you want to share with this community? *
                </label>
                <Textarea
                  className={inputClass}
                  rows={5}
                  placeholder="Share your unique gifts..."
                  value={formData.uniqueGift}
                  onChange={(e) => updateField("uniqueGift", e.target.value)}
                />
                <WordCounter text={formData.uniqueGift} minWords={20} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  What would you like to receive from this community? *
                </label>
                <Textarea
                  className={inputClass}
                  rows={5}
                  placeholder="Share what you hope to receive..."
                  value={formData.receiveFromCommunity}
                  onChange={(e) => updateField("receiveFromCommunity", e.target.value)}
                />
                <WordCounter text={formData.receiveFromCommunity} minWords={20} />
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="space-y-2">
                  <p className="text-sm text-white/70">
                    It is one of our highest intentions to build systems of exchange that are reciprocal for all community members involved.
                  </p>
                  <label className="text-sm font-medium text-white">
                    Under the right circumstances, are you open to share any resources with the community?
                  </label>
                </div>
                <RadioGroup
                  value={formData.openToShareResources}
                  onValueChange={(value: string) => updateField("openToShareResources", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="yes_free" id="share-yes-free" className="border-[#FACF39]/50 text-[#FACF39]" />
                    <Label htmlFor="share-yes-free" className="text-white/80 cursor-pointer">Yes, for free</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="yes_depends" id="share-yes-depends" className="border-[#FACF39]/50 text-[#FACF39]" />
                    <Label htmlFor="share-yes-depends" className="text-white/80 cursor-pointer">Yes, depending on the exchange/project</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="no" id="share-no" className="border-[#FACF39]/50 text-[#FACF39]" />
                    <Label htmlFor="share-no" className="text-white/80 cursor-pointer">No, not ready to share yet</Label>
                  </div>
                </RadioGroup>
              </div>

              {(formData.openToShareResources === "yes_free" || formData.openToShareResources === "yes_depends") && (
                <>
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-white">
                      What resources can you share? (Check all that apply)
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {resourceOptions.map((option) => (
                        <div key={option.id}>
                          <label className="flex items-center gap-3 text-white/80 cursor-pointer">
                            <Checkbox
                              className={checkboxClass}
                              checked={formData.physicalResources.includes(option.id)}
                              onCheckedChange={() => toggleArrayField("physicalResources", option.id)}
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                          {option.hasLocation && formData.physicalResources.includes(option.id) && (
                            <Input
                              className={`${inputClass} mt-2 ml-8`}
                              placeholder="Location of land/space"
                              value={formData.resourceLocation}
                              onChange={(e) => updateField("resourceLocation", e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <Input
                      className={inputClass}
                      placeholder="Other resources (please specify)"
                      value={formData.resourceOther}
                      onChange={(e) => updateField("resourceOther", e.target.value)}
                    />
                  </div>

                </>
              )}
            </div>
          )}

          {/* Step 5: Community & Connection */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <SectionHeader
                title="Section 5: Community & Connection"
                subtitle="Your network and connections"
              />

              <div className="space-y-4">
                <label className="text-sm font-medium text-white">
                  How did you find us? *
                </label>
                <RadioGroup
                  value={formData.howFoundUs}
                  onValueChange={(value: string) => updateField("howFoundUs", value)}
                  className="space-y-3"
                >
                  {discoveryOptions.map((option) => (
                    <div key={option.id}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={option.id} id={`discovery-${option.id}`} className="border-[#FACF39]/50 text-[#FACF39]" />
                        <Label htmlFor={`discovery-${option.id}`} className="text-white/80 cursor-pointer">{option.label}</Label>
                      </div>
                      {formData.howFoundUs === option.id && (
                        <Input
                          className={`${inputClass} mt-2 ml-6`}
                          placeholder={option.detailPlaceholder}
                          value={formData.howFoundUsDetail}
                          onChange={(e) => updateField("howFoundUsDetail", e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                  <div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="other" id="discovery-other" className="border-[#FACF39]/50 text-[#FACF39]" />
                      <Label htmlFor="discovery-other" className="text-white/80 cursor-pointer">Other</Label>
                    </div>
                    {formData.howFoundUs === "other" && (
                      <Input
                        className={`${inputClass} mt-2 ml-6`}
                        placeholder="Please specify"
                        value={formData.howFoundUsOther}
                        onChange={(e) => updateField("howFoundUsOther", e.target.value)}
                      />
                    )}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Who do you already know in this community?
                </label>
                <Textarea
                  className={inputClass}
                  rows={2}
                  placeholder="Names of people you know (if any)"
                  value={formData.existingConnections}
                  onChange={(e) => updateField("existingConnections", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  What other communities/networks are you part of?
                </label>
                <p className="text-xs text-white/50 mb-2">Helps us understand overlap and partnerships</p>
                <Textarea
                  className={inputClass}
                  rows={3}
                  placeholder="e.g., Burning Man community, local breathwork circles, etc."
                  value={formData.otherCommunities}
                  onChange={(e) => updateField("otherCommunities", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  What types of people would you like to connect with?
                </label>
                <Textarea
                  className={inputClass}
                  rows={3}
                  placeholder="Land Developers, Decentralized Tech Developers, Somatic Healers, Spiritual Guides ..."
                  value={formData.seekingConnections}
                  onChange={(e) => updateField("seekingConnections", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 6: Ecosystem Development */}
          {currentStep === 6 && (
            <div className="space-y-8">
              <SectionHeader
                title="Section 6: Ecosystem Development"
                subtitle="How you want to engage and help build"
              />

              <div className="space-y-4">
                <label className="text-sm font-medium text-white">
                  How do you want to engage? (check all that apply) *
                </label>
                <div className="grid gap-2">
                  {engagementOptions.map((option) => (
                    <label key={option} className="flex items-center gap-3 text-white/80 cursor-pointer">
                      <Checkbox
                        className={checkboxClass}
                        checked={formData.engagementStyles.includes(option)}
                        onCheckedChange={() => toggleArrayField("engagementStyles", option)}
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  What is your relationship with technology/AI? *
                </label>
                <p className="text-xs text-white/50 mb-2">Helps us build tools that serve you</p>
                <Textarea
                  className={inputClass}
                  rows={4}
                  placeholder="Describe your relationship with technology and AI..."
                  value={formData.techAIRelationship}
                  onChange={(e) => updateField("techAIRelationship", e.target.value)}
                />
                <WordCounter text={formData.techAIRelationship} minWords={20} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  If you could improve social media, how would you? *
                </label>
                <p className="text-xs text-white/50 mb-2">Directly informs our ecosystem development</p>
                <Textarea
                  className={inputClass}
                  rows={4}
                  placeholder="Share your vision for better social networks..."
                  value={formData.improveSocialNetworks}
                  onChange={(e) => updateField("improveSocialNetworks", e.target.value)}
                />
                <WordCounter text={formData.improveSocialNetworks} minWords={20} />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white">
                  Want to help build our online ecosystem?
                </label>
                <RadioGroup
                  value={formData.ecosystemContribution}
                  onValueChange={(value: string) => updateField("ecosystemContribution", value)}
                  className="space-y-2"
                >
                  {ecosystemContributionOptions.map((option) => (
                    <div key={option.id}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={option.id} id={`ecosystem-${option.id}`} className="border-[#FACF39]/50 text-[#FACF39]" />
                        <Label htmlFor={`ecosystem-${option.id}`} className="text-white/80 cursor-pointer">{option.label}</Label>
                      </div>
                      {option.id === "dev" && formData.ecosystemContribution === "dev" && (
                        <Input
                          className={`${inputClass} mt-2 ml-6`}
                          placeholder="What technical development skills do you have? (optional)"
                          value={formData.devSkills}
                          onChange={(e) => updateField("devSkills", e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <label className="text-sm font-medium text-white">
                  Excitement level (1-10)
                </label>
                <p className="text-xs text-white/50">How excited are you about what we're building?</p>
                <div className="px-2">
                  <Slider
                    value={[formData.excitementLevel]}
                    onValueChange={(value: number[]) => updateField("excitementLevel", value[0] ?? 5)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>1</span>
                    <span className="text-[#FACF39] font-bold text-lg">{formData.excitementLevel}</span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Preferences */}
          {currentStep === 7 && (
            <div className="space-y-8">
              <SectionHeader
                title="Section 7: Preferences"
                subtitle="Privacy and communication settings"
              />

              <div className="space-y-2 mb-4">
                <p className="text-sm text-white/70">
                  It is one of our highest intentions to protect your data as we build this ecosystem. We will not share your data with any 3rd parties unless explicitly expressed.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-white">
                  When we launch the ecosystem, how visible would you like your profile to be? *
                </label>
                <RadioGroup
                  value={formData.profileVisibility}
                  onValueChange={(value: string) => updateField("profileVisibility", value)}
                  className="space-y-2"
                >
                  {visibilityOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.id} id={`visibility-${option.id}`} className="border-[#FACF39]/50 text-[#FACF39]" />
                      <Label htmlFor={`visibility-${option.id}`} className="text-white/80 cursor-pointer">{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                <label className="text-sm font-medium text-white">
                  Communication preferences *
                </label>
                <p className="text-xs text-white/50 mb-2">Check all that apply</p>
                <div className="grid gap-2">
                  {communicationOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-3 text-white/80 cursor-pointer">
                      <Checkbox
                        className={checkboxClass}
                        checked={formData.communicationPrefs.includes(option.id)}
                        onCheckedChange={() => toggleArrayField("communicationPrefs", option.id)}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 rounded-lg bg-[#FACF39]/10 border border-[#FACF39]/30">
                <p className="text-sm text-white/80">
                  <span className="font-semibold text-[#FACF39]">You're almost done!</span><br />
                  Click "Submit" below to complete your questionnaire. We'll review your responses and be in touch soon.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="mt-6 text-center text-sm text-red-400">{error}</p>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-[#FACF39]/30 text-[#FACF39] hover:bg-[#FACF39]/10 disabled:opacity-30"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] font-bold text-black hover:shadow-lg hover:shadow-[#f6c43f]/30"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={status === "submitting"}
                className="bg-gradient-to-r from-[#f3a51c] via-[#f6c43f] to-[#f6e45b] px-8 font-bold text-black hover:shadow-lg hover:shadow-[#f6c43f]/30"
                style={{ fontFamily: "Bourton, sans-serif" }}
              >
                {status === "submitting" ? "Submitting..." : "Submit"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmergenceFollowupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <EmergenceFollowupForm />
    </Suspense>
  );
}
