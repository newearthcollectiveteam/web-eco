"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { DateTimePicker } from "~/components/ui/date-time-picker";
import { BirthTimePicker } from "~/components/ui/birth-time-picker";
import { LocationAutocomplete } from "~/components/ui/location-autocomplete";
import { SelectionPill } from "./selection-pill";
import type { ScreenConfig, FormData } from "./types";
import { screens } from "./screens";

const inputClass =
  "bg-black/40 text-white text-base border border-[#FACF39]/30 focus:border-[#FACF39] focus:ring-[#FACF39]/20 placeholder:text-neutral-500";

interface QuestionScreenProps {
  screen: ScreenConfig;
  data: FormData;
  update: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  toggleArray: (field: keyof FormData, value: string) => void;
  referrer?: string;
}

// Communication preference options
const commOptions = [
  { id: "all", label: "All updates and opportunities" },
  { id: "ai_intros", label: "CI-suggested introductions" },
  { id: "major", label: "Major developments only" },
  { id: "minimal", label: "Minimal contact" },
];

// Gift options (for give-receive screen)
const giftOptions = [
  { id: "healing", label: "Healing and facilitation" },
  { id: "creative-arts", label: "Creative arts and expression" },
  { id: "technical", label: "Technical and building skills" },
  { id: "leadership", label: "Organizational and leadership" },
  { id: "teaching", label: "Teaching and mentorship" },
  { id: "financial", label: "Financial resources" },
  { id: "land-space", label: "Land, space, or venue access" },
  { id: "music", label: "Music and sound" },
  { id: "farming", label: "Farming and food production" },
  { id: "marketing", label: "Marketing and community growth" },
  { id: "legal-business", label: "Legal, accounting, or business" },
  { id: "deep-listening", label: "Deep listening and holding space" },
];

// Seek options (for give-receive screen)
const seekOptions = [
  { id: "connection", label: "Authentic connection and belonging" },
  { id: "healing", label: "Healing and personal growth support" },
  { id: "collaboration", label: "Collaboration on meaningful projects" },
  { id: "land-access", label: "Access to land and shared spaces" },
  { id: "skill-sharing", label: "Skill-sharing and learning" },
  { id: "business-support", label: "Business and entrepreneurial support" },
  { id: "spiritual", label: "Spiritual community and practice partners" },
  { id: "transitions", label: "Help navigating life transitions" },
  { id: "accountability", label: "Accountability and honest feedback" },
  { id: "fun", label: "Fun, play, and celebration" },
  { id: "mentorship", label: "Mentorship from experienced guides" },
];

