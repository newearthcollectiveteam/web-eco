/* eslint-disable @typescript-eslint/no-base-to-string */
"use client";

import { useState, Suspense, use } from "react";
import Link from "next/link";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ClipboardList,
  FileSignature,
  UserPlus,
  Trash2,
  Pencil,
  X,
  Mic,
} from "lucide-react";
import { api } from "~/trpc/react";
import { VoiceNoteRecorder } from "~/components/admin/crm/voice-note-recorder";

const STATUS_OPTIONS = ["lead", "qualified", "customer", "inactive"] as const;
const STATUS_LABELS: Record<string, string> = {
  lead: "Lead",
  qualified: "Qualified",
  customer: "Member",
  inactive: "Inactive",
};
const STATUS_COLORS: Record<string, string> = {
  lead: "bg-yellow-900/50 text-yellow-400",
  qualified: "bg-blue-900/50 text-blue-400",
  customer: "bg-green-900/50 text-green-400",
  inactive: "bg-neutral-800 text-neutral-400",
};
const SOURCE_LABELS: Record<string, string> = {
  waitlist: "Waitlist",
  questionnaire: "Questionnaire",
  event_waiver: "Event Waiver",
  manual: "Manual",
  phone_import: "Phone Import",
  other: "Other",
};
const SOURCE_BADGE_COLORS: Record<string, string> = {
  waitlist: "border-amber-500/40 text-amber-400",
  questionnaire: "border-emerald-500/40 text-emerald-400",
  event_waiver: "border-purple-500/40 text-purple-400",
  manual: "border-blue-500/40 text-blue-400",
  phone_import: "border-cyan-500/40 text-cyan-400",
  note_added: "border-gray-500/40 text-gray-400",
  status_changed: "border-cyan-500/40 text-cyan-400",
  contact_created: "border-green-500/40 text-green-400",
  voice_note_added: "border-pink-500/40 text-pink-400",
};

const SOURCE_ICONS: Record<string, typeof ClipboardList> = {
  waitlist: UserPlus,
  questionnaire: ClipboardList,
  event_waiver: FileSignature,
  note_added: MessageSquare,
  voice_note_added: Mic,
};

// ─── Questionnaire Section Viewer ────────────────────────────

interface QuestionnaireViewerProps {
  response: Record<string, unknown>;
}

function QuestionnaireViewer({ response: r }: QuestionnaireViewerProps) {
  const [openSection, setOpenSection] = useState<number | null>(null);

  const sections = [
    {
      title: "The Basics",
      fields: [
        { label: "Name", value: r.name },
        { label: "Preferred Name", value: r.preferredName },
        { label: "Email", value: r.email },
        { label: "Phone", value: r.phone },
        {
          label: "Contact Methods",
          value: Array.isArray(r.preferredContactMethods)
            ? r.preferredContactMethods.join(", ")
            : null,
        },
        { label: "Location", value: r.currentLocation },
        { label: "Nomadic", value: r.isNomadic ? "Yes" : "No" },
        { label: "Nomadic Base", value: r.nomadicBaseLocation },
        { label: "Birth Date", value: r.birthDate },
        { label: "Birth Time", value: r.birthTime },
        { label: "Birth Location", value: r.birthLocation },
      ],
    },
    {
      title: "Gifts & Identity",
      fields: [
        { label: "Primary Role", value: r.primaryRole },
        {
          label: "Identity Roles",
          value: Array.isArray(r.identityRoles)
            ? r.identityRoles.join(", ")
            : null,
        },
        { label: "Other Roles", value: r.identityRolesOther },
        {
          label: "Skills",
          value: Array.isArray(r.skills) ? r.skills.join(", ") : null,
        },
        { label: "Website", value: r.website },
        { label: "Instagram", value: r.instagram },
        { label: "Twitter", value: r.twitter },
        { label: "LinkedIn", value: r.linkedin },
        { label: "TikTok", value: r.tiktok },
        { label: "YouTube", value: r.youtube },
        { label: "Facebook", value: r.facebook },
        { label: "Other Social", value: r.otherSocial },
      ],
    },
    {
      title: "Alignment Check",
      fields: [
        { label: "New Earth Meaning", value: r.newEarthMeaning },
        { label: "Primary Intention", value: r.primaryIntention },
        { label: "Sovereignty Meaning", value: r.sovereigntyMeaning },
      ],
    },
    {
      title: "Give & Receive",
      fields: [
        { label: "Unique Gift", value: r.uniqueGift },
        { label: "Receive from Community", value: r.receiveFromCommunity },
        { label: "Open to Share Resources", value: r.openToShareResources },
        {
          label: "Physical Resources",
          value: Array.isArray(r.physicalResources)
            ? r.physicalResources.join(", ")
            : null,
        },
        { label: "Resource Location", value: r.resourceLocation },
        { label: "Other Resources", value: r.resourceOther },
      ],
    },
    {
      title: "Community & Connection",
      fields: [
        { label: "How Found Us", value: r.howFoundUs },
        { label: "Detail", value: r.howFoundUsDetail },
        { label: "Other", value: r.howFoundUsOther },
        { label: "Existing Connections", value: r.existingConnections },
        { label: "Other Communities", value: r.otherCommunities },
        { label: "Seeking Connections", value: r.seekingConnections },
      ],
    },
    {
      title: "Ecosystem Development",
      fields: [
        {
          label: "Engagement Styles",
          value: Array.isArray(r.engagementStyles)
            ? r.engagementStyles.join(", ")
            : null,
        },
        { label: "Tech/CI Relationship", value: r.techAIRelationship },
        { label: "Improve Social Networks", value: r.improveSocialNetworks },
        {
          label: "Ecosystem Contribution",
          value: r.ecosystemContribution,
        },
        { label: "Dev Skills", value: r.devSkills },
        { label: "Excitement Level", value: r.excitementLevel },
      ],
    },
    {
      title: "Preferences",
      fields: [
        { label: "Profile Visibility", value: r.profileVisibility },
        {
          label: "Communication Prefs",
          value: Array.isArray(r.communicationPrefs)
            ? r.communicationPrefs.join(", ")
            : null,
        },
      ],
    },
  ];

  return (
    <div className="space-y-1">
      {sections.map((section, i) => {
        const isOpen = openSection === i;
        const filledFields = section.fields.filter(
          (f) => f.value !== null && f.value !== undefined && f.value !== ""
        );
        if (filledFields.length === 0) return null;

        return (
          <div key={i} className="rounded-lg border border-white/5">
            <button
              onClick={() => setOpenSection(isOpen ? null : i)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-white/5"
            >
              <span className="font-medium text-gray-300">
                {i + 1}. {section.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {filledFields.length} fields
                </span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </button>
            {isOpen && (
              <div className="space-y-2 border-t border-white/5 px-4 py-3">
                {filledFields.map((f, j) => (
                  <div key={j}>
                    <dt className="text-xs text-gray-500">{f.label}</dt>
                    <dd className="mt-0.5 text-sm text-gray-200 whitespace-pre-wrap">
                      {String(f.value)}
                    </dd>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Contact Detail Content ──────────────────────────────────

function ContactDetailContent({ id }: { id: number }) {
  const [noteText, setNoteText] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);

  const contactQuery = api.crm.getContact.useQuery({ id });
  const utils = api.useUtils();

  const updateMutation = api.crm.updateContact.useMutation({
    onSuccess: () => void utils.crm.getContact.invalidate({ id }),
  });

  const addNoteMutation = api.crm.addNote.useMutation({
    onSuccess: () => {
      setNoteText("");
      void utils.crm.getContact.invalidate({ id });
    },
  });

  const deleteMutation = api.crm.deleteContact.useMutation({
    onSuccess: () => {
      window.location.href = "/admin/crm/contacts";
    },
  });

  if (contactQuery.isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  }

  if (!contactQuery.data) {
    return <div className="py-12 text-center text-gray-500">Contact not found</div>;
  }

  const {
    contact,
    questionnaireResponses,
    waitlistIntakes,
    eventWaivers,
    sources,
    activities,
    voiceNotes,
    addedByProfile,
  } = contactQuery.data;

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatDateTime = (d: Date | string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Build unified timeline
  type TimelineItem = {
    key: string;
    type: string;
    date: Date;
    data: Record<string, unknown>;
  };

  const timeline: TimelineItem[] = [];

  for (const q of questionnaireResponses) {
    timeline.push({
      key: `q-${q.id}`,
      type: "questionnaire",
      date: q.createdAt,
      data: q as unknown as Record<string, unknown>,
    });
  }

  for (const w of waitlistIntakes) {
    timeline.push({
      key: `w-${w.id}`,
      type: "waitlist",
      date: w.createdAt,
      data: w as unknown as Record<string, unknown>,
    });
  }

  for (const ev of eventWaivers) {
    timeline.push({
      key: `ev-${ev.id}`,
      type: "event_waiver",
      date: ev.signedAt,
      data: ev as unknown as Record<string, unknown>,
    });
  }

  for (const a of activities) {
    timeline.push({
      key: `a-${a.id}`,
      type: a.activityType,
      date: a.createdAt,
      data: a as unknown as Record<string, unknown>,
    });
  }

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const contactTags = contact.tags ?? [];

  const startEditTags = () => {
    setEditTags([...contactTags]);
    setTagInput("");
    setEditingTags(true);
  };

  const saveTags = () => {
    updateMutation.mutate({ id: contact.id, tags: editTags });
    setEditingTags(false);
  };

  return (
    <div className="space-y-5">
      {/* ─── Header Card ─── */}
      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-0">
          {/* Top row: back + name + status */}
          <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3 sm:px-5">
            <Link
              href="/admin/crm/contacts"
              className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1
                  className="truncate text-xl font-bold text-white sm:text-2xl"
                  style={{ fontFamily: "Airwaves, sans-serif", letterSpacing: "0.05em" }}
                >
                  {contact.name ?? "Unknown"}
                </h1>
                <span
                  className={`shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[contact.status] ?? ""}`}
                >
                  {STATUS_LABELS[contact.status] ?? contact.status}
                </span>
              </div>
            </div>
            <select
              value={contact.status}
              onChange={(e) =>
                updateMutation.mutate({ id: contact.id, status: e.target.value })
              }
              className="hidden shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white focus:border-[#facf39]/50 focus:outline-none sm:block"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Details row */}
          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
            {/* Contact info */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
              <span className="break-all text-gray-300">{contact.email}</span>
              {contact.phone && (
                <span className="text-gray-400">{contact.phone}</span>
              )}
            </div>

            <div className="hidden h-4 w-px bg-white/10 sm:block" />

            {/* Sources */}
            <div className="flex flex-wrap items-center gap-1.5">
              {sources.map((s) => (
                <Badge
                  key={s.id}
                  variant="outline"
                  className={`text-[10px] ${SOURCE_BADGE_COLORS[s.source] ?? "border-gray-500/40 text-gray-400"}`}
                >
                  {SOURCE_LABELS[s.source] ?? s.source}
                </Badge>
              ))}
            </div>

            {/* Added by */}
            {addedByProfile && (
              <>
                <div className="hidden h-4 w-px bg-white/10 sm:block" />
                <span className="text-xs text-gray-500">
                  Added by {addedByProfile.fullName ?? addedByProfile.email}
                </span>
              </>
            )}
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 border-t border-white/5 px-4 py-2.5 sm:px-5">
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {editingTags ? (
                <>
                  {editTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-[#facf39]/10 px-2.5 py-0.5 text-xs text-[#facf39]"
                    >
                      {tag}
                      <button onClick={() => setEditTags(editTags.filter((t) => t !== tag))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const t = tagInput.trim().toLowerCase();
                        if (t && !editTags.includes(t)) setEditTags([...editTags, t]);
                        setTagInput("");
                      }
                    }}
                    placeholder="Add tag..."
                    autoFocus
                    className="w-20 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
                  />
                  <button
                    onClick={saveTags}
                    className="rounded bg-[#facf39]/20 px-2 py-0.5 text-xs text-[#facf39] hover:bg-[#facf39]/30"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingTags(false)}
                    className="rounded px-2 py-0.5 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {contactTags.length > 0
                    ? contactTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-gray-300"
                        >
                          {tag}
                        </span>
                      ))
                    : <span className="text-xs text-gray-600">No tags</span>}
                  <button
                    onClick={startEditTags}
                    className="ml-1 rounded p-0.5 text-gray-500 hover:text-white"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>

            {/* Date chips */}
            <div className="hidden shrink-0 items-center gap-3 text-[11px] text-gray-500 sm:flex">
              <span>First: {formatDate(contact.firstContactDate)}</span>
              <span>Last: {formatDate(contact.lastContactDate)}</span>
            </div>
          </div>

          {/* Mobile status select */}
          <div className="border-t border-white/5 px-4 py-2.5 sm:hidden">
            <select
              value={contact.status}
              onChange={(e) =>
                updateMutation.mutate({ id: contact.id, status: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#facf39]/50 focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ─── Two Column Layout ─── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* ─── Left: Timeline (2/3) ─── */}
        <div className="space-y-2 lg:col-span-2">
          <h2 className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
            Timeline
          </h2>

          {timeline.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-500">
              No submissions or activities yet
            </p>
          )}

          <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-white/5">
            {timeline.map((item) => {
              const isExpanded = expandedItems.has(item.key);
              const Icon = SOURCE_ICONS[item.type] ?? MessageSquare;
              const badgeColor =
                SOURCE_BADGE_COLORS[item.type] ?? "border-gray-500/40 text-gray-400";
              const label =
                SOURCE_LABELS[item.type] ??
                item.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

              // Inline preview for compact types
              const previewText =
                item.type === "note_added" || item.type === "status_changed" || item.type === "contact_created" || item.type === "voice_note_added"
                  ? String(item.data.description ?? "")
                  : item.type === "event_waiver"
                    ? String(item.data.eventName ?? "")
                    : null;

              return (
                <div key={item.key}>
                  <button
                    onClick={() => toggleExpand(item.key)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-white/[0.03]"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                      <Badge variant="outline" className={`shrink-0 text-[10px] ${badgeColor}`}>
                        {label}
                      </Badge>
                      {previewText && (
                        <span className="min-w-0 truncate text-xs text-gray-500">
                          {previewText}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2 pl-2">
                      <span className="text-[11px] text-gray-600">
                        {formatDateTime(item.date)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/5 bg-white/[0.02] px-4 py-3">
                      {item.type === "questionnaire" && (
                        <QuestionnaireViewer response={item.data} />
                      )}

                      {item.type === "waitlist" && (
                        <div className="space-y-1.5 text-sm">
                          <div>
                            <span className="text-gray-500">Name:</span>{" "}
                            <span className="text-gray-200">{String(item.data.name ?? "")}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Email:</span>{" "}
                            <span className="text-gray-200">{String(item.data.email ?? "")}</span>
                          </div>
                          {typeof item.data.phone === "string" && item.data.phone && (
                            <div>
                              <span className="text-gray-500">Phone:</span>{" "}
                              <span className="text-gray-200">{String(item.data.phone)}</span>
                            </div>
                          )}
                          {typeof item.data.message === "string" && item.data.message && (
                            <div>
                              <span className="text-gray-500">Message:</span>
                              <p className="mt-1 text-gray-200 whitespace-pre-wrap">{String(item.data.message)}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Willing to fill questionnaire:</span>{" "}
                            <span className="text-gray-200">
                              {item.data.willingToFillQuestionnaire ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      )}

                      {item.type === "event_waiver" && (
                        <div className="space-y-2 text-sm">
                          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            <div><span className="text-gray-500">Event:</span> <span className="text-gray-200">{String(item.data.eventName ?? "")}</span></div>
                            <div><span className="text-gray-500">Date:</span> <span className="text-gray-200">{String(item.data.eventDate ?? "")}</span></div>
                            <div><span className="text-gray-500">Location:</span> <span className="text-gray-200">{String(item.data.eventLocation ?? "")}</span></div>
                            <div><span className="text-gray-500">Signer:</span> <span className="text-gray-200">{String(item.data.signerName ?? "")}</span></div>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span className="text-gray-500">
                              Terms: <span className={item.data.agreedToTerms ? "text-green-400" : "text-red-400"}>
                                {item.data.agreedToTerms ? "Agreed" : "Not Agreed"}
                              </span>
                            </span>
                            <span className="text-gray-500">
                              Photo/Video: <span className={item.data.agreedToPhotoVideo ? "text-green-400" : "text-red-400"}>
                                {item.data.agreedToPhotoVideo ? "Agreed" : "Not Agreed"}
                              </span>
                            </span>
                          </div>
                          {typeof item.data.signatureData === "string" && item.data.signatureData && (
                            <div>
                              <span className="text-gray-500">Signature:</span>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={String(item.data.signatureData)} alt="Signature" className="mt-1 h-14 rounded border border-white/10 bg-white/5" />
                            </div>
                          )}
                        </div>
                      )}

                      {(item.type === "note_added" || item.type === "status_changed" || item.type === "contact_created" || item.type === "voice_note_added") && (
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {String(item.data.description ?? "")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Right: Actions Sidebar (1/3) ─── */}
        <div className="space-y-4">
          {/* Voice Notes */}
          <Card className="border-white/10 bg-white/5">
            <CardContent className="p-4">
              <VoiceNoteRecorder
                contactId={contact.id}
                notes={voiceNotes}
                onUpdate={() => void utils.crm.getContact.invalidate({ id })}
              />
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card className="border-white/10 bg-white/5">
            <CardContent className="p-4">
              <h3 className="mb-2 text-xs font-medium text-gray-500 uppercase">
                Add Note
              </h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                placeholder="Add a note..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#facf39]/50 focus:outline-none"
              />
              <button
                onClick={() => {
                  if (noteText.trim()) {
                    addNoteMutation.mutate({
                      contactId: contact.id,
                      note: noteText.trim(),
                    });
                  }
                }}
                disabled={!noteText.trim() || addNoteMutation.isPending}
                className="mt-2 w-full rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/20 disabled:opacity-30"
              >
                {addNoteMutation.isPending ? "Saving..." : "Save Note"}
              </button>

              {contact.notes && (
                <div className="mt-3 border-t border-white/5 pt-2">
                  <span className="text-[10px] text-gray-500 uppercase">Pinned notes</span>
                  <p className="mt-1 text-xs text-gray-400 whitespace-pre-wrap">
                    {contact.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <div className="pt-2">
            {showDeleteConfirm ? (
              <div className="space-y-2 rounded-xl border border-red-900/50 bg-red-900/10 p-3">
                <p className="text-xs text-red-400">
                  Delete contact and all data? Cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteMutation.mutate({ id: contact.id })}
                    disabled={deleteMutation.isPending}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-900/30 px-3 py-2 text-xs text-red-400/70 transition-colors hover:border-red-900/50 hover:bg-red-900/10 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Contact
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────

export default function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contactId = parseInt(id, 10);

  if (isNaN(contactId)) {
    return <div className="py-12 text-center text-gray-500">Invalid contact ID</div>;
  }

  return (
    <Suspense fallback={null}>
      <ContactDetailContent id={contactId} />
    </Suspense>
  );
}