export function QuestionScreen({
  screen,
  data,
  update,
  toggleArray,
  referrer,
}: QuestionScreenProps) {
  const [showOther, setShowOther] = useState(false);

  const isAtMax = (field: keyof FormData) => {
    if (!screen.maxSelect) return false;
    const arr = data[field] as string[];
    return arr.length >= screen.maxSelect;
  };

  return (
    <div className="flex min-h-0 flex-col gap-6">
      {/* Title */}
      <div>
        <h1
          className="text-2xl font-bold text-white sm:text-3xl"
          style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.03em" }}
        >
          {screen.title}
        </h1>
        {screen.subtitle && (
          <p className="mt-2 text-sm text-white/60">{screen.subtitle}</p>
        )}
      </div>

      {/* TEXT: name screen */}
      {screen.type === "text" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Full Name *
            </label>
            <Input
              className={inputClass}
              placeholder="Your full name"
              value={data.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Preferred Name
            </label>
            <Input
              className={inputClass}
              placeholder="What should we call you?"
              value={data.preferredName}
              onChange={(e) => update("preferredName", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* TEXT-PILLS: contact screen */}
      {screen.type === "text-pills" && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Email *
            </label>
            <Input
              type="email"
              className={inputClass}
              placeholder="you@example.com"
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Phone
            </label>
            <Input
              type="tel"
              className={inputClass}
              placeholder="(555) 123-4567"
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Preferred contact method
            </label>
            <div className="flex flex-wrap gap-2">
              {screen.options?.map((opt) => (
                <SelectionPill
                  key={opt.id}
                  label={opt.label}
                  selected={data.preferredContactMethods.includes(opt.id)}
                  onToggle={() => toggleArray("preferredContactMethods", opt.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AUTOCOMPLETE: location screen */}
      {screen.type === "autocomplete" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Current city/region *
            </label>
            <LocationAutocomplete
              name="currentLocation"
              className={inputClass}
              placeholder="City, State/Country"
              value={data.currentLocation}
              onSelect={(loc) => update("currentLocation", loc)}
            />
          </div>
          <button
            type="button"
            className={`flex min-h-[44px] items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-all active:scale-[0.97] ${
              data.isNomadic
                ? "border-[#FACF39] bg-[#FACF39]/15 text-white"
                : "border-white/15 bg-white/5 text-white/70"
            }`}
            onClick={() => update("isNomadic", !data.isNomadic)}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                data.isNomadic
                  ? "border-[#FACF39] bg-[#FACF39] text-black"
                  : "border-white/30"
              }`}
            >
              {data.isNomadic && "✓"}
            </span>
            I'm nomadic / location-flexible
          </button>
          {data.isNomadic && (
            <div className="space-y-2">
              <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
                Where do you spend most time?
              </label>
              <Input
                className={inputClass}
                placeholder="Primary base location"
                value={data.nomadicBaseLocation}
                onChange={(e) => update("nomadicBaseLocation", e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* BIRTH-INFO */}
      {screen.type === "birth-info" && (
        <div className="space-y-4">
          <div className="relative z-30 space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Birth Date *
            </label>
            <DateTimePicker
              name="birthDate"
              placeholder="Select date"
              className={inputClass}
              showYearDropdown
              showMonthDropdown
              dropdownMode="select"
              yearDropdownItemNumber={100}
              value={data.birthDate ? new Date(data.birthDate) : null}
              onChange={(date) =>
                update("birthDate", date ? date.toISOString() : "")
              }
            />
          </div>
          <div className="relative z-20 space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Birth Time {!data.unknownBirthTime && "*"}
            </label>
            <BirthTimePicker
              name="birthTime"
              value={data.birthTime}
              onChange={(time) => update("birthTime", time)}
              disabled={data.unknownBirthTime}
            />
          </div>
          <button
            type="button"
            className={`flex min-h-[44px] items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-all active:scale-[0.97] ${
              data.unknownBirthTime
                ? "border-[#FACF39] bg-[#FACF39]/15 text-white"
                : "border-white/15 bg-white/5 text-white/70"
            }`}
            onClick={() => {
              update("unknownBirthTime", !data.unknownBirthTime);
              if (!data.unknownBirthTime) update("birthTime", "");
            }}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                data.unknownBirthTime
                  ? "border-[#FACF39] bg-[#FACF39] text-black"
                  : "border-white/30"
              }`}
            >
              {data.unknownBirthTime && "✓"}
            </span>
            I don't know my exact birth time
          </button>
          <div className="relative z-10 space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Birth Location *
            </label>
            <LocationAutocomplete
              name="birthLocation"
              className={inputClass}
              placeholder="City, State/Country"
              value={data.birthLocation}
              onSelect={(loc) => update("birthLocation", loc)}
            />
          </div>
        </div>
      )}

      {/* MULTI-SELECT */}
      {screen.type === "multi-select" && (
        <div className="space-y-3">
          {screen.minSelect && screen.maxSelect && (
            <p className="text-xs text-white/40">
              {(data[screen.field as keyof FormData] as string[]).length} selected
              {screen.maxSelect && ` (max ${screen.maxSelect})`}
            </p>
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {screen.options?.map((opt) => {
              const arr = data[screen.field as keyof FormData] as string[];
              const selected = arr.includes(opt.id);
              return (
                <SelectionPill
                  key={opt.id}
                  label={opt.label}
                  selected={selected}
                  onToggle={() =>
                    toggleArray(screen.field as keyof FormData, opt.id)
                  }
                  disabled={!selected && isAtMax(screen.field as keyof FormData)}
                />
              );
            })}
          </div>
          {screen.hasOther && (
            <>
              <SelectionPill
                label="Other"
                selected={showOther || !!(data[screen.otherField as keyof FormData] as string)}
                onToggle={() => {
                  if (showOther || (data[screen.otherField as keyof FormData] as string)) {
                    setShowOther(false);
                    update(screen.otherField as keyof FormData, "" as never);
                  } else {
                    setShowOther(true);
                  }
                }}
              />
              {(showOther || !!(data[screen.otherField as keyof FormData] as string)) && (
                <Input
                  className={inputClass}
                  placeholder={screen.otherPlaceholder || "Please specify..."}
                  value={(data[screen.otherField as keyof FormData] as string) || ""}
                  onChange={(e) =>
                    update(screen.otherField as keyof FormData, e.target.value as never)
                  }
                  autoFocus
                />
              )}
            </>
          )}
          {screen.id === "your-role" && (
            <div className="mt-2 space-y-2 border-t border-white/10 pt-4">
              <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
                Primary Role / Calling
              </label>
              <Input
                className={inputClass}
                placeholder="e.g., Breathwork facilitator and conscious entrepreneur"
                value={data.primaryRole}
                onChange={(e) => update("primaryRole", e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* SINGLE-SELECT */}
      {screen.type === "single-select" && (
        <div className="space-y-3">
          {screen.id === "found-us" && referrer && (
            <div className="rounded-lg border border-[#FACF39]/30 bg-[#FACF39]/10 px-4 py-2.5 text-sm text-[#FACF39]">
              Recommended by {referrer}
            </div>
          )}
          <div className="grid grid-cols-1 gap-2">
            {screen.options?.map((opt) => {
              const selected = (data[screen.field as keyof FormData] as string) === opt.id;
              return (
                <SelectionPill
                  key={opt.id}
                  label={opt.label}
                  selected={selected}
                  onToggle={() =>
                    update(screen.field as keyof FormData, opt.id as never)
                  }
                />
              );
            })}
          </div>
          {screen.detailOptions &&
            screen.detailField &&
            screen.detailOptions[data[screen.field as keyof FormData] as string] && (
              <Input
                className={inputClass}
                placeholder={screen.detailOptions[data[screen.field as keyof FormData] as string]}
                value={(data[screen.detailField as keyof FormData] as string) || ""}
                onChange={(e) =>
                  update(screen.detailField as keyof FormData, e.target.value as never)
                }
                autoFocus
              />
            )}
          {screen.hasOther && (
            <>
              <SelectionPill
                label="Other"
                selected={
                  (data[screen.field as keyof FormData] as string) === "other" || showOther
                }
                onToggle={() => {
                  const isCurrentlyOther =
                    (data[screen.field as keyof FormData] as string) === "other" || showOther;
                  if (isCurrentlyOther) {
                    update(screen.field as keyof FormData, "" as never);
                    update(screen.otherField as keyof FormData, "" as never);
                    setShowOther(false);
                  } else {
                    update(screen.field as keyof FormData, "other" as never);
                    setShowOther(true);
                  }
                }}
              />
              {((data[screen.field as keyof FormData] as string) === "other" || showOther) && (
                <Input
                  className={inputClass}
                  placeholder={screen.otherPlaceholder || "Please specify..."}
                  value={(data[screen.otherField as keyof FormData] as string) || ""}
                  onChange={(e) =>
                    update(screen.otherField as keyof FormData, e.target.value as never)
                  }
                  autoFocus
                />
              )}
            </>
          )}
        </div>
      )}

      {/* GIVE & RECEIVE (merged screen) */}
      {screen.type === "give-receive" && (
        <div className="space-y-6">
          {/* Give */}
          <div className="space-y-2">
            <label className="text-sm text-[#FACF39]/80" style={{ fontFamily: "Bourton, sans-serif" }}>
              What do you bring? (pick up to 5)
            </label>
            <p className="text-xs text-white/40">
              {data.uniqueGift.length} selected (max 5)
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {giftOptions.map((opt) => {
                const selected = data.uniqueGift.includes(opt.id);
                return (
                  <SelectionPill
                    key={opt.id}
                    label={opt.label}
                    selected={selected}
                    onToggle={() => toggleArray("uniqueGift", opt.id)}
                    disabled={!selected && data.uniqueGift.length >= 5}
                  />
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* Receive */}
          <div className="space-y-2">
            <label className="text-sm text-[#FACF39]/80" style={{ fontFamily: "Bourton, sans-serif" }}>
              What are you looking for? (pick up to 5)
            </label>
            <p className="text-xs text-white/40">
              {data.receiveFromCommunity.length} selected (max 5)
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {seekOptions.map((opt) => {
                const selected = data.receiveFromCommunity.includes(opt.id);
                return (
                  <SelectionPill
                    key={opt.id}
                    label={opt.label}
                    selected={selected}
                    onToggle={() => toggleArray("receiveFromCommunity", opt.id)}
                    disabled={!selected && data.receiveFromCommunity.length >= 5}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PREFERENCES (with opt-ins merged) */}
      {screen.type === "preferences" && (
        <div className="space-y-6">
          {/* Profile visibility */}
          <div className="space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Profile visibility
            </label>
            <div className="grid grid-cols-1 gap-2">
              {screen.options?.map((opt) => (
                <SelectionPill
                  key={opt.id}
                  label={opt.label}
                  selected={data.profileVisibility === opt.id}
                  onToggle={() => update("profileVisibility", opt.id)}
                />
              ))}
            </div>
          </div>

          {/* Communication prefs */}
          <div className="space-y-2">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Communication preferences
            </label>
            <div className="grid grid-cols-1 gap-2">
              {commOptions.map((opt) => (
                <SelectionPill
                  key={opt.id}
                  label={opt.label}
                  selected={data.communicationPrefs.includes(opt.id)}
                  onToggle={() => toggleArray("communicationPrefs", opt.id)}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* AI Phone Call — phrased as a question */}
          <div className="space-y-3">
            <label className="text-sm text-white/70" style={{ fontFamily: "Bourton, sans-serif" }}>
              Would you like to receive a brief AI-powered phone call?
            </label>
            <p className="text-xs text-white/40 leading-relaxed">
              This helps us learn more about your story, your gifts, and what
              you're looking for — so we can connect you with the right people faster.
            </p>
            <div className="flex gap-3">
              <SelectionPill
                label="Yes, call me"
                selected={data.aiPhoneCallOptIn}
                onToggle={() => update("aiPhoneCallOptIn", true)}
              />
              <SelectionPill
                label="No thanks"
                selected={!data.aiPhoneCallOptIn}
                onToggle={() => update("aiPhoneCallOptIn", false)}
              />
            </div>
          </div>

          {/* Marketing opt-in */}
          <div>
            <button
              type="button"
              className={`flex w-full min-h-[44px] items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all active:scale-[0.97] ${
                data.marketingOptIn
                  ? "border-[#FACF39] bg-[#FACF39]/15 text-white"
                  : "border-white/15 bg-white/5 text-white/70"
              }`}
              onClick={() => update("marketingOptIn", !data.marketingOptIn)}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                  data.marketingOptIn
                    ? "border-[#FACF39] bg-[#FACF39] text-black"
                    : "border-white/30"
                }`}
              >
                {data.marketingOptIn && "✓"}
              </span>
              <span>Keep me in the loop with updates, events, and opportunities</span>
            </button>
          </div>
        </div>
      )}

      {/* REVIEW */}
      {screen.type === "review" && <ReviewScreen data={data} />}
    </div>
  );
}

/** Compact review summary */
function ReviewScreen({ data }: { data: FormData }) {
  const labelFor = (screenId: string, ids: string | string[]) => {
    const scr = screens.find((s) => s.id === screenId);
    if (!scr?.options) return typeof ids === "string" ? ids : ids.join(", ");
    if (typeof ids === "string") {
      return scr.options.find((o) => o.id === ids)?.label ?? ids;
    }
    return ids.map((id) => scr.options!.find((o) => o.id === id)?.label ?? id).join(", ");
  };

  /** Append "Other" free-text to a label string if present */
  const withOther = (base: string, other: string) => {
    const trimmed = other?.trim();
    if (!trimmed) return base;
    return base ? `${base}, ${trimmed}` : trimmed;
  };

  const giftLabels = data.uniqueGift
    .map((id) => giftOptions.find((o) => o.id === id)?.label ?? id)
    .join(", ");
  const seekLabels = data.receiveFromCommunity
    .map((id) => seekOptions.find((o) => o.id === id)?.label ?? id)
    .join(", ");

  const rows: { label: string; value: string }[] = [
    { label: "Name", value: data.preferredName || data.fullName },
    { label: "Email", value: data.email },
    { label: "Phone", value: data.phone },
    { label: "Location", value: data.currentLocation + (data.isNomadic ? " (nomadic)" : "") },
    { label: "Roles", value: withOther(labelFor("your-role", data.identityRoles), data.identityRolesOther) },
    { label: "New Earth", value: withOther(labelFor("new-earth", data.newEarthMeaning), data.newEarthMeaningOther) },
    { label: "Intention", value: withOther(labelFor("intention", data.primaryIntention), data.primaryIntentionOther) },
    { label: "You Bring", value: giftLabels },
    { label: "You Seek", value: seekLabels },
    { label: "Found Us", value: labelFor("found-us", data.howFoundUs) },
    { label: "Engage", value: labelFor("engage", data.engagementStyles) },
    { label: "Visibility", value: labelFor("preferences", data.profileVisibility) },
  ];

  return (
    <div className="space-y-2">
      {rows
        .filter((r) => r.value && r.value !== "(nomadic)")
        .map((r) => (
          <div
            key={r.label}
            className="flex gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          >
            <span
              className="w-24 shrink-0 text-xs text-[#FACF39]/80"
              style={{ fontFamily: "Bourton, sans-serif" }}
            >
              {r.label}
            </span>
            <span className="text-sm text-white/80 leading-snug">{r.value}</span>
          </div>
        ))}
    </div>
  );
}
